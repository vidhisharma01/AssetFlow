import { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/v1/identity/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Invalid credentials');
      }
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fill = (e, p) => { setEmail(e); setPassword(p); };

  return (
    <div className="login-wrap">
      <div className="login-card animate-fade-in">
        <div style={{ marginBottom: '1.75rem' }}>
          <div className="login-logo">AssetFlow</div>
          <div className="login-sub">Enterprise Asset Management</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary w-full" style={{ padding: '0.625rem', marginTop: '0.25rem' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <hr className="divider" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p className="text-muted text-sm" style={{ marginBottom: '0.5rem' }}>Quick access</p>
          <button className="btn btn-secondary w-full" onClick={() => fill('admin@assetflow.com','password123')}>
            Sign in as Admin
          </button>
          <button className="btn btn-secondary w-full" onClick={() => fill('employee@assetflow.com','password123')}>
            Sign in as Employee
          </button>
        </div>

        <p style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          No account?{' '}
          <span style={{ color: 'var(--accent-hover)', cursor: 'pointer', fontWeight: 500 }}
            onClick={() => alert('Signup: POST /api/v1/identity/auth/signup')}>
            Request access
          </span>
        </p>
      </div>
    </div>
  );
}
