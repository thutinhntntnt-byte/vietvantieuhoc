
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Hàm lấy API Key an toàn từ biến môi trường của Vercel
const getApiKey = () => {
  // @ts-ignore
  const key = process.env.API_KEY;
  if (!key) {
    console.warn("API_KEY không tìm thấy trong môi trường. Vui lòng kiểm tra lại thiết lập trên Vercel.");
  }
  return key || '';
};

export class GeminiService {
  private chat: Chat | null = null;

  private initChat() {
    const apiKey = getApiKey();
    if (!apiKey) return;

    const ai = new GoogleGenAI({ apiKey });
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
    if (!this.chat) return "Cô AI chưa được kết nối. Con hãy kiểm tra lại cấu hình API Key nhé!";
    
    try {
      const result: GenerateContentResponse = await this.chat.sendMessage({ message });
      return result.text || "Xin lỗi, cô AI gặp chút trục trặc. Con thử lại nhé!";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Có lỗi xảy ra khi cô AI đang suy nghĩ. Con hãy thử tải lại trang nhé!";
    }
  }

  async *sendMessageStream(message: string) {
    if (!this.chat) this.initChat();
    if (!this.chat) {
        yield "Cô AI chưa được kết nối. Con hãy kiểm tra lại cấu hình API Key nhé!";
        return;
    }

    try {
      const stream = await this.chat.sendMessageStream({ message });
      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        yield c.text || "";
      }
    } catch (error) {
      console.error("Gemini Stream Error:", error);
      yield "Có lỗi xảy ra khi cô AI đang trả lời. Con hãy thử lại sau nhé!";
    }
  }
}

export const geminiService = new GeminiService();
