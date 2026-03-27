import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Hotel } from 'lucide-react';
import { storage } from '../services/storage';
import { User as UserType } from '../types';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [config, setConfig] = useState(storage.getConfig());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentUser(storage.getCurrentUser());
    setConfig(storage.getConfig());
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
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              {config.logo ? (
                <img src={config.logo} alt={config.name} className="h-10 w-auto object-contain" />
              ) : (
                <Hotel className="h-8 w-8 text-indigo-600" />
              )}
              <span className="text-xl font-bold tracking-tight text-gray-900">
                {config.name}
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all hover:text-indigo-600 ${
                  location.pathname === link.path ? 'text-indigo-600' : 'text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={currentUser.role === 'admin' ? '/admin' : '/user'}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{currentUser.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary py-2 px-6 text-sm"
              >
                Acceso Huéspedes
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
