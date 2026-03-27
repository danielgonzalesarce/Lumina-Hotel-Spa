import React from 'react';
import { Code2, Rocket, Target, Users, ShieldCheck, Zap, BarChart3, Layers, Globe, Cpu } from 'lucide-react';

export default function ProjectInfo() {
  const sections = [
    {
      title: "Innovación y Tecnología",
      icon: Rocket,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      items: [
        { label: "Inteligencia Artificial", value: "Integración con Google Gemini Pro para asistencia inteligente en tiempo real (Concierge)." },
        { label: "Frontend Moderno", value: "React 19 con Vite para un rendimiento óptimo y carga instantánea." },
        { label: "Estilizado Avanzado", value: "Tailwind CSS 4 para un diseño responsivo, moderno y mantenible." },
        { label: "Arquitectura Robusta", value: "Uso de TypeScript para garantizar la robustez y prevenir errores en tiempo de ejecución." }
      ]
    },
    {
      title: "Metodología de Desarrollo",
      icon: Code2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      items: [
        { label: "Arquitectura", value: "Basada en componentes reutilizables y separación de responsabilidades (Clean Code)." },
        { label: "Gestión de Estado", value: "Uso de Hooks personalizados y persistencia en LocalStorage para una experiencia sin servidor." },
        { label: "Control de Versiones", value: "Flujo de trabajo basado en Git para colaboración y despliegue continuo." },
        { label: "Diseño UX/UI", value: "Enfoque centrado en el usuario con una interfaz limpia, intuitiva y profesional." }
      ]
    },
    {
      title: "Modelo de Negocio",
      icon: Target,
      color: "text-amber-600",
      bg: "bg-amber-50",
      items: [
        { label: "Propuesta de Valor", value: "Digitalización completa de la experiencia hotelera, desde la reserva hasta el check-out." },
        { label: "Público Objetivo", value: "Viajeros modernos que buscan lujo, comodidad y eficiencia tecnológica." },
        { label: "Escalabilidad", value: "Diseño modular que permite añadir servicios adicionales (tours, spa, restaurante) fácilmente." },
        { label: "Análisis de Datos", value: "Dashboard administrativo con métricas clave para la toma de decisiones estratégicas." }
      ]
    }
  ];

  const techStack = [
    { name: "React 19", icon: Globe },
    { name: "TypeScript", icon: ShieldCheck },
    { name: "Tailwind 4", icon: Zap },
    { name: "Gemini AI", icon: Cpu },
    { name: "Chart.js", icon: BarChart3 },
    { name: "Lucide Icons", icon: Layers }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Sustentación del Proyecto
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Detalles técnicos, metodológicos y estratégicos de Lumina Hotel & Spa.
          </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-20">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 transition-transform hover:scale-105"
            >
              <tech.icon className="h-8 w-8 text-indigo-600" />
              <span className="font-bold text-gray-800 text-sm">{tech.name}</span>
            </div>
          ))}
        </div>

        {/* Main Sections */}
        <div className="space-y-12">
          {sections.map((section, i) => (
            <section
              key={section.title}
              className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className={`p-4 ${section.bg} ${section.color} rounded-2xl`}>
                  <section.icon className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{section.title}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {section.items.map((item, j) => (
                  <div key={j} className="space-y-2">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full" />
                      {item.label}
                    </h4>
                    <p className="text-gray-600 leading-relaxed pl-3.5">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Team/Mastery Section */}
        <div className="mt-20 bg-indigo-600 rounded-[3rem] p-12 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <Users className="h-16 w-16 mx-auto mb-6 opacity-50" />
            <h2 className="text-3xl font-bold mb-4">Dominio del Tema</h2>
            <p className="text-indigo-100 max-w-2xl mx-auto text-lg font-light">
              Este proyecto demuestra un dominio completo de las tecnologías web modernas, 
              integrando lógica de negocio compleja con una experiencia de usuario de primer nivel.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />
        </div>
      </div>
    </div>
  );
}
