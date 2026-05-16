import './Specialties.css';
import {
  Stethoscope,
  Smile,
  Brain,
  Heart,
  Baby,
  Activity,
  Zap,
  Bone,
} from 'lucide-react';

/**
 * Specialties section — 8 colorful icon cards.
 *
 * The data lives in an array. We then render it with .map(),
 * so adding/removing/editing a specialty is a one-line change.
 */

// Data: each specialty has a name, an icon component, and a color
const SPECIALTIES = [
  { name: 'General Practice', icon: Stethoscope, color: 'mint' },
  { name: 'Dermatology',      icon: Smile,       color: 'yellow' },
  { name: 'Psychiatry',       icon: Brain,       color: 'lavender' },
  { name: 'Cardiology',       icon: Heart,       color: 'rose' },
  { name: 'Pediatrics',       icon: Baby,        color: 'mint' },
  { name: 'Endocrinology',    icon: Activity,    color: 'peach' },
  { name: 'Neurology',        icon: Zap,         color: 'mint' },
  { name: 'Orthopedics',      icon: Bone,        color: 'grey' },
];

function Specialties() {
  return (
    <section className="specialties" aria-labelledby="specialties-title">
      <div className="specialties-inner">

        {/* Heading */}
        <div className="specialties-header">
          <h2 id="specialties-title" className="specialties-title">
            Every specialty, one click away
          </h2>
          <p className="specialties-lede">
            Access expert physicians across a range of medical disciplines,
            all from the comfort of your home.
          </p>
        </div>

        {/* The grid — generated from SPECIALTIES array */}
        <ul className="specialties-grid" role="list">
          {SPECIALTIES.map((specialty) => {
            // Pull the icon component out so we can use it as <Icon />
            const Icon = specialty.icon;

            return (
              <li key={specialty.name} className="specialty-card">
                <div className={`specialty-icon specialty-icon-${specialty.color}`}>
                  <Icon size={28} aria-hidden="true" strokeWidth={1.75} />
                </div>
                <span className="specialty-name">{specialty.name}</span>
              </li>
            );
          })}
        </ul>

      </div>
    </section>
  );
}

export default Specialties;