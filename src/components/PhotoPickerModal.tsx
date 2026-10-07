import React, { useState } from "react";
import {
  X,
  Camera,
  Image as ImageIcon,
  Check,
  Search,
  CheckCircle2,
  Copy,
  Sparkles,
  ExternalLink,
  Plus,
  MapPin,
} from "lucide-react";
import { GeneratedImage } from "../types";

interface PhotoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryImages: GeneratedImage[];
  onSelectCover: (imageUrl: string, image: GeneratedImage) => void;
  onInsertMarkdown: (imageUrl: string, title: string) => void;
  activeSpotTarget?: { dayIdx: number; spotIdx: number; spotName: string } | null;
  onSelectSpot?: (dayIdx: number, spotIdx: number, imageUrl: string, image: GeneratedImage) => void;
  onNavigateToImageGenerator?: () => void;
  onShowToast: (msg: string) => void;
}

export const PhotoPickerModal: React.FC<PhotoPickerModalProps> = ({
  isOpen,
  onClose,
  galleryImages,
  onSelectCover,
  onInsertMarkdown,
  activeSpotTarget,
  onSelectSpot,
  onNavigateToImageGenerator,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(
    galleryImages.length > 0 ? galleryImages[0] : null
  );

  if (!isOpen) return null;

  const filteredImages = galleryImages.filter((img) => {
    const term = searchTerm.toLowerCase();
    return (
      img.destination.toLowerCase().includes(term) ||
      img.style.toLowerCase().includes(term) ||
      img.lighting.toLowerCase().includes(term) ||
      (img.prompt && img.prompt.toLowerCase().includes(term))
    );
  });

  const handleApplyCover = () => {
    if (!selectedImage) return;
    onSelectCover(selectedImage.imageUrl, selectedImage);
    onShowToast("🌟 선택하신 사진이 블로그 대표 커버로 지정되었습니다!");
    onClose();
  };

  const handleApplyMarkdown = () => {
    if (!selectedImage) return;
    onInsertMarkdown(selectedImage.imageUrl, selectedImage.destination);
    onShowToast("📝 마크다운 본문에 사진이 성공적으로 삽입되었습니다!");
    onClose();
  };

  const handleApplySpot = () => {
    if (!selectedImage || !activeSpotTarget || !onSelectSpot) return;
    onSelectSpot(
      activeSpotTarget.dayIdx,
      activeSpotTarget.spotIdx,
      selectedImage.imageUrl,
      selectedImage
    );
    onShowToast(`📸 '${activeSpotTarget.spotName}' 스팟에 사진이 성공적으로 적용되었습니다!`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-stone-200/90 rounded-3xl max-w-3xl w-full p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-stone-900">
                {activeSpotTarget
                  ? `[${activeSpotTarget.spotName}] 스팟 사진 선택`
                  : "AI 여행 갤러리 보관함에서 사진 선택"}
              </h2>
              <p className="text-xs text-stone-500">
                {activeSpotTarget
                  ? `선택하신 사진이 일정 코스의 '${activeSpotTarget.spotName}' 스팟과 본문에 바로 적용됩니다.`
                  : "생성해둔 고화질 여행 사진을 블로그 커버나 본문 마크다운에 바로 삽입하세요."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spot Target Callout if active */}
        {activeSpotTarget && (
          <div className="bg-orange-50/90 border border-orange-200 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-orange-950 font-bold">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
              <span>
                적용 대상: Day {activeSpotTarget.dayIdx + 1} -{" "}
                <span className="text-orange-600 font-extrabold">
                  {activeSpotTarget.spotName}
                </span>
              </span>
            </div>
            <span className="text-[11px] text-orange-700 bg-white px-2 py-0.5 rounded-lg border border-orange-200 font-semibold">
              스팟 매핑 모드
            </span>
          </div>
        )}

        {/* Search & Actions Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="여행지, 스타일, 조명 검색..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>

          {onNavigateToImageGenerator && (
            <button
              type="button"
              onClick={() => {
                onNavigateToImageGenerator();
                onClose();
              }}
              className="bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>새 AI 사진 생성</span>
            </button>
          )}
        </div>

        {/* Image Grid Gallery */}
        <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[380px] pr-1">
          {filteredImages.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-stone-50 rounded-2xl border border-stone-200/80">
              <Camera className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs font-bold text-stone-600">
                {searchTerm ? "검색 조건에 맞는 사진이 없습니다." : "보관된 AI 여행 사진이 없습니다."}
              </p>
              {onNavigateToImageGenerator && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateToImageGenerator();
                    onClose();
                  }}
                  className="inline-flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>지금 AI 여행 사진 생성하러 가기</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredImages.map((img) => {
                const isSelected = selectedImage?.id === img.id;
                return (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-orange-500 ring-2 ring-orange-500 shadow-md scale-[1.01]"
                        : "border-stone-200 hover:border-stone-400 bg-stone-50"
                    }`}
                  >
                    <div className="relative aspect-video bg-stone-100 overflow-hidden">
                      <img
                        src={img.imageUrl}
                        alt={img.destination}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white p-1 rounded-full shadow">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {img.linkedBlogTitle && (
                        <div className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md truncate max-w-[90%]">
                          🔗 {img.linkedBlogTitle}
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 space-y-1 bg-white">
                      <p className="text-[11px] font-bold text-stone-900 truncate">
                        {img.destination}
                      </p>
                      <div className="flex flex-wrap gap-1 text-[9px]">
                        <span className="bg-orange-50 text-orange-600 px-1.5 py-0.2 rounded font-medium border border-orange-200">
                          #{img.style}
                        </span>
                        <span className="bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded">
                          {img.aspectRatio}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Image Actions Footer */}
        <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          {selectedImage ? (
            <div className="text-xs text-stone-600 flex items-center space-x-2 truncate">
              <span className="font-bold text-stone-900 truncate">
                선택됨: {selectedImage.destination}
              </span>
            </div>
          ) : (
            <div className="text-xs text-stone-400">사진을 클릭하여 선택해주세요.</div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-bold transition-all"
            >
              취소
            </button>

            {/* If choosing for a specific spot */}
            {activeSpotTarget && onSelectSpot ? (
              <button
                type="button"
                onClick={handleApplySpot}
                disabled={!selectedImage}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold transition-all shadow-md shadow-orange-500/20 flex items-center space-x-1.5 disabled:opacity-50 active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>📍 [{activeSpotTarget.spotName}] 스팟에 사진 적용</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleApplyMarkdown}
                  disabled={!selectedImage}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-orange-400" />
                  <span>본문 마크다운에 삽입</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyCover}
                  disabled={!selectedImage}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold transition-all shadow-md shadow-orange-500/20 flex items-center space-x-1.5 disabled:opacity-50 active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>대표 커버로 지정</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
