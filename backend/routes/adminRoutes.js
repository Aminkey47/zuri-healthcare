
const express = require('express');
const router = express.Router();

const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');

const {
  getPatients,
  updatePatient,
  deletePatient,
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  adminUpdateAppointment,
  adminDeleteAppointment
} = require('../controllers/adminController');

router.use(authenticateToken, authorizeRoles('admin'));

// Patient management
router.get('/patients', getPatients);
router.put('/patients/:patient_id', updatePatient);
router.delete('/patients/:patient_id', deletePatient);

// Doctor management
router.get('/doctors', getAllDoctors);
router.post('/doctors', createDoctor);
router.put('/doctors/:doctor_id', updateDoctor);
router.delete('/doctors/:doctor_id', deleteDoctor);

// Appointment management
router.put('/appointments/:appointment_id', adminUpdateAppointment);
router.delete('/appointments/:appointment_id', adminDeleteAppointment);

module.exports = router;
