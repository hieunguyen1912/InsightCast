/**
 * Main App component
 * Root component that sets up the application structure and providers
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import { routes } from './routes/index.js';
import './index.css';

function AppContent() {
  const location = useLocation();
  
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
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;