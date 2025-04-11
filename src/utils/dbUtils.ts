/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Import required modules conditionally to avoid build errors when not using PostgreSQL
let Pool: any;
let pool: any;
let fs: any;
let path: any;

// In-memory storage for development fallback
const inMemoryStorage: {
  airdropClaims: Record<string, AirdropClaim>;
  profiles: Record<string, ProfileData>;
} = {
  airdropClaims: {},
  profiles: {}
};

// Helper function to configure SSL for PostgreSQL
const configureSsl = () => {
  try {
    // Only import fs and path if we need to read the CA cert
    if (!fs) fs = require('fs');
    if (!path) path = require('path');
    
    // Check if POSTGRES_SSL_MODE is set to 'disable'
    if (process.env.POSTGRES_SSL_MODE === 'disable') {
      console.log('SSL mode set to disable, not using SSL for Postgres');
      return false; // Return false to disable SSL
    }
    
    // Check if POSTGRES_SSL_MODE is set to 'no-verify'
    if (process.env.POSTGRES_SSL_MODE === 'no-verify') {
      console.log('SSL mode set to no-verify, disabling certificate verification');
      return { rejectUnauthorized: false };
    }
    
    // Determine the base directory for the CA certificate
    const baseDir = process.env.NODE_ENV === 'production' ? '/data/d4l/frontend' : process.cwd();
    const certPath = path.join(baseDir, 'certs', 'ca.crt');
    
    // Check if CA certificate exists
    if (fs.existsSync(certPath)) {
      console.log(`Using CA certificate from ${certPath}`);
      const ca = fs.readFileSync(certPath).toString();
      return { ca, rejectUnauthorized: true };
    } else {
      // Check for CA cert in environment variable
      if (process.env.POSTGRES_CA_CERT) {
        console.log('Using CA certificate from environment variable');
        return { 
          ca: process.env.POSTGRES_CA_CERT,
          rejectUnauthorized: true 
        };
      }
      
      console.log('CA certificate not found, disabling certificate verification');
      return { rejectUnauthorized: false };
    }
  } catch (error) {
    console.warn('Error configuring SSL:', error);
    return { rejectUnauthorized: false };
  }
};

// Flag to track database connection status
let dbConnectionFailed = false;

// Import pg if database parameters are set
if (process.env.DB_HOST || process.env.DATABASE_URL) {
  try {
    const pg = require('pg');
    Pool = pg.Pool;
    
    // Configure SSL options
    const sslConfig = configureSsl();
    
    // Initialize PostgreSQL connection pool
    if (process.env.DATABASE_URL) {
      // Use connection string if available
      const poolConfig: any = {
        connectionString: process.env.DATABASE_URL,
      };
      
      // Add SSL config if not disabled
      if (sslConfig !== false) {
        poolConfig.ssl = sslConfig;
      }
      
      pool = new Pool(poolConfig);
    } else {
      // Use individual connection parameters
      const poolConfig: any = {
        user: process.env.DB_USER || 'doadmin',
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'defaultdb',
      };
      
      // Add SSL config if not disabled
      if (sslConfig !== false) {
        poolConfig.ssl = sslConfig;
      }
      
      pool = new Pool(poolConfig);
    }
    
    console.log('PostgreSQL pool created with SSL:', sslConfig ? 'enabled' : 'disabled');
    
    // Test the connection
    pool.query('SELECT NOW()', (err: any, res: any) => {
      if (err) {
        console.error('Database connection test failed:', err.message);
        dbConnectionFailed = true;
      } else {
        console.log('PostgreSQL connection successful, server time:', res.rows[0].now);
      }
    });
    
    console.log('PostgreSQL connection initialized');
  } catch (error) {
    console.warn('Failed to initialize PostgreSQL connection:', error);
    console.log('Using in-memory storage fallback');
    dbConnectionFailed = true;
  }
} else {
  console.log('Database parameters not set, using in-memory storage fallback');
  dbConnectionFailed = true;
}

// Interface for airdrop claims
export interface AirdropClaim {
  address: string;
  amount: string;
  timestamp: number;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  merkleProof: string[];
  merkleRoot: string;
}

// Interface for profile data
export interface ProfileData {
  address: string;
  tokenId?: number;
  baseAmount?: number;
  bonusAmount?: number;
  claimed: boolean;
  claimTimestamp?: number;
  metadata?: Record<string, any>;
}

// Helper to determine if we're using PostgreSQL or in-memory storage
const usePostgres = () => !!pool;

// Flag to track if we've already shown the database fallback warning
let dbFallbackWarningShown = false;

// Wrapper for database operations with fallback
const withFallback = async <T>(operation: () => Promise<T>, fallback: () => T): Promise<T> => {
  if (!usePostgres()) {
    if (!dbFallbackWarningShown) {
      console.log('Using in-memory storage fallback for database operations');
      dbFallbackWarningShown = true;
    }
    return fallback();
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error('Database operation failed, using fallback:', error);
    return fallback();
  }
};

// Database operations
export const db = {
  /**
   * Store an airdrop claim in the database
   */
  storeAirdropClaim: async (claim: AirdropClaim): Promise<void> => {
    if (usePostgres()) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const query = `
          INSERT INTO airdrop_claims (
            address, amount, timestamp, tx_hash, status, merkle_proof, merkle_root
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (address) 
          DO UPDATE SET
            amount = $2,
            timestamp = $3,
            tx_hash = $4,
            status = $5,
            merkle_proof = $6,
            merkle_root = $7
        `;
      
        await client.query(query, [
          claim.address.toLowerCase(),
          claim.amount,
          claim.timestamp,
          claim.txHash || null,
          claim.status,
          JSON.stringify(claim.merkleProof),
          claim.merkleRoot
        ]);
        
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error storing airdrop claim:', error);
        throw error;
      } finally {
        client.release();
      }
    } else {
      // In-memory fallback
      inMemoryStorage.airdropClaims[claim.address.toLowerCase()] = {
        ...claim,
        address: claim.address.toLowerCase()
      };
    }
  },
  
  /**
   * Get an airdrop claim from the database
   */
  getAirdropClaim: async (address: string): Promise<AirdropClaim | null> => {
    return withFallback(
      async () => {
        const query = `
          SELECT * FROM airdrop_claims
          WHERE address = $1
        `;
        
        const result = await pool.query(query, [address.toLowerCase()]);
        
        if (result.rows.length === 0) {
          return null;
        }
        
        const row = result.rows[0];
        return {
          address: row.address,
          amount: row.amount,
          timestamp: row.timestamp,
          txHash: row.tx_hash,
          status: row.status,
          merkleProof: JSON.parse(row.merkle_proof),
          merkleRoot: row.merkle_root
        };
      },
      // Use type assertion to match the expected return type
      () => {
        // In-memory fallback
        const claim = inMemoryStorage.airdropClaims[address.toLowerCase()];
        if (!claim) return null;
        
        // Ensure txHash is defined (convert optional to required)
        return {
          address: claim.address,
          amount: claim.amount,
          timestamp: claim.timestamp,
          txHash: claim.txHash || null, // Ensure txHash is never undefined
          status: claim.status,
          merkleProof: claim.merkleProof,
          merkleRoot: claim.merkleRoot
        } as any;
      }
    );
  },
  
  /**
   * Get all pending airdrop claims
   */
  getPendingAirdropClaims: async (): Promise<AirdropClaim[]> => {
    return withFallback(
      async () => {
        const query = `
          SELECT * FROM airdrop_claims
          WHERE status = 'pending'
          ORDER BY timestamp ASC
        `;
        
        const result = await pool.query(query);
        
        return result.rows.map((row: Record<string, any>) => ({
          address: row.address,
          amount: row.amount,
          timestamp: row.timestamp,
          txHash: row.tx_hash,
          status: row.status,
          merkleProof: JSON.parse(row.merkle_proof),
          merkleRoot: row.merkle_root
        }));
      },
      () => {
        // In-memory fallback
        return Object.values(inMemoryStorage.airdropClaims)
          .filter(claim => claim.status === 'pending');
      }
    );
  },
  
  /**
   * Update airdrop claim status
   */
  updateAirdropClaimStatus: async (address: string, status: 'pending' | 'confirmed' | 'failed', txHash?: string): Promise<void> => {
    if (usePostgres()) {
      const query = `
        UPDATE airdrop_claims
        SET status = $2, tx_hash = $3
        WHERE address = $1
      `;
      
      await pool.query(query, [address.toLowerCase(), status, txHash || null]);
    } else {
      // In-memory fallback
      const normalizedAddress = address.toLowerCase();
      if (inMemoryStorage.airdropClaims[normalizedAddress]) {
        inMemoryStorage.airdropClaims[normalizedAddress].status = status;
        if (txHash) {
          inMemoryStorage.airdropClaims[normalizedAddress].txHash = txHash;
        }
      }
    }
  },
  
  /**
   * Store profile data in the database
   */
  storeProfileData: async (profile: ProfileData): Promise<void> => {
    if (usePostgres()) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const query = `
          INSERT INTO profiles (
            address, token_id, base_amount, bonus_amount, claimed, claim_timestamp, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (address) 
          DO UPDATE SET
            token_id = $2,
            base_amount = $3,
            bonus_amount = $4,
            claimed = $5,
            claim_timestamp = $6,
            metadata = $7
        `;
        
        await client.query(query, [
          profile.address.toLowerCase(),
          profile.tokenId || null,
          profile.baseAmount || null,
          profile.bonusAmount || null,
          profile.claimed,
          profile.claimTimestamp || null,
          profile.metadata ? JSON.stringify(profile.metadata) : null
        ]);
        
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error storing profile data:', error);
        throw error;
      } finally {
        client.release();
      }
    } else {
      // In-memory fallback
      inMemoryStorage.profiles[profile.address.toLowerCase()] = profile;
    }
  },
  
  /**
   * Get profile data from the database
   */
  getProfileData: async (address: string): Promise<ProfileData | null> => {
    if (usePostgres()) {
      const query = `
        SELECT * FROM profiles
        WHERE address = $1
      `;
      
      const result = await pool.query(query, [address.toLowerCase()]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        address: row.address,
        tokenId: row.token_id,
        baseAmount: row.base_amount,
        bonusAmount: row.bonus_amount,
        claimed: row.claimed,
        claimTimestamp: row.claim_timestamp,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined
      };
    } else {
      // In-memory fallback
      return inMemoryStorage.profiles[address.toLowerCase()] || null;
    }
  },
  

  
  /**
   * Health check for the database connection
   */
  healthCheck: async (): Promise<boolean> => {
    if (usePostgres()) {
      try {
        await pool.query('SELECT NOW()');
        return true;
      } catch (error) {
        console.error('Database health check failed:', error);
        return false;
      }
    } else {
      // In-memory fallback is always healthy
      return true;
    }
  }
};

// SQL for creating the necessary tables
export const initializeDatabase = async (): Promise<void> => {
  if (!usePostgres()) {
    console.log('Using in-memory storage, no database initialization needed');
    return;
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create airdrop_claims table
    await client.query(`
      CREATE TABLE IF NOT EXISTS airdrop_claims (
        address TEXT PRIMARY KEY,
        amount TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        tx_hash TEXT,
        status TEXT NOT NULL,
        merkle_proof JSONB NOT NULL,
        merkle_root TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        address TEXT PRIMARY KEY,
        token_id INTEGER,
        base_amount NUMERIC,
        bonus_amount NUMERIC,
        claimed BOOLEAN NOT NULL DEFAULT FALSE,
        claim_timestamp BIGINT,
        metadata JSONB,
        synced BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create updated_at trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    
    // Create triggers for updated_at
    await client.query(`
      DROP TRIGGER IF EXISTS update_airdrop_claims_updated_at ON airdrop_claims;
      CREATE TRIGGER update_airdrop_claims_updated_at
      BEFORE UPDATE ON airdrop_claims
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
      CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);
    
    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};
