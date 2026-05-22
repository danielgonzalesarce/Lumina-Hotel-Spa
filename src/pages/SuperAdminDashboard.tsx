import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Settings, LogOut, 
  Plus, Edit, Trash2, Check, X, TrendingUp, DollarSign,
  Building2, ShieldAlert, Menu, AlertTriangle, PlusCircle, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { storage } from '../services/storage';
import { User as UserType, Tenant } from '../types';
import { formatCurrency } from '../lib/utils';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement 
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

import { useAuth } from '../AuthContext';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      navigate('/login');
    }
  }, [navigate, currentUser]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (!currentUser) return null;

  const sidebarLinks = [
    { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboard },
    { name: 'Empresas (Tenants)', path: '/superadmin/empresas', icon: Building2 },
    { name: 'Facturación', path: '/superadmin/facturacion', icon: DollarSign },
    { name: 'Configuración Global', path: '/superadmin/configuracion', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 text-indigo-900 font-bold">
          <ShieldAlert className="h-6 w-6" />
          <span>Super Admin</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-white border-r border-slate-800 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 lg:fixed lg:h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8">
          <div className="hidden lg:flex items-center gap-3 text-indigo-400 font-bold text-xl mb-12">
            <ShieldAlert className="h-8 w-8" />
            <span>Super Admin</span>
          </div>
          <nav className="space-y-2">
            {sidebarLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === link.path || (location.pathname === '/superadmin' && link.path === '/superadmin')
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <link.icon className="h-5 w-5" />
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-8 border-t border-slate-800">
          <button
            onClick={() => { storage.setCurrentUser(null); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-5 w-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 lg:p-12 lg:ml-64 overflow-y-auto">
        <Routes>
          <Route index element={<SuperAdminOverview />} />
          <Route path="empresas" element={<SuperAdminTenants />} />
          <Route path="facturacion" element={<SuperAdminBilling />} />
          <Route path="configuracion" element={<SuperAdminConfig />} />
        </Routes>
      </main>
    </div>
  );
}

function SuperAdminOverview() {
  const tenants = storage.getTenants();
  
  const activeTenants = tenants.filter(t => t.status === 'Activo').length;
  const mrr = tenants.reduce((sum, t) => t.status === 'Activo' ? sum + t.monthlyFee : sum, 0);

  const stats = [
    { name: 'Empresas Totales', value: tenants.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Empresas Activas', value: activeTenants, icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'MRR (Ingreso Mensual)', value: formatCurrency(mrr), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Usuarios Totales', value: storage.getUsers().length, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const planDistribution = tenants.reduce((acc: any, t) => {
    acc[t.plan] = (acc[t.plan] || 0) + 1;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(planDistribution),
    datasets: [{
      data: Object.values(planDistribution),
      backgroundColor: [
        'rgba(79, 70, 229, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
    }]
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900">Visión General del Sistema</h2>
        <div className="text-sm text-slate-500 font-medium">Actualizado: {new Date().toLocaleDateString()}</div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Acciones Rápidas</h3>
        <div className="flex gap-4">
          <Link to="/superadmin/empresas" className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
            <PlusCircle className="h-5 w-5" /> Nueva Empresa
          </Link>
          <Link to="/superadmin/facturacion" className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-colors">
            <FileText className="h-5 w-5" /> Nueva Factura
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className={`inline-flex p-3 rounded-2xl ${stat.bg} ${stat.color} mb-4`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="text-slate-500 text-sm font-semibold mb-1">{stat.name}</div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* System Alerts */}
      <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Alertas del Sistema
        </h3>
        {tenants.filter(t => t.status === 'Suspendido').length > 0 ? (
          <div className="space-y-4">
            {tenants.filter(t => t.status === 'Suspendido').map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <span className="font-semibold text-amber-900">Empresa <span className="font-bold">{t.name}</span> está suspendida.</span>
                <Link to="/superadmin/empresas" className="text-sm font-bold text-amber-700 hover:underline">Revisar</Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No hay alertas pendientes.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-8 text-slate-900">Distribución de Planes</h3>
          <div className="h-64 w-full relative">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-8 text-slate-900">Últimas Empresas Registradas</h3>
          <div className="space-y-4">
            {tenants.slice(0, 5).map(tenant => (
              <div key={tenant.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    {tenant.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{tenant.name}</div>
                    <div className="text-xs text-slate-500">{tenant.plan} Plan</div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  tenant.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' :
                  tenant.status === 'Suspendido' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {tenant.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SuperAdminTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  useEffect(() => {
    setTenants(storage.getTenants());
  }, []);

  const filteredTenants = tenants.filter(t => 
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.contactName.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (planFilter === 'Todos' || t.plan === planFilter) &&
    (statusFilter === 'Todos' || t.status === statusFilter)
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const tenantData: Tenant = {
      id: editingTenant?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      contactName: formData.get('contactName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      plan: formData.get('plan') as any,
      status: formData.get('status') as any,
      createdAt: editingTenant?.createdAt || new Date().toISOString(),
      nextBillingDate: editingTenant?.nextBillingDate || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      monthlyFee: Number(formData.get('monthlyFee')),
      theme: {
        primaryColor: (formData.get('primaryColor') as string) || '#4f46e5',
        logoUrl: (formData.get('logoUrl') as string) || '',
        coverUrl: (formData.get('coverUrl') as string) || ''
      }
    };

    storage.saveTenant(tenantData);
    setTenants(storage.getTenants());
    setIsModalOpen(false);
    setEditingTenant(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta empresa? Esta acción no se puede deshacer.')) {
      storage.deleteTenant(id);
      setTenants(storage.getTenants());
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900">Gestión de Empresas</h2>
        <button 
          onClick={() => { setEditingTenant(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Nueva Empresa
        </button>
      </div>

      <div className="flex gap-4">
        <input 
          type="text" 
          placeholder="Buscar empresa o contacto..." 
          className="p-3 bg-white border border-slate-200 rounded-xl flex-grow"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select 
          value={planFilter} 
          onChange={e => setPlanFilter(e.target.value)}
          className="p-3 bg-white border border-slate-200 rounded-xl"
        >
          <option value="Todos">Todos los Planes</option>
          <option value="Básico">Básico</option>
          <option value="Pro">Pro</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="p-3 bg-white border border-slate-200 rounded-xl"
        >
          <option value="Todos">Todos los Estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
          <option value="Suspendido">Suspendido</option>
        </select>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Empresa</th>
                <th className="p-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Contacto</th>
                <th className="p-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Plan</th>
                <th className="p-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Estado</th>
                <th className="p-4 font-bold text-slate-500 text-sm uppercase tracking-wider">MRR</th>
                <th className="p-4 font-bold text-slate-500 text-sm uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{tenant.name}</div>
                    <div className="text-xs text-slate-500">Registrado: {format(new Date(tenant.createdAt), 'dd MMM yyyy', { locale: es })}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{tenant.contactName}</div>
                    <div className="text-xs text-slate-500">{tenant.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tenant.status === 'Activo' ? 'bg-emerald-100 text-emerald-800' :
                      tenant.status === 'Suspendido' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-900">
                    {formatCurrency(tenant.monthlyFee)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingTenant(tenant); setIsModalOpen(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(tenant.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">{editingTenant ? 'Editar Empresa' : 'Nueva Empresa'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nombre de la Empresa</label>
                  <input
                    name="name"
                    defaultValue={editingTenant?.name}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nombre del Contacto</label>
                  <input
                    name="contactName"
                    defaultValue={editingTenant?.contactName}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingTenant?.email}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Teléfono</label>
                  <input
                    name="phone"
                    defaultValue={editingTenant?.phone}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Plan</label>
                  <select
                    name="plan"
                    defaultValue={editingTenant?.plan || 'Básico'}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value="Básico">Básico</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Estado</label>
                  <select
                    name="status"
                    defaultValue={editingTenant?.status || 'Activo'}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Suspendido">Suspendido</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Tarifa Mensual (S/)</label>
                  <input
                    name="monthlyFee"
                    type="number"
                    step="0.01"
                    defaultValue={editingTenant?.monthlyFee}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Theme Configuration */}
                <div className="md:col-span-2 pt-4 border-t border-slate-100">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">Personalización (Marca Blanca)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Color Primario</label>
                      <div className="flex gap-2">
                        <input
                          name="primaryColor"
                          type="color"
                          defaultValue={editingTenant?.theme?.primaryColor || '#4f46e5'}
                          className="h-12 w-12 rounded-xl border border-slate-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          defaultValue={editingTenant?.theme?.primaryColor || '#4f46e5'}
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="#4f46e5"
                          onChange={(e) => {
                            const colorInput = e.target.previousElementSibling as HTMLInputElement;
                            if (colorInput) colorInput.value = e.target.value;
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">URL del Logo (Opcional)</label>
                      <input
                        name="logoUrl"
                        type="url"
                        defaultValue={editingTenant?.theme?.logoUrl}
                        placeholder="https://ejemplo.com/logo.png"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">URL de Portada (Opcional)</label>
                      <input
                        name="coverUrl"
                        type="url"
                        defaultValue={editingTenant?.theme?.coverUrl}
                        placeholder="https://ejemplo.com/portada.jpg"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Guardar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SuperAdminBilling() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);

  useEffect(() => {
    setInvoices(storage.getTenantInvoices());
    setTenants(storage.getTenants());
  }, []);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tenantId = formData.get('tenantId') as string;
    const tenant = tenants.find(t => t.id === tenantId);
    
    if (!tenant) return;

    const invoiceData = {
      id: editingInvoice?.id || Math.random().toString(36).substr(2, 9),
      tenantId: tenant.id,
      tenantName: tenant.name,
      date: formData.get('date') as string,
      dueDate: formData.get('dueDate') as string,
      amount: Number(formData.get('amount')),
      status: formData.get('status') as any,
      plan: tenant.plan
    };

    storage.saveTenantInvoice(invoiceData);
    setInvoices(storage.getTenantInvoices());
    setIsModalOpen(false);
    setEditingInvoice(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta factura?')) {
      storage.deleteTenantInvoice(id);
      setInvoices(storage.getTenantInvoices());
    }
  };

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.filter(i => i.status === 'Pagado').reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'Pendiente' || i.status === 'Vencido').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900">Facturación y Suscripciones</h2>
        <button 
          onClick={() => { setEditingInvoice(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Nueva Factura
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-semibold mb-1">Total Facturado</div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalInvoiced)}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-semibold mb-1">Total Cobrado</div>
          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-semibold mb-1">Total Pendiente</div>
          <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Empresa</th>
                <th className="p-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Fecha</th>
                <th className="p-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Vencimiento</th>
                <th className="p-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Monto</th>
                <th className="p-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Estado</th>
                <th className="p-4 font-bold text-slate-500 text-sm uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{invoice.tenantName}</div>
                    <div className="text-xs text-slate-500">Plan {invoice.plan}</div>
                  </td>
                  <td className="p-4 text-slate-600">{format(new Date(invoice.date), 'dd/MM/yyyy')}</td>
                  <td className="p-4 text-slate-600">{format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</td>
                  <td className="p-4 font-bold text-slate-900">{formatCurrency(invoice.amount)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'Pagado' ? 'bg-emerald-100 text-emerald-800' :
                      invoice.status === 'Vencido' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingInvoice(invoice); setIsModalOpen(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(invoice.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No hay facturas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">{editingInvoice ? 'Editar Factura' : 'Nueva Factura'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Empresa</label>
                <select
                  name="tenantId"
                  defaultValue={editingInvoice?.tenantId}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="">Seleccione una empresa...</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.plan})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Fecha</label>
                  <input
                    name="date"
                    type="date"
                    defaultValue={editingInvoice?.date ? new Date(editingInvoice.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Vencimiento</label>
                  <input
                    name="dueDate"
                    type="date"
                    defaultValue={editingInvoice?.dueDate ? new Date(editingInvoice.dueDate).toISOString().split('T')[0] : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Monto</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={editingInvoice?.amount}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Estado</label>
                <select
                  name="status"
                  defaultValue={editingInvoice?.status || 'Pendiente'}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagado">Pagado</option>
                  <option value="Vencido">Vencido</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SuperAdminConfig() {
  const [config, setConfig] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'plans'>('general');

  useEffect(() => {
    setConfig(storage.getGlobalConfig());
  }, []);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newConfig = {
      platformName: formData.get('platformName') as string,
      supportEmail: formData.get('supportEmail') as string,
      supportPhone: formData.get('supportPhone') as string,
      defaultCurrency: formData.get('defaultCurrency') as string,
      plans: {
        basic: {
          price: Number(formData.get('basicPrice')),
          maxRooms: Number(formData.get('basicRooms')),
          maxUsers: Number(formData.get('basicUsers'))
        },
        pro: {
          price: Number(formData.get('proPrice')),
          maxRooms: Number(formData.get('proRooms')),
          maxUsers: Number(formData.get('proUsers'))
        },
        enterprise: {
          price: Number(formData.get('enterprisePrice')),
          maxRooms: Number(formData.get('enterpriseRooms')),
          maxUsers: Number(formData.get('enterpriseUsers'))
        }
      }
    };

    storage.saveGlobalConfig(newConfig);
    setConfig(newConfig);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!config) return null;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900">Configuración Global</h2>
        {isSaved && <span className="text-emerald-600 font-bold">Guardado</span>}
      </div>

      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-6 py-3 rounded-xl font-bold transition-colors ${activeTab === 'general' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Información General
        </button>
        <button 
          onClick={() => setActiveTab('plans')}
          className={`px-6 py-3 rounded-xl font-bold transition-colors ${activeTab === 'plans' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Configuración de Planes
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {activeTab === 'general' && (
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Información de la Plataforma</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nombre de la Plataforma</label>
                <input
                  name="platformName"
                  defaultValue={config.platformName}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Moneda por Defecto</label>
                <input
                  name="defaultCurrency"
                  defaultValue={config.defaultCurrency}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email de Soporte</label>
                <input
                  name="supportEmail"
                  type="email"
                  defaultValue={config.supportEmail}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Teléfono de Soporte</label>
                <input
                  name="supportPhone"
                  defaultValue={config.supportPhone}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Configuración de Planes</h3>
            
            {/* Básico */}
            <div className="space-y-4">
              <h4 className="font-bold text-indigo-600">Plan Básico</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="basicPrice" type="number" defaultValue={config.plans.basic.price} placeholder="Precio" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                <input name="basicRooms" type="number" defaultValue={config.plans.basic.maxRooms} placeholder="Max Habitaciones" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                <input name="basicUsers" type="number" defaultValue={config.plans.basic.maxUsers} placeholder="Max Usuarios" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>

            {/* Pro */}
            <div className="space-y-4">
              <h4 className="font-bold text-purple-600">Plan Pro</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="proPrice" type="number" defaultValue={config.plans.pro.price} placeholder="Precio" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                <input name="proRooms" type="number" defaultValue={config.plans.pro.maxRooms} placeholder="Max Habitaciones" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                <input name="proUsers" type="number" defaultValue={config.plans.pro.maxUsers} placeholder="Max Usuarios" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>

            {/* Enterprise */}
            <div className="space-y-4">
              <h4 className="font-bold text-pink-600">Plan Enterprise</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="enterprisePrice" type="number" defaultValue={config.plans.enterprise.price} placeholder="Precio" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                <input name="enterpriseRooms" type="number" defaultValue={config.plans.enterprise.maxRooms} placeholder="Max Habitaciones" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                <input name="enterpriseUsers" type="number" defaultValue={config.plans.enterprise.maxUsers} placeholder="Max Usuarios" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
