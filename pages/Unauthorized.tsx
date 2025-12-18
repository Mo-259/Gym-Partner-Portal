import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { ShieldX, Home } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
      <div className="w-full max-w-md">
        <Card className="bg-[#121212] border-white/10 text-center">
          <div className="mb-6">
            <ShieldX size={64} className="mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-gray-400">
              This portal is for gym partners only. Please use our mobile app for general access.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/signin')}
              className="w-full bg-[#005CFF] hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Go to Sign In
            </button>
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Unauthorized;
