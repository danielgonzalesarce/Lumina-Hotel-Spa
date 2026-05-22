import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Hotel } from 'lucide-react';
import { storage } from '../services/storage';
import { User as UserType } from '../types';
import { useTenant } from '../TenantContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const { currentTenant } = useTenant();
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setCurrentUser(storage.getCurrentUser());
  }, [location]);

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
    navigate('/');
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Habitaciones', path: '/habitaciones' },
    { name: 'Reseñas', path: '/reseñas' },
    { name: 'Contacto', path: '/contacto' },
  ];

  return (
    <nav className={`transition-all duration-300 sticky top-0 z-50 border-b ${isScrolled ? 'bg-white/90 backdrop-blur-md border-slate-100 shadow-sm' : 'bg-transparent border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              {currentTenant?.theme?.logoUrl ? (
                <img src={currentTenant.theme.logoUrl} alt={currentTenant.name} className="h-8 w-auto object-contain" />
              ) : (
                <Hotel className={`h-7 w-7 ${isScrolled ? 'text-slate-900' : 'text-white'} group-hover:scale-110 transition-transform`} />
              )}
              <span className={`text-lg font-bold tracking-tighter ${isScrolled ? 'text-slate-950' : 'text-white'}`}>
                {currentTenant?.name || 'Lumina Hotel'}
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold tracking-wide transition-all ${
                  isScrolled
                    ? (location.pathname === link.path ? 'text-slate-950' : 'text-slate-500 hover:text-slate-950')
                    : (location.pathname === link.path ? 'text-white' : 'text-white/70 hover:text-white')
                }`}
              >
                {link.name}
              </Link>
            ))}

            {currentUser ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                <Link
                  to={currentUser.role === 'admin' ? '/admin' : '/user'}
                  className="flex items-center space-x-2 text-sm font-semibold text-slate-900 hover:text-slate-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{currentUser.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                  isScrolled
                    ? 'text-slate-900 bg-slate-100 hover:bg-slate-200'
                    : 'text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                Acceder
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 pt-4 pb-8 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block text-base font-medium text-gray-600 hover:text-indigo-600"
              >
                {link.name}
              </Link>
            ))}
            {currentUser ? (
              <>
                <Link
                  to={currentUser.role === 'admin' ? '/admin' : '/user'}
                  onClick={() => setIsOpen(false)}
                  className="block text-base font-medium text-gray-600 hover:text-indigo-600"
                >
                  Mi Panel
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left text-base font-medium text-red-500"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-base font-medium text-indigo-600"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
