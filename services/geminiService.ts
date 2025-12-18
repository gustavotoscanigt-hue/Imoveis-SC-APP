import { GoogleGenAI } from "@google/genai";
import { DesignStyle, ConstructionPhaseType } from '../types';

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key não configurada.");
  }
  return new GoogleGenAI({ apiKey });
};

const CHAT_SYSTEM_INSTRUCTION = `
Você é um consultor imobiliário sênior da 'ImobAR Construtora'.
Seu tom é profissional, acolhedor e persuasivo.
Seu objetivo é agendar visitas e responder dúvidas técnicas sobre os imóveis.
Responda sempre em Português do Brasil de forma concisa.
`;

export const sendMessageToAgent = async (history: { role: string, parts: { text: string }[] }[], newMessage: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: [{ text: newMessage }] }],
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "Desculpe, não consegui processar sua resposta no momento.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Ocorreu um erro na comunicação. Por favor, tente novamente.";
  }
};

export const generateRoomDecoration = async (base64Image: string, style: DesignStyle, instructions: string): Promise<string | undefined> => {
  try {
    const ai = getAI();
    
    // Extração segura do base64 e mimeType
    const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Formato de imagem inválido.");
    }
    const mimeType = matches[1];
    const data = matches[2];

    const prompt = `Atue como um arquiteto de interiores de alto padrão. 
    Redecore este ambiente fielmente no estilo: ${style}. 
    Instruções específicas do cliente: ${instructions}.
    IMPORTANTE: Mantenha a estrutura arquitetônica original (paredes, janelas, teto), mas substitua TODOS os móveis, revestimentos de piso e parede, e iluminação para o novo estilo. 
    O resultado deve parecer uma fotografia real de um imóvel pronto para morar.`;

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
    console.error("Gemini Image Error:", error);
    throw new Error(error.message || "Falha na conexão com a IA");
  }
};

export const generateConstructionPhase = async (imageUrl: string, phase: ConstructionPhaseType, propertyDescription: string): Promise<string | undefined> => {
  try {
    const ai = getAI();
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
      console.warn("Fallback para geração apenas de texto devido a restrições de origem da imagem.");
    }

    const prompt = `Crie uma imagem fotorrealista de um canteiro de obras de um edifício moderno na fase de ${phase.toUpperCase()}. 
    Contexto do projeto: ${propertyDescription}. 
    Detalhes técnicos: máquinas de construção visíveis, operários com EPI, estruturas de concreto ou alvenaria aparentes. 
    Iluminação de dia ensolarado, qualidade cinematográfica.`;

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
  } catch (error) {
    console.error("Construction Phase Error:", error);
    throw error;
  }
};