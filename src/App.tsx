import { useState, useEffect, useRef } from 'react';
import { RAW_QUESTIONS, QuizQuestion } from './data/quizData';
import { playSoundEffect } from './utils/audioSynth';
import { CertificateModal } from './components/CertificateModal';
import { AnswerGuideModal } from './components/AnswerGuideModal';
import { ExportModal } from './components/ExportModal';
import { ChatbotWidget } from './components/ChatbotWidget';

interface UserAnswer {
  questionIndex: number;
  selectedText: string;
  correctText: string;
  isCorrect: boolean;
}

interface Particle {
  type: 'confetti' | 'heart' | 'flower';
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'rect' | 'circle';
  rotation: number;
  rotSpeed: number;
  opacity: number;
  life: number;
  maxLife: number;
  gravity: number;
  drag: number;
}

export default function App() {
  const [studentName, setStudentName] = useState<string>('Học sinh');
  const [tempName, setTempName] = useState<string>('');
  const [isNameSaved, setIsNameSaved] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<{ show: boolean; isCorrect: boolean; text: string }>({
    show: false,
    isCorrect: false,
    text: '',
  });

  // Modals state
  const [isCertOpen, setIsCertOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Particle Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize Quiz
  const initQuiz = () => {
    const shuffledQuestions: QuizQuestion[] = RAW_QUESTIONS.map((q, idx) => {
      // Shuffle options
      const opts = [...q.options];
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      return {
        id: idx + 1,
        question: q.question,
        options: opts,
        correctText: q.correctText,
        explanation: q.explanation,
        vietnameseMeaning: q.vietnameseMeaning,
        grammarFocus: q.grammarFocus,
      };
    });

    setQuestions(shuffledQuestions);
    setCurrentIdx(0);
    setScore(0);
    setUserAnswers([]);
    setIsSubmitted(false);
    setFeedback({ show: false, isCorrect: false, text: '' });
  };

  useEffect(() => {
    initQuiz();

    // Secret creator shortcut (Ctrl + Shift + S) to open export modal without exposing UI button
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setIsExportOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Particle Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const list = particlesRef.current;

      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.rotation += p.rotSpeed;

        const remaining = p.maxLife - p.life;
        if (remaining < 30) {
          p.opacity = Math.max(0, remaining / 30);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);

        if (p.type === 'confetti') {
          ctx.fillStyle = p.color;
          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (p.type === 'heart') {
          ctx.font = `${p.size * 1.3}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('❤️', 0, 0);
        } else if (p.type === 'flower') {
          ctx.font = `${p.size * 1.3}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🌸', 0, 0);
        }

        ctx.restore();

        if (p.life >= p.maxLife || p.opacity <= 0 || p.y > canvas.height + 40) {
          list.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const triggerParticles = (type: 'confetti' | 'heart' | 'flower', count = 25) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const colors = ['#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#facc15'];

    for (let i = 0; i < count; i++) {
      let startX = canvas.width / 2;
      let startY = canvas.height * 0.4;
      let vx = (Math.random() - 0.5) * 6;
      let vy = -Math.random() * 5 - 2;
      let gravity = 0.15;
      let drag = 0.98;

      if (type === 'heart') {
        startX = canvas.width / 2 + (Math.random() - 0.5) * 160;
        startY = canvas.height * 0.6;
        vx = (Math.random() - 0.5) * 2.5;
        vy = -Math.random() * 3 - 1.5;
        gravity = -0.02;
        drag = 0.99;
      } else if (type === 'flower') {
        startX = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
        startY = -20;
        vx = (Math.random() - 0.5) * 2;
        vy = Math.random() * 2 + 1;
        gravity = 0.03;
        drag = 0.99;
      }

      particlesRef.current.push({
        type,
        x: startX,
        y: startY,
        vx,
        vy,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 6,
        opacity: 1,
        life: 0,
        maxLife: Math.random() * 70 + 60,
        gravity,
        drag,
      });
    }

    if (particlesRef.current.length > 90) {
      particlesRef.current = particlesRef.current.slice(particlesRef.current.length - 90);
    }
  };

  const handleSaveStudentName = () => {
    playSoundEffect('click', soundEnabled);
    if (tempName.trim()) {
      setStudentName(tempName.trim());
      setIsNameSaved(true);
    }
  };

  const handleSelectOption = (optText: string) => {
    if (userAnswers[currentIdx]) return; // Already answered
    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    const isCorrect = optText === currentQ.correctText;
    const newAnswer: UserAnswer = {
      questionIndex: currentIdx,
      selectedText: optText,
      correctText: currentQ.correctText,
      isCorrect,
    };

    const nextAnswers = [...userAnswers];
    nextAnswers[currentIdx] = newAnswer;
    setUserAnswers(nextAnswers);

    if (isCorrect) {
      setScore((s) => s + 1);
      playSoundEffect('correct', soundEnabled);
      triggerParticles('heart', 15);
      setFeedback({
        show: true,
        isCorrect: true,
        text: 'Chính xác! Xuất sắc lắm em! 🎉',
      });
    } else {
      playSoundEffect('wrong', soundEnabled);
      setFeedback({
        show: true,
        isCorrect: false,
        text: `Chưa đúng! Đáp án đúng là: "${currentQ.correctText}"`,
      });
    }

    // Auto advance after 1.2s
    setTimeout(() => {
      setFeedback((f) => ({ ...f, show: false }));
      if (currentIdx < questions.length - 1) {
        setCurrentIdx((i) => i + 1);
      } else {
        handleSubmitQuiz();
      }
    }, 1300);
  };

  const handleNextQuestion = () => {
    playSoundEffect('click', soundEnabled);
    setFeedback((f) => ({ ...f, show: false }));
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = () => {
    playSoundEffect('fanfare', soundEnabled);
    setIsSubmitted(true);
    triggerParticles('confetti', 40);
    triggerParticles('flower', 25);
  };

  const currentQ = questions[currentIdx];
  const progressPercent = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;
  const currentAnswer = userAnswers[currentIdx];

  const getPraiseText = () => {
    if (score === 10) return '🌟 XUẤT SẮC TUYỆT ĐỐI! Em là học sinh xuất sắc! Nắm chắc 100% kiến thức Unit 2!';
    if (score >= 8) return '🎉 RẤT GIỎI! Em hiểu bài rất sâu và làm bài rất tự tin. Chúc mừng em!';
    if (score >= 6) return '👍 KHÁ TỐT! Em đã nắm được kiến thức căn bản. Hãy xem lại lời giải các câu chưa đúng nhé!';
    return '📚 CỐ GẮNG LÊN EM NHÉ! Hãy nhấn nút "Xem đáp án chi tiết" để học lại ngữ pháp & từ vựng nha!';
  };

  return (
    <div className="flex flex-col min-h-screen justify-between relative overflow-x-hidden text-slate-100">
      {/* Visual Canvas Effects Layer */}
      <canvas id="fx-canvas" ref={canvasRef} className="fixed inset-0 pointer-events-none z-50"></canvas>

      {/* Top Running Announcement Banner */}
      <div className="marquee-container text-white py-2 shadow-lg font-bold text-xs sm:text-sm md:text-base tracking-wide z-20">
        <div className="marquee-text flex items-center gap-4">
          <span>🌟 Chúc các em làm bài tốt nhất - Anh Sao Khue - Hotline: 0346513056 🌟</span>
          <span className="mx-6">|</span>
          <span>📚 Tiếng Anh 8 (Global Success) - Unit 2: Life in the countryside 📚</span>
          <span className="mx-6">|</span>
          <span>🏫 Trường THCS Tân Dĩnh - Giáo viên: Hoàng Hải Yến 🏫</span>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-5xl flex-grow flex flex-col justify-center items-center z-10 w-full">
        
        {/* Glassmorphism Main Card */}
        <div className="glass-card w-full rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl relative border border-slate-700/70 overflow-hidden">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-700/80 pb-5 mb-5 gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
              <div className="relative group shrink-0">
                <img
                  src="https://i.ibb.co/JwJRM4ZZ/image.jpg"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute(
                      'src',
                      'https://placehold.co/180x100/1e293b/38bdf8?text=English+8+Global+Success'
                    );
                  }}
                  alt="Tiếng Anh 8 Global Success"
                  className="h-16 sm:h-20 w-auto object-cover rounded-xl border-2 border-amber-400/80 shadow-md group-hover:scale-105 transition duration-300"
                />
              </div>
              <div>
                <span className="bg-amber-500/20 text-amber-300 text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-amber-500/30">
                  Unit 2: Life in the countryside
                </span>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-pink-400 mt-1">
                  GAME ÔN TẬP BÀI HỌC
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Trường THCS Tân Dĩnh • GV: Hoàng Hải Yến
                </p>
              </div>
            </div>

            {/* Student Name Box & Toolbar */}
            <div className="flex flex-col items-end w-full md:w-auto gap-2">
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                {/* Sound toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                    soundEnabled
                      ? 'bg-slate-800 text-amber-300 border-slate-600'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                  title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                >
                  <i className={`fa-solid ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
                  <span>{soundEnabled ? 'Bật âm' : 'Tắt âm'}</span>
                </button>
              </div>

              {/* Student Name Input */}
              <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 pl-3 rounded-full border border-slate-600 w-full md:w-auto">
                <i className="fa-solid fa-user-graduate text-amber-400 text-xs"></i>
                <input
                  type="text"
                  placeholder="Nhập tên học sinh..."
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveStudentName();
                  }}
                  className="bg-transparent text-white font-semibold focus:outline-none w-32 sm:w-44 text-xs"
                />
                <button
                  onClick={handleSaveStudentName}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold px-3 py-1 rounded-full text-xs hover:brightness-110 transition shadow"
                >
                  Lưu tên
                </button>
              </div>

              {isNameSaved && (
                <span className="text-xs text-amber-300 font-semibold">
                  <i className="fa-solid fa-check-circle mr-1"></i> Học sinh: {studentName}
                </span>
              )}
            </div>
          </div>

          {/* SCREEN 1: QUIZ */}
          {!isSubmitted && currentQ && (
            <div className="space-y-5">
              {/* Progress & Live Score Bar */}
              <div className="flex items-center justify-between text-xs sm:text-sm bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold whitespace-nowrap">
                    Câu {currentIdx + 1}/{questions.length}
                  </span>
                  <div className="w-24 sm:w-44 bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-pink-500 h-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-indigo-500/20 text-indigo-300 font-bold px-2.5 sm:px-3 py-1 rounded-lg border border-indigo-500/30 text-xs sm:text-sm">
                    <i className="fa-solid fa-star text-yellow-400 mr-1"></i> Điểm: {score}/{questions.length}
                  </span>
                </div>
              </div>

              {/* Question Box */}
              <div className="bg-slate-800/80 p-5 sm:p-6 rounded-2xl border border-indigo-500/30 shadow-inner relative">
                <span className="absolute -top-3 left-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow">
                  CÂU HỎI {currentIdx + 1}
                </span>
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-100 mt-2 leading-relaxed">
                  {currentQ.question}
                </h2>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {currentQ.options.map((optText, idx) => {
                  const prefixes = ['A', 'B', 'C', 'D'];
                  let optStyle = 'border-slate-700 bg-slate-800/90 text-slate-100 hover:border-indigo-400';
                  let prefixBadgeClass = 'bg-slate-700 text-amber-300';

                  if (currentAnswer) {
                    if (optText === currentQ.correctText) {
                      optStyle = 'border-emerald-500 bg-emerald-950/70 text-emerald-200';
                      prefixBadgeClass = 'bg-emerald-500 text-slate-950 font-black';
                    } else if (optText === currentAnswer.selectedText && !currentAnswer.isCorrect) {
                      optStyle = 'border-rose-500 bg-rose-950/70 text-rose-200';
                      prefixBadgeClass = 'bg-rose-500 text-white font-black';
                    } else {
                      optStyle = 'border-slate-800 bg-slate-900/50 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(optText)}
                      disabled={!!currentAnswer}
                      className={`option-btn w-full text-left p-3.5 sm:p-4 rounded-xl border font-medium flex items-center gap-3 transition shadow-md ${optStyle}`}
                    >
                      <span className={`${prefixBadgeClass} font-bold px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm shrink-0`}>
                        {prefixes[idx]}
                      </span>
                      <span className="flex-grow text-xs sm:text-sm">{optText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Instant Feedback Banner */}
              {feedback.show && (
                <div
                  className={`min-h-[44px] rounded-xl flex items-center px-4 font-bold text-xs sm:text-sm transition-all duration-300 border ${
                    feedback.isCorrect
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500'
                  }`}
                >
                  <i
                    className={`mr-2 text-base fa-solid ${
                      feedback.isCorrect ? 'fa-circle-check text-emerald-400' : 'fa-circle-xmark text-rose-400'
                    }`}
                  ></i>
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={initQuiz}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition"
                  >
                    <i className="fa-solid fa-rotate-left text-amber-400"></i> Làm lại
                  </button>
                  <button
                    onClick={() => setIsGuideOpen(true)}
                    className="bg-cyan-600/80 hover:bg-cyan-500 text-white font-semibold px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition"
                  >
                    <i className="fa-solid fa-lightbulb text-yellow-300"></i> Xem hướng dẫn đáp án
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNextQuestion}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg transition"
                  >
                    {currentIdx === questions.length - 1 ? (
                      <>
                        Xem kết quả <i className="fa-solid fa-trophy text-yellow-300"></i>
                      </>
                    ) : (
                      <>
                        Làm tiếp <i className="fa-solid fa-arrow-right"></i>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold px-5 py-2 rounded-xl text-xs sm:text-sm shadow-lg flex items-center gap-1.5 transition"
                  >
                    <i className="fa-solid fa-paper-plane"></i> Nộp bài
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: RESULTS */}
          {isSubmitted && (
            <div className="space-y-6 text-center py-4">
              <div className="inline-block p-4 bg-amber-500/10 rounded-full border border-amber-500/30">
                <i className="fa-solid fa-trophy text-5xl text-amber-400 animate-bounce"></i>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                KẾT QUẢ BÀI ÔN TẬP
              </h2>

              <p className="text-slate-300 text-base sm:text-lg">
                Chúc mừng học sinh:{' '}
                <span className="font-bold text-amber-300 text-lg sm:text-xl">
                  {studentName}
                </span>
              </p>

              {/* Final Score Card */}
              <div className="max-w-md mx-auto glass-card p-5 sm:p-6 rounded-2xl border-2 border-amber-400/60 shadow-xl">
                <div className="text-xs sm:text-sm text-slate-400 uppercase font-bold tracking-wider">
                  Tổng điểm đạt được
                </div>
                <div className="text-4xl sm:text-5xl font-black text-amber-400 my-2">
                  <span>{score}</span>{' '}
                  <span className="text-xl sm:text-2xl text-slate-400">/ {questions.length} điểm</span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-emerald-300 bg-emerald-950/50 p-3 rounded-xl border border-emerald-500/30 mt-3">
                  {getPraiseText()}
                </div>
              </div>

              {/* Result Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
                <button
                  onClick={initQuiz}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md text-xs sm:text-sm"
                >
                  <i className="fa-solid fa-rotate-left"></i> Làm lại từ đầu
                </button>
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md text-xs sm:text-sm"
                >
                  <i className="fa-solid fa-book-open"></i> Xem đáp án chi tiết
                </button>
                <button
                  onClick={() => setIsCertOpen(true)}
                  className="btn-glow bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-extrabold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 transition text-xs sm:text-base shadow-xl"
                >
                  <i className="fa-solid fa-award text-yellow-300 text-lg sm:text-xl"></i> VINH DANH HỌC SINH
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-[11px] sm:text-xs text-slate-400 bg-slate-950/70 z-10 border-t border-slate-800/50">
        <p>Hệ thống Game Học tập Tiếng Anh 8 • Unit 2: Life in the countryside • Trường THCS Tân Dĩnh</p>
      </footer>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        studentName={studentName}
        score={score}
        totalQuestions={questions.length}
      />

      {/* Answer Guide Modal */}
      <AnswerGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        questions={questions}
        userAnswers={userAnswers}
      />

      {/* Google Apps Script Exporter Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Floating Chatbot Widget "Miss Yến còi" */}
      <ChatbotWidget soundEnabled={soundEnabled} />
    </div>
  );
}
