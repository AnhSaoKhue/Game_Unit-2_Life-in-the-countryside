import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent as required by gemini-api guidelines
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

// Server-side Gemini API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên server. Hệ thống sẽ tự động chuyển sang Trợ lý Thông minh Dự phòng!',
      });
    }

    // Build chat contents from history
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

    // Ensure latest message is present
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
});

// High-fidelity Bilingual Audio proxy (Vietnamese Female MC Hanoi + British English BBC)
app.get('/api/tts', async (req, res) => {
  try {
    const text = String(req.query.text || '').trim();
    const tl = String(req.query.tl || 'vi').trim();
    if (!text) {
      return res.status(400).send('Text is required');
    }
    const safeText = text.slice(0, 200);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(safeText)}`;
    
    const upstreamRes = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).send('TTS upstream error');
    }

    const arrayBuffer = await upstreamRes.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    res.status(500).send('Error in /api/tts: ' + err.message);
  }
});

// Direct Download endpoint for Index.html
app.get('/download/index.html', async (_req, res) => {
  try {
    const { generateStandaloneIndexHtml } = await import('./src/utils/appsScriptCode.ts');
    const html = generateStandaloneIndexHtml();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Index.html"');
    res.send(html);
  } catch (err: any) {
    res.status(500).send('Lỗi tạo tệp Index.html: ' + err.message);
  }
});

// Direct Download endpoint for Code.gs
app.get('/download/code.gs', async (_req, res) => {
  try {
    const { CODE_GS_CONTENT } = await import('./src/utils/appsScriptCode.ts');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Code.gs"');
    res.send(CODE_GS_CONTENT);
  } catch (err: any) {
    res.status(500).send('Lỗi tạo tệp Code.gs: ' + err.message);
  }
});

// Direct Download endpoint for Complete ZIP Package
app.get('/download/zip', async (_req, res) => {
  try {
    const { CODE_GS_CONTENT, GUIDE_APPS_SCRIPT_MD, generateStandaloneIndexHtml } = await import(
      './src/utils/appsScriptCode.ts'
    );
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    zip.file('Code.gs', CODE_GS_CONTENT);
    zip.file('Index.html', generateStandaloneIndexHtml());
    zip.file('HUONG_DAN_APPS_SCRIPT.md', GUIDE_APPS_SCRIPT_MD);
    zip.file(
      'README.txt',
      `TRỌN BỘ MÃ NGUỒN GAME TIẾNG ANH 8 - UNIT 2 (GLOBAL SUCCESS)\nTrường THCS Tân Dĩnh - Giáo viên: Hoàng Hải Yến\n=====================================================\n\n1. Index.html: Giao diện Web App trọn gói, đã tích hợp Chatbot Miss Yến còi với giọng Nữ MC Hà Nội (to tròn, giòn, nẩy).\n2. Code.gs: Mã nguồn chạy phía máy chủ Google Apps Script.\n3. HUONG_DAN_APPS_SCRIPT.md: Hướng dẫn chi tiết 5 bước đưa lên Web App.`
    );
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="Game-Tieng-Anh-8-Unit-2-Apps-Script.zip"');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).send('Lỗi tạo tệp ZIP: ' + err.message);
  }
});

// Mount Vite in dev mode or static files in prod
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
