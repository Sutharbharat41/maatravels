import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Visitor Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Fleet from './pages/Fleet';
import Contact from './pages/Contact';

// Admin Auth
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Dashboard Pages
import DashboardHome from './pages/AdminDashboard/DashboardHome';
import VehicleManagement from './pages/AdminDashboard/VehicleManagement';
import ClientManagement from './pages/AdminDashboard/ClientManagement';
import ContractManagement from './pages/AdminDashboard/ContractManagement';
import PaymentEntries from './pages/AdminDashboard/PaymentEntries';
import ReportsModule from './pages/AdminDashboard/ReportsModule';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            
            {/* 1. Public Visitor Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="services" element={<Services />} />
              <Route path="fleet" element={<Fleet />} />
              <Route path="contact" element={<Contact />} />
            </Route>

            {/* 2. Admin Authentication Route */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* 3. Protected Dashboard Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="vehicles" element={<VehicleManagement />} />
              <Route path="clients" element={<ClientManagement />} />
              <Route path="contracts" element={<ContractManagement />} />
              <Route path="payments" element={<PaymentEntries />} />
              <Route path="reports" element={<ReportsModule />} />
            </Route>

            {/* 4. Catch All Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
