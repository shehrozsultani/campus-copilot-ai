import { GoogleGenAI } from '@google/genai';

export async function POST(req) {
  try {
    const { messages, course } = await req.json();

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ 
      apiKey: apiKey,
      vertexai: false 
    });

    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const systemInstruction = course 
      ? `You are CampusCopilot AI, a specialized academic assistant for the course module: ${course}. Provide concise, accurate academic explanations, code solutions, or study help.`
      : `You are CampusCopilot AI, an advanced academic advisor and coding assistant.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return Response.json({ reply: response.text });
  } catch (error) {
    console.error('API Route Error Details:', error);
    return Response.json({ reply: `Error: ${error.message || 'Failed to connect to Gemini API.'}` }, { status: 500 });
  }
}