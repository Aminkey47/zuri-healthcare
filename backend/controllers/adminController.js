
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// VIEW ALL PATIENTS
const getPatients = async (req, res) => {
  try {
    const [patients] = await db.execute(
      `SELECT p.patient_id, u.user_id, u.full_name, u.email,
              p.date_of_birth, p.gender, p.phone, p.address,
              p.emergency_contact, p.emergency_phone
       FROM patients p
       JOIN users u ON p.user_id = u.user_id
       ORDER BY u.full_name`
    );

    res.json({ success: true, patients });
  } catch (error) {
    console.error('Get patients:', error.message);
    res.status(500).json({ success: false, message: 'Could not retrieve patients.' });
  }
};

// UPDATE PATIENT
const updatePatient = async (req, res) => {
  const { full_name, email, date_of_birth, gender, phone, address,
    emergency_contact, emergency_phone } = req.body;
  const patientId = req.params.patient_id;

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [patients] = await connection.execute(
      'SELECT user_id FROM patients WHERE patient_id = ?',
      [patientId]
    );

    if (!patients.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const userId = patients[0].user_id;

    if (email) {
      const [duplicates] = await connection.execute(
        'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
        [email.trim().toLowerCase(), userId]
      );

      if (duplicates.length) {
        await connection.rollback();
        return res.status(409).json({ success: false, message: 'Email is already in use.' });
      }
    }

    await connection.execute(
      `UPDATE users SET full_name = COALESCE(?, full_name),
       email = COALESCE(?, email) WHERE user_id = ?`,
      [full_name?.trim() || null, email?.trim().toLowerCase() || null, userId]
    );

    await connection.execute(
      `UPDATE patients SET date_of_birth = ?, gender = ?, phone = ?,
       address = ?, emergency_contact = ?, emergency_phone = ?
       WHERE patient_id = ?`,
      [
        date_of_birth || null, gender || null, phone || null,
        address || null, emergency_contact || null,
        emergency_phone || null, patientId
      ]
    );

    await connection.commit();
    res.json({ success: true, message: 'Patient updated successfully.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Update patient:', error.message);
    res.status(500).json({ success: false, message: 'Could not update patient.' });
  } finally {
    if (connection) connection.release();
  }
};

// DELETE PATIENT
const deletePatient = async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM patients WHERE patient_id = ?',
      [req.params.patient_id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    res.json({ success: true, message: 'Patient deleted successfully.' });
  } catch (error) {
    console.error('Delete patient:', error.message);
    res.status(500).json({ success: false, message: 'Could not delete patient.' });
  }
};

// VIEW ALL DOCTORS
const getAllDoctors = async (req, res) => {
  try {
    const [doctors] = await db.execute(
      `SELECT d.doctor_id, u.user_id, u.full_name, u.email,
              d.specialization, d.qualification, d.license_number,
              d.phone, d.consultation_fee, d.availability_status
       FROM doctors d
       JOIN users u ON d.user_id = u.user_id
       ORDER BY u.full_name`
    );

    res.json({ success: true, doctors });
  } catch (error) {
    console.error('Get doctors:', error.message);
    res.status(500).json({ success: false, message: 'Could not retrieve doctors.' });
  }
};

// CREATE DOCTOR AND LOGIN ACCOUNT
const createDoctor = async (req, res) => {
  const {
    full_name, email, password, specialization, qualification,
    license_number, phone, consultation_fee
  } = req.body;

  if (!full_name || !email || !password || !specialization) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, password and specialization are required.'
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least 8 characters.'
    });
  }

  let connection;

  try {
    connection = await db.getConnection();

    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await connection.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    await connection.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 12);

    const [userResult] = await connection.execute(
      `INSERT INTO users (full_name, email, password, role)
       VALUES (?, ?, ?, 'doctor')`,
      [full_name.trim(), normalizedEmail, hashedPassword]
    );

    await connection.execute(
      `INSERT INTO doctors
       (user_id, specialization, qualification, license_number,
        phone, consultation_fee)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userResult.insertId,
        specialization,
        qualification || null,
        license_number || null,
        phone || null,
        consultation_fee || null
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully.'
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Create doctor:', error.message);

    const duplicate = error.code === 'ER_DUP_ENTRY';
    res.status(duplicate ? 409 : 500).json({
      success: false,
      message: duplicate
        ? 'Email or licence number already exists.'
        : 'Could not create doctor account.'
    });
  } finally {
    if (connection) connection.release();
  }
};

// UPDATE DOCTOR
const updateDoctor = async (req, res) => {
  const {
    full_name, email, specialization, qualification,
    license_number, phone, consultation_fee, availability_status
  } = req.body;

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [doctors] = await connection.execute(
      'SELECT user_id FROM doctors WHERE doctor_id = ?',
      [req.params.doctor_id]
    );

    if (!doctors.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const userId = doctors[0].user_id;

    if (email) {
      const [duplicates] = await connection.execute(
        'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
        [email.trim().toLowerCase(), userId]
      );

      if (duplicates.length) {
        await connection.rollback();
        return res.status(409).json({ success: false, message: 'Email is already in use.' });
      }
    }

    await connection.execute(
      `UPDATE users SET full_name = COALESCE(?, full_name),
       email = COALESCE(?, email) WHERE user_id = ?`,
      [full_name?.trim() || null, email?.trim().toLowerCase() || null, userId]
    );

    await connection.execute(
      `UPDATE doctors SET
       specialization = COALESCE(?, specialization),
       qualification = ?, license_number = ?, phone = ?,
       consultation_fee = ?,
       availability_status = COALESCE(?, availability_status)
       WHERE doctor_id = ?`,
      [
        specialization || null, qualification || null,
        license_number || null, phone || null,
        consultation_fee ?? null, availability_status || null,
        req.params.doctor_id
      ]
    );

    await connection.commit();
    res.json({ success: true, message: 'Doctor updated successfully.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Update doctor:', error.message);
    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      success: false,
      message: error.code === 'ER_DUP_ENTRY'
        ? 'Licence number or email already exists.'
        : 'Could not update doctor.'
    });
  } finally {
    if (connection) connection.release();
  }
};

// DELETE DOCTOR
const deleteDoctor = async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM doctors WHERE doctor_id = ?',
      [req.params.doctor_id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    res.json({ success: true, message: 'Doctor deleted successfully.' });
  } catch (error) {
    console.error('Delete doctor:', error.message);
    res.status(500).json({ success: false, message: 'Could not delete doctor.' });
  }
};

// ADMIN UPDATES APPOINTMENT
const adminUpdateAppointment = async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'approved', 'declined', 'completed'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid appointment status.' });
  }

  try {
    const [result] = await db.execute(
      'UPDATE appointments SET status = ? WHERE appointment_id = ?',
      [status, req.params.appointment_id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.json({ success: true, message: 'Appointment updated successfully.' });
  } catch (error) {
    console.error('Admin update appointment:', error.message);
    res.status(500).json({ success: false, message: 'Could not update appointment.' });
  }
};

// ADMIN DELETES APPOINTMENT
const adminDeleteAppointment = async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM appointments WHERE appointment_id = ?',
      [req.params.appointment_id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.json({ success: true, message: 'Appointment deleted successfully.' });
  } catch (error) {
    console.error('Admin delete appointment:', error.message);
    res.status(500).json({ success: false, message: 'Could not delete appointment.' });
  }
};

module.exports = {
  getPatients,
  updatePatient,
  deletePatient,
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  adminUpdateAppointment,
  adminDeleteAppointment
};
