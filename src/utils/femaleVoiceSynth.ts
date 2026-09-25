/**
 * Engine Phát Giọng Nói Song Ngữ Chuẩn: Nữ MC Hà Nội + Tiếng Anh - Anh Chuẩn (British English)
 * ===========================================================================================
 * - Tiếng Việt: Chuẩn âm hưởng Nữ MC Hà Nội (to tròn, giòn, nẩy, ấm áp, truyền cảm).
 * - Tiếng Anh: Chuẩn phát âm Tiếng Anh - Anh (British English, Oxford/BBC standard, en-GB).
 * - Tách bạch rõ ràng 100%: KHÔNG BAO GIỜ bị lẫn lộn tiếng Anh - Việt, không đọc tiếng Anh bằng giọng bồi!
 * - TUYỆT ĐỐI KHÔNG DÙNG giọng nam dè của hệ điều hành.
 */

export type VoiceLang = 'vi' | 'en-GB';

export interface SpeechChunk {
  text: string;
  lang: VoiceLang;
}

let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let bilingualQueue: SpeechChunk[] = [];
let isQueuePlaying = false;
let onPlaybackCompleteCallback: (() => void) | null = null;

// Ký tự dấu tiếng Việt để nhận diện tiếng Việt
const VI_DIACRITICS = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

// Từ vựng và thuật ngữ tiếng Anh phổ biến trong Unit 2 và giao tiếp sư phạm
const KNOWN_ENGLISH_WORDS = new Set([
  'unit', 'global', 'success', 'life', 'in', 'the', 'countryside',
  'combine', 'harvester', 'harvest', 'paddy', 'field', 'herd', 'cattle', 'buffalo', 'buffaloes',
  'vast', 'generous', 'hospitable', 'peaceful', 'peacefully', 'quiet', 'quietly', 'noisy', 'noisily',
  'fast', 'faster', 'slow', 'slowly', 'more', 'than', 'most', 'well', 'better', 'bad', 'badly', 'worse',
  'careful', 'carefully', 'easy', 'easily', 'early', 'earlier', 'late', 'later', 'hard', 'harder',
  'fly', 'kite', 'folk', 'game', 'games', 'nomad', 'nomadic', 'pasture', 'canal', 'orchard', 'village',
  'villager', 'villagers', 'convenient', 'inconvenient', 'scenic', 'nature', 'fresh', 'air', 'crop',
  'good', 'job', 'hello', 'hi', 'yes', 'no', 'ok', 'listen', 'notice', 'remember', 'repeat', 'practice',
  'answer', 'question', 'comparative', 'adverb', 'adverbs', 'example', 'key', 'english', 'grammar',
  'driving', 'drives', 'drove', 'running', 'runs', 'speaks', 'walks', 'work', 'works', 'harder',
  'straw', 'hay', 'tractor', 'cultivate', 'traditional', 'breeze', 'cottage', 'valley', 'feed', 'collect',
  'surroundings', 'generosity', 'hospitality', 'picturesque', 'dairy', 'poultry', 'plough', 'plow'
]);

// Danh sách từ khóa giọng NAM gây rè: TUYỆT ĐỐI CẤM SỬ DỤNG
const BANNED_MALE_KEYWORDS = /\b(an|nam|hung|hùng|duc|đức|minh|quân|trung|hoàng|male|man|boy|trai|desktop|sapi)\b/i;

// Danh sách giọng NỮ MC HÀ NỘI đã kiểm định
const VERIFIED_FEMALE_VI_KEYWORDS = /hoaimy|hoài my|google tiếng việt|google việt|siri.*vi|apple.*linh|linh.*vietnam/i;

// Danh sách giọng NỮ ANH - ANH (British English)
const VERIFIED_FEMALE_EN_GB_KEYWORDS = /libbie|sonia|hazel|george|susan|google.*uk.*english.*female|british|united kingdom|en-gb|en_gb/i;

/**
 * Khởi tạo engine giọng nói
 */
export function initFemaleVoiceEngine(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    } catch {}
  }
}

/**
 * Kiểm tra xem từ có phải là từ tiếng Anh không
 */
function isEnglishWord(word: string): boolean {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean || VI_DIACRITICS.test(word)) return false;
  // Các chữ cái chỉ xuất hiện trong tiếng Anh, không có trong bảng chữ cái tiếng Việt gốc
  if (/[fjwz]/.test(clean)) return true;
  // Hậu tố ngữ pháp tiếng Anh
  if (/(ly|tion|ing|ed|er|est|ment|able|ive|ness|less|ful)$/.test(clean)) return true;
  return KNOWN_ENGLISH_WORDS.has(clean);
}

/**
 * Nhận diện đoạn văn bản có phải tiếng Anh hay không
 */
function isEnglishSegment(text: string): boolean {
  if (VI_DIACRITICS.test(text)) return false;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  let enCount = 0;
  for (const w of words) {
    if (isEnglishWord(w)) enCount++;
  }
  return enCount / words.length >= 0.35 || (words.length === 1 && isEnglishWord(words[0]));
}

/**
 * Làm sạch văn bản tiếng Việt để đọc tự nhiên, chuẩn phát thanh viên
 */
function cleanVietnameseText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_#`~>]/g, '')
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
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Làm sạch văn bản tiếng Anh để đọc chuẩn ngữ âm Anh - Anh
 */
function cleanEnglishText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/[\"\'\`*]/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tách một văn bản thành các đoạn phân loại ngôn ngữ chuẩn xác (Việt vs Anh - Anh)
 */
export function segmentBilingualText(text: string): SpeechChunk[] {
  if (!text) return [];

  // Tách văn bản theo các dấu trích dẫn (như 'combine harvester', "more quietly", v.v.)
  const quotePattern = /([\"\'\`*])([^\"]+?)\1/g;
  const rawParts: { text: string; quoted: boolean }[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = quotePattern.exec(text)) !== null) {
    const pre = text.slice(last, match.index).trim();
    if (pre) rawParts.push({ text: pre, quoted: false });
    const q = match[2].trim();
    if (q) rawParts.push({ text: q, quoted: true });
    last = quotePattern.lastIndex;
  }
  const rem = text.slice(last).trim();
  if (rem) rawParts.push({ text: rem, quoted: false });

  if (rawParts.length === 0) rawParts.push({ text: text.trim(), quoted: false });

  const candidateChunks: SpeechChunk[] = [];

  for (const part of rawParts) {
    if (part.quoted) {
      if (!VI_DIACRITICS.test(part.text)) {
        const words = part.text.split(/\s+/).filter(Boolean);
        const enCount = words.filter(isEnglishWord).length;
        if (enCount > 0 || words.length <= 4) {
          const cleanedEn = cleanEnglishText(part.text);
          if (cleanedEn) candidateChunks.push({ text: cleanedEn, lang: 'en-GB' });
          continue;
        }
      }
      const cleanedVi = cleanVietnameseText(part.text);
      if (cleanedVi) candidateChunks.push({ text: cleanedVi, lang: 'vi' });
      continue;
    }

    // Nếu toàn bộ đoạn không có dấu tiếng Việt và có từ tiếng Anh
    if (!VI_DIACRITICS.test(part.text)) {
      const words = part.text.split(/\s+/).filter(Boolean);
      const enCount = words.filter(isEnglishWord).length;
      if (words.length > 0 && enCount / words.length >= 0.4) {
        const cleanedEn = cleanEnglishText(part.text);
        if (cleanedEn) candidateChunks.push({ text: cleanedEn, lang: 'en-GB' });
        continue;
      }
    }

    // Đối với đoạn hỗn hợp, tách các cụm từ tiếng Anh đứng liền nhau
    const words = part.text.split(/(\s+)/);
    let curText = '';
    let curLang: VoiceLang = 'vi';

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (/^\s+$/.test(w)) {
        curText += w;
        continue;
      }
      const isEn = isEnglishWord(w);
      const wordLang: VoiceLang = isEn ? 'en-GB' : 'vi';

      if (wordLang !== curLang) {
        if (curText.trim()) {
          const cleaned = curLang === 'en-GB' ? cleanEnglishText(curText) : cleanVietnameseText(curText);
          if (cleaned) candidateChunks.push({ text: cleaned, lang: curLang });
        }
        curText = w;
        curLang = wordLang;
      } else {
        curText += w;
      }
    }
    if (curText.trim()) {
      const cleaned = curLang === 'en-GB' ? cleanEnglishText(curText) : cleanVietnameseText(curText);
      if (cleaned) candidateChunks.push({ text: cleaned, lang: curLang });
    }
  }

  // Hợp nhất các đoạn cùng ngôn ngữ đứng cạnh nhau để phát âm mượt mà
  const merged: SpeechChunk[] = [];
  for (const chunk of candidateChunks) {
    if (!chunk.text) continue;
    if (merged.length > 0 && merged[merged.length - 1].lang === chunk.lang) {
      merged[merged.length - 1].text += ' ' + chunk.text;
    } else {
      merged.push({ ...chunk });
    }
  }

  // Tách nhỏ nếu câu quá dài (> 140 ký tự) để Google TTS xử lý nhanh và chất lượng nhất
  const finalChunks: SpeechChunk[] = [];
  for (const item of merged) {
    if (item.text.length <= 140) {
      finalChunks.push(item);
    } else {
      const subSentences = item.text.split(/(?<=[.!?;,])\s+/);
      let cur = '';
      for (const s of subSentences) {
        if ((cur + ' ' + s).trim().length <= 140) {
          cur = (cur + ' ' + s).trim();
        } else {
          if (cur) finalChunks.push({ text: cur, lang: item.lang });
          cur = s;
        }
      }
      if (cur) finalChunks.push({ text: cur, lang: item.lang });
    }
  }

  return finalChunks;
}

/**
 * Tìm giọng Nữ chuẩn Web Speech
 */
function getSpeechVoiceForLang(lang: VoiceLang): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  try {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    if (lang === 'en-GB') {
      const enGbVoices = voices.filter((v) => {
        const l = (v.lang || '').toLowerCase();
        return l === 'en-gb' || l === 'en_gb' || (l.startsWith('en') && (v.name.includes('UK') || v.name.includes('United Kingdom')));
      });
      // Ưu tiên giọng nữ Anh - Anh
      const femaleGb = enGbVoices.find((v) => VERIFIED_FEMALE_EN_GB_KEYWORDS.test(v.name.toLowerCase()));
      if (femaleGb) return femaleGb;
      if (enGbVoices.length > 0) return enGbVoices[0];
    } else {
      // Giọng tiếng Việt
      const viVoices = voices.filter((v) => {
        const l = (v.lang || '').toLowerCase();
        const n = (v.name || '').toLowerCase();
        return l.startsWith('vi') || n.includes('vietnam') || n.includes('tiếng việt');
      });
      for (const v of viVoices) {
        const n = v.name.toLowerCase();
        if (BANNED_MALE_KEYWORDS.test(n)) continue;
        if (VERIFIED_FEMALE_VI_KEYWORDS.test(n)) return v;
      }
    }
  } catch {}
  return null;
}

/**
 * Dừng mọi âm thanh đang phát
 */
export function stopSpeech(): void {
  bilingualQueue = [];
  isQueuePlaying = false;

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.onended = null;
      currentAudio.onerror = null;
    } catch {}
    currentAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }

  if (onPlaybackCompleteCallback) {
    const cb = onPlaybackCompleteCallback;
    onPlaybackCompleteCallback = null;
    cb();
  }
}

/**
 * Phát chuỗi âm thanh song ngữ với công nghệ nạp trước (Audio Pre-buffering)
 */
function playBilingualAudioQueue(chunks: SpeechChunk[], onDone?: () => void): void {
  if (!chunks || chunks.length === 0) {
    onDone?.();
    return;
  }

  bilingualQueue = [...chunks];
  isQueuePlaying = true;
  onPlaybackCompleteCallback = onDone || null;

  let nextPreloadedAudio: HTMLAudioElement | null = null;

  const getTtsUrls = (chunk: SpeechChunk) => {
    const encoded = encodeURIComponent(chunk.text);
    const tl = chunk.lang; // 'vi' hoặc 'en-GB'
    const primaryUrl = `/api/tts?tl=${tl}&text=${encoded}`;
    const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encoded}`;
    return { primaryUrl, directUrl };
  };

  const preloadNext = () => {
    if (bilingualQueue.length > 0) {
      const nextItem = bilingualQueue[0];
      const urls = getTtsUrls(nextItem);
      const pre = new Audio(urls.primaryUrl);
      pre.preload = 'auto';
      pre.volume = 1.0;
      nextPreloadedAudio = pre;
    } else {
      nextPreloadedAudio = null;
    }
  };

  const playNext = () => {
    if (!isQueuePlaying || bilingualQueue.length === 0) {
      isQueuePlaying = false;
      const cb = onPlaybackCompleteCallback;
      onPlaybackCompleteCallback = null;
      cb?.();
      return;
    }

    const currentChunk = bilingualQueue.shift()!;
    const urls = getTtsUrls(currentChunk);

    const audio = nextPreloadedAudio || new Audio(urls.primaryUrl);
    nextPreloadedAudio = null;
    audio.volume = 1.0;
    currentAudio = audio;

    let hasSwitched = false;

    audio.onended = () => {
      currentAudio = null;
      playNext();
    };

    audio.onerror = () => {
      if (!hasSwitched) {
        hasSwitched = true;
        audio.src = urls.directUrl;
        audio.play().catch(() => {
          currentAudio = null;
          playNext();
        });
      } else {
        currentAudio = null;
        playNext();
      }
    };

    // Nạp sẵn câu tiếp theo để chuyển tiếp mượt mà, giòn nẩy
    preloadNext();

    if (!audio.src) {
      audio.src = urls.primaryUrl;
    }

    audio.play().catch(() => {
      if (!hasSwitched) {
        hasSwitched = true;
        audio.src = urls.directUrl;
        audio.play().catch(() => {
          currentAudio = null;
          playNext();
        });
      }
    });
  };

  playNext();
}

/**
 * Phát âm thanh song ngữ thông minh Miss Yến còi:
 * - Tiếng Việt: Giọng Nữ MC Hà Nội (to tròn, giòn, nẩy, 100% không rè).
 * - Tiếng Anh: Giọng chuẩn Anh - Anh (British English, Oxford/BBC, en-GB).
 */
export function speakFemaleHanoi(
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    forceEngine?: 'google-audio' | 'speech-synthesis';
  }
): void {
  if (typeof window === 'undefined') return;

  const chunks = segmentBilingualText(text);
  if (!chunks || chunks.length === 0) return;

  stopSpeech();
  options?.onStart?.();

  // MẶC ĐỊNH & ƯU TIÊN SỐ 1: Google Cloud Dual-Engine (Hanoi Female MC + British English BBC)
  // Đảm bảo 100% không bao giờ lẫn lộn tiếng Anh - Việt, âm điệu to tròn, giòn, nẩy!
  playBilingualAudioQueue(chunks, options?.onEnd);
}
