import './Footer.css';
import { Mail, Phone, MapPin } from 'lucide-react';

/**
 * Site footer — 4 columns on desktop, stacks on mobile.
 *  - Brand + tagline
 *  - Quick Links
 *  - Services
 *  - Contact
 */

const QUICK_LINKS = [
  { label: 'Find Providers', href: '/providers' },
  { label: 'Book Appointment', href: '/book' },
  
];

const SERVICES = [
  { label: 'General Practice', href: '/specialty/general' },
  { label: 'Dermatology', href: '/specialty/dermatology' },
  { label: 'Psychiatry', href: '/specialty/psychiatry' },
  { label: 'Cardiology', href: '/specialty/cardiology' },
  { label: 'Pediatrics', href: '/specialty/pediatrics' },
];

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">

        {/* === COLUMN 1: Brand === */}
        <div className="footer-brand">
          <a href="/" className="footer-logo-row">
            <span className="footer-logo" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </span>
            <span className="footer-brand-name">Telehealth</span>
          </a>
          <p className="footer-tagline">
            Transforming healthcare through compassionate virtual consultations.
            Your well-being, reimagined.
          </p>
        </div>

        {/* === COLUMN 2: Quick Links === */}
        <nav className="footer-col" aria-label="Quick links">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-list">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* === COLUMN 3: Services === */}
        <nav className="footer-col" aria-label="Services">
          <h3 className="footer-heading">Services</h3>
          <ul className="footer-list">
            {SERVICES.map((service) => (
              <li key={service.label}>
                <a href={service.href}>{service.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* === COLUMN 4: Contact === */}
        <div className="footer-col">
          <h3 className="footer-heading">Contact</h3>
          <ul className="footer-list footer-contact">
            <li>
              <Mail size={16} aria-hidden="true" />
              <a href="mailto:care@telehealth.com">care@telehealth.com</a>
            </li>
            <li>
              <Phone size={16} aria-hidden="true" />
              <a href="tel:1800TELE">1-800-TELE-HEALTH</a>
            </li>
            <li>
              <MapPin size={16} aria-hidden="true" />
              <span>Available Australia-wide</span>
            </li>
          </ul>
        </div>

      </div>

      {/* === BOTTOM BAR === */}
      <div className="footer-bottom">
        <p className="footer-copy">
          © {currentYear} Telehealth. All rights reserved.
        </p>
        <ul className="footer-legal">
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/hipaa">HIPAA Notice</a></li>
        </ul>
      </div>

    </footer>
  );
}

export default Footer;