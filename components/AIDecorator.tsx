
import React, { useState, useRef } from 'react';
// Import missing ArrowLeft from lucide-react
import { Upload, Sparkles, RefreshCw, Download, AlertCircle, Camera, Trash2, ArrowLeft } from 'lucide-react';
import { DesignStyle, GenerationState } from '../types';
import { generateRoomDecoration } from '../services/geminiService';

const STYLES: DesignStyle[] = ['Moderno', 'Rústico', 'Minimalista', 'Industrial', 'Clássico', 'Escandinavo'];

export const AIDecorator: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>('Moderno');
  const [instructions, setInstructions] = useState('');
  const [genState, setGenState] = useState<GenerationState>({ isGenerating: false });
  const [sliderPos, setSliderPos] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        setGenState({ isGenerating: false, error: "Tamanho limite: 3MB. Por favor, redimensione a imagem." });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setGenState({ isGenerating: false, resultImage: undefined, error: undefined });
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setGenState({ isGenerating: false });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;
    setGenState({ isGenerating: true, error: undefined });

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = async () => {
      try {
        const resultUrl = await generateRoomDecoration(reader.result as string, selectedStyle, instructions);
        if (resultUrl) {
          setGenState({ isGenerating: false, resultImage: resultUrl });
        } else {
          setGenState({ isGenerating: false, error: "Falha na geração. Tente outro ângulo ou iluminação." });
        }
      } catch (err: any) {
        setGenState({ isGenerating: false, error: `Erro técnico: ${err.message}` });
      }
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid lg:grid-cols-12 gap-12 items-start">
        
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-8 bg-white p-8 rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Simulador IA</h2>
            <p className="text-slate-500 text-sm">Visualize o potencial real do seu imóvel em segundos.</p>
          </div>

          <div className="space-y-6">
            {!previewUrl ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group border-4 border-dashed border-slate-100 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  <Camera size={32} />
                </div>
                <p className="font-bold text-slate-800">Enviar Foto</p>
                <p className="text-xs text-slate-400 mt-1">Sala, quarto ou varanda (vazios)</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden h-40 group">
                <img src={previewUrl} className="w-full h-full object-cover" />
                <button onClick={reset} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block">Estilo Arquitetônico</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map(style => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border-2 ${
                      selectedStyle === style ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={genState.isGenerating || !selectedFile}
              className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-lg shadow-xl transition-all ${
                !selectedFile || genState.isGenerating ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {genState.isGenerating ? <RefreshCw className="animate-spin" size={24} /> : <Sparkles size={24} />}
              {genState.isGenerating ? 'PROCESSANDO...' : 'REDECORAR AMBIENTE'}
            </button>
          </div>
        </div>

        {/* Comparison Display */}
        <div className="lg:col-span-8 h-full min-h-[600px] flex flex-col">
          {genState.resultImage ? (
            <div className="relative flex-grow rounded-[40px] overflow-hidden shadow-2xl border-8 border-white group select-none">
              <img src={genState.resultImage} className="absolute inset-0 w-full h-full object-cover" />
              <div 
                className="absolute inset-0 overflow-hidden" 
                style={{ width: `${sliderPos}%` }}
              >
                <img src={previewUrl!} className="absolute top-0 left-0 w-[800px] md:w-full h-full object-cover max-w-none" />
              </div>
              
              {/* Slider UI */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize z-20 flex items-center justify-center"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="bg-white p-2 rounded-full shadow-xl border border-slate-200 -mx-4">
                  <div className="flex gap-1 text-slate-400">
                    <ArrowLeft size={14} />
                    <ArrowLeft size={14} className="rotate-180" />
                  </div>
                </div>
              </div>
              
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderPos} 
                onChange={(e) => setSliderPos(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              />

              <div className="absolute bottom-8 left-8 bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest pointer-events-none">
                Arraste para comparar <span className="ml-2 text-blue-400">Antes vs Depois</span>
              </div>
            </div>
          ) : (
            <div className="flex-grow bg-slate-100 rounded-[40px] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center">
              {genState.isGenerating ? (
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-blue-200">
                    <RefreshCw className="text-white animate-spin" size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Gerando visualização...</h3>
                  <p className="text-slate-500">Isso pode levar até 15 segundos dependendo da complexidade do ambiente.</p>
                </div>
              ) : (
                <div className="opacity-30">
                  <Sparkles size={100} className="mb-6 mx-auto text-slate-400" />
                  <p className="text-xl font-bold">Aguardando envio de imagem</p>
                </div>
              )}
            </div>
          )}

          {genState.error && (
            <div className="mt-6 bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 flex items-center gap-4 animate-fade-in-up">
              <AlertCircle size={24} />
              <p className="font-bold">{genState.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
