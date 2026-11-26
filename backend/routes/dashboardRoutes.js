
const express = require('express');
const router = express.Router();

const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');

const {
  getPatientDashboard,
  getDoctorDashboard,
  getAdminDashboard,
  getDoctors,
  createAppointment,
  updateAppointmentStatus,
  getAllAppointments
} = require('../controllers/dashboardController');

router.use(authenticateToken);

// Dashboard endpoints
router.get('/patient', authorizeRoles('patient'), getPatientDashboard);
router.get('/doctor', authorizeRoles('doctor'), getDoctorDashboard);
router.get('/admin', authorizeRoles('admin'), getAdminDashboard);

// Doctor directory
router.get('/doctors', authorizeRoles('patient', 'admin'), getDoctors);

// Appointment endpoints
router.post('/appointments', authorizeRoles('patient'), createAppointment);

router.get('/appointments', authorizeRoles('admin'), getAllAppointments);

router.patch(
  '/appointments/:appointment_id/status',
  authorizeRoles('doctor'),
  updateAppointmentStatus
);

module.exports = router;
