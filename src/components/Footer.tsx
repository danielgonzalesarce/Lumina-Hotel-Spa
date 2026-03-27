import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-indigo-400">Lumina Hotel</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Ofrecemos una experiencia de lujo inigualable en el corazón de la ciudad. 
              Confort, elegancia y un servicio excepcional nos definen.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Enlaces Rápidos</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link to="/habitaciones" className="hover:text-white transition-colors">Habitaciones</Link></li>
              <li><Link to="/reseñas" className="hover:text-white transition-colors">Reseñas</Link></li>
              <li><Link to="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link to="/sustentacion" className="hover:text-white transition-colors font-semibold text-indigo-400">Sustentación</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Legal</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><Link to="/legal#seguridad" className="hover:text-white transition-colors">Políticas de Seguridad</Link></li>
              <li><Link to="/legal#terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
              <li>
                <Link to="/reclamaciones" className="flex items-center gap-2 hover:text-white transition-colors mt-4">
                  <img 
                    src="https://www.gob.pe/images/libro_reclamaciones.png" 
                    alt="Libro de Reclamaciones" 
                    className="h-8 bg-white p-1 rounded"
                    referrerPolicy="no-referrer"
                  />
                  <span>Libro de Reclamaciones</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Contacto</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>Av. Lujo 123, San Isidro, Lima, Perú</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>+51 1 234 5678</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>contacto@luminahotel.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Lumina Hotel & Spa. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
