
import { Link } from 'react-router-dom';
import { ArrowRight, HeartPulse, CalendarDays, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <main className="home-page">
      <nav className="top-nav">
        <Link to="/" className="brand">
          <span className="brand-mark">Z</span>
          <span>Zuri <small>Healthcare</small></span>
        </Link>

        <div className="nav-actions">
          <Link to="/login" className="nav-login">Sign in</Link>
          <Link to="/register" className="primary-button nav-cta">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A MORE CONNECTED HEALTHCARE EXPERIENCE</p>
          <h1>Better care begins with a <em>better connection.</em></h1>
          <p className="hero-description">
            Zuri Healthcare brings patients and medical professionals together
            through a simpler, more thoughtful healthcare experience.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="primary-button">
              Create your account <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="secondary-button">Sign in</Link>
          </div>

          <p className="hero-note">Your care journey, organised in one place.</p>
        </div>

        <div className="hero-art">
          <div className="art-circle">
            <div className="art-inner">
              <HeartPulse size={76} strokeWidth={1.2} />
              <span>Care, connected.</span>
            </div>
          </div>
          <div className="floating-card">
            <CalendarDays size={21} />
            <div><strong>Appointments</strong><small>Made simpler</small></div>
          </div>
          <div className="floating-card second-card">
            <ShieldCheck size={21} />
            <div><strong>Your care matters</strong><small>Designed around you</small></div>
          </div>
        </div>
      </section>

      <section className="features">
        <div>
          <HeartPulse />
          <h3>Patient-centred care</h3>
          <p>A clear place to manage your healthcare journey.</p>
        </div>
        <div>
          <CalendarDays />
          <h3>Appointment management</h3>
          <p>Request and follow up on your appointments.</p>
        </div>
        <div>
          <ShieldCheck />
          <h3>Connected professionals</h3>
          <p>Bringing patients and healthcare teams together.</p>
        </div>
      </section>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Zuri Healthcare</span>
        <span>Innovation for Better Care.</span>
      </footer>
    </main>
  );
}
