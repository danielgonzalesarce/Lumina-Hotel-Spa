import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, User, LogOut, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { storage } from '../services/storage';
import { Reservation, User as UserType } from '../types';
import { formatCurrency } from '../lib/utils';

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const current = storage.getCurrentUser();
    if (!current || current.role !== 'user') {
      navigate('/login');
    } else {
      setUser(current);
    }
  }, [navigate]);

  if (!user) return null;

  const sidebarLinks = [
    { name: 'Dashboard', path: '/user', icon: LayoutDashboard },
    { name: 'Mis Reservas', path: '/user/mis-reservas', icon: Calendar },
    { name: 'Mi Perfil', path: '/user/perfil', icon: User },
  ];

  return (
    <>
      <div className="lg:hidden min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-white">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
          <User className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          El panel de usuario solo está disponible en computadoras de escritorio. Por favor, acceda desde una pantalla más grande para gestionar sus reservas.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Volver al Inicio
        </button>
      </div>

      <div className="hidden lg:flex max-w-7xl mx-auto px-4 py-12 flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">Huésped Lumina</div>
              </div>
            </div>
            <nav className="space-y-2">
              {sidebarLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    location.pathname === link.path 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </Link>
              ))}
              <button
                onClick={() => { storage.setCurrentUser(null); navigate('/'); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut className="h-5 w-5" /> Cerrar Sesión
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-grow">
          <Routes>
            <Route index element={<UserOverview user={user} />} />
            <Route path="mis-reservas" element={<UserReservations user={user} />} />
            <Route path="perfil" element={<UserProfile user={user} />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

function UserOverview({ user }: { user: UserType }) {
  const reservations = storage.getReservations().filter(r => r.userId === user.id);
  const upcoming = reservations.filter(r => r.status !== 'cancelled').slice(0, 2);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-2">Total Reservas</div>
          <div className="text-3xl font-bold text-gray-900">{reservations.length}</div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-2">Próximas Estancias</div>
          <div className="text-3xl font-bold text-indigo-600">{upcoming.length}</div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-2">Nivel de Miembro</div>
          <div className="text-3xl font-bold text-amber-500">Gold</div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold mb-6">Próximas Reservas</h3>
        {upcoming.length > 0 ? (
          <div className="space-y-4">
            {upcoming.map(res => (
              <div key={res.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Calendar className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{res.roomName}</div>
                    <div className="text-sm text-gray-500">{res.checkIn} al {res.checkOut}</div>
                  </div>
                </div>
                <Link to="/user/mis-reservas" className="text-indigo-600 hover:text-indigo-700">
                  <ChevronRight className="h-6 w-6" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">No tiene reservas próximas.</div>
        )}
      </div>
    </div>
  );
}

function UserReservations({ user }: { user: UserType }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    setReservations(storage.getReservations().filter(r => r.userId === user.id));
  }, [user.id]);

  const handleCancel = (id: string) => {
    if (confirm('¿Está seguro que desea cancelar esta reserva?')) {
      storage.updateReservationStatus(id, 'cancelled');
      setReservations(storage.getReservations().filter(r => r.userId === user.id));
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <h3 className="text-2xl font-bold mb-8">Mis Reservas</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-400 border-b border-gray-100">
              <th className="pb-4 font-semibold">Habitación</th>
              <th className="pb-4 font-semibold">Fechas</th>
              <th className="pb-4 font-semibold">Total</th>
              <th className="pb-4 font-semibold">Estado</th>
              <th className="pb-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reservations.map(res => (
              <tr key={res.id} className="group">
                <td className="py-6 font-bold text-gray-900">{res.roomName}</td>
                <td className="py-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4" /> {res.checkIn}</div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {res.checkOut}</div>
                </td>
                <td className="py-6 font-bold text-indigo-600">{formatCurrency(res.totalPrice)}</td>
                <td className="py-6">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    res.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    res.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {res.status === 'confirmed' && <CheckCircle className="h-3 w-3" />}
                    {res.status === 'cancelled' && <XCircle className="h-3 w-3" />}
                    {res.status === 'pending' && <Clock className="h-3 w-3" />}
                    {res.status}
                  </span>
                </td>
                <td className="py-6 text-right">
                  {res.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(res.id)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider"
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reservations.length === 0 && (
          <div className="text-center py-12 text-gray-400">Aún no ha realizado ninguna reserva.</div>
        )}
      </div>
    </div>
  );
}

function UserProfile({ user }: { user: UserType }) {
  const [formData, setFormData] = useState({ ...user });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateUser(formData);
    alert('Perfil actualizado con éxito.');
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-2xl">
      <h3 className="text-2xl font-bold mb-8">Mi Perfil</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Nombre Completo</label>
          <input
            type="text"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Email</label>
          <input
            type="email"
            disabled
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl opacity-60 cursor-not-allowed"
            value={formData.email}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Teléfono</label>
          <input
            type="tel"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
        </div>
        <button
          type="submit"
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}
