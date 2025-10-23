
import { GoogleGenAI } from "@google/genai";

// Assume process.env.API_KEY is configured in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

// FIX: Conditionally initialize GoogleGenAI to prevent a runtime crash if API_KEY is not set.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generatePostContent = async (prompt: string): Promise<string> => {
  // FIX: Check for the initialized 'ai' instance instead of the raw API key.
  if (!ai) {
    return "AI service is unavailable. Please configure the API key.";
  }
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a content writer for a college NGO that teaches underprivileged students. Write a social media post based on the following idea. Keep it positive, engaging, and under 100 words. Idea: "${prompt}"`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return "An error occurred while generating content. Please try again.";
  }
};
