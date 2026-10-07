import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Newspaper,
  Compass,
  ArrowRight,
  TrendingUp,
  Bookmark,
  CheckCircle2,
  BookmarkCheck,
  Search,
  ExternalLink,
  Flame,
  Zap,
  RefreshCw,
} from "lucide-react";

interface PreInvestigationProps {
  onSelectTopic: (topic: {
    title: string;
    keywords: string[];
    categoryType: "travel" | "life_info" | "food" | "trend";
    travelStyle: string;
    duration: string;
  }) => void;
  onShowToast: (message: string) => void;
}

interface RecommendedTopic {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  travelStyle: string;
  duration: string;
  icon?: string;
  reason?: string;
}

interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

const NEWS_SECTIONS = [
  { id: "", label: "🔥 핫 뉴스 (종합)", color: "text-red-500 bg-red-50 hover:bg-red-100" },
  { id: "BUSINESS", label: "💰 경제", color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
  { id: "LIFESTYLE", label: "🌱 생활/문화", color: "text-amber-700 bg-amber-50 hover:bg-amber-100" },
  { id: "ENTERTAINMENT", label: "🎬 연예/드라마", color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
  { id: "SPORTS", label: "⚽ 스포츠", color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
  { id: "TECHNOLOGY", label: "💻 IT/과학", color: "text-sky-600 bg-sky-50 hover:bg-sky-100" },
];

const DEFAULT_TRAVEL_TOPICS: RecommendedTopic[] = [
  {
    id: "travel-default-1",
    title: "[다낭 3박 5일] 바나힐 & 호이안 올드타운 밤거리 완벽 코스 ✨",
    description: "최근 네이버 해외여행 스마트블록 1위를 기록 중인 다낭 핵심 루트입니다. 가성비 맛집과 리조트 팁을 동봉하여 클릭률이 높습니다.",
    keywords: ["다낭 자유여행 코스", "바나힐 케이블카", "호이안 올드타운 맛집"],
    travelStyle: "🏕️ 커플/가족 힐링 패키지 코스",
    duration: "3박 5일",
    icon: "🇻🇳"
  },
  {
    id: "travel-default-2",
    title: "제주 서쪽 에메랄드빛 바다 & 오름 힐링 2박 3일 감성 로드",
    description: "제주도 서쪽의 일몰 명소와 오름, 그리고 숨겨진 오션뷰 카페를 공략하여 20-30대 감성을 자극하는 최적화 주제입니다.",
    keywords: ["제주 서쪽 가볼만한곳", "제주도 협재 맛집", "금오름 일몰"],
    travelStyle: "🚙 렌트카 드라이브 & 카페 투어",
    duration: "2박 3일",
    icon: "🏝️"
  },
  {
    id: "travel-default-3",
    title: "낭만의 도시 파리 3박 4일, 센강 야경과 숨은 골목 카페 완벽 정복",
    description: "유럽 로망을 저격하는 파리 시내 핵심 랜드마크와 현지인만 아는 에스프레소 바, 센강 뷰포인트를 집중 공략합니다.",
    keywords: ["파리 3박 4일 코스", "파리 센강 유람선", "에펠탑 명당"],
    travelStyle: "🎨 예술 & 낭만 골목 탐방",
    duration: "3박 4일",
    icon: "🇫🇷"
  }
];

const DEFAULT_LIFE_TOPICS: RecommendedTopic[] = [
  {
    id: "life-default-1",
    title: "자취생 & 주부 필수! 과탄산소다 하나로 끝내는 10분 욕실 살림 청소법",
    description: "네이버 리빙/살림 스마트블록 검색량 폭발! 락스 냄새 없이 물때와 곰팡이를 제거하는 실전 청소 가이드입니다.",
    keywords: ["과탄산소다 활용법", "욕실 청소 꿀팁", "화장실 물때 제거"],
    travelStyle: "🧹 10분 초스피드 실전 살림",
    duration: "즉시 해결",
    icon: "🧼"
  },
  {
    id: "life-default-2",
    title: "요알못도 성공하는 15분 초간단 원팬 알리오 올리오 파스타 꿀팁 🍝",
    description: "설거지 필요 없는 초간단 한 그릇 레시피. 마늘 향을 극대화하는 올리브 오일 유화법으로 자취생 취향 저격.",
    keywords: ["원팬 파스타 레시피", "알리오 올리오 만들기", "초간단 자취요리"],
    travelStyle: "🍳 15분 퀵 원팬 레시피",
    duration: "15분",
    icon: "🍝"
  },
  {
    id: "life-default-3",
    title: "한강 러닝 크루 입문기! 퇴근 후 2시간 야간달리기 & 플로깅 오운완 팁",
    description: "야외 운동 및 건강한 일상 스마트블록 저격. 한강 러닝 코스 추천과 초보자 부상 방지 러닝화 고르는 팁.",
    keywords: ["한강 러닝 코스 추천", "야간 러닝 꿀팁", "초보 러너 가이드"],
    travelStyle: "🏃 활력 충전 건강 라이프",
    duration: "2시간",
    icon: "👟"
  }
];

export const PreInvestigation: React.FC<PreInvestigationProps> = ({
  onSelectTopic,
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"ai-trends" | "google-news">("ai-trends");
  const [category, setCategory] = useState<"travel" | "life_info">("travel");
  const [selectedNewsSection, setSelectedNewsSection] = useState<string>("");
  
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  
  // AI Topics state
  const [topics, setTopics] = useState<RecommendedTopic[]>([]);
  // Google News state
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  
  // Saved bookmarks state
  const [savedLocalTopics, setSavedLocalTopics] = useState<RecommendedTopic[]>(() => {
    try {
      const saved = localStorage.getItem("wanderlust_pre_saved_topics");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("wanderlust_pre_saved_topics", JSON.stringify(savedLocalTopics));
    } catch (e) {
      console.error(e);
    }
  }, [savedLocalTopics]);

  // Load cache on category change
  useEffect(() => {
    try {
      const cacheKey = `wanderlust_cached_topics_${category}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setTopics(JSON.parse(cached));
      } else {
        // No cache: load default topics and save to cache immediately (no slow auto-reloads)
        const defaultList = category === "travel" ? DEFAULT_TRAVEL_TOPICS : DEFAULT_LIFE_TOPICS;
        setTopics(defaultList);
        localStorage.setItem(cacheKey, JSON.stringify(defaultList));
      }
    } catch (err) {
      console.error("Failed to load cached topics:", err);
      const defaultList = category === "travel" ? DEFAULT_TRAVEL_TOPICS : DEFAULT_LIFE_TOPICS;
      setTopics(defaultList);
    }
  }, [category]);

  // Fetch AI recommended topics
  const fetchRecommendations = async (targetCategory: "travel" | "life_info", isManualRefresh = true) => {
    setIsLoadingTopics(true);
    try {
      const response = await fetch("/api/generate-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: targetCategory }),
      });
      const data = await response.json();
      if (data.success && data.topics) {
        setTopics(data.topics);
        
        // Cache to localStorage
        const cacheKey = `wanderlust_cached_topics_${targetCategory}`;
        localStorage.setItem(cacheKey, JSON.stringify(data.topics));
        
        if (isManualRefresh) {
          onShowToast(`✨ 최적화 블로그 주제를 새로 추천해 드렸습니다!`);
        }
      } else {
        throw new Error(data.error || "추천 목록을 수집하지 못했습니다.");
      }
    } catch (error: any) {
      console.error(error);
      onShowToast(`❌ 추천 주제 생성 실패: ${error.message || "서버 오류"}`);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  // Fetch Google News articles
  const fetchNews = async (sectionCode: string) => {
    setIsLoadingNews(true);
    try {
      let url = "/api/google-news";
      if (sectionCode) {
        url += `?section=${sectionCode}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.success && data.articles) {
        setNewsArticles(data.articles);
        const sectionLabel = NEWS_SECTIONS.find(s => s.id === sectionCode)?.label || "핫 뉴스";
        onShowToast(`📰 [${sectionLabel}] 실시간 뉴스를 가져왔습니다.`);
      } else {
        throw new Error(data.error || "뉴스 데이터 오류");
      }
    } catch (error: any) {
      console.error(error);
      onShowToast(`⚠️ 구글 뉴스 동기화 오류: ${error.message || "연결 확인 필요"}`);
    } finally {
      setIsLoadingNews(false);
    }
  };

  // Trigger news fetch when section is changed
  useEffect(() => {
    if (activeSubTab === "google-news") {
      fetchNews(selectedNewsSection);
    }
  }, [selectedNewsSection, activeSubTab]);

  // Save selected topic to local bookmarks
  const toggleSaveTopic = (topic: RecommendedTopic) => {
    const isAlreadySaved = savedLocalTopics.some((t) => t.title === topic.title);
    if (isAlreadySaved) {
      setSavedLocalTopics((prev) => prev.filter((t) => t.title !== topic.title));
      onShowToast("🗑️ 임시저장된 주제에서 삭제되었습니다.");
    } else {
      setSavedLocalTopics((prev) => [...prev, topic]);
      onShowToast("⭐ 주제가 사전조사 임시저장소에 보관되었습니다.");
    }
  };

  // Handle immediate generation redirect
  const handleGenerateFromTopic = (topic: RecommendedTopic) => {
    onSelectTopic({
      title: topic.title,
      keywords: topic.keywords,
      categoryType: category,
      travelStyle: topic.travelStyle,
      duration: topic.duration,
    });
  };

  const handleGenerateFromNews = (article: NewsArticle) => {
    // Generate organic keywords based on news title using basic splitting
    const keywords = [
      article.source,
      "최신뉴스",
      "실시간이슈",
      article.title.split(" ").filter(word => word.length > 1).slice(0, 2).join("")
    ].filter(Boolean);

    onSelectTopic({
      title: `[실시간 트렌드] ${article.title}`,
      keywords,
      categoryType: "trend", // Custom trend category
      travelStyle: "🛍️ 주말 팝업스토어 & 한정판 굿즈 성지",
      duration: "실시간",
    });
  };

  return (
    <div id="pre-investigation-container" className="space-y-8 max-w-5xl mx-auto">
      {/* Visual Title / Context banner */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-200/50">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>최적화 블로그 사전조사</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            트렌드 검색최적화 사전조사
          </h1>
          <p className="text-sm text-stone-500 max-w-2xl">
            블로그를 쓰기 전에 트렌디한 키워드와 구글 실시간 핫뉴스를 분석하세요. 이전에 추천받았던 주제가 안전하게 자동 보관되며, 필요할 때 '재추천'을 받아 실시간 DIA+ 스마트블록 상위 노출 기회를 잡을 수 있습니다.
          </p>
        </div>
      </div>

      {/* Primary Sub Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveSubTab("ai-trends")}
          className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeSubTab === "ai-trends"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>AI 트렌드 주제 추천</span>
        </button>
        <button
          onClick={() => setActiveSubTab("google-news")}
          className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeSubTab === "google-news"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Newspaper className="w-4 h-4 text-amber-500" />
          <span>실시간 구글 뉴스 피드</span>
        </button>
      </div>

      {/* Sub Tab contents: AI Trends */}
      {activeSubTab === "ai-trends" && (
        <div className="space-y-6">
          {/* Category selection & Refresh block */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-stone-50 border border-stone-200 p-4 rounded-2xl">
            <div className="flex items-center justify-between p-1 bg-stone-200/60 rounded-xl w-full sm:w-auto sm:min-w-[340px]">
              <button
                onClick={() => setCategory("travel")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  category === "travel"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-stone-600 hover:text-stone-950"
                }`}
              >
                🏕️ 테마 여행 코스
              </button>
              <button
                onClick={() => setCategory("life_info")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  category === "life_info"
                    ? "bg-white text-amber-700 shadow-sm"
                    : "text-stone-600 hover:text-stone-950"
                }`}
              >
                💡 생활정보 / 꿀팁
              </button>
            </div>

            <button
              onClick={() => fetchRecommendations(category, true)}
              disabled={isLoadingTopics}
              className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/10 transition-all flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTopics ? "animate-spin" : ""}`} />
              <span>🔄 AI 최적화 주제 재추천받기</span>
            </button>
          </div>

          {/* Topics container */}
          {isLoadingTopics ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center space-y-4 shadow-sm">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-orange-100 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-sm font-semibold text-stone-700 animate-pulse">
                네이버 상위 노출 최적화 데이터 기반 글감 분석 중...
              </p>
              <p className="text-xs text-stone-400">네이버 C-Rank 알고리즘 및 인기 키워드를 크로스 체크하여 매력적인 추천 제목을 생성하고 있습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {topics.map((topic, index) => {
                const isSaved = savedLocalTopics.some((t) => t.title === topic.title);
                return (
                  <div
                    key={topic.id}
                    className="bg-white border border-stone-200 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/[0.02] p-5 sm:p-6 rounded-2xl transition-all flex flex-col sm:flex-row items-start justify-between gap-6"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xl">{topic.icon || "✨"}</span>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md border border-orange-100">
                          AI 주제 {index + 1}
                        </span>
                        <span className="text-[10px] font-semibold text-stone-400">
                          {topic.duration} · {topic.travelStyle}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {topic.description}
                      </p>
                      
                      {/* Keywords list */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-stone-400 font-bold mr-1">연관 키워드:</span>
                        {topic.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      <button
                        onClick={() => toggleSaveTopic(topic)}
                        className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1 ${
                          isSaved
                            ? "bg-stone-900 border-stone-900 text-white hover:bg-stone-800"
                            : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5 text-orange-400" />
                            <span>저장됨</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>저장</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleGenerateFromTopic(topic)}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-extrabold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/10 transition-all flex items-center justify-center space-x-1"
                      >
                        <span>글 작성하기</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Saved local topics block */}
          {savedLocalTopics.length > 0 && (
            <div className="mt-8 bg-stone-50 border border-stone-200/80 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-stone-500 flex items-center space-x-1">
                <Bookmark className="w-3.5 h-3.5 text-orange-500" />
                <span>내가 저장한 최적화 주제 북마크 ({savedLocalTopics.length})</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedLocalTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-white border border-stone-200 p-4 rounded-xl shadow-xs space-y-3 hover:border-orange-300 transition-all"
                  >
                    <div>
                      <h5 className="text-sm font-bold text-stone-900 line-clamp-1">{topic.title}</h5>
                      <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">{topic.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                      <div className="flex gap-1">
                        {topic.keywords.slice(0, 2).map((k, idx) => (
                          <span key={idx} className="text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
                            #{k}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleGenerateFromTopic(topic)}
                        className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-0.5"
                      >
                        <span>즉시 생성</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub Tab contents: Google News Feed */}
      {activeSubTab === "google-news" && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xl flex items-start space-x-2.5">
            <Flame className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-800">실시간 구글 뉴스 속보 분석 기능 (카테고리별 연동)</h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                오늘자 실시간 가장 핫한 뉴스의 제목을 섹션별로 동기화합니다. 경제, 생활, 연예, 스포츠 등 관심 있는 주제의 탭을 선택하면 구글 뉴스 피드 데이터를 실시간으로 새롭게 불러옵니다. 기사 제목 중 하나를 선택해 즉시 글을 생성하세요!
              </p>
            </div>
          </div>

          {/* Section categories bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-stone-100">
            {NEWS_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedNewsSection(sec.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all flex items-center space-x-1 border ${
                  selectedNewsSection === sec.id
                    ? "bg-stone-900 border-stone-900 text-white shadow-sm"
                    : `border-stone-200/80 text-stone-700 ${sec.color}`
                }`}
              >
                <span>{sec.label}</span>
              </button>
            ))}
          </div>

          {isLoadingNews ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center space-y-4 shadow-sm">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-100 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-sm font-semibold text-stone-700 animate-pulse">
                선택한 뉴스 카테고리 기사 파싱 중...
              </p>
              <p className="text-xs text-stone-400">구글 뉴스 피드 서버에 접속하여 실시간 헤드라인을 가져오고 있습니다.</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden divide-y divide-stone-100 shadow-sm">
              {newsArticles.map((article, index) => (
                <div
                  key={index}
                  className="p-5 hover:bg-stone-50/50 transition-all flex flex-col sm:flex-row items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-md bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">
                        {index + 1}
                      </span>
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                        {article.source}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {new Date(article.pubDate).toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' })} 업데이트
                      </span>
                    </div>

                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer referrerPolicy=no-referrer"
                      className="group inline-flex items-center text-sm sm:text-base font-bold text-stone-900 hover:text-orange-600 leading-snug transition-colors"
                    >
                      <span className="line-clamp-2">{article.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 shrink-0" />
                    </a>
                  </div>

                  <button
                    onClick={() => handleGenerateFromNews(article)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all flex items-center justify-center space-x-1.5 shrink-0 self-center"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>이 제목으로 블로그 생성</span>
                  </button>
                </div>
              ))}
              {newsArticles.length === 0 && (
                <div className="p-12 text-center text-stone-400 text-xs font-bold">
                  선택한 뉴스 카테고리에 실시간 등록된 신규 기사가 없습니다. 다른 섹션을 선택해 보세요.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
