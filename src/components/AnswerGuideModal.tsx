import React from 'react';
import { QuizQuestion } from '../data/quizData';

interface UserAnswer {
  questionIndex: number;
  selectedText: string;
  correctText: string;
  isCorrect: boolean;
}

interface AnswerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  userAnswers: UserAnswer[];
}

export const AnswerGuideModal: React.FC<AnswerGuideModalProps> = ({
  isOpen,
  onClose,
  questions,
  userAnswers,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-slate-900 text-slate-100 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/90 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <i className="fa-solid fa-book-open"></i>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-amber-300">
                HƯỚNG DẪN ĐÁP ÁN & GIẢI THÍCH CHI TIẾT
              </h3>
              <p className="text-xs text-slate-400">
                Unit 2: Life in the countryside • Tiếng Anh 8 Global Success
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1 transition"
          >
            ✕
          </button>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {questions.map((q, idx) => {
            const userAns = userAnswers[idx];
            const hasAnswered = !!userAns;
            const isCorrect = userAns ? userAns.isCorrect : false;

            return (
              <div
                key={q.id || idx}
                className={`p-4 rounded-xl border space-y-2.5 transition ${
                  hasAnswered
                    ? isCorrect
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-rose-500/40 bg-rose-950/20'
                    : 'border-slate-700 bg-slate-800/40'
                }`}
              >
                <div className="font-bold text-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-amber-300 text-sm">
                    Câu {idx + 1}: {q.question}
                  </span>
                  {hasAnswered && (
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        isCorrect
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {isCorrect ? '✓ Chính xác' : '✗ Chưa đúng'}
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-slate-300">
                    <span className="font-semibold text-slate-400">👉 Dịch nghĩa:</span>{' '}
                    <span className="italic">{q.vietnameseMeaning}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-400">👉 Đáp án đúng:</span>{' '}
                    <strong className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      {q.correctText}
                    </strong>
                  </p>
                  {hasAnswered && (
                    <p>
                      <span className="font-semibold text-slate-400">👉 Lựa chọn của em:</span>{' '}
                      <span
                        className={`font-semibold ${
                          isCorrect ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {userAns.selectedText}
                      </span>
                    </p>
                  )}
                </div>

                <div className="text-xs text-cyan-200 bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                  <p>
                    💡 <strong className="text-amber-300">Lời giải của cô Yến:</strong> {q.explanation}
                  </p>
                  <p className="text-indigo-300">
                    📌 <strong className="text-amber-200">Trọng tâm:</strong> {q.grammarFocus}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 rounded-xl text-xs sm:text-sm transition"
          >
            Đã hiểu, đóng lại
          </button>
        </div>

      </div>
    </div>
  );
};
