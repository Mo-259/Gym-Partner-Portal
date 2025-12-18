import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, user, profile, gym, loading: authLoading, refreshGym } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle role verification after login
  useEffect(() => {
    if (authLoading || !user || !profile) return;

    // Role Guard: Check if user has valid role
    const validRoles = ['admin', 'super_admin', 'gym_owner'];
    if (!validRoles.includes(profile.role)) {
      // Sign out user with invalid role and show error
      supabase.auth.signOut();
      setError('This portal is restricted to gym partners. Please contact support for access.');
      return;
    }

    // Refresh gym data for valid roles
    refreshGym();
  }, [user, profile, authLoading, refreshGym]);

  // Handle redirect based on gym ownership
  // Query gyms where owner_id = auth.uid()
  // For gym_owners: If no gym exists, redirect to Add Gym Screen; if gym exists, redirect to Dashboard
  // For admins/super_admins: Always redirect to Dashboard (they can access without gym)
  useEffect(() => {
    if (authLoading || !user || !profile) return;

    const validRoles = ['admin', 'super_admin', 'gym_owner'];
    if (!validRoles.includes(profile.role)) return;

    // Admins and super_admins can access dashboard without gym
    if (profile.role === 'admin' || profile.role === 'super_admin') {
      navigate('/', { replace: true });
      return;
    }

    // For gym_owners: check gym ownership
    // Scenario A: No gym found - redirect to add gym screen
    if (gym === null) {
      navigate('/add-gym', { replace: true });
      return;
    }

    // Scenario B: Gym exists - redirect to dashboard
    if (gym) {
      navigate('/', { replace: true });
      return;
    }
  }, [user, profile, gym, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error: signInError } = await signIn(formData.email, formData.password);

    if (signInError) {
      setError(signInError.message || 'Invalid email or password');
      setLoading(false);
      return;
    }

    // Navigation and role validation will be handled by the useEffect hooks above
    // after the auth context updates
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gym Partner Portal</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        <Card className="bg-[#121212] border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#005CFF] hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
