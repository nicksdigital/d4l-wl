// Test script for PostgreSQL database connection
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

// Log the connection parameters (without password)
console.log('Testing database connection with:');
console.log(`  Host: ${process.env.DB_HOST}`);
console.log(`  Port: ${process.env.DB_PORT}`);
console.log(`  User: ${process.env.DB_USER}`);
console.log(`  Database: ${process.env.DB_NAME}`);
console.log(`  SSL Mode: ${process.env.POSTGRES_SSL_MODE}`);

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  ssl: process.env.POSTGRES_SSL_MODE === 'no-verify' ? { rejectUnauthorized: false } :
       process.env.POSTGRES_SSL_MODE === 'disable' ? false :
       process.env.POSTGRES_SSL_MODE === 'require' ? { rejectUnauthorized: true } : false,
});

// Test the connection
async function testConnection() {
  try {
    console.log('Attempting to connect to the database...');
    const client = await pool.connect();
    console.log('Connection successful!');

    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`Current database time: ${result.rows[0].current_time}`);

    // Release the client
    client.release();

    // Close the pool
    await pool.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

// Run the test
testConnection();
