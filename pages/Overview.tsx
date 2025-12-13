import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Users, DollarSign, Activity, CalendarCheck, Clock, CheckCircle } from 'lucide-react';
import { useTodaySessions, useClassSchedule, usePasses, usePayouts } from '../hooks/useGymData';

const Overview: React.FC = () => {
  const { data: todaySessions } = useTodaySessions();
  const { data: schedule } = useClassSchedule();
  const { data: passes } = usePasses();
  const { data: payouts } = usePayouts();

  // KPIs
  const bookingsToday = todaySessions?.length || 0;
  
  const checkInsCompleted = todaySessions?.filter(s => 
    s.bookingStatus === 'checked_in' || s.bookingStatus === 'completed'
  ).length || 0;
  
  const activePasses = passes?.filter(p => p.status === 'active').length || 0;

  // Simple current month payout approximation (using all 'pending' + 'paid' for current month logic in mock)
  const currentMonthPayout = payouts
    ? payouts.reduce((acc, curr) => acc + curr.netPayout, 0)
    : 0;

  // Upcoming classes (next 3)
  const upcomingClasses = schedule
    ? [...schedule]
        .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
        .filter(c => c.status === 'active') // Show active only
        .slice(0, 3)
    : [];

  // Recent bookings (last 5)
  const recentBookings = todaySessions
    ? [...todaySessions].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5)
    : [];

  // Mock chart data for "Visits last 7 days"
  const visitTrend = [45, 52, 49, 60, 55, 48, bookingsToday || 50]; 
  const maxVisits = Math.max(...visitTrend);

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'booked': return 'blue';
      case 'checked_in': return 'success';
      case 'completed': return 'neutral';
      case 'no_show': return 'error';
      default: return 'default';
    }
  };

  return (
    <div>
      <PageHeader 
        title="Overview"
        description="Snapshot of your gym’s activity and earnings." 
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-0">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm font-medium">Bookings Today</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{bookingsToday}</h3>
                </div>
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <CalendarCheck size={20} />
                </div>
            </div>
        </Card>
        <Card className="p-0">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm font-medium">Check-ins</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{checkInsCompleted}</h3>
                </div>
                <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                    <CheckCircle size={20} />
                </div>
            </div>
        </Card>
        <Card className="p-0">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm font-medium">Active Passes</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{activePasses}</h3>
                </div>
                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                    <Users size={20} />
                </div>
            </div>
        </Card>
        <Card className="p-0">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm font-medium">Net Payout (Mo)</p>
                    <h3 className="text-2xl font-bold text-white mt-1">${currentMonthPayout.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
                    <DollarSign size={20} />
                </div>
            </div>
        </Card>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Simple CSS Chart */}
        <Card title="Visits (Last 7 Days)" className="lg:col-span-2 min-h-[300px]">
          <div className="h-48 mt-4 flex items-end justify-between gap-2">
             {visitTrend.map((val, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex justify-center">
                    <span className="absolute -top-6 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
                    <div 
                      className="w-full bg-[#005CFF]/20 border-t-2 border-[#005CFF] rounded-t-sm hover:bg-[#005CFF]/40 transition-colors"
                      style={{ height: `${(val / maxVisits) * 160}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
               </div>
             ))}
          </div>
        </Card>

        {/* Upcoming Classes */}
        <Card title="Next Upcoming Classes" className="min-h-[300px]">
           <div className="space-y-4">
             {upcomingClasses.length > 0 ? upcomingClasses.map(item => (
               <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex-shrink-0 text-center bg-[#0A0A0A] p-2 rounded border border-white/10">
                    <p className="text-xs font-bold text-gray-400 uppercase">{item.dateTime.toLocaleString('en-US', { weekday: 'short' })}</p>
                    <p className="text-sm font-bold text-white">{item.dateTime.getHours()}:{item.dateTime.getMinutes().toString().padStart(2, '0')}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                       <Users size={12} />
                       <span>{item.bookedCount}/{item.capacity}</span>
                    </div>
                  </div>
               </div>
             )) : (
               <p className="text-gray-500 text-sm">No upcoming classes scheduled.</p>
             )}
             <button className="w-full mt-2 py-2 text-sm text-[#005CFF] hover:bg-[#005CFF]/10 rounded transition-colors">
                View Full Schedule
             </button>
           </div>
        </Card>
      </div>

      {/* Bottom Section */}
      <Card title="Recent Bookings">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs uppercase bg-white/5 text-gray-200">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Time</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentBookings.map((session) => (
                <tr key={session.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-2 text-white">
                    <Clock size={14} className="text-gray-500" />
                    {session.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{session.userName}</td>
                  <td className="px-4 py-3">
                    <Badge variant={session.source === 'bundle' ? 'purple' : 'blue'}>
                      {session.source}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {session.passName || `${session.bundleSessionsUsed} used`}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusVariant(session.bookingStatus)}>
                      {session.bookingStatus.replace('_', ' ')}
                    </Badge>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No recent bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Overview;