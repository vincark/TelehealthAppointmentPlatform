import './Hero.css';
import { ArrowRight, ShieldCheck, Clock, Video } from 'lucide-react';

/**
 * Hero section — the big intro on the homepage.
 *
 * Structure:
 *   - Pill ("Virtual care available 24/7")
 *   - Big headline (with one green italic phrase)
 *   - Description paragraph
 *   - Two buttons (primary + secondary)
 *   - Trust badges row
 */
function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-inner">

        {/* Left side — text content */}
        <div className="hero-content">

          {/* Top pill */}
          <div className="hero-pill">
            <span className="hero-pill-dot" aria-hidden="true" />
            <span>Virtual care available 24/7</span>
          </div>

          {/* The giant headline */}
          <h1 id="hero-title" className="hero-title">
            Healthcare that{' '}
            <span className="hero-title-accent">comes to you</span>
          </h1>

          {/* Description */}
          <p className="hero-lede">
            Connect with board-certified physicians from the comfort of your home.
            Compassionate, expert virtual care — when you need it most.
          </p>

          {/* Buttons */}
          <div className="hero-actions">
            <a href="/login" className="btn btn-primary">
              Book a Consultation
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href="/providers" className="btn btn-secondary">
              Browse Providers
            </a>
          </div>

          {/* Trust badges */}
          <ul className="hero-badges" aria-label="Trust badges">
            <li className="hero-badge">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>HIPAA Compliant</span>
            </li>
            <li className="hero-badge">
              <Clock size={18} aria-hidden="true" />
              <span>Same-Day Slots</span>
            </li>
            <li className="hero-badge">
              <Video size={18} aria-hidden="true" />
              <span>HD Video Calls</span>
            </li>
          </ul>

        </div>

        {/* Right side — visual (we'll improve this later) */}
        {/* Right side — visual */}
<div className="hero-visual">
  <img
    src="/hero.jpg"
    alt="Patient using a tablet for a virtual consultation at home"
    className="hero-image"
  />
</div>

      </div>
    </section>
  );
}

export default Hero;