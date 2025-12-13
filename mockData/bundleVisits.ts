import { BundleVisit } from '../types/gym';

export const MOCK_BUNDLE_VISITS: BundleVisit[] = [
  {
    id: "bv_001",
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    memberName: "Alice Chen",
    memberId: "u_882",
    bundleName: "Pro Access Bundle",
    visitType: "premium",
    sessionsUsed: 1,
    estimatedEarnings: 12.50
  },
  {
    id: "bv_002",
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    memberName: "Charlie Day",
    memberId: "u_443",
    bundleName: "Starter Bundle",
    visitType: "standard",
    sessionsUsed: 1,
    estimatedEarnings: 8.00
  },
  {
    id: "bv_003",
    date: new Date(new Date().setDate(new Date().getDate() - 2)),
    memberName: "Evan Wright",
    memberId: "u_102",
    bundleName: "Pro Access Bundle",
    visitType: "premium",
    sessionsUsed: 2,
    estimatedEarnings: 25.00
  },
  {
    id: "bv_004",
    date: new Date(new Date().setDate(new Date().getDate() - 3)),
    memberName: "Fiona Gallagher",
    memberId: "u_555",
    bundleName: "Corporate Wellness",
    visitType: "standard",
    sessionsUsed: 1,
    estimatedEarnings: 9.00
  },
  {
    id: "bv_005",
    date: new Date(new Date().setDate(new Date().getDate() - 4)),
    memberName: "Greg House",
    memberId: "u_121",
    bundleName: "Pro Access Bundle",
    visitType: "premium",
    sessionsUsed: 1,
    estimatedEarnings: 12.50
  }
];