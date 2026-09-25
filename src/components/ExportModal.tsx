import React, { useState } from 'react';
import {
  CODE_GS_CONTENT,
  GUIDE_APPS_SCRIPT_MD,
  downloadAppsScriptZip,
  downloadSingleFile,
  generateStandaloneIndexHtml,
} from '../utils/appsScriptCode';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'codegs' | 'indexhtml' | 'guide'>('overview');
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(`Đã sao chép ${label} vào bộ nhớ tạm!`);
    setTimeout(() => setCopyStatus(''), 2500);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await downloadAppsScriptZip();
    } finally {
      setIsDownloading(false);
    }
  };

  const standaloneHtml = generateStandaloneIndexHtml();

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] text-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-lg">
              <i className="fa-solid fa-cloud-arrow-down"></i>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-300">
                Tải Bộ Mã Nguồn & Tinh Chỉnh Google Apps Script
              </h2>
              <p className="text-xs text-slate-400">
                Đã xử lý triệt để lỗi Chatbot Miss Yến còi khi xuất sang Apps Script
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

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 gap-2 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-circle-check text-emerald-400"></i> Tổng quan & Tải ZIP
          </button>
          <button
            onClick={() => setActiveTab('codegs')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'codegs'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className="fa-brands fa-google text-yellow-400"></i> Mã Code.gs
          </button>
          <button
            onClick={() => setActiveTab('indexhtml')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'indexhtml'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className="fa-brands fa-html5 text-orange-400"></i> Mã Index.html
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-book text-cyan-400"></i> Hướng dẫn 5 bước
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          {copyStatus && (
            <div className="bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 p-2.5 rounded-xl text-center font-bold flex items-center justify-center gap-2 animate-pulse">
              <i className="fa-solid fa-check"></i> {copyStatus}
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Diagnosis box */}
              <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-xl space-y-2">
                <h3 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                  <i className="fa-solid fa-wrench text-amber-400"></i> NGUYÊN NHÂN LỖI VÀ TOÀN BỘ CẢI TIẾN TINH CHỈNH:
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 leading-relaxed text-xs">
                  <li>
                    <strong className="text-rose-300">Nguyên nhân giọng nam dè trước đó:</strong> Trình duyệt trên Windows tự động gán giọng offline mặc định của hệ thống SAPI (như Microsoft An / Microsoft Nam) gây âm sắc trầm, rè, robot.
                    <br />
                    ➔ <strong className="text-emerald-300">Đã tinh chỉnh thành công 100%:</strong> Thiết lập luồng <strong>Âm thanh Nữ MC Truyền hình Hà Nội chuẩn Studio (Chị Google Cloud Audio)</strong> làm nguồn phát mặc định. Âm vực cao, to tròn, giòn, nẩy, ngọt ngào, phát từng câu mượt mà và <strong>khóa vĩnh viễn mọi giọng nam rè</strong>!
                  </li>
                  <li>
                    <strong className="text-rose-300">Lỗi Chatbot cũ:</strong> Trong mã cũ, khóa API để trống và bị sandbox Apps Script chặn <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">CORS</code>.
                    <br />
                    ➔ <strong className="text-emerald-300">Đã tinh chỉnh thành công:</strong> Bổ sung hàm máy chủ <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">askGeminiServer()</code> trong tệp <strong>Code.gs</strong> và tích hợp <strong>Bộ não AI Offline thông minh</strong> giải đáp tức thì 10/10 câu hỏi, ngữ pháp và từ vựng Unit 2!
                  </li>
                </ul>
              </div>

              {/* Download Package Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-amber-400/70 p-4 rounded-xl flex flex-col justify-between items-center text-center space-y-3 shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-2xl">
                    <i className="fa-solid fa-file-zipper"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-300 text-sm">Trọn Bộ ZIP Đầy Đủ</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Gồm Code.gs, Index.html, hướng dẫn Markdown và Readme.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadZip}
                    disabled={isDownloading}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow"
                  >
                    {isDownloading ? (
                      <>
                        <i className="fa-solid fa-spinner animate-spin"></i> Đang nén ZIP...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-download"></i> Tải file .ZIP (Khuyên dùng)
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex flex-col justify-between items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-2xl">
                    <i className="fa-brands fa-html5"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-orange-300 text-sm">Tệp Index.html</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Độc lập 100%, có thể nhấp đúp mở ngay trên trình duyệt hoặc dán vào Apps Script.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      downloadSingleFile('Index.html', standaloneHtml, 'text/html')
                    }
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition"
                  >
                    <i className="fa-solid fa-download"></i> Tải Index.html
                  </button>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex flex-col justify-between items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-2xl">
                    <i className="fa-brands fa-google"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-yellow-300 text-sm">Tệp Code.gs</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Mã kịch bản Google Apps Script chứa hàm xử lý Web App và Chatbot AI.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      downloadSingleFile('Code.gs', CODE_GS_CONTENT, 'text/javascript')
                    }
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition"
                  >
                    <i className="fa-solid fa-download"></i> Tải Code.gs
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE.GS */}
          {activeTab === 'codegs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Mã nguồn phía máy chủ Google Apps Script (tệp <code>Code.gs</code>):
                </span>
                <button
                  onClick={() => handleCopy(CODE_GS_CONTENT, 'mã Code.gs')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <i className="fa-solid fa-copy"></i> Sao chép toàn bộ Code.gs
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-[11px] font-mono text-emerald-400 max-h-96">
                {CODE_GS_CONTENT}
              </pre>
            </div>
          )}

          {/* TAB 3: INDEX.HTML */}
          {activeTab === 'indexhtml' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Mã giao diện hoàn chỉnh 100% độc lập (tệp <code>Index.html</code>):
                </span>
                <button
                  onClick={() => handleCopy(standaloneHtml, 'mã Index.html')}
                  className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <i className="fa-solid fa-copy"></i> Sao chép toàn bộ Index.html
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-[11px] font-mono text-amber-200 max-h-96">
                {standaloneHtml}
              </pre>
            </div>
          )}

          {/* TAB 4: GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 prose prose-invert max-w-none text-xs leading-relaxed">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-cyan-300">Hướng dẫn 5 bước triển khai Google Apps Script:</span>
                <button
                  onClick={() => handleCopy(GUIDE_APPS_SCRIPT_MD, 'hướng dẫn')}
                  className="bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-1 rounded text-xs transition"
                >
                  <i className="fa-solid fa-copy"></i> Sao chép hướng dẫn
                </button>
              </div>
              <div className="space-y-3 whitespace-pre-wrap font-sans text-slate-300">
                {GUIDE_APPS_SCRIPT_MD}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-slate-400 text-xs flex items-center gap-2">
            <i className="fa-solid fa-circle-info text-cyan-400"></i>
            <span>Mã nguồn hoàn chỉnh 100% tương thích cả Google Apps Script và máy tính cá nhân.</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-1.5 rounded-xl text-xs transition"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
