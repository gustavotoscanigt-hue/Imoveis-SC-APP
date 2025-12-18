
import React, { useState, useRef } from 'react';
import { Upload, Sparkles, RefreshCw, Download, AlertCircle } from 'lucide-react';
import { DesignStyle, GenerationState } from '../types';
import { generateRoomDecoration } from '../services/geminiService';

const STYLES: DesignStyle[] = ['Moderno', 'Rústico', 'Minimalista', 'Industrial', 'Clássico', 'Escandinavo'];

export const AIDecorator: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>('Moderno');
  const [instructions, setInstructions] = useState('');
  const [genState, setGenState] = useState<GenerationState>({ isGenerating: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 4 * 1024 * 1024) {
        setGenState({ isGenerating: false, error: "Imagem muito grande. Use uma foto de até 4MB." });
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGenState({ isGenerating: false, resultImage: undefined, error: undefined });
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setGenState({ isGenerating: true, error: undefined });

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const resultUrl = await generateRoomDecoration(base64data, selectedStyle, instructions);
        if (resultUrl) {
          setGenState({ isGenerating: false, resultImage: resultUrl });
        } else {
          setGenState({ isGenerating: false, error: "A IA não conseguiu gerar a decoração. Tente outra imagem." });
        }
      } catch (err: any) {
        console.error("API Error Details:", err);
        setGenState({ isGenerating: false, error: "Falha na comunicação com a IA. Tente novamente mais tarde." });
      }
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Decorador Virtual IA</h2>
        <p className="text-slate-600">Envie uma foto e visualize o potencial do seu imóvel mobiliado.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-fit">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">1. Foto do Ambiente</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  previewUrl ? 'border-blue-200 bg-blue-50' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <Upload className={`${previewUrl ? 'text-blue-500' : 'text-slate-400'} mb-2`} size={32} />
                <span className="text-xs text-slate-500 font-medium text-center truncate w-full px-2">
                  {selectedFile ? selectedFile.name : 'Clique para enviar foto'}
                </span>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">2. Estilo de Design</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map(style => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`p-2 text-xs rounded-lg border transition-all ${
                      selectedStyle === style ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
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
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-white font-semibold shadow-lg transition-all ${
                !selectedFile || genState.isGenerating 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {genState.isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {genState.isGenerating ? 'Redecorando...' : 'Gerar Nova Decoração'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">
            <div className="relative rounded-2xl overflow-hidden bg-slate-200 border border-slate-300 shadow-sm">
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded text-[10px] z-10 font-bold uppercase tracking-wider">ANTES</div>
              {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400 italic text-sm">Aguardando foto...</div>}
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-300 shadow-inner">
               <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] z-10 font-bold uppercase tracking-wider">DEPOIS (IA)</div>
               {genState.resultImage ? (
                 <>
                   <img src={genState.resultImage} className="w-full h-full object-cover animate-fade-in" />
                   <a href={genState.resultImage} download="imobar-decoracao.png" className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-full shadow-xl hover:bg-white hover:scale-110 transition-all text-blue-600">
                     <Download size={20} />
                   </a>
                 </>
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
                   {genState.isGenerating ? (
                     <div className="flex flex-col items-center">
                       <RefreshCw className="animate-spin mb-4 text-blue-600" size={40} />
                       <p className="text-slate-600 font-medium text-sm">Nossa IA está mobiliando seu imóvel...</p>
                     </div>
                   ) : <Sparkles className="opacity-20 mb-2" size={48} />}
                   {!genState.isGenerating && <span className="text-xs max-w-[200px]">Selecione uma foto e estilo para visualizar a transformação</span>}
                 </div>
               )}
            </div>
          </div>

          {genState.error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex items-start gap-3 animate-fade-in-up">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
              <div className="flex flex-col">
                <span className="font-bold">Aviso:</span>
                <span className="opacity-90">{genState.error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
