
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      const destinations = {
        patient: '/patient',
        doctor: '/doctor',
        admin: '/admin',
      };

      navigate(destinations[user.role] || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link to="/" className="brand">
          <span className="brand-mark">Z</span>
          <span>Zuri <small>Healthcare</small></span>
        </Link>

        <div className="auth-heading">
          <p className="eyebrow">WELCOME BACK</p>
          <h1>Sign in to Zuri</h1>
          <p>Continue to your personalised healthcare dashboard.</p>
        </div>

        {location.state?.message && (
          <p className="success-message">{location.state.message}</p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />

          {error && <p className="form-error">{error}</p>}

          <button className="primary-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          New to Zuri? <Link to="/register">Create an account</Link>
        </p>
      </section>

      <aside className="auth-visual">
        <div className="visual-content">
          <span className="visual-symbol">✳</span>
          <p className="eyebrow">CARE, CONNECTED</p>
          <h2>Your health deserves thoughtful care.</h2>
          <p>One platform connecting patients, doctors and healthcare administration.</p>
        </div>
        <span className="visual-footer">ZURI HEALTHCARE · INNOVATION FOR BETTER CARE</span>
      </aside>
    </main>
  );
}
