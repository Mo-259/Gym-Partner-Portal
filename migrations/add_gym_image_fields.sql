-- Migration: Add image_url, rating, and reviews columns to gyms table
-- This aligns the database schema with the Gym model used in the Flutter app

-- Add image_url column to store gym logo/image URL
ALTER TABLE public.gyms
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add rating column (numeric for decimal values like 4.5)
ALTER TABLE public.gyms
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5);

-- Add reviews column (integer count of reviews)
ALTER TABLE public.gyms
ADD COLUMN IF NOT EXISTS reviews INTEGER DEFAULT 0 CHECK (reviews >= 0);

-- Add comment for documentation
COMMENT ON COLUMN public.gyms.image_url IS 'URL of the gym logo/image stored in Supabase Storage gym-logos bucket';
COMMENT ON COLUMN public.gyms.rating IS 'Gym rating from 0.0 to 5.0';
COMMENT ON COLUMN public.gyms.reviews IS 'Total number of reviews';
