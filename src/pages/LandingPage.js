import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Shield, Activity, Users, Lock } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/LandingPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LandingPage({ onLogin }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [userToken, setUserToken] = useState('');
  
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({
    email: '',
    username: '',
    password: '',
    confirm_password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      toast.success('Login successful!');
      setShowLoginModal(false);
      onLogin(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post(`${API}/auth/signup`, signupData);
      setUserToken(response.data.user.unique_token);
      setShowSignupModal(false);
      setShowTokenModal(true);
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
    }
  };

  const handleTokenSaved = () => {
    setShowTokenModal(false);
    setShowLoginModal(true);
  };

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="logo-section">
              <Shield className="logo-icon" size={48} />
              <h1 className="brand-name" data-testid="brand-name">HealthGuard AI</h1>
            </div>
            <h2 className="hero-title" data-testid="hero-title">
              Your Personal Health Intelligence Platform
            </h2>
            <p className="hero-subtitle" data-testid="hero-subtitle">
              Advanced AI-powered medical report analysis with OCR technology.
              Get instant insights on your health parameters, severity levels, and personalized recommendations.
            </p>
            <div className="hero-buttons">
              <Button
                data-testid="get-started-btn"
                className="btn-primary"
                onClick={() => setShowSignupModal(true)}
              >
                Get Started
              </Button>
              <Button
                data-testid="login-btn"
                variant="outline"
                className="btn-secondary"
                onClick={() => setShowLoginModal(true)}
              >
                Login
              </Button>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <Activity size={32} className="card-icon" />
              <p>Real-time Analysis</p>
            </div>
            <div className="floating-card card-2">
              <Users size={32} className="card-icon" />
              <p>Family Monitoring</p>
            </div>
            <div className="floating-card card-3">
              <Lock size={32} className="card-icon" />
              <p>Secure & Private</p>
            </div>
          </div>
        </div>
      </div>

      

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="modal-content" data-testid="login-modal">
          <DialogHeader>
            <DialogTitle className="modal-title">Welcome Back</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <Label htmlFor="login-username">Username</Label>
              <Input
                id="login-username"
                data-testid="login-username-input"
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                data-testid="login-password-input"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="btn-submit" data-testid="login-submit-btn">
              Login
            </Button>
            <p className="auth-switch">
              Don't have an account?{' '}
              <button
                type="button"
                data-testid="switch-to-signup-btn"
                className="link-button"
                onClick={() => {
                  setShowLoginModal(false);
                  setShowSignupModal(true);
                }}
              >
                Create Account
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Signup Modal */}
      <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
        <DialogContent className="modal-content" data-testid="signup-modal">
          <DialogHeader>
            <DialogTitle className="modal-title">Create Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSignup} className="auth-form">
            <div className="form-group">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                data-testid="signup-email-input"
                type="email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <Label htmlFor="signup-username">Username</Label>
              <Input
                id="signup-username"
                data-testid="signup-username-input"
                type="text"
                value={signupData.username}
                onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                data-testid="signup-password-input"
                type="password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <Label htmlFor="signup-confirm">Confirm Password</Label>
              <Input
                id="signup-confirm"
                data-testid="signup-confirm-password-input"
                type="password"
                value={signupData.confirm_password}
                onChange={(e) => setSignupData({ ...signupData, confirm_password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="btn-submit" data-testid="signup-submit-btn">
              Sign Up
            </Button>
            <p className="auth-switch">
              Already have an account?{' '}
              <button
                type="button"
                data-testid="switch-to-login-btn"
                className="link-button"
                onClick={() => {
                  setShowSignupModal(false);
                  setShowLoginModal(true);
                }}
              >
                Login
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Token Display Modal */}
      <Dialog open={showTokenModal} onOpenChange={setShowTokenModal}>
        <DialogContent className="modal-content" data-testid="token-modal">
          <DialogHeader>
            <DialogTitle className="modal-title">Important: Save Your Token</DialogTitle>
          </DialogHeader>
          <div className="token-display">
            <p className="token-instruction">Your unique family linking token:</p>
            <div className="token-box" data-testid="user-token">
              <code>{userToken}</code>
            </div>
            <p className="token-warning">
              ⚠️ Please save this token securely. You'll need it to link family members.
            </p>
            <Button
              onClick={handleTokenSaved}
              className="btn-submit"
              data-testid="token-saved-btn"
            >
              I've Saved My Token
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
