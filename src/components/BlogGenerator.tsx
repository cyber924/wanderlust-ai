import React, { useState } from "react";
import {
  MapPin,
  Sparkles,
  Calendar,
  Tag,
  MessageSquareQuote,
  Compass,
  ArrowRight,
  RotateCcw,
  Zap,
  CheckCircle2,
  Sliders,
  Plane,
  Camera,
  Heart,
  Utensils,
  Sun,
  Backpack,
  Users,
} from "lucide-react";
import { GenerateBlogRequest, BlogPost, TravelTemplate } from "../types";

interface BlogGeneratorProps {
  onBlogGenerated: (blog: BlogPost) => void;
  selectedTemplate?: TravelTemplate | null;
  onClearTemplate?: () => void;
}

const QUICK_TOPICS = [
  "제주도 3박 4일 감성 카페 & 해안도로 드라이브 코스",
  "도쿄 2박 3일 미식 & 시부야 핫플 투어",
  "바르셀로나 가우디 건축 & 스페인 타파스 기행",
  "방콕 4박 5일 럭셔리 호캉스 & 루프탑 야경 스파",
  "교토 3박 4일 고즈넉한 대나무 숲 & 료칸 온천 코스",
  "다낭 3박 5일 바나힐 & 호이안 올드타운 밤거리",
];

const TRAVEL_STYLES = [
  { id: "감성 카페 & 핫플", label: "☕ 감성 카페 & 핫플", icon: Camera },
  { id: "식도락 & 맛집 탐방", label: "🍜 식도락 & 맛집", icon: Utensils },
  { id: "휴양 & 럭셔리 호캉스", label: "🏊‍♂️ 휴양 & 호캉스", icon: Sun },
  { id: "액티비티 & 배낭여행", label: "🎒 액티비티 & 배낭", icon: Backpack },
  { id: "가족 & 아이 동반 코스", label: "👨‍👩‍👧‍👦 가족/아이 동반", icon: Users },
];

const TONE_OPTIONS = [
  { id: "친근하고 감성적인 ~해요체 (인스타그램/네이버 블로그)", label: "인스타/네이버 블로그 감성 (~해요체)" },
  { id: "상세하고 전문적인 모던 에세이 가이드", label: "상세 여행 전문가 가이드" },
  { id: "위트있고 생생한 솔직 담백 리뷰 체", label: "위트있고 솔직한 리얼 후기" },
  { id: "차분하고 고즈넉한 힐링 기행문 체", label: "차분한 힐링 기행문" },
];

export const BlogGenerator: React.FC<BlogGeneratorProps> = ({
  onBlogGenerated,
  selectedTemplate,
  onClearTemplate,
}) => {
  const [destination, setDestination] = useState(
    selectedTemplate ? `${selectedTemplate.destination} - ${selectedTemplate.title}` : ""
  );
  const [duration, setDuration] = useState(selectedTemplate?.duration || "3박 4일");
  const [travelStyle, setTravelStyle] = useState(selectedTemplate?.style || "감성 카페 & 핫플");
  const [tone, setTone] = useState(
    selectedTemplate?.tone || "친근하고 감성적인 ~해요체 (인스타그램/네이버 블로그)"
  );
  const [specificSpots, setSpecificSpots] = useState(
    selectedTemplate?.keywords.join(", ") || ""
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(
    selectedTemplate?.keywords || ["해안도로", "맛집투어", "인생샷포토존"]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    setKeywords(keywords.filter((k) => k !== kwToRemove));
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!destination.trim()) {
      setError("여행지 또는 여행 주제를 입력해 주세요.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingStep(1);

    // Simulated progress steps for better user experience
    const timer1 = setTimeout(() => setLoadingStep(2), 1800);
    const timer2 = setTimeout(() => setLoadingStep(3), 3600);

    try {
      const requestPayload: GenerateBlogRequest = {
        destination: destination.trim(),
        duration,
        travelStyle,
        tone,
        keywords,
        specificSpots: specificSpots.trim(),
        language: "한국어",
      };

      const res = await fetch("/api/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "블로그 작성 중 오류가 발생했습니다.");
      }

      const generatedData = json.data;

      // Fetch AI cover image or create dynamic AI prompt URL
      let coverImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(`4k travel photography of ${destination}`)}?width=1280&height=720&nologo=true`;
      try {
        const imgRes = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination, prompt: generatedData.title }),
        });
        const imgJson = await imgRes.json();
        if (imgJson.success && imgJson.imageUrl) {
          coverImageUrl = imgJson.imageUrl;
        }
      } catch (iErr) {
        console.warn("Cover image fetch error:", iErr);
      }

      // Construct a complete BlogPost model
      const blogPost: BlogPost = {
        id: `blog_${Date.now()}`,
        title: generatedData.title,
        subtitle: generatedData.subtitle,
        destination: generatedData.destination || destination,
        duration: generatedData.duration || duration,
        concept: generatedData.concept || travelStyle,
        tone: generatedData.tone || tone,
        targetAudience: generatedData.targetAudience || "여행을 사랑하는 블로거",
        budget: generatedData.budget || "일정별 상이",
        season: generatedData.season || "사계절 추천",
        metaKeywords: generatedData.metaKeywords || keywords,
        hashtags: generatedData.hashtags || keywords.map((k) => `#${k}`),
        itinerary: generatedData.itinerary || [],
        markdownContent: generatedData.markdownContent,
        travelTips: generatedData.travelTips || [],
        seoDescription: generatedData.seoDescription || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: Math.floor(Math.random() * 20) + 1,
        likes: Math.floor(Math.random() * 10) + 1,
        status: "published",
        coverImageUrl,
      };

      onBlogGenerated(blogPost);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "블로그 생성 도중 알 수 없는 오류가 발생했습니다.");
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl bg-white p-8 sm:p-10 border border-stone-200/80 shadow-xl shadow-stone-200/40 overflow-hidden text-center">
        {/* Background Decorative Blur Glows */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-70 pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-100 rounded-full blur-3xl opacity-70 pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Gemini AI 기반 여행 블로그 자동화 서비스</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
            당신의 여행이 <span className="text-orange-600">완벽한 문장</span>으로 탄생합니다
          </h1>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            간단한 주제만 입력해도 일정별 코스, 감성적 후기, 꿀팁, 네이버/티스토리 마크다운 및 SEO 해시태그까지 AI가 완성해 드립니다.
          </p>

          {/* Preset Chips */}
          <div className="pt-2 text-left">
            <p className="text-xs font-semibold text-stone-500 mb-2 flex items-center gap-1 justify-center">
              <Zap className="w-3.5 h-3.5 text-orange-500" />
              추천 인기 여행 주제 (클릭 시 자동 입력):
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_TOPICS.map((topic, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setDestination(topic)}
                  className="text-xs bg-stone-50 hover:bg-orange-50 text-stone-700 hover:text-orange-600 border border-stone-200 hover:border-orange-300 px-3 py-1.5 rounded-xl transition-all font-medium"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generator Main Input Form */}
      <form onSubmit={handleGenerate} className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-stone-200/40">
        {selectedTemplate && (
          <div className="flex items-center justify-between bg-orange-50 border border-orange-200/80 px-4 py-3 rounded-2xl text-orange-900 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{selectedTemplate.icon}</span>
              <span>
                <strong>선택된 템플릿:</strong> {selectedTemplate.title}
              </span>
            </div>
            <button
              type="button"
              onClick={onClearTemplate}
              className="text-xs text-orange-600 font-bold hover:underline"
            >
              초기화
            </button>
          </div>
        )}

        {/* Destination / Main Topic Input */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-stone-800 flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>어디를 다녀오셨나요? (여행지 또는 주제 입력) *</span>
            </span>
            <span className="text-xs text-stone-400 font-normal">필수</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="예: 제주도 3박 4일 감성 카페 & 해안도로 투어, 도쿄 밤도깨비 맛집 탐방 등"
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3.5 pl-11 text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base font-medium"
            />
            <Compass className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Travel Duration & Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Duration */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-stone-800 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>여행 기간</span>
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
            >
              <option value="당일치기">당일치기 나들이</option>
              <option value="1박 2일">1박 2일 코스</option>
              <option value="2박 3일">2박 3일 알짜배기</option>
              <option value="3박 4일">3박 4일 추천 대표 일정</option>
              <option value="4박 5일">4박 5일 여유있는 코스</option>
              <option value="1주일 이상">1주일 이상 장기 여행</option>
            </select>
          </div>

          {/* Travel Style */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-stone-800 flex items-center space-x-2">
              <Plane className="w-4 h-4 text-orange-500" />
              <span>여행 테마 / 컨셉</span>
            </label>
            <select
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
            >
              {TRAVEL_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tone & Manner */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-stone-800 flex items-center space-x-2">
            <MessageSquareQuote className="w-4 h-4 text-orange-500" />
            <span>어조 및 작성 스타일</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TONE_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setTone(opt.id)}
                className={`p-3 rounded-2xl text-left border text-xs sm:text-sm font-medium transition-all ${
                  tone === opt.id
                    ? "bg-orange-50 border-orange-400 text-orange-700 font-semibold shadow-sm"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Specific Spots & Keywords */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-stone-800 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>꼭 포함하고 싶은 특정 장소/명소 (선택)</span>
            </label>
            <input
              type="text"
              value={specificSpots}
              onChange={(e) => setSpecificSpots(e.target.value)}
              placeholder="예: 사그라다 파밀리아, 람블라 거리, 구엘 공원 등"
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-stone-800 flex items-center space-x-2">
              <Tag className="w-4 h-4 text-orange-500" />
              <span>주요 키워드 / 태그</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                placeholder="키워드 입력 후 엔터 (예: 오션뷰카페, 인생샷)"
                className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="bg-stone-800 hover:bg-stone-900 text-white px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors"
              >
                추가
              </button>
            </div>

            {/* Added Keyword Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center space-x-1 bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-xl text-xs font-semibold"
                >
                  <span>#{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="hover:text-rose-600 ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg text-white shadow-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
              isLoading
                ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20 hover:scale-[1.005] active:scale-[0.995]"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>
                  {loadingStep === 1 && "1/3 단계: 제미나이 AI가 여행지를 분석하고 있습니다..."}
                  {loadingStep === 2 && "2/3 단계: 일정별 감성 블로그 본문 및 꿀팁 구성 중..."}
                  {loadingStep === 3 && "3/3 단계: 마크다운 포맷팅 및 SEO 키워드 정제 중..."}
                </span>
              </div>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>제미나이 AI로 여행 블로그 글 즉시 생성하기</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
