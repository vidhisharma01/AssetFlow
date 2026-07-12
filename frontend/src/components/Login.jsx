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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Store token securely in localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>AssetFlow</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@assetflow.com"
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>

          {error && (
            <div style={{ 
              color: 'var(--status-rejected-text)', 
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '0.75rem',
              borderRadius: '4px',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>New here?</p>
          <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Sign up creates an employee account<br/>
            admin roles assigned later
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%' }}
            onClick={() => alert("Signup endpoint ready. Wire to /api/v1/identity/auth/signup")}
          >
            Create Account
          </button>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Or use a 1-click demo account:
          </p>
          <div className="flex flex-col" style={{ gap: '0.75rem' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setEmail('admin@assetflow.com');
                setPassword('password123');
              }}
            >
              👑 Fill Admin Credentials
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setEmail('employee@assetflow.com');
                setPassword('password123');
              }}
            >
              👤 Fill Employee Credentials
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
