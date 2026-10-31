import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './protected-route';
import { useAuth } from '../hooks/use-auth';

// Pages
import LoginPage from '../pages/login';
import EmployeeDashboardPage from '../pages/employee-dashboard';
import ApplyLeavePage from '../pages/apply-leave';
import LeaveHistoryPage from '../pages/leave-history';
import AdminDashboardPage from '../pages/admin-dashboard';
import AdminLeavesPage from '../pages/admin-leaves';
import AdminEmployeesPage from '../pages/admin-employees';
import NotFoundPage from '../pages/not-found';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      {/* Root Redirection */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? '/admin/dashboard' : '/employee/dashboard'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? '/admin/dashboard' : '/employee/dashboard'} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Employee Protected Routes */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <EmployeeDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/apply"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <ApplyLeavePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/history"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <LeaveHistoryPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leaves"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLeavesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminEmployeesPage />
          </ProtectedRoute>
        }
      />

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppNavigator;

