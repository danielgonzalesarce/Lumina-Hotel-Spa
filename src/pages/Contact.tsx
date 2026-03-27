import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Facebook, Instagram } from 'lucide-react';
import { motion } from 'motion/react';
import { storage } from '../services/storage';

export default function Contact() {
  const config = storage.getConfig();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Contáctenos</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Estamos aquí para ayudarle. Si tiene alguna pregunta o necesita asistencia especial, no dude en escribirnos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Info de contacto */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Información de Contacto</h3>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Dirección</div>
                <div className="text-sm text-gray-500">{config.address}</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Teléfono</div>
                <div className="text-sm text-gray-500">{config.phone}</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Email</div>
                <div className="text-sm text-gray-500">{config.email}</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-gray-900">WhatsApp</div>
                <div className="text-sm text-gray-500">+{config.whatsapp}</div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 text-white p-8 rounded-[2rem] shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Horario de Atención</h3>
              <div className="space-y-2 text-indigo-100 text-sm">
                <div className="flex justify-between">
                  <span>Recepción:</span>
                  <span className="font-bold">24 Horas</span>
                </div>
                <div className="flex justify-between">
                  <span>Administración:</span>
                  <span>Lun - Vie, 9am - 6pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Restaurante:</span>
                  <span>Diario, 7am - 11pm</span>
                </div>
              </div>
            </div>

            {(config.facebook || config.instagram) && (
              <div className="pt-6 border-t border-white/20">
                <h4 className="text-sm font-bold mb-4 uppercase tracking-wider text-indigo-200">Síguenos</h4>
                <div className="flex gap-4">
                  {config.facebook && (
                    <a href={config.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {config.instagram && (
                    <a href={config.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formulario */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-10 md:p-12 rounded-[3rem] border border-gray-100 shadow-xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Nombre</label>
                <input
                  type="text"
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Su nombre..."
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Asunto</label>
              <input
                type="text"
                required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="¿En qué podemos ayudarle?"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Mensaje</label>
              <textarea
                required
                rows={6}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Escriba su mensaje aquí..."
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              />
            </div>
            <button
              type="submit"
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
            >
              <Send className="h-5 w-5" /> Enviar Mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
