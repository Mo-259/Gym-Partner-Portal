import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS, CURRENT_USER } from '../../constants';
import { Dumbbell, LogOut } from 'lucide-react';

export const Sidebar: React.FC = () => {
  // Simple RBAC Logic
  const role = CURRENT_USER.role; // 'Owner' | 'Manager' | 'Staff' (mapped from Front Desk/Trainer concept)

  const allowedRoutes = NAV_ITEMS.filter(item => {
    // Owner & Manager see everything
    if (role === 'Owner' || role === 'Manager') return true;

    // Staff (e.g. Front Desk / Trainer) restrictions
    const restrictedForStaff = ['/payouts', '/staff', '/bundles'];
    
    // If role is 'Staff', hide restricted items
    if (role === 'Staff' && restrictedForStaff.includes(item.path)) {
      return false;
    }
    
    return true;
  });

  return (
    <aside className="w-64 h-full bg-[#0A0A0A] border-r border-white/10 flex flex-col hidden md:flex flex-shrink-0">
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
        <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors mb-4 w-full">
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