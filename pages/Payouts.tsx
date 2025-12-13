import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Download, CheckCircle, Clock, DollarSign, Info, Eye } from 'lucide-react';
import { usePayouts } from '../hooks/useGymData';
import { PayoutGym } from '../types/gym';

const Payouts: React.FC = () => {
  const { data: payouts } = usePayouts();
  
  // Filters
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal
  const [selectedPayout, setSelectedPayout] = useState<PayoutGym | null>(null);

  // Filter Logic
  const filteredPayouts = payouts?.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    
    if (filterPeriod === 'this_month') {
       const now = new Date();
       return p.startDate.getMonth() === now.getMonth() && p.startDate.getFullYear() === now.getFullYear();
    }
    // Simplified logic for "last_month" etc. in mock env
    return true;
  }) || [];

  const handleRowClick = (payout: PayoutGym) => {
    setSelectedPayout(payout);
  };

  return (
    <div>
      <PageHeader 
        title="Payouts" 
        description="Track your earnings from bundles and marketplace."
        actions={
             <button className="flex items-center gap-2 bg-[#121212] border border-white/10 hover:bg-white/5 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
               <Download size={16} />
               <span>Export CSV</span>
             </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
         <select 
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="bg-[#121212] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-[#005CFF] focus:outline-none"
         >
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
         </select>

         <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#121212] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-[#005CFF] focus:outline-none"
         >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
         </select>
      </div>

      <Card title="Transaction History" className="min-h-[400px]">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-white/5 text-gray-200">
                    <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Period</th>
                        <th className="px-4 py-3">Bundle Rev</th>
                        <th className="px-4 py-3">Marketplace</th>
                        <th className="px-4 py-3">Fees</th>
                        <th className="px-4 py-3">Net Payout</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Paid At</th>
                        <th className="px-4 py-3 rounded-tr-lg"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {filteredPayouts.map((payout) => (
                        <tr 
                            key={payout.id} 
                            onClick={() => handleRowClick(payout)}
                            className="hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                            <td className="px-4 py-3 text-white font-medium">{payout.periodLabel}</td>
                            <td className="px-4 py-3 text-gray-300">${payout.revenueBundles.toFixed(2)}</td>
                            <td className="px-4 py-3 text-gray-300">${payout.revenueMarketplace.toFixed(2)}</td>
                            <td className="px-4 py-3 text-red-400">-${payout.fees.toFixed(2)}</td>
                            <td className="px-4 py-3 font-bold text-[#005CFF]">${payout.netPayout.toFixed(2)}</td>
                            <td className="px-4 py-3">
                                <Badge variant={payout.status === 'paid' ? 'success' : 'warning'}>
                                    {payout.status === 'paid' ? 'Paid' : 'Pending'}
                                </Badge>
                            </td>
                            <td className="px-4 py-3">
                                {payout.paidAt ? payout.paidAt.toLocaleDateString() : '—'}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <Eye size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </td>
                        </tr>
                    ))}
                    {filteredPayouts.length === 0 && (
                        <tr><td colSpan={8} className="text-center py-8">No payouts found matching filters.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>

      {/* Payout Details Modal */}
      <Modal
         isOpen={!!selectedPayout}
         onClose={() => setSelectedPayout(null)}
         title={selectedPayout ? `Statement: ${selectedPayout.periodLabel}` : 'Payout Details'}
         footer={
            <button onClick={() => setSelectedPayout(null)} className="text-sm text-gray-400 hover:text-white transition-colors">Close</button>
         }
      >
         {selectedPayout && (
             <div className="space-y-6">
                 {/* Top Summary */}
                 <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 p-4 rounded-lg">
                         <p className="text-xs text-gray-500 uppercase">Net Payout</p>
                         <p className="text-2xl font-bold text-[#005CFF] mt-1">${selectedPayout.netPayout.toFixed(2)}</p>
                     </div>
                     <div className="bg-white/5 p-4 rounded-lg">
                         <p className="text-xs text-gray-500 uppercase">Status</p>
                         <div className="mt-1">
                            <Badge variant={selectedPayout.status === 'paid' ? 'success' : 'warning'}>
                                {selectedPayout.status.toUpperCase()}
                            </Badge>
                         </div>
                     </div>
                 </div>

                 {/* Breakdown */}
                 <div className="border border-white/10 rounded-lg overflow-hidden">
                     <div className="bg-white/5 px-4 py-2 border-b border-white/10">
                         <h4 className="text-sm font-semibold text-white">Earnings Breakdown</h4>
                     </div>
                     <div className="divide-y divide-white/5">
                         <div className="px-4 py-3 flex justify-between text-sm">
                             <span className="text-gray-300">Bundle Revenue</span>
                             <span className="text-white">${selectedPayout.revenueBundles.toFixed(2)}</span>
                         </div>
                         <div className="px-4 py-3 flex justify-between text-sm">
                             <span className="text-gray-300">Marketplace Sales</span>
                             <span className="text-white">${selectedPayout.revenueMarketplace.toFixed(2)}</span>
                         </div>
                         <div className="px-4 py-3 flex justify-between text-sm bg-red-500/5">
                             <span className="text-gray-300">Platform Fees</span>
                             <span className="text-red-400">-${selectedPayout.fees.toFixed(2)}</span>
                         </div>
                         <div className="px-4 py-3 flex justify-between text-sm font-bold bg-white/5">
                             <span className="text-white">Total Payout</span>
                             <span className="text-[#005CFF]">${selectedPayout.netPayout.toFixed(2)}</span>
                         </div>
                     </div>
                 </div>

                 {/* Text Summary */}
                 <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/10 flex gap-3">
                     <Info className="text-blue-500 shrink-0" size={20} />
                     <p className="text-sm text-blue-200/80">
                         This payout covers activity from {selectedPayout.startDate.toLocaleDateString()} to {selectedPayout.endDate.toLocaleDateString()}. 
                         Funds were {selectedPayout.status === 'paid' ? 'deposited' : 'scheduled'} for {selectedPayout.paidAt ? selectedPayout.paidAt.toLocaleDateString() : 'processing'}.
                     </p>
                 </div>

                 <p className="text-xs text-gray-500 text-center">
                     Payouts are processed by the platform. For disputes or questions, please contact support in the Admin platform.
                 </p>
             </div>
         )}
      </Modal>
    </div>
  );
};

export default Payouts;