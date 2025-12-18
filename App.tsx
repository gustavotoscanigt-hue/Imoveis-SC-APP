import React, { useState, useEffect } from 'react';
import { PropertyCard } from './components/PropertyCard';
import { ChatAgent } from './components/ChatAgent';
import { AIDecorator } from './components/AIDecorator';
import { ConstructionMode } from './components/ConstructionMode';
import { Property } from './types';
import { Home, Box, Phone, Menu, X, ArrowLeft, HardHat, Share2, Check, Smartphone, Download, Plus } from 'lucide-react';

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
    image: 'https://picsum.photos/800/600?random=1',
    images: ['https://picsum.photos/800/600?random=10', 'https://picsum.photos/800/600?random=11'],
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
    image: 'https://picsum.photos/800/600?random=2',
    images: ['https://picsum.photos/800/600?random=12'],
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
    image: 'https://picsum.photos/800/600?random=3',
    images: [],
    features: ['Jardim Privativo', 'Energia Solar', 'Segurança 24h']
  }
];

type View = 'home' | 'property-detail' | 'ar-tool';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showConstructionMode, setShowConstructionMode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Check if it's mobile and not already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // Logic for Android install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) setShowInstallBanner(true);
    });

    // Fallback for iOS and other cases
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && !isStandalone && !deferredPrompt) {
      // Small delay to check if beforeinstallprompt fired
      setTimeout(() => {
         setShowInstallBanner(true);
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } else {
      // iOS fallback instructions
      alert("No iPhone/iPad:\n1. Toque no botão 'Compartilhar' (ícone de quadrado com seta)\n2. Role para baixo e selecione 'Adicionar à Tela de Início'\n3. Toque em 'Adicionar'");
      setShowInstallBanner(false);
    }
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setCurrentView('property-detail');
    setShowConstructionMode(false);
    window.scrollTo(0,0);
  };

  const navTo = (view: View) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo(0,0);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Install App Banner (Mobile Only) */}
      {showInstallBanner && (
        <div className="bg-blue-600 text-white p-4 flex flex-col gap-3 animate-fade-in text-sm sticky top-0 z-[60] shadow-xl border-b border-blue-500">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="bg-white p-2 rounded-xl shadow-inner">
                 <Smartphone className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="font-bold text-base">Instalar ImobAR</p>
                <p className="text-blue-100 opacity-90">Acesse tours 3D e decoração IA com um toque.</p>
              </div>
            </div>
            <button onClick={() => setShowInstallBanner(false)} className="p-1 hover:bg-blue-500 rounded-full">
              <X size={20} />
            </button>
          </div>
          <button 
            onClick={handleInstallClick}
            className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <Plus size={18} />
            Instalar Aplicativo
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white sticky top-0 z-30 shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navTo('home')}>
              <Box className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">ImobAR</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => navTo('home')} className={`text-sm font-medium transition-colors ${currentView === 'home' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-500'}`}>Imóveis</button>
              <button onClick={() => navTo('ar-tool')} className={`text-sm font-medium transition-colors ${currentView === 'ar-tool' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-500'}`}>Simulador 3D/IA</button>
              
              <div className="h-6 w-px bg-slate-200 mx-2"></div>
              
              <button 
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isCopied ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {isCopied ? <Check size={16} /> : <Share2 size={16} />}
                {isCopied ? 'Link Copiado!' : 'Copiar Link'}
              </button>

              <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">Agendar Visita</button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden gap-4">
               <button 
                onClick={handleCopyLink}
                className="p-2 text-slate-600"
              >
                {isCopied ? <Check className="text-green-600" size={24} /> : <Share2 size={24} />}
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button onClick={() => navTo('home')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">Imóveis</button>
              <button onClick={() => navTo('ar-tool')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">Simulador 3D/IA</button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-slate-50">
        
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="relative bg-slate-900 text-white py-24 overflow-hidden">
              <div className="absolute inset-0 opacity-40">
                <img src="https://picsum.photos/1920/1080?grayscale" alt="Background" className="w-full h-full object-cover" />
              </div>
              <div className="relative max-w-7xl mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">O Futuro da Construção Civil</h1>
                <p className="text-xl md:text-2xl text-slate-200 max-w-2xl mx-auto mb-8">Experimente seus futuros ambientes antes mesmo de entrarem na obra com nossa tecnologia de Realidade Aumentada e IA.</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => navTo('ar-tool')} className="bg-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all hover:scale-105 shadow-lg shadow-blue-900/50 flex items-center gap-2">
                    <Box size={20} />
                    Testar Decorador IA
                  </button>
                </div>
              </div>
            </div>

            {/* Property List */}
            <div className="max-w-7xl mx-auto px-4 py-16">
              <h2 className="text-3xl font-bold text-slate-800 mb-8 border-l-4 border-blue-600 pl-4">Lançamentos em Destaque</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {MOCK_PROPERTIES.map(prop => (
                  <PropertyCard key={prop.id} property={prop} onSelect={handlePropertySelect} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: AR TOOL */}
        {currentView === 'ar-tool' && (
          <div className="py-12 animate-fade-in">
            <AIDecorator />
          </div>
        )}

        {/* VIEW: PROPERTY DETAIL */}
        {currentView === 'property-detail' && selectedProperty && (
          <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
            <button onClick={() => navTo('home')} className="flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors">
              <ArrowLeft size={20} className="mr-2" />
              Voltar para lista
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="rounded-2xl overflow-hidden shadow-lg h-[400px]">
                  <img src={selectedProperty.image} alt={selectedProperty.title} className="w-full h-full object-cover" />
                </div>
                
                {/* Action Buttons Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center cursor-pointer hover:border-blue-400 transition-colors group" onClick={() => navTo('ar-tool')}>
                    <Box className="mx-auto text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-700">Decorar (IA)</span>
                  </div>
                  
                  <div 
                    className={`bg-white p-3 rounded-xl shadow-sm border text-center cursor-pointer transition-colors group ${showConstructionMode ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-100 hover:border-blue-400'}`}
                    onClick={() => setShowConstructionMode(!showConstructionMode)}
                  >
                    <HardHat className="mx-auto text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-700">Modo Construção</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center group cursor-pointer">
                    <Home className="mx-auto text-slate-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-700">Tour 360º</span>
                  </div>
                   <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center group cursor-pointer">
                    <Phone className="mx-auto text-slate-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-700">Falar com Agente</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{selectedProperty.title}</h1>
                  <p className="text-2xl text-blue-600 font-semibold">{selectedProperty.price}</p>
                </div>

                {/* Construction Mode Injector */}
                {showConstructionMode ? (
                    <div className="animate-fade-in-up">
                        <ConstructionMode property={selectedProperty} />
                    </div>
                ) : (
                    <>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-semibold text-slate-800 mb-4">Detalhes do Imóvel</h3>
                        <div className="grid grid-cols-2 gap-y-4 text-sm text-slate-600">
                            <div className="flex items-center">
                            <span className="w-24 font-medium text-slate-400">Localização:</span>
                            {selectedProperty.location}
                            </div>
                            <div className="flex items-center">
                            <span className="w-24 font-medium text-slate-400">Área:</span>
                            {selectedProperty.sqft} m²
                            </div>
                            <div className="flex items-center">
                            <span className="w-24 font-medium text-slate-400">Quartos:</span>
                            {selectedProperty.beds}
                            </div>
                            <div className="flex items-center">
                            <span className="w-24 font-medium text-slate-400">Banheiros:</span>
                            {selectedProperty.baths}
                            </div>
                        </div>
                        </div>

                        <div>
                        <h3 className="font-semibold text-slate-800 mb-3">Sobre</h3>
                        <p className="text-slate-600 leading-relaxed">{selectedProperty.description}</p>
                        </div>

                        <div>
                        <h3 className="font-semibold text-slate-800 mb-3">Diferenciais</h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedProperty.features.map((feat, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                {feat}
                            </span>
                            ))}
                        </div>
                        </div>
                    </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center mb-6">
             <Box className="h-6 w-6 text-blue-500 mr-2" />
             <span className="text-xl font-bold text-white">ImobAR</span>
          </div>
          <p className="mb-4 text-sm">Transformando sonhos em realidade através da tecnologia.</p>
          <p className="text-xs text-slate-600">&copy; 2024 ImobAR Construtora. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* AI Chat Agent Overlay */}
      <ChatAgent />
    </div>
  );
}

export default App;