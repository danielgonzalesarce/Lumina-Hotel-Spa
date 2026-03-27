import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, ArrowRight, Wifi, Waves, Utensils, Sprout, Car, Wind, Star, MapPin, Navigation, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { storage } from '../services/storage';
import { formatCurrency } from '../lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const rooms = storage.getRooms().filter(r => r.featured);
  const reviews = storage.getReviews().filter(r => r.approved);
  const gallery = storage.getGallery();

  const [search, setSearch] = useState({
    checkIn: '',
    checkOut: '',
    guests: '1'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/habitaciones?checkIn=${search.checkIn}&checkOut=${search.checkOut}&guests=${search.guests}`);
  };

  const services = [
    { icon: Wifi, name: 'WiFi Gratis' },
    { icon: Waves, name: 'Piscina' },
    { icon: Utensils, name: 'Restaurante' },
    { icon: Sprout, name: 'Spa' },
    { icon: Car, name: 'Estacionamiento' },
    { icon: Wind, name: 'Aire Acondicionado' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2000"
            alt="Hotel Hero"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Bienvenido a Lumina Hotel
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl mb-10 font-light"
          >
            Lujo y confort en el corazón de la ciudad.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/reserva"
              className="btn-primary w-full sm:w-auto text-center"
            >
              Reservar Ahora
            </Link>
            <Link
              to="/habitaciones"
              className="btn-secondary w-full sm:w-auto text-center bg-white/20 border-white text-white hover:bg-white/30"
            >
              Ver Habitaciones
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600" /> Check-in
              </label>
              <input
                type="date"
                required
                className="w-full border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={search.checkIn}
                onChange={e => setSearch({...search, checkIn: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600" /> Check-out
              </label>
              <input
                type="date"
                required
                className="w-full border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={search.checkOut}
                onChange={e => setSearch({...search, checkOut: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" /> Huéspedes
              </label>
              <select
                className="w-full border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={search.guests}
                onChange={e => setSearch({...search, guests: e.target.value})}
              >
                {[1,2,3,4,5,6].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Persona' : 'Personas'}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Habitaciones Destacadas</h2>
            <p className="text-gray-600 mt-2">Nuestras mejores opciones para su estancia.</p>
          </div>
          <Link to="/habitaciones" className="text-indigo-600 font-semibold flex items-center gap-1 hover:underline">
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <div key={room.id} className="card overflow-hidden group">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={room.images[0]}
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {formatCurrency(room.price)}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {room.capacity}</span>
                  <span className="flex items-center gap-1"><Wifi className="h-4 w-4" /> WiFi</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/habitaciones/${room.id}`}
                    className="flex-1 text-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Detalles
                  </Link>
                  <Link
                    to={`/reserva?roomId=${room.id}`}
                    className="flex-1 text-center py-2 px-4 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Reservar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Nuestros Servicios</h2>
            <p className="text-gray-600 mt-2">Todo lo que necesita para una estancia perfecta.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {services.map((service, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600">
                  <service.icon className="h-8 w-8" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{service.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Galería</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gallery.slice(0, 8).map((img) => (
            <div key={img.id} className="relative overflow-hidden rounded-xl aspect-square">
              <img src={img.url} alt={img.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Lo que dicen nuestros huéspedes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="card p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-gray-600 italic mb-6">"{review.comment}"</p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="font-bold text-gray-900">{review.userName}</span>
                <span className="text-xs text-gray-400">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ubicación Privilegiada</h2>
            <p className="text-gray-600 mb-8">
              Estamos ubicados en el corazón de la ciudad, cerca de los principales centros de negocios y atracciones turísticas.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="h-5 w-5 text-indigo-600" />
                <span>Av. Lujo 123, San Isidro, Lima, Perú</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Navigation className="h-5 w-5 text-indigo-600" />
                <span>A 15 min del Aeropuerto</span>
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=-12.097,-77.036" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
              >
                <Navigation className="h-4 w-4" /> Cómo llegar
              </a>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=-12.097,-77.036" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" /> Google Maps
              </a>
            </div>
          </div>
          <div className="h-96 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.23456789!2d-77.036!3d-12.097!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA1JzQ5LjIiUyA3N8KwMDInMDkuNiJX!5e0!3m2!1ses!2spe!4v1620000000000!5m2!1ses!2spe" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-indigo-600 rounded-3xl p-12 text-center text-white shadow-xl">
          <h2 className="text-4xl font-bold mb-6">¿Listo para su estancia?</h2>
          <p className="text-xl mb-10 text-indigo-100">Reserve directamente con nosotros y obtenga los mejores beneficios.</p>
          <Link
            to="/reserva"
            className="inline-block px-12 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg"
          >
            Reservar Ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
