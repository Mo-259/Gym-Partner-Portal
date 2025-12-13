import { PayoutGym } from '../types/gym';

export const MOCK_PAYOUTS: PayoutGym[] = [
  {
    id: "po_2024_10_21",
    periodLabel: "Oct 14 - Oct 20, 2024",
    startDate: new Date("2024-10-14"),
    endDate: new Date("2024-10-20"),
    revenueBundles: 1250.00,
    revenueMarketplace: 1400.00,
    fees: 265.00,
    netPayout: 2385.00,
    status: "pending"
  },
  {
    id: "po_2024_10_14",
    periodLabel: "Oct 7 - Oct 13, 2024",
    startDate: new Date("2024-10-07"),
    endDate: new Date("2024-10-13"),
    revenueBundles: 1100.00,
    revenueMarketplace: 1350.00,
    fees: 245.00,
    netPayout: 2205.00,
    status: "paid",
    paidAt: new Date("2024-10-15")
  },
  {
    id: "po_2024_10_07",
    periodLabel: "Sep 30 - Oct 6, 2024",
    startDate: new Date("2024-09-30"),
    endDate: new Date("2024-10-06"),
    revenueBundles: 950.00,
    revenueMarketplace: 1200.00,
    fees: 215.00,
    netPayout: 1935.00,
    status: "paid",
    paidAt: new Date("2024-10-08")
  }
];