import { useState, useEffect } from 'react';
import './Providers.css';

function getProviderPhoto(provider) {
  if (provider.profile_picture) return provider.profile_picture;
  const id = (provider.user_id % 70) + 1;
  if (provider.sex === 'Female') return `https://randomuser.me/api/portraits/women/${id}.jpg`;
  return `https://randomuser.me/api/portraits/men/${id}.jpg`;
}


function StarDisplay({ average, count }) {
  const avg = parseFloat(average) || 0;
  return (
    <div className="prov-rating">
      <div className="prov-stars">
        {[1, 2, 3, 4, 5].map(s => (
          <svg key={s} viewBox="0 0 24 24" width="15" height="15"
            fill={s <= Math.round(avg) ? '#f59e0b' : '#d1d5db'}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
      </div>
      {count > 0 ? (
        <span className="prov-rating-text">{avg.toFixed(1)} ({count} review{count !== 1 ? 's' : ''})</span>
      ) : (
        <span className="prov-rating-none">No reviews yet</span>
      )}
    </div>
  );
}

function ProviderCard({ provider, userRole }) {
  const photo = getProviderPhoto(provider);
  const fullName = `Dr. ${provider.first_name} ${provider.last_name}`;
  const languages = provider.spoken_language
    ? provider.spoken_language.split(',').map(l => l.trim()).filter(Boolean)
    : [];

  function handleBook() {
    if (!userRole) {
      window.location.href = '/login';
    } else if (userRole === 1) {
      window.location.href = `/patient-portal?book=${provider.user_id}`;
    }
  }

  return (
    <div className="prov-card">
      <div className="prov-card-photo-wrap">
        <img
          src={photo}
          alt={fullName}
          className="prov-card-photo"
          onError={e => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement.classList.add('prov-card-photo-fallback');
          }}
        />
        <div className="prov-card-photo-initials" aria-hidden="true">
          {provider.first_name?.[0]}{provider.last_name?.[0]}
        </div>
      </div>

      <div className="prov-card-body">
        <div className="prov-card-top">
          <div>
            <h3 className="prov-card-name">
              {fullName}
              {provider.degree && <span className="prov-card-degree">, {provider.degree}</span>}
            </h3>
            {provider.specialisation && (
              <p className="prov-card-specialty">{provider.specialisation}</p>
            )}
          </div>
        </div>

        {provider.bio && (
          <p className="prov-card-bio">{provider.bio}</p>
        )}

        <StarDisplay average={provider.avg_rating} count={parseInt(provider.rating_count) || 0} />

        <div className="prov-card-tags">
          {languages.length > 0 && (
            <span className="prov-tag prov-tag--lang">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              {languages.join(', ')}
            </span>
          )}
          {provider.degree && (
            <span className="prov-tag prov-tag--degree">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              {provider.degree}
            </span>
          )}
          <span className="prov-tag prov-tag--available">
            <span className="prov-available-dot" />
            Available Now
          </span>
        </div>

        <div className="prov-card-footer">
          {userRole === 2 ? (
            <span className="prov-tag prov-tag--provider-note">You are signed in as a provider</span>
          ) : (
            <button className="prov-btn-book" onClick={handleBook}>
              {userRole === 1 ? 'Book Consultation' : 'Sign In to Book'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  );
}

function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All Specialties');

  const storedUser = localStorage.getItem('user');
  const userRole = storedUser ? JSON.parse(storedUser).role_id : null;

  useEffect(() => {
    fetch('/api/providers')
      .then(r => r.json())
      .then(data => { setProviders(data.providers || []); setLoading(false); })
      .catch(() => { setError('Could not load providers. Please try again.'); setLoading(false); });
  }, []);

  const specialties = ['All Specialties', ...new Set(
    providers.map(p => p.specialisation).filter(Boolean).sort()
  )];

  const filtered = providers.filter(p => {
    const matchSearch = search === '' ||
      `${p.first_name} ${p.last_name} ${p.specialisation} ${p.bio} ${p.spoken_language}`
        .toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = specialty === 'All Specialties' || p.specialisation === specialty;
    return matchSearch && matchSpecialty;
  });

  return (
    <div className="prov-page">

      {/* ── Hero header ── */}
      <div className="prov-hero">
        <div className="prov-hero-inner">
          <p className="prov-hero-eyebrow">Our Network</p>
          <h1 className="prov-hero-title">Find Your Provider</h1>
          <p className="prov-hero-sub">
            Browse our curated network of board-certified specialists.
          </p>

          <div className="prov-filters">
            <div className="prov-search-wrap">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search by name or keyword..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="prov-search-input"
              />
            </div>
            <div className="prov-select-wrap">
              <FilterIcon />
              <select
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                className="prov-select"
              >
                {specialties.map(s => <option key={s}>{s}</option>)}
              </select>
              <svg className="prov-select-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="prov-body">
        <div className="prov-body-inner">

          {loading ? (
            <div className="prov-loading">
              <div className="prov-spinner" />
              <p>Loading providers…</p>
            </div>
          ) : error ? (
            <div className="prov-error-msg">
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="prov-btn-primary-link">Retry</button>
            </div>
          ) : (
            <>
              <p className="prov-count">
                <strong>{filtered.length}</strong> provider{filtered.length !== 1 ? 's' : ''} found
              </p>
              {filtered.length === 0 ? (
                <div className="prov-empty">
                  <p>No providers match your search. Try a different keyword or specialty.</p>
                </div>
              ) : (
                <div className="prov-list">
                  {filtered.map(p => (
                    <ProviderCard key={p.user_id} provider={p} userRole={userRole} />
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Providers;
