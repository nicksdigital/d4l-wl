/**
 * Database migration script for analytics
 */
import { initializeSchema, healthCheck, closeConnection } from './db';

async function migrate() {
  try {
    console.log('Starting analytics database migration...');
    
    // Check database health
    const isHealthy = await healthCheck();
    if (!isHealthy) {
      console.error('Database is not healthy. Please check your database connection.');
      process.exit(1);
    }
    
    // Initialize schema
    const success = await initializeSchema();
    if (!success) {
      console.error('Failed to initialize schema.');
      process.exit(1);
    }
    
    console.log('Analytics database migration completed successfully.');
    
    // Close connection
    await closeConnection();
    
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrate();
}

export default migrate;
