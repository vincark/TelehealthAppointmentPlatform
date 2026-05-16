import { useState, useEffect } from 'react';
import './Login.css';

function LoginPanel() {
  return (
    <div className="login-panel-left">
      <img src="/ll.png" alt="" className="login-bg-photo" aria-hidden="true" />
      <div className="login-overlay" />
      <a href="/" className="login-back-home">← Back to home</a>
      <div className="login-panel-text">
        <h2 className="login-headline">Welcome<br />Back.</h2>
        <p className="login-subtext">Your health journey continues here. Connect with your doctor in seconds.</p>
      </div>
    </div>
  );
}

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    function movePupils(e) {
      document.querySelectorAll('.login-eye').forEach(eye => {
        const rect = eye.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
        const maxMove = 4;
        const pupil = eye.querySelector('.login-pupil');
        if (pupil) {
          pupil.style.transform = `translate(${Math.cos(angle) * maxMove}px, ${Math.sin(angle) * maxMove}px)`;
        }
      });
    }
    window.addEventListener('mousemove', movePupils);
    return () => window.removeEventListener('mousemove', movePupils);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.message || 'Login failed. Please try again.');
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role_id === 2) {
        window.location.href = '/doctor-portal';
      } else if (data.user.role_id === 3) {
        window.location.href = '/admin-portal';
      } else {
        window.location.href = '/patient-portal';
      }
    } catch {
      setApiError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <LoginPanel />
      <div className="login-panel-right">
        <div className="login-card">

          {/* Logo */}
          <div className="login-logo-wrap">
            <span className="login-logo-circle" aria-hidden="true">
              <span className="login-eye"><span className="login-pupil" /></span>
              <span className="login-eye"><span className="login-pupil" /></span>
            </span>
          </div>

          {/* Title */}
          <div className="login-heading">
            <h1 className="login-title">Welcome to Telehealth</h1>
            <p className="login-subtitle">Sign in to continue</p>
          </div>

          {/* Google button */}
          <button type="button" className="login-btn-google" disabled>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* OR divider */}
          <div className="login-or" aria-hidden="true">
            <span>OR</span>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>

            <div className="login-field">
              <label htmlFor="email">Email</label>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="email" name="email" type="email"
                  placeholder="you@example.com" autoComplete="email"
                  value={form.email} onChange={handleChange}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <span className="login-error">{errors.email}</span>}
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••" autoComplete="current-password"
                  value={form.password} onChange={handleChange}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  className="login-toggle-pw"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="login-error">{errors.password}</span>}
            </div>

            <div className="login-forgot">
              <a href="/forgot-password">Forgot password?</a>
            </div>

            {apiError && <p className="login-api-error">{apiError}</p>}

            <button type="submit" className="login-btn-primary" disabled={loading}>
              {loading ? <span className="login-spinner" aria-hidden="true" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

          </form>

          <p className="login-signup-hint">
            Need an account? <a href="/register">Sign up</a>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;
