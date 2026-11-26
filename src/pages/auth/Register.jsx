
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    address: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(form);
      navigate('/login', {
        state: { message: 'Account created successfully. Please log in.' },
      });
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
          <p className="eyebrow">YOUR HEALTH, OUR PRIORITY</p>
          <h1>Create your account</h1>
          <p>Join Zuri Healthcare and manage your care with confidence.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Full name</label>
          <input name="full_name" value={form.full_name} onChange={handleChange} required placeholder="Your full name" />

          <label>Email address</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />

          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required minLength="8" placeholder="At least 8 characters" />

          <div className="form-grid">
            <div>
              <label>Date of birth</label>
              <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
            </div>
            <div>
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <label>Phone number</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 0712345678" />

          <label>Address</label>
          <input name="address" value={form.address} onChange={handleChange} placeholder="Your location" />

          {error && <p className="form-error">{error}</p>}

          <button className="primary-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>

      <aside className="auth-visual">
        <div className="visual-content">
          <span className="visual-symbol">✳</span>
          <p className="eyebrow">A BETTER WAY TO MANAGE YOUR HEALTH</p>
          <h2>Care that moves with you.</h2>
          <p>Access your healthcare journey in one thoughtful, connected place.</p>
        </div>
        <span className="visual-footer">ZURI HEALTHCARE · INNOVATION FOR BETTER CARE</span>
      </aside>
    </main>
  );
}
