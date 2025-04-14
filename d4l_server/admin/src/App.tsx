import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';

// Lazy load pages to improve initial load time
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const AirdropPage = lazy(() => import('./pages/AirdropPage'));
const ContentPage = lazy(() => import('./pages/ContentPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const CachePage = lazy(() => import('./pages/CachePage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<LoadingScreen />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="users"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <UsersPage />
            </Suspense>
          }
        />
        <Route
          path="airdrop"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <AirdropPage />
            </Suspense>
          }
        />
        <Route
          path="content"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <ContentPage />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route
          path="cache"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <CachePage />
            </Suspense>
          }
        />
        <Route
          path="analytics"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <AnalyticsPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
