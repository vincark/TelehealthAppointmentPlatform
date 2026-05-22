import './Navbar.css';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useLocation } from 'react-router-dom';

/**
 * Top navigation bar.
 * - Logo on the left
 * - Nav links in the middle (My Portal removed — auth-protected feature)
 * - Theme toggle + Sign In + Create Account on the right
 */
function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();

  function handleBookNow(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role_id === 1) {
          window.location.href = '/patient-portal?openBooking=1';
          return;
        }
      } catch {}
    }
    window.location.href = '/login';
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* === LEFT: Logo === */}
        <a href="/" className="navbar-brand">
          <span className="navbar-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </span>
          <span className="navbar-brand-name">Telehealth</span>
        </a>

        {/* === MIDDLE: Nav links (My Portal removed) === */}
        <nav className="navbar-links" aria-label="Primary">
          <a href="/" className={`nav-link${pathname === '/' ? ' nav-link-active' : ''}`}>Home</a>
          <a href="/providers" className={`nav-link${pathname === '/providers' ? ' nav-link-active' : ''}`}>Providers</a>
         
        </nav>

        {/* === RIGHT: Theme toggle + Auth buttons === */}
        <div className="navbar-actions">

          {/* Theme toggle */}
          <button
            type="button"
            className="navbar-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon size={18} aria-hidden="true" />
            ) : (
              <Sun size={18} aria-hidden="true" />
            )}
          </button>

          <a href="/login" className="navbar-signin">Sign In</a>
          <a href="/register" className="navbar-cta">Create Account</a>
        </div>

      </div>
    </header>
  );
}

export default Navbar;