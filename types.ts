import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  isPositive?: boolean;
}

export interface UserProfile {
  name: string;
  role: 'Owner' | 'Manager' | 'Staff';
  avatarUrl: string;
  gymName: string;
}