-- SQL script to manually add verification token columns to AspNetUsers table
-- Run this if the migration hasn't been applied automatically

-- Add VerificationTokenHash column (if it doesn't exist)
ALTER TABLE AspNetUsers ADD COLUMN VerificationTokenHash TEXT;

-- Add VerificationTokenExpiresAt column (if it doesn't exist)
ALTER TABLE AspNetUsers ADD COLUMN VerificationTokenExpiresAt TEXT;

-- Add EmailVerifiedAt column (if it doesn't exist)
ALTER TABLE AspNetUsers ADD COLUMN EmailVerifiedAt TEXT;

-- Add LastVerificationEmailSentAt column (if it doesn't exist)
ALTER TABLE AspNetUsers ADD COLUMN LastVerificationEmailSentAt TEXT;

