import { useState } from 'react';
import './Navbar.css';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useLocation } from 'react-router-dom';

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() { setMenuOpen(false); }

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* === LEFT: Logo === */}
        <a href="/" className="navbar-brand">
          <span className="navbar-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#DC2626">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </span>
          <span className="navbar-brand-name">Telehealth</span>
        </a>

        {/* === MIDDLE: Nav links (desktop) === */}
        <nav className="navbar-links" aria-label="Primary">
          <a href="/" className={`nav-link${pathname === '/' ? ' nav-link-active' : ''}`}>Home</a>
          <a href="/providers" className={`nav-link${pathname === '/providers' ? ' nav-link-active' : ''}`}>Providers</a>
          <a href="/help" className={`nav-link${pathname === '/help' ? ' nav-link-active' : ''}`}>Help</a>
        </nav>

        {/* === RIGHT: Theme toggle + Auth buttons === */}
        <div className="navbar-actions">
          <button
            type="button"
            className="navbar-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
          </button>

          <a href="/login" className="navbar-signin navbar-desktop-only">Sign In</a>
          <a href="/register" className="navbar-cta navbar-desktop-only">Create Account</a>

          {/* Hamburger — mobile only */}
          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
        </div>

      </div>

      {/* === MOBILE DRAWER === */}
      {menuOpen && (
        <div className="navbar-overlay" onClick={closeMenu} aria-hidden="true" />
      )}
      <div className={`navbar-drawer${menuOpen ? ' navbar-drawer--open' : ''}`} role="dialog" aria-modal="true">
        <div className="navbar-drawer-header">
          <span className="navbar-brand-name">Telehealth</span>
          <button className="navbar-drawer-close" onClick={closeMenu} aria-label="Close menu">✕</button>
        </div>
        <nav className="navbar-drawer-links" aria-label="Mobile navigation">
          <a href="/" className={`navbar-drawer-link${pathname === '/' ? ' navbar-drawer-link--active' : ''}`} onClick={closeMenu}>Home</a>
          <a href="/providers" className={`navbar-drawer-link${pathname === '/providers' ? ' navbar-drawer-link--active' : ''}`} onClick={closeMenu}>Providers</a>
          <a href="/help" className={`navbar-drawer-link${pathname === '/help' ? ' navbar-drawer-link--active' : ''}`} onClick={closeMenu}>Help</a>
        </nav>
        <div className="navbar-drawer-actions">
          <a href="/login" className="navbar-drawer-signin" onClick={closeMenu}>Sign In</a>
          <a href="/register" className="navbar-drawer-cta" onClick={closeMenu}>Create Account</a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;