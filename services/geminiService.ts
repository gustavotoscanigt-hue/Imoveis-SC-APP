import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DesignStyle, ConstructionPhaseType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction for the chat agent
const CHAT_SYSTEM_INSTRUCTION = `
Você é um consultor imobiliário sênior da 'ImobAR Construtora'.
Seu tom é profissional, acolhedor e persuasivo.
Seu objetivo é agendar visitas e responder dúvidas técnicas sobre os imóveis.
Você tem acesso (simulado) à planta, materiais e disponibilidade.
Se o usuário perguntar sobre preços específicos que você não sabe, sugira falar com um corretor humano, mas tente estimar com base no mercado de alto padrão.
Responda sempre em Português do Brasil.
Seja conciso.
`;

export const sendMessageToAgent = async (history: { role: string, parts: { text: string }[] }[], newMessage: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      },
      history: history,
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message: newMessage });
    return response.text || "Desculpe, não consegui processar sua resposta no momento.";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Ocorreu um erro temporário na comunicação. Por favor, tente novamente.";
  }
};

export const generateRoomDecoration = async (base64Image: string, style: DesignStyle, instructions: string): Promise<string | undefined> => {
  try {
    // We clean the base64 string if it contains the header
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const prompt = `
      Atue como um arquiteto de interiores de classe mundial.
      Analise a imagem fornecida deste ambiente.
      Redecore este ambiente seguindo estritamente o estilo visual: ${style}.
      Detalhes adicionais do usuário: ${instructions}.
      Mantenha a estrutura arquitetônica (paredes, janelas, portas) intacta, mas substitua acabamentos, móveis e decoração para corresponder ao estilo solicitado.
      A saída deve ser uma imagem fotorrealista de alta qualidade mostrando o resultado final.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
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
    // Note: Since we are using a URL from the mock data, we need to fetch it to get bytes, 
    // or use text-to-image if we can't fetch CORS images in this browser environment.
    // For this demo, assuming we might not have CORS access to random picsum images, 
    // we will rely on a strong Text-to-Image prompt describing the scene if we can't edit the image directly,
    // OR we attempt to fetch. Ideally, we fetch.
    
    let imagePart = null;
    try {
        const imgResponse = await fetch(imageUrl);
        const blob = await imgResponse.blob();
        const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
        const cleanBase64 = base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
        imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: cleanBase64
            }
        };
    } catch (e) {
        console.warn("Could not fetch image for edit, falling back to text generation based on description.");
    }

    let prompt = "";
    
    if (phase === 'Fundação') {
        prompt = `Create a realistic construction site image. The stage is FOUNDATION. Shows excavation, concrete piles, rebar cages, and mud. Heavy machinery like excavators visible. Context: ${propertyDescription}.`;
    } else if (phase === 'Estrutura') {
        prompt = `Create a realistic construction site image. The stage is STRUCTURAL SKELETON. Shows exposed concrete pillars, beams, and slabs. Wooden formwork and scaffolding wrapping the building. No walls yet. Context: ${propertyDescription}.`;
    } else if (phase === 'Alvenaria') {
        prompt = `Create a realistic construction site image. The stage is MASONRY (GREY WORK). Red hollow bricks or concrete blocks forming walls. Electrical conduits and plumbing pipes visible. Rough concrete floors. No paint. Context: ${propertyDescription}.`;
    } else {
        prompt = `Create a realistic construction site image. The stage is FINISHING. Painters at work, flooring being installed, windows placed but with protective stickers. Almost complete but still a work in progress. Context: ${propertyDescription}.`;
    }

    const parts: any[] = [{ text: prompt }];
    if (imagePart) {
        // If we successfully fetched the image, we add it to guide the composition
        // prompting for an "Image Editing" or "Variation" task
        parts.unshift(imagePart);
        parts[1].text += " Keep the same camera angle and building shape as the original image, but change its appearance to match the construction phase described.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return undefined;

  } catch (error) {
    console.error("Error generating construction phase:", error);
    throw error;
  }
};