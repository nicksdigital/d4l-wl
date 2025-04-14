-- Analytics database schema

-- Events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  timestamp BIGINT NOT NULL,
  session_id UUID,
  user_id UUID,
  wallet_address VARCHAR(42),
  chain_id INTEGER,
  contract_address VARCHAR(42),
  event_name VARCHAR(100),
  transaction_hash VARCHAR(66),
  block_number BIGINT,
  log_index INTEGER,
  return_values JSONB,
  gas_used NUMERIC(78),
  gas_price NUMERIC(78),
  url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address VARCHAR(45),
  element VARCHAR(100),
  action VARCHAR(100),
  value TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for events table
CREATE INDEX IF NOT EXISTS idx_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_wallet_address ON analytics_events(wallet_address);
CREATE INDEX IF NOT EXISTS idx_events_contract_address ON analytics_events(contract_address);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_transaction_hash ON analytics_events(transaction_hash);

-- Sessions table
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY,
  user_id UUID,
  wallet_address VARCHAR(42),
  start_time BIGINT NOT NULL,
  end_time BIGINT,
  duration BIGINT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  user_agent TEXT,
  ip_address VARCHAR(45),
  referrer TEXT,
  entry_page TEXT,
  exit_page TEXT,
  page_views INTEGER DEFAULT 0,
  interactions INTEGER DEFAULT 0,
  chain_id INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_wallet_address ON analytics_sessions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON analytics_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON analytics_sessions(is_active);

-- Users table
CREATE TABLE IF NOT EXISTS analytics_users (
  id UUID PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  first_seen BIGINT NOT NULL,
  last_seen BIGINT NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  total_gas_spent NUMERIC(78) DEFAULT 0,
  assets_linked INTEGER DEFAULT 0,
  tokens_held JSONB DEFAULT '{}',
  tags JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON analytics_users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON analytics_users(last_seen);
CREATE INDEX IF NOT EXISTS idx_users_first_seen ON analytics_users(first_seen);

-- Contracts table
CREATE TABLE IF NOT EXISTS analytics_contracts (
  address VARCHAR(42) PRIMARY KEY,
  name VARCHAR(100),
  type VARCHAR(50),
  deployed_at BIGINT,
  deployer_address VARCHAR(42),
  total_interactions INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  last_interaction BIGINT NOT NULL,
  gas_used NUMERIC(78) DEFAULT 0,
  events JSONB DEFAULT '{}',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for contracts table
CREATE INDEX IF NOT EXISTS idx_contracts_total_interactions ON analytics_contracts(total_interactions);
CREATE INDEX IF NOT EXISTS idx_contracts_last_interaction ON analytics_contracts(last_interaction);

-- Daily snapshots table
CREATE TABLE IF NOT EXISTS analytics_daily_snapshots (
  date DATE PRIMARY KEY,
  new_users INTEGER NOT NULL,
  active_users INTEGER NOT NULL,
  total_sessions INTEGER NOT NULL,
  average_session_duration FLOAT NOT NULL,
  total_transactions INTEGER NOT NULL,
  total_gas_used NUMERIC(78) NOT NULL,
  top_contracts JSONB NOT NULL,
  top_events JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for daily snapshots table
CREATE INDEX IF NOT EXISTS idx_daily_snapshots_date ON analytics_daily_snapshots(date);
