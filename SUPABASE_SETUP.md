# Supabase Setup Guide

This document outlines the database schema and setup required for the Gym Partner Portal.

## Required Tables

### 1. `profiles` Table
Stores user profile information.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('gym_owner', 'member', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 2. `gyms` Table
Stores gym information.

```sql
CREATE TABLE gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  brand_name TEXT,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  facilities TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard', 'premium')),
  supports_bundles BOOLEAN DEFAULT false,
  opening_hours JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;

-- Policy: Gym owners can view their own gym
CREATE POLICY "Gym owners can view own gym" ON gyms
  FOR SELECT USING (auth.uid() = owner_id);

-- Policy: Gym owners can update their own gym
CREATE POLICY "Gym owners can update own gym" ON gyms
  FOR UPDATE USING (auth.uid() = owner_id);

-- Policy: Gym owners can insert their own gym
CREATE POLICY "Gym owners can insert own gym" ON gyms
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
```

### 3. `bookings` Table
Stores member bookings and check-ins.

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  class_id UUID REFERENCES classes(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT DEFAULT 'booked' CHECK (status IN ('booked', 'checked_in', 'completed', 'no_show')),
  check_in_code TEXT,
  source TEXT DEFAULT 'marketplace' CHECK (source IN ('bundle', 'marketplace')),
  pass_id UUID REFERENCES passes(id),
  bundle_id UUID,
  bundle_sessions_used INTEGER,
  pass_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Gym owners can view bookings for their gym
CREATE POLICY "Gym owners can view own gym bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = bookings.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );

-- Policy: Gym owners can update bookings for their gym
CREATE POLICY "Gym owners can update own gym bookings" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = bookings.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );
```

### 4. `classes` Table
Stores class schedule information.

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id),
  name TEXT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  capacity INTEGER NOT NULL DEFAULT 20,
  instructor_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Policy: Gym owners can manage classes for their gym
CREATE POLICY "Gym owners can view own gym classes" ON classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = classes.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Gym owners can insert own gym classes" ON classes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = classes.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Gym owners can update own gym classes" ON classes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = classes.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Gym owners can delete own gym classes" ON classes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = classes.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );
```

### 5. `passes` Table
Stores marketplace pass products.

```sql
CREATE TABLE passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single_visit', 'multi_visit', 'monthly')),
  visits_included INTEGER,
  validity_days INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  description TEXT,
  sold_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;

-- Policy: Gym owners can manage passes for their gym
CREATE POLICY "Gym owners can manage own gym passes" ON passes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = passes.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );
```

### 6. `payouts` Table
Stores financial payout information.

```sql
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id),
  period_label TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  revenue_bundles DECIMAL(10, 2) DEFAULT 0,
  revenue_marketplace DECIMAL(10, 2) DEFAULT 0,
  fees DECIMAL(10, 2) DEFAULT 0,
  net_payout DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Policy: Gym owners can view payouts for their gym
CREATE POLICY "Gym owners can view own gym payouts" ON payouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = payouts.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );
```

### 7. `bundle_visits` Table (Optional - if using bundles)
Stores bundle visit tracking.

```sql
CREATE TABLE bundle_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  bundle_name TEXT NOT NULL,
  date DATE NOT NULL,
  visit_type TEXT NOT NULL CHECK (visit_type IN ('standard', 'premium')),
  sessions_used INTEGER DEFAULT 1,
  estimated_earnings DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bundle_visits ENABLE ROW LEVEL SECURITY;

-- Policy: Gym owners can view bundle visits for their gym
CREATE POLICY "Gym owners can view own gym bundle visits" ON bundle_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = bundle_visits.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );
```

### 8. `staff` Table (Optional)
Stores staff account information.

```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'front_desk', 'trainer')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login_at TIMESTAMP WITH TIME ZONE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Policy: Gym owners can manage staff for their gym
CREATE POLICY "Gym owners can manage own gym staff" ON staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = staff.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );
```

## Indexes

Create indexes for better query performance:

```sql
-- Gyms
CREATE INDEX idx_gyms_owner_id ON gyms(owner_id);

-- Bookings
CREATE INDEX idx_bookings_gym_id ON bookings(gym_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);

-- Classes
CREATE INDEX idx_classes_gym_id ON classes(gym_id);
CREATE INDEX idx_classes_date_time ON classes(date_time);

-- Passes
CREATE INDEX idx_passes_gym_id ON passes(gym_id);

-- Payouts
CREATE INDEX idx_payouts_gym_id ON payouts(gym_id);
CREATE INDEX idx_payouts_start_date ON payouts(start_date);
```

## Storage Bucket Setup

Create a storage bucket for gym avatars and assets:

1. Go to Storage in your Supabase dashboard
2. Click "New bucket"
3. Name: `gym-assets`
4. Make it **Public** (so images can be accessed via URL)
5. Click "Create bucket"

### Storage Policies

After creating the bucket, set up RLS policies:

```sql
-- Policy: Gym owners can upload their own gym avatars
CREATE POLICY "Gym owners can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gym-assets' AND
    (storage.foldername(name))[1] = 'gym-avatars' AND
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.owner_id = auth.uid()
      AND (storage.foldername(name))[2] LIKE gyms.owner_id || '-%'
    )
  );

-- Policy: Public read access for gym avatars
CREATE POLICY "Public read access for gym avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'gym-assets');
```

## Setup Steps

1. Create a new Supabase project at https://supabase.com
2. Run the SQL scripts above in the Supabase SQL Editor
3. Create the storage bucket as described above
4. Copy your project URL and anon key from Supabase Settings > API
5. Create a `.env` file in the project root with:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
6. Restart your development server

## Security Notes

- All tables use Row Level Security (RLS) to ensure gym owners can only access their own data
- The `owner_id` field in the `gyms` table is the primary security mechanism
- All queries filter by `gym_id` which is linked to the logged-in user's `owner_id`
