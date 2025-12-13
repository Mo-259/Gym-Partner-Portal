import { TodaySession } from '../types/gym';

export const MOCK_TODAY_SESSIONS: TodaySession[] = [
  {
    id: "sess_101",
    time: new Date(new Date().setHours(17, 30, 0, 0)),
    userName: "Alice Chen",
    userId: "usr_882",
    source: "bundle",
    bundleSessionsUsed: 4,
    bookingStatus: "booked",
    checkInCode: "AC-9921"
  },
  {
    id: "sess_102",
    time: new Date(new Date().setHours(18, 0, 0, 0)),
    userName: "Bob Smith",
    userId: "usr_110",
    source: "marketplace",
    passName: "Day Pass",
    bookingStatus: "checked_in",
    checkInCode: "BS-1123"
  },
  {
    id: "sess_103",
    time: new Date(new Date().setHours(9, 0, 0, 0)),
    userName: "Charlie Day",
    userId: "usr_443",
    source: "bundle",
    bundleSessionsUsed: 12,
    bookingStatus: "completed",
    checkInCode: "CD-4421"
  },
  {
    id: "sess_104",
    time: new Date(new Date().setHours(19, 30, 0, 0)),
    userName: "Diana Prince",
    userId: "usr_999",
    source: "marketplace",
    passName: "10-Class Pack",
    bookingStatus: "booked",
    checkInCode: "DP-7762"
  }
];