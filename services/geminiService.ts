
import { GoogleGenAI } from "@google/genai";
import { DesignStyle, ConstructionPhaseType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CHAT_SYSTEM_INSTRUCTION = `
Você é um consultor imobiliário sênior da 'ImobAR Construtora'.
Seu tom é profissional, acolhedor e persuasivo.
Seu objetivo é agendar visitas e responder dúvidas técnicas sobre os imóveis.
Responda sempre em Português do Brasil de forma concisa.
`;

export const sendMessageToAgent = async (history: { role: string, parts: { text: string }[] }[], newMessage: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: [{ text: newMessage }] }],
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "Desculpe, não consegui processar sua resposta no momento.";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Ocorreu um erro na comunicação. Por favor, tente novamente.";
  }
};

export const generateRoomDecoration = async (base64Image: string, style: DesignStyle, instructions: string): Promise<string | undefined> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const prompt = `
      Atue como um arquiteto de interiores. Redecore este ambiente no estilo: ${style}. 
      Instruções adicionais: ${instructions}.
      Mantenha a estrutura, mude apenas a decoração e móveis.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Error generating room decoration:", error);
    throw error;
  }
};

export const generateConstructionPhase = async (imageUrl: string, phase: ConstructionPhaseType, propertyDescription: string): Promise<string | undefined> => {
  try {
    let imagePart = null;
    try {
        const imgResponse = await fetch(imageUrl);
        const blob = await imgResponse.blob();
        const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            // Fix typo: readAsAsDataURL corrected to readAsDataURL
            reader.readAsDataURL(blob);
        });
        const cleanBase64 = base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
        imagePart = { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } };
    } catch (e) {
        console.warn("Falling back to text-only generation due to CORS or fetch error.");
    }

    const prompt = `Create a realistic construction site image of a building in the ${phase.toUpperCase()} phase. Context: ${propertyDescription}. High detail, cinematic lighting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: imagePart ? [imagePart, { text: prompt }] : [{ text: prompt }]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Error generating construction phase:", error);
    throw error;
  }
};
