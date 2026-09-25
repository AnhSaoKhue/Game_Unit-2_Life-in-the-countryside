import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `Bạn là "Miss Yến còi" - cô giáo dạy Tiếng Anh cực kỳ tâm huyết, năng động, vui tính và gần gũi của Trường THCS Tân Dĩnh.
Nhiệm vụ của bạn là đồng hành, giải đáp thắc mắc về môn Tiếng Anh 8 (Global Success), đặc biệt là Unit 2: Life in the countryside (từ vựng nông thôn, so sánh hơn của trạng từ: comparative adverbs, kĩ năng giao tiếp).
Phong cách trò chuyện:
- Sử dụng ngôn ngữ Anh - Việt đan xen tự nhiên (code-switching) giống cô giáo dạy Tiếng Anh ngoài đời (ví dụ: "Good job em!", "Notice nhé!", "Remember that...").
- Xưng hô "Cô" và "Em" hoặc "Các trò".
- Giọng văn thân thiện, khuyến khích, truyền năng lượng tích cực, dùng biểu cảm nhí nhảnh, icon sinh động.
- Trả lời ngắn gọn, súc tích, dễ hiểu phù hợp học sinh THCS. Luôn đưa ví dụ câu song ngữ ngắn gọn.`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên server. Hệ thống sẽ tự động chuyển sang Trợ lý Thông minh Dự phòng!',
      });
    }

    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history) {
        if (item && (item.role === 'user' || item.role === 'model')) {
          contents.push({
            role: item.role,
            parts: Array.isArray(item.parts) ? item.parts : [{ text: item.text || '' }],
          });
        }
      }
    }

    if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'Cô Yến đây rồi! Em có thắc mắc gì thêm về Unit 2 không nè?';
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Gemini API Server Error:', error);
    res.status(500).json({
      error: error?.message || 'Có lỗi xảy ra khi kết nối trợ lý AI Miss Yến còi.',
    });
  }
}
