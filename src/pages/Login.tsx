import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Hotel, AlertCircle, UserPlus, User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../services/storage';
import { User as UserType } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Simular un pequeño retraso para el efecto de autenticación
    await new Promise(resolve => setTimeout(resolve, 1500));

    const users = storage.getUsers();

    if (isLogin) {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        storage.setCurrentUser(user);
        navigate(user.role === 'admin' ? '/admin' : '/user');
      } else {
        setError('Credenciales incorrectas. Intente con admin@hotel.com / admin');
        setIsLoading(false);
      }
    } else {
      // Registro
      if (users.some(u => u.email === email)) {
        setError('El correo electrónico ya está registrado.');
        setIsLoading(false);
        return;
      }

      const newUser: UserType = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        password,
        name: fullName,
        phone: phone,
        role: 'user'
      };

      storage.saveUser(newUser);
      setSuccess('Cuenta creada con éxito. Ahora puede iniciar sesión.');
      setIsLogin(true);
      setPassword('');
      setFullName('');
      setPhone('');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Hotel" 
          className="w-full h-full object-cover scale-110 blur-[2px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white/10 backdrop-blur-xl rounded-[3rem] overflow-hidden border border-white/20 shadow-2xl"
      >
        {/* Left Side: Info (Visible on Desktop) */}
        <div className="hidden lg:flex flex-col justify-between p-16 text-white bg-indigo-600/20">
          <div>
            <div className="inline-flex p-4 bg-white/10 rounded-3xl mb-8">
              <Hotel className="h-10 w-10" />
            </div>
            <h2 className="text-5xl font-bold mb-6 leading-tight">Experiencias Inolvidables</h2>
            <p className="text-xl text-indigo-100 font-light leading-relaxed">
              Únase a nuestra comunidad exclusiva y disfrute de los mejores beneficios en Lumina Hotel & Spa.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-1 w-12 bg-white rounded-full" />
              <span className="text-sm font-bold uppercase tracking-widest">Lujo & Confort</span>
            </div>
            <p className="text-sm text-indigo-200">
              © 2026 Lumina Hotel & Spa. Todos los derechos reservados.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="bg-white p-10 md:p-16 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900">
                  {isLogin ? 'Bienvenido' : 'Únete a nosotros'}
                </h1>
                <p className="text-gray-500">
                  {isLogin 
                    ? 'Por favor, introduce tus datos para continuar.' 
                    : 'Crea tu cuenta y comienza tu viaje con nosotros.'}
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 text-green-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border border-green-100"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {success}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nombre Completo</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                          type="text"
                          required
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                          placeholder="Juan Pérez"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Teléfono</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                          type="tel"
                          required
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                          placeholder="+51 999 999 999"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                      placeholder="ejemplo@hotel.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Contraseña</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="password"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Autenticando...
                    </>
                  ) : isLogin ? (
                    <>
                      <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" /> Iniciar Sesión
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 group-hover:scale-110 transition-transform" /> Crear Cuenta
                    </>
                  )}
                </button>
              </form>

              <div className="text-center space-y-6">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  {isLogin 
                    ? <>¿No tiene una cuenta? <span className="text-indigo-600 font-bold hover:underline">Regístrese aquí</span></>
                    : <>¿Ya tiene una cuenta? <span className="text-indigo-600 font-bold hover:underline">Inicie sesión</span></>
                  }
                </button>

                {isLogin && (
                  <div className="pt-8 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-4">Acceso Rápido (Demo)</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setEmail('admin@hotel.com'); setPassword('admin'); }}
                        className="flex-1 bg-gray-50 hover:bg-gray-100 p-3 rounded-xl text-[10px] text-left transition-colors"
                      >
                        <div className="font-bold text-gray-600">Admin</div>
                        <div className="text-gray-400 truncate">admin@hotel.com</div>
                      </button>
                      <button 
                        onClick={() => { setEmail('juan@gmail.com'); setPassword('user'); }}
                        className="flex-1 bg-gray-50 hover:bg-gray-100 p-3 rounded-xl text-[10px] text-left transition-colors"
                      >
                        <div className="font-bold text-gray-600">Usuario</div>
                        <div className="text-gray-400 truncate">juan@gmail.com</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
