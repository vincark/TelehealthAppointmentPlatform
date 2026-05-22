import './WhyChooseUs.css';
import { Zap, ShieldCheck, MessageCircle, MessageSquareQuote } from 'lucide-react';

/**
 * "Why patients trust us" — combined value props + future reviews placeholder.
 * 
 * Top: 3 feature cards (same .map() pattern).
 * Bottom: a "reviews coming soon" message that we'll later
 *         replace with real testimonials from the database.
 */

// Reasons to choose us — these are real, honest value propositions
const REASONS = [
  {
    id: 1,
    icon: Zap,
    title: 'Same-day bookings',
    description:
      'Skip the weeks-long waitlist. Most appointments available within 24 hours, often the same day.',
  },
  {
    id: 2,
    icon: ShieldCheck,
    title: 'Private & secure',
    description:
      'End-to-end encrypted video. HIPAA-compliant infrastructure. Your data, your control.',
  },
  {
    id: 3,
    icon: MessageCircle,
    title: 'Real care, anytime',
    description:
      'Board-certified doctors available around the clock — including nights and weekends.',
  },
];

// Real testimonials would live here. For now: empty array.
// When we connect to the database, this becomes a fetch() result.
const TESTIMONIALS = [];

function WhyChooseUs() {
  return (
    <section className="why" aria-labelledby="why-title">
      <div className="why-inner">

        {/* Header */}
        <div className="why-header">
          <h2 id="why-title" className="why-title">
            Why patients trust us
          </h2>
          <p className="why-lede">
            Real benefits today. Real reviews coming as we grow.
          </p>
        </div>

        {/* Top: 3 reason cards */}
        <ul className="why-grid" role="list">
          {REASONS.map((reason) => {
            const Icon = reason.icon;
            return (
              <li key={reason.id} className="why-card">
                <div className="why-icon" aria-hidden="true">
                  <Icon size={24} strokeWidth={2} />
                </div>
                <h3 className="why-card-title">{reason.title}</h3>
                <p className="why-card-description">{reason.description}</p>
              </li>
            );
          })}
        </ul>

        {/* Bottom: testimonials area — empty for now, real when we have them */}
        {TESTIMONIALS.length === 0 ? (
          <div className="why-empty" role="status">
            <MessageSquareQuote size={28} aria-hidden="true" />
            <div>
              <p className="why-empty-title">Patient reviews coming soon</p>
              <p className="why-empty-text">
                We're new — but our care isn't. Be among our first patients
                and your story may live here.
              </p>
            </div>
          </div>
        ) : (
          <ul className="why-testimonials" role="list">
            {/* When real testimonials exist, they'll render here */}
            {TESTIMONIALS.map((t) => (
              <li key={t.id} className="testimonial-card">
                <p className="testimonial-quote">"{t.quote}"</p>
                <p className="testimonial-name">— {t.name}</p>
              </li>
            ))}
          </ul>
        )}

      </div>
    </section>
  );
}

export default WhyChooseUs;