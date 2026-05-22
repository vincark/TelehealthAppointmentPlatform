import { useEffect } from 'react';

function GoogleCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const token = params.get('token');
    const user_id = params.get('user_id');
    const role_id = params.get('role_id');
    const first_name = params.get('first_name');
    const last_name = params.get('last_name');
    const email = params.get('email');

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        user_id,
        role_id: parseInt(role_id),
        first_name,
        last_name,
        email
      }));

      // Force full page redirect based on role
      const role = parseInt(role_id);
      if (role === 1) window.location.href = '/patient-portal';
      else if (role === 2) window.location.href = '/doctor-portal';
      else if (role === 3) window.location.href = '/admin-portal';
      else window.location.href = '/';
    } else {
      window.location.href = '/login?error=google_failed';
    }
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#2c7a7b' }}>Signing you in with Google...</h2>
        <p>Please wait a moment! 😊</p>
      </div>
    </div>
  );
}

export default GoogleCallback;