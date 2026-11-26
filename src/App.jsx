
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import AdminDashboard from './pages/admin/AdminDashboard';

import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorProfile from './pages/doctor/DoctorProfile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* PUBLIC PAGES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PATIENT SECTION */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute roles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute roles={['patient']}>
                <PatientProfile />
              </ProtectedRoute>
            }
          />

          {/* DOCTOR SECTION */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DoctorProfile />
              </ProtectedRoute>
            }
          />

          {/* ADMIN SECTION */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* PAGE NOT FOUND */}
          <Route
            path="*"
            element={
              <main className="placeholder-page">
                <h1>404 - Page Not Found</h1>
                <Link to="/">Return Home</Link>
              </main>
            }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
