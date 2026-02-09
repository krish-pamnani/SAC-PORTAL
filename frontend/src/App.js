import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import EntityDashboard from './pages/EntityDashboard';
import TreasuryDashboard from './pages/TreasuryDashboard';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedTypes }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedTypes && !allowedTypes.includes(user.user_type)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Home redirect based on user type
const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user type
  switch (user.user_type) {
    case 'student':
      return <Navigate to="/student" replace />;
    case 'entity':
      return <Navigate to="/entity" replace />;
    case 'treasury':
      return <Navigate to="/treasury" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedTypes={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/entity/*"
            element={
              <ProtectedRoute allowedTypes={['entity']}>
                <EntityDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/treasury/*"
            element={
              <ProtectedRoute allowedTypes={['treasury']}>
                <TreasuryDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
