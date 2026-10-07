import React, { useState } from "react";
import {
  X,
  Link2,
  FileText,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  ArrowRight,
  PlusCircle,
  Layers,
  MapPin,
  Calendar,
} from "lucide-react";
import { BlogPost, GeneratedImage } from "../types";

interface ImageLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: GeneratedImage | null;
  savedPosts: BlogPost[];
  onSetAsCover?: (post: BlogPost, image: GeneratedImage) => Promise<void> | void;
  onSetAsSpot?: (post: BlogPost, image: GeneratedImage, dayIdx: number, spotIdx: number) => Promise<void> | void;
  onInsertIntoContent?: (
    post: BlogPost,
    image: GeneratedImage,
    position: "top" | "bottom"
  ) => Promise<void> | void;
  onCreateNewPostWithImage?: (image: GeneratedImage) => void;
}

export const ImageLinkModal: React.FC<ImageLinkModalProps> = ({
  isOpen,
  onClose,
  image,
  savedPosts,
  onSetAsCover,
  onSetAsSpot,
  onInsertIntoContent,
  onCreateNewPostWithImage,
}) => {
  const [selectedPostId, setSelectedPostId] = useState<string>(
    savedPosts.length > 0 ? savedPosts[0].id : ""
  );
  const [linkAction, setLinkAction] = useState<"cover" | "spot" | "insert_top" | "insert_bottom">("cover");
  const [selectedSpotKey, setSelectedSpotKey] = useState<string>("0_0");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !image) return null;

  const selectedPost = savedPosts.find((p) => p.id === selectedPostId);

  const handleApply = async () => {
    if (!selectedPost) return;
    setIsProcessing(true);
    try {
      if (linkAction === "cover" && onSetAsCover) {
        await onSetAsCover(selectedPost, image);
      } else if (linkAction === "spot" && onSetAsSpot) {
        const [dStr, sStr] = selectedSpotKey.split("_");
        await onSetAsSpot(selectedPost, image, parseInt(dStr, 10), parseInt(sStr, 10));
      } else if (linkAction === "insert_top" && onInsertIntoContent) {
        await onInsertIntoContent(selectedPost, image, "top");
      } else if (linkAction === "insert_bottom" && onInsertIntoContent) {
        await onInsertIntoContent(selectedPost, image, "bottom");
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-stone-200/90 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-stone-900">
                블로그 글에 사진 연결 / 삽입
              </h2>
              <p className="text-xs text-stone-500">
                생성된 AI 여행 사진을 작성된 블로그와 바로 연결합니다.
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

        {/* Selected Image Thumbnail Preview */}
        <div className="flex items-center space-x-3.5 bg-stone-50 border border-stone-200/80 p-3 rounded-2xl">
          <img
            src={image.imageUrl}
            alt={image.destination}
            referrerPolicy="no-referrer"
            className="w-20 h-14 object-cover rounded-xl border border-stone-200 shrink-0"
          />
          <div className="overflow-hidden space-y-1">
            <p className="text-xs font-bold text-stone-900 truncate">
              {image.destination}
            </p>
            <div className="flex flex-wrap gap-1 text-[10px]">
              <span className="bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded border border-orange-200">
                #{image.style}
              </span>
              <span className="bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                #{image.lighting}
              </span>
              <span className="bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                {image.aspectRatio}
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Choose Target Blog */}
        <div className="space-y-2.5">
          <label className="block text-xs font-extrabold text-stone-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-orange-500" />
              1. 연결할 블로그 포스트 선택
            </span>
            <span className="text-[11px] text-stone-500 font-normal">
              저장된 글 ({savedPosts.length}개)
            </span>
          </label>

          {savedPosts.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl text-center space-y-2">
              <p className="text-xs font-semibold text-amber-900">
                아직 저장된 블로그 포스트가 없습니다.
              </p>
              <button
                type="button"
                onClick={() => {
                  onCreateNewPostWithImage(image);
                  onClose();
                }}
                className="inline-flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>이 사진으로 새 블로그 글 작성하기</span>
              </button>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {savedPosts.map((post) => {
                const isSelected = post.id === selectedPostId;
                const isMatchedDest =
                  post.destination &&
                  image.destination &&
                  (post.destination.toLowerCase().includes(image.destination.toLowerCase()) ||
                    image.destination.toLowerCase().includes(post.destination.toLowerCase()));

                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPostId(post.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-orange-50/80 border-orange-400 shadow-sm"
                        : "bg-white hover:bg-stone-50 border-stone-200"
                    }`}
                  >
                    <div className="space-y-1 overflow-hidden pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {post.title}
                        </span>
                        {isMatchedDest && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                            ✨ 장소 일치
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-stone-500">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-orange-400" />
                          {post.destination}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {post.duration}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-stone-300"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: Choose How to Connect */}
        {savedPosts.length > 0 && (
          <div className="space-y-2.5">
            <label className="block text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-500" />
              2. 연결 방식 선택
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Option 1: Set as Cover */}
              <button
                type="button"
                onClick={() => setLinkAction("cover")}
                className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1 ${
                  linkAction === "cover"
                    ? "bg-orange-50 border-orange-400 font-bold shadow-sm text-orange-950"
                    : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700"
                }`}
              >
                <div className="flex items-center space-x-1 text-xs font-extrabold text-orange-600">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>대표 커버</span>
                </div>
                <p className="text-[10px] text-stone-500 font-normal leading-tight">
                  블로그 상단 대표 썸네일로 지정
                </p>
              </button>

              {/* Option 2: Set as Spot Photo */}
              <button
                type="button"
                onClick={() => setLinkAction("spot")}
                className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1 ${
                  linkAction === "spot"
                    ? "bg-orange-50 border-orange-400 font-bold shadow-sm text-orange-950"
                    : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700"
                }`}
              >
                <div className="flex items-center space-x-1 text-xs font-extrabold text-orange-600">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>코스 스팟에 꽂기</span>
                </div>
                <p className="text-[10px] text-stone-500 font-normal leading-tight">
                  일정 특정 장소에 사진 매핑
                </p>
              </button>

              {/* Option 3: Insert at Top of Content */}
              <button
                type="button"
                onClick={() => setLinkAction("insert_top")}
                className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1 ${
                  linkAction === "insert_top"
                    ? "bg-orange-50 border-orange-400 font-bold shadow-sm text-orange-950"
                    : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700"
                }`}
              >
                <div className="flex items-center space-x-1 text-xs font-extrabold text-stone-800">
                  <FileText className="w-3.5 h-3.5 text-orange-500" />
                  <span>본문 상단 삽입</span>
                </div>
                <p className="text-[10px] text-stone-500 font-normal leading-tight">
                  서론 바로 아래에 사진 삽입
                </p>
              </button>

              {/* Option 4: Insert at Bottom */}
              <button
                type="button"
                onClick={() => setLinkAction("insert_bottom")}
                className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1 ${
                  linkAction === "insert_bottom"
                    ? "bg-orange-50 border-orange-400 font-bold shadow-sm text-orange-950"
                    : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700"
                }`}
              >
                <div className="flex items-center space-x-1 text-xs font-extrabold text-stone-800">
                  <FileText className="w-3.5 h-3.5 text-orange-500" />
                  <span>본문 하단 삽입</span>
                </div>
                <p className="text-[10px] text-stone-500 font-normal leading-tight">
                  마무리 아래에 사진 추가
                </p>
              </button>
            </div>

            {/* If linkAction === 'spot', render spot picker dropdown/list */}
            {linkAction === "spot" && selectedPost && selectedPost.itinerary && selectedPost.itinerary.length > 0 && (
              <div className="mt-3 bg-stone-50 border border-orange-200/80 p-3 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-stone-800 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>사진을 적용할 여행 일정 스팟 선택:</span>
                </label>
                <select
                  value={selectedSpotKey}
                  onChange={(e) => setSelectedSpotKey(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {selectedPost.itinerary.map((dayItem, dIdx) =>
                    dayItem.activities.map((act, aIdx) => (
                      <option key={`${dIdx}_${aIdx}`} value={`${dIdx}_${aIdx}`}>
                        Day {dayItem.day} ({dayItem.title}) - {act.spot}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onCreateNewPostWithImage(image);
              onClose();
            }}
            className="text-xs text-stone-600 hover:text-orange-600 font-semibold px-3 py-2 rounded-xl hover:bg-orange-50 transition-colors flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>이 사진으로 새 글 작성하기</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-bold transition-all"
            >
              취소
            </button>
            {savedPosts.length > 0 && (
              <button
                type="button"
                onClick={handleApply}
                disabled={isProcessing || !selectedPost}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold transition-all shadow-md shadow-orange-500/20 flex items-center space-x-1.5 active:scale-[0.98]"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>블로그에 연결 적용</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
