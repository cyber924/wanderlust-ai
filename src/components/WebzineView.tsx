import React, { useState, useMemo, useRef } from "react";
import { getSafeUnsplashCoverUrl } from "../utils/imageHelper";
import {
  Sparkles,
  Search,
  Share2,
  Heart,
  Bookmark,
  Eye,
  Calendar,
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  TrendingUp,
  Tag,
  BookOpen,
  Filter,
  Flame,
  Globe2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BlogPost } from "../types";

const ITEMS_PER_PAGE = 12;

interface WebzineViewProps {
  articles: BlogPost[];
  onOpenArticle: (post: BlogPost) => void;
  onOpenEmbedModal: (post: BlogPost) => void;
  onLikeArticle: (postId: string) => void;
  onScrapArticle: (post: BlogPost) => void;
  onNavigateToGenerator: () => void;
  onSelectTemplateFromArticle: (post: BlogPost) => void;
  likedPostIds: Set<string>;
  scrappedPostIds: Set<string>;
}

const CATEGORY_TABS = [
  { id: "all", label: "전체 보기", icon: "✨" },
  { id: "food", label: "🍽️ 맛집 & 카페 투어", icon: "☕" },
  { id: "trend", label: "🔥 핫 트렌드 & 팝업", icon: "🔥" },
  { id: "overseas", label: "✈️ 해외 감성 여행", icon: "✈️" },
  { id: "domestic", label: "🇰🇷 국내/제주 힐링", icon: "🏖️" },
  { id: "life", label: "💡 생활/살림 꿀팁", icon: "💡" },
  { id: "budget", label: "💰 가성비 알뜰 코스", icon: "🪙" },
];

export const WebzineView: React.FC<WebzineViewProps> = ({
  articles,
  onOpenArticle,
  onOpenEmbedModal,
  onLikeArticle,
  onScrapArticle,
  onNavigateToGenerator,
  onSelectTemplateFromArticle,
  likedPostIds,
  scrappedPostIds,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "likes">("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const gridSectionRef = useRef<HTMLDivElement>(null);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: "recent" | "popular" | "likes") => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // Filtered & Sorted Articles
  const filteredArticles = useMemo(() => {
    return articles
      .filter((art) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = art.title.toLowerCase().includes(q);
          const matchesDest = art.destination.toLowerCase().includes(q);
          const matchesConcept = art.concept.toLowerCase().includes(q);
          const matchesTags = (art.hashtags || []).some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDest && !matchesConcept && !matchesTags) return false;
        }

        // Category filter
        if (selectedCategory === "all") return true;
        if (selectedCategory === "food") {
          return (
            art.categoryType === "food" ||
            art.categoryName?.includes("맛집") ||
            art.concept.includes("미식") ||
            art.concept.includes("카페") ||
            art.concept.includes("맛집") ||
            art.title.includes("맛집") ||
            art.title.includes("카페") ||
            art.title.includes("베이커리")
          );
        }
        if (selectedCategory === "trend") {
          return (
            art.categoryType === "trend" ||
            art.categoryName?.includes("트렌드") ||
            art.concept.includes("트렌드") ||
            art.concept.includes("러닝") ||
            art.concept.includes("팝업") ||
            art.concept.includes("디톡스") ||
            art.concept.includes("워케이션") ||
            art.title.includes("트렌드") ||
            art.title.includes("러닝") ||
            art.title.includes("팝업") ||
            art.title.includes("디톡스") ||
            art.title.includes("MZ")
          );
        }
        if (selectedCategory === "overseas") {
          return (
            art.categoryName?.includes("해외") ||
            art.destination.includes("파리") ||
            art.destination.includes("도쿄") ||
            art.destination.includes("유럽") ||
            art.destination.includes("일본") ||
            art.destination.includes("다낭")
          );
        }
        if (selectedCategory === "domestic") {
          return (
            art.categoryName?.includes("국내") ||
            art.destination.includes("제주") ||
            art.destination.includes("부산") ||
            art.destination.includes("강릉") ||
            art.destination.includes("서울")
          );
        }
        if (selectedCategory === "life") {
          return art.categoryType === "life_info" || art.categoryName?.includes("생활");
        }
        if (selectedCategory === "budget") {
          return (
            art.concept.includes("가성비") ||
            art.budget.includes("알뜰") ||
            art.budget.includes("0원") ||
            art.budget.includes("만원")
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "popular") return (b.views || 0) - (a.views || 0);
        if (sortBy === "likes") return (b.likes || 0) - (a.likes || 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [articles, searchQuery, selectedCategory, sortBy]);

  // Featured Hero Article (First article or highest view)
  const featuredArticle = filteredArticles[0] || articles[0];

  // Pagination calculation (12 items per page)
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ITEMS_PER_PAGE));
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (gridSectionRef.current) {
      gridSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in pb-16">
      {/* Magazine Editorial Hero Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-900 text-white shadow-xl sm:shadow-2xl border border-stone-800">
        <div className="absolute inset-0 z-0">
          <img
            src={
              featuredArticle?.coverImageUrl ||
              "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80"
            }
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80";
            }}
            alt="Hero cover"
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/70 to-transparent" />
        </div>

        <div className="relative z-10 p-5 sm:p-10 lg:p-12 max-w-4xl space-y-4 sm:space-y-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="px-3 py-1 bg-orange-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              <span>Wanderlust Webzine</span>
            </span>
            <span className="text-[10px] sm:text-xs text-orange-200 font-bold bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              📖 누구나 무료 열람 & 소스 퍼가기 지원
            </span>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h1 
              style={{ fontSize: "clamp(1.35rem, 3.5vw + 0.6rem, 3rem)" }}
              className="font-black text-white leading-snug sm:leading-tight tracking-tight"
            >
              {featuredArticle?.title || "당신의 감성을 깨우는 고품격 여행 매거진"}
            </h1>
            <p 
              style={{ fontSize: "clamp(0.75rem, 0.8vw + 0.5rem, 1rem)" }}
              className="text-stone-300 line-clamp-3 sm:line-clamp-2 max-w-2xl font-light leading-relaxed"
            >
              {featuredArticle?.subtitle ||
                "전 세계 여행 크리에이터들과 함께 빚어낸 생생한 코스와 고화질 스냅사진을 만나보세요."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 pt-2 w-full">
            {featuredArticle && (
              <>
                <button
                  onClick={() => onOpenArticle(featuredArticle)}
                  className="w-full sm:w-auto justify-center px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center space-x-2 active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>대문 기사 전체 읽기</span>
                </button>

                <button
                  onClick={() => onOpenEmbedModal(featuredArticle)}
                  className="w-full sm:w-auto justify-center px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-white/20 transition-all flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4 text-orange-400" />
                  <span>블로그로 퍼가기</span>
                </button>
              </>
            )}

            <button
              onClick={onNavigateToGenerator}
              className="w-full sm:w-auto sm:ml-auto justify-center px-4 py-3 bg-stone-800/80 hover:bg-stone-700 text-stone-200 font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-stone-700 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>직접 여행기 만들기 ➔</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-stone-200/80 shadow-sm space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="여행지, 도시명, 테마, 키워드로 웹진 검색..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-semibold text-stone-500 hidden sm:inline">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="w-full sm:w-auto px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-stone-700 focus:outline-none focus:border-orange-500"
            >
              <option value="recent">⏱️ 최신 발행순</option>
              <option value="popular">🔥 인기 조회순</option>
              <option value="likes">❤️ 좋아요 많은순</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div 
          className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleCategoryChange(tab.id)}
              className={`px-3.5 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                selectedCategory === tab.id
                  ? "bg-stone-900 text-white shadow-md shadow-stone-900/10"
                  : "bg-stone-100 hover:bg-stone-200/80 text-stone-600 hover:text-stone-900"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Magazine Articles Grid */}
      <div ref={gridSectionRef} className="space-y-4 sm:space-y-6 scroll-mt-24">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-base sm:text-lg">📚</span>
            <h2 className="text-base sm:text-xl font-black text-stone-900">
              {selectedCategory === "all" ? "전체 웹진 아티클" : "선택된 테마 아티클"}
            </h2>
            <span className="px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200/60 text-[10px] sm:text-xs font-bold rounded-full">
              총 {filteredArticles.length}편
            </span>
          </div>

          {filteredArticles.length > 0 && (
            <div className="text-[11px] sm:text-xs text-stone-500 font-medium">
              12개씩 보기 • <span className="text-stone-900 font-bold">{currentPage}</span> / {totalPages} 페이지
            </div>
          )}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-stone-200 space-y-3">
            <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-stone-300 mx-auto animate-pulse" />
            <p className="text-stone-600 font-bold text-sm sm:text-base">검색 조건에 맞는 아티클이 없습니다.</p>
            <p className="text-xs text-stone-400">다른 검색어 또는 카테고리를 선택해보세요.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginatedArticles.map((post) => {
                const isLiked = likedPostIds.has(post.id);
                const isScrapped = scrappedPostIds.has(post.id);

                const cacheBuster = `?v=${new Date(post.createdAt).getTime()}`;
                const rawUrl = getSafeUnsplashCoverUrl(post);
                const coverUrl = `${rawUrl}${rawUrl.includes("?") ? "&" : ""}${cacheBuster}`;

                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                  >
                    {/* Card Cover Image */}
                    <div
                      onClick={() => onOpenArticle(post)}
                      className="relative h-44 xs:h-48 sm:h-52 bg-stone-100 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={coverUrl}
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
                        }}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-black/50 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold rounded-lg border border-white/20 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-orange-400" />
                          <span>{post.destination}</span>
                        </span>

                        <span className="px-2 py-0.5 sm:px-2 sm:py-1 bg-orange-500 text-white text-[10px] sm:text-[11px] font-bold rounded-lg shadow-sm">
                          {post.duration}
                        </span>
                      </div>

                      {/* Bottom Info over photo */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] text-stone-200">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.views || 100}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                            {post.likes || 0}
                          </span>
                          <span className="ml-auto font-bold text-stone-300">
                            {post.categoryName || "여행기"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5 sm:space-y-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <h3
                          onClick={() => onOpenArticle(post)}
                          style={{ fontSize: "clamp(0.8125rem, 0.8vw + 0.5rem, 1rem)" }}
                          className="font-extrabold tracking-tight text-stone-900 leading-snug line-clamp-2 cursor-pointer group-hover:text-orange-600 transition-colors"
                        >
                          {post.title}
                        </h3>

                        <p 
                          style={{ fontSize: "clamp(0.656rem, 0.5vw + 0.5rem, 0.78rem)" }}
                          className="text-stone-500 line-clamp-2 leading-relaxed"
                        >
                          {post.subtitle}
                        </p>

                        {/* Hashtags */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {(post.hashtags || []).slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-stone-50 text-stone-500 text-[10px] rounded-md font-semibold border border-stone-200/60"
                            >
                              {tag.startsWith("#") ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Toolbar on Card */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Like button */}
                          <button
                            onClick={() => onLikeArticle(post.id)}
                            className={`p-2 rounded-xl border transition-all ${
                              isLiked
                                ? "bg-rose-50 border-rose-200 text-rose-600"
                                : "bg-stone-50 border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50"
                            }`}
                            title="좋아요"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`}
                            />
                          </button>

                          {/* Scrap button */}
                          <button
                            onClick={() => onScrapArticle(post)}
                            className={`p-2 rounded-xl border transition-all ${
                              isScrapped
                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                : "bg-stone-50 border-stone-200 text-stone-500 hover:text-amber-600 hover:bg-amber-50"
                            }`}
                            title="내 보관함에 스크랩"
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${isScrapped ? "fill-amber-500 text-amber-500" : ""}`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Embed Share button */}
                          <button
                            onClick={() => onOpenEmbedModal(post)}
                            className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center space-x-1"
                            title="네이버/티스토리로 퍼가기"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>퍼가기</span>
                          </button>

                          {/* Read full */}
                          <button
                            onClick={() => onOpenArticle(post)}
                            className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all"
                          >
                            읽기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 12-Item Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-6 pb-2 flex-wrap">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-2 sm:px-4 sm:py-2.5 bg-white hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-white text-stone-700 rounded-xl sm:rounded-2xl border border-stone-200 text-xs sm:text-sm font-bold transition-all flex items-center space-x-1 shadow-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>이전</span>
                </button>

                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center ${
                        currentPage === pageNum
                          ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                          : "bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/80 shadow-xs"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-2 sm:px-4 sm:py-2.5 bg-white hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-white text-stone-700 rounded-xl sm:rounded-2xl border border-stone-200 text-xs sm:text-sm font-bold transition-all flex items-center space-x-1 shadow-xs"
                >
                  <span>다음</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Viral Footer Guide Banner */}
      <div className="p-5 sm:p-8 bg-stone-100 rounded-2xl sm:rounded-3xl border border-stone-200/80 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <h3 className="font-bold text-base sm:text-lg text-stone-900 flex items-center justify-center md:justify-start gap-2">
            <Globe2 className="w-5 h-5 text-orange-500" />
            <span>Wanderlust 웹진 생태계 안내</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-stone-600 max-w-xl leading-relaxed">
            웹진의 모든 콘텐츠는 <strong>로그인 없이 누구나 자유롭게 열람</strong>할 수 있으며, 네이버 블로그, 티스토리, 마크다운으로 <strong>원클릭 소스 퍼가기</strong>가 가능합니다. 퍼가실 때는 공식 출처 배너가 자동으로 첨부되어 검색 유입과 신뢰도가 함께 상승합니다.
          </p>
        </div>

        <button
          onClick={onNavigateToGenerator}
          className="w-full md:w-auto px-5 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center space-x-2 shrink-0 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>나만의 여행기 생성하기</span>
        </button>
      </div>
    </div>
  );
};
