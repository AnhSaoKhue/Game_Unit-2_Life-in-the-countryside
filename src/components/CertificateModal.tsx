import React from 'react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  score: number;
  totalQuestions: number;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  studentName,
  score,
  totalQuestions,
}) => {
  if (!isOpen) return null;

  let praiseTitle = 'Nỗ lực Hoàn thành bài ôn tập';
  if (score === 10) {
    praiseTitle = '"Thành tích Đạt điểm Tuyệt đối 10/10 - Tư duy Tiếng Anh Xuất Sắc"';
  } else if (score >= 8) {
    praiseTitle = '"Thành tích Học tập Học sinh Giỏi - Kiến thức Vững Vàng"';
  } else if (score >= 6) {
    praiseTitle = '"Thành tích Tốt - Chăm chỉ và Tiến bộ vượt bậc"';
  }

  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg font-bold text-base sm:text-lg z-20 transition"
          title="Đóng"
        >
          ✕
        </button>

        {/* Certificate Frame */}
        <div className="certificate-border p-6 sm:p-10 rounded-xl shadow-2xl relative overflow-hidden text-center select-none bg-[#fffdf5]">
          {/* Header */}
          <div className="text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-widest text-slate-700">
            BỘ GIÁO DỤC VÀ ĐÀO TẠO • TRƯỜNG THCS TÂN DĨNH
          </div>
          <div className="text-[10px] sm:text-xs text-amber-800 font-semibold mb-3">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM — ĐỘC LẬP - TỰ DO - HẠNH PHÚC
          </div>

          <div className="my-3">
            <h2 className="font-certificate-title text-2xl sm:text-3xl md:text-4xl font-extrabold text-amber-800 tracking-wide">
              GIẤY VINH DANH KHEN THƯỞNG
            </h2>
            <div className="w-28 sm:w-36 h-1 bg-gradient-to-r from-amber-400 via-red-500 to-amber-400 mx-auto mt-2 rounded-full"></div>
          </div>

          <p className="text-xs sm:text-sm italic text-slate-600 mt-2">
            Trân trọng tuyên dương thành tích của học sinh:
          </p>

          {/* Student Name in Calligraphy */}
          <div className="font-signature text-3xl sm:text-4xl md:text-5xl font-bold text-rose-700 my-2 sm:my-3">
            {studentName || 'Học sinh'}
          </div>

          <p className="text-slate-800 text-xs sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Đã hoàn thành xuất sắc bài tập ôn tập trực tuyến Tiếng Anh 8 (Global Success)
            <br />
            <strong>Unit 2: Life in the countryside</strong> với kết quả ấn tượng:
          </p>

          {/* Score Badge */}
          <div className="inline-block bg-amber-100 border-2 border-amber-500 text-amber-900 font-black text-lg sm:text-xl md:text-2xl px-5 sm:px-6 py-1.5 sm:py-2 rounded-full my-3 shadow-sm">
            ĐIỂM SỐ: {score} / {totalQuestions} ĐIỂM
          </div>

          <p className="text-xs sm:text-sm italic text-emerald-800 font-semibold mb-4">
            {praiseTitle}
          </p>

          {/* Signatures and Stamp */}
          <div className="grid grid-cols-2 gap-4 items-end mt-4 text-[11px] sm:text-xs md:text-sm">
            <div className="text-left space-y-0.5">
              <p className="font-bold text-slate-700">Đơn vị khen thưởng:</p>
              <p className="text-slate-600 font-semibold">Trường THCS Tân Dĩnh</p>
              <p className="text-slate-500 text-[11px]">Môn: Tiếng Anh 8</p>
            </div>

            <div className="flex flex-col items-center justify-center relative">
              <p className="text-slate-600 italic text-[11px] sm:text-xs">
                Tân Dĩnh, ngày {day} tháng {month} năm {year}
              </p>
              <p className="font-bold text-slate-800 uppercase mt-0.5">Giáo viên bộ môn</p>

              {/* Red Seal Stamp Graphic */}
              <div className="absolute -top-3 left-1 sm:left-4 md:left-8 red-seal pointer-events-none">
                <span>TRƯỜNG THCS TÂN DĨNH</span>
                <span className="my-0.5 text-yellow-500 text-[11px]">★</span>
                <span>BẮC GIANG</span>
              </div>

              {/* Signature */}
              <div className="font-signature text-2xl sm:text-3xl text-blue-900 font-bold mt-5 sm:mt-6 z-10">
                Hoàng Hải Yến
              </div>
              <p className="font-bold text-slate-900 text-xs mt-0.5">Hoàng Hải Yến</p>
            </div>
          </div>

          {/* Print Action */}
          <div className="mt-5 pt-3 border-t border-amber-200/80 flex justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow transition"
            >
              <i className="fa-solid fa-print"></i> In Giấy Khen / Lưu PDF
            </button>
            <button
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-5 py-2 rounded-xl text-xs transition"
            >
              Đóng lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
