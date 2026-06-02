-- Rename trip_type 'IBT' → 'OTO' for all existing rows
-- Run in Supabase: SQL Editor → paste → Run
UPDATE trips SET trip_type = 'OTO' WHERE trip_type = 'IBT';
