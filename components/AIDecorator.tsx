import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon, ArrowRight, RefreshCw, Download } from 'lucide-react';
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
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGenState({ isGenerating: false, resultImage: undefined });
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || !previewUrl) return;

    setGenState({ isGenerating: true, error: undefined });

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
          const resultUrl = await generateRoomDecoration(base64data, selectedStyle, instructions);
          if (resultUrl) {
            setGenState({ isGenerating: false, resultImage: resultUrl });
          } else {
            setGenState({ isGenerating: false, error: "A IA não retornou uma imagem válida. Tente outra foto." });
          }
        } catch (err) {
          setGenState({ isGenerating: false, error: "Erro ao conectar com a IA. Verifique sua conexão." });
        }
      };
    } catch (e) {
      setGenState({ isGenerating: false, error: "Erro ao processar imagem." });
    }
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
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Upload className="text-slate-400 mb-2" size={32} />
                <span className="text-sm text-slate-500 font-medium">Clique para enviar foto</span>
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
                        ? 'bg-blue-600 text-white border-blue-600' 
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
                placeholder="Ex: Piso de madeira clara, paredes brancas, sofá de couro..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!selectedFile || genState.isGenerating}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-white font-semibold shadow-lg transition-all ${
                !selectedFile || genState.isGenerating 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl hover:scale-[1.02]'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] md:h-[500px]">
            
            {/* Original */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-200 border border-slate-300">
              <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm z-10">ORIGINAL</div>
              {previewUrl ? (
                <img src={previewUrl} alt="Original" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col">
                  <ImageIcon size={48} className="mb-2 opacity-50" />
                  <span className="text-sm">Nenhuma imagem selecionada</span>
                </div>
              )}
            </div>

            {/* Result */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-200 border border-slate-300 shadow-inner">
               <div className="absolute top-4 left-4 bg-blue-600/90 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm z-10">
                 {genState.isGenerating ? 'GERANDO...' : 'RESULTADO IA'}
               </div>
               
               {genState.resultImage ? (
                 <>
                   <img src={genState.resultImage} alt="Generated" className="w-full h-full object-cover animate-fade-in" />
                   <a 
                      href={genState.resultImage} 
                      download="decoracao-ia.png"
                      className="absolute bottom-4 right-4 bg-white/90 text-slate-800 p-2 rounded-full hover:bg-white shadow-lg transition-colors"
                   >
                     <Download size={20} />
                   </a>
                 </>
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col bg-slate-100">
                   {genState.isGenerating ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <span className="text-sm animate-pulse">A IA está sonhando...</span>
                      </div>
                   ) : (
                     <>
                        <Sparkles size={48} className="mb-2 opacity-50" />
                        <span className="text-sm text-center px-6">O resultado aparecerá aqui</span>
                     </>
                   )}
                 </div>
               )}
            </div>

          </div>

          {genState.error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center">
              <span className="font-bold mr-2">Erro:</span> {genState.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};