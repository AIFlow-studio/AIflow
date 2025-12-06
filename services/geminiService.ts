import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAgentConfig = async (description: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a JSON configuration for an AI Agent based on this description: "${description}". 
      Adhere to this schema: { name: string, role: string, model: { provider: string, name: string, temperature: number }, tools: string[] }. 
      Return ONLY valid JSON.`,
      config: {
        responseMimeType: 'application/json'
      }
    });
    return response.text || "{}";
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
};

export const suggestWorkflowImprovements = async (currentFlow: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Using Pro for complex reasoning
        contents: `Analyze this workflow structure and suggest 3 optimizations in bullet points: ${currentFlow}`,
      });
      return response.text || "No suggestions available.";
    } catch (error) {
      console.error("Gemini analysis error:", error);
      throw error;
    }
};