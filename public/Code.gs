/**
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
