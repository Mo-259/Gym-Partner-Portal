import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Package, CheckCircle, TrendingUp, DollarSign, AlertCircle, Calendar } from 'lucide-react';
import { useBundleUsage, useGymProfile, useBundleVisits } from '../hooks/useGymData';

const Bundles: React.FC = () => {
  const { data: profile, loading: profileLoading } = useGymProfile();
  const { data: usage } = useBundleUsage();
  const { data: visits } = useBundleVisits();
  
  const [timeFilter, setTimeFilter] = useState('this_month');

  if (profileLoading) return <div className="text-gray-500 p-8">Loading...</div>;

  // Handle case where bundles are not supported
  if (!profile?.supportsBundles) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
             <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                 <Package size={40} className="text-gray-500" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Bundles not enabled</h2>
             <p className="text-gray-400 max-w-md mb-8">
                 This gym currently does not accept platform bundles. Users can still book via your marketplace passes. To enable bundles, please contact platform support.
             </p>
             <button className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium">
                 Contact Support
             </button>
          </div>
      );
  }

  // Calculate random graph data based on total visits for a "visual" chart
  const visitData = [12, 18, 14, 24, 20, 28, 32];
  const maxVisit = Math.max(...visitData);

  return (
    <div>
      <PageHeader 
        title="Bundle Usage" 
        description="See how platform bundles are used at your gym."
        actions={
            <div className="flex bg-[#121212] rounded-lg border border-white/10 p-1">
                <button 
                  onClick={() => setTimeFilter('this_month')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${timeFilter === 'this_month' ? 'bg-[#005CFF] text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    This Month
                </button>
                <button 
                  onClick={() => setTimeFilter('last_month')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${timeFilter === 'last_month' ? 'bg-[#005CFF] text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    Last Month
                </button>
            </div>
        }
      />

      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-[#121212] p-0 relative overflow-hidden">
                <div className="p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm">
                        <Package size={16} />
                        <span>Total Bundle Visits</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{usage.totalBundleVisits}</p>
                    <div className="mt-2 text-xs text-green-500 flex items-center gap-1">
                        <TrendingUp size={12} />
                        <span>+12%</span>
                    </div>
                </div>
            </Card>

            <Card className="bg-[#121212] p-0 relative overflow-hidden">
                <div className="p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm">
                        <CheckCircle size={16} />
                        <span>Sessions Consumed</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{usage.totalBundleSessions}</p>
                    <p className="mt-2 text-xs text-gray-500">Classes & Appointments</p>
                </div>
            </Card>

            <Card className="bg-[#121212] p-0 relative overflow-hidden">
                 <div className="p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm">
                        <AlertCircle size={16} />
                        <span>Type Split</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-white">{usage.standardVisitsCount}</span>
                        <span className="text-xs text-gray-500">std</span>
                        <span className="text-gray-600 mx-1">/</span>
                        <span className="text-xl font-bold text-[#005CFF]">{usage.premiumVisitsCount}</span>
                        <span className="text-xs text-[#005CFF]">prem</span>
                    </div>
                    <div className="w-full h-1 bg-gray-700 rounded-full mt-3 overflow-hidden">
                        <div 
                           className="h-full bg-[#005CFF]" 
                           style={{ width: `${(usage.premiumVisitsCount / (usage.premiumVisitsCount + usage.standardVisitsCount)) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </Card>

            <Card className="bg-[#121212] p-0 relative overflow-hidden">
                <div className="p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm">
                        <DollarSign size={16} />
                        <span>Est. Revenue</span>
                    </div>
                    <p className="text-3xl font-bold text-white">${usage.estimatedRevenueFromBundles.toLocaleString()}</p>
                    <p className="mt-2 text-xs text-gray-500">Pending final calculation</p>
                </div>
            </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Bundle Visits Trend" className="lg:col-span-2 min-h-[300px]">
           <div className="h-48 mt-8 flex items-end justify-between gap-4 px-4">
              {visitData.map((val, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full flex justify-center">
                         <span className="absolute -top-8 text-xs text-white bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
                         <div 
                           className="w-full max-w-[40px] bg-[#005CFF] rounded-t-sm hover:opacity-80 transition-opacity"
                           style={{ height: `${(val / maxVisit) * 160}px` }}
                         ></div>
                    </div>
                    <span className="text-xs text-gray-500">Day {i * 4 + 1}</span>
                 </div>
              ))}
           </div>
        </Card>
        
        <Card title="Top Bundles" className="flex flex-col justify-center text-center">
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-left">
                        <p className="text-white font-medium text-sm">Pro Access Bundle</p>
                        <p className="text-xs text-gray-500">Premium Tier</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[#005CFF] font-bold">142</p>
                        <p className="text-xs text-gray-500">visits</p>
                    </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-left">
                        <p className="text-white font-medium text-sm">Starter Bundle</p>
                        <p className="text-xs text-gray-500">Standard Tier</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-200 font-bold">89</p>
                        <p className="text-xs text-gray-500">visits</p>
                    </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-left">
                        <p className="text-white font-medium text-sm">Corporate Wellness</p>
                        <p className="text-xs text-gray-500">Standard Tier</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-200 font-bold">34</p>
                        <p className="text-xs text-gray-500">visits</p>
                    </div>
                </div>
            </div>
        </Card>
      </div>

      <Card title="Recent Bundle Visits">
         <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-gray-400">
                 <thead className="text-xs uppercase bg-white/5 text-gray-200">
                     <tr>
                         <th className="px-6 py-4 rounded-tl-lg">Date</th>
                         <th className="px-6 py-4">Member</th>
                         <th className="px-6 py-4">Bundle Used</th>
                         <th className="px-6 py-4">Type</th>
                         <th className="px-6 py-4">Sessions</th>
                         <th className="px-6 py-4 text-right rounded-tr-lg">Est. Earnings</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                     {visits?.map((visit) => (
                         <tr key={visit.id} className="hover:bg-white/5 transition-colors">
                             <td className="px-6 py-4 flex items-center gap-2">
                                <Calendar size={14} className="text-gray-500" />
                                {visit.date.toLocaleDateString()}
                             </td>
                             <td className="px-6 py-4">
                                <div className="text-white font-medium">{visit.memberName}</div>
                                <div className="text-xs text-gray-500">ID: {visit.memberId}</div>
                             </td>
                             <td className="px-6 py-4 text-white">{visit.bundleName}</td>
                             <td className="px-6 py-4">
                                 <Badge variant={visit.visitType === 'premium' ? 'blue' : 'neutral'}>
                                     {visit.visitType}
                                 </Badge>
                             </td>
                             <td className="px-6 py-4 text-gray-300">{visit.sessionsUsed}</td>
                             <td className="px-6 py-4 text-right font-mono text-white">${visit.estimatedEarnings.toFixed(2)}</td>
                         </tr>
                     ))}
                     {(!visits || visits.length === 0) && (
                         <tr><td colSpan={6} className="text-center py-8">No recent visits recorded.</td></tr>
                     )}
                 </tbody>
             </table>
         </div>
      </Card>
    </div>
  );
};

export default Bundles;