import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Toggle } from '../components/ui/Toggle';
import { useGymProfile } from '../hooks/useGymData';
import { Save, User, Settings as SettingsIcon, Bell, Info } from 'lucide-react';

const Settings: React.FC = () => {
  const { data: initialProfile } = useGymProfile();
  
  // Local state for settings form
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'booking' | 'notifications'>('profile');
  
  // Settings States
  const [facilities, setFacilities] = useState<string[]>([]);
  const [preferences, setPreferences] = useState({
     allowSameDay: true,
     checkInWindow: 30, // minutes
     bookingStartHour: 6,
     bookingEndHour: 22,
  });
  const [notifications, setNotifications] = useState({
     newBookings: true,
     dailySummary: true,
     payouts: true
  });

  // Initialize state
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setFacilities(initialProfile.facilities || []);
    }
  }, [initialProfile]);

  const handleFacilityToggle = (facility: string) => {
     if (facilities.includes(facility)) {
        setFacilities(prev => prev.filter(f => f !== facility));
     } else {
        setFacilities(prev => [...prev, facility]);
     }
  };

  const handleSave = () => {
     // Mock save
     alert("Settings saved successfully!");
  };

  if (!profile) return <div className="text-gray-500 p-8">Loading settings...</div>;

  const facilityOptions = ["Pool", "Sauna", "Ladies Only Area", "CrossFit Zone", "24/7 Access", "Showers", "Parking", "Cafe", "Free Weights"];

  return (
    <div>
      <PageHeader 
        title="Settings" 
        description="Update gym profile, location details, and preferences."
        actions={
            <button onClick={handleSave} className="flex items-center gap-2 bg-[#005CFF] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Save size={16} />
                <span>Save Changes</span>
            </button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Settings Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
             <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-[#005CFF]/10 text-[#005CFF] border-l-2 border-[#005CFF]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <User size={18} />
                    <span>Gym Profile</span>
                </button>
                <button 
                  onClick={() => setActiveTab('booking')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'booking' ? 'bg-[#005CFF]/10 text-[#005CFF] border-l-2 border-[#005CFF]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <SettingsIcon size={18} />
                    <span>Booking & Prefs</span>
                </button>
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-[#005CFF]/10 text-[#005CFF] border-l-2 border-[#005CFF]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Bell size={18} />
                    <span>Notifications</span>
                </button>
             </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1 space-y-6">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                  <Card title="Gym Details">
                      <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-sm text-gray-400 mb-1">Gym Name</label>
                                  <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none" />
                              </div>
                              <div>
                                  <label className="block text-sm text-gray-400 mb-1">Brand Name (Short)</label>
                                  <input type="text" value={profile.brandName} onChange={(e) => setProfile({...profile, brandName: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none" />
                              </div>
                              <div>
                                  <label className="block text-sm text-gray-400 mb-1">City</label>
                                  <input type="text" value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none" />
                              </div>
                              <div>
                                  <label className="block text-sm text-gray-400 mb-1">Address</label>
                                  <input type="text" value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none" />
                              </div>
                              <div>
                                  <label className="block text-sm text-gray-400 mb-1">Contact Email</label>
                                  <input type="email" value={profile.contactEmail} onChange={(e) => setProfile({...profile, contactEmail: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none" />
                              </div>
                              <div>
                                  <label className="block text-sm text-gray-400 mb-1">Phone</label>
                                  <input type="text" value={profile.contactPhone} onChange={(e) => setProfile({...profile, contactPhone: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none" />
                              </div>
                          </div>

                          <div>
                              <label className="block text-sm text-gray-400 mb-3">Facilities</label>
                              <div className="flex flex-wrap gap-2">
                                  {facilityOptions.map(fac => (
                                      <button 
                                        key={fac}
                                        onClick={() => handleFacilityToggle(fac)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${facilities.includes(fac) ? 'bg-[#005CFF]/20 text-[#005CFF] border-[#005CFF]' : 'bg-[#0A0A0A] text-gray-400 border-white/10 hover:border-white/30'}`}
                                      >
                                          {fac}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </Card>
              )}

              {/* Booking & Preferences Tab */}
              {activeTab === 'booking' && (
                  <div className="space-y-6">
                      <Card title="Booking Preferences">
                          <div className="space-y-2">
                             <Toggle 
                                label="Allow same-day bookings" 
                                description="Members can book classes taking place today."
                                checked={preferences.allowSameDay}
                                onChange={(val) => setPreferences({...preferences, allowSameDay: val})}
                             />
                             
                             <div className="py-3 border-t border-white/5">
                                 <label className="block text-sm font-medium text-white mb-1">Check-in Window</label>
                                 <p className="text-xs text-gray-500 mb-2">Minutes before class starts that check-in opens.</p>
                                 <input 
                                   type="number" 
                                   value={preferences.checkInWindow}
                                   onChange={(e) => setPreferences({...preferences, checkInWindow: parseInt(e.target.value)})}
                                   className="w-24 bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white focus:border-[#005CFF] focus:outline-none"
                                 />
                             </div>

                             <div className="py-3 border-t border-white/5 grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="block text-sm font-medium text-white mb-1">Earliest Booking Hour</label>
                                     <select 
                                       value={preferences.bookingStartHour}
                                       onChange={(e) => setPreferences({...preferences, bookingStartHour: parseInt(e.target.value)})}
                                       className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white focus:border-[#005CFF] focus:outline-none"
                                     >
                                         {[...Array(24)].map((_, i) => <option key={i} value={i}>{i}:00</option>)}
                                     </select>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-white mb-1">Latest Booking Hour</label>
                                     <select 
                                       value={preferences.bookingEndHour}
                                       onChange={(e) => setPreferences({...preferences, bookingEndHour: parseInt(e.target.value)})}
                                       className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white focus:border-[#005CFF] focus:outline-none"
                                     >
                                         {[...Array(24)].map((_, i) => <option key={i} value={i}>{i}:00</option>)}
                                     </select>
                                 </div>
                             </div>
                          </div>
                      </Card>

                      <Card title="Bundles & Marketplace">
                          <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/5">
                             <div className="flex justify-between items-center mb-2">
                                 <span className="text-sm text-gray-400">Gym Tier</span>
                                 <span className="font-bold text-white uppercase tracking-wider">{profile.tier}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                 <span className="text-sm text-gray-400">Bundles Enabled</span>
                                 <span className={profile.supportsBundles ? 'text-green-500' : 'text-gray-500'}>{profile.supportsBundles ? 'Yes' : 'No'}</span>
                             </div>
                          </div>

                          <div className="flex gap-3 items-start p-4 bg-blue-500/5 rounded-lg border border-blue-500/10">
                              <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                              <div className="text-sm">
                                  {profile.supportsBundles ? (
                                      <p className="text-gray-300">
                                          Users can use platform bundles to visit this gym. 
                                          <br/>
                                          <span className="text-white font-medium">Standard visits cost 1 session. Premium visits cost 2 sessions.</span>
                                      </p>
                                  ) : (
                                      <p className="text-gray-300">This gym is currently marketplace-only. Bundles will not be applied here.</p>
                                  )}
                              </div>
                          </div>
                      </Card>
                  </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                  <Card title="Email Notifications">
                      <div className="space-y-2">
                          <Toggle 
                             label="New Bookings" 
                             description="Receive an email whenever a user books a class or pass."
                             checked={notifications.newBookings}
                             onChange={(val) => setNotifications({...notifications, newBookings: val})}
                          />
                          <div className="border-t border-white/5"></div>
                          <Toggle 
                             label="Daily Summary" 
                             description="Receive a morning digest of today's schedule and expected volume."
                             checked={notifications.dailySummary}
                             onChange={(val) => setNotifications({...notifications, dailySummary: val})}
                          />
                          <div className="border-t border-white/5"></div>
                          <Toggle 
                             label="Payout Notifications" 
                             description="Get notified when a payout is processed or if there are issues."
                             checked={notifications.payouts}
                             onChange={(val) => setNotifications({...notifications, payouts: val})}
                          />
                      </div>
                  </Card>
              )}
          </div>
      </div>
    </div>
  );
};

export default Settings;