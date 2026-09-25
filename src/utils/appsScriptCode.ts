import JSZip from 'jszip';
import { RAW_QUESTIONS } from '../data/quizData';

export const CODE_GS_CONTENT = `/**
 * =========================================================================
 * BỘ MÃ NGUỒN GOOGLE APPS SCRIPT: GAME HỌC TẬP TIẾNG ANH 8 - UNIT 2
 * Môn học: Tiếng Anh 8 (Global Success) - Unit 2: Life in the countryside
 * Trường THCS Tân Dĩnh - Giáo viên: Hoàng Hải Yến
 * =========================================================================
 */

/**
 * 1. Hàm phục vụ giao diện Web App (GET Request)
 */
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('Game Học Tập Tiếng Anh 8 - Unit 2 (THCS Tân Dĩnh)')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * 2. Hàm xử lý Chatbot Miss Yến còi chạy trên SERVER Google Apps Script
 * - KHÔNG BỊ CHẶN CORS bởi trình duyệt
 * - Bảo mật API Key trong Script Properties (Cài đặt dự án)
 * - Tự động dự phòng thông minh nếu chưa có API Key
 */
function askGeminiServer(message, history, clientApiKey) {
  try {
    if (!message || typeof message !== 'string') {
      return { success: false, fallbackNeeded: true, error: 'Tin nhắn không hợp lệ' };
    }

    // Lấy API Key từ Script Properties (Cài đặt dự án) hoặc do người dùng truyền vào
    var apiKey = clientApiKey || PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        fallbackNeeded: true,
        error: 'Chưa cấu hình GEMINI_API_KEY trong Script Properties. Trợ lý chuyển sang phản hồi offline thông minh!'
      };
    }

    var apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(apiKey);

    var contents = [];
    if (history && history.length) {
      for (var i = 0; i < history.length; i++) {
        var hRole = history[i].role === 'user' ? 'user' : 'model';
        var hText = '';
        if (history[i].parts && history[i].parts[0]) {
          hText = history[i].parts[0].text || '';
        } else if (history[i].text) {
          hText = history[i].text;
        }
        if (hText) {
          contents.push({
            role: hRole,
            parts: [{ text: hText }]
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    var systemPrompt = "Bạn là 'Miss Yến còi' - cô giáo dạy Tiếng Anh tâm huyết, vui tính trường THCS Tân Dĩnh. Đồng hành, giải đáp bài Tiếng Anh 8 Unit 2: Life in the countryside. Ngôn ngữ Anh-Việt tự nhiên, xưng Cô - Em, biểu cảm thân thiện, trả lời ngắn gọn, có ví dụ câu.";

    var payload = {
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    };

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(apiUrl, options);
    var statusCode = response.getResponseCode();
    var resultText = response.getContentText();
    var json = JSON.parse(resultText);

    if (statusCode === 200 && json.candidates && json.candidates[0] && json.candidates[0].content) {
      var botReply = json.candidates[0].content.parts[0].text;
      return {
        success: true,
        reply: botReply
      };
    } else {
      return {
        success: false,
        fallbackNeeded: true,
        error: json.error ? json.error.message : 'Lỗi HTTP ' + statusCode
      };
    }
  } catch (err) {
    return {
      success: false,
      fallbackNeeded: true,
      error: err.toString()
    };
  }
}

/**
 * 3. Tiện ích: Lưu nhanh GEMINI_API_KEY vào Script Properties
 * Bạn có thể chạy trực tiếp hàm này một lần trong Apps Script Editor để lưu khóa API
 */
function setGeminiApiKey(yourApiKey) {
  if (!yourApiKey) {
    Logger.log('Vui lòng truyền khóa API hợp lệ');
    return;
  }
  PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', yourApiKey);
  Logger.log('Đã lưu thành công GEMINI_API_KEY vào Script Properties!');
}
`;

export const GUIDE_APPS_SCRIPT_MD = `# HƯỚNG DẪN TRIỂN KHAI LÊN GOOGLE APPS SCRIPT (5 BƯỚC CỰC KỲ ĐƠN GIẢN)

Bộ mã nguồn này đã được tối ưu hóa đặc biệt để **chạy trơn tru trên Google Apps Script Web App** mà không bị lỗi chatbot, không bị chặn CORS và có thể chia sẻ cho toàn bộ học sinh làm bài trên điện thoại hoặc máy tính!

---

### BƯỚC 1: TẠO DỰ ÁN GOOGLE APPS SCRIPT MỚI
1. Truy cập [script.google.com](https://script.google.com).
2. Nhấn nút **"+ Dự án mới"** (New Project).
3. Đổi tên dự án thành: **"Game Tiếng Anh 8 Unit 2 - THCS Tân Dĩnh"**.

---

### BƯỚC 2: DÁN MÃ NGUỒN VÀO DỰ ÁN
Dự án gồm đúng 2 tệp:
1. **Tệp \`Code.gs\`**:
   - Mở tệp \`Mã.gs\` hoặc \`Code.gs\` có sẵn.
   - Xóa hết nội dung cũ và dán toàn bộ nội dung trong tệp **\`Code.gs\`** đính kèm vào.
   - Nhấn **Lưu (Ctrl + S)**.

2. **Tệp \`Index.html\`**:
   - Nhấn dấu **+** cạnh "Tệp" (Files) ➔ Chọn **HTML**.
   - Đặt tên tệp là: **\`Index\`** (chữ I viết hoa, hệ thống tự thêm đuôi .html).
   - Xóa hết nội dung mặc định và dán toàn bộ mã nguồn tệp **\`Index.html\`** đính kèm vào.
   - Nhấn **Lưu (Ctrl + S)**.

---

### BƯỚC 3: CẤU HÌNH GEMINI API KEY CHO CHATBOT (TÙY CHỌN)
Chatbot "Miss Yến còi" đã có sẵn **bộ não AI Offline thông minh** về Unit 2 (giải đáp toàn bộ 10 câu, từ vựng, ngữ pháp so sánh trạng từ).
Nếu muốn Miss Yến trả lời tự do với mô hình AI Gemini của Google:
1. Trong màn hình Apps Script, vào menu **Cài đặt dự án** (biểu tượng bánh răng bên trái).
2. Cuộn xuống mục **Thuộc tính tập lệnh** (Script Properties) ➔ Nhấn **Thêm thuộc tính tập lệnh**:
   - **Thuộc tính (Property):** \`GEMINI_API_KEY\`
   - **Giá trị (Value):** \`Khóa_API_Gemini_Của_Bạn\`
3. Nhấn **Lưu thuộc tính tập lệnh**.
*(Mã \`Code.gs\` sẽ tự động đọc khóa này trên server an toàn mà không làm lộ ra ngoài!)*

---

### BƯỚC 4: TRIỂN KHAI THÀNH WEB APP (DEPLOY)
1. Ở góc trên bên phải, nhấn nút xanh **Triển khai (Deploy)** ➔ Chọn **Triển khai mới (New deployment)**.
2. Nhấn biểu tượng bánh răng bên cạnh "Chọn loại" ➔ Chọn **Ứng dụng web (Web app)**.
3. Điền thông tin cấu hình:
   - **Mô tả:** Game Tiếng Anh 8 Unit 2 - THCS Tân Dĩnh
   - **Thực thi dưới dạng (Execute as):** **Tôi (Tài khoản Google của bạn)**
   - **Ai có quyền truy cập (Who has access):** **Bất kỳ ai (Anyone)** *(Quan trọng: để học sinh mở được mà không cần đăng nhập tài khoản quản trị)*.
4. Nhấn **Triển khai (Deploy)**.
5. Cấp quyền truy cập (nếu Google yêu cầu xác thực).

---

### BƯỚC 5: SAO CHÉP LIÊN KẾT VÀ GỬI CHO HỌC SINH!
- Google sẽ cung cấp **URL ứng dụng web** (dạng \`https://script.google.com/macros/s/.../exec\`).
- Bạn sao chép link này gửi lên Zalo nhóm lớp, Facebook hoặc trình chiếu trên máy chiếu lớp học để các em làm bài!

🎉 Chúc cô Hoàng Hải Yến và các em học sinh THCS Tân Dĩnh có những giờ học Tiếng Anh thật hào hứng và hiệu quả!
`;

export function generateStandaloneIndexHtml(): string {
  const jsonQuestions = JSON.stringify(RAW_QUESTIONS, null, 2);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Học Tập Tiếng Anh 8 - Unit 2: Life in the countryside</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Montserrat:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,700;1,600&family=Quicksand:wght@500;600;700;800&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Quicksand', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 35%, #311042 70%, #0f172a 100%);
            min-height: 100vh;
            color: #f8fafc;
            overflow-x: hidden;
        }

        .font-certificate-title {
            font-family: 'Playfair Display', serif;
        }

        .font-signature {
            font-family: 'Dancing Script', cursive;
        }

        .glass-card {
            background: rgba(30, 41, 59, 0.85);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .marquee-container {
            overflow: hidden;
            white-space: nowrap;
            background: linear-gradient(90deg, #f59e0b, #ef4444, #ec4899, #8b5cf6, #f59e0b);
            background-size: 300% 300%;
            animation: gradientShift 6s ease infinite;
        }

        .marquee-text {
            display: inline-block;
            padding-left: 100%;
            animation: marquee 22s linear infinite;
        }

        @keyframes marquee {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-100%, 0); }
        }

        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .certificate-border {
            border: 12px double #d97706;
            outline: 3px solid #fef3c7;
            outline-offset: -8px;
            background: #fffdf5;
            color: #1e293b;
        }

        #fx-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 999;
        }

        .btn-glow {
            transition: all 0.25s ease-in-out;
            box-shadow: 0 0 15px rgba(236, 72, 153, 0.4);
        }
        .btn-glow:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 0 25px rgba(236, 72, 153, 0.8);
        }

        .option-btn {
            transition: all 0.2s ease;
        }
        .option-btn:hover:not(:disabled) {
            transform: translateX(6px);
            background-color: rgba(99, 102, 241, 0.25);
        }

        .red-seal {
            width: 110px;
            height: 110px;
            border: 3px dashed #dc2626;
            border-radius: 50%;
            color: #dc2626;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            transform: rotate(-12deg);
            opacity: 0.95;
            box-shadow: 0 0 0 3px #ef4444 inset;
            background: rgba(254, 226, 226, 0.2);
            font-size: 9px;
            font-weight: 800;
            line-height: 1.1;
        }

        .chatbot-window {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: bottom right;
        }
        .chat-bubble-user {
            background: linear-gradient(135deg, #4f46e5, #6366f1);
            color: white;
            border-radius: 18px 18px 2px 18px;
        }
        .chat-bubble-bot {
            background: #1e293b;
            color: #f1f5f9;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 18px 18px 18px 2px;
        }
        .recording-pulse {
            animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
    </style>
</head>
<body class="flex flex-col min-h-screen justify-between relative overflow-x-hidden">
    <canvas id="fx-canvas"></canvas>

    <!-- Top Running Advertisement Banner -->
    <div class="marquee-container text-white py-2 shadow-lg font-bold text-sm md:text-base tracking-wide z-20">
        <div class="marquee-text flex items-center gap-3">
            <span>🌟 Chúc các em làm bài tốt nhất - Anh Sao Khue - Hotline: 0346513056 🌟</span>
            <span class="mx-8">|</span>
            <span>📚 Tiếng Anh 8 (Global Success) - Unit 2: Life in the countryside 📚</span>
            <span class="mx-8">|</span>
            <span>🏫 Trường THCS Tân Dĩnh - Giáo viên: Hoàng Hải Yến 🏫</span>
        </div>
    </div>

    <!-- Main Game Frame -->
    <main class="container mx-auto px-4 py-6 max-w-5xl flex-grow flex flex-col justify-center items-center z-10">
        <div class="glass-card w-full rounded-3xl p-6 md:p-8 shadow-2xl relative border border-slate-700/60 overflow-hidden">
            
            <!-- Header Section with Attached Branding Image -->
            <div class="flex flex-col md:flex-row items-center justify-between border-b border-slate-700/80 pb-6 mb-6 gap-4">
                <div class="flex items-center gap-4">
                    <div class="relative group">
                        <img src="https://i.ibb.co/JwJRM4ZZ/image.jpg" 
                             alt="Tiếng Anh 8 Global Success" 
                             onerror="this.onerror=null; this.src='https://placehold.co/180x100/1e293b/38bdf8?text=English+8+Global+Success';"
                             class="h-20 w-auto object-cover rounded-xl border-2 border-amber-400/80 shadow-md transform group-hover:scale-105 transition duration-300">
                    </div>
                    <div>
                        <span class="bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-amber-500/30">
                            Unit 2: Life in the countryside
                        </span>
                        <h1 class="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-pink-400 mt-1">
                            GAME ÔN TẬP BÀI HỌC
                        </h1>
                        <p class="text-slate-400 text-xs md:text-sm">Trường THCS Tân Dĩnh • GV: Hoàng Hải Yến</p>
                    </div>
                </div>

                <!-- Student Name Input Panel / Display -->
                <div id="student-name-box" class="flex flex-col items-end w-full md:w-auto">
                    <div class="flex items-center gap-2 bg-slate-800/90 p-2 pl-4 rounded-full border border-slate-600 w-full md:w-auto">
                        <i class="fa-solid fa-user-graduate text-amber-400"></i>
                        <input type="text" id="student-name-input" placeholder="Nhập tên học sinh..." 
                               class="bg-transparent text-white font-semibold focus:outline-none w-40 md:w-48 text-sm"
                               oninput="updateStudentName(this.value)">
                        <button onclick="saveStudentName()" class="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold px-4 py-1.5 rounded-full text-xs hover:brightness-110 transition shadow-md">
                            Lưu tên
                        </button>
                    </div>
                    <span id="name-display-tag" class="text-xs text-amber-300 font-semibold mt-1 hidden">
                        <i class="fa-solid fa-check-circle"></i> Học sinh: <span id="current-student-name">...</span>
                    </span>
                </div>
            </div>

            <!-- SECTION 1: Quiz Screen -->
            <div id="screen-quiz" class="space-y-6">
                <!-- Progress & Score Header Bar -->
                <div class="flex items-center justify-between text-sm bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
                    <div class="flex items-center gap-2">
                        <span class="text-amber-400 font-bold" id="question-tracker">Câu 1/10</span>
                        <div class="w-32 md:w-48 bg-slate-700 h-2.5 rounded-full overflow-hidden">
                            <div id="progress-bar" class="bg-gradient-to-r from-amber-400 to-pink-500 h-full w-10 transition-all duration-300"></div>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <span id="score-live-badge" class="bg-indigo-500/20 text-indigo-300 font-bold px-3 py-1 rounded-lg border border-indigo-500/30">
                            <i class="fa-solid fa-star text-yellow-400 mr-1"></i> Điểm hiện tại: <span id="current-score">0</span>/10
                        </span>
                    </div>
                </div>

                <!-- Question Text Box -->
                <div class="bg-slate-800/80 p-6 rounded-2xl border border-indigo-500/30 shadow-inner relative">
                    <span class="absolute -top-3 left-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                        CÂU HỎI <span id="q-number-badge">1</span>
                    </span>
                    <h2 id="question-text" class="text-lg md:text-xl font-bold text-slate-100 mt-2 leading-relaxed">
                        Đang tải câu hỏi...
                    </h2>
                </div>

                <!-- Multiple Choice Options grid -->
                <div id="options-container" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Options injected dynamically by JS -->
                </div>

                <!-- Instant Feedback Banner -->
                <div id="feedback-banner" class="min-h-[48px] rounded-xl flex items-center px-4 font-bold text-sm hidden transition-all duration-300">
                    <i id="feedback-icon" class="mr-2 text-lg"></i>
                    <span id="feedback-text"></span>
                </div>

                <!-- Action Controls Panel -->
                <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-700/80">
                    <div class="flex items-center gap-2">
                        <button onclick="resetQuiz()" class="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-4 py-2 rounded-xl text-xs md:text-sm flex items-center gap-2 transition">
                            <i class="fa-solid fa-rotate-left text-amber-400"></i> Làm lại
                        </button>
                        <button onclick="showAnswerGuideModal()" class="bg-cyan-600/80 hover:bg-cyan-500 text-white font-semibold px-4 py-2 rounded-xl text-xs md:text-sm flex items-center gap-2 transition">
                            <i class="fa-solid fa-lightbulb text-yellow-300"></i> Xem hướng dẫn đáp án
                        </button>
                    </div>

                    <div class="flex items-center gap-2">
                        <button id="btn-next" onclick="nextQuestion()" class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-xs md:text-sm flex items-center gap-2 shadow-lg transition">
                            Làm tiếp <i class="fa-solid fa-arrow-right"></i>
                        </button>
                        <button onclick="submitQuiz()" class="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold px-6 py-2 rounded-xl text-xs md:text-sm shadow-lg flex items-center gap-2 transition">
                            <i class="fa-solid fa-paper-plane"></i> Nộp bài
                        </button>
                    </div>
                </div>
            </div>

            <!-- SECTION 2: Results & Score Display Screen -->
            <div id="screen-result" class="hidden space-y-6 text-center py-4">
                <div class="inline-block p-4 bg-amber-500/10 rounded-full border border-amber-500/30 mb-2">
                    <i class="fa-solid fa-trophy text-5xl text-amber-400 animate-bounce"></i>
                </div>
                
                <h2 class="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                    KẾT QUẢ BÀI ÔN TẬP
                </h2>

                <p class="text-slate-300 text-lg">
                    Chúc mừng học sinh: <span id="res-student-name" class="font-bold text-amber-300 text-xl">...</span>
                </p>

                <!-- Final Score Card -->
                <div class="max-w-md mx-auto glass-card p-6 rounded-2xl border-2 border-amber-400/50 shadow-xl">
                    <div class="text-sm text-slate-400 uppercase font-bold tracking-wider">Tổng điểm đạt được</div>
                    <div class="text-5xl font-black text-amber-400 my-2">
                        <span id="final-score">0</span> <span class="text-2xl text-slate-400">/ 10 điểm</span>
                    </div>
                    <div id="praise-message" class="text-sm md:text-base font-semibold text-emerald-300 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 mt-3">
                    </div>
                </div>

                <!-- Action buttons on Result Screen -->
                <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <button onclick="resetQuiz()" class="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-md">
                        <i class="fa-solid fa-rotate-left"></i> Làm lại từ đầu
                    </button>
                    <button onclick="showAnswerGuideModal()" class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-md">
                        <i class="fa-solid fa-book-open"></i> Xem đáp án chi tiết
                    </button>
                    <button onclick="generateCertificate()" class="btn-glow bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-extrabold px-8 py-3 rounded-xl flex items-center gap-2 transition text-base shadow-xl">
                        <i class="fa-solid fa-award text-yellow-300 text-xl"></i> VINH DANH HỌC SINH
                    </button>
                </div>
            </div>

            <!-- SECTION 3: Official Certificate of Merit Modal -->
            <div id="modal-certificate" class="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 hidden overflow-y-auto">
                <div class="relative w-full max-w-3xl my-8">
                    <button onclick="closeCertificate()" class="absolute -top-4 -right-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg font-bold text-lg z-20 transition">
                        ✕
                    </button>

                    <div class="certificate-border p-6 md:p-10 rounded-xl shadow-2xl relative overflow-hidden text-center">
                        <div class="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-700">
                            BỘ GIÁO DỤC VÀ ĐÀO TẠO • TRƯỜNG THCS TÂN DĨNH
                        </div>
                        <div class="text-xs text-amber-700 font-semibold mb-4">
                            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM — ĐỘC LẬP - TỰ DO - HẠNH PHÚC
                        </div>

                        <div class="my-4">
                            <h2 class="font-certificate-title text-2xl md:text-4xl font-extrabold text-amber-800 tracking-wide">
                                GIẤY VINH DANH KHEN THƯỞNG
                            </h2>
                            <div class="w-32 h-1 bg-gradient-to-r from-amber-400 via-red-500 to-amber-400 mx-auto mt-2 rounded-full"></div>
                        </div>

                        <p class="text-xs md:text-sm italic text-slate-600 mt-2">Trân trọng tuyên dương học sinh:</p>
                        
                        <div id="cert-student-name" class="font-signature text-3xl md:text-5xl font-bold text-rose-700 my-3">
                            Nguyễn Văn A
                        </div>

                        <p class="text-slate-800 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                            Đã hoàn thành xuất sắc bài tập ôn tập trực tuyến Tiếng Anh 8 (Global Success)<br>
                            <strong>Unit 2: Life in the countryside</strong> với kết quả ấn tượng:
                        </p>

                        <div class="inline-block bg-amber-100 border-2 border-amber-500 text-amber-900 font-black text-xl md:text-2xl px-6 py-2 rounded-full my-3 shadow-sm">
                            ĐIỂM SỐ: <span id="cert-score">10</span> / 10 ĐIỂM
                        </div>

                        <p id="cert-praise" class="text-xs md:text-sm italic text-emerald-800 font-semibold mb-6">
                            "Học tập chăm chỉ - Thành công vươn xa"
                        </p>

                        <div class="grid grid-cols-2 gap-4 items-end mt-6 text-xs md:text-sm">
                            <div class="text-left space-y-1">
                                <p class="font-bold text-slate-700">Đơn vị khen thưởng:</p>
                                <p class="text-slate-600">Trường THCS Tân Dĩnh</p>
                                <p class="text-slate-500 text-xs">Môn: Tiếng Anh 8</p>
                            </div>

                            <div class="flex flex-col items-center justify-center relative">
                                <p class="text-slate-600 italic">Tân Dĩnh, ngày 24 tháng 09 năm 2026</p>
                                <p class="font-bold text-slate-800 uppercase mt-1">Giáo viên bộ môn</p>
                                
                                <div class="absolute -top-2 left-2 md:left-6 red-seal pointer-events-none">
                                    <span>TRƯỜNG THCS TÂN DĨNH</span>
                                    <span class="my-0.5 text-yellow-500 text-[11px]">★</span>
                                    <span>BẮC GIANG</span>
                                </div>

                                <div class="font-signature text-2xl md:text-3xl text-blue-900 font-bold mt-6 z-10">
                                    Hoàng Hải Yến
                                </div>
                                <p class="font-bold text-slate-900 text-xs mt-1">Hoàng Hải Yến</p>
                            </div>
                        </div>

                        <!-- Print Button -->
                        <div class="mt-6 pt-4 border-t border-amber-200">
                            <button onclick="window.print()" class="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2 rounded-xl text-xs flex items-center gap-2 mx-auto shadow transition">
                                <i class="fa-solid fa-print"></i> In giấy khen / Lưu PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SECTION 4: Detailed Answer Key Modal -->
            <div id="modal-answer-guide" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 hidden">
                <div class="bg-slate-900 text-slate-100 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-700">
                    <div class="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/80 rounded-t-2xl">
                        <h3 class="text-lg font-bold text-amber-400 flex items-center gap-2">
                            <i class="fa-solid fa-book-bookmark"></i> HƯỚNG DẪN ĐÁP ÁN VÀ GIẢI THÍCH CHI TIẾT
                        </h3>
                        <button onclick="closeAnswerGuideModal()" class="text-slate-400 hover:text-white text-xl font-bold px-2">
                            ✕
                        </button>
                    </div>
                    <div id="answer-guide-list" class="p-6 overflow-y-auto space-y-4 flex-1">
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- SECTION 5: Chatbot "Miss Yến còi" Widget -->
    <div id="chatbot-widget-container" class="fixed bottom-5 right-5 z-40 flex flex-col items-end">
        
        <!-- Chatbot Window -->
        <div id="chatbot-window" class="chatbot-window hidden mb-4 w-[90vw] sm:w-[400px] h-[540px] glass-card rounded-2xl flex flex-col shadow-2xl border border-amber-400/40 overflow-hidden">
            
            <!-- Chat Header -->
            <div class="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 p-3 px-4 flex items-center justify-between border-b border-slate-700/80 shadow">
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <img src="https://i.ibb.co/JwJRM4ZZ/image.jpg" 
                             onerror="this.onerror=null; this.src='https://placehold.co/100/ec4899/ffffff?text=Yen';" 
                             alt="Miss Yến còi" class="w-10 h-10 rounded-full border-2 border-amber-400 object-cover shadow">
                        <span class="w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 absolute bottom-0 right-0"></span>
                    </div>
                    <div>
                        <h4 class="font-bold text-amber-300 text-sm flex items-center gap-1">
                            Miss Yến còi <i class="fa-solid fa-sparkles text-xs text-yellow-300"></i>
                        </h4>
                        <p class="text-[11px] text-slate-300">GV Tiếng Anh • THCS Tân Dĩnh</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="toggleTtsSpeech()" id="btn-tts-toggle" title="Bật/Tắt giọng đọc" class="text-slate-400 hover:text-amber-300 text-xs px-2 py-1 rounded transition">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>
                    <button onclick="clearChatHistory()" title="Xóa hội thoại" class="text-slate-400 hover:text-amber-300 text-xs px-2 py-1 rounded transition">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    <button onclick="toggleChatbot()" class="text-slate-400 hover:text-white text-lg font-bold px-1.5 rounded">
                        ✕
                    </button>
                </div>
            </div>

            <!-- Voice Engine Banner -->
            <div class="bg-gradient-to-r from-amber-500/15 via-pink-500/15 to-indigo-500/15 px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
                <div class="flex items-center gap-1.5 text-amber-200 truncate">
                    <span id="voice-indicator-dot" class="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span id="voice-indicator-text" class="font-semibold text-xs">Nữ MC Hà Nội + Chuẩn Anh - Anh (British)</span>
                </div>
                <button onclick="testFemaleHanoiVoice()" class="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full text-[10px] font-bold transition flex items-center gap-1 shrink-0 ml-2" title="Nghe thử giọng Nữ MC Hà Nội & Tiếng Anh - Anh chuẩn">
                    <i class="fa-solid fa-play text-[8px]"></i> Thử giọng cô
                </button>
            </div>

            <!-- Quick Suggestions Bar -->
            <div class="bg-slate-950/60 p-2 overflow-x-auto flex gap-1.5 border-b border-slate-800 text-[11px] whitespace-nowrap scrollbar-none">
                <button onclick="quickAsk('Giải thích câu 4')" class="bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded-full border border-slate-700">
                    💡 Câu 4 ngữ pháp
                </button>
                <button onclick="quickAsk('Ngữ pháp so sánh trạng từ')" class="bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2.5 py-1 rounded-full border border-slate-700">
                    📚 So sánh trạng từ
                </button>
                <button onclick="quickAsk('Tổng hợp từ vựng Unit 2')" class="bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded-full border border-slate-700">
                    🌾 Từ vựng Unit 2
                </button>
                <button onclick="quickAsk('Mẹo làm bài điểm cao')" class="bg-slate-800 hover:bg-slate-700 text-pink-300 px-2.5 py-1 rounded-full border border-slate-700">
                    🎯 Bí quyết điểm 10
                </button>
            </div>

            <!-- Chat Messages Log Container -->
            <div id="chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3 text-xs md:text-sm">
                <div class="flex items-start gap-2">
                    <img src="https://i.ibb.co/JwJRM4ZZ/image.jpg" onerror="this.onerror=null; this.src='https://placehold.co/80/ec4899/ffffff?text=Yen';" class="w-7 h-7 rounded-full border border-amber-400 object-cover mt-1 shrink-0">
                    <div class="chat-bubble-bot p-3 shadow-md max-w-[85%]">
                        <p class="font-bold text-amber-300 mb-1">Hello các trò yêu! 👋</p>
                        <p>Cô là <strong>Miss Yến còi</strong> đây! Các em có thắc mắc gì về bài học <em>Unit 2: Life in the countryside</em> hay cần cô hướng dẫn ngữ pháp, từ vựng không nè? Em có thể **nhắn tin** hoặc bấm nút **Micro 🎙️** để nói chuyện với cô nhé!</p>
                    </div>
                </div>
            </div>

            <!-- Voice Recording Status Indicator -->
            <div id="voice-status-bar" class="hidden bg-rose-950/80 border-t border-rose-500/50 px-3 py-1.5 text-rose-200 text-xs flex items-center justify-between">
                <span class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span id="voice-status-text">Đang lắng nghe em nói...</span>
                </span>
                <button onclick="stopVoiceRecognition()" class="text-xs bg-rose-700 hover:bg-rose-600 px-2 py-0.5 rounded text-white font-bold">
                    Dừng
                </button>
            </div>

            <!-- Chat Input Controls Area -->
            <div class="p-3 bg-slate-900/90 border-t border-slate-700/80 flex items-center gap-2">
                <button id="btn-voice-input" onclick="toggleVoiceRecognition()" 
                        class="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-600 w-10 h-10 rounded-xl flex items-center justify-center transition shadow shrink-0" 
                        title="Bấm để nói (Giọng nói)">
                    <i class="fa-solid fa-microphone text-base"></i>
                </button>

                <input type="text" id="chat-text-input" 
                       placeholder="Hỏi cô Yến điều gì đó..." 
                       onkeydown="if(event.key === 'Enter') sendChatMessage()"
                       class="flex-1 bg-slate-800 text-slate-100 placeholder-slate-400 px-3 py-2 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-indigo-400">

                <button onclick="sendChatMessage()" 
                        class="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold w-10 h-10 rounded-xl flex items-center justify-center hover:brightness-110 transition shadow shrink-0">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>

        <!-- Floating Toggle Trigger Button -->
        <button id="chatbot-toggle-btn" onclick="toggleChatbot()" 
                class="btn-glow bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-600 text-white rounded-full p-3.5 shadow-2xl flex items-center gap-2 font-bold text-sm hover:scale-105 transition border-2 border-amber-300">
            <div class="relative">
                <img src="https://i.ibb.co/JwJRM4ZZ/image.jpg" onerror="this.onerror=null; this.src='https://placehold.co/80/ec4899/ffffff?text=Yen';" class="w-8 h-8 rounded-full border border-white object-cover">
                <span class="w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-900 absolute top-0 right-0"></span>
            </div>
            <span class="hidden sm:inline pr-1">Hỏi Miss Yến còi 💬</span>
        </button>
    </div>

    <!-- Footer Bar -->
    <footer class="text-center py-3 text-xs text-slate-400 bg-slate-950/60 z-10 border-t border-slate-800/50">
        <p>Hệ thống Game Học tập Tiếng Anh 8 • Unit 2: Life in the countryside • Trường THCS Tân Dĩnh</p>
    </footer>

    <script>
        // Question Database for Unit 2: Life in the countryside (Global Success 8)
        const rawQuestions = ${jsonQuestions};

        let studentName = "Học sinh";
        let currentQuestionIndex = 0;
        let score = 0;
        let userAnswers = [];
        let quizQuestions = [];

        let chatHistory = [];
        let speechRecognition = null;
        let isRecording = false;
        let isTtsEnabled = true;

        // Offline Smart Assistant Logic for Miss Yến còi
        function getOfflineTeacherReply(query) {
            const q = query.toLowerCase().trim();
            if (q.includes('chào') || q.includes('hello') || q.includes('hi') || q.includes('cô yến') || q.includes('cô ơi')) {
                return "Hello em yêu! 👋 Cô **Miss Yến còi** (THCS Tân Dĩnh) đây nè! Rất vui được đồng hành cùng em ôn tập Unit 2: *Life in the countryside*. Em muốn cô giải thích câu nào trong bài hay hướng dẫn ngữ pháp so sánh hơn của trạng từ nào?";
            }

            for (let i = 0; i < rawQuestions.length; i++) {
                const num = i + 1;
                if (q.includes('câu ' + num) || q.includes('câu số ' + num) || q.includes('cau ' + num) || q.includes('c' + num)) {
                    const item = rawQuestions[i];
                    return "💡 **HƯỚNG DẪN CÂU " + num + " NÈ EM:**\\n\\n📝 *Đề bài:* \\"" + item.question + "\\"\\n👉 **Đáp án đúng:** **" + item.correctText + "**\\n🔍 **Dịch nghĩa:** " + item.vietnameseMeaning + "\\n🎯 **Giải thích:** " + item.explanation + "\\n📌 **Trọng tâm:** " + item.grammarFocus;
                }
            }

            if (q.includes('ngữ pháp') || q.includes('so sánh') || q.includes('trạng từ') || q.includes('comparative') || q.includes('more slowly') || q.includes('grammar')) {
                return "📚 **NGỮ PHÁP TRỌNG TÂM UNIT 2: SO SÁNH HƠN CỦA TRẠNG TỪ (Comparative forms of Adverbs)**\\n\\n1️⃣ **Trạng từ ngắn (1 âm tiết):** Adv + **-er** + than\\n- fast ➔ **faster**\\n- hard ➔ **harder**\\n- early ➔ **earlier**\\n\\n2️⃣ **Trạng từ dài (đuôi -ly):** **more** + Adv + than\\n- slowly ➔ **more slowly**\\n- quickly ➔ **more quickly**\\n- carefully ➔ **more carefully**\\n\\n3️⃣ **Bất quy tắc:**\\n- well ➔ **better**\\n- badly ➔ **worse**\\n- far ➔ **farther/further**";
            }

            if (q.includes('từ vựng') || q.includes('vocab') || q.includes('combine harvester') || q.includes('paddy field') || q.includes('herd') || q.includes('plough')) {
                return "🌾 **TỪ VỰNG THEN CHỐT UNIT 2:**\\n\\n1. **combine harvester**: máy gặt đập liên hợp\\n2. **paddy field**: cánh đồng lúa\\n3. **herd buffaloes**: chăn trâu\\n4. **harvest time**: mùa gặt\\n5. **load onto**: chất hàng lên xe\\n6. **dry / drying**: phơi khô lúa\\n7. **plough / ploughing**: cày ruộng\\n8. **bamboo dancing**: nhảy sạp\\n9. **peaceful**: thanh bình\\n10. **healthier lifestyle**: lối sống lành mạnh hơn";
            }

            if (q.includes('mẹo') || q.includes('lời khuyên') || q.includes('điểm cao') || q.includes('bí quyết')) {
                return "🎁 **BÍ QUYẾT ĐẠT ĐIỂM 10 CỦA CÔ YẾN CÒI:**\\n1. Thấy động từ hành động (*run, move, work*) ➔ chọn **Trạng từ** (more slowly, faster).\\n2. Nhớ cụm từ: *combine harvester, herd buffaloes, paddy field, bamboo dancing*.\\n3. Ôn kỹ 10 câu trắc nghiệm này để làm quen cấu trúc đề thi giữa kì nhé!";
            }

            if (q.includes('cảm ơn') || q.includes('thank') || q.includes('yêu cô')) {
                return "Yêu các trò nhiều lắm nè! 🥰 Học chăm chỉ để giành điểm 10 tặng cô và bố mẹ nhé! Fighting! 💪✨";
            }

            return "Cô **Miss Yến còi** đây rồi! 👩‍🏫 Em có thể hỏi cô về:\\n- 📖 Giải thích chi tiết từ câu 1 đến câu 10\\n- 📚 Ngữ pháp so sánh hơn của trạng từ (*more slowly, faster*)\\n- 🌾 Từ vựng Unit 2 (*combine harvester, paddy field, herd buffaloes*)\\n- 🎯 Mẹo làm bài thi đạt điểm cao!\\nEm muốn hỏi phần nào cứ gõ hoặc bấm Micro nha! ❤️";
        }

        function toggleChatbot() {
            playSound('click');
            const win = document.getElementById('chatbot-window');
            win.classList.toggle('hidden');
            if (!win.classList.contains('hidden')) {
                document.getElementById('chat-text-input').focus();
            }
        }

        let currentAudioPlayer = null;
        let audioPlayQueue = [];
        let isAudioPlaying = false;
        let onAudioFinishedCallback = null;

        function stopSpeech() {
            audioPlayQueue = [];
            isAudioPlaying = false;
            if ('speechSynthesis' in window) {
                try { window.speechSynthesis.cancel(); } catch(e) {}
            }
            if (currentAudioPlayer) {
                try { 
                    currentAudioPlayer.pause(); 
                    currentAudioPlayer.currentTime = 0; 
                    currentAudioPlayer.onended = null;
                    currentAudioPlayer.onerror = null;
                } catch(e) {}
                currentAudioPlayer = null;
            }
            if (onAudioFinishedCallback) {
                const cb = onAudioFinishedCallback;
                onAudioFinishedCallback = null;
                cb();
            }
            const dot = document.getElementById('voice-indicator-dot');
            const text = document.getElementById('voice-indicator-text');
            if (dot) dot.className = "w-2 h-2 rounded-full bg-emerald-400";
            if (text) text.innerText = "Giọng Nữ MC Hà Nội (to tròn, giòn, nẩy)";
        }

        function toggleTtsSpeech() {
            playSound('click');
            isTtsEnabled = !isTtsEnabled;
            const btn = document.getElementById('btn-tts-toggle');
            if (isTtsEnabled) {
                btn.classList.remove('text-slate-600');
                btn.classList.add('text-amber-300');
                btn.title = "Giọng đọc: BẬT";
            } else {
                btn.classList.remove('text-amber-300');
                btn.classList.add('text-slate-600');
                btn.title = "Giọng đọc: TẮT";
                stopSpeech();
            }
        }

        function getVerifiedFemaleHanoiVoice() {
            if (!('speechSynthesis' in window)) return null;
            const voices = window.speechSynthesis.getVoices();
            if (!voices || voices.length === 0) return null;

            const viVoices = voices.filter(function(v) {
                const lang = (v.lang || '').toLowerCase();
                const name = (v.name || '').toLowerCase();
                return lang.startsWith('vi') || lang.includes('vi-vn') || lang.includes('vi_vn') || name.includes('vietnam') || name.includes('tiếng việt');
            });

            // Danh sách từ khóa giọng NAM gây rè: TUYỆT ĐỐI CẤM
            const maleKeywords = /\b(an|nam|hung|hùng|duc|đức|minh|quân|trung|hoàng|male|man|boy|trai|desktop|sapi)\b/i;
            // Danh sách giọng NỮ MC HÀ NỘI đã kiểm định
            const topFemaleKeywords = /hoaimy|hoài my|google tiếng việt|google việt|siri.*vi|apple.*linh|linh.*vietnam/i;

            for (var i = 0; i < viVoices.length; i++) {
                var voice = viVoices[i];
                var lowerName = (voice.name || '').toLowerCase();
                var lowerUri = (voice.voiceURI || '').toLowerCase();
                if (maleKeywords.test(lowerName) || maleKeywords.test(lowerUri)) {
                    continue;
                }
                if (topFemaleKeywords.test(lowerName) || topFemaleKeywords.test(lowerUri)) {
                    return voice;
                }
            }

            return null;
        }

        var VI_DIACRITICS = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
        var KNOWN_EN_WORDS = {
            'unit':1,'global':1,'success':1,'life':1,'in':1,'the':1,'countryside':1,
            'combine':1,'harvester':1,'harvest':1,'paddy':1,'field':1,'herd':1,'cattle':1,'buffalo':1,'buffaloes':1,
            'vast':1,'generous':1,'hospitable':1,'peaceful':1,'peacefully':1,'quiet':1,'quietly':1,'noisy':1,'noisily':1,
            'fast':1,'faster':1,'slow':1,'slowly':1,'more':1,'than':1,'most':1,'well':1,'better':1,'bad':1,'badly':1,'worse':1,
            'careful':1,'carefully':1,'easy':1,'easily':1,'early':1,'earlier':1,'late':1,'later':1,'hard':1,'harder':1,
            'fly':1,'kite':1,'folk':1,'game':1,'games':1,'nomad':1,'nomadic':1,'pasture':1,'canal':1,'orchard':1,'village':1,
            'villager':1,'villagers':1,'convenient':1,'inconvenient':1,'scenic':1,'nature':1,'fresh':1,'air':1,
            'good':1,'job':1,'hello':1,'hi':1,'yes':1,'no':1,'ok':1,'listen':1,'notice':1,'remember':1,'repeat':1,'practice':1,
            'answer':1,'question':1,'comparative':1,'adverb':1,'adverbs':1,'example':1,'key':1,'english':1,'grammar':1,
            'driving':1,'drives':1,'running':1,'runs':1,'speaks':1,'walks':1,'work':1,'works':1
        };

        function isEnglishWord(word) {
            var clean = (word || '').toLowerCase().replace(/[^a-z]/g, '');
            if (!clean || VI_DIACRITICS.test(word)) return false;
            if (/[fjwz]/.test(clean)) return true;
            if (/(ly|tion|ing|ed|er|est|ment|able|ive|ness|less|ful)$/.test(clean)) return true;
            return !!KNOWN_EN_WORDS[clean];
        }

        function cleanVietnameseText(raw) {
            if (!raw) return '';
            return raw
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/[*_#~>]/g, '')
                .replace(/\bGV\b/gi, 'Giáo viên')
                .replace(/\bTHCS\b/gi, 'Trung học cơ sở')
                .replace(/\bUnit\b/gi, 'Bài học')
                .replace(/\bvd:\b/gi, 'ví dụ:')
                .replace(/\bvd\b/gi, 'ví dụ')
                .replace(/\beg\b/gi, 'ví dụ')
                .replace(/\betc\b/gi, 'vân vân')
                .replace(/\bvs\b/gi, 'với')
                .replace(/\bko\b/gi, 'không')
                .replace(/\bdc\b/gi, 'được')
                .replace(/\bsp\b/gi, 'sản phẩm')
                .replace(/\bQ(\d+)\b/gi, 'Câu $1')
                .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function cleanEnglishText(raw) {
            if (!raw) return '';
            return raw
                .replace(/["'*]/g, '')
                .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function segmentBilingualText(text) {
            if (!text) return [];
            var quotePattern = /"([^"]+)"|'([^']+)'|\*([^*]+)\*/g;
            var rawParts = [];
            var last = 0;
            var match;

            while ((match = quotePattern.exec(text)) !== null) {
                var pre = text.slice(last, match.index).trim();
                if (pre) rawParts.push({ text: pre, quoted: false });
                var q = (match[1] || match[2] || match[3] || '').trim();
                if (q) rawParts.push({ text: q, quoted: true });
                last = quotePattern.lastIndex;
            }
            var rem = text.slice(last).trim();
            if (rem) rawParts.push({ text: rem, quoted: false });

            if (rawParts.length === 0) rawParts.push({ text: text.trim(), quoted: false });

            var candidateChunks = [];

            for (var p = 0; p < rawParts.length; p++) {
                var part = rawParts[p];
                if (part.quoted) {
                    if (!VI_DIACRITICS.test(part.text)) {
                        var words = part.text.split(/\s+/).filter(Boolean);
                        var enCount = 0;
                        for (var w = 0; w < words.length; w++) {
                            if (isEnglishWord(words[w])) enCount++;
                        }
                        if (enCount > 0 || words.length <= 4) {
                            var clEn = cleanEnglishText(part.text);
                            if (clEn) candidateChunks.push({ text: clEn, lang: 'en-GB' });
                            continue;
                        }
                    }
                    var clVi = cleanVietnameseText(part.text);
                    if (clVi) candidateChunks.push({ text: clVi, lang: 'vi' });
                    continue;
                }

                if (!VI_DIACRITICS.test(part.text)) {
                    var uWords = part.text.split(/\s+/).filter(Boolean);
                    var uEnCount = 0;
                    for (var uw = 0; uw < uWords.length; uw++) {
                        if (isEnglishWord(uWords[uw])) uEnCount++;
                    }
                    if (uWords.length > 0 && (uEnCount / uWords.length >= 0.4)) {
                        var clUEn = cleanEnglishText(part.text);
                        if (clUEn) candidateChunks.push({ text: clUEn, lang: 'en-GB' });
                        continue;
                    }
                }

                var splitWords = part.text.split(/(\s+)/);
                var curText = '';
                var curLang = 'vi';

                for (var sw = 0; sw < splitWords.length; sw++) {
                    var wordToken = splitWords[sw];
                    if (/^\s+$/.test(wordToken)) {
                        curText += wordToken;
                        continue;
                    }
                    var isEn = isEnglishWord(wordToken);
                    var wordLang = isEn ? 'en-GB' : 'vi';

                    if (wordLang !== curLang) {
                        if (curText.trim()) {
                            var clPart = curLang === 'en-GB' ? cleanEnglishText(curText) : cleanVietnameseText(curText);
                            if (clPart) candidateChunks.push({ text: clPart, lang: curLang });
                        }
                        curText = wordToken;
                        curLang = wordLang;
                    } else {
                        curText += wordToken;
                    }
                }
                if (curText.trim()) {
                    var clRem = curLang === 'en-GB' ? cleanEnglishText(curText) : cleanVietnameseText(curText);
                    if (clRem) candidateChunks.push({ text: clRem, lang: curLang });
                }
            }

            var merged = [];
            for (var m = 0; m < candidateChunks.length; m++) {
                var chunk = candidateChunks[m];
                if (!chunk.text) continue;
                if (merged.length > 0 && merged[merged.length - 1].lang === chunk.lang) {
                    merged[merged.length - 1].text += ' ' + chunk.text;
                } else {
                    merged.push({ text: chunk.text, lang: chunk.lang });
                }
            }

            var finalChunks = [];
            for (var f = 0; f < merged.length; f++) {
                var item = merged[f];
                if (item.text.length <= 140) {
                    finalChunks.push(item);
                } else {
                    var subSentences = item.text.split(/(?<=[.!?;,])\s+/);
                    var curSub = '';
                    for (var s = 0; s < subSentences.length; s++) {
                        var sent = subSentences[s];
                        if ((curSub + ' ' + sent).trim().length <= 140) {
                            curSub = (curSub + ' ' + sent).trim();
                        } else {
                            if (curSub) finalChunks.push({ text: curSub, lang: item.lang });
                            curSub = sent;
                        }
                    }
                    if (curSub) finalChunks.push({ text: curSub, lang: item.lang });
                }
            }

            return finalChunks;
        }

        var nextAudioPreloaded = null;

        function playGoogleAudioQueue(chunks, onDone) {
            if (!chunks || chunks.length === 0) {
                if (onDone) onDone();
                return;
            }

            audioPlayQueue = chunks.slice();
            isAudioPlaying = true;
            onAudioFinishedCallback = onDone || null;

            function preloadNext() {
                if (audioPlayQueue.length > 0) {
                    var nextItem = audioPlayQueue[0];
                    var tl = nextItem.lang || 'vi';
                    var nUrl = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=' + encodeURIComponent(tl) + '&q=' + encodeURIComponent(nextItem.text);
                    var pre = new Audio(nUrl);
                    pre.preload = 'auto';
                    pre.volume = 1.0;
                    nextAudioPreloaded = pre;
                } else {
                    nextAudioPreloaded = null;
                }
            }

            function playNext() {
                if (!isAudioPlaying || audioPlayQueue.length === 0) {
                    isAudioPlaying = false;
                    var cb = onAudioFinishedCallback;
                    onAudioFinishedCallback = null;
                    if (cb) cb();
                    return;
                }

                var chunk = audioPlayQueue.shift();
                var tl = chunk.lang || 'vi';
                var url = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=' + encodeURIComponent(tl) + '&q=' + encodeURIComponent(chunk.text);
                var audio = nextAudioPreloaded || new Audio(url);
                nextAudioPreloaded = null;
                audio.volume = 1.0;
                currentAudioPlayer = audio;

                audio.onended = function() {
                    currentAudioPlayer = null;
                    playNext();
                };

                audio.onerror = function() {
                    currentAudioPlayer = null;
                    playNext();
                };

                preloadNext();

                audio.play().catch(function() {
                    currentAudioPlayer = null;
                    playNext();
                });
            }

            playNext();
        }

        function speakText(text) {
            if (!isTtsEnabled) return;
            var chunks = segmentBilingualText(text);
            if (!chunks || chunks.length === 0) return;

            stopSpeech();

            var dot = document.getElementById('voice-indicator-dot');
            var indicatorText = document.getElementById('voice-indicator-text');
            if (dot) dot.className = "w-2 h-2 rounded-full bg-pink-400 animate-ping";
            if (indicatorText) indicatorText.innerText = "Cô Yến đang nói...";

            var onDone = function() {
                if (dot) dot.className = "w-2 h-2 rounded-full bg-emerald-400";
                if (indicatorText) indicatorText.innerText = "Nữ MC Hà Nội + Chuẩn Anh - Anh (British)";
            };

            // MẶC ĐỊNH & ƯU TIÊN SỐ 1: Luồng âm thanh song ngữ thông minh (Hanoi Female MC + British English BBC)
            playGoogleAudioQueue(chunks, onDone);
        }

        function testFemaleHanoiVoice() {
            playSound('click');
            speakText("Hello students! Cô là Miss Yến còi. Hôm nay chúng ta cùng học 'Life in the countryside' nhé! Trong bài này các em nhớ từ 'combine harvester' và trạng từ so sánh hơn 'more slowly' nha!");
        }

        function clearChatHistory() {
            playSound('click');
            chatHistory = [];
            const msgBox = document.getElementById('chat-messages');
            msgBox.innerHTML = \`
                <div class="flex items-start gap-2">
                    <img src="https://i.ibb.co/JwJRM4ZZ/image.jpg" onerror="this.onerror=null; this.src='https://placehold.co/80/ec4899/ffffff?text=Yen';" class="w-7 h-7 rounded-full border border-amber-400 object-cover mt-1 shrink-0">
                    <div class="chat-bubble-bot p-3 shadow-md max-w-[85%]">
                        <p class="font-bold text-amber-300 mb-1">Hello các trò yêu! 👋</p>
                        <p>Cô trò mình làm mới cuộc trò chuyện nhé! Em cần cô **Miss Yến còi** giúp đỡ gì thêm về Tiếng Anh 8 Unit 2 hôm nay nào?</p>
                    </div>
                </div>
            \`;
        }

        function quickAsk(text) {
            document.getElementById('chat-text-input').value = text;
            sendChatMessage();
        }

        function initSpeechRecognition() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) return null;
            
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = true;
            rec.lang = 'vi-VN';

            rec.onstart = function() {
                isRecording = true;
                document.getElementById('voice-status-bar').classList.remove('hidden');
                document.getElementById('btn-voice-input').classList.add('recording-pulse', 'border-rose-500', 'text-rose-400');
            };

            rec.onresult = function(event) {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript;
                }
                document.getElementById('chat-text-input').value = transcript;
            };

            rec.onerror = function() {
                stopVoiceRecognition();
            };

            rec.onend = function() {
                stopVoiceRecognition();
            };

            return rec;
        }

        function toggleVoiceRecognition() {
            playSound('click');
            if (!speechRecognition) speechRecognition = initSpeechRecognition();

            if (!speechRecognition) {
                alert("Trình duyệt hiện tại chưa hỗ trợ nhận diện giọng nói. Em gõ văn bản nhé!");
                return;
            }

            if (isRecording) {
                speechRecognition.stop();
            } else {
                try { speechRecognition.start(); } catch(e) {}
            }
        }

        function stopVoiceRecognition() {
            isRecording = false;
            document.getElementById('voice-status-bar').classList.add('hidden');
            const btn = document.getElementById('btn-voice-input');
            btn.classList.remove('recording-pulse', 'border-rose-500', 'text-rose-400');
            if (speechRecognition) {
                try { speechRecognition.stop(); } catch(e) {}
            }
        }

        async function sendChatMessage() {
            const inputEl = document.getElementById('chat-text-input');
            const message = inputEl.value.trim();
            if (!message) return;

            playSound('click');
            inputEl.value = '';

            appendMessage('user', message);
            chatHistory.push({ role: 'user', parts: [{ text: message }] });

            const typingId = appendTypingIndicator();

            // CHATBOT MULTI-ENGINE ARCHITECTURE:
            // 1. If running inside Google Apps Script (google.script.run exists), call Apps Script Server!
            // 2. If running with Server API (/api/chat), call server!
            // 3. If running offline or without keys, use Smart Offline AI Engine!
            
            try {
                if (typeof google !== 'undefined' && google.script && google.script.run) {
                    google.script.run
                        .withSuccessHandler(function(response) {
                            removeTypingIndicator(typingId);
                            let botReply = '';
                            if (response && response.success && response.reply) {
                                botReply = response.reply;
                            } else {
                                botReply = getOfflineTeacherReply(message);
                            }
                            appendMessage('bot', botReply);
                            chatHistory.push({ role: 'model', parts: [{ text: botReply }] });
                            speakText(botReply);
                            playSound('correct');
                        })
                        .withFailureHandler(function() {
                            removeTypingIndicator(typingId);
                            const botReply = getOfflineTeacherReply(message);
                            appendMessage('bot', botReply);
                            chatHistory.push({ role: 'model', parts: [{ text: botReply }] });
                            speakText(botReply);
                            playSound('correct');
                        })
                        .askGeminiServer(message, chatHistory, "");
                    return;
                }

                // Fallback to server API /api/chat or Smart Offline Engine
                let botReply = '';
                try {
                    const res = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: message, history: chatHistory })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.reply) {
                            botReply = data.reply;
                        }
                    }
                } catch (e) {}

                if (!botReply) {
                    botReply = getOfflineTeacherReply(message);
                }

                removeTypingIndicator(typingId);
                appendMessage('bot', botReply);
                chatHistory.push({ role: 'model', parts: [{ text: botReply }] });
                speakText(botReply);
                playSound('correct');
            } catch (err) {
                removeTypingIndicator(typingId);
                const botReply = getOfflineTeacherReply(message);
                appendMessage('bot', botReply);
                chatHistory.push({ role: 'model', parts: [{ text: botReply }] });
                speakText(botReply);
            }
        }

        function appendMessage(sender, text) {
            const msgBox = document.getElementById('chat-messages');
            const wrap = document.createElement('div');
            wrap.className = sender === 'user' ? "flex items-start justify-end gap-2" : "flex items-start gap-2";

            const formattedText = text.replace(/\\n/g, '<br>').replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');

            if (sender === 'user') {
                wrap.innerHTML = \`<div class="chat-bubble-user p-3 shadow-md max-w-[85%] text-right"><p>\${formattedText}</p></div>\`;
            } else {
                const escapedText = encodeURIComponent(text);
                wrap.innerHTML = \`
                    <img src="https://i.ibb.co/JwJRM4ZZ/image.jpg" onerror="this.onerror=null; this.src='https://placehold.co/80/ec4899/ffffff?text=Yen';" class="w-7 h-7 rounded-full border border-amber-400 object-cover mt-1 shrink-0">
                    <div class="chat-bubble-bot p-3 shadow-md max-w-[85%]">
                        <div class="flex items-center justify-between gap-2 mb-1">
                            <p class="font-bold text-amber-300 text-xs">Miss Yến còi</p>
                            <button onclick="speakText(decodeURIComponent('\${escapedText}'))" class="text-amber-300 hover:text-amber-200 text-[10px] flex items-center gap-1 font-medium transition px-1.5 py-0.5 rounded hover:bg-slate-800/80" title="Bấm để nghe cô Yến đọc bằng giọng nữ MC Hà Nội">
                                <i class="fa-solid fa-volume-high text-[9px]"></i> Nghe cô đọc
                            </button>
                        </div>
                        <div>\${formattedText}</div>
                    </div>
                \`;
            }

            msgBox.appendChild(wrap);
            msgBox.scrollTop = msgBox.scrollHeight;
        }

        function appendTypingIndicator() {
            const msgBox = document.getElementById('chat-messages');
            const id = 'typing-' + Date.now();
            const wrap = document.createElement('div');
            wrap.id = id;
            wrap.className = "flex items-start gap-2";
            wrap.innerHTML = \`
                <img src="https://i.ibb.co/JwJRM4ZZ/image.jpg" onerror="this.onerror=null; this.src='https://placehold.co/80/ec4899/ffffff?text=Yen';" class="w-7 h-7 rounded-full border border-amber-400 object-cover mt-1 shrink-0">
                <div class="chat-bubble-bot p-3 shadow-md flex items-center gap-1">
                    <span class="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></span>
                    <span class="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
            \`;
            msgBox.appendChild(wrap);
            msgBox.scrollTop = msgBox.scrollHeight;
            return id;
        }

        function removeTypingIndicator(id) {
            const el = document.getElementById(id);
            if (el) el.remove();
        }

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        function playSound(type) {
            try {
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);

                if (type === 'click') {
                    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.08);
                } else if (type === 'correct') {
                    const notes = [523.25, 659.25, 783.99, 1046.5];
                    notes.forEach((freq, idx) => {
                        const noteOsc = audioCtx.createOscillator();
                        const noteGain = audioCtx.createGain();
                        noteOsc.connect(noteGain);
                        noteGain.connect(audioCtx.destination);
                        noteOsc.type = 'triangle';
                        const start = audioCtx.currentTime + idx * 0.09;
                        noteOsc.frequency.setValueAtTime(freq, start);
                        noteGain.gain.setValueAtTime(0.18, start);
                        noteGain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
                        noteOsc.start(start);
                        noteOsc.stop(start + 0.28);
                    });
                } else if (type === 'wrong') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
                    osc.frequency.setValueAtTime(175, audioCtx.currentTime + 0.15);
                    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.35);
                } else if (type === 'fanfare') {
                    const chord = [523.25, 659.25, 783.99, 1046.5];
                    chord.forEach((f, i) => {
                        const noteOsc = audioCtx.createOscillator();
                        const noteGain = audioCtx.createGain();
                        noteOsc.connect(noteGain);
                        noteGain.connect(audioCtx.destination);
                        noteOsc.type = 'triangle';
                        const start = audioCtx.currentTime + i * 0.12;
                        noteOsc.frequency.setValueAtTime(f, start);
                        noteGain.gain.setValueAtTime(0.2, start);
                        noteGain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
                        noteOsc.start(start);
                        noteOsc.stop(start + 0.45);
                    });
                }
            } catch (e) {}
        }

        function updateStudentName(val) {
            studentName = val.trim() ? val.trim() : "Học sinh";
        }

        function saveStudentName() {
            playSound('click');
            const inputVal = document.getElementById('student-name-input').value.trim();
            if (inputVal) {
                studentName = inputVal;
                document.getElementById('current-student-name').innerText = studentName;
                document.getElementById('name-display-tag').classList.remove('hidden');
            }
        }

        function shuffleArray(array) {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function initQuiz() {
            currentQuestionIndex = 0;
            score = 0;
            userAnswers = [];
            
            quizQuestions = rawQuestions.map((q) => {
                const originalCorrectText = q.correctText;
                const shuffledOpts = shuffleArray(q.options);
                return {
                    question: q.question,
                    options: shuffledOpts,
                    correctText: originalCorrectText,
                    explanation: q.explanation,
                    vietnameseMeaning: q.vietnameseMeaning,
                    grammarFocus: q.grammarFocus
                };
            });

            document.getElementById('screen-quiz').classList.remove('hidden');
            document.getElementById('screen-result').classList.add('hidden');
            document.getElementById('modal-certificate').classList.add('hidden');
            
            renderQuestion();
        }

        function renderQuestion() {
            const q = quizQuestions[currentQuestionIndex];
            
            document.getElementById('question-tracker').innerText = \`Câu \${currentQuestionIndex + 1}/\${quizQuestions.length}\`;
            document.getElementById('q-number-badge').innerText = currentQuestionIndex + 1;
            document.getElementById('question-text').innerText = q.question;
            document.getElementById('current-score').innerText = score;
            
            const progressPercent = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
            document.getElementById('progress-bar').style.width = \`\${progressPercent}%\`;

            const fb = document.getElementById('feedback-banner');
            fb.classList.add('hidden');

            const optContainer = document.getElementById('options-container');
            optContainer.innerHTML = '';

            const prefixes = ['A', 'B', 'C', 'D'];
            const prevAnswer = userAnswers[currentQuestionIndex];

            q.options.forEach((optText, idx) => {
                const btn = document.createElement('button');
                btn.className = \`option-btn w-full text-left p-4 rounded-xl border border-slate-700 bg-slate-800/90 text-slate-100 font-medium flex items-center gap-3 transition shadow-md hover:border-indigo-400\`;
                
                let prefixBadgeClass = "bg-slate-700 text-amber-300";

                if (prevAnswer) {
                    btn.disabled = true;
                    if (optText === q.correctText) {
                        btn.classList.add('border-emerald-500', 'bg-emerald-950/60', 'text-emerald-200');
                        prefixBadgeClass = "bg-emerald-500 text-slate-950";
                    } else if (optText === prevAnswer.selectedText && !prevAnswer.isCorrect) {
                        btn.classList.add('border-rose-500', 'bg-rose-950/60', 'text-rose-200');
                        prefixBadgeClass = "bg-rose-500 text-white";
                    }
                } else {
                    btn.onclick = () => selectAnswer(optText, idx);
                }

                btn.innerHTML = \`
                    <span class="\${prefixBadgeClass} font-bold px-3 py-1 rounded-lg text-sm">\${prefixes[idx]}</span>
                    <span class="flex-grow">\${optText}</span>
                \`;
                optContainer.appendChild(btn);
            });

            const btnNext = document.getElementById('btn-next');
            if (currentQuestionIndex === quizQuestions.length - 1) {
                btnNext.innerHTML = \`Xem kết quả <i class="fa-solid fa-trophy"></i>\`;
            } else {
                btnNext.innerHTML = \`Làm tiếp <i class="fa-solid fa-arrow-right"></i>\`;
            }
        }

        function selectAnswer(selectedText, selectedIdx) {
            playSound('click');
            const q = quizQuestions[currentQuestionIndex];
            const isCorrect = (selectedText === q.correctText);

            if (isCorrect) {
                score++;
                playSound('correct');
                triggerHeartBurst();
            } else {
                playSound('wrong');
            }

            userAnswers[currentQuestionIndex] = {
                questionIndex: currentQuestionIndex,
                selectedText: selectedText,
                correctText: q.correctText,
                isCorrect: isCorrect
            };

            const fb = document.getElementById('feedback-banner');
            const fbIcon = document.getElementById('feedback-icon');
            const fbText = document.getElementById('feedback-text');

            fb.classList.remove('hidden', 'bg-emerald-950/80', 'text-emerald-300', 'border-emerald-500', 'bg-rose-950/80', 'text-rose-300', 'border-rose-500');

            if (isCorrect) {
                fb.classList.add('bg-emerald-950/80', 'text-emerald-300', 'border', 'border-emerald-500');
                fbIcon.className = "fa-solid fa-circle-check text-emerald-400 mr-2";
                fbText.innerText = "Chính xác! Xuất sắc lắm em!";
            } else {
                fb.classList.add('bg-rose-950/80', 'text-rose-300', 'border', 'border-rose-500');
                fbIcon.className = "fa-solid fa-circle-xmark text-rose-400 mr-2";
                fbText.innerText = \`Chưa đúng! Đáp án đúng là: \${q.correctText}\`;
            }

            renderQuestion();

            setTimeout(() => {
                if (currentQuestionIndex < quizQuestions.length - 1) {
                    currentQuestionIndex++;
                    renderQuestion();
                } else {
                    submitQuiz();
                }
            }, 1200);
        }

        function nextQuestion() {
            playSound('click');
            if (currentQuestionIndex < quizQuestions.length - 1) {
                currentQuestionIndex++;
                renderQuestion();
            } else {
                submitQuiz();
            }
        }

        function resetQuiz() {
            playSound('click');
            initQuiz();
        }

        function submitQuiz() {
            playSound('fanfare');
            document.getElementById('screen-quiz').classList.add('hidden');
            document.getElementById('screen-result').classList.remove('hidden');

            document.getElementById('res-student-name').innerText = studentName;
            document.getElementById('final-score').innerText = score;

            const praiseBox = document.getElementById('praise-message');
            let praiseText = "";

            if (score === 10) {
                praiseText = "🌟 XUẤT SẮC TUYỆT ĐỐI! Em là một học sinh xuất sắc! Hãy luôn giữ vững phong độ đỉnh cao này nhé!";
                triggerConfetti();
                triggerFlowers();
            } else if (score >= 8) {
                praiseText = "🎉 RẤT GIỎI! Em đã nắm rất vững kiến thức Unit 2 (Life in the countryside). Chúc mừng thành tích tuyệt vời!";
                triggerConfetti();
            } else if (score >= 6) {
                praiseText = "👍 KHÁ TỐT! Em đã hiểu bài khá rõ. Hãy ôn lại một vài từ vựng chưa đúng để đạt điểm cao hơn nhé!";
            } else {
                praiseText = "📚 CỐ GẮNG LÊN EM NHÉ! Hãy nhấn nút 'Xem đáp án chi tiết' bên dưới để xem lời giải và làm lại bài nhé!";
            }

            praiseBox.innerText = praiseText;
        }

        function generateCertificate() {
            playSound('fanfare');
            triggerConfetti();

            document.getElementById('cert-student-name').innerText = studentName;
            document.getElementById('cert-score').innerText = score;

            let certPraiseText = "";
            if (score === 10) {
                certPraiseText = '"Thành tích Đạt điểm Tuyệt đối 10/10 - Tư duy Tiếng Anh Xuất Sắc"';
            } else if (score >= 8) {
                certPraiseText = '"Thành tích Học tập Học sinh Giỏi - Kiến thức Vững Vàng"';
            } else if (score >= 6) {
                certPraiseText = '"Thành tích Tốt - Chăm chỉ và Tiến bộ vượt bậc"';
            } else {
                certPraiseText = '"Nỗ lực Hoàn thành bài ôn tập - Tăng cường rèn luyện"';
            }

            document.getElementById('cert-praise').innerText = certPraiseText;
            document.getElementById('modal-certificate').classList.remove('hidden');
        }

        function closeCertificate() {
            playSound('click');
            document.getElementById('modal-certificate').classList.add('hidden');
        }

        function showAnswerGuideModal() {
            playSound('click');
            const listContainer = document.getElementById('answer-guide-list');
            listContainer.innerHTML = '';

            quizQuestions.forEach((q, idx) => {
                const userAns = userAnswers[idx];
                const isUserCorrect = userAns ? userAns.isCorrect : false;

                const card = document.createElement('div');
                card.className = \`p-4 rounded-xl border \${isUserCorrect ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-rose-500/50 bg-rose-950/20'} space-y-2\`;

                card.innerHTML = \`
                    <div class="font-bold text-amber-300 flex items-center justify-between">
                        <span>Câu \${idx + 1}: \${q.question}</span>
                        <span class="text-xs px-2 py-0.5 rounded \${isUserCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}">
                            \${isUserCorrect ? 'Đúng' : 'Chưa đúng'}
                        </span>
                    </div>
                    <div class="text-xs text-slate-300">
                        <p>👉 Đáp án đúng: <strong class="text-emerald-400">\${q.correctText}</strong></p>
                        \${userAns ? \`<p>👉 Lựa chọn của em: <span class="\${isUserCorrect ? 'text-emerald-400' : 'text-rose-400'}">\${userAns.selectedText}</span></p>\` : ''}
                    </div>
                    <div class="text-xs italic text-cyan-300 bg-slate-800/80 p-2 rounded border border-slate-700">
                        💡 Hướng dẫn giải: \${q.explanation}
                    </div>
                \`;
                listContainer.appendChild(card);
            });

            document.getElementById('modal-answer-guide').classList.remove('hidden');
        }

        function closeAnswerGuideModal() {
            playSound('click');
            document.getElementById('modal-answer-guide').classList.add('hidden');
        }

        const canvas = document.getElementById('fx-canvas');
        const ctx = canvas.getContext('2d');
        let particles = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor(type, startX, startY) {
                this.type = type;
                this.x = startX !== undefined ? startX : Math.random() * canvas.width;
                this.y = startY !== undefined ? startY : (type === 'heart' ? canvas.height * 0.7 : -15);
                this.size = Math.random() * 8 + 6;
                
                if (type === 'confetti') {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 6 + 2;
                    this.vx = Math.cos(angle) * speed;
                    this.vy = Math.sin(angle) * speed - 3;
                    this.gravity = 0.15;
                    this.drag = 0.98;
                } else if (type === 'heart') {
                    this.vx = (Math.random() - 0.5) * 2;
                    this.vy = -(Math.random() * 2 + 1.5);
                    this.gravity = -0.02;
                    this.drag = 0.99;
                } else if (type === 'flower') {
                    this.vx = (Math.random() - 0.5) * 1.5;
                    this.vy = Math.random() * 1.5 + 1;
                    this.gravity = 0.03;
                    this.drag = 0.99;
                }

                this.rotation = Math.random() * 360;
                this.rotSpeed = (Math.random() - 0.5) * 6;
                this.opacity = 1;
                this.life = 0;
                this.maxLife = Math.random() * 70 + 60;

                const colors = ['#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#facc15'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
            }

            update() {
                this.life++;
                this.x += this.vx;
                this.y += this.vy;
                if (this.gravity) this.vy += this.gravity;
                if (this.drag) {
                    this.vx *= this.drag;
                    this.vy *= this.drag;
                }
                this.rotation += this.rotSpeed;
                const remaining = this.maxLife - this.life;
                if (remaining < 30) {
                    this.opacity = Math.max(0, remaining / 30);
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate((this.rotation * Math.PI) / 180);
                ctx.globalAlpha = Math.max(0, this.opacity);

                if (this.type === 'confetti') {
                    ctx.fillStyle = this.color;
                    if (this.shape === 'rect') {
                        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
                    } else {
                        ctx.beginPath();
                        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else if (this.type === 'heart') {
                    ctx.font = \`\${this.size * 1.3}px sans-serif\`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('❤️', 0, 0);
                } else if (this.type === 'flower') {
                    ctx.font = \`\${this.size * 1.3}px sans-serif\`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🌸', 0, 0);
                }

                ctx.restore();
            }
        }

        function triggerConfetti() {
            const originX = canvas.width / 2;
            const originY = canvas.height * 0.35;
            for (let i = 0; i < 35; i++) {
                particles.push(new Particle('confetti', originX, originY));
            }
            capParticles();
        }

        function triggerFlowers() {
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
                particles.push(new Particle('flower', x, -20));
            }
            capParticles();
        }

        function triggerHeartBurst() {
            const originX = canvas.width / 2;
            const originY = canvas.height * 0.6;
            for (let i = 0; i < 12; i++) {
                particles.push(new Particle('heart', originX + (Math.random() - 0.5) * 120, originY));
            }
            capParticles();
        }

        function capParticles() {
            if (particles.length > 70) {
                particles = particles.slice(particles.length - 70);
            }
        }

        function renderParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.update();
                p.draw();
                if (p.life >= p.maxLife || p.opacity <= 0 || p.y > canvas.height + 40) {
                    particles.splice(i, 1);
                }
            }
            requestAnimationFrame(renderParticles);
        }

        window.onload = function () {
            initQuiz();
            renderParticles();
            if ('speechSynthesis' in window) {
                window.speechSynthesis.getVoices();
                window.speechSynthesis.onvoiceschanged = function() {
                    window.speechSynthesis.getVoices();
                };
            }
        };
    </script>
</body>
</html>`;
}

export async function downloadAppsScriptZip(): Promise<void> {
  const zip = new JSZip();

  // Add Code.gs
  zip.file('Code.gs', CODE_GS_CONTENT);

  // Add Index.html
  zip.file('Index.html', generateStandaloneIndexHtml());

  // Add Guide
  zip.file('HUONG_DAN_APPS_SCRIPT.md', GUIDE_APPS_SCRIPT_MD);

  // Add Readme
  const readmeContent = `TRỌN BỘ MÃ NGUỒN GAME TIẾNG ANH 8 - UNIT 2 (GLOBAL SUCCESS)
Trường THCS Tân Dĩnh - Giáo viên: Hoàng Hải Yến
=====================================================

Tệp đính kèm:
1. Index.html: Giao diện Web App trọn gói, đã tích hợp Chatbot Miss Yến còi với cơ chế đa luồng:
   - Chạy trực tiếp trong Google Apps Script (google.script.run)
   - Chạy trên máy tính cá nhân bằng cách mở trực tiếp trong trình duyệt
   - Tích hợp bộ não AI Offline thông minh giải đáp toàn bộ 10 câu, từ vựng, ngữ pháp so sánh hơn của trạng từ!
2. Code.gs: Mã nguồn chạy phía máy chủ Google Apps Script.
3. HUONG_DAN_APPS_SCRIPT.md: Hướng dẫn chi tiết 5 bước đưa lên Web App để chia sẻ cho học sinh.

Chúc cô và các em học sinh có những tiết học bổ ích và thú vị!`;
  zip.file('README.txt', readmeContent);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Game-Tieng-Anh-8-Unit-2-Apps-Script.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadSingleFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
