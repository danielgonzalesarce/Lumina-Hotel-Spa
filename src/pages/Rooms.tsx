import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, Wifi, Wind, Shield, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { storage } from '../services/storage';
import { Room, RoomType } from '../types';
import { formatCurrency } from '../lib/utils';

export default function Rooms() {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setRooms(storage.getRooms());
  }, []);

  const filteredRooms = rooms.filter(room => {
    const matchesType = filter === 'all' || room.type === filter;
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const guestsParam = parseInt(searchParams.get('guests') || '0');
    const matchesCapacity = guestsParam ? room.capacity >= guestsParam : true;
    
    return matchesType && matchesSearch && matchesCapacity;
  });

  const types = [
    { id: 'all', name: 'Todas' },
    { id: RoomType.Standard, name: 'Estándar' },
    { id: RoomType.Double, name: 'Doble' },
    { id: RoomType.Suite, name: 'Suite' },
    { id: RoomType.PremiumSuite, name: 'Premium' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900">Nuestras Habitaciones</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Encuentre el espacio perfecto para su estancia, desde suites ejecutivas hasta habitaciones familiares de lujo.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2">
          {types.map(type => (
            <button
              key={type.id}
              onClick={() => setFilter(type.id)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === type.id 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRooms.map((room) => (
          <motion.div
            key={room.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card overflow-hidden flex flex-col group"
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={room.images[0]}
                alt={room.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-gray-200">
                {room.type}
              </div>
              <div className="absolute bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-lg font-bold shadow-lg">
                {formatCurrency(room.price)} <span className="text-xs font-normal text-indigo-100">/ noche</span>
              </div>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{room.name}</h3>
              <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                {room.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span>{room.capacity} Personas</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Wifi className="h-4 w-4 text-indigo-600" />
                  <span>WiFi Gratis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Wind className="h-4 w-4 text-indigo-600" />
                  <span>Aire Acond.</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <span>Seguridad</span>
                </div>
              </div>

              <div className="mt-auto flex gap-3">
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
          </motion.div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Sin Resultados</h3>
          <p className="text-gray-500">No encontramos habitaciones que coincidan con su búsqueda.</p>
        </div>
      )}
    </div>
  );
}
