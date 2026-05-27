import { useState, useEffect } from 'react';
import './WhyChooseUs.css';
import { Zap, ShieldCheck, MessageCircle, MessageSquareQuote } from 'lucide-react';

const REASONS = [
  {
    id: 1,
    icon: Zap,
    title: 'Same-day bookings',
    description: 'Skip the weeks-long waitlist. Most appointments available within 24 hours, often the same day.',
  },
  {
    id: 2,
    icon: ShieldCheck,
    title: 'Private & secure',
    description: 'End-to-end encrypted video. HIPAA-compliant infrastructure. Your data, your control.',
  },
  {
    id: 3,
    icon: MessageCircle,
    title: 'Real care, anytime',
    description: 'Board-certified doctors available around the clock — including nights and weekends.',
  },
];

const STARS = ['', '★', '★★', '★★★', '★★★★', '★★★★★'];

function WhyChooseUs() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch('/api/ratings/public')
      .then(r => r.json())
      .then(data => setReviews(data.reviews || []))
      .catch(() => {});
  }, []);

  return (
    <section className="why" aria-labelledby="why-title">
      <div className="why-inner">

        <div className="why-header">
          <h2 id="why-title" className="why-title">Why patients trust us</h2>
          <p className="why-lede">Real benefits. Real reviews from real patients.</p>
        </div>

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

        {reviews.length === 0 ? (
          <div className="why-empty" role="status">
            <MessageSquareQuote size={28} aria-hidden="true" />
            <div>
              <p className="why-empty-title">Patient reviews coming soon</p>
              <p className="why-empty-text">
                Be among our first patients and your story may live here.
              </p>
            </div>
          </div>
        ) : (
          <ul className="why-testimonials" role="list">
            {reviews.map((r, i) => (
              <li key={i} className="testimonial-card">
                <p className="testimonial-stars">{STARS[r.rating]}</p>
                <p className="testimonial-quote">"{r.comment}"</p>
                <p className="testimonial-name">— {r.first_name} {r.last_name[0]}., about Dr {r.provider_last_name}</p>
              </li>
            ))}
          </ul>
        )}

      </div>
    </section>
  );
}

export default WhyChooseUs;
