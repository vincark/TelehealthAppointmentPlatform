import { useState } from 'react';
import './Register.css';

function RegisterPanel() {
  return (
    <div className="register-panel-left">
      <img src="/ca.png" alt="" className="reg-bg-photo" aria-hidden="true" />
      <div className="reg-overlay" />
      <a href="/" className="reg-back-home">← Back to home</a>
      <div className="reg-panel-text">
        <h2 className="reg-headline">Your Health,<br />On Your Terms.</h2>
        <p className="reg-subtext">Connect with certified doctors from the comfort of your home — fast, private, and available whenever you need it.</p>
      </div>
    </div>
  );
}

function Register() {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

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
    else if (!PASSWORD_REGEX.test(form.password))
      e.password = 'Min. 8 chars with uppercase, lowercase, number & special character (!@#$%^&*)';
    if (!form.confirmPassword) e.confirmPassword = 'Required';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.message || 'Registration failed. Please try again.'); return; }
      setSubmitted(true);
    } catch {
      setApiError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="register-page">
        <RegisterPanel />
        <div className="register-panel-right">
          <div className="register-success">
            <span className="register-success-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </span>
            <h2>Account Created!</h2>
            <p>Welcome to Telehealth. You can now log in and complete your profile.</p>
            <a href="/login" className="register-btn-primary">Go to Login</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <RegisterPanel />
      <div className="register-panel-right">
        <div className="register-card">

          {/* Header */}
          <div className="register-header">
            <span className="register-logo" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="white">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </span>
            <div>
              <h1 className="register-title">Create Account</h1>
              <p className="register-subtitle">Join Telehealth — quality care, anywhere</p>
            </div>
          </div>

          {/* Social login buttons */}
          <div className="register-social">
            <button type="button" className="register-btn-social" disabled>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button type="button" className="register-btn-social" disabled>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2" aria-hidden="true">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.024 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.612 23.097 24 18.1 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
          </div>

          <div className="register-or" aria-hidden="true"><span>OR</span></div>

          {/* Form */}
          <form className="register-form" onSubmit={handleSubmit} noValidate>

            <div className="register-field register-field--full">
              <label htmlFor="email">Email Address <span aria-hidden="true">*</span></label>
              <input
                id="email" name="email" type="email"
                placeholder="you@example.com" autoComplete="email"
                value={form.email} onChange={handleChange}
                aria-invalid={!!errors.email}
              />
              {errors.email && <span className="register-error">{errors.email}</span>}
            </div>

            <div className="register-field register-field--full">
              <label htmlFor="password">Password <span aria-hidden="true">*</span></label>
              <div className="register-pw-wrap">
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 chars, A-Z, a-z, 0-9, !@#$…" autoComplete="new-password"
                  value={form.password} onChange={handleChange}
                  aria-invalid={!!errors.password}
                />
                <button type="button" className="register-pw-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <span className="register-error">{errors.password}</span>}
            </div>

            <div className="register-field register-field--full">
              <label htmlFor="confirmPassword">Confirm Password <span aria-hidden="true">*</span></label>
              <div className="register-pw-wrap">
                <input
                  id="confirmPassword" name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password" autoComplete="new-password"
                  value={form.confirmPassword} onChange={handleChange}
                  aria-invalid={!!errors.confirmPassword}
                />
                <button type="button" className="register-pw-toggle"
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword && <span className="register-error">{errors.confirmPassword}</span>}
            </div>

            {apiError && <p className="register-api-error">{apiError}</p>}

            <button type="submit" className="register-btn-primary" disabled={loading}>
              {loading ? <span className="register-spinner" aria-hidden="true" /> : null}
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>

            <div className="register-divider" aria-hidden="true" />
            <p className="register-login-hint">Already have an account?</p>
            <a href="/login" className="register-btn-secondary">Log In →</a>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
