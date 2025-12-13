import { PassProduct } from '../types/gym';

export const MOCK_PASSES: PassProduct[] = [
  {
    id: "pass_01",
    name: "Day Pass",
    type: "single_visit",
    validityDays: 1,
    price: 25.00,
    status: "active",
    description: "Full access to gym facilities for one day.",
    soldCount: 142
  },
  {
    id: "pass_02",
    name: "10-Class Pack",
    type: "multi_visit",
    visitsIncluded: 10,
    validityDays: 90,
    price: 200.00,
    status: "active",
    description: "Save 20% on classes. Valid for 3 months.",
    soldCount: 89
  },
  {
    id: "pass_03",
    name: "Monthly Unlimited",
    type: "monthly",
    validityDays: 30,
    price: 150.00,
    status: "active",
    description: "Unlimited gym access and classes.",
    soldCount: 310
  },
  {
    id: "pass_04",
    name: "Student Drop-in",
    type: "single_visit",
    validityDays: 1,
    price: 15.00,
    status: "hidden",
    description: "Discounted day pass for students with ID.",
    soldCount: 12
  }
];