import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, Stethoscope, CalendarDays,
  Search, Plus, Bell, Menu, X, Sun, Moon, LogOut,
  Pencil, Trash2, CheckCircle, Clock, XCircle,
  Activity, UserRound, ChevronRight, RefreshCw,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import './AdminDashboard.css';

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays }
];

const emptyDoctor = {
  full_name: '',
  email: '',
  password: '',
  specialization: '',
  qualification: '',
  license_number: '',
  phone: '',
  consultation_fee: ''
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [dashboard, setDashboard] = useState({});
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const [doctorForm, setDoctorForm] = useState(emptyDoctor);
  const [patientForm, setPatientForm] = useState({});
  const [editingId, setEditingId] = useState(null);

  const user = JSON.parse(localStorage.getItem('zuri_user') || '{}');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const results = await Promise.all([
        apiRequest('/admin'),
        apiRequest('/admin/patients'),
        apiRequest('/admin/doctors'),
        apiRequest('/appointments')
      ]);

      setDashboard(results[0].statistics || {});
      setPatients(results[1].patients || []);
      setDoctors(results[2].doctors || []);
      setAppointments(results[3].appointments || []);
    } catch (err) {
      setError(err.message || 'Unable to load admin information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPatients = useMemo(() => {
    const term = search.toLowerCase();
    return patients.filter(patient =>
      `${patient.full_name} ${patient.email} ${patient.phone || ''}`
        .toLowerCase().includes(term)
    );
  }, [patients, search]);

  const filteredDoctors = useMemo(() => {
    const term = search.toLowerCase();
    return doctors.filter(doctor =>
      `${doctor.full_name} ${doctor.email} ${doctor.specialization}`
        .toLowerCase().includes(term)
    );
  }, [doctors, search]);

  const filteredAppointments = useMemo(() => {
    const term = search.toLowerCase();
    return appointments.filter(appointment =>
      `${appointment.patient_name || ''} ${appointment.doctor_name || ''} ${appointment.status || ''}`
        .toLowerCase().includes(term)
    );
  }, [appointments, search]);

  const notify = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 3500);
  };

  const logout = () => {
    localStorage.removeItem('zuri_token');
    localStorage.removeItem('zuri_user');
    window.location.href = '/login';
  };

  const openDoctorModal = (doctor = null) => {
    setEditingId(doctor?.doctor_id || null);
    setDoctorForm(doctor ? {
      full_name: doctor.full_name || '',
      email: doctor.email || '',
      password: '',
      specialization: doctor.specialization || '',
      qualification: doctor.qualification || '',
      license_number: doctor.license_number || '',
      phone: doctor.phone || '',
      consultation_fee: doctor.consultation_fee || ''
    } : emptyDoctor);
    setModal('doctor');
  };

  const saveDoctor = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = { ...doctorForm };
      if (!payload.password) delete payload.password;

      if (editingId) {
        await apiRequest(`/admin/doctors/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        notify('Doctor details updated.');
      } else {
        await apiRequest('/admin/doctors', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        notify('Doctor account created.');
      }

      setModal(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openPatientModal = (patient) => {
    setEditingId(patient.patient_id);
    setPatientForm({
      full_name: patient.full_name || '',
      email: patient.email || '',
      date_of_birth: patient.date_of_birth
        ? String(patient.date_of_birth).slice(0, 10) : '',
      gender: patient.gender || '',
      phone: patient.phone || '',
      address: patient.address || '',
      emergency_contact: patient.emergency_contact || '',
      emergency_phone: patient.emergency_phone || ''
    });
    setModal('patient');
  };

  const savePatient = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await apiRequest(`/admin/patients/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(patientForm)
      });

      setModal(null);
      notify('Patient details updated.');
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (type, id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const endpoint = type === 'patient'
        ? `/admin/patients/${id}`
        : `/admin/doctors/${id}`;

      await apiRequest(endpoint, { method: 'DELETE' });
      notify(`${type === 'patient' ? 'Patient' : 'Doctor'} deleted.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateAppointment = async (id, status) => {
    try {
      await apiRequest(`/admin/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      notify('Appointment status updated.');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB');
  };

  const statusClass = (status) => `status status-${status || 'pending'}`;

  const stats = [
    {
      label: 'Total patients',
      value: dashboard.totalPatients ?? dashboard.total_patients ?? patients.length,
      icon: Users
    },
    {
      label: 'Total doctors',
      value: dashboard.totalDoctors ?? dashboard.total_doctors ?? doctors.length,
      icon: Stethoscope
    },
    {
      label: 'Appointments',
      value: dashboard.totalAppointments ?? dashboard.total_appointments ?? appointments.length,
      icon: CalendarDays
    },
    {
      label: 'Pending requests',
      value: dashboard.pending ?? dashboard.pendingAppointments ?? dashboard.pending_appointments ?? 0,
      icon: Clock
    }
  ];

  return (
    <div className={`admin-shell ${darkMode ? 'dark' : ''}`}>
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">Z</div>
          <div className="brand-copy">
            <strong>Zuri</strong>
            <span>Healthcare</span>
          </div>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="side-navigation">
          {navigation.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                aria-label={item.label}
                onClick={() => {
                  setActiveTab(item.id);
                  setSearch('');
                  setSidebarOpen(false);
                  setError('');
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {activeTab === item.id && <ChevronRight size={16} />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="profile-avatar">
              {(user.full_name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="profile-details">
              <strong>{user.full_name || 'Administrator'}</strong>
              <span>Administrator</span>
            </div>
          </div>

          <button className="logout-button" onClick={logout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(value => !value)}
            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={15} />
            <strong>{navigation.find(item => item.id === activeTab)?.label}</strong>
          </div>

          <div className="topbar-actions">
            <button className="icon-button" onClick={loadData} title="Refresh">
              <RefreshCw size={18} />
            </button>
            <button
              className="icon-button"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle theme"
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <div className="topbar-avatar">
              {(user.full_name || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <section className="admin-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">ZURI HEALTHCARE / ADMINISTRATION</p>
              <h1>
                {activeTab === 'overview' ? 'Good day, ' + (user.full_name || 'Administrator').split(' ')[0] : navigation.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="page-subtitle">
                {activeTab === 'overview'
                  ? 'Here is what is happening across your healthcare platform.'
                  : `Manage and monitor ${activeTab} across Zuri Healthcare.`}
              </p>
            </div>

            {activeTab === 'doctors' && (
              <button className="primary-button" onClick={() => openDoctorModal()}>
                <Plus size={18} /> Add doctor
              </button>
            )}
          </div>

          {error && (
            <div className="alert alert-error">
              <XCircle size={18} />
              <span>{error}</span>
              <button onClick={() => setError('')}><X size={17} /></button>
            </div>
          )}

          {notice && (
            <div className="alert alert-success">
              <CheckCircle size={18} /> {notice}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <Activity className="loading-icon" size={28} />
              <p>Loading administration data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <>
                  <div className="stats-grid">
                    {stats.map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <div className="stat-card" key={stat.label}>
                          <div className={`stat-icon stat-icon-${index}`}>
                            <Icon size={21} />
                          </div>
                          <div>
                            <p>{stat.label}</p>
                            <h2>{stat.value}</h2>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="overview-grid">
                    <div className="panel recent-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Recent appointments</h2>
                          <p>Latest activity across the platform</p>
                        </div>
                        <button className="text-button" onClick={() => setActiveTab('appointments')}>
                          View all <ChevronRight size={15} />
                        </button>
                      </div>

                      <AppointmentTable
                        appointments={appointments.slice(0, 5)}
                        statusClass={statusClass}
                        formatDate={formatDate}
                        updateAppointment={updateAppointment}
                      />
                    </div>

                    <div className="panel summary-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Platform summary</h2>
                          <p>Current registered users</p>
                        </div>
                      </div>

                      <div className="summary-item">
                        <div className="summary-icon"><Users size={18} /></div>
                        <span>Registered patients</span>
                        <strong>{patients.length}</strong>
                      </div>

                      <div className="summary-item">
                        <div className="summary-icon"><Stethoscope size={18} /></div>
                        <span>Registered doctors</span>
                        <strong>{doctors.length}</strong>
                      </div>

                      <div className="summary-item">
                        <div className="summary-icon"><CalendarDays size={18} /></div>
                        <span>Total appointments</span>
                        <strong>{appointments.length}</strong>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab !== 'overview' && (
                <div className="panel management-panel">
                  <div className="management-toolbar">
                    <div>
                      <h2>
                        {activeTab === 'patients' ? 'Patient directory'
                          : activeTab === 'doctors' ? 'Medical team'
                          : 'Appointment records'}
                      </h2>
                      <p>
                        {activeTab === 'patients' ? `${patients.length} registered patients`
                          : activeTab === 'doctors' ? `${doctors.length} registered doctors`
                          : `${appointments.length} appointment records`}
                      </p>
                    </div>

                    <div className="search-box">
                      <Search size={18} />
                      <input
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder={`Search ${activeTab}...`}
                      />
                    </div>
                  </div>

                  {activeTab === 'patients' && (
                    <div className="table-scroll">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Patient</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Gender</th>
                            <th>Date of birth</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPatients.map(patient => (
                            <tr key={patient.patient_id}>
                              <td><strong>{patient.full_name}</strong></td>
                              <td>{patient.email}</td>
                              <td>{patient.phone || '—'}</td>
                              <td>{patient.gender || '—'}</td>
                              <td>{formatDate(patient.date_of_birth)}</td>
                              <td>
                                <div className="table-actions">
                                  <button title="Edit patient" onClick={() => openPatientModal(patient)}>
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    className="delete-action"
                                    title="Delete patient"
                                    onClick={() => deleteRecord('patient', patient.patient_id, patient.full_name)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {filteredPatients.length === 0 && <EmptyState text="No patients found." />}
                    </div>
                  )}

                  {activeTab === 'doctors' && (
                    <div className="table-scroll">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Doctor</th>
                            <th>Specialisation</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Availability</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDoctors.map(doctor => (
                            <tr key={doctor.doctor_id}>
                              <td><strong>{doctor.full_name}</strong></td>
                              <td>{doctor.specialization}</td>
                              <td>{doctor.email}</td>
                              <td>{doctor.phone || '—'}</td>
                              <td>
                                <span className={statusClass(doctor.availability_status)}>
                                  {doctor.availability_status || 'available'}
                                </span>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button title="Edit doctor" onClick={() => openDoctorModal(doctor)}>
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    className="delete-action"
                                    title="Delete doctor"
                                    onClick={() => deleteRecord('doctor', doctor.doctor_id, doctor.full_name)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {filteredDoctors.length === 0 && <EmptyState text="No doctors found." />}
                    </div>
                  )}

                  {activeTab === 'appointments' && (
                    <AppointmentTable
                      appointments={filteredAppointments}
                      statusClass={statusClass}
                      formatDate={formatDate}
                      updateAppointment={updateAppointment}
                      showActions
                    />
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <div className="modal-card">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">ZURI HEALTHCARE</p>
                <h2>
                  {modal === 'doctor'
                    ? editingId ? 'Edit doctor' : 'Add a doctor'
                    : 'Edit patient'}
                </h2>
              </div>

              <button className="icon-button" onClick={() => setModal(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={modal === 'doctor' ? saveDoctor : savePatient}>
              {modal === 'doctor' ? (
                <div className="form-grid">
                  <FormField
                    label="Full name"
                    required
                    value={doctorForm.full_name}
                    onChange={v => setDoctorForm({ ...doctorForm, full_name: v })}
                  />
                  <FormField
                    label="Email address"
                    type="email"
                    required
                    value={doctorForm.email}
                    onChange={v => setDoctorForm({ ...doctorForm, email: v })}
                  />
                  {!editingId && (
                    <FormField
                      label="Password"
                      type="password"
                      required
                      value={doctorForm.password}
                      onChange={v => setDoctorForm({ ...doctorForm, password: v })}
                    />
                  )}
                  <FormField
                    label="Specialisation"
                    required
                    value={doctorForm.specialization}
                    onChange={v => setDoctorForm({ ...doctorForm, specialization: v })}
                  />
                  <FormField
                    label="Qualification"
                    value={doctorForm.qualification}
                    onChange={v => setDoctorForm({ ...doctorForm, qualification: v })}
                  />
                  <FormField
                    label="Licence number"
                    value={doctorForm.license_number}
                    onChange={v => setDoctorForm({ ...doctorForm, license_number: v })}
                  />
                  <FormField
                    label="Phone"
                    value={doctorForm.phone}
                    onChange={v => setDoctorForm({ ...doctorForm, phone: v })}
                  />
                  <FormField
                    label="Consultation fee"
                    type="number"
                    value={doctorForm.consultation_fee}
                    onChange={v => setDoctorForm({ ...doctorForm, consultation_fee: v })}
                  />
                </div>
              ) : (
                <div className="form-grid">
                  <FormField
                    label="Full name"
                    required
                    value={patientForm.full_name}
                    onChange={v => setPatientForm({ ...patientForm, full_name: v })}
                  />
                  <FormField
                    label="Email address"
                    type="email"
                    required
                    value={patientForm.email}
                    onChange={v => setPatientForm({ ...patientForm, email: v })}
                  />
                  <FormField
                    label="Date of birth"
                    type="date"
                    value={patientForm.date_of_birth}
                    onChange={v => setPatientForm({ ...patientForm, date_of_birth: v })}
                  />

                  <label className="form-field">
                    <span>Gender</span>
                    <select
                      value={patientForm.gender}
                      onChange={e => setPatientForm({ ...patientForm, gender: e.target.value })}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </label>

                  <FormField
                    label="Phone"
                    value={patientForm.phone}
                    onChange={v => setPatientForm({ ...patientForm, phone: v })}
                  />
                  <FormField
                    label="Address"
                    value={patientForm.address}
                    onChange={v => setPatientForm({ ...patientForm, address: v })}
                  />
                  <FormField
                    label="Emergency contact"
                    value={patientForm.emergency_contact}
                    onChange={v => setPatientForm({ ...patientForm, emergency_contact: v })}
                  />
                  <FormField
                    label="Emergency phone"
                    value={patientForm.emergency_phone}
                    onChange={v => setPatientForm({ ...patientForm, emergency_phone: v })}
                  />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label className="form-field">
      <span>{label}{required ? ' *' : ''}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={event => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <UserRound size={28} />
      <p>{text}</p>
    </div>
  );
}

function AppointmentTable({
  appointments,
  statusClass,
  formatDate,
  updateAppointment,
  showActions = false
}) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            {showActions && <th>Update status</th>}
          </tr>
        </thead>
        <tbody>
          {appointments.map(appointment => (
            <tr key={appointment.appointment_id}>
              <td><strong>{appointment.patient_name || 'Patient'}</strong></td>
              <td>{appointment.doctor_name || 'Doctor'}</td>
              <td>{formatDate(appointment.appointment_date)}</td>
              <td>{appointment.appointment_time || '—'}</td>
              <td>
                <span className={statusClass(appointment.status)}>
                  {appointment.status}
                </span>
              </td>

              {showActions && (
                <td>
                  <select
                    className="status-select"
                    value={appointment.status}
                    onChange={event =>
                      updateAppointment(appointment.appointment_id, event.target.value)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {appointments.length === 0 && <EmptyState text="No appointments to display yet." />}
    </div>
  );
}

export default AdminDashboard;