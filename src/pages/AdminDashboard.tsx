import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Bed, Calendar, MessageSquare, Settings, LogOut, 
  Plus, Edit, Trash2, Check, X, TrendingUp, Users, DollarSign, Star,
  Upload, ImagePlus, Facebook, Instagram, Info, Search, Download,
  FileText, Printer, ChevronLeft, ChevronRight, Book, Mail, Phone, MapPin,
  Rocket, Code2, Target, ArrowRight
} from 'lucide-react';
import { format, addDays, startOfToday, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { storage } from '../services/storage';
import { Room, Reservation, Review, HotelConfig, User as UserType, RoomType, RoomStatus, Invoice, GalleryImage, Complaint } from '../types';
import { formatCurrency } from '../lib/utils';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement 
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState<UserType | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const current = storage.getCurrentUser();
    if (!current || current.role !== 'admin') {
      navigate('/login');
    } else {
      setAdmin(current);
    }
  }, [navigate]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (!admin) return null;

  const sidebarLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Habitaciones', path: '/admin/habitaciones', icon: Bed },
    { name: 'Calendario', path: '/admin/calendario', icon: Calendar },
    { name: 'Control Excel', path: '/admin/control', icon: TrendingUp },
    { name: 'Facturación', path: '/admin/facturacion', icon: DollarSign },
    { name: 'Reportes', path: '/admin/reportes', icon: Info },
    { name: 'Galería', path: '/admin/galeria', icon: ImagePlus },
    { name: 'Reclamaciones', path: '/admin/reclamaciones', icon: Book },
    { name: 'Reseñas', path: '/admin/reseñas', icon: MessageSquare },
    { name: 'Configuración', path: '/admin/configuracion', icon: Settings },
    { name: 'Sustentación', path: '/sustentacion', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 text-indigo-600 font-bold">
          <Bed className="h-6 w-6" />
          <span>Admin Lumina</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6 rotate-45" />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 lg:fixed lg:h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8">
          <div className="hidden lg:flex items-center gap-3 text-indigo-600 font-bold text-xl mb-12">
            <Bed className="h-8 w-8" />
            <span>Admin Lumina</span>
          </div>
          <nav className="space-y-2">
            {sidebarLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === link.path 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <link.icon className="h-5 w-5" />
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-8 border-t border-gray-100">
          <button
            onClick={() => { storage.setCurrentUser(null); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-5 w-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 lg:p-12 lg:ml-64 overflow-y-auto">
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="habitaciones" element={<AdminRooms />} />
          <Route path="calendario" element={<AdminCalendar />} />
          <Route path="control" element={<AdminControlTable />} />
          <Route path="facturacion" element={<AdminInvoices />} />
          <Route path="reportes" element={<AdminReports />} />
          <Route path="galeria" element={<AdminGallery />} />
          <Route path="reclamaciones" element={<AdminComplaints />} />
          <Route path="reseñas" element={<AdminReviews />} />
          <Route path="configuracion" element={<AdminConfig />} />
        </Routes>
      </main>
    </div>
  );
}

function AdminOverview() {
  const [showGuide, setShowGuide] = useState(false);
  const rooms = storage.getRooms();
  const reservations = storage.getReservations();
  const reviews = storage.getReviews();
  const totalIncome = reservations.reduce((sum, r) => r.status !== 'cancelled' ? sum + r.totalPrice : sum, 0);

  const stats = [
    { name: 'Total Reservas', value: reservations.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Habitaciones', value: rooms.length, icon: Bed, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Reseñas', value: reviews.length, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Ingresos Est.', value: formatCurrency(totalIncome), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const barData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Reservas por Mes',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: 'rgba(79, 70, 229, 0.8)',
      borderRadius: 8,
    }]
  };

  const pieData = {
    labels: ['Estándar', 'Doble', 'Suite', 'Premium'],
    datasets: [{
      data: [40, 30, 20, 10],
      backgroundColor: [
        'rgba(79, 70, 229, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(245, 158, 11, 0.8)',
      ],
    }]
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard General</h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all"
          >
            <Info className="h-4 w-4" /> Guía de Sustentación
          </button>
          <div className="text-sm text-gray-500 font-medium">Actualizado: {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {showGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl p-8 rounded-[2.5rem] shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">Guía para la Sustentación</h3>
              <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-6 w-6 text-gray-400" /></button>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                  <Rocket className="h-5 w-5" /> Innovación Tecnológica
                </h4>
                <p className="text-sm text-indigo-700">
                  El proyecto integra <strong>Google Gemini Pro</strong> para un Concierge Inteligente que recomienda habitaciones y servicios basándose en el contexto del hotel.
                </p>
              </div>

              <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Code2 className="h-5 w-5" /> Metodología y Arquitectura
                </h4>
                <p className="text-sm text-emerald-700">
                  Desarrollado bajo una arquitectura de componentes reutilizables con <strong>React 19</strong> y <strong>TypeScript</strong>. Se utilizó una metodología ágil para iterar sobre el diseño y la funcionalidad.
                </p>
              </div>

              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <Target className="h-5 w-5" /> Valor de Negocio
                </h4>
                <p className="text-sm text-amber-700">
                  Solución integral que optimiza la gestión hotelera (reservas, facturación, reportes Excel/PDF) y mejora la experiencia del cliente con un diseño UX/UI de primer nivel.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-xs font-bold text-gray-400 uppercase mb-1">Tecnologías Clave</div>
                  <div className="text-sm font-bold text-gray-700">Vite, Tailwind 4, Motion, Chart.js, Lucide</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-xs font-bold text-gray-400 uppercase mb-1">Persistencia</div>
                  <div className="text-sm font-bold text-gray-700">LocalStorage (Simulación de DB)</div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link 
                to="/sustentacion" 
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
              >
                Ver Detalles Completos <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className={`inline-flex p-3 rounded-2xl ${stat.bg} ${stat.color} mb-4`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="text-gray-500 text-sm font-semibold mb-1">{stat.name}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-8">Tendencia de Reservas</h3>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-8">Distribución por Tipo</h3>
          <div className="h-64 flex justify-center">
            <Pie data={pieData} options={{ responsive: true }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
  const [customAmenity, setCustomAmenity] = useState('');

  const COMMON_AMENITIES = [
    'WiFi', 'Aire Acondicionado', 'TV Cable', 'Caja Fuerte', 'Minibar', 
    'Escritorio', 'Jacuzzi', 'Cafetera Nespresso', 'Bata de Baño', 
    'Piscina Privada', 'Cocina', 'Mayordomo 24h', 'Traslado Aeropuerto',
    'Servicio al cuarto', 'Limpieza diaria', 'Vista al mar', 'Balcón'
  ];

  useEffect(() => {
    setRooms(storage.getRooms());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta habitación?')) {
      storage.deleteRoom(id);
      setRooms(storage.getRooms());
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditingRoom(prev => ({
          ...prev,
          images: [...(prev?.images || []), base64String]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setEditingRoom(prev => ({
      ...prev,
      images: prev?.images?.filter((_, i) => i !== index)
    }));
  };

  const toggleAmenity = (amenity: string) => {
    const current = editingRoom?.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    setEditingRoom(prev => ({ ...prev, amenities: updated }));
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim()) {
      const current = editingRoom?.amenities || [];
      if (!current.includes(customAmenity.trim())) {
        setEditingRoom(prev => ({ ...prev, amenities: [...current, customAmenity.trim()] }));
      }
      setCustomAmenity('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    
    const roomToSave: Room = {
      id: editingRoom.id || Math.random().toString(36).substr(2, 9),
      number: editingRoom.number || '',
      name: editingRoom.name || '',
      type: editingRoom.type || RoomType.Standard,
      description: editingRoom.description || '',
      price: editingRoom.price || 0,
      capacity: editingRoom.capacity || 1,
      images: editingRoom.images || ['https://images.unsplash.com/photo-1566665797739-1674de7a421a'],
      amenities: editingRoom.amenities || ['WiFi', 'Aire Acondicionado'],
      featured: editingRoom.featured || false,
      status: editingRoom.status || RoomStatus.Available
    };

    storage.saveRoom(roomToSave);
    setRooms(storage.getRooms());
    setEditingRoom(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Gestión de Habitaciones</h2>
        <button
          onClick={() => setEditingRoom({ amenities: [], images: [] })}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          <Plus className="h-5 w-5" /> Nueva Habitación
        </button>
      </div>

      {editingRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white w-full max-w-3xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{editingRoom.id ? 'Editar' : 'Nueva'} Habitación</h3>
              <button type="button" onClick={() => setEditingRoom(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Número de Habitación</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingRoom.number || ''}
                  onChange={e => setEditingRoom({...editingRoom, number: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Nombre de la Habitación</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingRoom.name || ''}
                  onChange={e => setEditingRoom({...editingRoom, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Tipo</label>
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingRoom.type || RoomType.Standard}
                  onChange={e => setEditingRoom({...editingRoom, type: e.target.value as RoomType})}
                >
                  {Object.values(RoomType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Estado Actual</label>
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingRoom.status || RoomStatus.Available}
                  onChange={e => setEditingRoom({...editingRoom, status: e.target.value as RoomStatus})}
                >
                  {Object.values(RoomStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Precio por Noche ($)</label>
                <input
                  type="number"
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingRoom.price || ''}
                  onChange={e => setEditingRoom({...editingRoom, price: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Capacidad Máxima (Personas)</label>
                <input
                  type="number"
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingRoom.capacity || ''}
                  onChange={e => setEditingRoom({...editingRoom, capacity: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Descripción Detallada</label>
              <textarea
                required
                rows={3}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={editingRoom.description || ''}
                onChange={e => setEditingRoom({...editingRoom, description: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold block">Fotos de la Habitación</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {editingRoom.images?.map((img, i) => (
                  <div key={i} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-200">
                    <img src={img} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all text-gray-400 hover:text-indigo-600 hover:border-indigo-300">
                  <ImagePlus className="h-8 w-8 mb-1" />
                  <span className="text-xs font-medium">Subir Foto</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold block">¿Qué incluye esta habitación? (Amenidades)</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_AMENITIES.map(amenity => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      editingRoom.amenities?.includes(amenity)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Otra amenidad..."
                  className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  value={customAmenity}
                  onChange={e => setCustomAmenity(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
                />
                <button
                  type="button"
                  onClick={addCustomAmenity}
                  className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm"
                >
                  Agregar
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="featured"
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={editingRoom.featured || false}
                onChange={e => setEditingRoom({...editingRoom, featured: e.target.checked})}
              />
              <label htmlFor="featured" className="text-sm font-semibold text-gray-700">Destacar esta habitación en la página principal</label>
            </div>

            <div className="flex gap-4 pt-6">
              <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                Guardar Habitación
              </button>
              <button type="button" onClick={() => setEditingRoom(null)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-4 font-semibold text-sm text-gray-500">N°</th>
              <th className="px-8 py-4 font-semibold text-sm text-gray-500">Nombre</th>
              <th className="px-8 py-4 font-semibold text-sm text-gray-500">Precio</th>
              <th className="px-8 py-4 font-semibold text-sm text-gray-500">Estado</th>
              <th className="px-8 py-4 font-semibold text-sm text-gray-500 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rooms.map(room => (
              <tr key={room.id}>
                <td className="px-8 py-4 font-bold text-gray-900">{room.number}</td>
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <img src={room.images[0]} className="h-10 w-12 object-cover rounded-lg" />
                    <span className="font-medium">{room.name}</span>
                  </div>
                </td>
                <td className="px-8 py-4 font-bold text-indigo-600">{formatCurrency(room.price)}</td>
                <td className="px-8 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    room.status === RoomStatus.Available ? 'bg-green-100 text-green-700' :
                    room.status === RoomStatus.Reserved ? 'bg-yellow-100 text-yellow-700' :
                    room.status === RoomStatus.Occupied ? 'bg-red-100 text-red-700' :
                    room.status === RoomStatus.Cleaning ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {room.status}
                  </span>
                </td>
                <td className="px-8 py-4 text-right space-x-2">
                  <button onClick={() => setEditingRoom(room)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="h-5 w-5" /></button>
                  <button onClick={() => handleDelete(room.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-5 w-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminCalendar() {
  const [rooms] = useState<Room[]>(storage.getRooms());
  const [reservations, setReservations] = useState<Reservation[]>(storage.getReservations());
  const [startDate, setStartDate] = useState(startOfToday());
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const daysToShow = 14;

  const days = Array.from({ length: daysToShow }, (_, i) => addDays(startDate, i));

  const getStatusForDay = (roomId: string, date: Date) => {
    const res = reservations.find(r => 
      r.roomId === roomId && 
      r.status !== 'cancelled' &&
      (isSameDay(parseISO(r.checkIn), date) || 
      (parseISO(r.checkIn) <= date && parseISO(r.checkOut) > date))
    );

    if (!res) return { status: 'Disponible', color: 'bg-green-100 text-green-700' };
    if (res.status === 'confirmed') return { status: 'Ocupada', color: 'bg-red-100 text-red-700', res };
    return { status: 'Reservada', color: 'bg-yellow-100 text-yellow-700', res };
  };

  const handleUpdateRes = (res: Reservation) => {
    storage.saveReservation(res);
    setReservations(storage.getReservations());
    setSelectedRes(null);
  };

  const handleDeleteRes = (id: string) => {
    if (confirm('¿Eliminar esta reserva?')) {
      storage.deleteReservation(id);
      setReservations(storage.getReservations());
      setSelectedRes(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Calendario de Ocupación</h2>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <button onClick={() => setStartDate(addDays(startDate, -7))} className="p-2 hover:bg-gray-50 rounded-xl"><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-bold text-sm px-4">{format(startDate, 'MMM d', { locale: es })} - {format(addDays(startDate, daysToShow - 1), 'MMM d, yyyy', { locale: es })}</span>
          <button onClick={() => setStartDate(addDays(startDate, 7))} className="p-2 hover:bg-gray-50 rounded-xl"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-gray-50 p-6 text-left border-b border-r border-gray-100 min-w-[200px] font-bold text-gray-500 uppercase tracking-wider text-xs">Habitación</th>
                {days.map(day => (
                  <th key={day.toISOString()} className="p-4 border-b border-gray-100 bg-gray-50 min-w-[100px] text-center">
                    <div className="text-xs font-bold text-gray-400 uppercase">{format(day, 'EEE', { locale: es })}</div>
                    <div className="text-lg font-black text-gray-900">{format(day, 'd')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 p-6 border-r border-b border-gray-100 font-bold text-gray-900">
                    <div className="flex flex-col">
                      <span className="text-indigo-600">#{room.number}</span>
                      <span className="text-sm font-medium text-gray-500">{room.name}</span>
                    </div>
                  </td>
                  {days.map(day => {
                    const info = getStatusForDay(room.id, day);
                    return (
                      <td key={day.toISOString()} className="p-2 border-b border-gray-100">
                        <div 
                          onClick={() => info.res && setSelectedRes(info.res)}
                          className={`h-12 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-tighter transition-all cursor-pointer hover:scale-105 ${info.color}`}
                        >
                          {info.status}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRes && (
        <ReservationModal 
          reservation={selectedRes} 
          onClose={() => setSelectedRes(null)} 
          onSave={handleUpdateRes}
          onDelete={handleDeleteRes}
        />
      )}

      <div className="flex gap-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded-full border border-green-200"></div>
          <span className="text-xs font-bold text-gray-500">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded-full border border-yellow-200"></div>
          <span className="text-xs font-bold text-gray-500">Reservada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded-full border border-red-200"></div>
          <span className="text-xs font-bold text-gray-500">Ocupada</span>
        </div>
      </div>
    </div>
  );
}

function ReservationModal({ reservation, onClose, onSave, onDelete }: { 
  reservation: Reservation; 
  onClose: () => void; 
  onSave: (res: Reservation) => void;
  onDelete: (id: string) => void;
}) {
  const [edited, setEdited] = useState<Reservation>(reservation);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">Detalles de Reserva</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-6 w-6 text-gray-400" /></button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Cliente</label>
              <input 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                value={edited.userName}
                onChange={e => setEdited({...edited, userName: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Estado</label>
              <select 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                value={edited.status}
                onChange={e => setEdited({...edited, status: e.target.value as any})}
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Check-In</label>
              <input 
                type="date"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                value={edited.checkIn}
                onChange={e => setEdited({...edited, checkIn: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Check-Out</label>
              <input 
                type="date"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                value={edited.checkOut}
                onChange={e => setEdited({...edited, checkOut: e.target.value})}
              />
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-indigo-600">Total a Pagar</span>
              <span className="text-xl font-black text-indigo-700">{formatCurrency(edited.totalPrice)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={() => onSave(edited)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100">Guardar Cambios</button>
          <button onClick={() => onDelete(edited.id)} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all"><Trash2 className="h-6 w-6" /></button>
        </div>
      </div>
    </div>
  );
}

function AdminControlTable() {
  const [reservations, setReservations] = useState<Reservation[]>(storage.getReservations());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Reservation; direction: 'asc' | 'desc' } | null>(null);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  const filteredReservations = reservations
    .filter(res => 
      res.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.roomName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (key: keyof Reservation) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleUpdateRes = (res: Reservation) => {
    storage.saveReservation(res);
    setReservations(storage.getReservations());
    setSelectedRes(null);
  };

  const handleDeleteRes = (id: string) => {
    if (confirm('¿Eliminar esta reserva?')) {
      storage.deleteReservation(id);
      setReservations(storage.getReservations());
      setSelectedRes(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Cliente', 'Habitación', 'Check-In', 'Check-Out', 'Total', 'Estado'];
    const rows = filteredReservations.map(r => [
      r.id, r.userName, r.roomName, r.checkIn, r.checkOut, r.totalPrice, r.status
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reservas.csv";
    link.click();
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredReservations);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reservas");
    XLSX.writeFile(wb, "reservas.xlsx");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Tabla de Control Avanzada</h2>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">
            <Download className="h-4 w-4" /> CSV
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all">
            <TrendingUp className="h-4 w-4" /> Excel
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente o habitación..."
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['userName', 'roomName', 'checkIn', 'checkOut', 'totalPrice', 'status'].map(key => (
                  <th 
                    key={key}
                    onClick={() => handleSort(key as keyof Reservation)}
                    className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {key === 'userName' ? 'Cliente' : 
                       key === 'roomName' ? 'Habitación' : 
                       key === 'checkIn' ? 'Entrada' : 
                       key === 'checkOut' ? 'Salida' : 
                       key === 'totalPrice' ? 'Total' : 'Estado'}
                      {sortConfig?.key === key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredReservations.map(res => (
                <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{res.userName}</td>
                  <td className="px-6 py-4 font-medium text-gray-600">{res.roomName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{res.checkIn}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{res.checkOut}</td>
                  <td className="px-6 py-4 font-bold text-indigo-600">{formatCurrency(res.totalPrice)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      res.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      res.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedRes(res)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                      <Edit className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRes && (
        <ReservationModal 
          reservation={selectedRes} 
          onClose={() => setSelectedRes(null)} 
          onSave={handleUpdateRes}
          onDelete={handleDeleteRes}
        />
      )}
    </div>
  );
}

function AdminConfig() {
  const [config, setConfig] = useState<HotelConfig>(storage.getConfig());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveConfig(config);
    alert('Configuración actualizada con éxito.');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Configuración del Hotel</h2>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">Ajustes Globales</span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Info className="h-5 w-5 text-indigo-600" /> Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nombre del Hotel</label>
                <input
                  type="text"
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={config.name}
                  onChange={e => setConfig({...config, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email de Contacto</label>
                <input
                  type="email"
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={config.email}
                  onChange={e => setConfig({...config, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Teléfono Principal</label>
                <input
                  type="text"
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={config.phone}
                  onChange={e => setConfig({...config, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">WhatsApp (Número sin +)</label>
                <input
                  type="text"
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={config.whatsapp}
                  onChange={e => setConfig({...config, whatsapp: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Dirección Física</label>
              <input
                type="text"
                required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={config.address}
                onChange={e => setConfig({...config, address: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Descripción del Hotel</label>
              <textarea
                rows={4}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={config.description || ''}
                onChange={e => setConfig({...config, description: e.target.value})}
                placeholder="Breve historia o descripción del hotel..."
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" /> Redes Sociales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" /> Facebook URL
                </label>
                <input
                  type="url"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={config.facebook || ''}
                  onChange={e => setConfig({...config, facebook: e.target.value})}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-600" /> Instagram URL
                </label>
                <input
                  type="url"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={config.instagram || ''}
                  onChange={e => setConfig({...config, instagram: e.target.value})}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 text-center">
            <h3 className="text-xl font-bold">Logo del Hotel</h3>
            <div className="relative mx-auto w-32 h-32 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
              {config.logo ? (
                <img src={config.logo} className="w-full h-full object-contain" />
              ) : (
                <Bed className="h-12 w-12 text-gray-300" />
              )}
              <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                <Upload className="h-6 w-6" />
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
            <p className="text-xs text-gray-500">Recomendado: PNG transparente 512x512px</p>
          </div>

          <div className="sticky top-24">
            <button 
              type="submit" 
              className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-bold text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
            >
              Guardar Cambios
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              Los cambios se aplicarán instantáneamente en todo el sitio web.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setReviews(storage.getReviews());
  }, []);

  const handleApprove = (id: string) => {
    storage.approveReview(id);
    setReviews(storage.getReviews());
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta reseña?')) {
      storage.deleteReview(id);
      setReviews(storage.getReviews());
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Gestión de Reseñas</h2>
      <div className="grid grid-cols-1 gap-6">
        {reviews.map(review => (
          <div key={review.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-900">{review.userName}</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                {!review.approved && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">Pendiente</span>}
              </div>
              <p className="text-gray-600 italic">"{review.comment}"</p>
            </div>
            <div className="flex gap-2">
              {!review.approved && (
                <button onClick={() => handleApprove(review.id)} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100"><Check className="h-5 w-5" /></button>
              )}
              <button onClick={() => handleDelete(review.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><Trash2 className="h-5 w-5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminInvoices() {
  const [reservations] = useState<Reservation[]>(storage.getReservations());
  const [invoices, setInvoices] = useState<Invoice[]>(storage.getInvoices());
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [invoiceType, setInvoiceType] = useState<'Boleta' | 'Factura'>('Boleta');
  const [clientDoc, setClientDoc] = useState('');
  const config = storage.getConfig();

  const handleGenerate = () => {
    if (!selectedRes) return;

    const newInvoice: Invoice = {
      id: `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      reservationId: selectedRes.id,
      type: invoiceType,
      clientName: selectedRes.userName,
      clientDocument: clientDoc,
      roomNumber: selectedRes.roomName,
      checkIn: selectedRes.checkIn,
      checkOut: selectedRes.checkOut,
      subtotal: selectedRes.totalPrice,
      extras: [],
      total: selectedRes.totalPrice,
      date: new Date().toISOString().split('T')[0]
    };

    storage.saveInvoice(newInvoice);
    setInvoices(storage.getInvoices());
    setSelectedRes(null);
    setClientDoc('');
    alert('Comprobante generado con éxito.');
  };

  const generateInvoicePDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    
    // Header
    if (config.logo && config.logo.startsWith('data:image')) {
      try {
        const format = config.logo.split(';')[0].split('/')[1].toUpperCase();
        doc.addImage(config.logo, format === 'PNG' ? 'PNG' : 'JPEG', 10, 10, 30, 30);
      } catch (e) {
        console.error('Error adding logo to PDF', e);
      }
    }
    doc.setFontSize(20);
    doc.text(config.name, 50, 20);
    doc.setFontSize(10);
    doc.text(config.address, 50, 28);
    doc.text(`Tel: ${config.phone} | Email: ${config.email}`, 50, 34);
    
    doc.line(10, 45, 200, 45);
    
    // Invoice Info
    doc.setFontSize(16);
    doc.text(`${invoice.type.toUpperCase()}`, 10, 60);
    doc.setFontSize(10);
    doc.text(`N°: ${invoice.id}`, 10, 68);
    doc.text(`Fecha: ${invoice.date}`, 10, 74);
    
    // Client Info
    doc.setFontSize(12);
    doc.text('DATOS DEL CLIENTE', 10, 90);
    doc.setFontSize(10);
    doc.text(`Nombre: ${invoice.clientName}`, 10, 98);
    doc.text(`Documento: ${invoice.clientDocument}`, 10, 104);
    
    // Details
    (doc as any).autoTable({
      startY: 120,
      head: [['Descripción', 'Desde', 'Hasta', 'Total']],
      body: [
        [`Hospedaje - ${invoice.roomNumber}`, invoice.checkIn, invoice.checkOut, formatCurrency(invoice.total)]
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(14);
    doc.text(`TOTAL A PAGAR: ${formatCurrency(invoice.total)}`, 140, finalY + 20);
    
    return doc;
  };

  const downloadPDF = (invoice: Invoice) => {
    const doc = generateInvoicePDF(invoice);
    doc.save(`${invoice.id}.pdf`);
  };

  const printInvoice = (invoice: Invoice) => {
    const doc = generateInvoicePDF(invoice);
    // Open PDF in new tab for printing
    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Sistema de Facturación</h2>
        <button 
          onClick={() => setSelectedRes(reservations[0])}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          <Plus className="h-5 w-5" /> Nuevo Comprobante
        </button>
      </div>

      {selectedRes && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl p-10 rounded-[2.5rem] shadow-2xl space-y-6">
            <h3 className="text-2xl font-bold">Generar Comprobante</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Seleccionar Reserva</label>
                <select 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl"
                  value={selectedRes.id}
                  onChange={e => setSelectedRes(reservations.find(r => r.id === e.target.value) || null)}
                >
                  {reservations.map(r => (
                    <option key={r.id} value={r.id}>{r.userName} - {r.roomName} ({r.checkIn})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Tipo de Comprobante</label>
                <div className="flex gap-4">
                  {['Boleta', 'Factura'].map(t => (
                    <button
                      key={t}
                      onClick={() => setInvoiceType(t as any)}
                      className={`flex-1 py-3 rounded-xl font-bold border transition-all ${
                        invoiceType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Documento (DNI/RUC)</label>
                <input
                  type="text"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl"
                  value={clientDoc}
                  onChange={e => setClientDoc(e.target.value)}
                  placeholder="Ej: 70654321"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={handleGenerate} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold">Generar</button>
              <button onClick={() => setSelectedRes(null)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invoices.map(inv => (
          <div key={inv.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{inv.type}</span>
                <div className="text-lg font-bold mt-1">{inv.id}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">{formatCurrency(inv.total)}</div>
                <div className="text-[10px] text-gray-400">{inv.date}</div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-50 space-y-2">
              <div className="text-sm font-medium text-gray-600">{inv.clientName}</div>
              <div className="text-xs text-gray-400">Hab: {inv.roomNumber}</div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => downloadPDF(inv)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100">
                <Download className="h-4 w-4" /> PDF
              </button>
              <button onClick={() => printInvoice(inv)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100">
                <Printer className="h-4 w-4" /> Imprimir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminReports() {
  const reservations = storage.getReservations();
  const rooms = storage.getRooms();
  
  const monthlyIncome = reservations.reduce((acc: any, res) => {
    if (res.status === 'cancelled') return acc;
    const month = format(parseISO(res.checkIn), 'MMM', { locale: es });
    acc[month] = (acc[month] || 0) + res.totalPrice;
    return acc;
  }, {});

  const barData = {
    labels: Object.keys(monthlyIncome),
    datasets: [{
      label: 'Ingresos por Mes',
      data: Object.values(monthlyIncome),
      backgroundColor: 'rgba(79, 70, 229, 0.8)',
      borderRadius: 12,
    }]
  };

  const occupancyRate = (rooms.length > 0) ? (rooms.filter(r => r.status === RoomStatus.Occupied).length / rooms.length) * 100 : 0;

  const exportReport = (type: 'pdf' | 'excel') => {
    if (type === 'excel') {
      const ws = XLSX.utils.json_to_sheet(reservations);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte");
      XLSX.writeFile(wb, "reporte_hotel.xlsx");
    } else {
      const doc = new jsPDF();
      doc.text("Reporte de Gestión Hotelera", 10, 10);
      (doc as any).autoTable({
        startY: 20,
        head: [['Mes', 'Ingresos']],
        body: Object.entries(monthlyIncome).map(([m, i]) => [m, formatCurrency(i as number)]),
      });
      doc.save("reporte.pdf");
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h2>
        <div className="flex gap-2">
          <button onClick={() => exportReport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100">
            <FileText className="h-4 w-4" /> PDF
          </button>
          <button onClick={() => exportReport('excel')} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold text-sm hover:bg-green-100">
            <TrendingUp className="h-4 w-4" /> Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
          <div className="text-4xl font-black text-indigo-600 mb-2">{occupancyRate.toFixed(1)}%</div>
          <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ocupación Actual</div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
          <div className="text-4xl font-black text-green-600 mb-2">{formatCurrency(Object.values(monthlyIncome).reduce((a: any, b: any) => a + b, 0) as number)}</div>
          <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ingresos Totales</div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
          <div className="text-4xl font-black text-blue-600 mb-2">{reservations.length}</div>
          <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Reservas</div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold mb-8">Análisis de Ingresos Mensuales</h3>
        <Bar data={barData} options={{ responsive: true }} />
      </div>
    </div>
  );
}

function AdminGallery() {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<Partial<GalleryImage>>({});

  useEffect(() => {
    setGallery(storage.getGallery());
  }, []);

  const handleSave = () => {
    if (!currentImage.url || !currentImage.title) return;
    
    const newImage: GalleryImage = {
      id: currentImage.id || Date.now().toString(),
      url: currentImage.url,
      title: currentImage.title
    };

    storage.saveGalleryImage(newImage);
    setGallery(storage.getGallery());
    setIsModalOpen(false);
    setCurrentImage({});
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta imagen?')) {
      storage.deleteGalleryImage(id);
      setGallery(storage.getGallery());
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestión de Galería</h2>
          <p className="text-gray-500">Administra las imágenes que se muestran en la página principal.</p>
        </div>
        <button
          onClick={() => { setCurrentImage({}); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="h-5 w-5" /> Nueva Imagen
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {gallery.map((img) => (
          <div key={img.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm group">
            <div className="relative h-64">
              <img src={img.url} alt={img.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={() => { setCurrentImage(img); setIsModalOpen(true); }}
                  className="p-3 bg-white text-indigo-600 rounded-xl hover:scale-110 transition-transform"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-3 bg-white text-red-600 rounded-xl hover:scale-110 transition-transform"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-gray-900">{img.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">
                {currentImage.id ? 'Editar Imagen' : 'Nueva Imagen'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Título de la Imagen</label>
                <input
                  type="text"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej: Piscina Infinity"
                  value={currentImage.title || ''}
                  onChange={e => setCurrentImage({ ...currentImage, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">URL de la Imagen</label>
                <input
                  type="text"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://images.unsplash.com/..."
                  value={currentImage.url || ''}
                  onChange={e => setCurrentImage({ ...currentImage, url: e.target.value })}
                />
              </div>
              
              {currentImage.url && (
                <div className="rounded-2xl overflow-hidden h-40 border border-gray-100">
                  <img src={currentImage.url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-gray-200 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Guardar Imagen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    setComplaints(storage.getComplaints());
  }, []);

  const handleUpdateStatus = (id: string, status: Complaint['status']) => {
    const complaint = complaints.find(c => c.id === id);
    if (complaint) {
      const updated = { ...complaint, status };
      storage.saveComplaint(updated);
      setComplaints(storage.getComplaints());
      if (selectedComplaint?.id === id) setSelectedComplaint(updated);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      storage.deleteComplaint(id);
      setComplaints(storage.getComplaints());
      if (selectedComplaint?.id === id) setSelectedComplaint(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Libro de Reclamaciones</h2>
        <p className="text-gray-500">Gestiona los reclamos y quejas presentados por los clientes.</p>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Fecha</th>
                <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Tipo</th>
                <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 font-medium">
                    No hay reclamaciones registradas.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6 font-medium text-gray-600">{c.date}</td>
                    <td className="p-6">
                      <div className="font-bold text-gray-900">{c.fullName}</div>
                      <div className="text-xs text-gray-400">{c.email}</div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        c.type === 'Reclamo' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        c.status === 'Atendido' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                        >
                          <Search className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Detalle de {selectedComplaint.type}</h3>
              <button onClick={() => setSelectedComplaint(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cliente</div>
                <div className="font-bold text-gray-900">{selectedComplaint.fullName}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Documento</div>
                <div className="font-bold text-gray-900">{selectedComplaint.documentType} {selectedComplaint.documentNumber}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contacto</div>
                <div className="font-bold text-gray-900">{selectedComplaint.email}</div>
                <div className="text-sm text-gray-500">{selectedComplaint.phone}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</div>
                <div className="font-bold text-gray-900">{selectedComplaint.date}</div>
              </div>
              <div className="col-span-2 space-y-1">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dirección</div>
                <div className="font-bold text-gray-900">{selectedComplaint.address}</div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl mb-8">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Descripción</div>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaint.description}</p>
            </div>

            <div className="flex gap-4 pt-4">
              {selectedComplaint.status === 'Pendiente' ? (
                <button
                  onClick={() => handleUpdateStatus(selectedComplaint.id, 'Atendido')}
                  className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="h-5 w-5" /> Marcar como Atendido
                </button>
              ) : (
                <button
                  onClick={() => handleUpdateStatus(selectedComplaint.id, 'Pendiente')}
                  className="flex-1 py-4 bg-yellow-600 text-white rounded-2xl font-bold hover:bg-yellow-700 transition-all flex items-center justify-center gap-2"
                >
                  <X className="h-5 w-5" /> Marcar como Pendiente
                </button>
              )}
              <button
                onClick={() => setSelectedComplaint(null)}
                className="flex-1 py-4 border border-gray-200 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
