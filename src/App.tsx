import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AIConcierge from './components/AIConcierge';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Reservation from './pages/Reservation';
import Reviews from './pages/Reviews';
import Contact from './pages/Contact';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Complaints from './pages/Complaints';
import Legal from './pages/Legal';
import ProjectInfo from './pages/ProjectInfo';
import SimulatedCheckout from './pages/SimulatedCheckout';

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {!isAdminPath && <Navbar />}
      <main className="flex-grow">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/habitaciones" element={<Rooms />} />
          <Route path="/habitaciones/:id" element={<RoomDetail />} />
          <Route path="/reserva" element={<Reservation />} />
          <Route path="/reseñas" element={<Reviews />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user/*" element={<UserDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/reclamaciones" element={<Complaints />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/sustentacion" element={<ProjectInfo />} />
          <Route path="/checkout-simulado" element={<SimulatedCheckout />} />
        </Routes>
      </main>
      {!isAdminPath && <Footer />}
      {!isAdminPath && <WhatsAppButton />}
      {!isAdminPath && <AIConcierge />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
