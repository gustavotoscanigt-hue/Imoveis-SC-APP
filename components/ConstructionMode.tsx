import React, { useState } from 'react';
import { Property, ConstructionPhaseType } from '../types';
import { generateConstructionPhase } from '../services/geminiService';
import { Hammer, HardHat, RefreshCw, Pickaxe, Ruler, ArrowRight, AlertTriangle } from 'lucide-react';

interface ConstructionModeProps {
  property: Property;
}

const PHASES: ConstructionPhaseType[] = ['Fundação', 'Estrutura', 'Alvenaria', 'Acabamento'];

const PHASE_DETAILS: Record<ConstructionPhaseType, { materials: string[], description: string, progress: number }> = {
  'Fundação': {
    materials: ['Concreto Usinado C-30', 'Aço CA-50', 'Formas de Madeira', 'Brita e Areia'],
    description: 'Fase inicial focada na estabilidade. Inclui escavação, estaqueamento e concretagem das sapatas.',
    progress: 15
  },
  'Estrutura': {
    materials: ['Vigas de Concreto', 'Lajes Treliçadas', 'Escoramento Metálico', 'Tela Soldada'],
    description: 'Levantamento do esqueleto do edifício. Pilares, vigas e lajes são definidos.',
    progress: 40
  },
  'Alvenaria': {
    materials: ['Blocos Cerâmicos', 'Argamassa', 'Eletrodutos Corrugados', 'Tubulação PVC'],
    description: 'Fechamento de paredes e infraestrutura básica de elétrica e hidráulica.',
    progress: 70
  },
  'Acabamento': {
    materials: ['Porcelanato', 'Gesso Acartonado', 'Tintas Acrílicas', 'Louças e Metais'],
    description: 'Fase final de refino. Instalação de revestimentos, pintura e vidros.',
    progress: 95
  }
};

export const ConstructionMode: React.FC<ConstructionModeProps> = ({ property }) => {
  const [activePhase, setActivePhase] = useState<ConstructionPhaseType>('Estrutura');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, string>>({});

  const handleGenerate = async () => {
    setError(null);
    if (cache[activePhase]) {
        setGeneratedImage(cache[activePhase]);
        return;
    }

    setIsGenerating(true);
    try {
      const result = await generateConstructionPhase(property.image, activePhase, property.description);
      if (result) {
        setGeneratedImage(result);
        setCache(prev => ({ ...prev, [activePhase]: result }));
      } else {
        setError("Não foi possível gerar a imagem no momento. Tente novamente.");
      }
    } catch (err) {
      console.error("Error generating construction view", err);
      setError("Erro ao conectar com a IA. Verifique se a chave API está configurada.");
    } finally {
      setIsGenerating(false);
    }
  };

  const details = PHASE_DETAILS[activePhase];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 text-white p-6">
        <div className="flex items-center gap-3 mb-4">
            <HardHat className="text-yellow-500" size={32} />
            <div>
                <h2 className="text-2xl font-bold">Modo Construção</h2>
                <p className="text-slate-400 text-sm">Visualize a evolução da obra</p>
            </div>
        </div>

        <div className="flex justify-between items-center relative mt-8 px-2">
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-700 -z-0"></div>
            {PHASES.map((phase, index) => {
                const isActive = phase === activePhase;
                const isCompleted = PHASES.indexOf(phase) < PHASES.indexOf(activePhase);
                return (
                    <button 
                        key={phase}
                        onClick={() => {
                            setActivePhase(phase);
                            setGeneratedImage(cache[phase] || null);
                            setError(null);
                        }}
                        className="relative z-10 flex flex-col items-center group"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                            isActive ? 'bg-yellow-500 border-slate-900 scale-110 shadow-lg' : isCompleted ? 'bg-blue-600 border-slate-900' : 'bg-slate-700 border-slate-900'
                        }`}>
                            <span className="text-xs font-bold text-slate-900">{index + 1}</span>
                        </div>
                        <span className={`mt-2 text-[10px] md:text-xs font-medium ${isActive ? 'text-yellow-500' : 'text-slate-400'}`}>
                            {phase}
                        </span>
                    </button>
                );
            })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="bg-slate-100 p-6 flex flex-col items-center justify-center min-h-[400px] border-r border-slate-200">
            <div className="relative w-full h-[350px] rounded-xl overflow-hidden bg-slate-200 shadow-inner group">
                {generatedImage ? (
                    <img src={generatedImage} alt={activePhase} className="w-full h-full object-cover animate-fade-in" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        {isGenerating ? (
                            <>
                                <RefreshCw className="animate-spin mb-4 text-blue-600" size={40} />
                                <span className="text-slate-600 font-medium">Renderizando etapa...</span>
                            </>
                        ) : error ? (
                            <div className="text-red-500">
                                <AlertTriangle className="mx-auto mb-2" size={32} />
                                <p className="text-sm">{error}</p>
                            </div>
                        ) : (
                            <>
                                <Pickaxe className="mb-4 opacity-50" size={48} />
                                <p className="text-sm">Clique no botão abaixo para simular esta etapa.</p>
                            </>
                        )}
                    </div>
                )}
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-[10px] uppercase font-bold backdrop-blur-md">
                    Status: {activePhase}
                </div>
            </div>

            <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
            >
                {isGenerating ? 'Processando...' : 'Visualizar Fase (IA)'}
                {!isGenerating && <RefreshCw size={18} />}
            </button>
        </div>

        <div className="p-8 bg-white">
            <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Ruler className="text-blue-600" />
                    Detalhes Técnicos
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">{details.description}</p>
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progresso Geral</span>
                        <span>{details.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${details.progress}%` }}></div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Hammer className="text-blue-600" size={20} />
                    Materiais
                </h3>
                <ul className="space-y-3">
                    {details.materials.map((material, idx) => (
                        <li key={idx} className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                            <ArrowRight size={14} className="text-blue-400 mr-2" />
                            {material}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};