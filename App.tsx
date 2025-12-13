import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import Overview from './pages/Overview';
import Today from './pages/Today';
import Schedule from './pages/Schedule';
import Passes from './pages/Passes';
import Bundles from './pages/Bundles';
import Payouts from './pages/Payouts';
import Staff from './pages/Staff';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <HashRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/today" element={<Today />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/passes" element={<Passes />} />
          <Route path="/bundles" element={<Bundles />} />
          <Route path="/payouts" element={<Payouts />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </HashRouter>
  );
};

export default App;