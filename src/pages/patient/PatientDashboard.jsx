import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  UserRound,
  Stethoscope,
  Clock3,
  CheckCircle2,
  ClipboardList,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Plus,
  RefreshCw,
  HeartPulse,
  AlertCircle,
  CalendarCheck,
  ArrowUpRight,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import '../../styles/patient.css';

function PatientDashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [form, setForm] = useState({
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
  });

  const savedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('zuri_user') || '{}');
    } catch {
      return {};
    }
  })();

  const patientName = savedUser.full_name || 'Patient';
  const initials = patientName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  const today = new Date().toLocaleDateString('en-CA');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const [dashboardResponse, doctorResponse] = await Promise.all([
        apiRequest('/patient'),
        apiRequest('/doctors'),
      ]);

      setStatistics(dashboardResponse.statistics || {});
      setAppointments(dashboardResponse.appointments || []);
      setDoctors(
        doctorResponse.doctors ||
        doctorResponse.data ||
        []
      );
    } catch (err) {
      setError(err.message || 'Unable to load your dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleFormChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleBooking = async (event) => {
    event.preventDefault();
    setBooking(true);
    setError('');
    setNotice('');

    try {
      await apiRequest('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          doctor_id: Number(form.doctor_id),
          appointment_date: form.appointment_date,
          appointment_time: form.appointment_time,
          reason: form.reason,
        }),
      });

      setNotice('Your appointment request has been submitted successfully.');

      setForm({
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        reason: '',
      });

      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Unable to submit your appointment request.');
    } finally {
      setBooking(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('zuri_token');
    localStorage.removeItem('zuri_user');
    window.location.href = '/login';
  };

  const getStatusClass = (status) => {
    return `patient-status patient-status-${String(status || 'pending').toLowerCase()}`;
  };

  const getDoctorName = (doctor) => {
    return doctor.full_name || doctor.name || 'Medical professional';
  };

  const getDoctorNameFromAppointment = (appointment) => {
    return (
      appointment.doctor_name ||
      appointment.full_name ||
      'Doctor'
    );
  };

  const formatDate = (date) => {
    if (!date) return '—';

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const pendingCount = statistics.pending ?? 0;
  const approvedCount = statistics.approved ?? 0;
  const completedCount = statistics.completed ?? 0;
  const totalCount = statistics.total ?? appointments.length;

  return (
    <div className={`patient-app patient-dashboard-app ${darkMode ? 'patient-dark' : ''}`}>

      {/* SIDEBAR */}
      <aside className={`patient-sidebar ${mobileMenuOpen ? 'patient-sidebar-mobile-open' : ''}`}>
        <div className="patient-brand">
          <div className="patient-brand-mark">Z</div>

          <div className="patient-brand-name">
            <strong>Zuri</strong>
            <span>HEALTHCARE</span>
          </div>

          <button
            className="patient-mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="patient-sidebar-label">
          WORKSPACE
        </div>

        <nav className="patient-navigation">
          <NavLink
            to="/patient"
            end
            title="Dashboard"
            className={({ isActive }) =>
              `patient-nav-link ${isActive ? 'active' : ''}`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <a
            href="#appointments"
            title="Appointments"
            className="patient-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <CalendarDays size={20} />
            <span>Appointments</span>
          </a>

          <a
            href="#book-appointment"
            title="Book appointment"
            className="patient-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Plus size={20} />
            <span>Book Appointment</span>
          </a>

          <a
            href="#available-doctors"
            title="Find doctors"
            className="patient-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Stethoscope size={20} />
            <span>Find Doctors</span>
          </a>
        </nav>

        <div className="patient-sidebar-label">
          ACCOUNT
        </div>

        <nav className="patient-navigation">
          <NavLink
            to="/patient/profile"
            title="My profile"
            className={({ isActive }) =>
              `patient-nav-link ${isActive ? 'active' : ''}`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <UserRound size={20} />
            <span>My Profile</span>
          </NavLink>
        </nav>

        <div className="patient-sidebar-bottom">
          <div className="patient-sidebar-help">
            <div className="patient-help-icon">
              <HeartPulse size={19} />
            </div>
            <strong>Your health matters.</strong>
            <p>Stay connected with your healthcare team.</p>
          </div>

          <button
            className="patient-nav-link patient-logout-button"
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          className="patient-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* MAIN AREA */}
      <div className="patient-main">

        {/* HEADER */}
        <header className="patient-topbar">
          <div className="patient-topbar-left">
            <button
              className="patient-menu-button"
              onClick={() => setMobileMenuOpen(value => !value)}
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="patient-breadcrumb">
              <span>Workspace</span>
              <span className="patient-breadcrumb-divider">/</span>
              <strong>Dashboard</strong>
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

        {/* PAGE CONTENT */}
        <main className="patient-content">

          <section className="patient-welcome">
            <div>
              <p className="patient-eyebrow">PATIENT PORTAL</p>
              <h1>Good day, {patientName.split(' ')[0]}.</h1>
              <p>
                Welcome back. Here's an overview of your healthcare activity.
              </p>
            </div>

            <div className="patient-welcome-date">
              <CalendarDays size={18} />
              <span>
                {new Date().toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </section>

          {error && (
            <div className="patient-alert patient-alert-error">
              <AlertCircle size={19} />
              <span>{error}</span>
              <button onClick={loadDashboard}>Try again</button>
            </div>
          )}

          {notice && (
            <div className="patient-alert patient-alert-success">
              <CheckCircle2 size={19} />
              <span>{notice}</span>
              <button onClick={() => setNotice('')}>Dismiss</button>
            </div>
          )}

          {/* STATISTICS */}
          <section className="patient-stat-grid">
            <article className="patient-stat-card">
              <div className="patient-stat-top">
                <div className="patient-stat-icon icon-terracotta">
                  <CalendarDays size={21} />
                </div>
                <span className="patient-stat-caption">ALL TIME</span>
              </div>
              <strong className="patient-stat-number">
                {loading ? '—' : totalCount}
              </strong>
              <span className="patient-stat-label">Total appointments</span>
            </article>

            <article className="patient-stat-card">
              <div className="patient-stat-top">
                <div className="patient-stat-icon icon-amber">
                  <Clock3 size={21} />
                </div>
                <span className="patient-stat-caption">AWAITING REVIEW</span>
              </div>
              <strong className="patient-stat-number">
                {loading ? '—' : pendingCount}
              </strong>
              <span className="patient-stat-label">Pending requests</span>
            </article>

            <article className="patient-stat-card">
              <div className="patient-stat-top">
                <div className="patient-stat-icon icon-green">
                  <CalendarCheck size={21} />
                </div>
                <span className="patient-stat-caption">CONFIRMED</span>
              </div>
              <strong className="patient-stat-number">
                {loading ? '—' : approvedCount}
              </strong>
              <span className="patient-stat-label">Approved appointments</span>
            </article>

            <article className="patient-stat-card">
              <div className="patient-stat-top">
                <div className="patient-stat-icon icon-blue">
                  <ClipboardList size={21} />
                </div>
                <span className="patient-stat-caption">FINALISED</span>
              </div>
              <strong className="patient-stat-number">
                {loading ? '—' : completedCount}
              </strong>
              <span className="patient-stat-label">Completed visits</span>
            </article>
          </section>

          {/* MAIN DASHBOARD GRID */}
          <section className="patient-dashboard-grid">

            {/* BOOKING FORM */}
            <article
              className="patient-card patient-booking-card"
              id="book-appointment"
            >
              <div className="patient-card-heading">
                <div>
                  <span className="patient-eyebrow">GET MEDICAL CARE</span>
                  <h2>Book an appointment</h2>
                  <p>Request a consultation with one of our doctors.</p>
                </div>
                <div className="patient-heading-icon">
                  <Plus size={22} />
                </div>
              </div>

              <form
                className="patient-booking-form"
                onSubmit={handleBooking}
              >
                <label>
                  Choose your doctor
                  <select
                    name="doctor_id"
                    value={form.doctor_id}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((doctor) => (
                      <option
                        key={doctor.doctor_id}
                        value={doctor.doctor_id}
                      >
                        {getDoctorName(doctor)} — {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="patient-form-row">
                  <label>
                    Preferred date
                    <input
                      type="date"
                      name="appointment_date"
                      min={today}
                      value={form.appointment_date}
                      onChange={handleFormChange}
                      required
                    />
                  </label>

                  <label>
                    Preferred time
                    <input
                      type="time"
                      name="appointment_time"
                      value={form.appointment_time}
                      onChange={handleFormChange}
                      required
                    />
                  </label>
                </div>

                <label>
                  Reason for visit
                  <textarea
                    name="reason"
                    rows="4"
                    placeholder="Describe the reason for your appointment..."
                    value={form.reason}
                    onChange={handleFormChange}
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="patient-primary-button"
                  disabled={booking || doctors.length === 0}
                >
                  <CalendarCheck size={18} />
                  {booking ? 'Submitting request...' : 'Request appointment'}
                </button>

                {doctors.length === 0 && !loading && (
                  <p className="patient-form-note">
                    No available doctors are currently listed.
                  </p>
                )}
              </form>
            </article>

            {/* AVAILABLE DOCTORS */}
            <article
              className="patient-card patient-doctors-card"
              id="available-doctors"
            >
              <div className="patient-card-heading">
                <div>
                  <span className="patient-eyebrow">OUR MEDICAL TEAM</span>
                  <h2>Available doctors</h2>
                  <p>Find a healthcare professional for your needs.</p>
                </div>
                <div className="patient-heading-icon">
                  <Stethoscope size={22} />
                </div>
              </div>

              {loading ? (
                <div className="patient-empty-state">
                  <RefreshCw className="patient-spinner" size={23} />
                  <p>Loading doctors...</p>
                </div>
              ) : doctors.length === 0 ? (
                <div className="patient-empty-state">
                  <Stethoscope size={30} />
                  <h3>No doctors available</h3>
                  <p>Available doctors will appear here.</p>
                </div>
              ) : (
                <div className="patient-doctor-list">
                  {doctors.slice(0, 5).map((doctor) => (
                    <div
                      className="patient-doctor-item"
                      key={doctor.doctor_id}
                    >
                      <div className="patient-doctor-avatar">
                        <UserRound size={21} />
                      </div>

                      <div className="patient-doctor-details">
                        <strong>{getDoctorName(doctor)}</strong>
                        <span>{doctor.specialization}</span>
                        {doctor.qualification && (
                          <small>{doctor.qualification}</small>
                        )}
                      </div>

                      <span className="patient-available-indicator">
                        Available
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <a
                href="#book-appointment"
                className="patient-text-link"
              >
                Book with a doctor <ArrowUpRight size={16} />
              </a>
            </article>
          </section>

          {/* APPOINTMENTS */}
          <section
            className="patient-card patient-appointments-card"
            id="appointments"
          >
            <div className="patient-card-heading patient-appointments-heading">
              <div>
                <span className="patient-eyebrow">YOUR HEALTHCARE RECORD</span>
                <h2>Recent appointments</h2>
                <p>Review the status of your appointment requests.</p>
              </div>

              <button
                className="patient-refresh-button"
                onClick={loadDashboard}
                disabled={loading}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="patient-empty-state">
                <RefreshCw className="patient-spinner" size={24} />
                <p>Loading your appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="patient-empty-state">
                <CalendarDays size={35} />
                <h3>No appointments yet</h3>
                <p>Your appointment history will appear here once you book.</p>
                <a href="#book-appointment" className="patient-empty-action">
                  Book your first appointment
                </a>
              </div>
            ) : (
              <div className="patient-table-wrapper">
                <table className="patient-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.appointment_id}>
                        <td>
                          <div className="patient-table-doctor">
                            <div className="patient-table-avatar">
                              <Stethoscope size={16} />
                            </div>
                            <strong>
                              {getDoctorNameFromAppointment(appointment)}
                            </strong>
                          </div>
                        </td>

                        <td>{formatDate(appointment.appointment_date)}</td>
                        <td>{appointment.appointment_time || '—'}</td>
                        <td>{appointment.reason || '—'}</td>

                        <td>
                          <span className={getStatusClass(appointment.status)}>
                            {appointment.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="patient-bottom-note">
            <HeartPulse size={19} />
            <span>
              Your health journey matters. Zuri Healthcare is here to support
              you every step of the way.
            </span>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="patient-footer">
          <span>© {new Date().getFullYear()} Zuri Healthcare.</span>
          <span>Innovation for Better Care.</span>
        </footer>
      </div>
    </div>
  );
}

export default PatientDashboard;