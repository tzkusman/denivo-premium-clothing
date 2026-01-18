
import { GoogleGenAI } from "@google/genai";

// Lazy initialize Gemini AI
let ai: GoogleGenAI | null = null;

const getGeminiClient = () => {
  if (!ai) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not configured');
      return null;
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const getFashionAdvice = async (userPrompt: string, products: any[]) => {
  try {
    const client = getGeminiClient();
    if (!client) {
      return "The fashion assistant is not configured. Please set up your Gemini API key.";
    }
    
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [{
            text: `You are the ZARQ Personal Stylist. ZARQ is a premium denim and fashion brand known for quality and style. 
            Suggest products from our catalog based on the user's request. 
            Catalog: ${JSON.stringify(products.map(p => ({ name: p.name, price: p.price, desc: p.description })))}
            User Request: ${userPrompt}`
          }]
        }
      ],
      config: {
        systemInstruction: "You are a sophisticated, helpful fashion expert for the ZARQ brand. Your tone is friendly, stylish, and knowledgeable about denim fashion."
      }
    });
    return response.text || "I'm sorry, I couldn't process that fashion request right now.";
  } catch (error) {
    console.error('Gemini error:', error);
    return "The fashion assistant is resting right now. Please try again later.";
  }
};
