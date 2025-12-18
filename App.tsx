import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import Overview from './pages/Overview';
import Today from './pages/Today';
import Schedule from './pages/Schedule';
import Passes from './pages/Passes';
import Bundles from './pages/Bundles';
import Payouts from './pages/Payouts';
import Staff from './pages/Staff';
import Settings from './pages/Settings';
import SignIn from './pages/SignIn';
import GymDetails from './pages/GymDetails';
import Unauthorized from './pages/Unauthorized';
import GymAdditionPage from './pages/GymAdditionPage';
import SecurityAlert from './pages/SecurityAlert';

// Admin Guard Component - Checks role (admin or super_admin) and redirects accordingly
const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005CFF] mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // If profile is loaded and role is not admin or super_admin, show security alert (which will log out)
  if (profile && profile.role !== 'admin' && profile.role !== 'super_admin') {
    return <SecurityAlert />;
  }

  // If profile is loaded and role is admin or super_admin, allow access
  if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
    return <>{children}</>;
  }

  // Still loading profile
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005CFF] mx-auto mb-4"></div>
        <p className="text-gray-400">Verifying access...</p>
      </div>
    </div>
  );
};

// Add Gym Route Guard - Allows valid roles without requiring gym
const AddGymRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading, hasValidRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005CFF] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Check if user has valid role
  if (!hasValidRole()) {
    return <Unauthorized />;
  }

  return <>{children}</>;
};

// Protected Route Component - Checks for valid role and gym ownership
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, gym, loading, hasValidRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005CFF] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Check if user has valid role
  if (!hasValidRole()) {
    return <Unauthorized />;
  }

  // For gym_owners, require a gym (admins and super_admins can access without gym)
  if (profile?.role === 'gym_owner' && !gym) {
    return <Navigate to="/add-gym" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, loading, error } = useAuth();

  // Show error only for protected routes, allow public routes to work
  const showError = error && window.location.hash !== '#/signin' && !window.location.hash.includes('#/gym-details');

  if (loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005CFF] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
        </div>
      </div>
    );
  }

  if (showError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
        <div className="max-w-md w-full bg-[#121212] border border-red-500/20 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-400 mb-4">Configuration Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-400 mb-2">Create a <code className="text-[#005CFF]">.env</code> file in the project root with:</p>
            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all">
{`VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}
            </pre>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Get these values from your Supabase project: Settings → API
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-[#005CFF] hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" replace />} />
        <Route path="/gym-details" element={<GymDetails />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/security-alert" element={<SecurityAlert />} />

        {/* Legacy route support */}
        <Route
          path="/gym-addition"
          element={<Navigate to="/add-gym" replace />}
        />

        {/* Protected Routes - Includes dashboard and Add Gym */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/today" element={<Today />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/passes" element={<Passes />} />
                  <Route path="/bundles" element={<Bundles />} />
                  <Route path="/payouts" element={<Payouts />} />
                  <Route path="/staff" element={<Staff />} />
                  <Route path="/add-gym" element={<GymAdditionPage />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;