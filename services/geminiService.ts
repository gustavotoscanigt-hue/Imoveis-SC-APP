import { GoogleGenAI } from "@google/genai";
import { DesignStyle, ConstructionPhaseType } from '../types';

const CHAT_SYSTEM_INSTRUCTION = `
Você é um consultor imobiliário sênior da 'ImobAR Construtora'.
Seu tom é profissional, acolhedor e persuasivo.
Seu objetivo é agendar visitas e responder dúvidas técnicas sobre os imóveis.
Responda sempre em Português do Brasil de forma concisa.
`;

export const sendMessageToAgent = async (history: { role: string, parts: { text: string }[] }[], newMessage: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    throw error;
  }
};

export const generateRoomDecoration = async (base64Image: string, style: DesignStyle, instructions: string): Promise<string | undefined> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Formato de imagem inválido ou arquivo muito grande.");
    }
    const mimeType = matches[1];
    const data = matches[2];

    const prompt = `Atue como um arquiteto de interiores de alto padrão. 
    Redecore este ambiente fielmente no estilo: ${style}. 
    Instruções extras: ${instructions}.
    Mantenha a arquitetura básica (paredes, janelas), mas substitua móveis, cores e iluminação. 
    O resultado final deve ser uma fotografia realista e luxuosa.`;

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
      throw new Error("A IA não retornou conteúdo válido. Tente novamente.");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    // Se não houver parte de imagem, mas houver texto, pode ser uma recusa ou erro da IA
    if (candidate.content.parts[0]?.text) {
      throw new Error(candidate.content.parts[0].text);
    }

    return undefined;
  } catch (error: any) {
    console.error("Gemini Decoration Error:", error);
    throw error;
  }
};

export const generateConstructionPhase = async (imageUrl: string, phase: ConstructionPhaseType, propertyDescription: string): Promise<string | undefined> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
      console.warn("Usando apenas prompt de texto para fase de obra.");
    }

    const prompt = `Gere uma foto real de um canteiro de obras de um edifício na fase de ${phase}. Contexto do projeto: ${propertyDescription}. Detalhes técnicos visíveis de engenharia civil.`;

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