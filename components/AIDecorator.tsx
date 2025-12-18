import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon, RefreshCw, Download, AlertCircle } from 'lucide-react';
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
      // Limitar tamanho do arquivo para evitar estouro de payload da API (máximo ~4MB recomendado)
      if (file.size > 5 * 1024 * 1024) {
        setGenState({ isGenerating: false, error: "Imagem muito grande. Escolha uma foto de até 5MB." });
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
          setGenState({ isGenerating: false, error: "A IA não conseguiu gerar a decoração para esta imagem. Tente outro ângulo ou iluminação." });
        }
      } catch (err: any) {
        console.error("Decoration catch:", err);
        setGenState({ 
          isGenerating: false, 
          error: "Erro na conexão: " + (err.message || "Verifique sua internet ou tente novamente mais tarde.")
        });
      }
    };

    reader.onerror = () => {
      setGenState({ isGenerating: false, error: "Erro ao ler o arquivo de imagem." });
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Decorador Virtual IA</h2>
        <p className="text-slate-600">Visualize o potencial do seu imóvel. Envie uma foto e deixe nossa IA redecorar o ambiente.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Controls Sidebar */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-fit">
          <div className="space-y-6">
            
            {/* Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">1. Foto do Ambiente</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  previewUrl ? 'border-blue-200 bg-blue-50' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <Upload className={`${previewUrl ? 'text-blue-500' : 'text-slate-400'} mb-2`} size={32} />
                <span className="text-sm text-slate-500 font-medium text-center">
                  {selectedFile ? selectedFile.name : 'Clique para enviar foto'}
                </span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Style Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">2. Escolha o Estilo</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map(style => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`p-2 text-sm rounded-lg border transition-all ${
                      selectedStyle === style 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Instructions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">3. Detalhes (Opcional)</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ex: Piso de madeira clara, iluminação quente, sofá moderno..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 transition-all"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!selectedFile || genState.isGenerating}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-white font-semibold shadow-lg transition-all ${
                !selectedFile || genState.isGenerating 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl hover:scale-[1.02] active:scale-95'
              }`}
            >
              {genState.isGenerating ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Gerar Decoração
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Comparison View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">
            
            {/* Original */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-200 border border-slate-300 group">
              <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm z-10">ORIGINAL</div>
              {previewUrl ? (
                <img src={previewUrl} alt="Original" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col py-20">
                  <ImageIcon size={48} className="mb-2 opacity-50" />
                  <span className="text-sm">Envie uma foto à esquerda</span>
                </div>
              )}
            </div>

            {/* Result */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-300 shadow-inner group">
               <div className={`absolute top-4 left-4 ${genState.isGenerating ? 'bg-amber-500' : 'bg-blue-600'} text-white px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm z-10 transition-colors`}>
                 {genState.isGenerating ? 'REDECORANDO...' : 'RESULTADO IA'}
               </div>
               
               {genState.resultImage ? (
                 <>
                   <img src={genState.resultImage} alt="Generated" className="w-full h-full object-cover animate-fade-in" />
                   <a 
                      href={genState.resultImage} 
                      download="minha-decoracao-imobar.png"
                      className="absolute bottom-4 right-4 bg-white/90 text-slate-800 p-3 rounded-full hover:bg-white shadow-xl transition-all hover:scale-110 active:scale-90"
                      title="Baixar imagem"
                   >
                     <Download size={20} />
                   </a>
                 </>
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col bg-slate-50 py-20">
                   {genState.isGenerating ? (
                      <div className="flex flex-col items-center">
                        <div className="relative w-16 h-16 mb-4">
                           <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                           <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-600 animate-pulse">Transformando o ambiente...</span>
                        <p className="text-[10px] text-slate-400 mt-2">Isso pode levar até 30 segundos</p>
                      </div>
                   ) : (
                     <>
                        <Sparkles size={48} className="mb-2 opacity-30 text-blue-600" />
                        <span className="text-sm text-center px-6">Escolha um estilo e clique em Gerar</span>
                     </>
                   )}
                 </div>
               )}
            </div>

          </div>

          {genState.error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center animate-fade-in-up">
              <AlertCircle className="mr-3 flex-shrink-0" size={20} />
              <div>
                <span className="font-bold">Atenção:</span> {genState.error}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};