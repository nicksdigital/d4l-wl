/**
 * Database utilities for analytics
 */
import fs from 'fs';
import path from 'path';
import { pool } from '../services/db';

/**
 * Initialize the database schema
 */
export async function initializeSchema(): Promise<boolean> {
  try {
    console.log('Initializing analytics database schema...');
    
    // Read the schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema SQL
    await pool.query(schemaSql);
    
    console.log('Analytics database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing analytics database schema:', error);
    return false;
  }
}

/**
 * Check if the database is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await pool.query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Analytics database health check failed:', error);
    return false;
  }
}

/**
 * Close the database connection
 */
export async function closeConnection(): Promise<void> {
  try {
    await pool.end();
    console.log('Analytics database connection closed');
  } catch (error) {
    console.error('Error closing analytics database connection:', error);
  }
}
