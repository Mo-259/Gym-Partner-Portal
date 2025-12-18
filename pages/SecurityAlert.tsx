import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldX, AlertTriangle, Lock } from 'lucide-react';

const SecurityAlert: React.FC = () => {
  const { signOut } = useAuth();

  useEffect(() => {
    // Automatically sign out the user when this page loads
    const handleSignOut = async () => {
      await signOut();
    };
    handleSignOut();
  }, [signOut]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-2 border-red-500/50 rounded-xl p-8 shadow-2xl">
          {/* Security Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
              <ShieldX size={80} className="relative text-red-500" />
            </div>
          </div>

          {/* Main Alert Content */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 mb-4">
              <AlertTriangle size={20} className="text-red-400" />
              <span className="text-red-400 font-semibold text-sm uppercase tracking-wider">
                Security Alert
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Access Denied
            </h1>
            
            <div className="bg-[#0A0A0A] border border-red-500/30 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Lock size={24} className="text-red-400" />
                <p className="text-xl font-semibold text-red-400">
                  Admin Privileges Required
                </p>
              </div>
              
              <p className="text-gray-300 text-lg leading-relaxed">
                You do not have the necessary administrative privileges to access this portal.
                Your session has been terminated for security purposes.
              </p>
            </div>

            {/* Security Details */}
            <div className="bg-[#121212] border border-white/10 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-400 mb-2">
                <span className="text-red-400 font-semibold">Reason:</span> Insufficient access level
              </p>
              <p className="text-sm text-gray-400 mb-2">
                <span className="text-red-400 font-semibold">Action Taken:</span> Session terminated
              </p>
              <p className="text-sm text-gray-400">
                <span className="text-red-400 font-semibold">Required Role:</span> Admin
              </p>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact your system administrator.
            </p>
            <p className="text-xs text-gray-600 mt-2">
              This is an automated security response. All access attempts are logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlert;
