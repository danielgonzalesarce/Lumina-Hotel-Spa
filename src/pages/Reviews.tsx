import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Filter, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../services/storage';
import { Review } from '../types';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'recent' | 'rating'>('recent');
  const [currentUser] = useState(storage.getCurrentUser());

  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    setReviews(storage.getReviews().filter(r => r.approved));
  }, []);

  const sortedReviews = [...reviews].sort((a, b) => {
    if (filter === 'recent') return new Date(b.date).getTime() - new Date(a.date).getTime();
    return b.rating - a.rating;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Debe iniciar sesión para dejar una reseña.');
      return;
    }

    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      rating: formData.rating,
      comment: formData.comment,
      date: new Date().toISOString().split('T')[0],
      approved: false // Requiere aprobación del admin
    };

    storage.saveReview(newReview);
    alert('¡Gracias! Su reseña ha sido enviada y está pendiente de aprobación.');
    setShowForm(false);
    setFormData({ rating: 5, comment: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Reseñas de Clientes</h1>
          <p className="text-gray-600">Descubra lo que otros huéspedes opinan sobre su estancia.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus className="h-5 w-5" /> Dejar una reseña
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl space-y-6 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900">Nueva Reseña</h3>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Calificación</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`p-2 transition-colors ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                    >
                      <Star className="h-8 w-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Comentario</label>
                <textarea
                  required
                  rows={4}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Cuéntenos su experiencia..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
                >
                  Enviar Reseña
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Ordenar por:</span>
          <select
            className="bg-transparent text-sm font-bold text-indigo-600 focus:outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="recent">Más recientes</option>
            <option value="rating">Mejor puntuación</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          {sortedReviews.length} Reseñas encontradas
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedReviews.map((review) => (
          <motion.div
            key={review.id}
            layout
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-400">{review.date}</span>
            </div>
            <p className="text-gray-700 leading-relaxed italic">"{review.comment}"</p>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                {review.userName.charAt(0)}
              </div>
              <span className="font-bold text-gray-900">{review.userName}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
