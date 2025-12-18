import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [gymName, setGymName] = useState<string>('Gym');

  useEffect(() => {
    const fetchGymName = async () => {
      if (profile?.id) {
        const { data } = await supabase
          .from('gyms')
          .select('name')
          .eq('owner_id', profile.id)
          .single();
        
        if (data) {
          setGymName(data.name);
        }
      }
    };

    fetchGymName();
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <header className="h-16 bg-[#0A0A0A] border-b border-white/10 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-400 hover:text-white"
        >
          <Menu size={24} />
        </button>
        
        {/* Environment Tag */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-[#005CFF]"></div>
          <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">Gym Portal</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar - Hidden on mobile for simplicity in this skeleton */}
        <div className="hidden md:flex items-center relative">
          <Search size={16} className="absolute left-3 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-[#121212] border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-[#005CFF] w-64 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#005CFF] rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-white leading-none">{gymName}</p>
            <p className="text-xs text-gray-500 mt-1">{profile?.full_name || profile?.email || 'Gym Owner'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#005CFF] to-blue-800 flex items-center justify-center text-white font-bold text-sm">
            {(profile?.full_name || profile?.email || 'G').charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};