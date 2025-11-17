let ai: any;

export function initializeGemini(aiInstance: any) {
  ai = aiInstance;
}

export const geminiService = {
  moderateContent: async (text: string) => {
    if (!ai) return 'SAFE'; // Fail open if AI client is not available
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following text for a social platform of a college NGO. Is it vulgar, abusive, hateful, or inappropriate? Respond with only one word: 'SAFE' or 'UNSAFE'. Text: "${text}"`,
        config: { temperature: 0 },
      });
      const result = response.text.trim().toUpperCase();
      return result === 'UNSAFE' ? 'UNSAFE' : 'SAFE';
    } catch (error) {
      console.error("Error during content moderation:", error);
      return 'SAFE'; // Fail open
    }
  },
  getAiChatResponse: async (history: any[], newMessage: string) => {
    if (!ai) return "I'm sorry, the AI service is currently unavailable.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [...history, { role: 'user', parts: [{ text: newMessage }] }],
            config: {
                systemInstruction: "You are a helpful AI assistant for PARIVARTAN, a college NGO dedicated to teaching underprivileged students. Be friendly, encouraging, and provide concise information about the group's activities, mission, and how to get involved. Do not answer questions outside of this scope.",
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error getting AI chat response:", error);
        return "I'm sorry, I'm having a little trouble right now. Please try asking again in a moment.";
    }
  },
  generatePostContent: async (prompt: string) => {
    if (!ai) return "AI content generation is currently unavailable.";
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
  },
};
