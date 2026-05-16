import './Steps.css';
import { Search, CalendarCheck, Video, FileCheck } from 'lucide-react';

/**
 * "Care in four simple steps" — describes the user journey.
 * Same pattern as Specialties: array of data + .map() to render.
 */

const STEPS = [
  {
    id: 1,
    label: 'STEP 1',
    title: 'Find Your Provider',
    description:
      'Browse our curated network of specialists and find the perfect match for your needs.',
    icon: Search,
  },
  {
    id: 2,
    label: 'STEP 2',
    title: 'Schedule Instantly',
    description:
      'Pick a time that works for you with real-time availability. No phone calls needed.',
    icon: CalendarCheck,
  },
  {
    id: 3,
    label: 'STEP 3',
    title: 'Meet Virtually',
    description:
      'Connect face-to-face with your provider via secure, HD video consultation.',
    icon: Video,
  },
  {
    id: 4,
    label: 'STEP 4',
    title: 'Get Your Care Plan',
    description:
      'Receive prescriptions, referrals, and a personalized care plan — all digitally.',
    icon: FileCheck,
  },
];

function Steps() {
  return (
    <section className="steps" aria-labelledby="steps-title">
      <div className="steps-inner">

        {/* Header */}
        <div className="steps-header">
          <h2 id="steps-title" className="steps-title">
            Care in four simple steps
          </h2>
          <p className="steps-lede">
            We've streamlined the healthcare experience so you can focus on what
            matters — feeling better.
          </p>
        </div>

        {/* Grid of step cards */}
        <ul className="steps-grid" role="list">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.id} className="step-card">
                <div className="step-top">
                  <div className="step-icon" aria-hidden="true">
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <span className="step-label">{step.label}</span>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </li>
            );
          })}
        </ul>

      </div>
    </section>
  );
}

export default Steps;