'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { loginAction, signupAction, googleLoginAction } from '@/app/actions/auth'; 
import "./login.css"; // Pastikan path ini sesuai dengan file CSS Anda

// Komponen Isi Form (Dipisah agar bisa memakai hook useGoogleLogin)
function AuthContent() {
  const router = useRouter();
  
  // States
  const [activeForm, setActiveForm] = useState<'login' | 'signup'>('login');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' = 'success', duration = 4000) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), duration);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      showAlert('Welcome to Subnova! Please log in.', 'success');
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Handler Login Manual
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result.success) {
      showAlert(result.message, 'success');
      setTimeout(async () =>{
        window.location.href = '/'; // Arahkan ke Root Panel Admin
      }, 1200);
    } else {
      showAlert(result.message, 'error');
      setIsLoading(false);
    }
  };

  // Handler Signup Manual
  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await signupAction(formData);

    if (result.success) {
      showAlert(result.message, 'success');
      setTimeout(async () =>{
        window.location.href = '/'; // Arahkan ke Root Panel Admin
      }, 1200);
    } else {
      showAlert(result.message, 'error');
      setIsLoading(false);
    }
  };

  // Handler Google Login
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      const result = await googleLoginAction(tokenResponse.access_token);
      
      if (result.success) {
        showAlert(result.message, 'success');
        setTimeout(async () =>{
          window.location.href = '/'; // Arahkan ke Root Panel Admin
        }, 1200);
      } else {
        showAlert(result.message, 'error');
        setIsLoading(false);
      }
    },
    onError: () => {
      showAlert('Login Google dibatalkan atau gagal.', 'error');
      setIsLoading(false);
    }
  });

  return (
    <>
      {/* Alert Container */}
      <div className="alert-container" id="alertContainer">
        {alert && (
          <div className={`alert ${alert.type}`}>
            <span 
              className="alert-icon" 
              style={{ color: alert.type === 'success' ? 'var(--green, #22c55e)' : 'var(--red, #ef4444)' }}
            >
              <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            </span>
            <span>{alert.message}</span>
            <button className="alert-close" onClick={() => setAlert(null)} type="button">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
      </div>

      {/* Auth Card */}
      <div className="auth-container">
        
        {/* Brand */}
        <div className="auth-brand">
          <div className="logo-icon"><i className="fas fa-language"></i></div>
          <h1>Subnova</h1>
          <p>Translation Platform &middot; LLM Powered</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs" id="authTabs">
          <button 
            className={activeForm === 'login' ? 'active' : ''} 
            onClick={() => setActiveForm('login')}
            type="button"
            disabled={isLoading}
          >
            Login
          </button>
          <button 
            className={activeForm === 'signup' ? 'active' : ''} 
            onClick={() => setActiveForm('signup')}
            type="button"
            disabled={isLoading}
          >
            Sign Up
          </button>
        </div>

        {/* ===== LOGIN FORM ===== */}
        {activeForm === 'login' && (
          <form className="auth-form active" onSubmit={handleLoginSubmit} autoComplete="off">
            <div className="form-group">
              <label htmlFor="loginEmail">Email</label>
              <input type="email" name="email" className="form-control" id="loginEmail" placeholder="you@example.com" required disabled={isLoading} />
            </div>
            <div className="form-group">
              <label htmlFor="loginPassword">Password</label>
              <div className="password-wrapper">
                <input 
                  type={showLoginPassword ? 'text' : 'password'} 
                  name="password"
                  className="form-control" 
                  id="loginPassword" 
                  placeholder="••••••••" 
                  required 
                  disabled={isLoading}
                />
                <i 
                  className={`fas ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`} 
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{ cursor: 'pointer' }}
                ></i>
              </div>
            </div>
            <div className="form-options">
              <label>
                <input type="checkbox" defaultChecked disabled={isLoading} /> Remember me
              </label>
              <a href="#">Forgot password?</a>
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              <i className={isLoading ? "fas fa-spinner fa-spin" : "fas fa-sign-in-alt"}></i> 
              {isLoading ? ' Processing...' : ' Log In'}
            </button>

            <div className="divider">or continue with</div>

            <button type="button" className="btn btn-google" onClick={() => googleLogin()} disabled={isLoading}>
              <i className="fab fa-google"></i> Sign in with Google
            </button>
          </form>
        )}

        {/* ===== SIGNUP FORM ===== */}
        {activeForm === 'signup' && (
          <form className="auth-form active" onSubmit={handleSignupSubmit} autoComplete="off">
            <div className="form-group">
              <label htmlFor="signupName">Full Name</label>
              <input type="text" name="name" className="form-control" id="signupName" placeholder="John Doe" required disabled={isLoading} />
            </div>
            <div className="form-group">
              <label htmlFor="signupEmail">Email</label>
              <input type="email" name="email" className="form-control" id="signupEmail" placeholder="you@example.com" required disabled={isLoading} />
            </div>
            <div className="form-group">
              <label htmlFor="signupPassword">Password</label>
              <div className="password-wrapper">
                <input 
                  type={showSignupPassword ? 'text' : 'password'} 
                  name="password"
                  className="form-control" 
                  id="signupPassword" 
                  placeholder="Min 8 characters" 
                  required 
                  minLength={8} 
                  disabled={isLoading}
                />
                <i 
                  className={`fas ${showSignupPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`} 
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  style={{ cursor: 'pointer' }}
                ></i>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              <i className={isLoading ? "fas fa-spinner fa-spin" : "fas fa-user-plus"}></i> 
              {isLoading ? ' Processing...' : ' Create Account'}
            </button>

            <div className="divider">or continue with</div>

            <button type="button" className="btn btn-google" onClick={() => googleLogin()} disabled={isLoading}>
              <i className="fab fa-google"></i> Sign up with Google
            </button>
          </form>
        )}

        {/* Footer Switch */}
        <div className="auth-footer">
          {activeForm === 'login' ? (
            <span>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); !isLoading && setActiveForm('signup'); }}>Sign Up</a>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); !isLoading && setActiveForm('login'); }}>Log In</a>
            </span>
          )}
        </div>
        
      </div>
    </>
  );
}

// ==========================================
// KOMPONEN UTAMA (Provider)
// ==========================================
export default function LoginPage() {
  // Ganti string ini dengan Client ID Anda atau ambil dari .env
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "GANTI_DENGAN_GOOGLE_CLIENT_ID_ANDA";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthContent />
    </GoogleOAuthProvider>
  );
}