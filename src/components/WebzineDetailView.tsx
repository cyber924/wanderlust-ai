import React from "react";
import { getSafeUnsplashCoverUrl } from "../utils/imageHelper";
import {
  Heart,
  Bookmark,
  Share2,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  Eye,
  ArrowLeft,
  Lightbulb,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { BlogPost } from "../types";

interface WebzineDetailViewProps {
  post: BlogPost;
  onBack: () => void;
  onLike: () => void;
  onScrap: () => void;
  onOpenEmbedModal: (post: BlogPost) => void;
  onUseAsTemplate: (post: BlogPost) => void;
  isLiked?: boolean;
  isScrapped?: boolean;
}

export const WebzineDetailView: React.FC<WebzineDetailViewProps> = ({
  post,
  onBack,
  onLike,
  onScrap,
  onOpenEmbedModal,
  onUseAsTemplate,
  isLiked = false,
  isScrapped = false,
}) => {
  // Append query parameter timestamp to bypass aggressive image cache
  const cacheBuster = `?v=${new Date(post.createdAt).getTime()}`;
  const rawUrl = getSafeUnsplashCoverUrl(post);
  const coverUrl = `${rawUrl}${rawUrl.includes("?") ? "&" : ""}${cacheBuster}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-20 px-1 sm:px-0">
      {/* 🧭 Editorial Back & Header controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-b border-stone-200/60 pb-4">
        <button
          onClick={onBack}
          className="group flex items-center space-x-2 text-stone-500 hover:text-stone-900 font-bold text-xs sm:text-sm transition-all py-1"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>목록으로 돌아가기</span>
        </button>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-stone-400 uppercase">
            Wanderlust Editorial Magazine
          </span>
          <button
            onClick={() => onOpenEmbedModal(post)}
            className="flex items-center space-x-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>블로그로 퍼가기</span>
          </button>
        </div>
      </div>

      {/* 📖 Magazine Grid Layout (Asymmetrical 2-Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column - Meta Panel (Narrow, Sticky) */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6 lg:sticky lg:top-24">
          <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-xs">
            <div className="space-y-3 sm:space-y-4">
              <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 border border-orange-100 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-lg">
                {post.categoryName || (post.categoryType === "life_info" ? "생활/살림 정보" : "테마 여행 코스")}
              </span>

              {/* Reduced and Refined Title size to prevent overflow */}
              <h1 
                style={{ fontSize: "clamp(1.125rem, 2.5vw + 0.75rem, 1.625rem)" }}
                className="font-black text-stone-900 leading-snug tracking-tight"
              >
                {post.title}
              </h1>

              <p 
                style={{ fontSize: "clamp(0.75rem, 0.8vw + 0.5rem, 0.9375rem)" }}
                className="text-stone-500 font-medium leading-relaxed"
              >
                {post.subtitle}
              </p>
            </div>

            <div className="border-t border-stone-100 pt-4 sm:pt-5 space-y-2.5 sm:space-y-3 text-xs text-stone-500">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-400">작성 에디터</span>
                <span className="font-bold text-stone-800">✍️ {post.authorName || "Wanderlust 에디터"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-400">발행 일자</span>
                <span className="font-bold text-stone-800">
                  {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-400">누적 조회수</span>
                <span className="font-mono font-bold text-stone-800 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-stone-400" />
                  {post.views || 120}회
                </span>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="border-t border-stone-100 pt-4 sm:pt-5 grid grid-cols-2 gap-2">
              <button
                onClick={onLike}
                className={`flex items-center justify-center space-x-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  isLiked
                    ? "bg-rose-50 border-rose-200 text-rose-600 shadow-xs"
                    : "bg-white border-stone-200 text-stone-600 hover:border-rose-300 hover:text-rose-600"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                <span>좋아요 {post.likes || 0}</span>
              </button>

              <button
                onClick={onScrap}
                className={`flex items-center justify-center space-x-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  isScrapped
                    ? "bg-amber-50 border-amber-200 text-amber-700 shadow-xs"
                    : "bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-700"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isScrapped ? "fill-amber-500 text-amber-500" : ""}`} />
                <span>스크랩</span>
              </button>
            </div>
          </div>

          {/* Hashtag Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-2.5 sm:space-y-3">
            <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">상위노출 최적화 해시태그</span>
            <div className="flex flex-wrap gap-1.5">
              {(post.hashtags || []).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-white text-stone-600 border border-stone-200 rounded-lg text-xs font-semibold"
                >
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Premium Body Panel (Wide) */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Panoramic High-resolution Cover Banner */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md sm:shadow-lg border border-stone-200/80 bg-stone-100 aspect-[4/3] xs:aspect-[16/9] md:aspect-[16/7]">
            <img
              src={coverUrl}
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
              }}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
              <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 w-fit">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>{post.destination}</span>
                <span className="text-stone-300">•</span>
                <span>{post.duration}</span>
              </div>
            </div>
          </div>

          {/* Quick specs blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-stone-100/60 p-3 sm:p-4 border border-stone-200/50 rounded-xl sm:rounded-2xl">
            <div className="p-2.5 sm:p-3.5 bg-white rounded-xl border border-stone-200/30">
              <span className="text-[10px] font-bold text-stone-400 block mb-0.5">도시/테마</span>
              <p className="text-sm font-black text-stone-900 truncate">{post.destination}</p>
            </div>
            <div className="p-2.5 sm:p-3.5 bg-white rounded-xl border border-stone-200/30">
              <span className="text-[10px] font-bold text-stone-400 block mb-0.5">체류 소요시간</span>
              <p className="text-sm font-black text-stone-900 truncate">{post.duration}</p>
            </div>
            <div className="p-2.5 sm:p-3.5 bg-white rounded-xl border border-stone-200/30">
              <span className="text-[10px] font-bold text-stone-400 block mb-0.5">글 스타일/어조</span>
              <p className="text-sm font-black text-stone-900 truncate">{post.concept}</p>
            </div>
            <div className="p-2.5 sm:p-3.5 bg-white rounded-xl border border-stone-200/30">
              <span className="text-[10px] font-bold text-stone-400 block mb-0.5">지출 예상 가이드</span>
              <p className="text-sm font-black text-orange-600 truncate">{post.budget || "합리적 지출"}</p>
            </div>
          </div>

          {/* Detailed Course Timelines */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2.5 border-b border-stone-200 pb-3.5">
              <span className="text-lg">🗺️</span>
              <h2 className="text-base sm:text-lg font-black text-stone-900">
                {post.categoryType === "life_info" ? "단계별 실전 요약 정보" : "시간대별 추천 코스 코멘터리"}
              </h2>
            </div>

            {(post.itinerary || []).map((dayItem, dIdx) => (
              <div key={dIdx} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-lg bg-orange-500 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                    D{dayItem.day}
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-stone-900">{dayItem.title}</h3>
                </div>

                <div className="space-y-4 pl-3 sm:pl-3.5 border-l-2 border-orange-200/60 ml-3 sm:ml-3.5">
                  {(dayItem.activities || []).map((act, aIdx) => {
                    const isValidActImg = act.imageUrl && act.imageUrl.startsWith("http") && !act.imageUrl.includes("placeholder") && act.imageUrl.length > 10;
                    const actImgUrl = isValidActImg
                      ? `${act.imageUrl}${act.imageUrl.includes("?") ? "&" : ""}${cacheBuster}` 
                      : null;
                    return (
                      <div
                        key={aIdx}
                        className="bg-white border border-stone-200/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 space-y-2.5 sm:space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-wrap gap-1">
                            {act.time && (
                              <span className="text-[10px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded flex items-center gap-1">
                                <Clock className="w-3 h-3 text-orange-500" />
                                {act.time}
                              </span>
                            )}
                            <span 
                              style={{ fontSize: "clamp(0.8125rem, 0.8vw + 0.5rem, 1rem)" }}
                              className="font-extrabold text-stone-900"
                            >
                              {act.spot}
                            </span>
                          </div>
                        </div>

                        <p 
                          style={{ fontSize: "clamp(0.718rem, 0.6vw + 0.5rem, 0.875rem)" }}
                          className="text-stone-600 leading-relaxed"
                        >
                          {act.description}
                        </p>

                        {/* Spot Image with cache bust */}
                        {actImgUrl && (
                          <div className="rounded-xl overflow-hidden border border-stone-200/80 bg-stone-50 max-h-80">
                            <img
                              src={actImgUrl}
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
                              }}
                              alt={act.spot}
                              className="w-full h-full object-cover max-h-80"
                            />
                            <div className="p-2 bg-stone-50 text-[10px] text-stone-400 text-center font-bold">
                              ▲ {act.spot} 생생 현장 코스 스냅
                            </div>
                          </div>
                        )}

                        {/* Spot Tip */}
                        {act.tip && (
                          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-amber-800">현지인 추천 팁:</strong> {act.tip}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Travel Tips block */}
          {(post.travelTips || []).length > 0 && (
            <div className="p-4 sm:p-6 bg-amber-50/50 border border-amber-200/60 rounded-2xl sm:rounded-3xl space-y-2.5 sm:space-y-3">
              <h4 className="font-extrabold text-amber-950 flex items-center gap-2 text-sm sm:text-base">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <span>에디터가 전하는 완벽 노출 체크리스트</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-700 pl-2">
                {post.travelTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Premium call to action footer banner */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-black text-sm sm:text-base flex items-center justify-center sm:justify-start gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>이 기사 템플릿으로 직접 글을 쓰고 싶으신가요?</span>
              </p>
              <p className="text-[11px] text-stone-300">
                에디터 코스를 기반으로 나만의 고유한 블로그 글을 새롭게 자동 생성해 보세요.
              </p>
            </div>

            <button
              onClick={() => onUseAsTemplate(post)}
              className="w-full sm:w-auto px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/10 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>이 코스로 AI 제작</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
