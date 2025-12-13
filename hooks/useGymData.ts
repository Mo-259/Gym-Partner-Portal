import { useState, useEffect } from 'react';
import { GymProfile, StaffAccount, TodaySession, ClassScheduleItem, PassProduct, BundleUsageSummary, PayoutGym, BundleVisit } from '../types/gym';
import { MOCK_GYM_PROFILE } from '../mockData/gymProfile';
import { MOCK_STAFF } from '../mockData/staff';
import { MOCK_TODAY_SESSIONS } from '../mockData/todaySessions';
import { MOCK_CLASS_SCHEDULE } from '../mockData/classSchedule';
import { MOCK_PASSES } from '../mockData/passes';
import { MOCK_BUNDLE_USAGE } from '../mockData/bundleUsage';
import { MOCK_PAYOUTS } from '../mockData/payouts';
import { MOCK_BUNDLE_VISITS } from '../mockData/bundleVisits';

// Generic simulation of data fetching
function useMockData<T>(mockData: T, delay = 500) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [mockData, delay]);

  return { data, loading };
}

export const useGymProfile = () => useMockData<GymProfile>(MOCK_GYM_PROFILE);
export const useStaff = () => useMockData<StaffAccount[]>(MOCK_STAFF);
export const useTodaySessions = () => useMockData<TodaySession[]>(MOCK_TODAY_SESSIONS);
export const useClassSchedule = () => useMockData<ClassScheduleItem[]>(MOCK_CLASS_SCHEDULE);
export const usePasses = () => useMockData<PassProduct[]>(MOCK_PASSES);
export const useBundleUsage = () => useMockData<BundleUsageSummary>(MOCK_BUNDLE_USAGE);
export const usePayouts = () => useMockData<PayoutGym[]>(MOCK_PAYOUTS);
export const useBundleVisits = () => useMockData<BundleVisit[]>(MOCK_BUNDLE_VISITS);