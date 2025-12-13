import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useTodaySessions } from '../hooks/useGymData';
import { Search, CheckCircle, XCircle, Filter } from 'lucide-react';
import { TodaySession } from '../types/gym';

const Today: React.FC = () => {
  const { data: initialSessions, loading } = useTodaySessions();
  const [sessions, setSessions] = useState<TodaySession[]>([]);
  
  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scanCode, setScanCode] = useState<string>('');

  // Sync mock data to local state once loaded
  useEffect(() => {
    if (initialSessions) {
      setSessions(initialSessions);
    }
  }, [initialSessions]);

  // Actions
  const handleCheckIn = (id: string) => {
    setSessions(prev => prev.map(s => 
      s.id === id ? { ...s, bookingStatus: 'checked_in' } : s
    ));
    setScanCode(''); // Clear scan after action
  };

  const handleNoShow = (id: string) => {
    setSessions(prev => prev.map(s => 
      s.id === id ? { ...s, bookingStatus: 'no_show' } : s
    ));
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCode.trim()) return;
    
    // Find session by code
    const match = sessions.find(s => s.checkInCode.toLowerCase() === scanCode.toLowerCase());
    if (match) {
        if (match.bookingStatus === 'booked') {
            handleCheckIn(match.id);
            alert(`Checked in ${match.userName} successfully!`);
        } else {
            alert(`Member ${match.userName} is already ${match.bookingStatus.replace('_', ' ')}.`);
        }
    } else {
        alert("Invalid check-in code.");
    }
  };

  // Filtering Logic
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Status
      if (statusFilter !== 'all' && session.bookingStatus !== statusFilter) return false;
      // Source
      if (sourceFilter !== 'all' && session.source !== sourceFilter) return false;
      // Search (Name or Code)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          session.userName.toLowerCase().includes(q) || 
          session.checkInCode.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [sessions, statusFilter, sourceFilter, searchQuery]);

  // Utility to style status
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
        title="Today's Sessions" 
        description="Manage check-ins and current bookings."
      />

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Main Content - List */}
        <div className="flex-1 order-2 xl:order-1">
           {/* Filters Bar */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-[#121212] p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                  {['all', 'booked', 'checked_in', 'completed', 'no_show'].map(status => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                            statusFilter === status 
                            ? 'bg-[#005CFF] text-white' 
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                          {status.replace('_', ' ')}
                      </button>
                  ))}
              </div>

              <div className="flex items-center gap-4">
                  <div className="relative">
                      <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <select 
                        value={sourceFilter} 
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="bg-[#0A0A0A] border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-sm text-gray-300 focus:outline-none focus:border-[#005CFF]"
                      >
                          <option value="all">All Sources</option>
                          <option value="bundle">Bundle</option>
                          <option value="marketplace">Marketplace</option>
                      </select>
                  </div>
                  <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="Search user..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-[#0A0A0A] border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-sm text-gray-300 focus:outline-none focus:border-[#005CFF] w-48"
                      />
                  </div>
              </div>
           </div>

           <Card className="min-h-[500px]">
             {loading ? (
                <p className="text-gray-500 text-center py-12">Loading sessions...</p>
             ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="text-xs uppercase bg-white/5 text-gray-200">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">Time</th>
                                <th className="px-4 py-3">Member</th>
                                <th className="px-4 py-3">Source</th>
                                <th className="px-4 py-3">Product / Info</th>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredSessions.map((session) => (
                                <tr key={session.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-4 py-4 font-mono text-white">
                                        {session.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="font-medium text-white">{session.userName}</div>
                                        <div className="text-xs text-gray-500">ID: {session.userId}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`text-xs ${session.source === 'bundle' ? 'text-purple-400' : 'text-blue-400'}`}>
                                            {session.source === 'bundle' ? 'Bundle' : 'Direct'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-xs">
                                        {session.source === 'bundle' 
                                          ? `${session.bundleSessionsUsed} sessions used` 
                                          : session.passName
                                        }
                                    </td>
                                    <td className="px-4 py-4 font-mono text-gray-300">
                                        {session.checkInCode}
                                    </td>
                                    <td className="px-4 py-4">
                                        <Badge variant={getStatusVariant(session.bookingStatus)}>
                                            {session.bookingStatus.replace('_', ' ')}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        {session.bookingStatus === 'booked' ? (
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleCheckIn(session.id)}
                                                    className="p-1.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded transition-colors"
                                                    title="Check In"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleNoShow(session.id)}
                                                    className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
                                                    title="Mark No-Show"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-600 italic">No actions</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredSessions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                        No sessions found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
             )}
           </Card>
        </div>

        {/* Sidebar - Scan */}
        <div className="w-full xl:w-80 order-1 xl:order-2 space-y-6">
            <Card title="Quick Scan" className="bg-[#1A1A1A]">
                <form onSubmit={handleScanSubmit} className="flex flex-col gap-4">
                    <p className="text-sm text-gray-400">Scan member QR code or type booking ID to instantly check them in.</p>
                    <input 
                        type="text" 
                        value={scanCode}
                        onChange={(e) => setScanCode(e.target.value)}
                        placeholder="Scan or type code..." 
                        autoFocus
                        className="w-full bg-[#0A0A0A] border border-white/20 rounded-lg p-3 text-white focus:border-[#005CFF] focus:outline-none text-center font-mono tracking-widest uppercase"
                    />
                    <button type="submit" className="w-full bg-[#005CFF] hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors">
                        Check In Now
                    </button>
                </form>
            </Card>

            <Card title="Summary">
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Total Bookings</span>
                        <span className="text-white font-medium">{sessions.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Checked In</span>
                        <span className="text-green-500 font-medium">{sessions.filter(s => s.bookingStatus === 'checked_in').length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Remaining</span>
                        <span className="text-blue-500 font-medium">{sessions.filter(s => s.bookingStatus === 'booked').length}</span>
                    </div>
                    <div className="border-t border-white/10 pt-4 mt-2">
                        <p className="text-xs text-gray-500 text-center">Auto-refreshing every 5m</p>
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Today;