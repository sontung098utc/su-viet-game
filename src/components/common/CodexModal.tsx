import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { HISTORICAL_FACTS_CH1 } from '../../data/chapter1';
import { HISTORICAL_SOURCES } from '../../data/sources';
import { X, Book, CheckCircle2, AlertTriangle, Sparkles, ExternalLink, HelpCircle } from 'lucide-react';
import type { ContentClassification } from '../../types';

export const CodexModal: React.FC = () => {
  const { isCodexOpen, closeCodex, selectedFactId, progress } = useGame();
  const [activeFilter, setActiveFilter] = useState<'ALL' | ContentClassification>('ALL');
  const [activeFactId, setActiveFactId] = useState<string>(
    selectedFactId || HISTORICAL_FACTS_CH1[0].id
  );

  useEffect(() => {
    if (selectedFactId) {
      setActiveFactId(selectedFactId);
    }
  }, [selectedFactId]);

  if (!isCodexOpen) return null;

  const filteredFacts = HISTORICAL_FACTS_CH1.filter((fact) => {
    if (activeFilter === 'ALL') return true;
    return fact.classification === activeFilter;
  });

  const currentFact =
    HISTORICAL_FACTS_CH1.find((f) => f.id === activeFactId) || HISTORICAL_FACTS_CH1[0];
  const isUnlocked = progress.discoveredFacts.includes(currentFact.id);
  const sourcesForFact = HISTORICAL_SOURCES.filter((s) =>
    currentFact.sourceIds.includes(s.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-lacquer-dark/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-parchment-50 w-full max-w-4xl max-h-[90vh] rounded-2xl border-4 border-bronze shadow-2xl flex flex-col overflow-hidden text-lacquer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-parchment-200 border-b border-parchment-300 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Book className="w-5 h-5 text-crimson" />
            <div>
              <h2 className="font-title text-lg sm:text-xl font-bold text-lacquer">
                Sổ Tay Sử Việt & Thẩm Định Nguồn Sử Liệu
              </h2>
              <p className="text-xs text-lacquer/70">
                Phân định rõ: Dữ kiện có nguồn • Mô phỏng giản lược • Hư cấu nhập vai
              </p>
            </div>
          </div>
          <button
            onClick={closeCodex}
            className="p-1.5 rounded-full hover:bg-parchment-300 text-lacquer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bộ lọc phân loại */}
        <div className="bg-parchment-100 border-b border-parchment-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-lacquer-light text-[11px] mr-1">Lọc theo loại:</span>
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              activeFilter === 'ALL'
                ? 'bg-lacquer text-parchment-50 shadow-sm'
                : 'bg-parchment-200 text-lacquer hover:bg-parchment-300'
            }`}
          >
            Tất cả ({HISTORICAL_FACTS_CH1.length})
          </button>
          <button
            onClick={() => setActiveFilter('HISTORICAL_FACT')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
              activeFilter === 'HISTORICAL_FACT'
                ? 'bg-emerald-800 text-emerald-50 shadow-sm'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Dữ kiện lịch sử có nguồn
          </button>
          <button
            onClick={() => setActiveFilter('INTERPRETATION')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
              activeFilter === 'INTERPRETATION'
                ? 'bg-amber-800 text-amber-50 shadow-sm'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Diễn giải & Thẩm định khảo cổ
          </button>
          <button
            onClick={() => setActiveFilter('FICTION')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
              activeFilter === 'FICTION'
                ? 'bg-blue-800 text-blue-50 shadow-sm'
                : 'bg-blue-100 text-blue-900 border border-blue-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Hư cấu & Dựng cảnh game
          </button>
        </div>

        {/* Nội dung 2 cột */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 overflow-hidden">
          <div className="md:col-span-5 border-r border-parchment-300 p-3 sm:p-4 overflow-y-auto space-y-2 bg-parchment-100/60 max-h-[32vh] md:max-h-none">
            {filteredFacts.map((fact) => {
              const unlocked = progress.discoveredFacts.includes(fact.id);
              const isSelected = fact.id === currentFact.id;

              return (
                <div
                  key={fact.id}
                  onClick={() => setActiveFactId(fact.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-parchment-50 border-bronze shadow-md ring-2 ring-bronze/40'
                      : 'bg-parchment-100/80 border-parchment-300 hover:bg-parchment-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        fact.classification === 'HISTORICAL_FACT'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : fact.classification === 'INTERPRETATION'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {fact.classification === 'HISTORICAL_FACT' && 'Dữ kiện có nguồn'}
                      {fact.classification === 'INTERPRETATION' && 'Lưu ý thẩm định'}
                      {fact.classification === 'FICTION' && 'Hư cấu / Mô phỏng'}
                    </span>
                    {unlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <HelpCircle className="w-3.5 h-3.5 text-lacquer/40" />
                    )}
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-lacquer line-clamp-2">
                    {fact.title}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="md:col-span-7 p-4 sm:p-6 overflow-y-auto space-y-4 bg-parchment-50">
            {isUnlocked ? (
              <>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-serif italic text-crimson font-semibold">
                      {currentFact.era}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium border ${
                        currentFact.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : currentFact.verificationStatus === 'PENDING_VERIFICATION'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-blue-100 text-blue-900 border-blue-300'
                      }`}
                    >
                      {currentFact.verificationStatus === 'VERIFIED' &&
                        '✓ Đã xác minh từ chính sử'}
                      {currentFact.verificationStatus === 'PENDING_VERIFICATION' &&
                        '⚠ Đang tiếp tục nghiên cứu khảo cứu'}
                      {currentFact.verificationStatus === 'GAMEPLAY_MECHANIC' &&
                        'ℹ Quy ước hư cấu / Mô phỏng giản lược'}
                    </span>
                  </div>
                  <h3 className="font-title text-lg sm:text-xl font-bold text-lacquer leading-snug">
                    {currentFact.title}
                  </h3>
                </div>

                <div className="p-3 rounded-xl bg-parchment-200/70 border-l-4 border-bronze text-xs sm:text-sm text-lacquer font-serif italic">
                  “{currentFact.summary}”
                </div>

                <div className="text-xs sm:text-sm text-lacquer-light leading-relaxed whitespace-pre-line">
                  {currentFact.detailedContent}
                </div>

                <div className="p-3 rounded-lg bg-parchment-100 border border-parchment-300 text-xs text-lacquer">
                  <strong>Ghi chú thẩm định nguồn: </strong>
                  {currentFact.sourceNotes}
                </div>

                {currentFact.keyTakeaway && (
                  <div className="p-3 rounded-lg bg-bronze/10 border border-bronze/30 text-xs text-lacquer flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-bronze-dark">Điểm ghi nhớ: </strong>
                      {currentFact.keyTakeaway}
                    </div>
                  </div>
                )}

                {/* Chi tiết nguồn hỗ trợ */}
                <div className="pt-3 border-t border-parchment-300">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-lacquer/70 mb-2">
                    Tài liệu & Ấn bản đối chiếu:
                  </h4>
                  <div className="space-y-2.5">
                    {sourcesForFact.map((source) => (
                      <div
                        key={source.id}
                        className="p-3 rounded-lg bg-parchment-100 border border-parchment-300 text-xs space-y-1"
                      >
                        <div className="font-bold text-lacquer flex items-center justify-between gap-2">
                          <span>{source.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-crimson/10 text-crimson font-semibold shrink-0">
                            {source.isPrimary ? 'Chính sử' : 'Khảo cổ / Nghiên cứu'}
                          </span>
                        </div>
                        <div className="text-lacquer/80">{source.authorOrInstitution}</div>
                        <div className="text-lacquer/65 text-[11px] italic">{source.details}</div>
                        <div className="p-2 rounded bg-parchment-50 border border-parchment-200 text-[11px] text-lacquer">
                          <strong>Nội dung được nguồn hỗ trợ: </strong>
                          {source.supportedClaims}
                        </div>
                        {source.url && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-river-600 hover:underline font-medium pt-0.5"
                          >
                            Tra cứu thông tin thư mục <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-lacquer/70">
                <div className="w-14 h-14 rounded-full bg-parchment-200 border-2 border-dashed border-parchment-400 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-7 h-7 text-bronze-dark" />
                </div>
                <h4 className="font-title text-lg font-bold text-lacquer mb-1">
                  Trải Nghiệm Để Mở Khóa Mục Này
                </h4>
                <p className="text-xs max-w-sm mb-4 leading-relaxed">
                  Mục kiến thức này sẽ tự động mở khóa khi bạn gặp gỡ các nhân vật và thực hiện công việc tại Làng Ven Sông, Khu Chuẩn Bị hoặc Bến Quan Sát.
                </p>
                <button
                  onClick={closeCodex}
                  className="px-4 py-2 rounded-lg bg-crimson text-white text-xs font-semibold shadow"
                >
                  Quay lại thế giới 2D
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
