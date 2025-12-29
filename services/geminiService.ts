import { GoogleGenAI } from "@google/genai";
import { ImpositionSettings } from '../types';

let aiClient: GoogleGenAI | null = null;

export const initGemini = () => {
  if (process.env.API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
};

export const getPrintingAdvice = async (
  query: string, 
  currentSettings: ImpositionSettings,
  context: string = ""
): Promise<string> => {
  if (!aiClient) initGemini();
  if (!aiClient) return "Error: API Key no encontrada. Por favor configure la variable de entorno.";

  const systemInstruction = `
    Eres un experto ingeniero de pre-impresión y diseño gráfico especializado en juegos de mesa 'Print and Play'.
    Tu objetivo es ayudar al usuario a configurar correctamente la imposición de sus archivos PDF de A4 a A3 para impresión a doble cara (duplex).
    
    El usuario está utilizando una herramienta con los siguientes ajustes actuales:
    - Formato Salida: A3
    - Desplazamiento X: ${currentSettings.xOffsetMm}mm
    - Desplazamiento Y: ${currentSettings.yOffsetMm}mm
    - Escala: ${currentSettings.scale * 100}%
    - Gutter (Separación): ${currentSettings.gutterMm}mm
    
    Consejos clave que sueles dar:
    1. Para alineación frente-dorso, recomienda ajustar el Desplazamiento X si la impresora "mueve" la hoja al dar vuelta.
    2. Recomienda imprimir una sola hoja de prueba antes de todo el mazo.
    3. Si las cartas no coinciden, sugiere medir el error con una regla en mm y poner ese valor en los ajustes.
    
    Responde de forma concisa, técnica pero amigable, y en Español.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Contexto adicional: ${context}\n\nPregunta del usuario: ${query}`,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "No pude generar una respuesta.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Lo siento, hubo un error al conectar con el asistente de impresión.";
  }
};
