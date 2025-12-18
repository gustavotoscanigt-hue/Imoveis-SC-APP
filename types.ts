export interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  image: string;
  images: string[];
  features: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type DesignStyle = 'Moderno' | 'Rústico' | 'Minimalista' | 'Industrial' | 'Clássico' | 'Escandinavo';

export type ConstructionPhaseType = 'Fundação' | 'Estrutura' | 'Alvenaria' | 'Acabamento';

export interface GenerationState {
  isGenerating: boolean;
  resultImage?: string;
  error?: string;
}