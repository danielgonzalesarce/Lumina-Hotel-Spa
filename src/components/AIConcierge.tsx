import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Minimize2, Maximize2, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { geminiService } from '../services/gemini';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '¡Hola! Soy Lumina, tu Concierge Inteligente. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const suggestedTopics = [
    '🛏️ Ver habitaciones disponibles',
    '💆 Servicios de Spa & Wellness',
    '🍽️ Restaurante y Gastronomía',
    '💎 Suite Premium Lumina'
  ];

  const handleReset = () => {
    setMessages([{ role: 'model', text: '¡Hola! Soy Lumina, tu Concierge Inteligente. ¿En qué puedo ayudarte hoy?' }]);
    setIsMinimized(false);
  };

  const handleSend = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const userMessage = typeof e === 'string' ? e : input.trim();
    if (!userMessage || isLoading) return;

    if (typeof e !== 'string') setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await geminiService.getChatResponse(userMessage, history);
      setMessages(prev => [...prev, { role: 'model', text: response || 'Lo siento, no pude procesar tu solicitud.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Hubo un error al conectar con el servicio. Por favor, intenta de nuevo.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div
          className={`bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-4 flex flex-col transition-all duration-300 ${isMinimized ? 'h-[60px]' : 'h-[500px]'} w-[350px]`}
        >
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Concierge Inteligente</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-indigo-100 uppercase tracking-wider font-semibold">En línea</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleReset}
                title="Reiniciar chat"
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div 
                ref={scrollRef}
                className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50/50"
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                    }`}>
                      <div className="max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="mb-0.5">{children}</li>,
                            strong: ({ children }) => <strong className="font-extrabold">{children}</strong>,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                    </div>
                  </div>
                )}
                {messages.length === 1 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {suggestedTopics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleSend(topic)}
                        className="text-[10px] bg-white border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors font-medium shadow-sm"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Escribe tu consulta..."
                  className="flex-grow p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 ${
          isOpen ? 'bg-white text-indigo-600 border border-indigo-100' : 'bg-indigo-600 text-white'
        }`}
      >
        <Bot className="h-6 w-6" />
        {!isOpen && <span className="font-bold text-sm pr-2">¿Necesitas ayuda?</span>}
      </button>
    </div>
  );
}
