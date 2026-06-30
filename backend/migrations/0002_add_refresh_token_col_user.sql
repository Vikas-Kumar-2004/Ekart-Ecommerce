-- Add RefreshToken column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS refresh_token TEXT;