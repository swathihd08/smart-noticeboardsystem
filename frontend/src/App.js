import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import FeedbackPage from './pages/FeedbackPage';
import AdminFeedbackPage from './pages/AdminFeedbackPage';
// Import the new pages
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main className="py-3">
          <Container>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/admin-feedback" element={<AdminFeedbackPage />} />
              
              {/* --- NEW ROUTES --- */}
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
            </Routes>
          </Container>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;