-- Orbit Database Initialization Script
-- PostgreSQL Schema for Three-Tier Architecture

-- Platform types
CREATE TYPE platform_type AS ENUM ('whatsapp', 'instagram', 'telegram');

-- Upload status
CREATE TYPE upload_status AS ENUM ('pending', 'parsing', 'ready', 'analyzing', 'complete', 'error');

-- Uploads Table
CREATE TABLE IF NOT EXISTS uploads (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    platform platform_type NOT NULL,
    status upload_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY,
    upload_id INTEGER NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
    sender VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    week_id VARCHAR(10)
);

-- Index for fast message queries
CREATE INDEX IF NOT EXISTS idx_messages_upload_id ON messages(upload_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender);

-- Reports Table (Cached analysis results)
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    upload_id INTEGER UNIQUE NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
    stats JSONB,
    roast TEXT,
    psych_analysis JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for uploads table
CREATE TRIGGER update_uploads_updated_at
    BEFORE UPDATE ON uploads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
