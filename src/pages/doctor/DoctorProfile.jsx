import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  LogOut,
  Menu,
  UserRound,
  Mail,
  Phone,
  Stethoscope,
  GraduationCap,
  BadgeCheck,
  CreditCard,
  Clock3,
  X,
} from 'lucide-react';

import { apiRequest } from '../../services/api';
import '../../styles/doctor.css';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('zuri_user') || '{}');
  } catch {
    return {};
  }
}

export default function DoctorProfile() {
  const navigate = useNavigate();
  const user = getStoredUser();

  // Sidebar starts open on desktop and closed on mobile.
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 1100
  );

  const [doctor, setDoctor] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiRequest('/doctor');
        const data = response.data || response;

        setDoctor(data.doctor || {});
      } catch (err) {
        setError(
          err.message || 'Unable to load your professional profile.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const doctorName =
    doctor.full_name ||
    doctor.name ||
    user.full_name ||
    user.name ||
    'Doctor';

  const profileFields = [
    {
      label: 'Full name',
      value: doctor.full_name || doctor.name || user.full_name || user.name,
      icon: UserRound,
    },
    {
      label: 'Email address',
      value: doctor.email || user.email,
      icon: Mail,
    },
    {
      label: 'Phone number',
      value: doctor.phone,
      icon: Phone,
    },
    {
      label: 'Specialisation',
      value: doctor.specialization,
      icon: Stethoscope,
    },
    {
      label: 'Qualification',
      value: doctor.qualification,
      icon: GraduationCap,
    },
    {
      label: 'Medical licence number',
      value: doctor.license_number,
      icon: BadgeCheck,
    },
    {
      label: 'Consultation fee',
      value:
        doctor.consultation_fee !== null &&
        doctor.consultation_fee !== undefined &&
        doctor.consultation_fee !== ''
          ? `KES ${Number(doctor.consultation_fee).toLocaleString('en-KE')}`
          : null,
      icon: CreditCard,
    },
    {
      label: 'Availability',
      value: doctor.availability_status
        ? doctor.availability_status.charAt(0).toUpperCase() +
          doctor.availability_status.slice(1)
        : null,
      icon: Clock3,
    },
  ].filter(
    (field) =>
      field.value !== null &&
      field.value !== undefined &&
      field.value !== ''
  );

  const handleLogout = () => {
    localStorage.removeItem('zuri_token');
    localStorage.removeItem('zuri_user');
    navigate('/login');
  };

  return (
    <div className="doctor-app">
      {sidebarOpen && (
        <button
          type="button"
          className="doctor-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`doctor-sidebar ${
          sidebarOpen ? 'doctor-sidebar-open' : 'doctor-sidebar-closed'
        }`}
      >
        <div className="doctor-brand">
          <Link
            to="/"
            className="doctor-brand-link"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="doctor-brand-icon">
              <Activity size={22} />
            </span>

            <span>
              <strong>Zuri Healthcare</strong>
              <small>Innovation for Better Care</small>
            </span>
          </Link>

          <button
            type="button"
            className="doctor-close-menu"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={21} />
          </button>
        </div>

        <div className="doctor-sidebar-label">WORKSPACE</div>

        <nav className="doctor-navigation">
          <Link
            to="/doctor"
            className="doctor-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <CalendarDays size={19} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/doctor/profile"
            className="doctor-nav-link active"
            onClick={() => setSidebarOpen(false)}
          >
            <UserRound size={19} />
            <span>My Profile</span>
          </Link>
        </nav>

        <div className="doctor-sidebar-bottom">
          <div className="doctor-sidebar-user">
            <div className="doctor-avatar">
              {doctorName.charAt(0).toUpperCase()}
            </div>

            <div className="doctor-user-details">
              <strong>{doctorName}</strong>
              <span>{doctor.specialization || 'Doctor'}</span>
            </div>
          </div>

          <button
            type="button"
            className="doctor-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="doctor-main">
        <header className="doctor-topbar">
          <button
            type="button"
            className="doctor-menu-button"
            aria-label="Toggle navigation"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <Menu size={23} />
          </button>

          <div className="doctor-page-heading">
            <span>DOCTOR WORKSPACE</span>
            <h1>My Profile</h1>
          </div>

          <Link to="/doctor" className="doctor-back-link">
            <ArrowLeft size={17} />
            Dashboard
          </Link>
        </header>

        <div className="doctor-content">
          <section className="doctor-profile-heading">
            <div className="doctor-profile-avatar">
              {doctorName.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="doctor-eyebrow">PROFESSIONAL PROFILE</p>
              <h2>{doctorName}</h2>
              <p>{doctor.specialization || 'Medical Practitioner'}</p>
            </div>
          </section>

          {error && (
            <div className="doctor-alert doctor-alert-error">
              <span>{error}</span>
            </div>
          )}

          <section className="doctor-profile-card">
            <div className="doctor-section-heading">
              <div>
                <h2>Account information</h2>
                <p>Your registered account and professional details.</p>
              </div>
            </div>

            {loading ? (
              <div className="doctor-empty-state">
                <p>Loading profile information...</p>
              </div>
            ) : profileFields.length > 0 ? (
              <div className="doctor-profile-grid">
                {profileFields.map((field) => {
                  const Icon = field.icon;

                  return (
                    <div
                      className="doctor-profile-field"
                      key={field.label}
                    >
                      <span className="doctor-profile-field-label">
                        <Icon size={17} />
                        {field.label}
                      </span>

                      <strong>— {field.value}</strong>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="doctor-empty-state">
                <UserRound size={32} />
                <h3>No profile information available</h3>
                <p>
                  Your professional details have not been returned by the
                  server.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}