import { useState, useEffect, useRef } from 'react';
import './DoctorPortal.css';

const LANGUAGES = ['English', 'Mandarin', 'Hindi', 'Arabic', 'Spanish', 'French', 'Vietnamese', 'Italian', 'Greek', 'Punjabi'];
const SPECIALTIES = [
  'General Practice', 'Cardiology', 'Dermatology', 'Endocrinology',
  'Gastroenterology', 'Neurology', 'Obstetrics & Gynaecology', 'Oncology',
  'Orthopaedics', 'Paediatrics', 'Psychiatry', 'Radiology', 'Urology',
];
const SLOT_DURATIONS = ['15 minutes', '30 minutes', '45 minutes', '60 minutes'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DURATION_MINS = { '15 minutes': 15, '30 minutes': 30, '45 minutes': 45, '60 minutes': 60 };
const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function formatTime(dateStr) {
  const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Icons ──
const IconBell = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconSave = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IconCamera = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const IconPerson = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconHeart = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconVideo = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>
);
const IconClipboard = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

// ── Consultation Notes Modal ──
function ConsultNotesModal({ appointment, onClose, onSaved }) {
  const [notes, setNotes] = useState(appointment.notes || '');
  const [prescription, setPrescription] = useState(appointment.prescription || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  async function handleSave() {
    if (!notes.trim()) { setError('Please enter consultation notes.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/appointments/consult/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes, prescription }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to save notes.'); return; }
      onSaved(appointment.id, notes, prescription);
      onClose();
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dp-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="dp-modal" role="dialog" aria-modal="true">
        <div className="dp-modal-header">
          <h2 className="dp-modal-title">Consultation Notes</h2>
          <button className="dp-modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <div className="dp-modal-meta">
          <span><strong>Patient:</strong> {appointment.patient}</span>
          <span><strong>Date:</strong> {appointment.date} · {appointment.time}</span>
        </div>
        <div className="dp-modal-field">
          <label htmlFor="dp-notes">Diagnosis &amp; Consultation Notes <span aria-hidden="true">*</span></label>
          <textarea
            id="dp-notes"
            rows={5}
            value={notes}
            onChange={e => { setNotes(e.target.value); setError(''); }}
            placeholder="e.g. Patient presents with mild hypertension. Blood pressure 145/90. Advised lifestyle changes…"
          />
        </div>
        <div className="dp-modal-field">
          <label htmlFor="dp-prescription">Prescription</label>
          <textarea
            id="dp-prescription"
            rows={4}
            value={prescription}
            onChange={e => setPrescription(e.target.value)}
            placeholder="e.g. Amlodipine 5mg — take once daily in the morning&#10;Paracetamol 500mg — take as needed for pain, max 4/day"
          />
          <span className="dp-modal-hint">List each medicine on a new line with dosage and frequency.</span>
        </div>
        {error && <p className="dp-modal-error">{error}</p>}
        <div className="dp-modal-actions">
          <button className="dp-btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="dp-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="dp-spinner" aria-hidden="true" /> : <IconCheck />}
            {saving ? 'Saving…' : 'Save & Complete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Top navigation ──
function DoctorNav({ doctor, notifications, onMarkAllRead }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const unread = notifications.filter(n => !n.read).length;
  const initials = `${doctor?.firstName?.[0] ?? ''}${doctor?.lastName?.[0] ?? ''}`.toUpperCase() || 'DR';

  useEffect(() => {
    function handleOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <nav className="dp-nav">
      <div className="dp-nav-inner">
        <a href="/" className="dp-nav-brand">
          <span className="dp-nav-logo-circle" aria-hidden="true"><IconHeart /></span>
          <span className="dp-nav-wordmark">Telehealth</span>
        </a>
        <div className="dp-nav-links">
          <a href="/" className="dp-nav-link">Home</a>
        </div>
        <div className="dp-nav-actions">
          <span className="dp-nav-welcome">Welcome, Dr. {doctor?.lastName ?? '…'}</span>

          <div className="dp-notif-wrap" ref={notifRef}>
            <button
              className="dp-nav-bell"
              onClick={() => setNotifOpen(v => !v)}
              aria-label={`Notifications${unread ? ` — ${unread} unread` : ''}`}
            >
              <IconBell />
              {unread > 0 && <span className="dp-notif-badge">{unread}</span>}
            </button>

            {notifOpen && (
              <div className="dp-notif-dropdown">
                <div className="dp-notif-header">
                  <span>Notifications</span>
                  {unread > 0 && (
                    <button className="dp-notif-mark-read" onClick={() => { onMarkAllRead(); setNotifOpen(false); }}>
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="dp-notif-empty">No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`dp-notif-item${n.read ? '' : ' dp-notif-item--unread'}`}>
                      {!n.read && <span className="dp-notif-dot" aria-hidden="true" />}
                      <div>
                        <p className="dp-notif-text">{n.text}</p>
                        <p className="dp-notif-time">{n.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="dp-nav-avatar" aria-label="Doctor initials">{initials}</div>
          <button
            className="dp-nav-logout"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── My Profile tab ──
function ProfileTab({ doctor, onSave }) {
  const [form, setForm] = useState({
    firstName: doctor?.firstName ?? '',
    lastName: doctor?.lastName ?? '',
    dob: doctor?.dob ?? '',
    email: doctor?.email ?? '',
    phone: doctor?.phone ?? '',
    sex: doctor?.sex ?? '',
    specialty: doctor?.specialty ?? '',
    languages: doctor?.languages ?? [],
    overview: doctor?.overview ?? '',
  });
  const [photoPreview, setPhotoPreview] = useState(doctor?.photoUrl ?? null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  // Sync form when doctor data loads from the API
  useEffect(() => {
    if (doctor?.email) {
      setForm({
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        dob: doctor.dob,
        email: doctor.email,
        phone: doctor.phone,
        sex: doctor.sex,
        specialty: doctor.specialty,
        languages: doctor.languages,
        overview: doctor.overview,
      });
      setPhotoPreview(doctor.photoUrl ?? null);
      setPhotoBase64(null);
    }
  }, [doctor?.email]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setSaved(false);
  }

  function toggleLanguage(lang) {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
    setSaved(false);
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 400;
      let { width, height } = img;
      if (width > height) {
        if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
      } else {
        if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoPreview(base64);
      setPhotoBase64(base64);
      setSaved(false);
    };
    img.src = objectUrl;
  }

  function validate() {
    const e = {};

    // Phone — must be 10 digits
    if (!form.phone.trim()) {
      e.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) {
      e.phone = 'Please enter a valid 10-digit phone number';
    }

    // Specialty
    if (!form.specialty) e.specialty = 'Required';

    // Date of birth — must be in the past
    if (form.dob) {
      const dob = new Date(form.dob);
      const today = new Date();
      if (dob >= today) e.dob = 'Date of birth must be in the past';
    }

    // Bio — max 500 characters
    if (form.overview && form.overview.length > 500) {
      e.overview = `Bio is too long (${form.overview.length}/500 characters)`;
    }

    return e;
  }

  async function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setSaveError('');
    try {
      const token = localStorage.getItem('token');

      await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          phone:         form.phone,
          date_of_birth: form.dob || null,
        }),
      });

      const res = await fetch('/api/providers/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          specialisation: form.specialty,
          sex: form.sex,
          spoken_language: form.languages.join(', '),
          bio: form.overview,
          ...(photoBase64 ? { profile_picture: photoBase64 } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.message || `Failed to save profile (HTTP ${res.status}). Please try again.`);
        return;
      }

      setSaved(true);
      onSave?.({ ...doctor, ...form });
      setTimeout(() => {
        window.location.href = 'doctor-portal?tab=dashboard';
      }, 1500);
    } catch {
      setSaveError('Network error. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="dp-profile-form" onSubmit={handleSave} noValidate>

      {/* Photo */}
      <div className="dp-card">
        <div className="dp-photo-section">
          <div className="dp-photo-wrap" onClick={() => fileRef.current?.click()} role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}>
            {photoPreview
              ? <img src={photoPreview} alt="Profile photo" className="dp-photo-img" />
              : <div className="dp-photo-placeholder"><IconPerson /></div>
            }
            <div className="dp-photo-overlay" aria-hidden="true"><IconCamera /></div>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="dp-photo-input" onChange={handlePhoto} />
          <div className="dp-photo-info">
            <p className="dp-photo-label">Add a professional photo</p>
            <p className="dp-photo-hint">JPG, PNG — recommended 400×400 px</p>
          </div>
        </div>
      </div>

      {/* Personal details */}
      <div className="dp-card">
        <h3 className="dp-section-title">Personal Details</h3>
        <div className="dp-grid-2">
          <div className="dp-field">
            <label htmlFor="dp-firstName">First Name</label>
            <input id="dp-firstName" name="firstName" type="text" value={form.firstName}
              readOnly className="dp-input--readonly" autoComplete="given-name" />
          </div>
          <div className="dp-field">
            <label htmlFor="dp-lastName">Last Name</label>
            <input id="dp-lastName" name="lastName" type="text" value={form.lastName}
              readOnly className="dp-input--readonly" autoComplete="family-name" />
          </div>
          <div className="dp-field">
            <label htmlFor="dp-dob">Date of Birth</label>
            <input id="dp-dob" name="dob" type="date" value={form.dob} onChange={handleChange} autoComplete="bday"
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.dob && <span className="dp-error">{errors.dob}</span>}
          </div>
          <div className="dp-field">
            <label htmlFor="dp-email">Email Address</label>
            <input id="dp-email" name="email" type="email" value={form.email} readOnly
              className="dp-input--readonly" autoComplete="email" />
          </div>
          <div className="dp-field">
            <label htmlFor="dp-phone">Phone Number <span aria-hidden="true">*</span></label>
            <input id="dp-phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
              placeholder="+61 4XX XXX XXX" autoComplete="tel" aria-invalid={!!errors.phone} />
            {errors.phone && <span className="dp-error">{errors.phone}</span>}
          </div>
          <div className="dp-field">
            <label htmlFor="dp-sex">Sex</label>
            <select id="dp-sex" name="sex" value={form.sex} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="dp-field dp-field--full">
            <label htmlFor="dp-specialty">Specialty <span aria-hidden="true">*</span></label>
            <select id="dp-specialty" name="specialty" value={form.specialty} onChange={handleChange}
              aria-invalid={!!errors.specialty}>
              <option value="">Select specialty</option>
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.specialty && <span className="dp-error">{errors.specialty}</span>}
          </div>
        </div>
      </div>

      {/* Spoken languages */}
      <div className="dp-card">
        <h3 className="dp-section-title">Spoken Languages</h3>
        <div className="dp-chips">
          {LANGUAGES.map(lang => (
            <button key={lang} type="button"
              className={`dp-chip${form.languages.includes(lang) ? ' dp-chip--active' : ''}`}
              onClick={() => toggleLanguage(lang)}>
              {form.languages.includes(lang) && <span className="dp-chip-check" aria-hidden="true"><IconCheck /></span>}
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Brief overview */}
      <div className="dp-card">
        <h3 className="dp-section-title">Brief Overview</h3>
        <div className="dp-field">
          <label htmlFor="dp-overview">Professional Bio</label>
          <textarea id="dp-overview" name="overview" value={form.overview} onChange={handleChange}
            maxLength={500}
            placeholder="Describe your experience, areas of focus, and approach to patient care…"
            rows={5} className="dp-textarea" />
          <p style={{ fontSize: '12px', color: form.overview?.length > 450 ? '#ef4444' : '#9ca3af', textAlign: 'right', margin: '4px 0 0' }}>
            {form.overview?.length ?? 0}/500
          </p>
          {errors.overview && <span className="dp-error">{errors.overview}</span>}
        </div>
      </div>

      {saveError && <p className="dp-error" style={{ textAlign: 'center', marginBottom: '8px' }}>{saveError}</p>}
      <button type="submit" className="dp-btn-primary dp-save-btn" disabled={saving}>
        {saving ? <span className="dp-spinner" aria-hidden="true" /> : <IconSave />}
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Profile'}
      </button>
    </form>
  );
}

// ── Appointments tab ──
function AppointmentsTab({ appointments, setAppointments }) {
  const [consultAppt, setConsultAppt] = useState(null);
  const [availability, setAvailability] = useState({
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: '30 minutes',
  });
  const [savingAvail, setSavingAvail] = useState(false);
  const [availSaved, setAvailSaved] = useState(false);
  const [availError, setAvailError] = useState('');

  function updateStatus(id, localStatus, apiStatus) {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: localStatus } : a));
    const token = localStorage.getItem('token');
    fetch(`/api/appointments/status/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: apiStatus }),
    }).catch(() => {});
  }

  function toggleDay(day) {
    setAvailability(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day],
    }));
    setAvailSaved(false);
  }

  async function saveAvailability(e) {
    e.preventDefault();
    setSavingAvail(true);
    const token = localStorage.getItem('token');
    const durationMins = DURATION_MINS[availability.slotDuration];
    const slots = [];

    // Generate all slots for the next 4 weeks based on the schedule
    for (let week = 0; week < 4; week++) {
      for (const day of availability.days) {
        const now = new Date();
        const diff = (DAY_INDEX[day] - now.getDay() + 7) % 7 + week * 7;
        if (diff === 0) continue;
        const date = new Date(now);
        date.setDate(now.getDate() + diff);

        const [sh, sm] = availability.startTime.split(':').map(Number);
        const [eh, em] = availability.endTime.split(':').map(Number);
        let cur = new Date(date); cur.setHours(sh, sm, 0, 0);
        const end = new Date(date); end.setHours(eh, em, 0, 0);

        while (cur < end) {
          const slotEnd = new Date(cur.getTime() + durationMins * 60000);
          if (slotEnd > end) break;
          slots.push({ slot_start: new Date(cur).toISOString(), slot_end: slotEnd.toISOString() });
          cur = new Date(slotEnd);
        }
      }
    }

    if (slots.length === 0) {
      setSavingAvail(false);
      setAvailError('No slots were generated — check that your days and times are set correctly.');
      return;
    }

    let saved = 0;
    let overlapped = 0;
    let authFailed = 0;
    for (const slot of slots) {
      try {
        const res = await fetch('/api/availability/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(slot),
        });
        if (res.ok) saved++;
        else if (res.status === 400) overlapped++;
        else authFailed++;
      } catch {
        authFailed++;
      }
    }

    setSavingAvail(false);
    if (slots.length === 0) {
      setAvailError('No slots were generated — check your days and times are set correctly.');
    } else if (authFailed > 0 && saved === 0 && overlapped === 0) {
      setAvailError('Could not save slots — please log out and log back in, then try again.');
    } else {
      // saved > 0 OR overlapped > 0 — slots are in the database
      setAvailError('');
      setAvailSaved(true);
    }
  }

  const counts = {
    scheduled:   appointments.filter(a => a.status === 'confirmed' || a.status === 'scheduled').length,
    pending:     appointments.filter(a => a.status === 'pending').length,
    completed:   appointments.filter(a => a.status === 'completed').length,
    cancelled:   appointments.filter(a => a.status === 'cancelled' || a.status === 'rescheduled').length,
  };

  const pending = appointments.filter(a => a.status === 'pending');

  const statusClass = {
    scheduled:   'dp-pill--blue',
    confirmed:   'dp-pill--blue',
    pending:     'dp-pill--yellow',
    completed:   'dp-pill--green',
    rescheduled: 'dp-pill--grey',
    cancelled:   'dp-pill--grey',
  };

  return (
    <div className="dp-appt-content">

      {/* Status summary cards */}
      <div className="dp-status-cards">
        {[
          { label: 'Confirmed',  count: counts.scheduled,  cls: 'dp-scard--blue' },
          { label: 'Pending',    count: counts.pending,    cls: 'dp-scard--yellow' },
          { label: 'Completed',  count: counts.completed,  cls: 'dp-scard--green' },
          { label: 'Cancelled',  count: counts.cancelled,  cls: 'dp-scard--grey' },
        ].map(c => (
          <div key={c.label} className={`dp-scard ${c.cls}`}>
            <span className="dp-scard-count">{c.count}</span>
            <span className="dp-scard-label">{c.label}</span>
          </div>
        ))}
      </div>

      {/* Pending — action required */}
      <div className="dp-card">
        <h3 className="dp-section-title">
          Pending Appointments — Action Required
          {pending.length > 0 && <span className="dp-badge-pill">{pending.length}</span>}
        </h3>
        {pending.length === 0 ? (
          <p className="dp-empty-state">No pending appointments</p>
        ) : (
          <div className="dp-table-wrap">
            <table className="dp-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date &amp; Time</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(a => (
                  <tr key={a.id}>
                    <td>{a.patient}</td>
                    <td>{a.date} · {a.time}</td>
                    <td>{a.reason}</td>
                    <td className="dp-table-actions">
                      <button className="dp-btn-accept" onClick={() => updateStatus(a.id, 'confirmed', 'Confirmed')}>Accept</button>
                      <button className="dp-btn-decline" onClick={() => updateStatus(a.id, 'cancelled', 'Cancelled')}>Decline</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All appointments */}
      <div className="dp-card">
        <h3 className="dp-section-title">Appointment Schedule</h3>
        <div className="dp-table-wrap">
          <table className="dp-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date &amp; Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan={5} className="dp-empty-state">No appointments yet</td></tr>
              ) : appointments.map(a => (
                <tr key={a.id}>
                  <td>{a.patient}</td>
                  <td>{a.date} · {a.time}</td>
                  <td>{a.reason}</td>
                  <td><span className={`dp-status-pill ${statusClass[a.status] ?? ''}`}>{a.status}</span></td>
                  <td className="dp-table-actions">
                    {a.status === 'confirmed' && (
                      <>
                        <button
                          className="dp-btn-video"
                          onClick={() => window.open(`https://meet.jit.si/telehealth-appt-${a.id}`, '_blank')}
                        >
                          <IconVideo /> Video Call
                        </button>
                        <button className="dp-btn-notes" onClick={() => setConsultAppt(a)}>
                          <IconClipboard /> Add Notes
                        </button>
                      </>
                    )}
                    {a.status === 'completed' && (
                      <button className="dp-btn-notes" onClick={() => setConsultAppt(a)}>
                        <IconClipboard /> Edit Notes
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {consultAppt && (
        <ConsultNotesModal
          appointment={consultAppt}
          onClose={() => setConsultAppt(null)}
          onSaved={(id, notes, prescription) => {
            setAppointments(prev => prev.map(a =>
              a.id === id ? { ...a, status: 'completed', notes, prescription } : a
            ));
          }}
        />
      )}

      {/* Set availability */}
      <div className="dp-card">
        <h3 className="dp-section-title">Set Availability</h3>
        <form onSubmit={saveAvailability}>
          <div className="dp-avail-block">
            <p className="dp-avail-label">Available Days</p>
            <div className="dp-day-buttons">
              {DAYS.map(day => (
                <button key={day} type="button"
                  className={`dp-day-btn${availability.days.includes(day) ? ' dp-day-btn--active' : ''}`}
                  onClick={() => toggleDay(day)}>
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div className="dp-grid-2 dp-avail-times">
            <div className="dp-field">
              <label htmlFor="dp-start">Start Time</label>
              <input id="dp-start" type="time" value={availability.startTime}
                onChange={e => { setAvailability(p => ({ ...p, startTime: e.target.value })); setAvailSaved(false); }} />
            </div>
            <div className="dp-field">
              <label htmlFor="dp-end">End Time</label>
              <input id="dp-end" type="time" value={availability.endTime}
                onChange={e => { setAvailability(p => ({ ...p, endTime: e.target.value })); setAvailSaved(false); }} />
            </div>
            <div className="dp-field dp-field--full">
              <label htmlFor="dp-slot">Appointment Slot Duration</label>
              <select id="dp-slot" value={availability.slotDuration}
                onChange={e => { setAvailability(p => ({ ...p, slotDuration: e.target.value })); setAvailSaved(false); }}>
                {SLOT_DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          {availError && <p className="dp-error" style={{ marginBottom: '8px' }}>{availError}</p>}
          <button type="submit" className="dp-btn-primary dp-save-btn" disabled={savingAvail}
            onClick={() => { setAvailSaved(false); setAvailError(''); }}>
            {savingAvail ? <span className="dp-spinner" aria-hidden="true" /> : <IconSave />}
            {savingAvail ? 'Generating slots…' : availSaved ? 'Slots saved!' : 'Save Availability'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Dashboard tab ──
function DashboardTab({ appointments, doctor }) {
  const today = new Date().toISOString().split('T')[0];
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const upcoming = appointments
    .filter(a => a.date >= today && (a.status === 'confirmed' || a.status === 'scheduled'))
    .slice(0, 5);

  const stats = [
    { label: "Today's Patients",  value: appointments.filter(a => a.date === today).length,                                          cls: 'dp-dstat--green' },
    { label: 'Pending Actions',   value: appointments.filter(a => a.status === 'pending').length,                                    cls: 'dp-dstat--yellow' },
    { label: 'Completed',         value: appointments.filter(a => a.status === 'completed').length,                                  cls: 'dp-dstat--blue' },
    { label: 'Upcoming (7 days)', value: appointments.filter(a => a.date >= today && a.date <= in7Days).length,                      cls: 'dp-dstat--purple' },
  ];

  return (
    <div className="dp-dash-content">
      <div className="dp-dash-stats">
        {stats.map(s => (
          <div key={s.label} className={`dp-dstat ${s.cls}`}>
            <span className="dp-dstat-value">{s.value}</span>
            <span className="dp-dstat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="dp-dash-cols">
        <div className="dp-card dp-card--grow">
          <h3 className="dp-section-title">Upcoming Appointments</h3>
          {upcoming.length === 0 ? (
            <p className="dp-empty-state">No upcoming confirmed appointments</p>
          ) : (
            <div className="dp-upcoming-list">
              {upcoming.map(a => (
                <div key={a.id} className="dp-upcoming-item">
                  <div className="dp-upcoming-avatar">
                    {a.patient.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="dp-upcoming-info">
                    <p className="dp-upcoming-name">{a.patient}</p>
                    <p className="dp-upcoming-meta">{a.date} · {a.time} · {a.reason}</p>
                  </div>
                  <span className="dp-status-pill dp-pill--blue">{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dp-card dp-card--profile-summary">
          <div className="dp-prof-banner" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div className="dp-prof-info">
            <p className="dp-prof-name">Dr. {doctor?.firstName} {doctor?.lastName}</p>
            <p className="dp-prof-specialty">{doctor?.specialty || 'Specialist'}</p>
            {doctor?.languages?.length > 0 && (
              <p className="dp-prof-langs">Speaks: {doctor.languages.join(', ')}</p>
            )}
            <p className="dp-prof-email">{doctor?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main export ──
function DoctorPortal() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState([]);
  const [doctor, setDoctor] = useState({
    firstName: '', lastName: '', dob: '', email: '',
    phone: '', sex: '', specialty: '', languages: [], overview: '', photoUrl: null,
  });
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    // Redirect if not logged in or not a doctor
    if (!token || !userStr) { window.location.href = '/login'; return; }
    const currentUser = JSON.parse(userStr);
    if (currentUser.role_id !== 2) { window.location.href = '/'; return; }

    // Check for tab redirect from profile save
    const params = new URLSearchParams(window.location.search);
    const openTab = params.get('tab');
    if (openTab) {
      setActiveTab(openTab);
      window.history.replaceState({}, '', '/doctor-portal');
    }
    
    // Fetch this doctor's profile from the database
    fetch(`/api/providers/${currentUser.user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.provider) return;
        const d = data.provider;
        setDoctor({
          firstName:  d.first_name ?? '',
          lastName:   d.last_name ?? '',
          dob:        d.date_of_birth ? d.date_of_birth.split('T')[0] : '',
          email:      d.email ?? '',
          phone:      d.phone ?? '',
          sex:        d.sex ?? '',
          specialty:  d.specialisation ?? '',
          languages:  d.spoken_language
            ? (Array.isArray(d.spoken_language) ? d.spoken_language : d.spoken_language.split(',').map(s => s.trim()))
            : [],
          overview:   d.bio ?? '',
          photoUrl:   d.profile_picture ?? null,
        });
      })
      .catch(() => {});

    // Fetch real notifications
    fetch('/api/notifications/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.notifications) return;
        setNotifications(data.notifications.map(n => ({
          id:   n.notification_id,
          text: n.message,
          time: formatTime(n.sent_at),
          read: n.is_read,
        })));
      })
      .catch(() => {});

    // Fetch real appointments
    fetch('/api/appointments/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.appointments) return;
        setAppointments(data.appointments.map(a => ({
          id:           a.appointment_id,
          patient:      `${a.patient_first_name} ${a.patient_last_name}`,
          date:         a.appointment_datetime.split('T')[0],
          time:         a.appointment_datetime.split('T')[1]?.slice(0, 5) ?? '',
          reason:       a.reason ?? '',
          notes:        a.notes ?? '',
          prescription: a.prescription ?? '',
          fund:         '',
          status:       a.status.toLowerCase(),
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

  const tabs = [
    { key: 'profile',      label: 'My Profile' },
    { key: 'appointments', label: 'Appointments' },
    { key: 'dashboard',    label: 'Dashboard' },
  ];

  return (
    <div className="dp-page">
      <DoctorNav doctor={doctor} notifications={notifications} onMarkAllRead={markAllRead} />

      <div className="dp-body">
        <div className="dp-topbar">
          <div className="dp-topbar-inner">
            <div>
              <h1 className="dp-welcome-title">Welcome, Dr. {doctor.lastName || 'Doctor'}</h1>
              <p className="dp-welcome-sub">Manage your profile, appointments &amp; availability</p>
            </div>
            <nav className="dp-tabs" aria-label="Portal sections">
              {tabs.map(t => (
                <button key={t.key}
                  className={`dp-tab${activeTab === t.key ? ' dp-tab--active' : ''}`}
                  onClick={() => setActiveTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="dp-content">
          {activeTab === 'profile'      && <ProfileTab doctor={doctor} onSave={setDoctor} />}
          {activeTab === 'appointments' && <AppointmentsTab appointments={appointments} setAppointments={setAppointments} />}
          {activeTab === 'dashboard'    && <DashboardTab appointments={appointments} doctor={doctor} />}
        </div>
      </div>

      <footer className="dp-footer">
        <span>Copyrights reserved</span>
        <a href="/terms">Terms and Conditions</a>
        <a href="/contact">Contact</a>
      </footer>
    </div>
  );
}

export default DoctorPortal;