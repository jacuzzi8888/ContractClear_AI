-- Migration: Migrate owner_id from Auth0 IDs to User UUIDs
-- Run this in Supabase SQL Editor after creating the users table

-- Step 1: Ensure all Auth0 users have records in the users table
-- (This handles any existing documents that might not have corresponding user records)
INSERT INTO users (auth0_id, email, full_name)
SELECT DISTINCT 
  d.owner_id,
  NULL,
  NULL
FROM documents d
WHERE d.owner_id LIKE '%|%'  -- Auth0 IDs contain |
AND NOT EXISTS (
  SELECT 1 FROM users u WHERE u.auth0_id = d.owner_id
)
ON CONFLICT (auth0_id) DO NOTHING;

-- Step 2: Update documents.owner_id from Auth0 IDs to user UUIDs
UPDATE documents d
SET owner_id = u.id
FROM users u
WHERE u.auth0_id = d.owner_id
AND d.owner_id LIKE '%|%';

-- Step 3: Verify the migration
SELECT 
  'documents' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN owner_id LIKE '%|%' THEN 1 END) as auth0_id_rows,
  COUNT(CASE WHEN owner_id NOT LIKE '%|%' THEN 1 END) as uuid_rows
FROM documents;
