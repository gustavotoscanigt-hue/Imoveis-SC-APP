
import React, { useState } from 'react';
import { PropertyCard } from './components/PropertyCard';
import { ChatAgent } from './components/ChatAgent';
import { AIDecorator } from './components/AIDecorator';
import { ConstructionMode } from './components/ConstructionMode';
import { Property } from './types';
import { Box, Menu, X, ArrowLeft, HardHat, Share2, Check, Home, Phone, Calendar, Info, Award, Users, Shield } from 'lucide-react';

const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Residencial Horizonte Azul',
    price: 'R$ 850.000',
    location: 'Jardins, São Paulo',
    beds: 3,
    baths: 2,
    sqft: 145,
    description: 'Um ícone de sofisticação nos Jardins. Este empreendimento une a tradição do bairro com a tecnologia de ponta em construção sustentável. Vidros com atenuação acústica e automação total via smartphone.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
    images: [],
    features: ['Automação', 'Varanda Gourmet', 'Piscina Aquecida', 'Laje Protendida']
  },
  {
    id: '2',
    title: 'Loft Industrial Downtown',
    price: 'R$ 1.200.000',
    location: 'Centro, Curitiba',
    beds: 1,
    baths: 1,
    sqft: 90,
    description: 'Inspirado nos lofts de Nova York, este projeto traz o conceito "raw luxury". Pé direito de 5 metros, concreto aparente polido e infraestrutura completa para home office de alto desempenho.',
    image: 'https://images.unsplash.com/photo-1536376074432-bc12f74258b7?auto=format&fit=crop&q=80&w=800',
    images: [],
    features: ['Pé Direito Duplo', 'Conceito Aberto', 'Rooftop Lounge']
  },
  {
    id: '3',
    title: 'Casa Verde Condomínio',
    price: 'R$ 2.500.000',
    location: 'Barra da Tijuca, Rio',
    beds: 4,
    baths: 4,
    sqft: 320,
    description: 'Residência sustentável com certificação LEED. O projeto prioriza a iluminação natural e o fluxo de ar, reduzindo o consumo de energia em até 40%. Luxo e consciência ambiental em perfeita harmonia.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    images: [],
    features: ['Jardim Vertical', 'Energia Fotovoltaica', 'Segurança Biométrica']
  }
];

type View = 'home' | 'property-detail' | 'ar-tool' | 'about';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showConstructionMode, setShowConstructionMode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setCurrentView('property-detail');
    setShowConstructionMode(false);
    window.scrollTo(0, 0);
  };

  const navTo = (view: View) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-white selection:bg-blue-100 selection:text-blue-700">
      {/* Top Professional Nav */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center cursor-pointer group" onClick={() => navTo('home')}>
              <div className="bg-blue-600 p-2 rounded-lg mr-3 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                <Box className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">Imob<span className="text-blue-600">AR</span></span>
            </div>
            
            <div className="hidden md:flex items-center space-x-10">
              <NavButton active={currentView === 'home'} onClick={() => navTo('home')}>Portfólio</NavButton>
              <NavButton active={currentView === 'ar-tool'} onClick={() => navTo('ar-tool')}>Simulador IA</NavButton>
              <NavButton active={currentView === 'about'} onClick={() => navTo('about')}>A Construtora</NavButton>
              <button className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
                Área do Cliente
              </button>
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-600">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 animate-fade-in p-6 space-y-4 shadow-xl">
            <button onClick={() => navTo('home')} className="block w-full text-left py-3 text-lg font-semibold">Portfólio</button>
            <button onClick={() => navTo('ar-tool')} className="block w-full text-left py-3 text-lg font-semibold text-blue-600">Simulador IA</button>
            <button onClick={() => navTo('about')} className="block w-full text-left py-3 text-lg font-semibold">Sobre Nós</button>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {currentView === 'home' && (
          <div className="animate-fade-in">
            {/* High-End Hero */}
            <div className="relative bg-slate-950 py-32 overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000" alt="Arquiteto" className="w-full h-full object-cover opacity-30 grayscale" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
              </div>
              
              <div className="relative z-10 max-w-7xl mx-auto px-4 text-center md:text-left grid md:grid-cols-2 items-center gap-12">
                <div>
                  <div className="inline-flex items-center bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-blue-500/30">
                    <Award size={14} className="mr-2" /> Tecnologia Imobiliária 4.0
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
                    O futuro da sua <br/> <span className="text-blue-500">nova moradia.</span>
                  </h1>
                  <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
                    A ImobAR utiliza inteligência artificial generativa para que você personalize e visualize seu futuro lar antes mesmo do primeiro tijolo.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => navTo('home')} className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                      Ver Portfólio <ArrowLeft className="rotate-180" size={20} />
                    </button>
                    <button onClick={() => navTo('ar-tool')} className="bg-slate-800 text-white border border-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-700 transition-all">
                      Testar Decorador IA
                    </button>
                  </div>
                </div>
                <div className="hidden md:grid grid-cols-2 gap-4">
                  <StatCard icon={<Home />} label="Entregues" value="+15k" />
                  <StatCard icon={<Users />} label="Clientes" value="+40k" />
                  <StatCard icon={<Shield />} label="Garantia" value="10 anos" />
                  <StatCard icon={<Award />} label="Prêmios" value="Top 5" />
                </div>
              </div>
            </div>

            {/* Properties Section */}
            <div className="max-w-7xl mx-auto px-4 py-24">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 mb-4">Empreendimentos Exclusivos</h2>
                  <p className="text-slate-500 text-lg">Curadoria dos melhores projetos para investimento e moradia.</p>
                </div>
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button className="px-6 py-2 bg-white text-blue-600 font-bold rounded-lg shadow-sm">Todos</button>
                  <button className="px-6 py-2 text-slate-500 font-bold">Lançamentos</button>
                  <button className="px-6 py-2 text-slate-500 font-bold">Prontos</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {MOCK_PROPERTIES.map(prop => (
                  <PropertyCard key={prop.id} property={prop} onSelect={handlePropertySelect} />
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'ar-tool' && (
          <div className="bg-slate-50 py-20 min-h-screen animate-fade-in">
            <AIDecorator />
          </div>
        )}

        {currentView === 'property-detail' && selectedProperty && (
          <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
            <button onClick={() => navTo('home')} className="flex items-center text-slate-400 hover:text-blue-600 mb-10 font-bold tracking-tight transition-colors">
              <ArrowLeft size={20} className="mr-2" /> VOLTAR PARA LISTAGEM
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-7 space-y-8">
                <div className="relative group">
                  <div className="rounded-[40px] overflow-hidden shadow-2xl h-[550px] border-8 border-white">
                    <img src={selectedProperty.image} alt={selectedProperty.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-10 rounded-[40px] shadow-2xl hidden md:block">
                    <p className="text-sm font-bold opacity-80 mb-1 uppercase tracking-widest">Valor de Mercado</p>
                    <p className="text-3xl font-black">{selectedProperty.price}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                  <ToolAction icon={<Box />} label="Decorador IA" onClick={() => navTo('ar-tool')} active />
                  <ToolAction icon={<HardHat />} label="Acompanhar Obra" onClick={() => setShowConstructionMode(true)} />
                  <ToolAction icon={<Calendar />} label="Agendar Visita" />
                  <ToolAction icon={<Info />} label="Memorial" />
                </div>
              </div>
              
              <div className="lg:col-span-5 space-y-12">
                {showConstructionMode ? (
                  <div className="animate-fade-in-up">
                    <button onClick={() => setShowConstructionMode(false)} className="mb-4 text-xs font-bold text-blue-600 flex items-center gap-1">
                       <ArrowLeft size={14} /> VOLTAR PARA DETALHES
                    </button>
                    <ConstructionMode property={selectedProperty} />
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div>
                      <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">{selectedProperty.title}</h1>
                      <p className="text-slate-500 text-xl font-medium">{selectedProperty.location}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <SpecItem label="Área Útil" value={`${selectedProperty.sqft}m²`} />
                      <SpecItem label="Quartos" value={selectedProperty.beds} />
                      <SpecItem label="Vagas" value="2" />
                      <SpecItem label="Status" value="Obras 85%" />
                    </div>

                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Sobre o Conceito</h3>
                      <p className="text-slate-600 leading-relaxed">{selectedProperty.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedProperty.features.map((feat, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                          {feat}
                        </span>
                      ))}
                    </div>

                    <button className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3">
                      Falar com Especialista <Phone size={24} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-950 text-slate-500 py-24">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-16">
          <div className="space-y-6">
            <div className="flex items-center">
               <Box className="h-8 w-8 text-blue-500 mr-2" />
               <span className="text-2xl font-black text-white">ImobAR</span>
            </div>
            <p className="text-sm leading-relaxed">
              Redefinindo o mercado imobiliário através da visão computacional e inteligência artificial de última geração.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Empreendimentos</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-blue-400 cursor-pointer">Residenciais</li>
              <li className="hover:text-blue-400 cursor-pointer">Comerciais</li>
              <li className="hover:text-blue-400 cursor-pointer">Lançamentos</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Empresa</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-blue-400 cursor-pointer">Sobre Nós</li>
              <li className="hover:text-blue-400 cursor-pointer">Trabalhe Conosco</li>
              <li className="hover:text-blue-400 cursor-pointer">Imprensa</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Suporte</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-blue-400 cursor-pointer">Central de Ajuda</li>
              <li className="hover:text-blue-400 cursor-pointer">Portal do Cliente</li>
              <li className="hover:text-blue-400 cursor-pointer">Privacidade</li>
            </ul>
          </div>
        </div>
      </footer>

      <ChatAgent />
    </div>
  );
}

function NavButton({ children, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`text-sm font-bold transition-all border-b-2 py-2 ${
        active ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-900 hover:border-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
      <div className="text-blue-500 mb-2">{React.cloneElement(icon, { size: 24 })}</div>
      <p className="text-white text-2xl font-black">{value}</p>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</p>
    </div>
  );
}

function SpecItem({ label, value }: any) {
  return (
    <div className="border-b border-slate-100 pb-3">
      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">{label}</p>
      <p className="text-slate-900 font-bold text-lg">{value}</p>
    </div>
  );
}

function ToolAction({ icon, label, onClick, active }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 group ${
        active 
          ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100 scale-105' 
          : 'bg-white border-slate-100 text-slate-600 hover:border-blue-300 hover:text-blue-600'
      }`}
    >
      <div className={`mb-3 transition-transform group-hover:scale-110`}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-center">{label}</span>
    </button>
  );
}

export default App;
