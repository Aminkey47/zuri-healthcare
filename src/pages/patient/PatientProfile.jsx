
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Plus,
  UserRound,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Mail,
  Phone,
  MapPin,
  HeartPulse,
  ShieldCheck,
} from 'lucide-react';

import '../../styles/patient.css';

function PatientProfile() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('zuri_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      setUser(null);
    }
  }, []);

  const patientName = user?.full_name || 'Patient';

  const initials = patientName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  const handleLogout = () => {
    localStorage.removeItem('zuri_token');
    localStorage.removeItem('zuri_user');
    window.location.href = '/login';
  };

  const profileFields = [
    { label: 'Full Name', value: user?.full_name, icon: UserRound },
    { label: 'Email Address', value: user?.email, icon: Mail },
    { label: 'Phone Number', value: user?.phone, icon: Phone },
    { label: 'Address', value: user?.address, icon: MapPin },
  ].filter((field) => field.value);

  return (
    <div className={`patient-app patient-profile-app ${darkMode ? 'patient-dark' : ''}`}>
      <aside
        className={`patient-sidebar ${sidebarOpen ? 'patient-sidebar-mobile-open' : ''}`}
      >
        <div className="patient-brand">
          <Link to="/" className="patient-brand-link">
            <div className="patient-brand-mark">Z</div>
            <div className="patient-brand-name">
              <strong>Zuri</strong>
              <span>HEALTHCARE</span>
            </div>
          </Link>

          <button
            className="patient-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="patient-sidebar-label">WORKSPACE</div>

        <nav className="patient-navigation">
          <NavLink
            to="/patient"
            end
            className={({ isActive }) =>
              `patient-nav-link ${isActive ? 'active' : ''}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <a
            href="/patient#appointments"
            className="patient-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <CalendarDays size={20} />
            <span>Appointments</span>
          </a>

          <a
            href="/patient#book-appointment"
            className="patient-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <Plus size={20} />
            <span>Book Appointment</span>
          </a>

          <NavLink
            to="/patient/profile"
            className={({ isActive }) =>
              `patient-nav-link ${isActive ? 'active' : ''}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <UserRound size={20} />
            <span>My Profile</span>
          </NavLink>
        </nav>

        <div className="patient-sidebar-bottom">
          <div className="patient-sidebar-help">
            <div className="patient-help-icon">
              <HeartPulse size={18} />
            </div>
            <strong>Your health matters</strong>
            <p>Stay connected with your healthcare team.</p>
          </div>

          <button
            className="patient-nav-link patient-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="patient-mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <div className="patient-main">
        <header className="patient-topbar">
          <div className="patient-topbar-left">
            <button
              className="patient-menu-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="patient-breadcrumb">
              <span>Workspace</span>
              <span className="patient-breadcrumb-divider">/</span>
              <strong>My Profile</strong>
            </div>
          </div>

          <div className="patient-topbar-right">
            <button
              className="patient-icon-button"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <div className="patient-topbar-divider" />

            <div className="patient-header-user">
              <div className="patient-header-avatar">{initials || 'P'}</div>
              <div className="patient-header-user-info">
                <strong>{patientName}</strong>
                <span>Patient</span>
              </div>
            </div>
          </div>
        </header>

        <main className="patient-content">
          <section className="patient-welcome">
            <div>
              <p className="patient-eyebrow">PATIENT PORTAL</p>
              <h1>My Profile</h1>
              <p>Manage and view your personal information.</p>
            </div>
          </section>

          <section className="patient-profile-card">
            <div className="patient-profile-banner">
              <div className="patient-profile-avatar">
                <UserRound size={34} />
              </div>

              <div>
                <h2>{patientName}</h2>
              </div>
            </div>

            <div className="patient-profile-section-heading">
              <div>
                <h3>Personal Information</h3>
                <p>Your registered contact details.</p>
              </div>
              <ShieldCheck size={22} />
            </div>

            <div className="patient-profile-information">
              {profileFields.length > 0 ? (
                profileFields.map((field) => {
                  const Icon = field.icon;

                  return (
                    <div className="patient-profile-field" key={field.label}>
                      <span className="patient-profile-label">
                        <Icon size={17} />
                        {field.label}
                      </span>

                      <strong className="patient-profile-value">
                        — {field.value}
                      </strong>
                    </div>
                  );
                })
              ) : (
                <p>No account information is currently available.</p>
              )}
            </div>
          </section>
        </main>

        <footer className="patient-footer">
          <span>© {new Date().getFullYear()} Zuri Healthcare.</span>
          <span>Innovation for Better Care.</span>
        </footer>
      </div>
    </div>
  );
}

export default PatientProfile;
