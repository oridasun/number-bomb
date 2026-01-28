
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getAICommentary = async (
  min: number,
  max: number,
  currentPlayer: number,
  isElimination: boolean,
  lastGuess?: number
): Promise<string> => {
  try {
    const prompt = `
      Eres un anfitrión de juegos cínico, burlón pero divertido llamado "Bomba-Bot". 
      Estamos jugando a "La Bomba Numérica".
      Reglas: Los jugadores eligen un número entre el rango actual. Si aciertan el número secreto, ¡explotan!
      Estado actual:
      - Rango: ${min} a ${max}.
      - Turno de: Jugador ${currentPlayer}.
      - Modo: ${isElimination ? 'Eliminación (quedar el último vivo)' : 'Clásico'}.
      ${lastGuess ? `- El último jugador dijo ${lastGuess} y falló.` : ''}

      Escribe un comentario MUY breve (máximo 15 palabras) en español que genere tensión o se burle un poco del Jugador ${currentPlayer}. 
      Usa un tono sarcástico y directo. No uses emojis.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 0.95,
      }
    });

    return response.text?.trim() || "¡Elige rápido, el tiempo vuela!";
  } catch (error) {
    console.error("AI Error:", error);
    return "La bomba sigue tic-tac-tic-tac...";
  }
};
