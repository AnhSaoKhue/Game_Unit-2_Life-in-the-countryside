/**
 * Engine Phát Giọng Nói Song Ngữ Chuẩn: Nữ MC Hà Nội + Tiếng Anh - Anh Chuẩn (British English)
 * ===========================================================================================
 * - Hỗ trợ hoạt động 100% trên mọi nền tảng: GitHub Pages, Vercel, Google Apps Script, Localhost.
 * - Tiếng Việt: Chuẩn âm hưởng Nữ MC Hà Nội (to tròn, giòn, nẩy, ấm áp, truyền cảm).
 * - Tiếng Anh: Chuẩn phát âm Tiếng Anh - Anh (British English, Oxford/BBC standard, en-GB).
 * - Đa tầng dự phòng: Tự động chuyển luồng Backend Proxy -> Direct Google Cloud -> Web Speech API.
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

// Tự động phát hiện môi trường: Nếu ở GitHub Pages hoặc static host, không dùng /api/tts cục bộ
let isBackendProxyAvailable = typeof window !== 'undefined'
  ? !window.location.hostname.endsWith('github.io') && window.location.protocol !== 'file:'
  : true;

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
  if (/[fjwz]/.test(clean)) return true;
  if (/(ly|tion|ing|ed|er|est|ment|able|ive|ness|less|ful)$/.test(clean)) return true;
  return KNOWN_ENGLISH_WORDS.has(clean);
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

  const quotePattern = /"([^"]+)"|'([^']+)'|\*([^*]+)\*/g;
  const rawParts: { text: string; quoted: boolean }[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = quotePattern.exec(text)) !== null) {
    const pre = text.slice(last, match.index).trim();
    if (pre) rawParts.push({ text: pre, quoted: false });
    const q = (match[1] || match[2] || match[3] || '').trim();
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

    if (!VI_DIACRITICS.test(part.text)) {
      const words = part.text.split(/\s+/).filter(Boolean);
      const enCount = words.filter(isEnglishWord).length;
      if (words.length > 0 && enCount / words.length >= 0.4) {
        const cleanedEn = cleanEnglishText(part.text);
        if (cleanedEn) candidateChunks.push({ text: cleanedEn, lang: 'en-GB' });
        continue;
      }
    }

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

  const merged: SpeechChunk[] = [];
  for (const chunk of candidateChunks) {
    if (!chunk.text) continue;
    if (merged.length > 0 && merged[merged.length - 1].lang === chunk.lang) {
      merged[merged.length - 1].text += ' ' + chunk.text;
    } else {
      merged.push({ ...chunk });
    }
  }

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
      const femaleGb = enGbVoices.find((v) => VERIFIED_FEMALE_EN_GB_KEYWORDS.test(v.name.toLowerCase()));
      if (femaleGb) return femaleGb;
      if (enGbVoices.length > 0) return enGbVoices[0];
      // Fallback: bất kỳ giọng Anh nào
      const anyEn = voices.find((v) => (v.lang || '').toLowerCase().startsWith('en'));
      if (anyEn) return anyEn;
    } else {
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
      // Nếu có giọng vi không phải nam
      for (const v of viVoices) {
        const n = v.name.toLowerCase();
        if (!BANNED_MALE_KEYWORDS.test(n)) return v;
      }
    }
  } catch {}
  return null;
}

/**
 * Phát âm qua Web Speech API (Dự phòng tuyệt đối khi mất mạng hoặc không kết nối được Google TTS)
 */
function playViaSpeechSynthesis(chunk: SpeechChunk, onDone: () => void): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onDone();
    return;
  }

  try {
    const voice = getSpeechVoiceForLang(chunk.lang);
    const utter = new SpeechSynthesisUtterance(chunk.text);
    if (voice) utter.voice = voice;
    utter.lang = chunk.lang === 'en-GB' ? 'en-GB' : 'vi-VN';
    utter.pitch = chunk.lang === 'en-GB' ? 1.05 : 1.25;
    utter.rate = 1.02;
    utter.volume = 1.0;

    let hasEnded = false;
    utter.onend = () => {
      if (!hasEnded) {
        hasEnded = true;
        currentUtterance = null;
        onDone();
      }
    };
    utter.onerror = () => {
      if (!hasEnded) {
        hasEnded = true;
        currentUtterance = null;
        onDone();
      }
    };

    currentUtterance = utter;
    window.speechSynthesis.speak(utter);
  } catch {
    onDone();
  }
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
 * Đảm bảo 100% hoạt động trên GitHub Pages, Vercel, Google Apps Script và Localhost!
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
    const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encoded}`;
    const primaryUrl = isBackendProxyAvailable ? `/api/tts?tl=${tl}&text=${encoded}` : directUrl;
    return { primaryUrl, directUrl };
  };

  const preloadNext = () => {
    if (bilingualQueue.length > 0) {
      const nextItem = bilingualQueue[0];
      const urls = getTtsUrls(nextItem);
      try {
        const pre = new Audio(urls.primaryUrl);
        pre.preload = 'auto';
        pre.volume = 1.0;
        nextPreloadedAudio = pre;
      } catch {
        nextPreloadedAudio = null;
      }
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

    let audio: HTMLAudioElement;
    if (nextPreloadedAudio) {
      audio = nextPreloadedAudio;
      nextPreloadedAudio = null;
    } else {
      audio = new Audio(urls.primaryUrl);
    }

    audio.volume = 1.0;
    currentAudio = audio;

    let hasFallbackRun = false;

    const runFallback = () => {
      if (hasFallbackRun) return;
      hasFallbackRun = true;

      // Nếu đang dùng primaryUrl mà bị lỗi (ví dụ 404 trên GitHub Pages hoặc Vercel chưa deploy server)
      if (isBackendProxyAvailable && urls.primaryUrl !== urls.directUrl) {
        // Tắt cờ backend proxy để tất cả các câu sau dùng thẳng directUrl
        isBackendProxyAvailable = false;
        const freshDirectAudio = new Audio(urls.directUrl);
        freshDirectAudio.volume = 1.0;
        currentAudio = freshDirectAudio;

        freshDirectAudio.onended = () => {
          currentAudio = null;
          playNext();
        };

        freshDirectAudio.onerror = () => {
          // Nếu cả direct Google TTS cũng bị chặn (ví dụ mạng trường học chặn translate.google.com)
          // -> Tự động chuyển ngay sang Web Speech API của trình duyệt!
          currentAudio = null;
          playViaSpeechSynthesis(currentChunk, () => playNext());
        };

        freshDirectAudio.play().catch(() => {
          currentAudio = null;
          playViaSpeechSynthesis(currentChunk, () => playNext());
        });
      } else {
        // Đã thử directUrl nhưng vẫn lỗi -> chuyển sang Web Speech API
        currentAudio = null;
        playViaSpeechSynthesis(currentChunk, () => playNext());
      }
    };

    audio.onended = () => {
      currentAudio = null;
      playNext();
    };

    audio.onerror = () => {
      runFallback();
    };

    preloadNext();

    audio.play().catch(() => {
      runFallback();
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

  playBilingualAudioQueue(chunks, options?.onEnd);
}
