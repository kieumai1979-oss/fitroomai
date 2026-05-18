import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in the environment.");
}

const ai = new GoogleGenAI({ apiKey });

export async function generateTryOn(imageBuffer: ArrayBuffer, mimeType: string, outfitDescription: string): Promise<string | null> {
  if (!apiKey) throw new Error("API Key missing");

  const base64Data = btoa(
    new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
  );

  const prompt = `
    Bạn là một chuyên gia thời trang AI cao cấp. 
    Nhiệm vụ: Chỉnh sửa ảnh được cung cấp của người dùng để thay đổi trang phục.
    
    Yêu cầu cụ thể:
    1. Giữ nguyên khuôn mặt, vóc dáng, tư thế, ánh sáng và bối cảnh nền của người trong ảnh.
    2. Thay đổi toàn bộ quần áo/trang phục hiện tại thành: ${outfitDescription}.
    3. Trang phục mới phải trông tự nhiên, chân thực, nếp gấp vải và ánh sáng phải khớp hoàn hảo với ảnh gốc.
    4. Kết quả phải là một hình ảnh thẩm mỹ cao, phong cách và sang trọng.
    
    Chỉ trả về hình ảnh kết quả đã được chỉnh sửa.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating try-on image:", error);
    throw error;
  }
}
