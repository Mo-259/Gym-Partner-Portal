import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  GymProfile,
  StaffAccount,
  TodaySession,
  ClassScheduleItem,
  PassProduct,
  BundleUsageSummary,
  PayoutGym,
  BundleVisit,
} from '../types/gym';

// Helper to get gym_id from current user
const useGymId = () => {
  const { user, session } = useAuth();
  const [gymId, setGymId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGymId = async () => {
      // Ensure user and session are available before making queries
      if (!user || !session) {
        setGymId(null);
        return;
      }

      try {
        // Verify session is still valid
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          console.warn('Session expired, cannot fetch gym data');
          setGymId(null);
          return;
        }

        // Use .maybeSingle() instead of .single() to handle cases where no gym exists
        const { data, error } = await supabase
          .from('gyms')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (error) {
          // Handle specific error codes
          if (error.code === 'PGRST116' || error.code === '406') {
            // No gym found - this is okay for new users
            console.log('No gym found for user:', user.id);
            setGymId(null);
          } else {
            console.error('Error fetching gym ID:', error.message, error);
            setGymId(null);
          }
          return;
        }

        if (data) {
          setGymId(data.id);
        } else {
          setGymId(null);
        }
      } catch (error: any) {
        console.error('Unexpected error fetching gym ID:', error);
        setGymId(null);
      }
    };

    fetchGymId();
  }, [user, session]);

  return gymId;
};

export const useGymProfile = () => {
  const { user, session } = useAuth();
  const [data, setData] = useState<GymProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure user and session are available before making queries
    if (!user || !session) {
      setLoading(false);
      setData(null);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Verify session is still valid
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          console.warn('Session expired, cannot fetch gym profile');
          setError('Session expired. Please sign in again.');
          setData(null);
          setLoading(false);
          return;
        }

        // Use .maybeSingle() instead of .single() to handle cases where no gym exists
        const { data: gymData, error: queryError } = await supabase
          .from('gyms')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (queryError) {
          // Handle specific error codes
          if (queryError.code === 'PGRST116' || queryError.code === '406') {
            // No gym found - this is okay for new users who haven't created a gym yet
            console.log('No gym found for user:', user.id);
            setData(null);
            setError(null); // Not an error, just no data yet
          } else if (queryError.code === 'PGRST301' || queryError.message?.includes('JWT')) {
            // Authentication/authorization error
            console.error('Authentication error fetching gym profile:', queryError.message);
            setError('Authentication failed. Please sign in again.');
            setData(null);
          } else {
            // Other errors
            console.error('Error fetching gym profile:', queryError.message, queryError);
            setError(`Failed to fetch gym data: ${queryError.message}`);
            setData(null);
          }
          return;
        }

        if (gymData) {
          setData({
            id: gymData.id,
            name: gymData.name,
            brandName: gymData.brand_name || gymData.name,
            city: gymData.city,
            address: gymData.address,
            tier: gymData.tier || 'standard',
            supportsBundles: gymData.supports_bundles || false,
            facilities: gymData.facilities || [],
            openingHours: gymData.opening_hours || {},
            contactEmail: gymData.contact_email,
            contactPhone: gymData.contact_phone,
          });
          setError(null);
        } else {
          // No gym data found
          setData(null);
          setError(null);
        }
      } catch (error: any) {
        console.error('Unexpected error fetching gym profile:', error);
        setError(`Unexpected error: ${error.message || 'Unknown error'}`);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, session]);

  return { data, loading, error };
};

export const useStaff = () => {
  const gymId = useGymId();
  const { session } = useAuth();
  const [data, setData] = useState<StaffAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gymId || !session) {
      setLoading(false);
      return;
    }

    const fetchStaff = async () => {
      try {
        // Verify session is still valid
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          console.warn('Session expired, cannot fetch staff data');
          setLoading(false);
          return;
        }

        const { data: staffData, error } = await supabase
          .from('staff')
          .select('*')
          .eq('gym_id', gymId);

        if (error) {
          console.error('Error fetching staff:', error.message, error);
          if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
            console.error('Authentication error fetching staff');
          }
          return;
        }

        if (staffData) {
          setData(
            staffData.map((s) => ({
              id: s.id,
              name: s.name || s.email,
              email: s.email,
              role: s.role,
              status: s.status || 'active',
              lastLoginAt: s.last_login_at ? new Date(s.last_login_at) : undefined,
              avatarUrl: s.avatar_url,
            }))
          );
        }
      } catch (error: any) {
        console.error('Unexpected error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [gymId, session]);

  return { data, loading };
};

export const useTodaySessions = () => {
  const gymId = useGymId();
  const [data, setData] = useState<TodaySession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    if (!gymId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch bookings for today
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email
          )
        `)
        .eq('gym_id', gymId)
        .gte('date', today.toISOString().split('T')[0])
        .lt('date', tomorrow.toISOString().split('T')[0]);

      if (error) throw error;

      if (bookingsData) {
        const sessions: TodaySession[] = bookingsData.map((booking: any) => {
          const profile = booking.profiles;
          const bookingDate = new Date(booking.date);
          const timeStr = booking.time || '00:00';
          const [hours, minutes] = timeStr.split(':');
          bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          return {
            id: booking.id,
            time: bookingDate,
            userName: profile?.full_name || profile?.email || 'Unknown',
            userId: booking.user_id,
            userAvatar: profile?.avatar_url,
            source: booking.source || 'marketplace',
            bundleSessionsUsed: booking.bundle_sessions_used,
            passName: booking.pass_name,
            bookingStatus: booking.status || 'booked',
            checkInCode: booking.check_in_code || booking.id.substring(0, 8).toUpperCase(),
          };
        });

        setData(sessions);
      }
    } catch (error) {
      console.error('Error fetching today sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [gymId]);

  return { data, loading, refetch: fetchSessions };
};

export const useClassSchedule = () => {
  const gymId = useGymId();
  const [data, setData] = useState<ClassScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gymId) {
      setLoading(false);
      return;
    }

    const fetchSchedule = async () => {
      try {
        const { data: classesData, error } = await supabase
          .from('classes')
          .select(`
            *,
            bookings!inner(count)
          `)
          .eq('gym_id', gymId)
          .eq('status', 'active')
          .order('date_time', { ascending: true });

        if (error) throw error;

        if (classesData) {
          // Get booked count for each class
          const classesWithBookings = await Promise.all(
            classesData.map(async (classItem) => {
              const { count } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('class_id', classItem.id)
                .eq('status', 'booked');

              return {
                id: classItem.id,
                name: classItem.name,
                dateTime: new Date(classItem.date_time),
                durationMinutes: classItem.duration_minutes,
                capacity: classItem.capacity,
                bookedCount: count || 0,
                instructorName: classItem.instructor_name,
                status: classItem.status,
              };
            })
          );

          setData(classesWithBookings);
        }
      } catch (error) {
        console.error('Error fetching class schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [gymId]);

  return { data, loading };
};

export const usePasses = () => {
  const gymId = useGymId();
  const [data, setData] = useState<PassProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gymId) {
      setLoading(false);
      return;
    }

    const fetchPasses = async () => {
      try {
        const { data: passesData, error } = await supabase
          .from('passes')
          .select('*')
          .eq('gym_id', gymId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (passesData) {
          setData(
            passesData.map((p) => ({
              id: p.id,
              name: p.name,
              type: p.type,
              visitsIncluded: p.visits_included,
              validityDays: p.validity_days,
              price: p.price,
              status: p.status,
              description: p.description,
              soldCount: p.sold_count || 0,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching passes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPasses();
  }, [gymId]);

  return { data, loading };
};

export const useBundleUsage = () => {
  const gymId = useGymId();
  const [data, setData] = useState<BundleUsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gymId) {
      setLoading(false);
      return;
    }

    const fetchBundleUsage = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // This is a simplified version - you may need to adjust based on your actual schema
        const { data: bundleData, error } = await supabase
          .from('bundle_visits')
          .select('*')
          .eq('gym_id', gymId)
          .gte('date', startOfMonth.toISOString().split('T')[0]);

        if (error) throw error;

        // Calculate summary
        const totalBundleVisits = bundleData?.length || 0;
        const standardVisits = bundleData?.filter((v) => v.visit_type === 'standard').length || 0;
        const premiumVisits = bundleData?.filter((v) => v.visit_type === 'premium').length || 0;
        const totalSessions = bundleData?.reduce((sum, v) => sum + (v.sessions_used || 0), 0) || 0;
        const estimatedRevenue = bundleData?.reduce((sum, v) => sum + (v.estimated_earnings || 0), 0) || 0;

        setData({
          periodLabel: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          totalBundleVisits,
          totalBundleSessions: totalSessions,
          standardVisitsCount: standardVisits,
          premiumVisitsCount: premiumVisits,
          estimatedRevenueFromBundles: estimatedRevenue,
        });
      } catch (error) {
        console.error('Error fetching bundle usage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBundleUsage();
  }, [gymId]);

  return { data, loading };
};

export const usePayouts = () => {
  const gymId = useGymId();
  const [data, setData] = useState<PayoutGym[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gymId) {
      setLoading(false);
      return;
    }

    const fetchPayouts = async () => {
      try {
        const { data: payoutsData, error } = await supabase
          .from('payouts')
          .select('*')
          .eq('gym_id', gymId)
          .order('start_date', { ascending: false });

        if (error) throw error;

        if (payoutsData) {
          setData(
            payoutsData.map((p) => ({
              id: p.id,
              periodLabel: p.period_label,
              startDate: new Date(p.start_date),
              endDate: new Date(p.end_date),
              revenueBundles: p.revenue_bundles || 0,
              revenueMarketplace: p.revenue_marketplace || 0,
              fees: p.fees || 0,
              netPayout: p.net_payout || 0,
              status: p.status,
              paidAt: p.paid_at ? new Date(p.paid_at) : undefined,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching payouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, [gymId]);

  return { data, loading };
};

export const useBundleVisits = () => {
  const gymId = useGymId();
  const [data, setData] = useState<BundleVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gymId) {
      setLoading(false);
      return;
    }

    const fetchBundleVisits = async () => {
      try {
        const { data: visitsData, error } = await supabase
          .from('bundle_visits')
          .select(`
            *,
            profiles:member_id (
              id,
              full_name,
              email
            )
          `)
          .eq('gym_id', gymId)
          .order('date', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (visitsData) {
          setData(
            visitsData.map((v: any) => ({
              id: v.id,
              date: new Date(v.date),
              memberName: v.profiles?.full_name || v.profiles?.email || 'Unknown',
              memberId: v.member_id,
              bundleName: v.bundle_name,
              visitType: v.visit_type,
              sessionsUsed: v.sessions_used || 0,
              estimatedEarnings: v.estimated_earnings || 0,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching bundle visits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBundleVisits();
  }, [gymId]);

  return { data, loading };
};
