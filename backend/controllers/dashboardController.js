
const db = require('../config/db');

// PATIENT DASHBOARD
const getPatientDashboard = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [patients] = await db.execute(
      'SELECT patient_id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (!patients.length) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found.'
      });
    }

    const patientId = patients[0].patient_id;

    const [[counts]] = await db.execute(
      `SELECT
        COUNT(*) AS total,
        SUM(status = 'pending') AS pending,
        SUM(status = 'approved') AS approved,
        SUM(status = 'completed') AS completed
       FROM appointments
       WHERE patient_id = ?`,
      [patientId]
    );

    const [appointments] = await db.execute(
      `SELECT a.appointment_id, a.appointment_date,
              a.appointment_time, a.reason, a.status,
              u.full_name AS doctor_name,
              d.specialization
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.doctor_id
       JOIN users u ON d.user_id = u.user_id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC,
                a.appointment_time DESC
       LIMIT 10`,
      [patientId]
    );

    res.json({
      success: true,
      statistics: counts,
      appointments
    });
  } catch (error) {
    console.error('Patient dashboard:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not load patient dashboard.'
    });
  }
};

// DOCTOR DASHBOARD
const getDoctorDashboard = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [doctors] = await db.execute(
      'SELECT doctor_id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (!doctors.length) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.'
      });
    }

    const doctorId = doctors[0].doctor_id;

    const [[counts]] = await db.execute(
      `SELECT
        COUNT(*) AS total,
        SUM(status = 'pending') AS pending,
        SUM(status = 'approved') AS approved,
        SUM(status = 'completed') AS completed
       FROM appointments
       WHERE doctor_id = ?`,
      [doctorId]
    );

    const [appointments] = await db.execute(
      `SELECT a.appointment_id, a.appointment_date,
              a.appointment_time, a.reason, a.status,
              u.full_name AS patient_name,
              p.phone
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id
       JOIN users u ON p.user_id = u.user_id
       WHERE a.doctor_id = ?
       ORDER BY a.appointment_date ASC,
                a.appointment_time ASC`,
      [doctorId]
    );

    res.json({
      success: true,
      statistics: counts,
      appointments
    });
  } catch (error) {
    console.error('Doctor dashboard:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not load doctor dashboard.'
    });
  }
};

// ADMIN DASHBOARD
const getAdminDashboard = async (req, res) => {
  try {
    const [[counts]] = await db.execute(
      `SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'patient') AS patients,
        (SELECT COUNT(*) FROM users WHERE role = 'doctor') AS doctors,
        (SELECT COUNT(*) FROM appointments) AS appointments,
        (SELECT COUNT(*) FROM appointments
         WHERE status = 'pending') AS pending_appointments`
    );

    const [appointments] = await db.execute(
      `SELECT a.appointment_id, a.appointment_date,
              a.appointment_time, a.status,
              pu.full_name AS patient_name,
              du.full_name AS doctor_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id
       JOIN users pu ON p.user_id = pu.user_id
       JOIN doctors d ON a.doctor_id = d.doctor_id
       JOIN users du ON d.user_id = du.user_id
       ORDER BY a.created_at DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      statistics: counts,
      appointments
    });
  } catch (error) {
    console.error('Admin dashboard:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not load admin dashboard.'
    });
  }
};

// LIST DOCTORS
const getDoctors = async (req, res) => {
  try {
    const [doctors] = await db.execute(
      `SELECT d.doctor_id, u.full_name,
              d.specialization, d.qualification,
              d.consultation_fee, d.availability_status
       FROM doctors d
       JOIN users u ON d.user_id = u.user_id
       WHERE d.availability_status = 'available'
       ORDER BY u.full_name`
    );

    res.json({ success: true, doctors });
  } catch (error) {
    console.error('Get doctors:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve doctors.'
    });
  }
};

// PATIENT BOOKS APPOINTMENT
const createAppointment = async (req, res) => {
  try {
    const { doctor_id, appointment_date, appointment_time, reason } = req.body;

    if (!doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, date and time are required.'
      });
    }

    const [patients] = await db.execute(
      'SELECT patient_id FROM patients WHERE user_id = ?',
      [req.user.user_id]
    );

    if (!patients.length) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found.'
      });
    }

    const [doctors] = await db.execute(
      `SELECT doctor_id FROM doctors
       WHERE doctor_id = ? AND availability_status = 'available'`,
      [doctor_id]
    );

    if (!doctors.length) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or unavailable.'
      });
    }

    if (appointment_date < new Date().toISOString().slice(0, 10)) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date cannot be in the past.'
      });
    }

    await db.execute(
      `INSERT INTO appointments
       (patient_id, doctor_id, appointment_date,
        appointment_time, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [
        patients[0].patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        reason || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully.'
    });
  } catch (error) {
    console.error('Create appointment:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not book appointment.'
    });
  }
};

// DOCTOR UPDATES APPOINTMENT STATUS
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointmentId = req.params.appointment_id;

    if (!['approved', 'declined', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment status.'
      });
    }

    const [doctors] = await db.execute(
      'SELECT doctor_id FROM doctors WHERE user_id = ?',
      [req.user.user_id]
    );

    if (!doctors.length) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.'
      });
    }

    const [result] = await db.execute(
      `UPDATE appointments
       SET status = ?
       WHERE appointment_id = ? AND doctor_id = ?`,
      [status, appointmentId, doctors[0].doctor_id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    res.json({
      success: true,
      message: `Appointment ${status} successfully.`
    });
  } catch (error) {
    console.error('Update appointment:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not update appointment.'
    });
  }
};

// ADMIN VIEWS ALL APPOINTMENTS
const getAllAppointments = async (req, res) => {
  try {
    const [appointments] = await db.execute(
      `SELECT a.appointment_id, a.appointment_date,
              a.appointment_time, a.reason, a.status,
              pu.full_name AS patient_name,
              du.full_name AS doctor_name,
              d.specialization
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id
       JOIN users pu ON p.user_id = pu.user_id
       JOIN doctors d ON a.doctor_id = d.doctor_id
       JOIN users du ON d.user_id = du.user_id
       ORDER BY a.appointment_date DESC`
    );

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('All appointments:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve appointments.'
    });
  }
};

module.exports = {
  getPatientDashboard,
  getDoctorDashboard,
  getAdminDashboard,
  getDoctors,
  createAppointment,
  updateAppointmentStatus,
  getAllAppointments
};
