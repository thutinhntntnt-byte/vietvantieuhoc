import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// In Netlify, process.env.API_KEY is available during build/runtime
const getApiKey = () => {
  return process.env.API_KEY || '';
};

export class GeminiService {
  private chat: Chat | null = null;

  private initChat() {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    this.chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.chat) this.initChat();
    if (!this.chat) throw new Error("Chat could not be initialized");
    
    const result: GenerateContentResponse = await this.chat.sendMessage({ message });
    return result.text || "Xin lỗi, cô AI gặp chút trục trặc. Con thử lại nhé!";
  }

  async *sendMessageStream(message: string) {
    if (!this.chat) this.initChat();
    if (!this.chat) throw new Error("Chat could not be initialized");

    const stream = await this.chat.sendMessageStream({ message });
    for await (const chunk of stream) {
      const c = chunk as GenerateContentResponse;
      yield c.text || "";
    }
  }
}

export const geminiService = new GeminiService();
