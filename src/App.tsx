/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StrictMode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import Analytics from './pages/Analytics';
import SurveyView from './pages/SurveyView';
import Login from './pages/Login';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = localStorage.getItem('citymed_auth') === 'true';
  let hasUserId = false;
  try {
    const user = JSON.parse(localStorage.getItem('citymed_user') || '{}');
    hasUserId = !!user.userId;
  } catch {}
  if (!isAuth || !hasUserId) {
    localStorage.removeItem('citymed_auth');
    localStorage.removeItem('citymed_user');
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/s/:id" element={<SurveyView />} />

        {/* Protected Admin Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/builder/:id" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
        <Route path="/analytics/:id" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
