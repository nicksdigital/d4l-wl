#!/usr/bin/env node

/**
 * D4L Batch Synchronization Script
 * This script handles scheduled synchronization tasks between the D4L platform and blockchain
 * It processes pending airdrop claims and syncs user profiles to the blockchain
 */

const axios = require('axios');
const { ethers } = require('ethers');
require('dotenv').config();
const { connectToRedis, getCacheStats, disconnectFromRedis } = require('./redis-client');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.ADMIN_API_KEY;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '10', 10);

// Log setup
const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

// Error handling
const handleError = (error, context) => {
  log(`ERROR in ${context}: ${error.message}`);
  if (error.response) {
    log(`Response data: ${JSON.stringify(error.response.data)}`);
    log(`Response status: ${error.response.status}`);
  }
};

/**
 * Process pending airdrop claims on the blockchain
 */
async function processPendingClaims() {
  try {
    log('Starting to process pending airdrop claims...');
    
    const response = await axios.post(
      `${BASE_URL}/api/admin/batch-sync`,
      {
        action: 'process-claims',
        batchSize: BATCH_SIZE
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const { data } = response;
    
    if (data.success) {
      log(`Successfully processed ${data.processed} pending claims`);
      
      // Log details for each processed claim
      if (data.results && data.results.length > 0) {
        data.results.forEach(result => {
          if (result.status === 'confirmed') {
            log(`✅ Claim for ${result.address} confirmed with tx: ${result.txHash}`);
          } else {
            log(`❌ Claim for ${result.address} failed: ${result.error || 'Unknown error'}`);
          }
        });
      }
    } else {
      log(`Failed to process claims: ${data.message}`);
    }
  } catch (error) {
    handleError(error, 'processPendingClaims');
  }
}

/**
 * Sync profiles to the blockchain
 */
async function syncProfiles() {
  try {
    log('Starting to sync profiles to blockchain...');
    
    const response = await axios.post(
      `${BASE_URL}/api/admin/batch-sync`,
      {
        action: 'sync-profiles',
        batchSize: BATCH_SIZE
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const { data } = response;
    
    if (data.success) {
      log(`Successfully synced ${data.synced} profiles to blockchain`);
      
      // Log details for each synced profile
      if (data.results && data.results.length > 0) {
        data.results.forEach(result => {
          if (result.status === 'synced') {
            log(`✅ Profile for ${result.address} synced with token ID: ${result.tokenId}`);
          } else {
            log(`❌ Profile sync for ${result.address} failed: ${result.error || 'Unknown error'}`);
          }
        });
      }
    } else {
      log(`Failed to sync profiles: ${data.message}`);
    }
  } catch (error) {
    handleError(error, 'syncProfiles');
  }
}

/**
 * Main execution function
 */
async function main() {
  log('D4L Batch Sync Script Started');
  
  try {
    // Process airdrop claims first
    await processPendingClaims();
    
    // Then sync profiles
    await syncProfiles();
    
    log('Batch processing completed successfully');
  } catch (error) {
    log(`Critical error in batch process: ${error.message}`);
    process.exit(1);
  }
}

// Execute main function
main().catch(error => {
  console.error('Unhandled error in batch sync script:', error);
  process.exit(1);
});
