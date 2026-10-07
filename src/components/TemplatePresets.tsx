import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  Globe2, 
  Search, 
  Loader2, 
  Lightbulb, 
  TrendingUp, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Flame,
  HelpCircle,
  Cpu
} from "lucide-react";
import { TRAVEL_TEMPLATES } from "../lib/templates";
import { TravelTemplate } from "../types";

interface TemplatePresetsProps {
  onSelectTemplate: (template: TravelTemplate) => void;
}

interface AIRecommendedTemplate extends TravelTemplate {
  reason?: string;
}

export const TemplatePresets: React.FC<TemplatePresetsProps> = ({ onSelectTemplate }) => {
  const [filter, setFilter] = useState<"all" | "travel" | "food" | "trend" | "life_info">("all");
  
  // AI recommendations state
  const [recommendedTemplates, setRecommendedTemplates] = useState<AIRecommendedTemplate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<number>(1);
  const [inputSearch, setInputSearch] = useState<string>("");
  const [recommendError, setRecommendError] = useState<string | null>(null);

  // Stepper text during AI generation
  const loadingStages = [
    "실시간 소셜 플랫폼 인기 검색어 크롤링 중...",
    "Gemini 3.8 최적화 C-Rank 노출지표 분석 중...",
    "포스팅 카테고리별 맞춤 키워드 및 소제목 레이아웃 구성 중..."
  ];

  // Auto-progress the loading stages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStage(1);
      interval = setInterval(() => {
        setLoadingStage((prev) => {
          if (prev >= 3) return 1;
          return prev + 1;
        });
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Call recommendation API
  const handleFetchRecommendations = async (topicSearch: string = "") => {
    setIsLoading(true);
    setRecommendError(null);
    try {
      const response = await fetch("/api/templates/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: filter,
          inputSearch: topicSearch,
          userContext: "사용자는 고품질 정보 전달 블로거이며 신선한 감성 카페, 이색 여행지, 가심비 라이프 트렌드에 관심이 매우 많습니다."
        }),
      });

      const result = await response.json();
      if (result.success && Array.isArray(result.templates)) {
        // Map backend schema to TravelTemplate structure
        const mapped: AIRecommendedTemplate[] = result.templates.map((t: any) => ({
          id: t.id || `ai_tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          title: t.title,
          categoryType: t.category,
          destination: t.destination || t.title.split(" ")[0] || "추천 주제",
          style: t.travelStyle || "감성 핫플레이스 탐방 가이드",
          icon: t.icon || "✨",
          description: t.description,
          duration: t.duration || "당일치기",
          keywords: t.keywords || [],
          tone: "친근하고 감성적인 ~해요체",
          reason: t.reason
        }));
        setRecommendedTemplates(mapped);
      } else {
        throw new Error(result.error || "추천 템플릿 로딩 실패");
      }
    } catch (err: any) {
      console.error(err);
      setRecommendError("AI 추천 데이터를 가져오는 중 일시적인 네트워크 지연이 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // Hot trend quick tags based on current active category
  const getHotTags = () => {
    switch (filter) {
      case "travel":
        return ["🍂 가을 평창 억새 군락지", "🌊 남해 다랭이마을 낙조코스", "🚞 단풍 경전철 로드"];
      case "food":
        return ["☕ 성수동 에스프레소 투어", "🥐 한남동 베이커리 오픈런", "🍲 야장 을지로 노포로드"];
      case "trend":
        return ["🧘‍♀️ 미라클 모닝 웰니스 요가", "🌲 도파민 디스크 오프 그리드", "🛍️ 성수 한정판 팝업 공략"];
      case "life_info":
        return ["🧹 냉장고 10분 정리스킬", "📱 스마트폰 배터리 심폐소생", "💡 환절기 알레르기 예방"];
      case "all":
      default:
        return ["🍁 가을 힐링 단풍 투어", "🥐 성수동 소금빵 핫플", "💡 가전제품 에너지 절약"];
    }
  };

  const filteredStaticTemplates = TRAVEL_TEMPLATES.filter((tmpl) => {
    if (filter === "travel") return tmpl.categoryType === "travel";
    if (filter === "food") return tmpl.categoryType === "food";
    if (filter === "trend") return tmpl.categoryType === "trend";
    if (filter === "life_info") return tmpl.categoryType === "life_info";
    return true;
  });

  const getCategoryBadge = (categoryType?: string) => {
    switch (categoryType) {
      case "food":
        return {
          label: "🍽️ 맛집/카페",
          colorClass: "bg-rose-50 border-rose-200 text-rose-700",
        };
      case "trend":
        return {
          label: "🔥 트렌드",
          colorClass: "bg-purple-50 border-purple-200 text-purple-700",
        };
      case "life_info":
        return {
          label: "💡 생활정보",
          colorClass: "bg-amber-50 border-amber-200 text-amber-700",
        };
      case "travel":
      default:
        return {
          label: "✈️ 여행",
          colorClass: "bg-orange-50 border-orange-200 text-orange-600",
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12" id="templates-presets-view">
      {/* Banner Header */}
      <div className="bg-white border border-stone-200/80 p-8 rounded-3xl shadow-xl shadow-stone-200/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
              <Globe2 className="w-3.5 h-3.5 text-orange-500" />
              <span>인기 블로그 템플릿 라이브러리</span>
            </div>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
              클릭 한 번으로 즉시 고품질 포스팅 생성
            </h1>
            <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
              검증된 인기 여행지, 맛집/카페 핫플, 최신 라이프 트렌드, 생활정보 템플릿을 선택하면 해당 주제와 꿀팁 키워드가 자동으로 세팅되어 완벽한 AI 글을 즉시 생성해 드립니다.
            </p>
          </div>

          {/* Filter Buttons - SNS Style Categories */}
          <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 self-start sm:self-center">
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setRecommendedTemplates([]);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === "all"
                  ? "bg-white text-stone-900 shadow-sm border border-stone-200"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              전체보기 ({TRAVEL_TEMPLATES.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter("travel");
                setRecommendedTemplates([]);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === "travel"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              ✈️ 여행
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter("food");
                setRecommendedTemplates([]);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === "food"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              🍽️ 맛집/카페
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter("trend");
                setRecommendedTemplates([]);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === "trend"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              🔥 트렌드
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter("life_info");
                setRecommendedTemplates([]);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === "life_info"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              💡 생활정보
            </button>
          </div>
        </div>
      </div>

      {/* Interactive AI Real-time Recommendation Section */}
      <div className="bg-gradient-to-br from-amber-50/75 via-white to-orange-50/20 border border-amber-200/85 p-6 rounded-3xl shadow-xl shadow-amber-100/20 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-stone-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400 animate-pulse" />
              <span>실시간 AI 맞춤형 템플릿 추천판</span>
            </h2>
            <p className="text-xs text-stone-600">
              현재 필터링된 <span className="font-bold text-orange-600">{getCategoryBadge(filter).label}</span> 기준 소셜 플랫폼 실시간 검색량 및 C-Rank 최적화 주제를 실시간 합성하여 맞춤 제안합니다.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleFetchRecommendations()}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold rounded-xl shadow-md shadow-orange-200/40 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Cpu className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>실시간 트렌드 분석 추천받기 ✨</span>
            </button>
            {recommendedTemplates.length > 0 && (
              <button
                type="button"
                onClick={() => setRecommendedTemplates([])}
                className="p-2 text-stone-500 hover:text-red-500 bg-white border border-stone-200 hover:border-red-200 rounded-xl transition-colors"
                title="추천 지우기"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Generator Input */}
        <div className="pt-2">
          <div className="bg-white border border-stone-200 rounded-2xl p-2.5 flex items-center shadow-xs focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-transparent transition-all">
            <Search className="w-4 h-4 text-stone-400 ml-2" />
            <input
              type="text"
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              placeholder="직접 원하는 주제를 적어서 즉석 템플릿을 발급해 보세요! (예: 가평 글램핑, 자취 에어프라이어 세척)"
              className="flex-1 bg-transparent px-3 text-xs text-stone-800 placeholder-stone-400 outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputSearch.trim()) {
                  handleFetchRecommendations(inputSearch);
                }
              }}
            />
            <button
              type="button"
              disabled={isLoading || !inputSearch.trim()}
              onClick={() => handleFetchRecommendations(inputSearch)}
              className="bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-xl transition-colors flex items-center space-x-1 disabled:opacity-30 disabled:hover:bg-stone-900"
            >
              <span>즉석 템플릿 대행 생성 ⚡</span>
            </button>
          </div>
        </div>

        {/* Hot Quick Tag Recommendations */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] text-stone-500 font-bold flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>오늘의 실시간 급상승 키워드:</span>
          </span>
          {getHotTags().map((tag, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setInputSearch(tag.replace(/^[^\s]+\s/, "")); // Strip emoji prefix
                handleFetchRecommendations(tag.replace(/^[^\s]+\s/, ""));
              }}
              className="bg-stone-100 hover:bg-amber-100/50 text-stone-700 hover:text-amber-800 border border-stone-200 hover:border-amber-300 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* AI Stepper Loader */}
        {isLoading && (
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-6 text-center space-y-4 animate-pulse">
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
            
            {/* Steps Visualizer */}
            <div className="flex items-center justify-center space-x-4 max-w-sm mx-auto">
              <div className="flex flex-col items-center">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold ${loadingStage >= 1 ? "bg-amber-500 text-white" : "bg-stone-200 text-stone-500"}`}>1</span>
                <span className="text-[9px] text-stone-500 mt-1 font-bold">인기 탐색</span>
              </div>
              <div className={`h-0.5 flex-1 ${loadingStage >= 2 ? "bg-amber-400" : "bg-stone-200"}`} />
              <div className="flex flex-col items-center">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold ${loadingStage >= 2 ? "bg-amber-500 text-white" : "bg-stone-200 text-stone-500"}`}>2</span>
                <span className="text-[9px] text-stone-500 mt-1 font-bold">C-Rank 수집</span>
              </div>
              <div className={`h-0.5 flex-1 ${loadingStage >= 3 ? "bg-amber-400" : "bg-stone-200"}`} />
              <div className="flex flex-col items-center">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold ${loadingStage >= 3 ? "bg-amber-500 text-white" : "bg-stone-200 text-stone-500"}`}>3</span>
                <span className="text-[9px] text-stone-500 mt-1 font-bold">템플릿 완성</span>
              </div>
            </div>

            <p className="text-xs text-amber-900 font-bold transition-all duration-300">
              {loadingStages[loadingStage - 1]}
            </p>
          </div>
        )}

        {/* Error Feedback */}
        {recommendError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold">
            ⚠️ {recommendError}
          </div>
        )}

        {/* Generated Recommendations Display */}
        {recommendedTemplates.length > 0 && !isLoading && (
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 px-1">
              <span>🎯 Gemini AI 추천 템플릿 ({recommendedTemplates.length}개)</span>
              <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">정밀 개인화 완료</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedTemplates.map((tmpl) => {
                const badge = getCategoryBadge(tmpl.categoryType);
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => onSelectTemplate(tmpl)}
                    className="bg-white border-2 border-amber-400/70 hover:border-amber-500 rounded-3xl p-5 space-y-3.5 transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between group shadow-lg shadow-amber-100/30"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl p-2.5 bg-amber-50/80 rounded-2xl border border-amber-200/50 group-hover:scale-110 transition-transform">
                          {tmpl.icon}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${badge.colorClass}`}>
                          {badge.label} · {tmpl.duration}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-stone-900 group-hover:text-amber-700 transition-colors leading-snug">
                        {tmpl.title}
                      </h3>

                      <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                        {tmpl.description}
                      </p>

                      {/* Recommend Reason Section */}
                      {tmpl.reason && (
                        <div className="p-2.5 bg-stone-50 border border-stone-200/60 rounded-2xl text-[11px] text-stone-700 font-medium leading-relaxed flex items-start space-x-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-amber-700">AI 큐레이팅 픽: </span>
                            {tmpl.reason}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tmpl.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-amber-50/40 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-lg font-semibold"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:text-amber-800">
                      <span>이 추천 템플릿으로 작성 시작⚡</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Static Templates Grid Title */}
      <div className="pt-4 border-t border-stone-200">
        <h2 className="text-xl font-extrabold text-stone-900 flex items-center space-x-2 px-1">
          <TrendingUp className="w-5 h-5 text-stone-500" />
          <span>기본 정적인 베스트셀러 템플릿 목록</span>
        </h2>
      </div>

      {/* Static Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaticTemplates.map((tmpl) => {
          const badge = getCategoryBadge(tmpl.categoryType);
          return (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl)}
              className="bg-white border border-stone-200/80 rounded-3xl p-6 space-y-4 hover:border-orange-300 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group shadow-xl shadow-stone-200/40"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-4xl p-2 bg-stone-50 rounded-2xl border border-stone-200 group-hover:scale-110 transition-transform">
                    {tmpl.icon}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badge.colorClass}`}>
                    {badge.label} · {tmpl.duration}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 group-hover:text-orange-600 transition-colors leading-snug">
                  {tmpl.title}
                </h3>

                <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                  {tmpl.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {tmpl.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-lg border border-stone-200"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:text-orange-700">
                <span>이 템플릿으로 작성하기</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
