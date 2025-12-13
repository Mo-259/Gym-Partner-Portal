import { GymProfile } from '../types/gym';

export const MOCK_GYM_PROFILE: GymProfile = {
  id: "gym_001",
  name: "Iron Pulse Fitness",
  brandName: "Iron Pulse",
  city: "San Francisco",
  address: "123 Market St, San Francisco, CA 94103",
  tier: "premium",
  supportsBundles: true,
  facilities: ["Olympic Pool", "Sauna", "Free Weights Area", "Cardio Theater", "CrossFit Zone"],
  openingHours: {
    "Monday": { open: "05:00", close: "23:00" },
    "Tuesday": { open: "05:00", close: "23:00" },
    "Wednesday": { open: "05:00", close: "23:00" },
    "Thursday": { open: "05:00", close: "23:00" },
    "Friday": { open: "05:00", close: "22:00" },
    "Saturday": { open: "07:00", close: "20:00" },
    "Sunday": { open: "07:00", close: "20:00" },
  },
  contactEmail: "manager@ironpulse.com",
  contactPhone: "+1 (415) 555-0123"
};