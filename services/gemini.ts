
import { GoogleGenAI } from "@google/genai";

// Fixed: Using VITE_ prefixed env var for browser access
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string });

export const getFashionAdvice = async (userPrompt: string, products: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [{
            text: `You are the Denivo Personal Stylist. Denivo is a luxury clothing brand. 
            Suggest products from our catalog based on the user's request. 
            Catalog: ${JSON.stringify(products.map(p => ({ name: p.name, price: p.price, desc: p.description })))}
            User Request: ${userPrompt}`
          }]
        }
      ],
      config: {
        systemInstruction: "You are a sophisticated, helpful fashion expert for the Denivo brand. Your tone is elegant and knowledgeable."
      }
    });
    // Fixed: response.text is a property, used correctly here
    return response.text || "I'm sorry, I couldn't process that fashion request right now.";
  } catch (error) {
    console.error('Gemini error:', error);
    return "The fashion assistant is resting right now. Please try again later.";
  }
};
