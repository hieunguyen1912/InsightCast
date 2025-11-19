/**
 * Main App component
 * Root component that sets up the application structure and providers
 */

import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleProtectedRoute from './routes/RoleProtectedRoute';
import { routes } from './routes/index.js';
import { navigationService } from './services/navigationService';
import './index.css';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // Register navigate function for use outside React components (e.g., axios interceptors)
  useEffect(() => {
    navigationService.setNavigator(navigate);
  }, [navigate]);
  
  // Routes that should not show header and footer
  const authRoutes = ['/login', '/register'];
  const dashboardRoutes = ['/dashboard'];
  
  const isAuthRoute = authRoutes.includes(location.pathname);
  const isDashboardRoute = dashboardRoutes.some(route => location.pathname.startsWith(route));
  
  const showHeader = !isAuthRoute;
  const showFooter = !isAuthRoute && !isDashboardRoute;

  return (
    <div className="app">
      {showHeader && <Header />}
      
      <main className="main-content" role="main">
        <Suspense fallback={
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        }>
          <Routes>
            {routes.map(route => {
              const RouteComponent = route.element;
              
              // Route được bảo vệ theo role
              if (route.protected && route.requiredRoles) {
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <RoleProtectedRoute
                        requiredRoles={route.requiredRoles}
                        requiredPermissions={route.requiredPermissions}
                        redirectTo={route.redirectTo || '/'}
                      >
                        <RouteComponent />
                      </RoleProtectedRoute>
                    }
                  />
                );
              }
              
              // Route chỉ yêu cầu authentication
              if (route.protected) {
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <ProtectedRoute>
                        <RouteComponent />
                      </ProtectedRoute>
                    }
                  />
                );
              }
              
              // Public route
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<RouteComponent />}
                />
              );
            })}
          </Routes>
        </Suspense>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;