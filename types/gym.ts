export interface GymProfile {
  id: string;
  name: string;
  brandName: string;
  city: string;
  address: string;
  tier: "standard" | "premium";
  supportsBundles: boolean;
  facilities: string[];
  openingHours: {
    [key: string]: { open: string; close: string }; // e.g., "Mon": { open: "06:00", close: "22:00" }
  };
  contactEmail: string;
  contactPhone: string;
}

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "front_desk" | "trainer";
  status: "active" | "inactive";
  lastLoginAt?: Date;
  avatarUrl?: string;
}

export interface TodaySession {
  id: string;
  time: Date;
  userName: string;
  userId: string;
  userAvatar?: string;
  source: "bundle" | "marketplace";
  bundleSessionsUsed?: number;
  passName?: string; // e.g., "Day Pass", "Drop-in"
  bookingStatus: "booked" | "checked_in" | "completed" | "no_show";
  checkInCode: string;
}

export interface ClassScheduleItem {
  id: string;
  name: string;
  dateTime: Date;
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  instructorName: string;
  status: "active" | "cancelled";
}

export interface PassProduct {
  id: string;
  name: string;
  type: "single_visit" | "multi_visit" | "monthly";
  visitsIncluded?: number;
  validityDays: number;
  price: number;
  status: "active" | "hidden";
  description?: string;
  soldCount?: number;
}

export interface BundleUsageSummary {
  periodLabel: string;
  totalBundleVisits: number;
  totalBundleSessions: number; // e.g. classes booked via bundle
  standardVisitsCount: number;
  premiumVisitsCount: number;
  estimatedRevenueFromBundles: number;
}

export interface PayoutGym {
  id: string;
  periodLabel: string; // e.g. "Oct 1 - Oct 7, 2024"
  startDate: Date;
  endDate: Date;
  revenueBundles: number;
  revenueMarketplace: number;
  fees: number;
  netPayout: number;
  status: "pending" | "paid";
  paidAt?: Date;
}

export interface BundleVisit {
  id: string;
  date: Date;
  memberName: string;
  memberId: string;
  bundleName: string; // e.g. "Pro Access", "Starter Bundle"
  visitType: "standard" | "premium";
  sessionsUsed: number;
  estimatedEarnings: number;
}