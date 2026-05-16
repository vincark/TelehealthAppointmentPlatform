import { useState, useEffect, useRef } from 'react';
import './AdminPortal.css';

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

const ROLE_LABEL = { 1: 'Patient', 2: 'Provider', 3: 'Admin' };
const ROLE_CLASS = { 1: 'ad-role--patient', 2: 'ad-role--provider', 3: 'ad-role--admin' };
const STATUS_CLASS = {
  Active:    'ad-pill--green',
  Inactive:  'ad-pill--grey',
  Suspended: 'ad-pill--red',
};
const APPT_STATUS_CLASS = {
  Pending:   'ad-pill--yellow',
  Confirmed: 'ad-pill--green',
  Completed: 'ad-pill--teal',
  Cancelled: 'ad-pill--grey',
};

// ── Icons ────────────────────────────────────────────────────────────────────
const IconHeart       = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>;
const IconLogout      = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconGrid        = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconUsers       = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconCalendar    = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconFileText    = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconUserCheck   = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>;
const IconStethoscope = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 6.5a5 5 0 0 0 10 0"/><path d="M4.5 6.5C4.5 4 6.5 2 9 2s4.5 2 4.5 4.5"/><path d="M9 11.5v5a4 4 0 0 0 8 0v-1"/><circle cx="19" cy="15" r="2"/></svg>;
const IconTrendUp     = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconSearch      = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconRefresh     = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const IconPlus        = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconClose       = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

// ── Top Nav ──────────────────────────────────────────────────────────────────
function AdminNav({ admin }) {
  const initials = `${admin?.firstName?.[0] ?? 'A'}${admin?.lastName?.[0] ?? ''}`.toUpperCase();

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return (
    <nav className="ad-nav">
      <div className="ad-nav-inner">
        <a href="/" className="ad-nav-brand">
          <span className="ad-nav-logo"><IconHeart /></span>
          <span className="ad-nav-wordmark">Telehealth</span>
          <span className="ad-nav-badge">Admin</span>
        </a>
        <div className="ad-nav-actions">
          <span className="ad-nav-welcome">
            {admin?.firstName} {admin?.lastName}
          </span>
          <div className="ad-nav-avatar" aria-label="Admin initials">{initials}</div>
          <button className="ad-nav-logout" onClick={logout}>
            <IconLogout /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
function AdminSidebar({ activeTab, onTabChange }) {
  const items = [
    { key: 'overview',      label: 'Overview',      icon: <IconGrid /> },
    { key: 'users',         label: 'Users',         icon: <IconUsers /> },
    { key: 'appointments',  label: 'Appointments',  icon: <IconCalendar /> },
    { key: 'reports',       label: 'Reports',       icon: <IconFileText /> },
  ];

  return (
    <aside className="ad-sidebar">
      <div className="ad-sidebar-label">Management</div>
      <nav className="ad-sidebar-nav" aria-label="Admin sections">
        {items.map(item => (
          <button
            key={item.key}
            className={`ad-sidebar-item${activeTab === item.key ? ' ad-sidebar-item--active' : ''}`}
            onClick={() => onTabChange(item.key)}
          >
            <span className="ad-sidebar-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, colorClass, sub }) {
  return (
    <div className={`ad-stat ${colorClass}`}>
      <div className="ad-stat-top">
        <span className="ad-stat-icon" aria-hidden="true">{icon}</span>
        <span className="ad-stat-value">{value ?? '—'}</span>
      </div>
      <span className="ad-stat-label">{label}</span>
      {sub && <span className="ad-stat-sub">{sub}</span>}
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ dashData, loading }) {
  if (loading) return <div className="ad-loading"><div className="ad-spinner" /><p>Loading dashboard…</p></div>;
  if (!dashData) return null;

  const { userStats, apptStats, recentUsers, topProviders } = dashData;

  const apptBreakdown = [
    { label: 'Pending',   value: apptStats.pending,   cls: 'ad-bar--yellow' },
    { label: 'Confirmed', value: apptStats.confirmed,  cls: 'ad-bar--green' },
    { label: 'Completed', value: apptStats.completed,  cls: 'ad-bar--teal' },
    { label: 'Cancelled', value: apptStats.cancelled,  cls: 'ad-bar--red' },
  ];
  const total = Number(apptStats.total_appointments) || 1;

  return (
    <div className="ad-overview">
      {/* Hero */}
      <div className="ad-hero">
        <div className="ad-hero-content">
          <p className="ad-hero-eyebrow">Admin Dashboard</p>
          <h1 className="ad-hero-title">Platform Overview</h1>
          <p className="ad-hero-sub">Real-time snapshot of your telehealth platform.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="ad-stats-row">
        <StatCard label="Total Patients"      value={userStats.total_patients}      icon={<IconUsers />}       colorClass="ad-stat--green" />
        <StatCard label="Total Providers"     value={userStats.total_providers}     icon={<IconStethoscope />} colorClass="ad-stat--blue" />
        <StatCard label="Total Appointments"  value={apptStats.total_appointments}  icon={<IconCalendar />}    colorClass="ad-stat--teal" />
        <StatCard label="Appointments Today"  value={apptStats.today}               icon={<IconTrendUp />}     colorClass="ad-stat--purple" />
        <StatCard label="Active Accounts"     value={userStats.active_users}        icon={<IconUserCheck />}   colorClass="ad-stat--mint"
          sub={`${userStats.suspended_users} suspended`} />
      </div>

      <div className="ad-overview-cols">
        {/* Appointment breakdown */}
        <div className="ad-card">
          <h3 className="ad-section-title">Appointment Breakdown</h3>
          <div className="ad-breakdown">
            {apptBreakdown.map(b => (
              <div key={b.label} className="ad-breakdown-row">
                <span className="ad-breakdown-label">{b.label}</span>
                <div className="ad-breakdown-bar-wrap">
                  <div
                    className={`ad-breakdown-bar ${b.cls}`}
                    style={{ width: `${Math.round((Number(b.value) / total) * 100)}%` }}
                  />
                </div>
                <span className="ad-breakdown-count">{b.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top providers */}
        <div className="ad-card">
          <h3 className="ad-section-title">Top Providers by Appointments</h3>
          {topProviders.length === 0 ? (
            <p className="ad-empty">No provider data yet.</p>
          ) : (
            <div className="ad-provider-list">
              {topProviders.map((p, i) => (
                <div key={p.user_id} className="ad-provider-row">
                  <span className="ad-provider-rank">#{i + 1}</span>
                  <div className="ad-provider-info">
                    <p className="ad-provider-name">Dr. {p.first_name} {p.last_name}</p>
                    <p className="ad-provider-spec">{p.specialisation || 'General Practitioner'}</p>
                  </div>
                  <span className="ad-provider-count">{p.total_appointments} appts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent sign-ups */}
      <div className="ad-card">
        <h3 className="ad-section-title">Recent Sign-ups</h3>
        {recentUsers.length === 0 ? (
          <p className="ad-empty">No users yet.</p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.user_id}>
                    <td className="ad-td-bold">{u.first_name} {u.last_name}</td>
                    <td>{u.email}</td>
                    <td><span className={`ad-role-pill ${ROLE_CLASS[u.role_id]}`}>{ROLE_LABEL[u.role_id] ?? 'Unknown'}</span></td>
                    <td><span className={`ad-status-pill ${STATUS_CLASS[u.account_status]}`}>{u.account_status}</span></td>
                    <td>{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add Provider Modal ────────────────────────────────────────────────────────
function AddProviderModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    temp_password: '', specialisation: '', degree: '',
    sex: '', spoken_language: '', bio: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const token = localStorage.getItem('token');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.first_name.trim()) e.first_name = 'Required';
    if (!form.last_name.trim())  e.last_name  = 'Required';
    if (!form.email.trim())      e.email      = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.temp_password)     e.temp_password = 'Required';
    else if (form.temp_password.length < 6) e.temp_password = 'Min. 6 characters';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setApiError('');
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.message || 'Failed to create provider.'); return; }
      onCreated(data.user);
    } catch {
      setApiError('Could not connect. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ad-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ad-modal">
        <div className="ad-modal-header">
          <h2 className="ad-modal-title">Add Provider Account</h2>
          <button className="ad-modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        <form className="ad-modal-form" onSubmit={handleSubmit} noValidate>

          <p className="ad-modal-section-label">Required details</p>
          <div className="ad-modal-row">
            <div className="ad-modal-field">
              <label>First Name <span aria-hidden="true">*</span></label>
              <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Jane" />
              {errors.first_name && <span className="ad-field-error">{errors.first_name}</span>}
            </div>
            <div className="ad-modal-field">
              <label>Last Name <span aria-hidden="true">*</span></label>
              <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Smith" />
              {errors.last_name && <span className="ad-field-error">{errors.last_name}</span>}
            </div>
          </div>

          <div className="ad-modal-field">
            <label>Email Address <span aria-hidden="true">*</span></label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="dr.smith@telehealth.com" />
            {errors.email && <span className="ad-field-error">{errors.email}</span>}
          </div>

          <div className="ad-modal-field">
            <label>Temporary Password <span aria-hidden="true">*</span></label>
            <div className="ad-pw-wrap">
              <input
                name="temp_password"
                type={showPw ? 'text' : 'password'}
                value={form.temp_password}
                onChange={handleChange}
                placeholder="Provider will use this to log in"
              />
              <button type="button" className="ad-pw-toggle" onClick={() => setShowPw(v => !v)}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.temp_password && <span className="ad-field-error">{errors.temp_password}</span>}
          </div>

          <p className="ad-modal-section-label" style={{ marginTop: '1.25rem' }}>Professional details <span className="ad-optional">(optional)</span></p>
          <div className="ad-modal-row">
            <div className="ad-modal-field">
              <label>Specialisation</label>
              <input name="specialisation" value={form.specialisation} onChange={handleChange} placeholder="e.g. Cardiology" />
            </div>
            <div className="ad-modal-field">
              <label>Degree</label>
              <input name="degree" value={form.degree} onChange={handleChange} placeholder="e.g. MBBS, MD" />
            </div>
          </div>

          <div className="ad-modal-row">
            <div className="ad-modal-field">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+61 4XX XXX XXX" />
            </div>
            <div className="ad-modal-field">
              <label>Sex</label>
              <select name="sex" value={form.sex} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="ad-modal-field">
            <label>Spoken Languages</label>
            <input name="spoken_language" value={form.spoken_language} onChange={handleChange} placeholder="e.g. English, Mandarin" />
          </div>

          <div className="ad-modal-field">
            <label>Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Short bio displayed on their profile…" />
          </div>

          {apiError && <p className="ad-error-banner">{apiError}</p>}

          <div className="ad-modal-actions">
            <button type="button" className="ad-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="ad-btn-generate" disabled={saving}>
              {saving ? <><span className="ad-spinner ad-spinner--sm" /> Creating…</> : 'Create Provider'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter]     = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [error, setError]       = useState('');
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [successMsg, setSuccessMsg]           = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => { loadUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function loadUsers() {
    setLoading(true);
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.users) setUsers(data.users); })
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  }

  function handleProviderCreated(newUser) {
    setShowAddProvider(false);
    setSuccessMsg(`Provider account created for ${newUser.first_name} ${newUser.last_name}.`);
    loadUsers();
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  async function updateStatus(userId, newStatus) {
    setUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u =>
          u.user_id === userId ? { ...u, account_status: newStatus } : u
        ));
      }
    } catch {}
    finally { setUpdating(null); }
  }

  const filtered = users.filter(u => {
    const nameMatch = `${u.first_name} ${u.last_name} ${u.email}`
      .toLowerCase().includes(search.toLowerCase());
    const roleMatch = roleFilter === 'all' || String(u.role_id) === roleFilter;
    const statusMatch = statusFilter === 'all' || u.account_status === statusFilter;
    return nameMatch && roleMatch && statusMatch;
  });

  const nextStatus = { Active: 'Inactive', Inactive: 'Active', Suspended: 'Active' };
  const nextLabel  = { Active: 'Deactivate', Inactive: 'Activate', Suspended: 'Activate' };

  return (
    <div className="ad-tab-content">
      {showAddProvider && (
        <AddProviderModal
          onClose={() => setShowAddProvider(false)}
          onCreated={handleProviderCreated}
        />
      )}

      <div className="ad-tab-header">
        <h2 className="ad-page-title">User Management</h2>
        <div className="ad-tab-header-actions">
          <span className="ad-count-badge">{filtered.length} users</span>
          <button className="ad-btn-add-provider" onClick={() => setShowAddProvider(true)}>
            <IconPlus /> Add Provider
          </button>
        </div>
      </div>

      {successMsg && <p className="ad-success-banner">{successMsg}</p>}

      <div className="ad-filters-row">
        <div className="ad-search-wrap">
          <IconSearch />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ad-search-input"
          />
        </div>
        <select className="ad-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="1">Patients</option>
          <option value="2">Providers</option>
        </select>
        <select className="ad-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {error && <p className="ad-error-banner">{error}</p>}

      <div className="ad-card">
        {loading ? (
          <div className="ad-loading"><div className="ad-spinner" /><p>Loading users…</p></div>
        ) : filtered.length === 0 ? (
          <p className="ad-empty">No users match your filters.</p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Phone</th><th>Role</th>
                  <th>Status</th><th>Joined</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.user_id}>
                    <td className="ad-td-bold">{u.first_name} {u.last_name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td><span className={`ad-role-pill ${ROLE_CLASS[u.role_id]}`}>{ROLE_LABEL[u.role_id] ?? 'Unknown'}</span></td>
                    <td><span className={`ad-status-pill ${STATUS_CLASS[u.account_status]}`}>{u.account_status}</span></td>
                    <td>{formatDate(u.created_at)}</td>
                    <td>
                      <div className="ad-action-group">
                        <button
                          className={`ad-btn-action ${u.account_status === 'Active' ? 'ad-btn-action--warn' : 'ad-btn-action--success'}`}
                          onClick={() => updateStatus(u.user_id, nextStatus[u.account_status])}
                          disabled={updating === u.user_id}
                        >
                          {updating === u.user_id ? '…' : nextLabel[u.account_status]}
                        </button>
                        {u.account_status !== 'Suspended' && (
                          <button
                            className="ad-btn-action ad-btn-action--danger"
                            onClick={() => updateStatus(u.user_id, 'Suspended')}
                            disabled={updating === u.user_id}
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Appointments Tab ──────────────────────────────────────────────────────────
function AppointmentsTab() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError]               = useState('');
  const token = localStorage.getItem('token');

  function load() {
    setLoading(true);
    fetch('/api/admin/appointments', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.appointments) setAppointments(data.appointments); })
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = appointments.filter(a => {
    const nameMatch = `${a.patient_first} ${a.patient_last} ${a.provider_first} ${a.provider_last} ${a.reason ?? ''}`
      .toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === 'all' || a.status === statusFilter;
    return nameMatch && statusMatch;
  });

  const counts = ['Pending','Confirmed','Completed','Cancelled'].reduce((acc, s) => {
    acc[s] = appointments.filter(a => a.status === s).length;
    return acc;
  }, {});

  return (
    <div className="ad-tab-content">
      <div className="ad-tab-header">
        <h2 className="ad-page-title">All Appointments</h2>
        <button className="ad-btn-refresh" onClick={load}>
          <IconRefresh /> Refresh
        </button>
      </div>

      {/* Mini stat strip */}
      <div className="ad-mini-stats">
        {[
          { label: 'Pending',   val: counts.Pending,   cls: 'ad-mini--yellow' },
          { label: 'Confirmed', val: counts.Confirmed,  cls: 'ad-mini--green' },
          { label: 'Completed', val: counts.Completed,  cls: 'ad-mini--teal' },
          { label: 'Cancelled', val: counts.Cancelled,  cls: 'ad-mini--red' },
        ].map(s => (
          <div
            key={s.label}
            className={`ad-mini-stat ${s.cls}${statusFilter === s.label ? ' ad-mini-stat--active' : ''}`}
            onClick={() => setStatusFilter(f => f === s.label ? 'all' : s.label)}
            role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setStatusFilter(f => f === s.label ? 'all' : s.label)}
          >
            <span className="ad-mini-val">{s.val}</span>
            <span className="ad-mini-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="ad-filters-row">
        <div className="ad-search-wrap">
          <IconSearch />
          <input
            type="text"
            placeholder="Search by patient, provider or reason…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ad-search-input"
          />
        </div>
        <select className="ad-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {error && <p className="ad-error-banner">{error}</p>}

      <div className="ad-card">
        {loading ? (
          <div className="ad-loading"><div className="ad-spinner" /><p>Loading appointments…</p></div>
        ) : filtered.length === 0 ? (
          <p className="ad-empty">No appointments match your filters.</p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Patient</th><th>Provider</th><th>Specialty</th>
                  <th>Date &amp; Time</th><th>Reason</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.appointment_id}>
                    <td className="ad-td-bold">{a.patient_first} {a.patient_last}</td>
                    <td>Dr. {a.provider_first} {a.provider_last}</td>
                    <td>{a.specialisation || '—'}</td>
                    <td className="ad-td-nowrap">{formatDateTime(a.appointment_datetime)}</td>
                    <td className="ad-td-reason">{a.reason || '—'}</td>
                    <td>
                      <span className={`ad-status-pill ${APPT_STATUS_CLASS[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reports Tab ───────────────────────────────────────────────────────────────
function ReportsTab() {
  const [savedReports, setSavedReports] = useState([]);
  const [result, setResult]             = useState(null);
  const [resultType, setResultType]     = useState('');
  const [generating, setGenerating]     = useState('');
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError]               = useState('');
  const token = localStorage.getItem('token');

  function loadSaved() {
    setLoadingReports(true);
    fetch('/api/reports', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.reports) setSavedReports(data.reports); })
      .catch(() => {})
      .finally(() => setLoadingReports(false));
  }

  useEffect(() => { loadSaved(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function generate(type) {
    setGenerating(type);
    setResult(null);
    setError('');
    try {
      const res = await fetch(`/api/reports/${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to generate report.'); return; }
      setResult(data.report);
      setResultType(type);
      loadSaved();
    } catch {
      setError('Could not generate report. Please try again.');
    } finally {
      setGenerating('');
    }
  }

  function renderResult() {
    if (!result) return null;
    if (resultType === 'appointments') {
      const r = result;
      return (
        <div className="ad-report-result">
          <h4 className="ad-report-result-title">Appointments Report</h4>
          <div className="ad-report-grid">
            {[
              { label: 'Total', value: r.total_appointments },
              { label: 'Pending', value: r.pending },
              { label: 'Confirmed', value: r.confirmed },
              { label: 'Completed', value: r.completed },
              { label: 'Cancelled', value: r.cancelled },
            ].map(item => (
              <div key={item.label} className="ad-report-cell">
                <span className="ad-report-cell-val">{item.value}</span>
                <span className="ad-report-cell-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (resultType === 'users') {
      const r = result;
      return (
        <div className="ad-report-result">
          <h4 className="ad-report-result-title">Users Report</h4>
          <div className="ad-report-grid">
            {[
              { label: 'Total Users', value: r.total_users },
              { label: 'Patients', value: r.total_patients },
              { label: 'Providers', value: r.total_providers },
              { label: 'Active', value: r.active_users },
              { label: 'Inactive', value: r.inactive_users },
            ].map(item => (
              <div key={item.label} className="ad-report-cell">
                <span className="ad-report-cell-val">{item.value}</span>
                <span className="ad-report-cell-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (resultType === 'providers') {
      return (
        <div className="ad-report-result">
          <h4 className="ad-report-result-title">Provider Performance Report</h4>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr><th>Provider</th><th>Specialty</th><th>Degree</th><th>Total Appointments</th></tr>
              </thead>
              <tbody>
                {result.map(p => (
                  <tr key={p.user_id}>
                    <td className="ad-td-bold">Dr. {p.first_name} {p.last_name}</td>
                    <td>{p.specialisation || '—'}</td>
                    <td>{p.degree || '—'}</td>
                    <td>{p.total_appointments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    return null;
  }

  const reportCards = [
    { type: 'appointments', label: 'Appointments Report', desc: 'Summary of all appointments by status.', icon: <IconCalendar /> },
    { type: 'users',        label: 'Users Report',        desc: 'Breakdown of patients vs providers and account statuses.', icon: <IconUsers /> },
    { type: 'providers',    label: 'Provider Performance', desc: 'Appointment count per provider.', icon: <IconStethoscope /> },
  ];

  return (
    <div className="ad-tab-content">
      <div className="ad-tab-header">
        <h2 className="ad-page-title">Reports</h2>
      </div>

      <div className="ad-report-cards">
        {reportCards.map(rc => (
          <div key={rc.type} className="ad-report-card">
            <span className="ad-report-card-icon">{rc.icon}</span>
            <div className="ad-report-card-body">
              <p className="ad-report-card-title">{rc.label}</p>
              <p className="ad-report-card-desc">{rc.desc}</p>
            </div>
            <button
              className="ad-btn-generate"
              onClick={() => generate(rc.type)}
              disabled={!!generating}
            >
              {generating === rc.type ? <><span className="ad-spinner ad-spinner--sm" /> Generating…</> : 'Generate'}
            </button>
          </div>
        ))}
      </div>

      {error && <p className="ad-error-banner">{error}</p>}
      {renderResult()}

      {/* Saved reports history */}
      <div className="ad-card" style={{ marginTop: '1.5rem' }}>
        <h3 className="ad-section-title">Report History</h3>
        {loadingReports ? (
          <div className="ad-loading"><div className="ad-spinner" /></div>
        ) : savedReports.length === 0 ? (
          <p className="ad-empty">No reports generated yet.</p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr><th>Type</th><th>Generated By</th><th>Date</th><th>Parameters</th></tr>
              </thead>
              <tbody>
                {savedReports.map(r => (
                  <tr key={r.report_id}>
                    <td><span className="ad-role-pill ad-role--provider">{r.report_type}</span></td>
                    <td>{r.first_name} {r.last_name}</td>
                    <td className="ad-td-nowrap">{formatDateTime(r.generated_at)}</td>
                    <td>{r.parameters}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
function AdminPortal() {
  const [activeTab, setActiveTab]     = useState('overview');
  const [admin, setAdmin]             = useState({ firstName: '', lastName: '' });
  const [dashData, setDashData]       = useState(null);
  const [dashLoading, setDashLoading] = useState(true);

  useEffect(() => {
    const token   = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) { window.location.href = '/login'; return; }
    const currentUser = JSON.parse(userStr);
    if (currentUser.role_id !== 3) {
      window.location.href = currentUser.role_id === 2 ? '/doctor-portal' : '/patient-portal';
      return;
    }
    setAdmin({ firstName: currentUser.first_name, lastName: currentUser.last_name });

    fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setDashData(data); })
      .catch(() => {})
      .finally(() => setDashLoading(false));
  }, []);

  return (
    <div className="ad-page">
      <AdminNav admin={admin} />
      <div className="ad-body">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="ad-main">
          {activeTab === 'overview'     && <OverviewTab dashData={dashData} loading={dashLoading} />}
          {activeTab === 'users'        && <UsersTab />}
          {activeTab === 'appointments' && <AppointmentsTab />}
          {activeTab === 'reports'      && <ReportsTab />}
        </main>
      </div>
    </div>
  );
}

export default AdminPortal;
