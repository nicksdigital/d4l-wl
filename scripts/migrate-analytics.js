#!/usr/bin/env node

/**
 * Script to run analytics database migration
 */
require('dotenv').config();
require('../dist/analytics/utils/migrate').default();
