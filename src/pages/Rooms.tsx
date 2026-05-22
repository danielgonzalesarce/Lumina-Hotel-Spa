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
  const [minCapacity, setMinCapacity] = useState<number>(0);

  useEffect(() => {
    setRooms(storage.getRooms());
  }, []);

  const filteredRooms = rooms.filter(room => {
    const matchesType = filter === 'all' || room.type === filter;
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapacity = room.capacity >= minCapacity;
    
    return matchesType && matchesSearch && matchesCapacity;
  });

  const types = [
    { id: 'all', name: 'Todas' },
    { id: RoomType.Standard, name: 'Estándar' },
    { id: RoomType.Double, name: 'Doble' },
    { id: RoomType.Suite, name: 'Suite' },
    { id: RoomType.PremiumSuite, name: 'Premium' },
  ];

  const capacities = [0, 1, 2, 3, 4];

  return (
    <div className="w-full -mt-20">
      <div className="relative w-full h-[500px] mb-12 shadow-2xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80"
          alt="Luxury Bedroom"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"></div>
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center space-y-3 px-4 drop-shadow-lg pt-20">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter">Nuestras Habitaciones</h1>
          <p className="text-slate-100 font-light text-xl md:text-2xl max-w-2xl mx-auto">
            El refugio perfecto diseñado para su confort exclusivo.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Filters Container */}
      <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-12 sticky top-24 z-30 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Search */}
            <div className="lg:col-span-4 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar habitación..."
                className="w-full pl-12 pr-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-slate-200 outline-none transition-all placeholder:text-slate-400 text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type */}
            <div className="lg:col-span-4 flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 whitespace-nowrap">Tipo</span>
              {types.map(type => (
                <button
                  key={type.id}
                  onClick={() => setFilter(type.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    filter === type.id 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>

            {/* Capacity */}
            <div className="lg:col-span-4 flex items-center justify-end gap-2 overflow-x-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 whitespace-nowrap">Capacidad</span>
              {capacities.map(cap => (
                <button
                  key={cap}
                  onClick={() => setMinCapacity(cap)}
                  className={`min-w-[40px] h-10 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                    minCapacity === cap
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cap === 0 ? 'All' : cap + '+'}
                </button>
              ))}
            </div>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-900 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-slate-100">
                  {room.type}
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-slate-900 px-4 py-2 rounded-xl text-lg font-bold shadow-sm">
                  {formatCurrency(room.price)} <span className="text-xs font-normal text-slate-500">/ noche</span>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{room.name}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-3">
                  {room.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Users className="h-4 w-4 text-[var(--color-primary)]" />
                    <span>{room.capacity} Personas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Wifi className="h-4 w-4 text-[var(--color-primary)]" />
                    <span>WiFi Gratis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Wind className="h-4 w-4 text-[var(--color-primary)]" />
                    <span>Aire Acond.</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Shield className="h-4 w-4 text-[var(--color-primary)]" />
                    <span>Seguridad</span>
                  </div>
                </div>

                <div className="mt-auto flex gap-3">
                  <Link
                    to={`/habitaciones/${room.id}`}
                    className="btn-secondary flex-1 text-center"
                  >
                    Detalles
                  </Link>
                  <Link
                    to={`/reserva?roomId=${room.id}`}
                    className="btn-primary flex-1 text-center"
                  >
                    Reservar
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
          
          {filteredRooms.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Sin Resultados</h3>
              <p className="text-slate-500">No encontramos habitaciones que coincidan con su búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
