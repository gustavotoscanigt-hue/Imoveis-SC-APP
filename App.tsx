
import React, { useState, useEffect } from 'react';
import { PropertyCard } from './components/PropertyCard';
import { ChatAgent } from './components/ChatAgent';
import { AIDecorator } from './components/AIDecorator';
import { ConstructionMode } from './components/ConstructionMode';
import { Property } from './types';
import { Home, Box, Phone, Menu, X, ArrowLeft, HardHat, Share2, Check, Smartphone, Key, ExternalLink } from 'lucide-react';

// Mock Data
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Residencial Horizonte Azul',
    price: 'R$ 850.000',
    location: 'Jardins, São Paulo',
    beds: 3,
    baths: 2,
    sqft: 145,
    description: 'Apartamento de alto padrão com vista panorâmica. Acabamentos em mármore importado e tecnologia de automação residencial inclusa.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
    images: [],
    features: ['Automação', 'Varanda Gourmet', 'Piscina Aquecida']
  },
  {
    id: '2',
    title: 'Loft Industrial Downtown',
    price: 'R$ 1.200.000',
    location: 'Centro, Curitiba',
    beds: 1,
    baths: 1,
    sqft: 90,
    description: 'Loft moderno com pé direito duplo e estilo industrial autêntico. Ideal para quem busca sofisticação e localização privilegiada.',
    image: 'https://images.unsplash.com/photo-1536376074432-bc12f74258b7?auto=format&fit=crop&q=80&w=800',
    images: [],
    features: ['Pé Direito Duplo', 'Conceito Aberto', 'Academia']
  },
  {
    id: '3',
    title: 'Casa Verde Condomínio',
    price: 'R$ 2.500.000',
    location: 'Barra da Tijuca, Rio',
    beds: 4,
    baths: 4,
    sqft: 320,
    description: 'Casa espetacular em condomínio fechado. Integração total com a natureza, energia solar e sistema de reuso de água.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    images: [],
    features: ['Jardim Privativo', 'Energia Solar', 'Segurança 24h']
  }
];

declare global {
  // Define AIStudio interface if not already present, ensuring compatibility with the expected methods
  interface AIStudio {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  }

  interface Window {
    // FIX: Changed aistudio type from 'any' to 'AIStudio' to match the existing global declaration and resolve type collisions.
    aistudio?: AIStudio;
  }
}

type View = 'home' | 'property-detail' | 'ar-tool' | 'setup';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showConstructionMode, setShowConstructionMode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      // Prioridade para o process.env.API_KEY injetado
      if (process.env.API_KEY && process.env.API_KEY !== 'undefined') {
        setHasApiKey(true);
        return;
      }

      // Se estiver no ambiente do AI Studio, verifica a seleção
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(selected);
          if (!selected) setCurrentView('setup');
        } catch (e) {
          setHasApiKey(false);
          setCurrentView('setup');
        }
      } else {
        // Se não houver process.env nem aistudio, assume que pode falhar mas tenta rodar
        setHasApiKey(false);
        setCurrentView('setup');
      }
    };

    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume sucesso conforme orientações para evitar race conditions
      setHasApiKey(true);
      setCurrentView('home');
    } else {
      alert("Para usar as funções de IA, uma API Key deve estar configurada no ambiente.");
    }
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setCurrentView('property-detail');
    setShowConstructionMode(false);
    window.scrollTo(0,0);
  };

  const navTo = (view: View) => {
    if (!hasApiKey && view !== 'setup') {
      setCurrentView('setup');
      return;
    }
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo(0,0);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // View de Setup da API Key
  if (currentView === 'setup') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white text-center">
            <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
              <Key size={40} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Configuração Necessária</h1>
            <p className="text-blue-100 opacity-90">Para habilitar o decorador IA e o assistente virtual, selecione sua chave de API.</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Este aplicativo utiliza os modelos mais recentes do <strong>Gemini</strong> para gerar decorações e responder dúvidas.
              </p>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline"
              >
                Saiba mais sobre faturamento <ExternalLink size={12} />
              </a>
            </div>
            <button 
              onClick={handleSelectKey}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Key size={20} />
              Selecionar Chave de API
            </button>
            <p className="text-[10px] text-center text-slate-400">
              Sua chave é mantida segura e utilizada apenas para as requisições de IA deste app.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <nav className="bg-white sticky top-0 z-30 shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navTo('home')}>
              <Box className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">ImobAR</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => navTo('home')} className={`text-sm font-medium transition-colors ${currentView === 'home' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-500'}`}>Imóveis</button>
              <button onClick={() => navTo('ar-tool')} className={`text-sm font-medium transition-colors ${currentView === 'ar-tool' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-500'}`}>Simulador IA</button>
              <div className="h-6 w-px bg-slate-200 mx-2"></div>
              <button onClick={handleCopyLink} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isCopied ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                {isCopied ? <Check size={16} /> : <Share2 size={16} />}
                {isCopied ? 'Link Copiado!' : 'Compartilhar'}
              </button>
              <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">Agendar Visita</button>
            </div>

            <div className="flex items-center md:hidden gap-4">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 p-2">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 animate-fade-in p-4 space-y-4">
            <button onClick={() => navTo('home')} className="block w-full text-left py-2 font-medium">Imóveis</button>
            <button onClick={() => navTo('ar-tool')} className="block w-full text-left py-2 font-medium text-blue-600">Simulador IA</button>
          </div>
        )}
      </nav>

      <main className="flex-grow bg-slate-50">
        {currentView === 'home' && (
          <div className="animate-fade-in">
            <div className="relative bg-slate-900 text-white py-20 overflow-hidden">
              <div className="absolute inset-0 opacity-40">
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=60&w=1920" alt="Building" className="w-full h-full object-cover" />
              </div>
              <div className="relative max-w-7xl mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Realidade Aumentada Imobiliária</h1>
                <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-10">Mobiliamos seus sonhos com inteligência artificial generativa em tempo real.</p>
                <button onClick={() => navTo('ar-tool')} className="bg-blue-600 px-10 py-4 rounded-full font-bold hover:bg-blue-700 transition-all hover:scale-105 shadow-xl flex items-center gap-3 mx-auto">
                  <Box size={24} />
                  Decorador Virtual IA
                </button>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-bold text-slate-800">Empreendimentos</h2>
                <div className="hidden md:flex gap-2">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">Prontos</span>
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">Em Obra</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {MOCK_PROPERTIES.map(prop => (
                  <PropertyCard key={prop.id} property={prop} onSelect={handlePropertySelect} />
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'ar-tool' && (
          <div className="py-12 animate-fade-in">
            <AIDecorator />
          </div>
        )}

        {currentView === 'property-detail' && selectedProperty && (
          <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
            <button onClick={() => navTo('home')} className="flex items-center text-slate-500 hover:text-blue-600 mb-8 font-medium">
              <ArrowLeft size={20} className="mr-2" />
              Ver outros imóveis
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="rounded-3xl overflow-hidden shadow-2xl h-[450px] border-4 border-white">
                  <img src={selectedProperty.image} alt={selectedProperty.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ToolIcon icon={<Box />} label="Decorar IA" onClick={() => navTo('ar-tool')} primary />
                  <ToolIcon 
                    icon={<HardHat />} 
                    label="Modo Obra" 
                    active={showConstructionMode} 
                    onClick={() => setShowConstructionMode(!showConstructionMode)} 
                  />
                  <ToolIcon icon={<Home />} label="Tour 360" />
                  <ToolIcon icon={<Phone />} label="Agendar" />
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-black text-slate-900 mb-2">{selectedProperty.title}</h1>
                  <p className="text-3xl text-blue-600 font-bold">{selectedProperty.price}</p>
                </div>

                {showConstructionMode ? (
                  <div className="animate-fade-in-up">
                    <ConstructionMode property={selectedProperty} />
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-2 gap-8">
                      <Detail label="Localização" value={selectedProperty.location} />
                      <Detail label="Área Útil" value={`${selectedProperty.sqft} m²`} />
                      <Detail label="Dormitórios" value={selectedProperty.beds} />
                      <Detail label="Banheiros" value={selectedProperty.baths} />
                    </div>

                    <div className="prose prose-slate">
                      <h3 className="text-xl font-bold text-slate-800">Descrição do Projeto</h3>
                      <p className="text-slate-600 leading-relaxed text-lg">{selectedProperty.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedProperty.features.map((feat, idx) => (
                        <span key={idx} className="bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-500 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center items-center">
             <Box className="h-6 w-6 text-blue-500 mr-2" />
             <span className="text-xl font-bold text-white tracking-tight">ImobAR</span>
          </div>
          <p className="text-sm">Desenvolvido com tecnologia de ponta em IA para o setor imobiliário.</p>
          <div className="flex justify-center gap-6 text-xs font-bold uppercase tracking-widest pt-4">
            <span className="hover:text-blue-400 cursor-pointer">Privacidade</span>
            <span className="hover:text-blue-400 cursor-pointer">Termos</span>
            <span className="hover:text-blue-400 cursor-pointer">Suporte</span>
          </div>
        </div>
      </footer>

      <ChatAgent />
    </div>
  );
}

function ToolIcon({ icon, label, onClick, active, primary }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-2xl border text-center cursor-pointer transition-all duration-300 group ${
        active 
          ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
          : primary 
            ? 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100'
            : 'bg-white border-slate-100 text-slate-600 hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <div className={`mx-auto mb-2 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-white' : ''}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
    </div>
  );
}

function Detail({ label, value }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{label}</p>
      <p className="text-slate-800 font-bold">{value}</p>
    </div>
  );
}

export default App;
