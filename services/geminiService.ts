
import { GoogleGenAI, Modality } from "@google/genai";

// FIX: Per coding guidelines, API key must be from environment variables
// and is assumed to be available. Hardcoded key removed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generatePostContent = async (prompt: string): Promise<string> => {
  // FIX: Removed null check for `ai` as it's guaranteed to be initialized per guidelines.
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

export const generateImage = async (prompt: string): Promise<string | null> => {
    // FIX: Removed null check for `ai` as it's guaranteed to be initialized per guidelines.
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { responseModalities: [Modality.IMAGE] },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data; // base64 string
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        alert("An error occurred while generating the image.");
        return null;
    }
};

export const enhanceImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string | null> => {
    // FIX: Removed null check for `ai` as it's guaranteed to be initialized per guidelines.
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: base64Image, mimeType: mimeType } },
                    { text: prompt },
                ],
            },
            config: { responseModalities: [Modality.IMAGE] },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        return null;
    } catch (error) {
        console.error("Error enhancing image:", error);
        alert("An error occurred while enhancing the image.");
        return null;
    }
};
