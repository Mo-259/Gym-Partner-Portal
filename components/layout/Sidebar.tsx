import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NAV_ITEMS } from '../../constants';
import { Dumbbell, LogOut } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { profile, signOut } = useAuth();

  // Filter navigation items based on user role
  const allowedRoutes = NAV_ITEMS.filter(item => {
    if (!profile) return false;

    // Admins and super_admins see everything including Add Gym
    if (profile.role === 'admin' || profile.role === 'super_admin') {
      return true;
    }

    // Gym owners see everything except Add Gym (they should use it only if they don't have a gym, via redirect)
    if (profile.role === 'gym_owner') {
      // Hide Add Gym from menu for gym_owners who already have a gym
      // They'll be redirected to it if they don't have a gym
      return item.path !== '/add-gym';
    }
    
    return false;
  });

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 h-full bg-[#0A0A0A] border-r border-white/10 flex-shrink-0">
      {/* Brand Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#005CFF] flex items-center justify-center text-white">
            <Dumbbell size={18} />
          </div>
          <span className="font-bold text-lg tracking-wide text-white">GYM<span className="text-[#005CFF]">PORTAL</span></span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {allowedRoutes.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-[#005CFF]/10 text-[#005CFF]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Version info */}
      <div className="p-6 border-t border-white/10">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors mb-4 w-full"
        >
           <LogOut size={14} />
           <span>Sign Out</span>
        </button>
        <div className="text-xs text-gray-600">
          <p>Partner Dashboard v1.0</p>
          <p className="mt-1">© 2024 Gym Platform</p>
        </div>
      </div>
    </aside>
  );
};