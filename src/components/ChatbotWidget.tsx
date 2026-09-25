import React, { useState, useRef, useEffect } from 'react';
import { generateOfflineTeacherReply } from '../utils/offlineAI';
import { playSoundEffect } from '../utils/audioSynth';
import {
  initFemaleVoiceEngine,
  speakFemaleHanoi,
  stopSpeech,
} from '../utils/femaleVoiceSynth';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface ChatbotWidgetProps {
  soundEnabled: boolean;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ soundEnabled }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello các trò yêu! 👋 Cô là **Miss Yến còi** (THCS Tân Dĩnh) đây! Các em có thắc mắc gì về bài học *Unit 2: Life in the countryside* hay cần cô hướng dẫn ngữ pháp so sánh hơn của trạng từ, từ vựng không nè? Em có thể **nhắn tin** hoặc bấm nút **Micro 🎙️** để trò chuyện với cô nhé!',
      timestamp: 'Vừa xong',
    },
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    initFemaleVoiceEngine();
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const speakReply = (text: string) => {
    if (!isTtsEnabled) return;
    speakFemaleHanoi(text, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const handleTestVoice = () => {
    playSoundEffect('click', soundEnabled);
    speakFemaleHanoi(
      "Hello students! Cô là Miss Yến còi. Hôm nay chúng ta cùng học 'Life in the countryside' nhé! Trong bài này các em nhớ từ 'combine harvester' và trạng từ so sánh hơn 'more slowly' nha!",
      {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      }
    );
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputVal).trim();
    if (!textToSend || isLoading) return;

    playSoundEffect('click', soundEnabled);
    setInputVal('');

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let botText = '';
      // Attempt server API call first
      try {
        const historyPayload = messages.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            history: historyPayload,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.reply) {
            botText = data.reply;
          }
        }
      } catch {
        // Network or server failure, proceed to smart offline fallback
      }

      // If server didn't provide a reply, use Miss Yến còi Smart Offline Engine
      if (!botText) {
        botText = generateOfflineTeacherReply(textToSend);
      }

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakReply(botText);
      playSoundEffect('correct', soundEnabled);
    } catch {
      const fallbackText = generateOfflineTeacherReply(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      speakReply(fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    playSoundEffect('click', soundEnabled);
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Trình duyệt hiện tại chưa hỗ trợ nhận diện giọng nói. Em gõ văn bản nhé!');
      return;
    }

    if (isRecording) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'vi-VN';

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInputVal(transcript);
      };

      rec.onerror = () => {
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      speechRecognitionRef.current = rec;
      rec.start();
    } catch {
      setIsRecording(false);
    }
  };

  const clearChat = () => {
    playSoundEffect('click', soundEnabled);
    setMessages([
      {
        id: 'welcome-renewed',
        sender: 'bot',
        text: 'Cô trò mình làm mới cuộc trò chuyện nhé! Em cần cô **Miss Yến còi** giúp đỡ gì thêm về Tiếng Anh 8 Unit 2 hôm nay nào? ❤️',
        timestamp: 'Vừa xong',
      },
    ]);
  };

  const renderFormattedText = (raw: string) => {
    const parts = raw.split('\n');
    return parts.map((line, idx) => {
      // Format bold **text**
      const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <span
          key={idx}
          className="block"
          dangerouslySetInnerHTML={{ __html: boldFormatted }}
        />
      );
    });
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
      {/* Expanded Chatbot Window */}
      {isOpen && (
        <div className="mb-3 w-[92vw] sm:w-[400px] h-[520px] max-h-[82vh] glass-card rounded-2xl flex flex-col shadow-2xl border border-amber-400/50 overflow-hidden animate-in fade-in zoom-in duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-3 px-4 flex items-center justify-between border-b border-slate-700/80 shadow">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="https://i.ibb.co/JwJRM4ZZ/image.jpg"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute('src', 'https://placehold.co/100/ec4899/ffffff?text=Yen');
                  }}
                  alt="Miss Yến còi"
                  className="w-9 h-9 rounded-full border-2 border-amber-400 object-cover shadow"
                />
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 absolute bottom-0 right-0"></span>
              </div>
              <div>
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1">
                  Miss Yến còi <i className="fa-solid fa-sparkles text-xs text-yellow-300"></i>
                </h4>
                <p className="text-[11px] text-slate-300">GV Tiếng Anh • THCS Tân Dĩnh</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <button
                onClick={() => {
                  playSoundEffect('click', soundEnabled);
                  const nextState = !isTtsEnabled;
                  setIsTtsEnabled(nextState);
                  if (!nextState) {
                    stopSpeech();
                  }
                }}
                title={isTtsEnabled ? 'Tắt giọng đọc' : 'Bật giọng đọc'}
                className={`p-1.5 rounded hover:text-amber-300 transition ${
                  isTtsEnabled ? 'text-amber-300' : 'text-slate-500'
                }`}
              >
                <i className={`fa-solid ${isTtsEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
              </button>
              <button
                onClick={clearChat}
                title="Làm mới hội thoại"
                className="p-1.5 rounded hover:text-amber-300 transition"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
              <button
                onClick={() => {
                  playSoundEffect('click', soundEnabled);
                  stopSpeech();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded hover:text-white text-base font-bold transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Bilingual Voice Banner & Test Button */}
          <div className="bg-gradient-to-r from-amber-500/15 via-pink-500/15 to-indigo-500/15 px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-amber-200 truncate">
              <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-pink-400 animate-ping' : 'bg-emerald-400'}`}></span>
              <span className="font-semibold text-xs">
                {isSpeaking ? 'Cô Yến đang nói...' : 'Nữ MC Hà Nội + Chuẩn Anh - Anh (British)'}
              </span>
            </div>
            <button
              onClick={handleTestVoice}
              className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full text-[10px] font-bold transition flex items-center gap-1 shrink-0 ml-2"
              title="Nghe thử giọng Nữ MC Hà Nội & Tiếng Anh - Anh chuẩn"
            >
              <i className="fa-solid fa-play text-[8px]"></i> Thử giọng cô
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="bg-slate-950/70 p-2 overflow-x-auto flex gap-1.5 border-b border-slate-800/80 text-[11px] whitespace-nowrap scrollbar-none">
            <button
              onClick={() => handleSendMessage('Giải thích câu 4')}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded-full border border-slate-700 transition"
            >
              💡 Câu 4 ngữ pháp
            </button>
            <button
              onClick={() => handleSendMessage('Ngữ pháp so sánh trạng từ')}
              className="bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2.5 py-1 rounded-full border border-slate-700 transition"
            >
              📚 So sánh trạng từ
            </button>
            <button
              onClick={() => handleSendMessage('Tổng hợp từ vựng Unit 2')}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded-full border border-slate-700 transition"
            >
              🌾 Từ vựng nông thôn
            </button>
            <button
              onClick={() => handleSendMessage('Mẹo làm bài điểm cao')}
              className="bg-slate-800 hover:bg-slate-700 text-pink-300 px-2.5 py-1 rounded-full border border-slate-700 transition"
            >
              🎯 Bí quyết điểm 10
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 text-xs sm:text-sm">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <img
                      src="https://i.ibb.co/JwJRM4ZZ/image.jpg"
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute(
                          'src',
                          'https://placehold.co/80/ec4899/ffffff?text=Yen'
                        );
                      }}
                      alt="Miss Yến"
                      className="w-7 h-7 rounded-full border border-amber-400 object-cover mt-1 shrink-0"
                    />
                  )}
                  <div
                    className={`p-3 shadow-md max-w-[85%] leading-relaxed ${
                      isUser
                        ? 'chat-bubble-user text-right'
                        : 'chat-bubble-bot text-left space-y-1'
                    }`}
                  >
                    {!isUser && (
                      <p className="font-bold text-amber-300 text-[11px] mb-0.5">
                        Miss Yến còi
                      </p>
                    )}
                    <div className="text-slate-100">{renderFormattedText(m.text)}</div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 opacity-80">
                      <span>{m.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => speakReply(m.text)}
                          className="text-amber-300 hover:text-amber-200 font-medium flex items-center gap-1 transition px-1.5 py-0.5 rounded hover:bg-slate-800/60"
                          title="Bấm để nghe cô Yến đọc bằng giọng nữ MC Hà Nội"
                        >
                          <i className="fa-solid fa-volume-high text-[9px]"></i> Nghe cô đọc
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading / Typing indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <img
                  src="https://i.ibb.co/JwJRM4ZZ/image.jpg"
                  alt="Miss Yến"
                  className="w-7 h-7 rounded-full border border-amber-400 object-cover mt-1 shrink-0"
                />
                <div className="chat-bubble-bot p-3 shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice status bar */}
          {isRecording && (
            <div className="bg-rose-950/90 border-t border-rose-500/50 px-3 py-1.5 text-rose-200 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>Đang lắng nghe em nói qua Micro...</span>
              </span>
              <button
                onClick={toggleRecording}
                className="text-xs bg-rose-700 hover:bg-rose-600 px-2 py-0.5 rounded text-white font-bold"
              >
                Dừng
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-2.5 sm:p-3 bg-slate-900/95 border-t border-slate-700/80 flex items-center gap-2">
            <button
              onClick={toggleRecording}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition shadow shrink-0 border ${
                isRecording
                  ? 'recording-pulse border-rose-500 text-rose-400 bg-rose-950/60'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-600'
              }`}
              title="Bấm để nói giọng nói"
            >
              <i className="fa-solid fa-microphone text-sm"></i>
            </button>

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Hỏi cô Yến điều gì đó..."
              className="flex-1 bg-slate-800 text-slate-100 placeholder-slate-400 px-3 py-2 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-amber-400"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputVal.trim()}
              className="bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-50 text-slate-950 font-bold w-9 h-9 rounded-xl flex items-center justify-center hover:brightness-110 transition shadow shrink-0"
              title="Gửi câu hỏi"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          playSoundEffect('click', soundEnabled);
          setIsOpen(!isOpen);
        }}
        className="btn-glow bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-600 text-white rounded-full p-2.5 sm:p-3 shadow-2xl flex items-center gap-2.5 font-bold text-xs sm:text-sm hover:scale-105 transition border-2 border-amber-300"
      >
        <div className="relative">
          <img
            src="https://i.ibb.co/JwJRM4ZZ/image.jpg"
            onError={(e) => {
              (e.target as HTMLElement).setAttribute(
                'src',
                'https://placehold.co/80/ec4899/ffffff?text=Yen'
              );
            }}
            alt="Miss Yến còi"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white object-cover"
          />
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-900 absolute top-0 right-0"></span>
        </div>
        <span className="hidden sm:inline pr-1">Hỏi Miss Yến còi 💬</span>
      </button>
    </div>
  );
};
