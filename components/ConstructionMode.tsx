
import React, { useState } from 'react';
import { Property, ConstructionPhaseType } from '../types';
import { generateConstructionPhase } from '../services/geminiService';
import { Hammer, HardHat, RefreshCw, Pickaxe, Ruler, ArrowRight, Activity, Zap, CheckCircle2 } from 'lucide-react';

interface ConstructionModeProps {
  property: Property;
}

const PHASES: ConstructionPhaseType[] = ['Fundação', 'Estrutura', 'Alvenaria', 'Acabamento'];

const PHASE_DETAILS: Record<ConstructionPhaseType, { materials: string[], description: string, progress: number, active: boolean }> = {
  'Fundação': {
    materials: ['Estacas Hélice Contínua', 'Armação de Aço CA-50', 'Concreto C-30'],
    description: 'Etapa concluída. Toda a infraestrutura profunda foi executada com monitoramento digital de carga.',
    progress: 100,
    active: false
  },
  'Estrutura': {
    materials: ['Lajes Protendidas', 'Pilares de Alta Resistência', 'Fôrmas Metálicas'],
    description: 'Fase final da estrutura. Estamos no 18º pavimento com ciclo de 7 dias por laje.',
    progress: 92,
    active: true
  },
  'Alvenaria': {
    materials: ['Blocos Acústicos', 'Argamassa Industrializada', 'Tubulação em PEX'],
    description: 'Início dos fechamentos periféricos e infraestrutura de prumadas hidráulicas.',
    progress: 35,
    active: false
  },
  'Acabamento': {
    materials: ['Porcelanato 120x120', 'Pintura Epóxi', 'Bancadas em Quartzo'],
    description: 'Planejamento de revestimentos iniciado. Escolha de materiais premium validada.',
    progress: 5,
    active: false
  }
};

export const ConstructionMode: React.FC<ConstructionModeProps> = ({ property }) => {
  const [activePhase, setActivePhase] = useState<ConstructionPhaseType>('Estrutura');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cache, setCache] = useState<Record<string, string>>({});

  const handleGenerate = async () => {
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
      }
    } catch (err) {
      console.error("Error", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const details = PHASE_DETAILS[activePhase];

  return (
    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-950 p-10 text-white">
        <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
                <div className="bg-yellow-500 p-3 rounded-2xl shadow-lg shadow-yellow-500/20">
                    <Activity className="text-slate-950" size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Status da Engenharia</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Atualizado em Tempo Real</p>
                </div>
            </div>
            <div className="hidden md:flex bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-[10px] font-black text-yellow-500">
               OBRA EM DIA
            </div>
        </div>

        <div className="flex justify-between items-center relative px-2">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-800 -z-0"></div>
            {PHASES.map((phase) => {
                const isActive = phase === activePhase;
                const isCompleted = PHASE_DETAILS[phase].progress === 100;
                return (
                    <button 
                        key={phase}
                        onClick={() => {
                            setActivePhase(phase);
                            setGeneratedImage(cache[phase] || null);
                        }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                            isActive ? 'bg-yellow-500 border-yellow-500 scale-110 shadow-xl shadow-yellow-500/20' : isCompleted ? 'bg-blue-600 border-blue-600' : 'bg-slate-900 border-slate-800'
                        }`}>
                            {isCompleted ? <CheckCircle2 size={24} className="text-white" /> : <span className={`text-sm font-black ${isActive ? 'text-slate-950' : 'text-slate-500'}`}>{PHASES.indexOf(phase) + 1}</span>}
                        </div>
                        <span className={`mt-3 text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-yellow-500' : 'text-slate-500'}`}>
                            {phase}
                        </span>
                    </button>
                );
            })}
        </div>
      </div>

      <div className="p-8">
        <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7">
                <div className="relative rounded-[32px] overflow-hidden bg-slate-100 h-[400px] shadow-inner group">
                    {generatedImage ? (
                        <img src={generatedImage} className="w-full h-full object-cover animate-fade-in" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-12">
                            {isGenerating ? (
                                <RefreshCw className="animate-spin text-blue-600 mb-4" size={48} />
                            ) : (
                                <Pickaxe className="text-slate-200 mb-6" size={80} />
                            )}
                            <h4 className="text-lg font-bold text-slate-800">{isGenerating ? 'Processando dados...' : 'Projeção Visual'}</h4>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto">Visualize a evolução do canteiro de obras através do nosso modelo generativo.</p>
                            {!isGenerating && (
                                <button onClick={handleGenerate} className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all">
                                    GERAR SIMULAÇÃO <Zap size={18} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-5 space-y-8">
                <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Relatório de Etapa</h3>
                    <p className="text-slate-700 leading-relaxed font-medium">{details.description}</p>
                    
                    <div className="mt-8 space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase text-slate-400 tracking-widest">
                            <span>Progresso Físico</span>
                            <span className="text-slate-900">{details.progress}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${details.progress}%` }}></div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Logística e Materiais</h3>
                    <div className="grid gap-3">
                        {details.materials.map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
                                <span className="text-sm font-bold text-slate-700">{m}</span>
                                <CheckCircle2 size={18} className="text-blue-500" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
