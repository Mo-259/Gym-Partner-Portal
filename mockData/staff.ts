import { StaffAccount } from '../types/gym';

export const MOCK_STAFF: StaffAccount[] = [
  {
    id: "stf_01",
    name: "Alex Johnson",
    email: "alex@ironpulse.com",
    role: "manager",
    status: "active",
    lastLoginAt: new Date("2024-10-24T08:30:00"),
    avatarUrl: "https://i.pravatar.cc/150?u=alex"
  },
  {
    id: "stf_02",
    name: "Sarah Connor",
    email: "sarah@ironpulse.com",
    role: "trainer",
    status: "active",
    lastLoginAt: new Date("2024-10-23T14:15:00"),
    avatarUrl: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    id: "stf_03",
    name: "Mike Ross",
    email: "mike@ironpulse.com",
    role: "front_desk",
    status: "active",
    lastLoginAt: new Date("2024-10-24T06:00:00"),
    avatarUrl: "https://i.pravatar.cc/150?u=mike"
  },
  {
    id: "stf_04",
    name: "Jessica Pearson",
    email: "jessica@ironpulse.com",
    role: "owner",
    status: "inactive",
    lastLoginAt: new Date("2024-09-15T09:00:00"),
    avatarUrl: "https://i.pravatar.cc/150?u=jessica"
  }
];