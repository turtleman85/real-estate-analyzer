import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req) {
  try {
    const { images } = await req.json(); // Array of base64 strings
    if (!images || images.length === 0) {
      return new Response(JSON.stringify({ error: "No images provided" }), { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "API key is missing" }), { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const imageParts = images.map(img => {
      // images are base64 strings starting with 'data:image/...;base64,'
      const mimeType = img.substring(img.indexOf(":") + 1, img.indexOf(";"));
      const base64Data = img.split(",")[1];
      return {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      };
    });

    const prompt = "첨부된 사진들을 바탕으로 건물의 주요 구조를 분석해주세요. 지붕의 재질, 외벽의 재질, 그리고 전반적인 건축물 상태에 대해 간략히 요약해서 설명해주세요. (예: 지붕: 슬레이트, 외벽: 콘크리트 등)";

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ analysis: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to analyze image" }), { status: 500 });
  }
}
