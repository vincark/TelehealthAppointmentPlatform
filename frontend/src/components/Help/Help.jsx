import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Help.css';

const SECTIONS = {
  patient: [
    {
      title: 'Register a New Account',
      content: (
        <>
          <ol className="help-list">
            <li>Click <strong>Get Started</strong> or <strong>Create Account</strong> on the home page.</li>
            <li>Enter your <strong>email address</strong> and create a <strong>password</strong> (min. 8 characters with uppercase, lowercase, number, and special character).</li>
            <li>Click <strong>Create Account</strong> — you will be taken to your <strong>Health Profile</strong> to fill in the rest of your details.</li>
          </ol>
          <div className="help-tip">
            <strong>Tip:</strong> You can also sign in instantly using your <strong>Google account</strong> — click <em>Continue with Google</em> on the login page.
          </div>
        </>
      ),
      
    },
    {
      title: 'Log In',
      content: (
        <ol className="help-list">
          <li>Click <strong>Sign In</strong> in the navigation bar.</li>
          <li>Enter your registered email address and password.</li>
          <li>Click <strong>Sign In</strong> — you will land on your Overview dashboard.</li>
        </ol>
      ),
    },
    {
      title: 'Book an Appointment',
      content: (
        <>
          <ol className="help-list">
            <li>From the sidebar, click <strong>Appointments</strong> then <strong>Book Appointment</strong>.</li>
            <li>Browse the list of available doctors — you can see their specialisation, degree, and fee.</li>
            <li>Click <strong>Select</strong> on your preferred doctor.</li>
            <li>A timetable appears with slots grouped by Morning, Daytime, and Evening.</li>
            <li>Click an available slot (shown in green).</li>
            <li>Review the booking summary — including any after-hours surcharge.</li>
            <li>Click <strong>Confirm Booking</strong> to proceed to payment.</li>
          </ol>
          <div className="help-tip">
            <strong>Note:</strong> Evening appointments carry a 20% after-hours surcharge, shown clearly before you confirm.
          </div>
        </>
      ),
    },
    {
      title: 'Complete Payment',
      content: (
        <ol className="help-list">
          <li>After confirming your booking, the payment screen opens automatically.</li>
          <li>Enter your card number, expiry date, and CVC.</li>
          <li>Click <strong>Pay Now</strong>.</li>
          <li>On success, your appointment is confirmed and you will receive a confirmation email.</li>
        </ol>
      ),
    },
    {
      title: 'Reschedule or Cancel an Appointment',
      content: (
        <>
          <ol className="help-list">
            <li>Go to the <strong>Appointments</strong> tab in the sidebar.</li>
            <li>Find your upcoming appointment and click <strong>Reschedule</strong> (amber button).</li>
            <li>Pick a new time slot from the timetable.</li>
            <li>Your request is sent to the doctor — your appointment shows as <strong>Pending Reschedule</strong> until they respond.</li>
            <li>If the doctor <strong>approves</strong>, your appointment moves to the new time and you are notified.</li>
            <li>If the doctor <strong>declines</strong>, your original appointment remains confirmed and you are notified.</li>
          </ol>
          <div className="help-tip">
            <strong>Important:</strong> You can only reschedule within the same pricing tier. Daytime bookings can only move to other daytime slots. After-hours bookings (evening, before 8am, weekends) can move to any other after-hours slot.
          </div>
        </>
      ),
    },
    {
      title: 'Rate Your Doctor',
      content: (
        <>
          <ol className="help-list">
            <li>Go to <strong>Appointments</strong> and find a completed appointment.</li>
            <li>Click the <strong>Rate</strong> button (star icon).</li>
            <li>Select 1–5 stars and optionally write a review (max 300 characters).</li>
            <li>Click <strong>Submit Rating</strong>.</li>
          </ol>
          <div className="help-tip">
            The Rate button only appears after your doctor marks the appointment as Completed. Your written review may appear on our public home page.
          </div>
        </>
      ),
    },
    {
      title: 'Health Profile',
      content: (
        <p className="help-para">
          The <strong>Health Profile</strong> tab lets you store your medical details — blood type, allergies, current medications, chronic conditions, and emergency contact. Click <strong>Edit</strong> on any section to update, then <strong>Save</strong>.
        </p>
      ),
    },
    {
      title: 'Medical History',
      content: (
        <p className="help-para">
          The <strong>Medical History</strong> tab shows a read-only log of all past consultations, including consultation notes and prescriptions added by your doctors.
        </p>
      ),
    },
  ],

  doctor: [
    {
      title: 'Log In',
      content: (
        <ol className="help-list">
          <li>Navigate to the platform and click <strong>Sign In</strong>.</li>
          <li>Enter your doctor email and password.</li>
          <li>You will be taken to your doctor dashboard.</li>
        </ol>
      ),
    },
    {
      title: 'Set Up Your Profile & Availability',
      content: (
        <>
          <ol className="help-list">
            <li>Go to the <strong>My Profile</strong> tab.</li>
            <li>Update your specialisation, degree, consultation fee, and photo.</li>
            <li>Scroll to the <strong>Availability</strong> section.</li>
            <li>Select the days and time ranges you are available.</li>
            <li>Use <strong>Bulk Generate</strong> to create multiple slots across a date range at once.</li>
            <li>Click <strong>Save Availability</strong>.</li>
          </ol>
          <div className="help-tip">
            <strong>Important:</strong> Patients can only see and book slots that you have marked as available.
          </div>
        </>
      ),
    },
    {
      title: 'Manage Appointments',
      content: (
        <>
          <p className="help-para">Go to the <strong>Appointments</strong> tab to see all bookings.</p>
          <table className="help-table">
            <thead><tr><th>Status</th><th>Meaning</th></tr></thead>
            <tbody>
              <tr><td>Pending</td><td>Patient has booked — awaiting your confirmation (Accept or Decline)</td></tr>
              <tr><td>Confirmed</td><td>Payment received and appointment confirmed</td></tr>
              <tr><td>Reschedule Requested</td><td>Patient has requested to move to a new time slot — awaiting your decision</td></tr>
              <tr><td>Completed</td><td>Consultation has taken place</td></tr>
              <tr><td>Cancelled</td><td>Appointment was cancelled</td></tr>
            </tbody>
          </table>
          <p className="help-para" style={{ marginTop: '0.75rem' }}>
            Click on an appointment to add <strong>Consultation Notes</strong> or a <strong>Prescription</strong>, then save.
          </p>
        </>
      ),
    },
    {
      title: 'Handling Reschedule Requests',
      content: (
        <>
          <p className="help-para">When a patient requests to reschedule, a new <strong>Reschedule Requests — Action Required</strong> section appears at the top of your Appointments tab.</p>
          <ol className="help-list">
            <li>Each request shows the <strong>original time</strong> and the patient's <strong>requested new time</strong> side by side.</li>
            <li>Click <strong>Approve</strong> to move the appointment to the new slot — the patient is notified automatically.</li>
            <li>Click <strong>Decline</strong> to keep the original time — the patient is notified that their original appointment remains.</li>
          </ol>
          <div className="help-tip">
            <strong>Note:</strong> Patients can only request a reschedule within the same pricing tier — they cannot switch from a daytime slot to an evening slot or vice versa. This protects the agreed fee.
          </div>
        </>
      ),
    },
    {
      title: 'Dashboard Overview',
      content: (
        <p className="help-para">
          The <strong>Dashboard</strong> tab shows a quick summary: today's patients, pending actions, total completed consultations, and appointments in the next 7 days.
        </p>
      ),
    },
  ],

  admin: [
    {
      title: 'Log In',
      content: (
        <ol className="help-list">
          <li>Navigate to the platform and go to the Admin login page.</li>
          <li>Enter your administrator email and password.</li>
          <li>Admin accounts are configured by the system administrator.</li>
        </ol>
      ),
    },
    {
      title: 'Overview Dashboard',
      content: (
        <p className="help-para">
          The <strong>Overview</strong> tab shows real-time platform stats: total registered users, appointment counts by status (Pending, Confirmed, Completed, Cancelled), and recent activity.
        </p>
      ),
    },
    {
      title: 'Manage Users',
      content: (
        <>
          <p className="help-para">The <strong>Users</strong> tab lists all registered patients and providers.</p>
          <ol className="help-list">
            <li>Filter by role (Patient or Provider) using the filter options.</li>
            <li>Click <strong>Deactivate</strong> to suspend a user's access.</li>
            <li>Click <strong>Activate</strong> to restore a suspended account.</li>
          </ol>
          <div className="help-tip">
            Deactivating a user prevents login but does not delete their data.
          </div>
        </>
      ),
    },
    {
      title: 'Generate Reports',
      content: (
        <>
          <p className="help-para">Go to the <strong>Reports</strong> tab, select a report type, and click <strong>Generate Report</strong>.</p>
          <table className="help-table">
            <thead><tr><th>Report</th><th>Contents</th></tr></thead>
            <tbody>
              <tr><td>Appointments</td><td>All appointments with status, dates, patients, and providers</td></tr>
              <tr><td>Users</td><td>User counts broken down by role</td></tr>
              <tr><td>Provider Performance</td><td>Each provider's total, completed, and cancelled appointments</td></tr>
            </tbody>
          </table>
        </>
      ),
    },
  ],
};

const PORTAL_META = {
  patient: { label: 'Patient',       subtitle: 'Everything you need to book and manage your healthcare online.' },
  doctor:  { label: 'Doctor',        subtitle: 'Manage your availability, appointments, notes, and profile.' },
  admin:   { label: 'Administrator', subtitle: 'Manage users, view appointments, and generate reports.' },
};

const FAQS = [
  { q: 'Can I use the platform on my phone?', a: 'Yes. The platform is fully responsive and works on mobile phones, tablets, and desktop computers.' },
  { q: 'Is my payment information secure?', a: 'Yes. All payments are processed through Stripe (PCI-DSS compliant). Your card details are never stored on our servers.' },
  { q: "Why can't I rate my doctor yet?", a: 'Ratings are only available after the doctor marks your appointment as Completed. Once that status is set, the Rate button will appear.' },
  { q: 'What is the after-hours surcharge?', a: 'A 20% surcharge is automatically added for evening appointments. This is shown clearly in the booking summary before you confirm.' },
  { q: 'Can I reschedule to a different time of day?', a: 'You can reschedule as long as the new slot has the same rate as your original booking. If you paid the after-hours rate (evening, early morning, or weekend), you can move to any other after-hours slot. If you paid the standard daytime rate, you can only reschedule to another daytime slot. You cannot switch between rate tiers.' },
  { q: 'Can I sign in with Google?', a: 'Yes. Patients can register and log in using their Google account by clicking Continue with Google on the login page.' },
  { q: "I can't log in — what should I do?", a: 'Check that you are using the correct portal (Patient / Doctor / Admin). If the problem persists, contact the platform administrator.' },
  { q: 'Will my review appear on the home page?', a: 'If you leave a written comment with your star rating, it may appear in the Patient Reviews section of the home page.' },
];

function AccordionItem({ title, content }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`help-accordion-item${open ? ' help-accordion-item--open' : ''}`}>
      <button className="help-accordion-btn" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{title}</span>
        <svg className="help-accordion-chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <div className="help-accordion-body">{content}</div>}
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`help-faq-item${open ? ' help-faq-item--open' : ''}`}>
      <button className="help-faq-btn" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{q}</span>
        <svg className="help-accordion-chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <p className="help-faq-answer">{a}</p>}
    </div>
  );
}

function Help() {
  const [searchParams] = useSearchParams();
  const portalParam = searchParams.get('portal');
  const portal = ['doctor', 'admin'].includes(portalParam) ? portalParam : 'patient';
  const meta = PORTAL_META[portal];

  const backLink = portal === 'doctor' ? '/doctor-portal' : portal === 'admin' ? '/admin-portal' : null;

  return (
    <div className="help-page">

      {backLink && (
        <div className="help-portal-topbar">
          <a href={backLink} className="help-back-link">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to {meta.label} Portal
          </a>
        </div>
      )}

      <div className="help-hero">
        <div className="help-hero-inner">
          <p className="help-hero-badge">{meta.label} Guide</p>
          <h1 className="help-hero-title">How can we help you?</h1>
          <p className="help-hero-sub">{meta.subtitle}</p>
        </div>
      </div>

      <div className="help-body">

        <section className="help-guide">
          <h2 className="help-section-heading">{meta.label} Portal — Step-by-Step Guide</h2>
          <div className="help-accordion">
            {SECTIONS[portal].map((s, i) => (
              <AccordionItem key={i} title={s.title} content={s.content} />
            ))}
          </div>
        </section>

        {portal === 'patient' && (
          <section className="help-faq-section">
            <h2 className="help-section-heading">Frequently Asked Questions</h2>
            <div className="help-faq-list">
              {FAQS.map((f, i) => (
                <FaqItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </section>
        )}

        {portal !== 'admin' && <section className="help-contact">
          <div className="help-contact-inner">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <div>
              <h3 className="help-contact-title">Still need help?</h3>
              <p className="help-contact-text">Contact our support team for technical support or account issues.</p>
              <div className="help-contact-channels">
                <a href="tel:1800123456" className="help-contact-link">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  1800 123 456
                </a>
                <span className="help-contact-hours">Mon – Fri, 9am – 5pm AEST</span>
              </div>
            </div>
          </div>
        </section>}

      </div>
    </div>
  );
}

export default Help;
