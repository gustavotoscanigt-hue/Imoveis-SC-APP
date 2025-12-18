
import { GoogleGenAI } from "@google/genai";
import { DesignStyle, ConstructionPhaseType } from '../types';

const CHAT_SYSTEM_INSTRUCTION = `
Você é um consultor imobiliário sênior da 'ImobAR Construtora'.
Seu tom é profissional, acolhedor e persuasivo.
Seu objetivo é agendar visitas e responder dúvidas técnicas sobre os imóveis.
Responda sempre em Português do Brasil de forma concisa.
`;

const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key || key === 'undefined') {
    throw new Error("API Key não configurada. Por favor, adicione a variável API_KEY no seu ambiente.");
  }
  return key;
};

// Função para identificar a chave ativa (mostra apenas o final por segurança)
export const getActiveKeySuffix = (): string => {
  try {
    const key = getApiKey();
    return `...${key.slice(-4)}`;
  } catch (e) {
    return "Não configurada";
  }
};

export const sendMessageToAgent = async (history: { role: string, parts: { text: string }[] }[], newMessage: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: [{ text: newMessage }] }],
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "Desculpe, não consegui processar sua resposta no momento.";
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

export const generateRoomDecoration = async (base64Image: string, style: DesignStyle, instructions: string): Promise<string | undefined> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Formato de imagem inválido.");
    }
    const mimeType = matches[1];
    const data = matches[2];

    const prompt = `Atue como um arquiteto de interiores de alto padrão. 
    Redecore este ambiente fielmente no estilo: ${style}. 
    Instruções extras do cliente: ${instructions}.
    Mantenha as paredes e janelas originais, mas mude móveis e revestimentos. 
    O resultado deve ser fotorealista, como uma imagem de catálogo imobiliário pronto.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: [{
        parts: [
          { inlineData: { mimeType, data } },
          { text: prompt }
        ]
      }]
    });

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      return undefined;
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error: any) {
    console.error("Gemini Decoration Error:", error);
    throw error;
  }
};

export const generateConstructionPhase = async (imageUrl: string, phase: ConstructionPhaseType, propertyDescription: string): Promise<string | undefined> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    let imagePart = null;
    
    try {
      const imgResponse = await fetch(imageUrl);
      const blob = await imgResponse.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      const matches = base64.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        imagePart = { inlineData: { mimeType: matches[1], data: matches[2] } };
      }
    } catch (e) {
      console.warn("Usando apenas prompt de texto");
    }

    const prompt = `Gere uma foto realística de um canteiro de obras modernos na fase de ${phase.toUpperCase()}. Contexto do projeto: ${propertyDescription}. Qualidade fotográfica 4k.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{
        parts: imagePart ? [imagePart, { text: prompt }] : [{ text: prompt }]
      }]
    });

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) return undefined;

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error: any) {
    console.error("Construction Phase Error:", error);
    throw error;
  }
};
