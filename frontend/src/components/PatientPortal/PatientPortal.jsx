import { useState, useEffect, useRef } from 'react';
import './PatientPortal.css';

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
  <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
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
function PatientNav({ patient, notifications, onMarkAllRead }) {
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
        <a href="/" className="pp-nav-brand">
          <span className="pp-nav-logo-circle" aria-hidden="true"><IconHeart /></span>
          <span className="pp-nav-wordmark">Telehealth</span>
        </a>
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
function Sidebar({ activeTab, onTabChange, patient }) {
  const initials = `${patient?.firstName?.[0] ?? ''}${patient?.lastName?.[0] ?? ''}`.toUpperCase() || 'P';

  const navItems = [
    { key: 'overview',      label: 'Overview',        icon: <IconGrid /> },
    { key: 'appointments',  label: 'Appointments',    icon: <IconCalendar /> },
    { key: 'profile',       label: 'Health Profile',  icon: <IconUser /> },
    { key: 'history',       label: 'Medical History', icon: <IconHistory /> },
  ];

  return (
    <aside className="pp-sidebar">
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
            onClick={() => onTabChange(item.key)}
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
  );
}

// ── Booking Modal ──
function BookingModal({ onClose, onBooked, preselectedProviderId = null }) {
  const [step, setStep] = useState('providers');
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
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
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.slots) setSlots(data.slots); })
      .catch(() => {})
      .finally(() => { setLoading(false); setStep('slots'); });
  }, [providers]); // eslint-disable-line react-hooks/exhaustive-deps

  function selectProvider(provider) {
    setSelectedProvider(provider);
    setSlots([]);
    setSelectedSlot(null);
    setLoading(true);
    fetch(`/api/availability/provider/${provider.user_id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.slots) setSlots(data.slots); })
      .catch(() => {})
      .finally(() => { setLoading(false); setStep('slots'); });
  }

  async function confirmBooking() {
    if (!selectedSlot || !reason.trim()) { setError('Please select a time slot and enter a reason for your visit.'); return; }
    if (booking) return;
    setBooking(true);
    setError('');
    try {
      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          provider_id: selectedProvider.user_id,
          availability_id: selectedSlot.availability_id,
          reason,
          notes: '',
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
      onBooked();
      onClose();
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setBooking(false);
    }
  }

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
          <div>
            <button className="pp-modal-back" onClick={() => { setStep('providers'); setSelectedProvider(null); }}>
              ← Back to providers
            </button>
            {slots.length === 0 ? (
              <p className="pp-empty-state">No available slots for this provider right now</p>
            ) : (
              <div className="pp-slots-grid">
                {slots.map(s => (
                  <button
                    key={s.availability_id}
                    className="pp-slot-btn"
                    onClick={() => { setSelectedSlot(s); setStep('confirm'); }}
                  >
                    <span className="pp-slot-date">{formatDate(s.slot_start)}</span>
                    <span className="pp-slot-time">
                      {formatTime12(new Date(s.slot_start).toTimeString().slice(0, 5))}
                    </span>
                  </button>
                ))}
              </div>
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
function OverviewTab({ patient, appointments, onBook }) {
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
            <button className="pp-card-link" onClick={() => onBook()}>View all →</button>
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
function AppointmentsTab({ appointments, setAppointments, onBook }) {
  const today = new Date().toISOString().split('T')[0];
  const [cancelling, setCancelling] = useState(null);

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
    confirmed:   'pp-pill--green',
    pending:     'pp-pill--yellow',
    completed:   'pp-pill--teal',
    cancelled:   'pp-pill--grey',
    rescheduled: 'pp-pill--blue',
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
                    <td><span className={`pp-status-pill ${statusClass[a.status] ?? ''}`}>{a.status}</span></td>
                    <td className="pp-table-actions">
                      {a.status === 'confirmed' && (
                        <button
                          className="pp-btn-video"
                          onClick={() => window.open(`https://meet.jit.si/telehealth-appt-${a.id}`, '_blank')}
                        >
                          Join Call
                        </button>
                      )}
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {past.map(a => (
                  <tr key={a.id}>
                    <td>{a.doctor}</td>
                    <td>{formatDate(a.date)} · {formatTime12(a.time)}</td>
                    <td>{a.reason || '—'}</td>
                    <td><span className={`pp-status-pill ${statusClass[a.status] ?? ''}`}>{a.status}</span></td>
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
    healthFund: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patient?.email) {
      setForm({
        firstName:       patient.firstName ?? '',
        lastName:        patient.lastName ?? '',
        email:           patient.email ?? '',
        phone:           patient.phone ?? '',
        dob:             patient.dob ?? '',
        address:         patient.address ?? '',
        emergencyContact: patient.emergencyContact ?? '',
        healthFund:      patient.healthFund ?? '',
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
    // Validate inputs
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
      if (dob >= today) {
        setError('Date of birth must be in the past');
        return;
      }
    }

    if (!form.address.trim()) {
      setError('Address is required');
      return;
    }

    if (!form.emergencyContact.trim()) {
      setError('Emergency contact is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          first_name:        form.firstName,
          last_name:         form.lastName,
          date_of_birth:     form.dob || null,
          phone:             form.phone,
          address:           form.address,
          emergency_contact: form.emergencyContact,
          health_fund:       form.healthFund || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to save. Please try again.'); return; }
      setSaved(true);
      onSave?.({ ...patient, ...form });
      setTimeout(() => {
        onSave?.({ ...patient, ...form });
        window.history.replaceState({}, '', '/patient-portal');
        window.dispatchEvent(new Event('navigateToOverview'));
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
            <label htmlFor="pp-firstName">First Name</label>
            <input id="pp-firstName" name="firstName" type="text" value={form.firstName} onChange={handleChange} placeholder="Jane" />
          </div>
          <div className="pp-field">
            <label htmlFor="pp-lastName">Last Name</label>
            <input id="pp-lastName" name="lastName" type="text" value={form.lastName} onChange={handleChange} placeholder="Smith" />
          </div>
          <div className="pp-field">
            <label htmlFor="pp-email">Email Address</label>
            <input id="pp-email" name="email" type="email" value={form.email} readOnly className="pp-input--readonly" />
          </div>
          <div className="pp-field">
            <label htmlFor="pp-phone">Phone Number</label>
            <input id="pp-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+61 4XX XXX XXX" />
          </div>
          <div className="pp-field">
            <label htmlFor="pp-dob">Date of Birth</label>
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
            <label htmlFor="pp-address">Address</label>
            <input id="pp-address" name="address" type="text" value={form.address} onChange={handleChange} placeholder="123 Main St, Sydney NSW 2000" />
          </div>
          <div className="pp-field pp-field--full">
            <label htmlFor="pp-emergency">Emergency Contact</label>
            <input id="pp-emergency" name="emergencyContact" type="text" value={form.emergencyContact} onChange={handleChange} placeholder="Full name — relationship — phone number" />
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

// ── Medical History tab ──
function MedicalHistoryTab({ appointments }) {
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
          </div>
        ))}
      </div>
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
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
      window.history.replaceState({}, '', '/patient-portal');
    }
    if (bookId) {
      setBookProviderId(bookId);
      setShowBooking(true);
      window.history.replaceState({}, '', '/patient-portal');
    } else if (openBooking) {
      setShowBooking(true);
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
          healthFund:      u.health_fund ?? '',
        });
      })
      .catch(() => {});

    fetch('/api/appointments/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.appointments) return;
        setAppointments(data.appointments.map(a => ({
          id:           a.appointment_id,
          doctor:       `Dr. ${a.provider_first_name} ${a.provider_last_name}`,
          date:         a.appointment_datetime.split('T')[0],
          time:         a.appointment_datetime.split('T')[1]?.slice(0, 5) ?? '',
          reason:       a.reason ?? '',
          notes:        a.notes ?? '',
          prescription: a.prescription ?? '',
          status:       a.status.toLowerCase(),
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

    // Navigate to overview after profile save
    window.addEventListener('navigateToOverview', () => setActiveTab('overview'));
    return () => window.removeEventListener('navigateToOverview', () => setActiveTab('overview'));
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
        setAppointments(data.appointments.map(a => ({
          id:     a.appointment_id,
          doctor: `Dr. ${a.provider_first_name} ${a.provider_last_name}`,
          date:   a.appointment_datetime.split('T')[0],
          time:   a.appointment_datetime.split('T')[1]?.slice(0, 5) ?? '',
          reason: a.reason ?? '',
          status: a.status.toLowerCase(),
        })));
      })
      .catch(() => {});
  }

  return (
    <div className="pp-page">
      <PatientNav patient={patient} notifications={notifications} onMarkAllRead={markAllRead} />

      <div className="pp-body">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} patient={patient} />

        <main className="pp-main">
          {activeTab === 'overview' && (
            <OverviewTab patient={patient} appointments={appointments} onBook={() => setShowBooking(true)} />
          )}
          {activeTab === 'appointments' && (
            <AppointmentsTab appointments={appointments} setAppointments={setAppointments} onBook={() => setShowBooking(true)} />
          )}
          {activeTab === 'profile' && (
            <HealthProfileTab patient={patient} onSave={setPatient} />
          )}
          {activeTab === 'history' && <MedicalHistoryTab appointments={appointments} />}
        </main>
      </div>

      {showBooking && (
        <BookingModal
          onClose={() => { setShowBooking(false); setBookProviderId(null); }}
          onBooked={handleBooked}
          preselectedProviderId={bookProviderId}
        />
      )}
    </div>
  );
}

export default PatientPortal;
