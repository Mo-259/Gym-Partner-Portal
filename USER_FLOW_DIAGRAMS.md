# Gym Owner Registration Flow & User Journey

## 1. Registration Flow Diagram

```
┌─────────────────┐
│   Landing Page  │
│  (Not Logged In)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Sign Up Page  │
│  - Full Name    │
│  - Email        │
│  - Password     │
│  - Confirm Pwd  │
└────────┬────────┘
         │
         │ [Submit]
         ▼
┌─────────────────┐
│  Create Account │
│  (Supabase Auth)│
│  + Profile with │
│    role: owner  │
└────────┬────────┘
         │
         │ [Success]
         ▼
┌─────────────────┐
│  Gym Details    │
│  Form Page      │
│  - Gym Name     │
│  - City         │
│  - Address      │
│  - Contact Info │
│  - Facilities   │
└────────┬────────┘
         │
         │ [Submit]
         ▼
┌─────────────────┐
│  Create Gym     │
│  (Link to user) │
│  owner_id =     │
│  current_user.id│
└────────┬────────┘
         │
         │ [Success]
         ▼
┌─────────────────┐
│   Dashboard     │
│  (Overview Page)│
└─────────────────┘
```

## 2. Sign-In Flow

```
┌─────────────────┐
│   Sign In Page   │
│  - Email         │
│  - Password      │
└────────┬────────┘
         │
         │ [Submit]
         ▼
┌─────────────────┐
│  Authenticate    │
│  (Supabase Auth) │
└────────┬────────┘
         │
         ├─ [Success] ──┐
         │              │
         │              ▼
         │      ┌──────────────┐
         │      │ Check Role   │
         │      │ (gym_owner?) │
         │      └──────┬───────┘
         │             │
         │      ┌──────┴───────┐
         │      │             │
         │      ▼             ▼
         │  ┌────────┐   ┌──────────────┐
         │  │  Yes   │   │ Unauthorized │
         │  │        │   │    Page      │
         │  └───┬────┘   └──────────────┘
         │      │
         │      ▼
         │  ┌──────────────┐
         │  │   Dashboard  │
         │  └──────────────┘
         │
         └─ [Error] ──► Show Error Message
```

## 3. Today's Sessions Flow

```
┌─────────────────┐
│  Today Page     │
│  (On Load)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Fetch Bookings │
│ - Filter by    │
│   gym_id       │
│ - Filter by    │
│   current_date │
│ - Join with    │
│   profiles     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Display Sessions│
│ - Time          │
│ - Member Name   │
│ - Source        │
│ - Status        │
│ - Check-in Code │
└────────┬────────┘
         │
         ├─ [Check-In Button Clicked]
         │
         ▼
┌─────────────────┐
│ Update Booking  │
│ status =       │
│ 'checked_in'   │
│ (Supabase)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Refresh Data    │
│ & Update UI     │
└─────────────────┘
```

## 4. Class Schedule CRUD Flow

### Create Class
```
┌─────────────────┐
│ Schedule Page   │
│ [Add Class]     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Modal Form     │
│  - Name         │
│  - Instructor   │
│  - Time         │
│  - Duration     │
│  - Capacity     │
└────────┬────────┘
         │
         │ [Save]
         ▼
┌─────────────────┐
│ Insert into     │
│ classes table   │
│ - gym_id =      │
│   current_gym   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Refresh List    │
│ & Close Modal   │
└─────────────────┘
```

### Update Class
```
┌─────────────────┐
│ Schedule Page   │
│ [Edit Button]   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Modal Form     │
│  (Pre-filled)   │
└────────┬────────┘
         │
         │ [Save]
         ▼
┌─────────────────┐
│ Update classes  │
│ WHERE id =      │
│ class_id        │
│ AND gym_id =    │
│ current_gym     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Refresh List    │
│ & Close Modal   │
└─────────────────┘
```

### Delete Class
```
┌─────────────────┐
│ Schedule Page   │
│ [Delete Button] │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Confirm Dialog  │
│ "Are you sure?" │
└────────┬────────┘
         │
         │ [Yes]
         ▼
┌─────────────────┐
│ Delete from     │
│ classes table   │
│ WHERE id =      │
│ class_id        │
│ AND gym_id =    │
│ current_gym     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Refresh List    │
└─────────────────┘
```

## 5. Payouts Flow

```
┌─────────────────┐
│  Payouts Page   │
│  (On Load)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Fetch Payouts   │
│ - Filter by     │
│   gym_id        │
│ - Order by      │
│   start_date    │
│   DESC          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Display Table   │
│ - Period        │
│ - Revenue       │
│ - Fees          │
│ - Net Payout    │
│ - Status        │
└────────┬────────┘
         │
         ├─ [Row Click]
         │
         ▼
┌─────────────────┐
│ Detail Modal    │
│ - Full Breakdown│
│ - Period Info   │
└─────────────────┘
```

## 6. Security Check Flow

```
┌─────────────────┐
│  Any Protected  │
│     Route       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Auth      │
│ (User logged in?)│
└────────┬────────┘
         │
         ├─ [No] ──► Redirect to /signin
         │
         ▼
┌─────────────────┐
│ Check Profile   │
│ (role = owner?) │
└────────┬────────┘
         │
         ├─ [No] ──► Show Unauthorized Page
         │
         ▼
┌─────────────────┐
│ Check Gym       │
│ (gym exists?)   │
└────────┬────────┘
         │
         ├─ [No] ──► Redirect to /gym-details
         │
         ▼
┌─────────────────┐
│  Render Page    │
│  (All checks OK) │
└─────────────────┘
```

## Screen Mockups Description

### 1. Sign-Up Screen
- **Layout**: Centered card on dark background
- **Fields**: Full Name, Email, Password, Confirm Password
- **Actions**: "Create Account" button, "Sign In" link
- **Validation**: Real-time validation with error messages
- **Integration**: Creates Supabase auth user + profile with `role: 'gym_owner'`

### 2. Gym Details Screen
- **Layout**: Centered form card
- **Fields**: 
  - Gym Name (required)
  - Brand Name (optional)
  - City (required)
  - Address (required, textarea)
  - Contact Email & Phone
  - Facilities (dynamic list with add/remove)
- **Actions**: "Complete Registration" button
- **Integration**: Creates gym record with `owner_id = current_user.id`

### 3. Gym Owner Dashboard (Overview)
- **Layout**: MainLayout with Sidebar + TopBar
- **Content**: KPI cards, charts, recent activity
- **Data**: Fetched from Supabase filtered by `gym_id`
- **Security**: Only accessible if `profile.role === 'gym_owner'`

### 4. Booking Management Screen (Today)
- **Layout**: Table view with filters + Quick Scan sidebar
- **Features**:
  - Filter by status (all, booked, checked_in, completed, no_show)
  - Filter by source (bundle, marketplace)
  - Search by name or code
  - Check-in button for booked sessions
  - QR code scanner input
- **Integration**: 
  - Fetches bookings with joined profiles
  - Updates booking status on check-in
  - Filters by `gym_id` and current date

### 5. Class Scheduling Screen
- **Layout**: Grid of class cards + Add Class button
- **Features**:
  - Date filters (Today, Tomorrow, This Week)
  - Class cards showing: name, time, instructor, capacity, booked count
  - Edit/Delete buttons on hover
  - Add/Edit modal form
- **Integration**: 
  - Full CRUD operations on `classes` table
  - All classes linked to current `gym_id`
  - Real-time booking count calculation

### 6. Payouts Screen
- **Layout**: Table with filters + Detail modal
- **Features**:
  - Period filter (All Time, This Month, Last Month)
  - Status filter (All, Paid, Pending)
  - Clickable rows for details
  - Detail modal with full breakdown
- **Integration**: 
  - Fetches payouts filtered by `gym_id`
  - Displays financial data from `payouts` table

## Data Flow Summary

1. **Authentication**: Supabase Auth handles user sign-up/sign-in
2. **Profile Creation**: On sign-up, profile created with `role: 'gym_owner'`
3. **Gym Creation**: Gym record created with `owner_id = user.id`
4. **Data Queries**: All queries filter by `gym_id` which is derived from `gyms.owner_id = current_user.id`
5. **Security**: RLS policies ensure users can only access their own gym's data
6. **Real-time Updates**: All mutations update Supabase and refresh local state
