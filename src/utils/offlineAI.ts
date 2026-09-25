import { RAW_QUESTIONS } from '../data/quizData';

/**
 * Bộ xử lý phản hồi thông minh Offline cho "Miss Yến còi"
 * Đảm bảo khi không có mạng, không có API Key hoặc chạy trong sandbox Google Apps Script,
 * học sinh vẫn nhận được câu trả lời chính xác, ấm áp và sư phạm từ cô Yến!
 */
export function generateOfflineTeacherReply(userQuery: string): string {
  const text = userQuery.toLowerCase().trim();

  // 1. Chào hỏi & giới thiệu
  if (
    text.includes('chào') ||
    text.includes('hello') ||
    text.includes('hi cô') ||
    text.includes('cô yến ơi') ||
    text.includes('cô ơi') ||
    text.includes('miss yến')
  ) {
    return `Hello em yêu! 👋 Cô **Miss Yến còi** (THCS Tân Dĩnh) đây nè! Rất vui được đồng hành cùng em ôn tập Unit 2: *Life in the countryside*. 

Hôm nay em muốn cô giải thích câu nào trong 10 câu hỏi, hướng dẫn ngữ pháp **So sánh hơn của Trạng từ (Comparative Adverbs)** hay ôn từ vựng nông thôn nào? Cứ thoải mái hỏi cô nhé! ❤️`;
  }

  // 2. Hỏi về từng câu hỏi cụ thể (Câu 1 -> Câu 10)
  for (let i = 0; i < RAW_QUESTIONS.length; i++) {
    const qNum = i + 1;
    if (
      text.includes(`câu ${qNum}`) ||
      text.includes(`câu số ${qNum}`) ||
      text.includes(`cau ${qNum}`) ||
      text.includes(`c${qNum}`)
    ) {
      const q = RAW_QUESTIONS[i];
      return `💡 **HƯỚNG DẪN CHI TIẾT CÂU ${qNum} NÈ EM:**

📝 **Nội dung câu:** "${q.question}"
👉 **Đáp án đúng:** **${q.correctText}**
🔍 **Dịch nghĩa:** *${q.vietnameseMeaning}*
🎯 **Giải thích ngữ pháp của cô Yến:** ${q.explanation}
📌 **Điểm cần nhớ:** ${q.grammarFocus}

*Em đã hiểu rõ chưa nè? Nếu còn phân vân đáp án khác, cứ hỏi cô tiếp nhé!* ✨`;
    }
  }

  // 3. Hỏi về ngữ pháp so sánh hơn của trạng từ (Comparative Adverbs)
  if (
    text.includes('ngữ pháp') ||
    text.includes('grammar') ||
    text.includes('so sánh') ||
    text.includes('trạng từ') ||
    text.includes('comparative') ||
    text.includes('more slowly') ||
    text.includes('adverb')
  ) {
    return `📚 **BÍ KÍP NGỮ PHÁP UNIT 2 CỦA CÔ YẾN CÒI: SO SÁNH HƠN CỦA TRẠNG TỪ (Comparative forms of Adverbs)**

Trong Unit 2, chúng ta dùng trạng từ để so sánh mức độ thực hiện hành động giữa 2 đối tượng:

1️⃣ **Trạng từ ngắn (thường có 1 âm tiết, cùng dạng với tính từ):**
👉 Công thức: **Adv + -er + than**
- fast ➔ **faster** *(He runs faster than me.)*
- hard ➔ **harder** *(Farmers work harder during harvest time.)*
- early ➔ **earlier** *(People in the countryside wake up earlier than city dwellers.)*

2️⃣ **Trạng từ dài (thường kết thúc bằng đuôi -ly):**
👉 Công thức: **more + Adv + than**
- slowly ➔ **more slowly** *(Life in the countryside moves more slowly than in a city.)*
- quickly ➔ **more quickly** *(A combine harvester harvests rice more quickly.)*
- carefully ➔ **more carefully** *(She drives more carefully at night.)*

3️⃣ **Trạng từ bất quy tắc (ĐẶC BIỆT CHÚ Ý TRONG ĐỀ THI):**
- well ➔ **better**
- badly ➔ **worse**
- far ➔ **farther / further**

Em ghi nhớ các công thức này để không bị nhầm lẫn giữa tính từ và trạng từ nhé! 🌟`;
  }

  // 4. Hỏi về từ vựng Unit 2 (Life in the countryside)
  if (
    text.includes('từ vựng') ||
    text.includes('vocab') ||
    text.includes('từ mới') ||
    text.includes('combine harvester') ||
    text.includes('paddy field') ||
    text.includes('herd') ||
    text.includes('bamboo') ||
    text.includes('plough')
  ) {
    return `🌾 **TỔNG HỢP TỪ VỰNG "ĐẮT GIÁ" UNIT 2 (LIFE IN THE COUNTRYSIDE):**

1. **combine harvester** /kəmˈbaɪn ˈhɑːvɪstə/: máy gặt đập liên hợp (gặt và tuốt lúa tự động).
2. **paddy field** /ˈpædi fiːld/: cánh đồng lúa nước.
3. **herd** /hɜːd/ (v): chăn dắt (trâu bò). ➔ *herd buffaloes: chăn trâu.*
4. **plough** /plaʊ/ (v, n): cày ruộng, cái cày. ➔ *plough fields: cày ruộng.*
5. **harvest time** /ˈhɑːvɪst taɪm/: vụ mùa, thời gian gặt hái.
6. **load** /ləʊd/ (v): chất hàng lên xe ↔ **unload**: dỡ hàng xuống.
7. **dry** /draɪ/ (v): phơi khô lúa/nông sản.
8. **bamboo dancing** /bæmˈbuː ˈdɑːnsɪŋ/: múa sạp, nhảy sạp.
9. **peaceful** /ˈpiːsfl/ (adj): yên bình, thanh bình.
10. **hospitable** /hɒˈspɪtəbl/ (adj): hiếu khách, niềm nở.

Em học thuộc lòng các từ này là tự tin ẵm trọn điểm 10 trên lớp rồi đó! 💯`;
  }

  // 5. Hỏi mẹo học tập, lời khuyên
  if (
    text.includes('mẹo') ||
    text.includes('lời khuyên') ||
    text.includes('bí quyết') ||
    text.includes('điểm cao') ||
    text.includes('thi')
  ) {
    return `🎁 **BÍ QUYẾT LÀM BÀI ĐẠT ĐIỂM 10 CỦA MISS YẾN CÒI:**

1. **Đọc kỹ động từ trong câu:** Nếu câu có động từ chỉ hành động (*move, run, work, harvest*), hãy dùng **Trạng từ (Adverb)**, không được chọn tính từ nha!
2. **Nhận diện trạng từ bất quy tắc:** Gặp *good/well* phải biến thành *better*, đừng bao giờ viết *more well* nhé!
3. **Ghi nhớ cụm từ cố định (Collocations):** *herd buffaloes*, *paddy field*, *bamboo dancing*, *load onto*.
4. **Làm lại bài trắc nghiệm ít nhất 2 lần** để ghi nhớ sâu vào tiềm thức!

Chúc trò cưng của cô luôn học giỏi và tự tin bắn Tiếng Anh như gió nhé! 🚀`;
  }

  // 6. Cảm ơn & khen ngợi
  if (
    text.includes('cảm ơn') ||
    text.includes('thank') ||
    text.includes('cô dạy hay') ||
    text.includes('yêu cô')
  ) {
    return `Yêu các trò nhiều lắm nè! 🥰 Học tập cùng cô là phải vui và tràn đầy năng lượng! Đừng quên bấm **Làm lại** hoặc **Xem đáp án chi tiết** để củng cố kiến thức nhé! Fighting! 💪🔥`;
  }

  // 7. Phản hồi thông minh mặc định (giàu tính gợi mở)
  return `Cô **Miss Yến còi** nghe rõ câu hỏi của em rồi nè! 👩‍🏫

Về bài học *Unit 2: Life in the countryside*, cô gợi ý cho em những nội dung trọng tâm sau:
- 📖 **Ngữ pháp:** So sánh hơn của trạng từ ngắn (*faster, earlier*) và trạng từ dài (*more slowly, more carefully*).
- 🌾 **Từ vựng nông thôn:** *combine harvester, paddy field, herd buffaloes, ploughing, bamboo dancing*.
- 🎯 **Giải thích 10 câu hỏi:** Em có thể gõ *"Giải thích câu 1"*, *"Câu 4 chọn gì"*, v.v., cô sẽ giải đáp chi tiết từng bước cho em ngay!

Em muốn cô hỗ trợ thêm phần nào cứ nhắn cô nhé! ❤️`;
}
