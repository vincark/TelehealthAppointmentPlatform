import { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './PatientPortal.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ── Sydney timezone helpers ──
function sydParts(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr); if (isNaN(d)) return null;
  const p = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(d);
  return Object.fromEntries(p.map(x => [x.type, x.value]));
}
function sydHour(isoStr) {
  const p = sydParts(isoStr); return p ? parseInt(p.hour, 10) : 0;
}
function sydDow(isoStr) {
  const p = sydParts(isoStr); if (!p) return 0;
  return new Date(Date.UTC(parseInt(p.year), parseInt(p.month) - 1, parseInt(p.day), 12)).getUTCDay();
}

function getRateType(isoStr) {
  if (!isoStr) return null;
  const h = sydHour(isoStr);
  const dow = sydDow(isoStr);
  if (dow === 0 || dow === 6) return 'after';
  return (h >= 8 && h < 18) ? 'business' : 'after';
}

function formatRelativeTime(dateStr) {
  const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const apptDate = new Date(d); apptDate.setHours(0, 0, 0, 0);
  if (apptDate.getTime() === today.getTime()) return 'Today';
  if (apptDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime12(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${period}`;
}

// ── Icons ──
const IconBell = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconHeart = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="#DC2626">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconCheckCircle = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconXCircle = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IconPulse = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconGrid = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconClipboard = () => (
  <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
  </svg>
);
const IconHistory = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconSave = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// ── Top navigation ──
const IconMenu = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

function PatientNav({ patient, notifications, onMarkAllRead, onMenuClick }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const unread = notifications.filter(n => !n.read).length;
  const initials = `${patient?.firstName?.[0] ?? ''}${patient?.lastName?.[0] ?? ''}`.toUpperCase() || 'P';

  useEffect(() => {
    function handleOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return (
    <nav className="pp-nav">
      <div className="pp-nav-inner">
        <div className="pp-nav-left">
          <button className="pp-hamburger" onClick={onMenuClick} aria-label="Open menu">
            <IconMenu />
          </button>
          <a href="/" className="pp-nav-brand">
            <span className="pp-nav-logo-circle" aria-hidden="true"><IconHeart /></span>
            <span className="pp-nav-wordmark">Telehealth</span>
          </a>
        </div>
        <div className="pp-nav-actions">
          <span className="pp-nav-welcome">Welcome back, {patient?.firstName ?? '…'}</span>

          <div className="pp-notif-wrap" ref={notifRef}>
            <button
              className="pp-nav-bell"
              onClick={() => setNotifOpen(v => !v)}
              aria-label={`Notifications${unread ? ` — ${unread} unread` : ''}`}
            >
              <IconBell />
              {unread > 0 && <span className="pp-notif-badge">{unread}</span>}
            </button>

            {notifOpen && (
              <div className="pp-notif-dropdown">
                <div className="pp-notif-header">
                  <span>Notifications</span>
                  {unread > 0 && (
                    <button className="pp-notif-mark-read" onClick={() => { onMarkAllRead(); setNotifOpen(false); }}>
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="pp-notif-empty">No notifications</p>
                ) : notifications.map(n => (
                  <div key={n.id} className={`pp-notif-item${n.read ? '' : ' pp-notif-item--unread'}`}>
                    {!n.read && <span className="pp-notif-dot" aria-hidden="true" />}
                    <div>
                      <p className="pp-notif-text">{n.text}</p>
                      <p className="pp-notif-time">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pp-nav-avatar" aria-label="User initials">{initials}</div>
          <button className="pp-nav-logout" onClick={logout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

// ── Sidebar ──
function Sidebar({ activeTab, onTabChange, patient, isOpen, onClose }) {
  const initials = `${patient?.firstName?.[0] ?? ''}${patient?.lastName?.[0] ?? ''}`.toUpperCase() || 'P';

  const navItems = [
    { key: 'overview',      label: 'Overview',        icon: <IconGrid /> },
    { key: 'appointments',  label: 'Appointments',    icon: <IconCalendar /> },
    { key: 'profile',       label: 'Health Profile',  icon: <IconUser /> },
    { key: 'history',       label: 'Medical History', icon: <IconHistory /> },
  ];

  return (
    <>
      {isOpen && <div className="pp-sidebar-overlay" onClick={onClose} aria-hidden="true" />}
      <aside className={`pp-sidebar${isOpen ? ' pp-sidebar--open' : ''}`}>
        <button className="pp-sidebar-close" onClick={onClose} aria-label="Close menu">✕</button>
        <div className="pp-sidebar-user">
          <div className="pp-sidebar-avatar">{initials}</div>
          <p className="pp-sidebar-name">{patient?.firstName} {patient?.lastName}</p>
          <p className="pp-sidebar-email">{patient?.email}</p>
        </div>

        <nav className="pp-sidebar-nav" aria-label="Patient portal sections">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`pp-sidebar-item${activeTab === item.key ? ' pp-sidebar-item--active' : ''}`}
              onClick={() => { onTabChange(item.key); onClose(); }}
            >
              <span className="pp-sidebar-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pp-sidebar-footer">
          <button
            className="pp-sidebar-signout"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
          >
            <IconLogout />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Payment Form (must be inside Elements provider) ──
function PaymentForm({ appointment, onSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState('');
  const [paid, setPaid] = useState(false);
  const token = localStorage.getItem('token');

  async function handlePay(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setPayError('');
    try {
      const res = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appointment_id: appointment.id }),
      });
      const data = await res.json();
      if (!res.ok) { setPayError(data.message || 'Payment setup failed.'); setProcessing(false); return; }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (stripeError) { setPayError(stripeError.message); setProcessing(false); return; }

      await fetch('/api/payments/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appointment_id: appointment.id, payment_intent_id: paymentIntent.id }),
      });
      setPaid(true);
      setTimeout(() => { onSuccess(); onClose(); }, 2000);
    } catch {
      setPayError('Payment failed. Please try again.');
      setProcessing(false);
    }
  }

  if (paid) {
    return (
      <div className="pp-payment-done">
        <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="#10b981" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <p>Payment successful! Your appointment is confirmed.</p>
      </div>
    );
  }

  return (
    <div className="pp-payment-section">
      <div className="pp-payment-summary">
        <div className="pp-payment-row">
          <span>Doctor</span><span>{appointment.doctor}</span>
        </div>
        <div className="pp-payment-row">
          <span>Date &amp; Time</span>
          <span>{formatDate(appointment.date)} · {formatTime12(appointment.time)}</span>
        </div>
        <div className="pp-payment-row pp-payment-row--total">
          <span>Amount due</span>
          <span className="pp-payment-value">${appointment.fee} AUD</span>
        </div>
      </div>
      <form onSubmit={handlePay}>
        <label className="pp-payment-card-label">Card Details</label>
        <div className="pp-card-element-wrap">
          <CardElement options={{ hidePostalCode: true, style: { base: { fontSize: '15px', color: '#1a1a2e', '::placeholder': { color: '#9ca3af' } } } }} />
        </div>
        {payError && <p className="pp-error-banner">{payError}</p>}
        <div className="pp-payment-actions">
          <button type="button" className="pp-btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
          <button type="submit" className="pp-btn-primary" disabled={processing || !stripe}>
            {processing ? <span className="pp-spinner" aria-hidden="true" /> : null}
            {processing ? 'Processing…' : `Pay $${appointment.fee}`}
          </button>
        </div>
      </form>
      <p className="pp-payment-secure">🔒 Secured by Stripe — your card details are never stored on our servers.</p>
    </div>
  );
}

// ── Payment Modal ──
function PaymentModal({ appointment, onSuccess, onClose }) {
  return (
    <div className="pp-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pp-modal" role="dialog" aria-modal="true">
        <div className="pp-modal-header">
          <h2 className="pp-modal-title">Complete Payment</h2>
          <button className="pp-modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <Elements stripe={stripePromise}>
          <PaymentForm appointment={appointment} onSuccess={onSuccess} onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
}

// ── Payment Step ──
function PaymentStep({ appointmentId, consultationFee, clientSecret, token, onSuccess, onBack }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  async function handlePay() {
    if (!stripe || !elements) return;
    setPaying(true);
    setError('');
    try {
      const result = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: { card: elements.getElement(CardElement) } }
      );
      if (result.error) { setError(result.error.message); return; }
      const res = await fetch('/api/payments/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          appointment_id: appointmentId,
          payment_intent_id: result.paymentIntent.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Payment confirmation failed.'); return; }
      onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="pp-confirm-section">
      <button className="pp-modal-back" onClick={onBack}>← Back</button>
      <div className="pp-confirm-summary">
        <div className="pp-confirm-row">
          <span className="pp-confirm-label">Amount due</span>
          <span className="pp-confirm-value" style={{ fontWeight: 700, color: '#16a34a' }}>
            ${(consultationFee / 100).toFixed(2)} AUD
          </span>
        </div>
      </div>
      <div className="pp-field" style={{ marginTop: '1rem' }}>
        <label>Card details</label>
        <div className="pp-card-element-wrap">
          <CardElement options={{
            hidePostalCode: true,
            style: { base: { fontSize: '16px', fontFamily: 'inherit' } }
          }} />
        </div>
        <p className="pp-payment-secure">
          🔒 Test mode — use card number <strong>4242 4242 4242 4242</strong>, any future expiry, any CVC
        </p>
      </div>
      {error && <p className="pp-error-banner">{error}</p>}
      <button className="pp-btn-primary pp-confirm-btn" onClick={handlePay} disabled={paying || !stripe}>
        {paying ? <span className="pp-spinner" aria-hidden="true" /> : null}
        {paying ? 'Processing payment…' : `Pay $${(consultationFee / 100).toFixed(2)} AUD`}
      </button>
    </div>
  );
}

// ── Booking Modal ──
function BookingModal({ onClose, onBooked, preselectedProviderId = null, rescheduleAppointmentId = null, originalTime = null }) {
  const [step, setStep] = useState('providers');
  const [appointmentId, setAppointmentId] = useState(null);
  const [consultationFee, setConsultationFee] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [slotFetchError, setSlotFetchError] = useState('');
  const token = localStorage.getItem('token');
  const autoSelectedRef = useRef(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/providers', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.providers) setProviders(data.providers); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!preselectedProviderId || providers.length === 0 || autoSelectedRef.current) return;
    const match = providers.find(p => String(p.user_id) === String(preselectedProviderId));
    if (!match) return;
    autoSelectedRef.current = true;
    setSelectedProvider(match);
    setSlots([]);
    setSelectedSlot(null);
    setLoading(true);
    fetch(`/api/availability/provider/${match.user_id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(data => { setSlots(data?.slots ?? []); setSelectedDate(null); setSlotFetchError(''); })
      .catch(err => { setSlotFetchError(`Could not load slots (${err}). Is the server running?`); })
      .finally(() => { setLoading(false); setStep('slots'); });
  }, [providers]); // eslint-disable-line react-hooks/exhaustive-deps

  function selectProvider(provider) {
    setSelectedProvider(provider);
    setSlots([]);
    setSelectedSlot(null);
    setLoading(true);
    fetch(`/api/availability/provider/${provider.user_id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(data => { setSlots(data?.slots ?? []); setSelectedDate(null); setSlotFetchError(''); })
      .catch(err => { setSlotFetchError(`Could not load slots (${err}). Is the server running?`); })
      .finally(() => { setLoading(false); setStep('slots'); });
  }

  async function confirmBooking() {
    if (!selectedSlot || !reason.trim()) { setError('Please select a time slot and enter a reason for your visit.'); return; }
    if (booking) return;
    setBooking(true);
    setError('');
    try {
      // Reschedule flow
      if (rescheduleAppointmentId) {
        const res = await fetch(`/api/appointments/reschedule/${rescheduleAppointmentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ availability_id: selectedSlot.availability_id }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.message || 'Reschedule failed. Please try again.'); return; }
        onBooked();
        onClose();
        return;
      }

      // Booking flow
      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          provider_id: selectedProvider.user_id,
          availability_id: selectedSlot.availability_id,
          reason,
          notes: ''
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.message || 'Booking failed. Please try again.';
        setError(msg);
        // Slot was grabbed by someone else — go back and show fresh availability
        if (res.status === 400 && data.message?.toLowerCase().includes('already booked')) {
          setSelectedSlot(null);
          setStep('slots');
          setLoading(true);
          fetch(`/api/availability/provider/${selectedProvider.user_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.slots) setSlots(d.slots); })
            .catch(() => {})
            .finally(() => setLoading(false));
        }
        return;
      }

      // Booking successful — no payment yet, wait for doctor to confirm
      onBooked();
      onClose();

    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setBooking(false);
    }
  }

  function getSlotRate(slot) {
    const baseFee = parseFloat(selectedProvider?.base_fee ?? 75);
    const day = sydDow(slot.slot_start);
    const h   = sydHour(slot.slot_start);
    if (day === 0 || day === 6) return { rate: Math.round(baseFee * 1.2), type: 'after' };
    if (h >= 8 && h < 18)      return { rate: baseFee, type: 'business' };
    return { rate: Math.round(baseFee * 1.2), type: 'after' };
  }

  // Timetable helpers
  function slotLocalDate(slot) {
    const d = new Date(slot.slot_start);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function formatDateHeader(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  const lockedRateType = rescheduleAppointmentId ? getRateType(originalTime) : null;
  const slotRateType = s => {
    const h = sydHour(s.slot_start);
    const dow = sydDow(s.slot_start);
    if (dow === 0 || dow === 6) return 'after';
    return (h >= 8 && h < 18) ? 'business' : 'after';
  };

  const availableDates = [...new Set(slots.map(slotLocalDate))].sort();
  const currentDate    = selectedDate || availableDates[0] || null;
  const dateIdx        = currentDate ? availableDates.indexOf(currentDate) : 0;
  const allSlotsOnDate = currentDate ? slots.filter(s => slotLocalDate(s) === currentDate) : [];
  const slotsOnDate    = lockedRateType ? allSlotsOnDate.filter(s => slotRateType(s) === lockedRateType) : allSlotsOnDate;
  const morningSlots   = slotsOnDate.filter(s => sydHour(s.slot_start) < 8);
  const daytimeSlots   = slotsOnDate.filter(s => { const h = sydHour(s.slot_start); return h >= 8 && h < 18; });
  const eveningSlots   = slotsOnDate.filter(s => sydHour(s.slot_start) >= 18);

  const modalTitle = step === 'providers'
    ? 'Choose a Provider'
    : step === 'slots'
    ? `Dr. ${selectedProvider?.first_name} ${selectedProvider?.last_name} — Available Slots`
    : 'Confirm Your Booking';

  return (
    <div className="pp-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pp-modal" role="dialog" aria-modal="true" aria-label={modalTitle}>
        <div className="pp-modal-header">
          <h2 className="pp-modal-title">{modalTitle}</h2>
          <button className="pp-modal-close" onClick={onClose} aria-label="Close booking"><IconClose /></button>
        </div>

        {loading && (
          <div className="pp-modal-loading">
            <span className="pp-spinner pp-spinner--dark" aria-label="Loading" />
          </div>
        )}

        {!loading && step === 'providers' && (
          <div className="pp-provider-list">
            {providers.length === 0 ? (
              <p className="pp-empty-state">No providers available at this time</p>
            ) : providers.map(p => (
              <button key={p.user_id} className="pp-provider-card" onClick={() => selectProvider(p)}>
                <div className="pp-provider-avatar">
                  {p.first_name?.[0]}{p.last_name?.[0]}
                </div>
                <div className="pp-provider-info">
                  <p className="pp-provider-name">Dr. {p.first_name} {p.last_name}</p>
                  <p className="pp-provider-spec">{p.specialisation || 'General Practitioner'}</p>
                  {p.spoken_language?.length > 0 && (
                    <p className="pp-provider-lang">
                      Speaks: {Array.isArray(p.spoken_language) ? p.spoken_language.join(', ') : p.spoken_language}
                    </p>
                  )}
                </div>
                <IconChevronRight />
              </button>
            ))}
          </div>
        )}

        {!loading && step === 'slots' && (
          <div className="pp-timetable-wrap">
            <button className="pp-modal-back" onClick={() => { setStep('providers'); setSelectedProvider(null); }}>
              ← Back to providers
            </button>

            {slotFetchError ? (
              <p className="pp-error-banner">{slotFetchError}</p>
            ) : slots.length === 0 ? (
              <p className="pp-empty-state">No available slots for this provider right now. Ask them to set their availability in their portal.</p>
            ) : (
              <>
                {lockedRateType && (
                  <div className="pp-reschedule-notice">
                    <strong>Rate-locked reschedule:</strong> You originally booked a{' '}
                    <strong>{lockedRateType === 'business' ? 'business-hours' : 'after-hours'}</strong> slot.
                    Only {lockedRateType === 'business' ? 'business-hours (Mon–Fri 8am–6pm)' : 'after-hours / weekend'} slots are shown to keep your rate the same.
                  </div>
                )}
                <p className="pp-slot-total">{slots.length} slot{slots.length !== 1 ? 's' : ''} available across {availableDates.length} day{availableDates.length !== 1 ? 's' : ''}</p>
                {/* Date navigator */}
                <div className="pp-date-nav">
                  <button
                    className="pp-date-nav-btn"
                    onClick={() => setSelectedDate(availableDates[dateIdx - 1])}
                    disabled={dateIdx === 0}
                  >&#8249;</button>
                  <span className="pp-date-nav-label">
                    {currentDate ? formatDateHeader(currentDate) : ''}
                  </span>
                  <button
                    className="pp-date-nav-btn"
                    onClick={() => setSelectedDate(availableDates[dateIdx + 1])}
                    disabled={dateIdx === availableDates.length - 1}
                  >&#8250;</button>
                </div>

                {/* Legend + bulk bill */}
                <div className="pp-slot-legend-wrap">
                  <div className="pp-slot-legend">
                    <span className="pp-legend-item pp-legend-business">
                      <span className="pp-legend-dot" /> Business Hours (Mon–Fri 8am–6pm) ${parseFloat(selectedProvider?.base_fee ?? 75)}
                    </span>
                    <span className="pp-legend-item pp-legend-after">
                      <span className="pp-legend-dot" /> After Hours &amp; Weekends ${Math.round(parseFloat(selectedProvider?.base_fee ?? 75) * 1.2)}
                    </span>
                  </div>
                  <span className="pp-bulk-bill">✔ Bulk Bill Accepted</span>
                </div>

                {/* Morning */}
                {morningSlots.length > 0 && (
                  <div className="pp-timetable-section">
                    <div className="pp-timetable-section-hdr">
                      <span className="pp-timetable-icon">🌅</span> Morning
                    </div>
                    <div className="pp-timetable-grid">
                      {morningSlots.map(s => {
                        const { rate, type } = getSlotRate(s);
                        return (
                          <button key={s.availability_id}
                            className={`pp-time-slot pp-time-slot--${type}`}
                            onClick={() => { setSelectedSlot(s); setStep('confirm'); }}>
                            <span className="pp-slot-time-label">{formatTime12(new Date(s.slot_start).toTimeString().slice(0, 5))}</span>
                            <span className="pp-slot-rate">${rate}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Daytime */}
                {daytimeSlots.length > 0 && (
                  <div className="pp-timetable-section">
                    <div className="pp-timetable-section-hdr">
                      <span className="pp-timetable-icon">☀️</span> Daytime
                    </div>
                    <div className="pp-timetable-grid">
                      {daytimeSlots.map(s => {
                        const { rate, type } = getSlotRate(s);
                        return (
                          <button key={s.availability_id}
                            className={`pp-time-slot pp-time-slot--${type}`}
                            onClick={() => { setSelectedSlot(s); setStep('confirm'); }}>
                            <span className="pp-slot-time-label">{formatTime12(new Date(s.slot_start).toTimeString().slice(0, 5))}</span>
                            <span className="pp-slot-rate">${rate}</span>
                          </button>
                        );
                      })}
                                          </div>
                  </div>
                )}

                {/* Evening */}
                {eveningSlots.length > 0 && (
                  <div className="pp-timetable-section">
                    <div className="pp-timetable-section-hdr">
                      <span className="pp-timetable-icon">🌙</span> Evening
                    </div>
                    <div className="pp-timetable-grid">
                      {eveningSlots.map(s => {
                        const { rate, type } = getSlotRate(s);
                        return (
                          <button key={s.availability_id}
                            className={`pp-time-slot pp-time-slot--${type}`}
                            onClick={() => { setSelectedSlot(s); setStep('confirm'); }}>
                            <span className="pp-slot-time-label">{formatTime12(new Date(s.slot_start).toTimeString().slice(0, 5))}</span>
                            <span className="pp-slot-rate">${rate}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {slotsOnDate.length === 0 && (
                  <p className="pp-empty-state">No slots available on this day</p>
                )}
              </>
            )}
          </div>
        )}

        {!loading && step === 'confirm' && (
          <div className="pp-confirm-section">
            <button className="pp-modal-back" onClick={() => setStep('slots')}>
              ← Back to slots
            </button>
            <div className="pp-confirm-summary">
              <div className="pp-confirm-row">
                <span className="pp-confirm-label">Doctor</span>
                <span className="pp-confirm-value">Dr. {selectedProvider?.first_name} {selectedProvider?.last_name}</span>
              </div>
              <div className="pp-confirm-row">
                <span className="pp-confirm-label">Specialty</span>
                <span className="pp-confirm-value">{selectedProvider?.specialisation || 'General Practitioner'}</span>
              </div>
              <div className="pp-confirm-row">
                <span className="pp-confirm-label">Date &amp; Time</span>
                <span className="pp-confirm-value">
                  {formatDate(selectedSlot?.slot_start)} · {formatTime12(new Date(selectedSlot?.slot_start).toTimeString().slice(0, 5))}
                </span>
              </div>
              {selectedSlot && (() => {
                const { rate, type } = getSlotRate(selectedSlot);
                return (
                  <div className="pp-confirm-row">
                    <span className="pp-confirm-label">Consultation Fee</span>
                    <span className={`pp-confirm-value pp-confirm-fee pp-confirm-fee--${type}`}>
                      ${rate} <span className="pp-confirm-bulk">· Bulk Bill Accepted</span>
                    </span>
                  </div>
                );
              })()}
            </div>
            <div className="pp-field">
              <label htmlFor="pp-reason">Reason for visit <span aria-hidden="true">*</span></label>
              <textarea
                id="pp-reason"
                value={reason}
                onChange={e => { setReason(e.target.value); setError(''); }}
                placeholder="Briefly describe why you'd like to see this doctor…"
                rows={3}
              />
            </div>
            {error && <p className="pp-error-banner">{error}</p>}
            <button className="pp-btn-primary pp-confirm-btn" onClick={confirmBooking} disabled={booking}>
              {booking ? <span className="pp-spinner" aria-hidden="true" /> : null}
              {booking ? 'Booking…' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Overview tab ──
function OverviewTab({ patient, appointments, onBook, onViewAppointments }) {
  const today = new Date().toISOString().split('T')[0];

  const stats = [
    {
      label: 'Upcoming',
      value: appointments.filter(a => a.date >= today && (a.status === 'pending' || a.status === 'confirmed')).length,
      icon: <IconCalendar />, cls: 'pp-stat--green',
    },
    {
      label: 'Completed',
      value: appointments.filter(a => a.status === 'completed').length,
      icon: <IconCheckCircle />, cls: 'pp-stat--teal',
    },
    {
      label: 'Cancelled',
      value: appointments.filter(a => a.status === 'cancelled').length,
      icon: <IconXCircle />, cls: 'pp-stat--red',
    },
    {
      label: 'Total Visits',
      value: appointments.length,
      icon: <IconPulse />, cls: 'pp-stat--blue',
    },
  ];

  const nextAppt = appointments
    .filter(a => a.date >= today && (a.status === 'pending' || a.status === 'confirmed'))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];

  const recentActivity = [...appointments]
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 5);

  return (
    <div className="pp-overview">
      {/* Hero banner */}
      <div className="pp-hero">
        <div className="pp-hero-content">
          <div>
            <p className="pp-hero-eyebrow">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              Welcome back
            </p>
            <h1 className="pp-hero-title">{patient?.firstName} {patient?.lastName}</h1>
            <p className="pp-hero-sub">Your health, your journey — all in one place.</p>
          </div>
          <button className="pp-hero-btn" onClick={onBook}>
            <IconPlus />
            Book Consultation
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="pp-stats-row">
        {stats.map(s => (
          <div key={s.label} className={`pp-stat ${s.cls}`}>
            <span className="pp-stat-icon" aria-hidden="true">{s.icon}</span>
            <span className="pp-stat-value">{s.value}</span>
            <span className="pp-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Next appointment + recent activity */}
      <div className="pp-overview-cols">
        <div className="pp-card">
          <div className="pp-card-header">
            <h3 className="pp-section-title">Next Appointment</h3>
            <button className="pp-card-link" onClick={onViewAppointments}>View all →</button>
          </div>
          {!nextAppt ? (
            <div className="pp-no-appt">
              <p className="pp-empty-state">No upcoming appointments</p>
              <button className="pp-btn-outline" onClick={onBook}>
                <IconPlus /> Book a Consultation
              </button>
            </div>
          ) : (
            <div className="pp-next-appt">
              <div className="pp-next-icon" aria-hidden="true"><IconCalendar /></div>
              <div className="pp-next-info">
                <p className="pp-next-doctor">{nextAppt.doctor}</p>
                <div className="pp-next-meta">
                  <span>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {formatDate(nextAppt.date)}
                  </span>
                  <span>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {formatTime12(nextAppt.time)}
                  </span>
                </div>
              </div>
              <span className={`pp-status-pill ${nextAppt.status === 'confirmed' ? 'pp-pill--green' : 'pp-pill--yellow'}`}>
                {nextAppt.status === 'confirmed' ? 'Upcoming' : 'Pending'}
              </span>
            </div>
          )}
        </div>

        <div className="pp-card">
          <h3 className="pp-section-title">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="pp-empty-state">No appointment history yet</p>
          ) : (
            <div className="pp-activity-list">
              {recentActivity.map(a => (
                <div key={a.id} className="pp-activity-item">
                  <span
                    className={`pp-activity-dot ${a.status === 'cancelled' ? 'pp-dot--red' : a.status === 'completed' ? 'pp-dot--grey' : 'pp-dot--green'}`}
                    aria-hidden="true"
                  />
                  <div className="pp-activity-info">
                    <p className="pp-activity-doctor">{a.doctor}</p>
                    <p className="pp-activity-reason">{a.reason || a.status}</p>
                  </div>
                  <span className="pp-activity-date">
                    {new Date(a.date + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Appointments tab ──
function AppointmentsTab({ appointments, setAppointments, onBook, onReschedule }) { // onReschedule(id, providerId, originalTime)
  const today = new Date().toISOString().split('T')[0];
  const [cancelling, setCancelling] = useState(null);
  const [payingAppt, setPayingAppt] = useState(null);

  async function cancelAppointment(id) {
    setCancelling(id);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/appointments/cancel/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      }
    } catch {
      // silent — user can retry
    } finally {
      setCancelling(null);
    }
  }

  const upcoming = appointments.filter(a => a.date >= today && a.status !== 'cancelled' && a.status !== 'completed');
  const past = appointments.filter(a => a.date < today || a.status === 'cancelled' || a.status === 'completed');

  const statusClass = {
    confirmed:            'pp-pill--green',
    pending:              'pp-pill--yellow',
    completed:            'pp-pill--teal',
    cancelled:            'pp-pill--grey',
    rescheduled:          'pp-pill--blue',
    reschedule_requested: 'pp-pill--amber',
  };

  const statusLabel = {
    confirmed:            'Confirmed',
    pending:              'Pending',
    completed:            'Completed',
    cancelled:            'Cancelled',
    rescheduled:          'Rescheduled',
    reschedule_requested: 'Pending Reschedule',
  };

  return (
    <div className="pp-appt-content">
      <div className="pp-appt-header">
        <h2 className="pp-page-title">My Appointments</h2>
        <button className="pp-btn-primary" onClick={onBook}>
          <IconPlus /> Book Consultation
        </button>
      </div>

      <div className="pp-card">
        <div className="pp-card-header">
          <h3 className="pp-section-title">
            Upcoming
            {upcoming.length > 0 && <span className="pp-badge-pill">{upcoming.length}</span>}
          </h3>
        </div>
        {upcoming.length === 0 ? (
          <p className="pp-empty-state">
            No upcoming appointments —{' '}
            <button className="pp-link" onClick={onBook}>book one now</button>
          </p>
        ) : (
          <div className="pp-table-wrap">
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date &amp; Time</th>
                  <th>Reason</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(a => (
                  <tr key={a.id}>
                    <td>{a.doctor}</td>
                    <td>{formatDate(a.date)} · {formatTime12(a.time)}</td>
                    <td>{a.reason || '—'}</td>
                    <td>
                      {a.fee ? `$${a.fee}` : '—'}
                      {a.paymentStatus === 'Paid' && <span className="pp-paid-badge">Paid</span>}
                    </td>
                    <td>
                      <span className={`pp-status-pill ${statusClass[a.status] ?? ''}`}>{statusLabel[a.status] ?? a.status}</span>
                      {a.status === 'reschedule_requested' && a.requestedSlotStart && (
                        <p className="pp-reschedule-requested-time">
                          → {new Date(a.requestedSlotStart).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                          {' · '}{formatTime12(new Date(a.requestedSlotStart).toTimeString().slice(0, 5))}
                        </p>
                      )}
                    </td>
                    <td className="pp-table-actions">
                      {a.status === 'confirmed' && a.paymentStatus !== 'Paid' && (
                        <button
                          className="pp-btn-pay"
                          onClick={() => setPayingAppt(a)}
                        >
                          💳 Pay Now
                        </button>
                      )}
                      {a.status === 'confirmed' && a.paymentStatus === 'Paid' && (
                        <button
                          className="pp-btn-video"
                          onClick={() => window.open(`https://meet.jit.si/telehealth-appt-${a.id}`, '_blank')}
                        >
                          🎥 Join Call
                        </button>
                      )}
                      <button
                        className="pp-btn-reschedule"
                        onClick={() => onReschedule(a.id, a.providerId, `${a.date}T${a.time}`)}
                        disabled={a.status === 'reschedule_requested'}
                      >
                        {a.status === 'reschedule_requested' ? 'Reschedule Pending…' : 'Reschedule'}
                      </button>
                      <button
                        className="pp-btn-cancel"
                        onClick={() => cancelAppointment(a.id)}
                        disabled={cancelling === a.id}
                      >
                        {cancelling === a.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {payingAppt && (
        <PaymentModal
          appointment={payingAppt}
          onSuccess={() => setAppointments(prev => prev.map(a =>
            a.id === payingAppt.id ? { ...a, paymentStatus: 'Paid' } : a
          ))}
          onClose={() => setPayingAppt(null)}
        />
      )}

      {past.length > 0 && (
        <div className="pp-card">
          <h3 className="pp-section-title">History</h3>
          <div className="pp-table-wrap">
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date &amp; Time</th>
                  <th>Reason</th>
                  <th>Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {past.map(a => (
                  <tr key={a.id}>
                    <td>{a.doctor}</td>
                    <td>{formatDate(a.date)} · {formatTime12(a.time)}</td>
                    <td>{a.reason || '—'}</td>
                    <td>{a.fee ? `$${a.fee}` : '—'}</td>
                    <td><span className={`pp-status-pill ${statusClass[a.status] ?? ''}`}>{statusLabel[a.status] ?? a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Health Profile tab ──
function HealthProfileTab({ patient, onSave }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    emergencyContact: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    healthFund: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patient?.email) {
      setForm({
        firstName:                patient.firstName ?? '',
        lastName:                 patient.lastName ?? '',
        email:                    patient.email ?? '',
        phone:                    patient.phone ?? '',
        dob:                      patient.dob ?? '',
        address:                  patient.address ?? '',
        emergencyContact:         patient.emergencyContact ?? '',
        emergencyContactName:     patient.emergencyContactName ?? '',
        emergencyContactPhone:    patient.emergencyContactPhone ?? '',
        emergencyContactRelation: patient.emergencyContactRelation ?? '',
        healthFund:               patient.healthFund ?? '',
});
    }
  }, [patient?.email]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSaved(false);
    setError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required!');
      return;
    }

    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (form.dob) {
      const dob = new Date(form.dob);
      const today = new Date();
      if (dob >= today) { setError('Date of birth must be in the past'); return; }
    }

    if (!form.address.trim()) {
      setError('Address is required');
      return;
    }

    if (!form.emergencyContactName.trim()) {
      setError('Emergency contact name is required');
      return;
    }

    if (!form.emergencyContactRelation.trim()) {
      setError('Emergency contact relationship is required');
      return;
    }

    if (!form.emergencyContactPhone.trim()) {
      setError('Emergency contact phone number is required');
      return;
    }

    if (!/^\d{10}$/.test(form.emergencyContactPhone.replace(/\s/g, ''))) {
      setError('Please enter a valid 10-digit emergency contact phone number');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          first_name:                   form.firstName,
          last_name:                    form.lastName,
          date_of_birth:                form.dob || null,
          phone:                        form.phone,
          address:                      form.address,
          emergency_contact:            form.emergencyContact,
          health_fund:                  form.healthFund || null,
          emergency_contact_name:       form.emergencyContactName || null,
          emergency_contact_phone:      form.emergencyContactPhone || null,
          emergency_contact_relation:   form.emergencyContactRelation || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to save. Please try again.'); return; }
      setSaved(true);
      onSave?.({ ...patient, ...form });
      setTimeout(() => {
        onSave?.({ ...patient, ...form });
        window.location.href = '/patient-portal?tab=overview';
      }, 1500);
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="pp-profile-form" onSubmit={handleSave} noValidate>
      <div className="pp-card">
        <h3 className="pp-section-title">Personal Details</h3>
        <p className="pp-profile-hint">Fill in your details below. This information helps your doctor provide better care.</p>
        <div className="pp-grid-2">
          <div className="pp-field">
            <label htmlFor="pp-firstName">First Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input id="pp-firstName" name="firstName" type="text" value={form.firstName} onChange={handleChange} placeholder="Jane" />
          </div>
          <div className="pp-field">
            <label htmlFor="pp-lastName">Last Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input id="pp-lastName" name="lastName" type="text" value={form.lastName} onChange={handleChange} placeholder="Smith" />
          </div>
          <div className="pp-field">
            <label htmlFor="pp-email">Email Address</label>
            <input id="pp-email" name="email" type="email" value={form.email} readOnly className="pp-input--readonly" />
          </div>
          <div className="pp-field">
            <label htmlFor="pp-phone">Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
            <input id="pp-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+61 4XX XXX XXX" />
          </div>
          <div className="pp-field">
            <label htmlFor="pp-dob">Date of Birth <span style={{ color: '#ef4444' }}>*</span></label>
            <input id="pp-dob" name="dob" type="date" value={form.dob} onChange={handleChange} />
          </div>
          <div className="pp-field">
            <label htmlFor="pp-healthFund">Health Fund</label>
            <select id="pp-healthFund" name="healthFund" value={form.healthFund} onChange={handleChange}>
              <option value="">Select health fund…</option>
              <option value="Medicare">Medicare</option>
              <option value="Private Insurance">Private Insurance</option>
              <option value="Veterans Affairs">Veterans Affairs</option>
              <option value="Concession">Concession</option>
              <option value="None">None</option>
            </select>
          </div>
          <div className="pp-field pp-field--full">
            <label htmlFor="pp-address">Address <span style={{ color: '#ef4444' }}>*</span></label>
            <input id="pp-address" name="address" type="text" value={form.address} onChange={handleChange} placeholder="123 Main St, Sydney NSW 2000" />
          </div>
          <div className="pp-field pp-field--full">
            <label htmlFor="pp-ec">Emergency Contact <span style={{ color: '#ef4444' }}>*</span></label>
            <div className="pp-grid-2" style={{ marginTop: '4px' }}>
              <div className="pp-field">
                <label htmlFor="pp-ec-name" style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Full Name</label>
                <input id="pp-ec-name" name="emergencyContactName" type="text"
                  value={form.emergencyContactName} onChange={handleChange}
                  placeholder="e.g. Jane Doe" />
              </div>
              <div className="pp-field">
                <label htmlFor="pp-ec-relation" style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Relationship</label>
                <input id="pp-ec-relation" name="emergencyContactRelation" type="text"
                  value={form.emergencyContactRelation} onChange={handleChange}
                  placeholder="e.g. Mother, Spouse" />
              </div>
              <div className="pp-field pp-field--full">
                <label htmlFor="pp-ec-phone" style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Phone Number</label>
                <input id="pp-ec-phone" name="emergencyContactPhone" type="tel"
                  value={form.emergencyContactPhone} onChange={handleChange}
                  placeholder="e.g. 0412 345 678" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="pp-error-banner">{error}</p>}

      <button type="submit" className="pp-btn-primary pp-save-btn" disabled={saving}>
        {saving ? <span className="pp-spinner" aria-hidden="true" /> : <IconSave />}
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Profile'}
      </button>
    </form>
  );
}

// ── Rating Modal ──
function RatingModal({ appointment, onClose }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const token = localStorage.getItem('token');

  async function submit() {
    if (!selected) return;
    setSubmitting(true);
    try {
      await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          provider_id: appointment.providerId,
          appointment_id: appointment.id,
          rating: selected,
          comment: comment.trim() || null,
        }),
      });
      setDone(true);
      setTimeout(onClose, 1500);
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pp-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pp-modal pp-rating-modal" role="dialog" aria-modal="true">
        <div className="pp-modal-header">
          <h2 className="pp-modal-title">Rate Your Doctor</h2>
          <button className="pp-modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        {done ? (
          <div className="pp-rating-done">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p>Thank you for your feedback!</p>
          </div>
        ) : (
          <>
            <p className="pp-rating-sub">How was your experience with {appointment.doctor}?</p>
            <div className="pp-rating-stars">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  className="pp-star-btn"
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelected(s)}
                  aria-label={`${s} star${s !== 1 ? 's' : ''}`}
                >
                  <svg viewBox="0 0 24 24" width="36" height="36"
                    fill={s <= (hovered || selected) ? '#f59e0b' : '#d1d5db'}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              ))}
            </div>
            {selected > 0 && (
              <p className="pp-rating-label">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][selected]}
              </p>
            )}
            <textarea
              className="pp-rating-comment"
              rows={3}
              placeholder="Share your experience (optional) — your review may appear on our home page"
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={300}
            />
            <div className="pp-modal-actions">
              <button className="pp-btn-outline" onClick={onClose} disabled={submitting}>Cancel</button>
              <button className="pp-btn-primary" onClick={submit} disabled={!selected || submitting}>
                {submitting ? 'Submitting…' : 'Submit Rating'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Medical History tab ──
function MedicalHistoryTab({ appointments }) {
  const [ratingAppt, setRatingAppt] = useState(null);
  const records = appointments.filter(a => a.status === 'completed');

  if (records.length === 0) {
    return (
      <div className="pp-history-content">
        <div className="pp-card pp-placeholder-card">
          <div className="pp-placeholder-icon" aria-hidden="true"><IconClipboard /></div>
          <h3 className="pp-placeholder-title">Medical History</h3>
          <p className="pp-placeholder-text">
            Your medical history records, prescriptions, and test results will appear here
            once your healthcare providers add them to your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pp-history-content">
      <h2 className="pp-page-title">Medical History</h2>
      <div className="pp-history-list">
        {records.map(a => (
          <div key={a.id} className="pp-card pp-history-card">
            <div className="pp-history-card-header">
              <div>
                <p className="pp-history-doctor">{a.doctor}</p>
                <p className="pp-history-date">{a.date} · {a.time}</p>
              </div>
              <span className="pp-pill pp-pill--completed">Completed</span>
            </div>
            {a.reason && (
              <div className="pp-history-section">
                <p className="pp-history-label">Reason for visit</p>
                <p className="pp-history-body">{a.reason}</p>
              </div>
            )}
            {a.notes && (
              <div className="pp-history-section">
                <p className="pp-history-label">Diagnosis &amp; Notes</p>
                <p className="pp-history-body">{a.notes}</p>
              </div>
            )}
            {a.prescription && (
              <div className="pp-history-section">
                <p className="pp-history-label">Prescription</p>
                <pre className="pp-history-prescription">{a.prescription}</pre>
              </div>
            )}
            {!a.notes && !a.prescription && (
              <p className="pp-history-pending">Notes not yet added by provider.</p>
            )}
            <div className="pp-history-card-footer">
              <button className="pp-btn-rate" onClick={() => setRatingAppt(a)}>
                ★ Rate Doctor
              </button>
            </div>
          </div>
        ))}
      </div>
      {ratingAppt && (
        <RatingModal appointment={ratingAppt} onClose={() => setRatingAppt(null)} />
      )}
    </div>
  );
}

// ── Main export ──
function PatientPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [patient, setPatient] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', dob: '', address: '', emergencyContact: '', healthFund: '',
  });
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [bookProviderId, setBookProviderId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleOriginalTime, setRescheduleOriginalTime] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) { window.location.href = '/login'; return; }
    const currentUser = JSON.parse(userStr);
    if (currentUser.role_id !== 1) {
      window.location.href = currentUser.role_id === 2 ? '/doctor-portal' : '/';
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('book');
    const openBooking = params.get('openBooking');
    const openTab = params.get('tab');
    if (bookId) {
      setBookProviderId(bookId);
      setShowBooking(true);
      window.history.replaceState({}, '', '/patient-portal');
    } else if (openBooking) {
      setShowBooking(true);
      window.history.replaceState({}, '', '/patient-portal');
    } else if (openTab) {
      setActiveTab(openTab);
      window.history.replaceState({}, '', '/patient-portal');
    }

    fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.user) return;
        const u = data.user;
        setPatient({
          firstName:       u.first_name ?? '',
          lastName:        u.last_name ?? '',
          email:           u.email ?? '',
          phone:           u.phone ?? '',
          dob:             u.date_of_birth ? u.date_of_birth.split('T')[0] : '',
          address:         u.address ?? '',
          emergencyContact: u.emergency_contact ?? '',
          emergencyContactName:     u.emergency_contact_name ?? '',
          emergencyContactPhone:    u.emergency_contact_phone ?? '',
          emergencyContactRelation: u.emergency_contact_relation ?? '',
          healthFund:      u.health_fund ?? '',
        });
      })
      .catch(() => {});

    fetch('/api/appointments/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.appointments) return;
        setAppointments(data.appointments.map(a => ({
          id:                 a.appointment_id,
          providerId:         a.provider_id,
          doctor:             `Dr. ${a.provider_first_name} ${a.provider_last_name}`,
          date: (() => { const dt = new Date(a.appointment_datetime); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; })(),
          time: (() => { const dt = new Date(a.appointment_datetime); return `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`; })(),
          reason:             a.reason ?? '',
          notes:              a.notes ?? '',
          prescription:       a.prescription ?? '',
          status:             a.status.toLowerCase(),
          fee:                a.consultation_fee ? `${a.consultation_fee}` : null,
          paymentStatus:      a.payment_status ?? 'Unpaid',
          requestedSlotStart: a.requested_slot_start ?? null,
        })));
      })
      .catch(() => {});

    fetch('/api/notifications/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.notifications) return;
        setNotifications(data.notifications.map(n => ({
          id:   n.notification_id,
          text: n.message,
          time: formatRelativeTime(n.sent_at),
          read: n.is_read,
        })));
      })
      .catch(() => {});
  }, []);

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const token = localStorage.getItem('token');
    fetch('/api/notifications/read/all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  function handleBooked() {
    const token = localStorage.getItem('token');
    fetch('/api/appointments/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.appointments) return;
        setAppointments(data.appointments.map(a => {
          const dt = new Date(a.appointment_datetime);
          return {
            id:                 a.appointment_id,
            providerId:         a.provider_id,
            doctor:             `Dr. ${a.provider_first_name} ${a.provider_last_name}`,
            date:               `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`,
            time:               `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`,
            reason:             a.reason ?? '',
            notes:              a.notes ?? '',
            prescription:       a.prescription ?? '',
            status:             a.status.toLowerCase(),
            fee:                a.consultation_fee ? `${a.consultation_fee}` : null,
            paymentStatus:      a.payment_status ?? 'Unpaid',
            requestedSlotStart: a.requested_slot_start ?? null,
          };
        }));
      })
      .catch(() => {});
  }

  return (
    <div className="pp-page">
      <PatientNav patient={patient} notifications={notifications} onMarkAllRead={markAllRead} onMenuClick={() => setSidebarOpen(true)} />

      <div className="pp-body">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} patient={patient} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="pp-main">
          {activeTab === 'overview' && (
            <OverviewTab patient={patient} appointments={appointments} onBook={() => setShowBooking(true)} onViewAppointments={() => setActiveTab('appointments')} />
          )}
          {activeTab === 'appointments' && (
            <AppointmentsTab
              appointments={appointments}
              setAppointments={setAppointments}
              onBook={() => setShowBooking(true)}
              onReschedule={(apptId, providerId, originalTime) => {
                setRescheduleId(apptId);
                setBookProviderId(providerId);
                setRescheduleOriginalTime(originalTime ?? null);
                setShowBooking(true);
              }}
            />
          )}
          {activeTab === 'profile' && (
            <HealthProfileTab patient={patient} onSave={setPatient} />
          )}
          {activeTab === 'history' && <MedicalHistoryTab appointments={appointments} />}
        </main>
      </div>

      {showBooking && (
        <BookingModal
          onClose={() => { setShowBooking(false); setBookProviderId(null); setRescheduleId(null); setRescheduleOriginalTime(null); }}
          onBooked={handleBooked}
          preselectedProviderId={bookProviderId}
          rescheduleAppointmentId={rescheduleId}
          originalTime={rescheduleOriginalTime}
        />
      )}
    </div>
  );
}

export default PatientPortal;
