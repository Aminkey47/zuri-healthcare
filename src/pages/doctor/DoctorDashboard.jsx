import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  Users,
  RefreshCw,
  X,
  AlertCircle,
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

function getStatus(status) {
  return String(status || 'pending').toLowerCase();
}

function formatDate(date) {
  if (!date) return 'Date not provided';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return parsedDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(time) {
  if (!time) return 'Time not provided';

  const match = String(time).match(/^(\d{1,2}):(\d{2})/);

  if (!match) return String(time);

  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);

  return date.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();

  // Sidebar starts open on desktop and closed on mobile.
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 1100
  );

  const [doctor, setDoctor] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/doctor');

      const data = response.data || response;

      setDoctor(data.doctor || {});

      setAppointments(
        Array.isArray(data.appointments) ? data.appointments : []
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

  const doctorName =
    doctor.full_name ||
    doctor.name ||
    user.full_name ||
    user.name ||
    'Doctor';

  const specialization =
    doctor.specialization || 'Medical Practitioner';

  const welcomeName = doctorName.replace(/^Dr\.?\s*/i, '');

  const counts = useMemo(() => {
    const totals = {
      total: appointments.length,
      pending: 0,
      approved: 0,
      declined: 0,
      completed: 0,
    };

    appointments.forEach((appointment) => {
      const status = getStatus(appointment.status);

      if (Object.prototype.hasOwnProperty.call(totals, status)) {
        totals[status] += 1;
      }
    });

    return totals;
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    if (filter === 'all') return appointments;

    return appointments.filter(
      (appointment) => getStatus(appointment.status) === filter
    );
  }, [appointments, filter]);

  const updateAppointment = async (appointmentId, status) => {
    if (!appointmentId) {
      setError('This appointment does not have a valid ID.');
      return;
    }

    setUpdatingId(appointmentId);
    setError('');
    setSuccess('');

    try {
      await apiRequest(`/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) => {
          const currentId =
            appointment.appointment_id ?? appointment.id;

          return String(currentId) === String(appointmentId)
            ? { ...appointment, status }
            : appointment;
        })
      );

      const messages = {
        approved: 'Appointment approved successfully.',
        declined: 'Appointment declined successfully.',
        completed: 'Appointment marked as completed.',
      };

      setSuccess(messages[status] || 'Appointment updated successfully.');
    } catch (err) {
      setError(err.message || 'Could not update this appointment.');
    } finally {
      setUpdatingId(null);
    }
  };

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
            className="doctor-nav-link active"
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>

          <a
            href="#appointments"
            className="doctor-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <CalendarDays size={19} />
            <span>Appointments</span>
          </a>

          <Link
            to="/doctor/profile"
            className="doctor-nav-link"
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
              <span>{specialization}</span>
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
            <h1>Dashboard</h1>
          </div>

          <Link to="/doctor/profile" className="doctor-header-profile">
            <div className="doctor-avatar">
              {doctorName.charAt(0).toUpperCase()}
            </div>
            <span>{doctorName}</span>
          </Link>
        </header>

        <div className="doctor-content">
          <section className="doctor-welcome">
            <div>
              <p className="doctor-eyebrow">YOUR WORKSPACE</p>
              <h2>Welcome back, Dr. {welcomeName}</h2>
              <p>
                Here is an overview of your appointments and patient requests.
              </p>
            </div>

            <button
              type="button"
              className="doctor-refresh-button"
              onClick={loadDashboard}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </section>

          {error && (
            <div className="doctor-alert doctor-alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="doctor-alert doctor-alert-success">
              <CheckCircle2 size={18} />
              <span>{success}</span>

              <button
                type="button"
                onClick={() => setSuccess('')}
                aria-label="Dismiss message"
              >
                <X size={17} />
              </button>
            </div>
          )}

          <section className="doctor-stat-grid">
            <div className="doctor-stat-card">
              <div className="doctor-stat-icon blue">
                <CalendarDays size={21} />
              </div>
              <div>
                <span>Total appointments</span>
                <strong>{loading ? '—' : counts.total}</strong>
              </div>
            </div>

            <div className="doctor-stat-card">
              <div className="doctor-stat-icon amber">
                <Clock3 size={21} />
              </div>
              <div>
                <span>Pending requests</span>
                <strong>{loading ? '—' : counts.pending}</strong>
              </div>
            </div>

            <div className="doctor-stat-card">
              <div className="doctor-stat-icon green">
                <CheckCircle2 size={21} />
              </div>
              <div>
                <span>Approved</span>
                <strong>{loading ? '—' : counts.approved}</strong>
              </div>
            </div>

            <div className="doctor-stat-card">
              <div className="doctor-stat-icon purple">
                <Users size={21} />
              </div>
              <div>
                <span>Completed</span>
                <strong>{loading ? '—' : counts.completed}</strong>
              </div>
            </div>
          </section>

          <section
            className="doctor-appointments-section"
            id="appointments"
          >
            <div className="doctor-section-heading">
              <div>
                <h2>Appointments</h2>
                <p>Review and manage your patient appointments.</p>
              </div>
            </div>

            <div className="doctor-filter-row">
              {[
                ['all', 'All'],
                ['pending', 'Pending'],
                ['approved', 'Approved'],
                ['declined', 'Declined'],
                ['completed', 'Completed'],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={`doctor-filter ${
                    filter === value ? 'selected' : ''
                  }`}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="doctor-empty-state">
                <RefreshCw
                  className="doctor-loading-icon"
                  size={25}
                />
                <h3>Loading appointments</h3>
                <p>
                  Please wait while we retrieve your appointments.
                </p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="doctor-empty-state">
                <CalendarDays size={35} />
                <h3>No appointments found</h3>
                <p>
                  {filter === 'all'
                    ? 'You do not have any appointments assigned to you yet.'
                    : `There are no ${filter} appointments at the moment.`}
                </p>
              </div>
            ) : (
              <div className="doctor-table-wrapper">
                <table className="doctor-appointments-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Date and time</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAppointments.map((appointment) => {
                      const status = getStatus(appointment.status);

                      const appointmentId =
                        appointment.appointment_id ?? appointment.id;

                      const patientName =
                        appointment.patient_name ||
                        appointment.full_name ||
                        appointment.name ||
                        'Patient';

                      const patientEmail =
                        appointment.patient_email ||
                        appointment.email ||
                        '';

                      return (
                        <tr key={appointmentId}>
                          <td>
                            <div className="doctor-patient-cell">
                              <div className="doctor-patient-avatar">
                                {patientName.charAt(0).toUpperCase()}
                              </div>

                              <div>
                                <strong>{patientName}</strong>
                                <span>{patientEmail || 'Patient'}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <strong>
                              {formatDate(appointment.appointment_date)}
                            </strong>
                            <span className="doctor-table-subtext">
                              {formatTime(appointment.appointment_time)}
                            </span>
                          </td>

                          <td className="doctor-reason-cell">
                            {appointment.reason || 'Not specified'}
                          </td>

                          <td>
                            <span className={`doctor-status ${status}`}>
                              {status}
                            </span>
                          </td>

                          <td>
                            <div className="doctor-action-buttons">
                              {status === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    className="doctor-action-button approve"
                                    disabled={updatingId === appointmentId}
                                    onClick={() =>
                                      updateAppointment(
                                        appointmentId,
                                        'approved'
                                      )
                                    }
                                  >
                                    <Check size={16} />
                                    Approve
                                  </button>

                                  <button
                                    type="button"
                                    className="doctor-action-button decline"
                                    disabled={updatingId === appointmentId}
                                    onClick={() =>
                                      updateAppointment(
                                        appointmentId,
                                        'declined'
                                      )
                                    }
                                  >
                                    <X size={16} />
                                    Decline
                                  </button>
                                </>
                              )}

                              {status === 'approved' && (
                                <button
                                  type="button"
                                  className="doctor-action-button complete"
                                  disabled={updatingId === appointmentId}
                                  onClick={() =>
                                    updateAppointment(
                                      appointmentId,
                                      'completed'
                                    )
                                  }
                                >
                                  <CheckCircle2 size={16} />
                                  Complete
                                </button>
                              )}

                              {updatingId === appointmentId && (
                                <span className="doctor-updating">
                                  Updating...
                                </span>
                              )}

                              {(status === 'declined' ||
                                status === 'completed') && (
                                <span className="doctor-no-action">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}