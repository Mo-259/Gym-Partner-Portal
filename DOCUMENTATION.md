# Gym Partner Portal - Complete Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Features & Pages](#features--pages)
5. [Components](#components)
6. [Data Management](#data-management)
7. [Setup & Installation](#setup--installation)
8. [Configuration](#configuration)
9. [Development Guide](#development-guide)
10. [User Roles & Permissions](#user-roles--permissions)

---

## 🎯 Project Overview

The **Gym Partner Portal** is a comprehensive admin dashboard designed for gym owners and managers to manage their fitness facility operations. It provides tools for managing memberships, bookings, payments, staff, schedules, and more.

### Key Capabilities

- **Real-time Session Management**: Track and manage daily gym sessions and check-ins
- **Class Scheduling**: Create and manage fitness class schedules
- **Pass Management**: Create and manage marketplace passes (single visit, multi-visit, monthly subscriptions)
- **Bundle Tracking**: Monitor platform bundle usage and revenue
- **Financial Management**: Track payouts, revenue, and earnings
- **Staff Management**: Manage staff accounts and permissions
- **Settings & Configuration**: Customize gym profile, booking preferences, and notifications

---

## 🛠 Technology Stack

### Core Technologies

- **React 19.2.3**: Modern UI library for building interactive interfaces
- **TypeScript 5.8.2**: Type-safe JavaScript for better code quality
- **Vite 6.2.0**: Fast build tool and development server
- **React Router DOM 7.10.1**: Client-side routing for navigation

### Styling

- **Tailwind CSS 3.4.19**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **Autoprefixer**: Automatic vendor prefixing
- **Lucide React**: Modern icon library

### Development Tools

- **@vitejs/plugin-react**: Vite plugin for React support
- **@types/node**: TypeScript definitions for Node.js

---

## 📁 Project Structure

```
Gym-Partner-Portal/
├── components/           # Reusable UI components
│   ├── layout/          # Layout components (Sidebar, TopBar, MainLayout)
│   └── ui/              # UI primitives (Card, Badge, Modal, etc.)
├── pages/               # Page components (routes)
│   ├── Overview.tsx     # Dashboard overview page
│   ├── Today.tsx        # Today's sessions management
│   ├── Schedule.tsx     # Class schedule management
│   ├── Passes.tsx       # Marketplace passes management
│   ├── Bundles.tsx      # Bundle usage tracking
│   ├── Payouts.tsx     # Financial payouts
│   ├── Staff.tsx        # Staff management
│   └── Settings.tsx     # Gym settings
├── hooks/               # Custom React hooks
│   └── useGymData.ts    # Data fetching hooks
├── mockData/            # Mock data for development
│   ├── gymProfile.ts
│   ├── todaySessions.ts
│   ├── classSchedule.ts
│   ├── passes.ts
│   ├── bundleUsage.ts
│   ├── bundleVisits.ts
│   ├── payouts.ts
│   └── staff.ts
├── types/               # TypeScript type definitions
│   ├── gym.ts           # Gym-related types
│   └── types.ts         # General types
├── constants.ts         # Application constants
├── App.tsx              # Main app component with routing
├── index.tsx            # Application entry point
├── index.html           # HTML template
├── index.css            # Global styles and Tailwind imports
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── tsconfig.json        # TypeScript configuration
```

---

## 🎨 Features & Pages

### 1. Overview Page (`/`)

**Purpose**: Dashboard home page providing a snapshot of gym activity and key metrics.

**Features**:
- **KPI Cards**: 
  - Bookings Today
  - Check-ins Completed
  - Active Passes
  - Net Payout (Current Month)
- **Visits Chart**: 7-day visit trend visualization
- **Upcoming Classes**: Next 3 scheduled classes with booking status
- **Recent Bookings**: Last 5 bookings with status badges

**Data Sources**:
- `useTodaySessions()`: Today's booking sessions
- `useClassSchedule()`: Class schedule data
- `usePasses()`: Active pass products
- `usePayouts()`: Payout history

---

### 2. Today Page (`/today`)

**Purpose**: Manage today's gym sessions, check-ins, and member visits.

**Features**:
- **Session List**: Table of all today's bookings with:
  - Time, Member name, Source (bundle/marketplace)
  - Product info, Check-in code, Status
- **Quick Scan**: QR code scanner for instant check-ins
- **Filters**:
  - Status filter (all, booked, checked_in, completed, no_show)
  - Source filter (all, bundle, marketplace)
  - Search by member name or check-in code
- **Actions**:
  - Check-in members
  - Mark no-shows
- **Summary Sidebar**: Total bookings, checked-in count, remaining bookings

**Key Functionality**:
- Real-time status updates
- Check-in code validation
- Status badge color coding (blue=booked, green=checked_in, gray=completed, red=no_show)

---

### 3. Schedule Page (`/schedule`)

**Purpose**: Create and manage fitness class schedules.

**Features**:
- **Date Filters**: View classes for Today, Tomorrow, or This Week
- **Class Cards**: Grid display showing:
  - Class name, date, time, duration
  - Instructor name
  - Booking capacity (booked/total)
  - Status (active/cancelled)
  - Progress bar for capacity
- **Add/Edit Modal**: Create or modify classes with:
  - Class name
  - Instructor name
  - Time and duration
  - Capacity
  - Status
- **Actions**: Edit existing classes

**Data Management**:
- Local state management for CRUD operations
- Date-based filtering
- Sorting by date/time

---

### 4. Passes Page (`/passes`)

**Purpose**: Manage marketplace passes (products sold directly by the gym).

**Features**:
- **Pass Types**:
  - Single Visit: One-time entry
  - Multi Visit: Multiple visits (e.g., 10-class pack)
  - Monthly: Unlimited monthly subscription
- **Pass Table**: Displays:
  - Pass name and description
  - Type, Visits included, Validity period
  - Price, Status (active/hidden)
- **Create/Edit Modal**: Configure:
  - Name, Type, Price
  - Visits included (disabled for monthly)
  - Validity days
  - Status
  - Description
- **Info Banner**: Explains difference between marketplace passes and platform bundles

**Business Logic**:
- Monthly passes show "Unlimited" for visits
- Hidden passes are drafts not visible to customers

---

### 5. Bundles Page (`/bundles`)

**Purpose**: Track platform bundle usage and revenue (if bundles are enabled).

**Features**:
- **Bundle Support Check**: Shows message if bundles are disabled
- **KPI Cards**:
  - Total Bundle Visits
  - Sessions Consumed
  - Type Split (Standard vs Premium)
  - Estimated Revenue
- **Time Filters**: This Month / Last Month
- **Visit Chart**: 7-day bundle visit trend
- **Recent Visits Table**: Shows:
  - Date, Member name, Bundle name
  - Visit type (standard/premium)
  - Sessions used, Estimated earnings

**Bundle Types**:
- **Standard**: Costs 1 session from bundle
- **Premium**: Costs 2 sessions from bundle

**Note**: Only visible if gym has bundle support enabled in settings.

---

### 6. Payouts Page (`/payouts`)

**Purpose**: Track financial payouts and earnings.

**Features**:
- **Payout Table**: Displays:
  - Period label
  - Bundle revenue
  - Marketplace revenue
  - Platform fees
  - Net payout
  - Status (paid/pending)
  - Payment date
- **Filters**:
  - Period filter (all time, this month, last month)
  - Status filter (all, paid, pending)
- **Payout Details Modal**: Click any row to see:
  - Net payout summary
  - Earnings breakdown
  - Period dates
  - Payment status and date
- **Export**: CSV export button (UI only)

**Revenue Sources**:
- **Bundle Revenue**: Earnings from platform bundle usage
- **Marketplace Revenue**: Earnings from direct pass sales
- **Platform Fees**: Deducted fees
- **Net Payout**: Final amount after fees

---

### 7. Staff Page (`/staff`)

**Purpose**: Manage staff accounts and access permissions.

**Features**:
- **Staff Cards**: Grid display showing:
  - Staff name and email
  - Avatar/photo
  - Role badge
  - Status indicator (active/inactive)
  - Last login date
- **Role-Based Access**:
  - Only Owner/Manager can invite/edit staff
  - Staff role cannot access this page
- **Invite/Edit Modal**: Create or modify staff with:
  - Full name
  - Email address
  - Role selection
  - Status (active/inactive)
- **Roles**:
  - Owner: Full access
  - Manager: Full access
  - Front Desk: Limited access (no payouts, staff, bundles)
  - Trainer: Limited access

**Permissions**: Controlled by `CURRENT_USER.role` in constants.

---

### 8. Settings Page (`/settings`)

**Purpose**: Configure gym profile, booking preferences, and notifications.

**Features**:

#### **Gym Profile Tab**:
- Gym name, Brand name
- City, Address
- Contact email, Phone
- Facilities selection (multi-select):
  - Pool, Sauna, Ladies Only Area, CrossFit Zone
  - 24/7 Access, Showers, Parking, Cafe, Free Weights

#### **Booking & Preferences Tab**:
- **Booking Preferences**:
  - Allow same-day bookings toggle
  - Check-in window (minutes before class)
  - Earliest booking hour
  - Latest booking hour
- **Bundles & Marketplace**:
  - Gym tier display (standard/premium)
  - Bundle support status
  - Information about bundle functionality

#### **Notifications Tab**:
- Email notification toggles:
  - New Bookings
  - Daily Summary
  - Payout Notifications

**Save Functionality**: All settings can be saved (currently shows alert).

---

## 🧩 Components

### Layout Components

#### `MainLayout`
- **Location**: `components/layout/MainLayout.tsx`
- **Purpose**: Main app layout wrapper
- **Features**:
  - Sidebar navigation
  - Top bar header
  - Main content area with scrolling
  - Mobile menu state management

#### `Sidebar`
- **Location**: `components/layout/Sidebar.tsx`
- **Purpose**: Navigation sidebar
- **Features**:
  - Role-based menu filtering
  - Active route highlighting
  - Brand logo
  - Sign out button
  - Version info

#### `TopBar`
- **Location**: `components/layout/TopBar.tsx`
- **Purpose**: Top navigation bar
- **Features**:
  - Mobile menu toggle
  - Environment tag
  - Search bar
  - Notifications icon
  - User profile display

### UI Components

#### `Card`
- **Location**: `components/ui/Card.tsx`
- **Purpose**: Container component for content sections
- **Props**:
  - `title`: Optional card title
  - `action`: Optional action button/component
  - `className`: Additional CSS classes
  - `children`: Card content

#### `Badge`
- **Location**: `components/ui/Badge.tsx`
- **Purpose**: Status/type indicator
- **Variants**: `default`, `blue`, `success`, `error`, `warning`, `neutral`, `purple`

#### `Modal`
- **Location**: `components/ui/Modal.tsx`
- **Purpose**: Modal dialog for forms and details
- **Props**:
  - `isOpen`: Modal visibility
  - `onClose`: Close handler
  - `title`: Modal title
  - `footer`: Footer content (buttons)
  - `children`: Modal body content

#### `PageHeader`
- **Location**: `components/ui/PageHeader.tsx`
- **Purpose**: Page title and description header
- **Props**:
  - `title`: Page title
  - `description`: Page description
  - `actions`: Optional action buttons

#### `Toggle`
- **Location**: `components/ui/Toggle.tsx`
- **Purpose**: Toggle switch component
- **Props**:
  - `label`: Toggle label
  - `description`: Optional description
  - `checked`: Toggle state
  - `onChange`: Change handler

---

## 📊 Data Management

### Custom Hooks

All data fetching is handled through custom hooks in `hooks/useGymData.ts`:

#### Available Hooks:
- `useGymProfile()`: Gym profile data
- `useStaff()`: Staff accounts list
- `useTodaySessions()`: Today's booking sessions
- `useClassSchedule()`: Class schedule items
- `usePasses()`: Marketplace pass products
- `useBundleUsage()`: Bundle usage summary
- `usePayouts()`: Payout history
- `useBundleVisits()`: Individual bundle visit records

#### Data Flow:
1. **Mock Data**: Currently uses mock data from `mockData/` directory
2. **Simulated Loading**: 500ms delay to simulate API calls
3. **State Management**: React `useState` and `useEffect` hooks
4. **Future Integration**: Hooks can be easily replaced with real API calls

### Data Types

All TypeScript types are defined in `types/gym.ts`:

- `GymProfile`: Gym information and settings
- `StaffAccount`: Staff member data
- `TodaySession`: Daily booking session
- `ClassScheduleItem`: Fitness class schedule
- `PassProduct`: Marketplace pass product
- `BundleUsageSummary`: Bundle usage statistics
- `PayoutGym`: Payout transaction
- `BundleVisit`: Individual bundle visit record

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js**: Version 18+ recommended
- **npm**: Comes with Node.js

### Installation Steps

1. **Navigate to project directory**:
   ```bash
   cd "Gym-Partner-Portal"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   - Navigate to `http://localhost:3000`
   - The dashboard should load automatically

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## ⚙️ Configuration

### Vite Configuration (`vite.config.ts`)

- **Port**: 3000
- **Host**: 0.0.0.0 (accessible from network)
- **React Plugin**: Enabled for JSX support
- **Path Alias**: `@` maps to project root

### Tailwind Configuration (`tailwind.config.js`)

- **Content Paths**: Scans all `.tsx`, `.ts`, `.jsx`, `.js` files
- **Custom Colors**:
  - `primary`: #005CFF (blue)
  - `bg-app`: #0A0A0A (dark background)
  - `surface`: #121212 (card background)
- **Font Family**: Montserrat (from Google Fonts)

### TypeScript Configuration (`tsconfig.json`)

- **Target**: ES2022
- **Module**: ESNext
- **JSX**: react-jsx
- **Module Resolution**: bundler
- **Path Mapping**: `@/*` → `./*`

### Constants (`constants.ts`)

- **NAV_ITEMS**: Navigation menu items
- **CURRENT_USER**: Current logged-in user profile
- **PRIMARY_COLOR**: #005CFF
- **BG_COLOR**: #0A0A0A

---

## 💻 Development Guide

### Adding a New Page

1. **Create page component** in `pages/`:
   ```typescript
   // pages/NewPage.tsx
   import React from 'react';
   import { PageHeader } from '../components/ui/PageHeader';
   
   const NewPage: React.FC = () => {
     return (
       <div>
         <PageHeader title="New Page" description="Description" />
         {/* Your content */}
       </div>
     );
   };
   
   export default NewPage;
   ```

2. **Add route** in `App.tsx`:
   ```typescript
   import NewPage from './pages/NewPage';
   
   <Route path="/new-page" element={<NewPage />} />
   ```

3. **Add navigation item** in `constants.ts`:
   ```typescript
   { label: 'New Page', path: '/new-page', icon: YourIcon },
   ```

### Adding a New Component

1. Create component file in appropriate directory:
   - Layout components → `components/layout/`
   - UI components → `components/ui/`
   - Feature components → `components/features/`

2. Export and use:
   ```typescript
   export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
     return <div>Component content</div>;
   };
   ```

### Styling Guidelines

- Use Tailwind utility classes
- Follow dark theme color scheme:
  - Background: `bg-[#0A0A0A]`
  - Surface: `bg-[#121212]`
  - Primary: `text-[#005CFF]` or `bg-[#005CFF]`
- Use opacity for borders: `border-white/10`
- Maintain consistent spacing and padding

### Data Fetching Pattern

```typescript
// In your component
const { data, loading } = useGymData();

if (loading) return <div>Loading...</div>;
if (!data) return <div>No data</div>;

// Use data
```

---

## 👥 User Roles & Permissions

### Role Hierarchy

1. **Owner**
   - Full access to all features
   - Can manage staff (including other owners)
   - Can access all pages

2. **Manager**
   - Full access to all features
   - Can manage staff (except owners)
   - Can access all pages

3. **Front Desk / Staff**
   - Limited access
   - **Cannot access**:
     - Payouts page
     - Staff management page
     - Bundles page (if restricted)
   - **Can access**:
     - Overview
     - Today's sessions
     - Schedule
     - Passes
     - Settings (read-only for some sections)

4. **Trainer**
   - Similar to Front Desk
   - Focus on class management

### Permission Implementation

Permissions are checked in:
- `components/layout/Sidebar.tsx`: Filters navigation items
- `pages/Staff.tsx`: Controls edit/invite buttons
- `constants.ts`: `CURRENT_USER.role` determines access

### Changing User Role

Edit `constants.ts`:
```typescript
export const CURRENT_USER: UserProfile = {
  name: "Your Name",
  role: "Manager", // Change to "Owner", "Manager", or "Staff"
  avatarUrl: "https://...",
  gymName: "Your Gym"
};
```

---

## 🎨 Design System

### Color Palette

- **Primary Blue**: `#005CFF`
- **Background**: `#0A0A0A`
- **Surface**: `#121212`
- **Text Primary**: `#FFFFFF` / `#E5E5E5`
- **Text Secondary**: `#9CA3AF` / `#6B7280`
- **Success**: Green (`#10B981`)
- **Error**: Red (`#EF4444`)
- **Warning**: Yellow (`#F59E0B`)

### Typography

- **Font Family**: Montserrat (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Sizes**: 
  - Headers: `text-2xl`, `text-xl`, `text-lg`
  - Body: `text-sm`, `text-base`
  - Small: `text-xs`

### Spacing

- Consistent spacing using Tailwind scale
- Common padding: `p-4`, `p-6`, `p-8`
- Common gaps: `gap-4`, `gap-6`, `gap-8`

### Components Styling

- **Cards**: Rounded corners (`rounded-xl`), border (`border-white/10`)
- **Buttons**: Primary blue, hover states, transitions
- **Inputs**: Dark background, blue focus border
- **Badges**: Color-coded by variant

---

## 🔧 Troubleshooting

### Blank Page / Black Screen

1. **Check browser console** (F12) for errors
2. **Verify script tag** in `index.html`:
   ```html
   <script type="module" src="/index.tsx"></script>
   ```
3. **Check CSS import** in `index.tsx`:
   ```typescript
   import './index.css';
   ```
4. **Restart dev server**: `npm run dev`

### Tailwind Styles Not Working

1. **Verify Tailwind config** includes correct content paths
2. **Check PostCSS config** is present
3. **Restart dev server** after config changes
4. **Clear browser cache**

### Routing Issues

1. **Verify HashRouter** is used (for GitHub Pages compatibility)
2. **Check route paths** match navigation items
3. **Ensure all page components** are exported as default

### Type Errors

1. **Run TypeScript check**: `npx tsc --noEmit`
2. **Verify all imports** are correct
3. **Check type definitions** in `types/` directory

---

## 📝 Notes

### Current Limitations

- **Mock Data**: All data is currently mocked (not connected to real API)
- **No Authentication**: User role is hardcoded in constants
- **No Persistence**: Changes are lost on page refresh (local state only)
- **No Real Backend**: All operations are simulated

### Future Enhancements

- Connect to real API backend
- Implement authentication system
- Add data persistence
- Add real-time updates
- Implement search functionality
- Add export features (CSV, PDF)
- Add analytics and reporting
- Mobile app support

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Check component code for implementation details
4. Verify configuration files

---

**Last Updated**: December 2024
**Version**: 1.0.0

