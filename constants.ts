import { 
  LayoutDashboard, 
  CalendarCheck, 
  CalendarDays, 
  Ticket, 
  Package, 
  Wallet, 
  Users, 
  Settings,
  Building2
} from 'lucide-react';
import { NavItem, UserProfile } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'Today', path: '/today', icon: CalendarCheck },
  { label: 'Schedule', path: '/schedule', icon: CalendarDays },
  { label: 'Passes', path: '/passes', icon: Ticket },
  { label: 'Bundles', path: '/bundles', icon: Package },
  { label: 'Payouts', path: '/payouts', icon: Wallet },
  { label: 'Staff', path: '/staff', icon: Users },
  { label: 'Add Gym', path: '/add-gym', icon: Building2 },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const CURRENT_USER: UserProfile = {
  name: "Alex Johnson",
  role: "Manager",
  avatarUrl: "https://picsum.photos/200",
  gymName: "Iron Pulse Fitness"
};

export const PRIMARY_COLOR = "#005CFF";
export const BG_COLOR = "#0A0A0A";