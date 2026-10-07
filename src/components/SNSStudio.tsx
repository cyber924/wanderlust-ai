import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Share2,
  RefreshCw,
  Film,
  Instagram,
  ChevronLeft,
  ChevronRight,
  Palette,
  FileText,
  Hash,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Send,
  Archive,
  Trash2,
  Clock,
  Search,
  CheckSquare,
  Square,
  Zap,
  Bookmark,
} from "lucide-react";
import { SNSPackage, BlogPost, CardSlide } from "../types";

interface SNSStudioProps {
  savedPosts?: BlogPost[];
  onOpenBlogView?: (post: BlogPost) => void;
}

export type PlatformType = "instagram" | "threads" | "twitterX" | "metaFacebook" | "shortform";

interface PlatformOption {
  id: PlatformType;
  label: string;
  subLabel: string;
  icon: string;
  defaultBadge: string;
  tagColor: string;
}

const PLATFORM_OPTIONS: PlatformOption[] = [
  {
    id: "instagram",
    label: "인스타그램",
    subLabel: "4:5 카드뉴스 & 캡션/해시태그",
    icon: "📸",
    defaultBadge: "카드뉴스 4장",
    tagColor: "bg-pink-100 text-pink-700 border-pink-200",
  },
  {
    id: "threads",
    label: "스레드",
    subLabel: "솔직공감 3단계 연속 타래 (1/3)",
    icon: "🧵",
    defaultBadge: "연속 타래 3개",
    tagColor: "bg-stone-100 text-stone-800 border-stone-300",
  },
  {
    id: "twitterX",
    label: "𝕏 (트위터)",
    subLabel: "250자 고밀도 정보 압축 트윗",
    icon: "𝕏",
    defaultBadge: "250자 압축",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "metaFacebook",
    label: "메타 (페이스북)",
    subLabel: "3050 커뮤니티 맞춤 상세 포스트",
    icon: "👥",
    defaultBadge: "상세 가이드",
    tagColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    id: "shortform",
    label: "숏폼 (릴스·쇼츠·틱톡)",
    subLabel: "초고속 후킹 씬별 화면연출 & 대본",
    icon: "🎬",
    defaultBadge: "씬별 연출대본",
    tagColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

// Card news theme presets for live styling
interface CardTheme {
  id: string;
  name: string;
  bgGradient: string;
  cardBg: string;
  textColor: string;
  accentBadgeBg: string;
  accentBadgeText: string;
  bulletBg: string;
  footerColor: string;
}

const CARD_THEMES: CardTheme[] = [
  {
    id: "modern-dark",
    name: "모던 다크",
    bgGradient: "from-stone-900 via-stone-800 to-black",
    cardBg: "bg-stone-900/90 border-stone-700/80",
    textColor: "text-white",
    accentBadgeBg: "bg-orange-500",
    accentBadgeText: "text-white",
    bulletBg: "bg-stone-800/80 text-stone-200 border-stone-700",
    footerColor: "text-stone-400",
  },
  {
    id: "warm-sunset",
    name: "웜 선셋",
    bgGradient: "from-amber-900 via-orange-950 to-stone-900",
    cardBg: "bg-stone-900/90 border-amber-600/40",
    textColor: "text-amber-50",
    accentBadgeBg: "bg-gradient-to-r from-amber-500 to-orange-500",
    accentBadgeText: "text-white",
    bulletBg: "bg-amber-950/70 text-amber-100 border-amber-800/60",
    footerColor: "text-amber-400/80",
  },
  {
    id: "minimal-beige",
    name: "감성 베이지",
    bgGradient: "from-stone-100 via-amber-50/50 to-stone-200",
    cardBg: "bg-white/95 border-stone-300",
    textColor: "text-stone-900",
    accentBadgeBg: "bg-stone-900",
    accentBadgeText: "text-white",
    bulletBg: "bg-stone-50 text-stone-800 border-stone-200",
    footerColor: "text-stone-500",
  },
  {
    id: "sage-green",
    name: "힐링 세이지",
    bgGradient: "from-emerald-950 via-stone-900 to-teal-950",
    cardBg: "bg-stone-900/90 border-emerald-700/40",
    textColor: "text-emerald-50",
    accentBadgeBg: "bg-emerald-600",
    accentBadgeText: "text-white",
    bulletBg: "bg-emerald-950/80 text-emerald-100 border-emerald-800/60",
    footerColor: "text-emerald-400/70",
  },
];

const LOCAL_STORAGE_KEY = "wanderlust_saved_sns_packages";

export const SNSStudio: React.FC<SNSStudioProps> = ({ savedPosts = [], onOpenBlogView }) => {
  // Main Sub-Tab: "create" (생성기) vs "archive" (SNS 전용 보관함)
  const [subTab, setSubTab] = useState<"create" | "archive">("create");

  // Input Form States (독립 주제 입력)
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState<"travel" | "life_info" | "food" | "general">("travel");
  const [targetAudience, setTargetAudience] = useState("2030 트렌드 세터 및 여행/정보 탐색러");
  const [tone, setTone] = useState("감성적이고 트렌디한 인플루언서 톤 (~했어요, 저장필수!)");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(["핫플레이스", "인생샷", "꿀팁정리"]);
  const [selectedSourcePostId, setSelectedSourcePostId] = useState<string>("");

  // Platform selection state: Default is Instagram + Threads (User can choose 1 to 5)
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(["instagram", "threads"]);

  // Generation & Result States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [snsPackage, setSnsPackage] = useState<SNSPackage | null>(null);

  // Active Platform View Tab in Result
  const [activePlatform, setActivePlatform] = useState<PlatformType>("instagram");

  // Card News Interactive Carousel State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [cardTheme, setCardTheme] = useState<CardTheme>(CARD_THEMES[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Slide ref for canvas download
  const cardSlideRef = useRef<HTMLDivElement>(null);

  // SNS Saved Archive State
  const [savedPackages, setSavedPackages] = useState<SNSPackage[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Archive search term
  const [archiveSearchTerm, setArchiveSearchTerm] = useState("");
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Sync saved packages to LocalStorage
  const persistSavedPackages = (updated: SNSPackage[]) => {
    setSavedPackages(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  };

  // Quick Preset Topics
  const PRESET_TOPICS = [
    {
      label: "제주 뚜벅이 감성 코스",
      topic: "제주도 동쪽 2박3일 뚜벅이 감성 카페 & 바다 코스",
      category: "travel" as const,
      keywords: ["제주뚜벅이", "월정리", "감성카페", "버스여행"],
    },
    {
      label: "에어컨 전기세 절약법",
      topic: "여름철 에어컨 전기세 반값으로 줄이는 실전 가동 꿀팁",
      category: "life_info" as const,
      keywords: ["에어컨절약", "전기세할인", "살림꿀팁", "스마트인버터"],
    },
    {
      label: "성수동 줄 서는 빵집 BEST 5",
      topic: "2026 성수동 오픈런 줄 서서 먹는 신상 베이커리 맛집 BEST 5",
      category: "food" as const,
      keywords: ["성수동맛집", "빵지순례", "오픈런", "베이커리카페"],
    },
    {
      label: "강릉 바다열차 당일치기",
      topic: "KTX 타고 떠나는 강릉 안목해변 커피거리 & 해안도로 당일치기",
      category: "travel" as const,
      keywords: ["강릉여행", "바다열차", "안목해변", "당일치기"],
    },
  ];

  const handleTogglePlatform = (pId: PlatformType) => {
    if (selectedPlatforms.includes(pId)) {
      if (selectedPlatforms.length === 1) {
        setErrorMessage("최소 1개 이상의 플랫폼을 선택해야 합니다!");
        setTimeout(() => setErrorMessage(null), 2500);
        return;
      }
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== pId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, pId]);
    }
  };

  const handleSelectAllPlatforms = () => {
    setSelectedPlatforms(["instagram", "threads", "twitterX", "metaFacebook", "shortform"]);
  };

  const handleSelectRecommendedPlatforms = () => {
    setSelectedPlatforms(["instagram", "threads"]);
  };

  const handleAddKeyword = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    if (!keywordInput.trim()) return;
    if (!keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
    }
    setKeywordInput("");
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    setKeywords(keywords.filter((k) => k !== kwToRemove));
  };

  // Copy helper with feedback
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Import from saved blog post
  const handleSelectSourcePost = (postId: string) => {
    setSelectedSourcePostId(postId);
    const found = savedPosts.find((p) => p.id === postId);
    if (found) {
      setTopic(found.title);
      if (found.categoryType === "life_info") {
        setCategory("life_info");
      } else {
        setCategory("travel");
      }
      if (found.hashtags && found.hashtags.length > 0) {
        setKeywords(found.hashtags.map((t) => t.replace("#", "")).slice(0, 5));
      }
    }
  };

  // Generate All-in-One SNS Package with Selected Platforms Only
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMessage("SNS 콘텐츠로 제작할 주제를 입력해주세요!");
      return;
    }

    if (selectedPlatforms.length === 0) {
      setErrorMessage("제작할 플랫폼을 1개 이상 선택해주세요!");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    const platformLabels = selectedPlatforms
      .map((p) => PLATFORM_OPTIONS.find((opt) => opt.id === p)?.label || p)
      .join(", ");

    setGenerationStep(`선택하신 [${platformLabels}] 콘텐츠를 생성하고 있습니다...`);

    const sourcePost = selectedSourcePostId
      ? savedPosts.find((p) => p.id === selectedSourcePostId)
      : null;

    try {
      const res = await fetch("/api/generate-sns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          category,
          targetAudience,
          tone,
          keywords,
          selectedPlatforms,
          sourceContent: sourcePost ? sourcePost.markdownContent : "",
          sourceBlogId: sourcePost ? sourcePost.id : "",
          sourceBlogTitle: sourcePost ? sourcePost.title : "",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "SNS 콘텐츠 생성에 실패했습니다.");
      }

      setSnsPackage(data.data);
      setCurrentSlideIndex(0);

      // Set active platform to the first available selected platform
      if (data.data.selectedPlatforms && data.data.selectedPlatforms.length > 0) {
        setActivePlatform(data.data.selectedPlatforms[0]);
      } else if (data.data.instagram) {
        setActivePlatform("instagram");
      } else if (data.data.threads) {
        setActivePlatform("threads");
      }

      // Automatically auto-save to archive for convenience
      const exists = savedPackages.some((p) => p.id === data.data.id);
      if (!exists) {
        persistSavedPackages([data.data, ...savedPackages]);
      }
    } catch (err: any) {
      console.error("SNS Generation failed:", err);
      setErrorMessage(err.message || "생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // Save current package to archive explicitly
  const handleSaveToArchive = () => {
    if (!snsPackage) return;
    const exists = savedPackages.some((p) => p.id === snsPackage.id);
    if (!exists) {
      persistSavedPackages([snsPackage, ...savedPackages]);
    }
    setSaveSuccessNotice("보관함에 안전하게 저장되었습니다! 📂");
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  // Delete from archive
  const handleDeleteFromArchive = (packageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("정말 이 SNS 패키지를 보관함에서 삭제하시겠습니까?")) return;
    const updated = savedPackages.filter((p) => p.id !== packageId);
    persistSavedPackages(updated);
  };

  // Open a package from archive
  const handleOpenArchivedPackage = (pkg: SNSPackage) => {
    setSnsPackage(pkg);
    setCurrentSlideIndex(0);
    const firstPlatform = pkg.selectedPlatforms?.[0] || (pkg.instagram ? "instagram" : "threads");
    setActivePlatform(firstPlatform as PlatformType);
    setSubTab("create");
  };

  // Download Card as Image (Canvas snapshot)
  const handleDownloadCurrentCard = () => {
    if (!snsPackage || !snsPackage.instagram || !snsPackage.instagram.cardSlides) return;
    const slide = snsPackage.instagram.cardSlides[currentSlideIndex];
    if (!slide) return;

    const canvas = document.createElement("canvas");
    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    if (cardTheme.id === "minimal-beige") {
      grad.addColorStop(0, "#F7F5F0");
      grad.addColorStop(1, "#EAE5D9");
    } else if (cardTheme.id === "warm-sunset") {
      grad.addColorStop(0, "#2D150B");
      grad.addColorStop(1, "#0F0704");
    } else if (cardTheme.id === "sage-green") {
      grad.addColorStop(0, "#08201D");
      grad.addColorStop(1, "#030A09");
    } else {
      grad.addColorStop(0, "#1F1F1F");
      grad.addColorStop(1, "#0A0A0A");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Header Tag
    ctx.fillStyle = cardTheme.id === "minimal-beige" ? "#E26D2D" : "#FF6B35";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(slide.badge || `CARD ${slide.slideNumber}`, 90, 140);

    // Topic badge
    ctx.fillStyle = cardTheme.id === "minimal-beige" ? "#666" : "#A3A3A3";
    ctx.font = "500 28px sans-serif";
    ctx.fillText(snsPackage.topic.slice(0, 30), 90, 190);

    // Card Title
    ctx.fillStyle = cardTheme.id === "minimal-beige" ? "#1A1A1A" : "#FFFFFF";
    ctx.font = "bold 54px sans-serif";

    // Multi-line Title handling
    const words = slide.title.split(" ");
    let line = "";
    let y = 300;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 900 && n > 0) {
        ctx.fillText(line, 90, y);
        line = words[n] + " ";
        y += 75;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 90, y);

    // Points
    y += 90;
    ctx.font = "32px sans-serif";
    slide.points.forEach((pt) => {
      ctx.fillStyle = cardTheme.id === "minimal-beige" ? "#2B2B2B" : "#E5E5E5";
      const bulletText = `•  ${pt}`;
      ctx.fillText(bulletText, 90, y);
      y += 85;
    });

    // Footer
    ctx.fillStyle = cardTheme.id === "minimal-beige" ? "#888" : "#737373";
    ctx.font = "26px sans-serif";
    ctx.fillText("Wanderlust AI Studio | 저장 & 공유", 90, 1260);

    // Trigger download
    const link = document.createElement("a");
    link.download = `instagram-card-${slide.slideNumber}-${snsPackage.topic.slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Filter archived packages
  const filteredArchive = savedPackages.filter((p) => {
    if (!archiveSearchTerm.trim()) return true;
    return (
      p.topic.toLowerCase().includes(archiveSearchTerm.toLowerCase()) ||
      (p.keyMessage && p.keyMessage.toLowerCase().includes(archiveSearchTerm.toLowerCase()))
    );
  });

  // Calculate which platforms are present in the current package
  const availableResultPlatforms = PLATFORM_OPTIONS.filter((opt) => {
    if (!snsPackage) return false;
    if (snsPackage.selectedPlatforms) {
      return snsPackage.selectedPlatforms.includes(opt.id);
    }
    return Boolean((snsPackage as any)[opt.id]);
  });

  const isCurrentPackageSaved = Boolean(snsPackage && savedPackages.some((p) => p.id === snsPackage.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-neutral-900 to-stone-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-stone-700/50">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-gradient-to-br from-orange-500/20 to-rose-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ALL-IN-ONE OMNICHANNEL SNS STUDIO</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            원클릭 5대 플랫폼 <span className="text-orange-400">SNS 맞춤 스튜디오</span>
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            원하는 플랫폼만 <strong>선택</strong>하여 <strong>3~5초 초고속</strong>으로 SNS 콘텐츠를 완성하세요.
            제작된 모든 결과물은 <strong>전용 SNS 보관함</strong>에 언제든 안전하게 보관되고 재열람할 수 있습니다.
          </p>

          {/* Sub Tab Switcher: [✨ SNS 콘텐츠 제작] vs [📂 SNS 보관함 (N)] */}
          <div className="pt-3 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSubTab("create")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                subTab === "create"
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : "bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ SNS 콘텐츠 제작기</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab("archive")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
                subTab === "archive"
                  ? "bg-stone-100 text-stone-900 shadow-lg"
                  : "bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10"
              }`}
            >
              <Archive className="w-4 h-4 text-amber-400" />
              <span>📂 SNS 보관함</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500 text-white">
                {savedPackages.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: SNS ARCHIVE VIEW */}
      {subTab === "archive" ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 flex items-center space-x-2">
                <Archive className="w-5 h-5 text-orange-500" />
                <span>SNS 보관함</span>
                <span className="text-sm font-bold text-stone-400">({savedPackages.length}개 저장됨)</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                생성된 SNS 카드뉴스, 스레드 타래, X 트윗, 숏폼 대본이 영구 보관되어 언제든 다시 열람할 수 있습니다.
              </p>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center space-x-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="보관된 주제 검색..."
                  value={archiveSearchTerm}
                  onChange={(e) => setArchiveSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setSubTab("create")}
                className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap"
              >
                + 새 SNS 생성
              </button>
            </div>
          </div>

          {/* Archived Items Grid */}
          {filteredArchive.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-2xl">
                📭
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-800">
                  {archiveSearchTerm ? "검색 결과가 없습니다." : "보관된 SNS 패키지가 없습니다."}
                </h3>
                <p className="text-xs text-stone-500">
                  새로운 주제를 입력하여 인스타, 스레드 등 원하는 SNS 패키지를 생성해 보세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubTab("create")}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>새 SNS 콘텐츠 만들기</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredArchive.map((pkg) => {
                const createdDate = new Date(pkg.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const platforms = pkg.selectedPlatforms || ["instagram", "threads"];

                return (
                  <div
                    key={pkg.id}
                    onClick={() => handleOpenArchivedPackage(pkg)}
                    className="group p-5 rounded-2xl border border-stone-200 hover:border-orange-300 hover:shadow-lg transition-all bg-white flex flex-col justify-between cursor-pointer space-y-4 relative"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-stone-100 text-stone-700">
                          {pkg.category === "travel"
                            ? "✈️ 여행"
                            : pkg.category === "life_info"
                            ? "💡 생활정보"
                            : pkg.category === "food"
                            ? "🍽️ 맛집"
                            : "📌 일반"}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-stone-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{createdDate}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteFromArchive(pkg.id, e)}
                            className="p-1 rounded-lg text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            title="보관함에서 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-extrabold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                        {pkg.topic}
                      </h3>

                      {pkg.keyMessage && (
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {pkg.keyMessage}
                        </p>
                      )}
                    </div>

                    {/* Platforms Badges */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {platforms.map((pId) => {
                          const opt = PLATFORM_OPTIONS.find((o) => o.id === pId);
                          return (
                            <span
                              key={pId}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700"
                            >
                              {opt?.icon} {opt?.label}
                            </span>
                          );
                        })}
                      </div>

                      <span className="text-xs font-bold text-orange-600 flex items-center space-x-0.5 group-hover:translate-x-1 transition-transform">
                        <span>열람</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: SNS CREATION STUDIO (Form & Results) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input Form & Platform Selector (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
                    ✍️
                  </div>
                  <h2 className="text-base font-bold text-stone-900">새 SNS 주제 입력하기</h2>
                </div>
                <span className="text-xs text-stone-400 font-medium">독립 생성 모드</span>
              </div>

              {/* 1. NEW FEATURE: Platform Selector (User Selects 1 to 5 platforms) */}
              <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-stone-800 flex items-center space-x-1.5">
                    <span className="text-orange-500">🎯</span>
                    <span>생성할 플랫폼 선택 ({selectedPlatforms.length}/5)</span>
                  </label>
                  <div className="flex items-center space-x-1 text-[11px]">
                    <button
                      type="button"
                      onClick={handleSelectRecommendedPlatforms}
                      className="px-2 py-0.5 rounded-md font-bold text-orange-600 hover:bg-orange-100/60 transition-colors"
                    >
                      ⚡ 추천(인스타+스레드)
                    </button>
                    <span className="text-stone-300">|</span>
                    <button
                      type="button"
                      onClick={handleSelectAllPlatforms}
                      className="px-2 py-0.5 rounded-md font-bold text-stone-600 hover:bg-stone-200 transition-colors"
                    >
                      전체선택
                    </button>
                  </div>
                </div>

                {/* Speed indicator callout */}
                <div className="flex items-center space-x-1.5 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200/60">
                  <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    <strong>선택한 {selectedPlatforms.length}개 플랫폼만</strong> 즉시 생성하여 속도가 3~5배 빨라집니다!
                  </span>
                </div>

                {/* Platform Checkbox Grid */}
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {PLATFORM_OPTIONS.map((plat) => {
                    const isSelected = selectedPlatforms.includes(plat.id);
                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => handleTogglePlatform(plat.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-white border-orange-500 shadow-sm ring-1 ring-orange-500/20"
                            : "bg-white/60 border-stone-200 hover:border-stone-300 opacity-70"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-base">{plat.icon}</span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-xs font-bold ${
                                  isSelected ? "text-stone-900" : "text-stone-600"
                                }`}
                              >
                                {plat.label}
                              </span>
                              <span className="text-[10px] text-stone-400">
                                {plat.subLabel}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-orange-500" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-300" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  ⚡ 빠른 추천 주제
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TOPICS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTopic(p.topic);
                        setCategory(p.category);
                        setKeywords(p.keywords);
                        setSelectedSourcePostId("");
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg bg-stone-100 hover:bg-orange-50 hover:text-orange-600 text-stone-700 font-medium transition-colors border border-stone-200/60"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Topic Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                  <span>SNS 콘텐츠 주제 (필수)</span>
                  <span className="text-[11px] text-stone-400 font-normal">블로그와 무관하게 자유 입력</span>
                </label>
                <textarea
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="예: 2박3일 차 없이 떠나는 제주 동쪽 감성 숙소와 카페 완벽 코스"
                  className="w-full p-3.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none font-medium text-stone-800"
                />
              </div>

              {/* Category & Tone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">카테고리</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="travel">✈️ 여행 / 투어</option>
                    <option value="life_info">💡 생활정보 / 꿀팁</option>
                    <option value="food">🍽️ 맛집 / 카페</option>
                    <option value="general">📌 일반 / 트렌드</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">톤앤매너</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="감성적이고 트렌디한 인플루언서 톤 (~했어요, 저장필수!)">
                      ✨ 인스타 감성 인플루언서
                    </option>
                    <option value="솔직담백하고 위트있는 찐친 대화체 (~썰 풉니다)">
                      🧵 스레드 찐친 대화체
                    </option>
                    <option value="팩트 위주 실전 꿀팁 총정리 톤 (체크리스트)">
                      📌 팩트 위주 핵심 정리
                    </option>
                    <option value="재치있고 흡입력 높은 숏폼 후킹 톤">
                      🎬 숏폼 시선강탈 톤
                    </option>
                  </select>
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">타겟 독자</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="예: 2030 뚜벅이 여행러, 주말 나들이족"
                  className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium text-stone-800"
                />
              </div>

              {/* Keywords Tagging */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700">핵심 키워드 & 해시태그</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleAddKeyword}
                    placeholder="키워드 입력 후 Enter"
                    className="flex-1 p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200"
                    >
                      <span>#{kw}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="text-orange-400 hover:text-orange-700 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Optional: Repurpose from existing blog post */}
              {savedPosts.length > 0 && (
                <div className="pt-2 border-t border-stone-100 space-y-2">
                  <label className="text-xs font-bold text-stone-500 flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                    <span>(선택) 내 보관함 블로그 글에서 주제 가져오기</span>
                  </label>
                  <select
                    value={selectedSourcePostId}
                    onChange={(e) => handleSelectSourcePost(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white font-medium text-stone-700"
                  >
                    <option value="">직접 새로운 주제 작성하기 (기본)</option>
                    {savedPosts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.destination})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 animate-shake">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Generate Button */}
              <button
                type="button"
                disabled={isGenerating || !topic.trim() || selectedPlatforms.length === 0}
                onClick={handleGenerate}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>선택한 {selectedPlatforms.length}개 플랫폼 콘텐츠 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    <span>
                      선택한 {selectedPlatforms.length}개 플랫폼 즉시 생성하기 (초고속 ⚡)
                    </span>
                  </>
                )}
              </button>

              {/* Generation step feedback */}
              {isGenerating && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs font-medium text-orange-800 flex items-center space-x-2 animate-pulse">
                  <Zap className="w-4 h-4 text-orange-500 animate-bounce shrink-0" />
                  <span>{generationStep}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Multi-Platform Result & Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {!snsPackage ? (
              /* Empty State Placeholder */
              <div className="bg-white rounded-3xl p-10 sm:p-14 border border-stone-200 shadow-sm text-center space-y-5">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-100 via-amber-50 to-stone-100 flex items-center justify-center mx-auto text-3xl shadow-inner border border-orange-200/50">
                  📱
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-lg font-extrabold text-stone-800">
                    원하는 플랫폼만 골라 3초 만에 생성하세요
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                    좌측에서 원하는 주제와 <strong>인스타, 스레드, X, 메타, 숏폼</strong> 중 필요한 플랫폼만 체크하면
                    즉시 맞춤 결과물이 나타납니다.
                  </p>
                </div>

                <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
                  {PLATFORM_OPTIONS.map((plat) => (
                    <div key={plat.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                      <span className="text-lg">{plat.icon}</span>
                      <h4 className="text-xs font-bold text-stone-900 mt-1">{plat.label}</h4>
                      <p className="text-[11px] text-stone-500">{plat.defaultBadge}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Results Container */
              <div className="space-y-5">
                {/* Result Header & Save to Archive Button */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>생성 완료 ({availableResultPlatforms.length}개 플랫폼)</span>
                      </span>
                      {isCurrentPackageSaved && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center space-x-1">
                          <Bookmark className="w-3 h-3 text-amber-600" />
                          <span>보관함 저장됨</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-stone-900 line-clamp-1">
                      {snsPackage.topic}
                    </h2>
                  </div>

                  {/* Actions: Save to Archive & Copy */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleSaveToArchive}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-black text-white transition-all flex items-center space-x-1.5 shadow-sm"
                    >
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isCurrentPackageSaved ? "보관함에 보관됨 ✓" : "SNS 보관함에 저장"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        let fullText = `[SNS 패키지: ${snsPackage.topic}]\n\n`;
                        if (snsPackage.instagram) {
                          fullText += `■ 인스타그램 캡션:\n${snsPackage.instagram.caption}\n\n해시태그: ${snsPackage.instagram.hashtags.join(" ")}\n\n`;
                        }
                        if (snsPackage.threads) {
                          fullText += `■ 스레드 타래:\n${snsPackage.threads.posts.join("\n---\n")}\n\n`;
                        }
                        if (snsPackage.twitterX) {
                          fullText += `■ X(트위터) 트윗:\n${snsPackage.twitterX.tweet}\n\n`;
                        }
                        if (snsPackage.metaFacebook) {
                          fullText += `■ 메타(페이스북):\n${snsPackage.metaFacebook.post}\n\n`;
                        }
                        if (snsPackage.shortform) {
                          fullText += `■ 숏폼 대본 (Hook: ${snsPackage.shortform.hook}):\n` +
                            snsPackage.shortform.scenes.map((s) => `[씬 ${s.sceneNumber}] 자막: "${s.onScreenText}" / 대사: ${s.spokenScript}`).join("\n");
                        }
                        handleCopy(fullText, "all-pkg");
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 transition-all flex items-center space-x-1.5"
                    >
                      {copiedKey === "all-pkg" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>전체 복사됨!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>전체 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Save notice toast */}
                {saveSuccessNotice && (
                  <div className="p-3 rounded-2xl bg-stone-900 text-white text-xs font-bold flex items-center justify-between shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Bookmark className="w-4 h-4 text-amber-400" />
                      <span>{saveSuccessNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubTab("archive")}
                      className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-extrabold"
                    >
                      보관함 바로가기 →
                    </button>
                  </div>
                )}

                {/* Dynamic Platform Tabs Switcher (Shows ONLY generated platforms) */}
                <div className="flex items-center space-x-1.5 bg-stone-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
                  {availableResultPlatforms.map((p) => {
                    let badgeText = "";
                    if (p.id === "instagram" && snsPackage.instagram) {
                      badgeText = `${snsPackage.instagram.cardSlides.length}장`;
                    } else if (p.id === "threads" && snsPackage.threads) {
                      badgeText = `${snsPackage.threads.posts.length}개 타래`;
                    } else if (p.id === "twitterX" && snsPackage.twitterX) {
                      badgeText = "250자";
                    } else if (p.id === "metaFacebook" && snsPackage.metaFacebook) {
                      badgeText = "페이스북";
                    } else if (p.id === "shortform" && snsPackage.shortform) {
                      badgeText = `${snsPackage.shortform.scenes.length}씬`;
                    }

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setActivePlatform(p.id)}
                        className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          activePlatform === p.id
                            ? "bg-white text-stone-900 shadow-sm border border-stone-200"
                            : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                        }`}
                      >
                        <span>{p.icon}</span>
                        <span>{p.label}</span>
                        {badgeText && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                              activePlatform === p.id
                                ? "bg-orange-100 text-orange-700"
                                : "bg-stone-200 text-stone-500"
                            }`}
                          >
                            {badgeText}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 1. INSTAGRAM VIEW */}
                {activePlatform === "instagram" && snsPackage.instagram && (
                  <div className="space-y-6">
                    {/* Card News Interactive Studio */}
                    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <h3 className="text-base font-extrabold text-stone-900 flex items-center space-x-2">
                            <span>📸 1080×1350 (4:5) 카드뉴스 슬라이더</span>
                            <span className="text-xs font-normal text-stone-400">
                              (총 {snsPackage.instagram.cardSlides.length}장)
                            </span>
                          </h3>
                          <p className="text-xs text-stone-500">
                            인스타그램 최적 4:5 비율입니다. 장표별 PNG 다운로드가 가능합니다.
                          </p>
                        </div>

                        {/* Theme selector */}
                        <div className="flex items-center space-x-1.5">
                          <Palette className="w-4 h-4 text-stone-400" />
                          <span className="text-xs font-bold text-stone-600 mr-1">테마:</span>
                          {CARD_THEMES.map((theme) => (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => setCardTheme(theme)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                cardTheme.id === theme.id
                                  ? "bg-stone-900 text-white border-stone-900"
                                  : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                              }`}
                            >
                              {theme.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card Carousel Preview (4:5 Ratio) */}
                      {snsPackage.instagram.cardSlides.length > 0 && (
                        <div className="relative max-w-sm sm:max-w-md mx-auto">
                          {/* Slide Container */}
                          <div
                            ref={cardSlideRef}
                            className={`aspect-[4/5] rounded-3xl p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all bg-gradient-to-b ${cardTheme.bgGradient}`}
                          >
                            {/* AI Background Snapshot overlay */}
                            {snsPackage.instagram.cardSlides[currentSlideIndex]?.imageUrl && (
                              <div className="absolute inset-0 z-0 opacity-25">
                                <img
                                  src={snsPackage.instagram.cardSlides[currentSlideIndex].imageUrl}
                                  alt="Card slide visual"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover mix-blend-luminosity filter blur-[1px]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                              </div>
                            )}

                            {/* Card Header Tag */}
                            <div className="relative z-10 flex items-center justify-between">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase shadow-sm ${cardTheme.accentBadgeBg} ${cardTheme.accentBadgeText}`}
                              >
                                {snsPackage.instagram.cardSlides[currentSlideIndex]?.badge ||
                                  `CARD ${currentSlideIndex + 1}`}
                              </span>
                              <span className="text-xs font-bold text-white/60 font-mono">
                                {currentSlideIndex + 1} / {snsPackage.instagram.cardSlides.length}
                              </span>
                            </div>

                            {/* Card Center: Title & Bullet Points */}
                            <div className="relative z-10 space-y-4 my-auto">
                              <h4 className={`text-xl sm:text-2xl font-black leading-tight ${cardTheme.textColor}`}>
                                {snsPackage.instagram.cardSlides[currentSlideIndex]?.title}
                              </h4>
                              {snsPackage.instagram.cardSlides[currentSlideIndex]?.subtitle && (
                                <p className="text-xs font-medium text-orange-400">
                                  {snsPackage.instagram.cardSlides[currentSlideIndex].subtitle}
                                </p>
                              )}

                              <div className="space-y-2 pt-2">
                                {snsPackage.instagram.cardSlides[currentSlideIndex]?.points.map((pt, pIdx) => (
                                  <div
                                    key={pIdx}
                                    className={`p-3 rounded-xl border text-xs sm:text-sm font-medium backdrop-blur-md leading-relaxed ${cardTheme.bulletBg}`}
                                  >
                                    • {pt}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Card Footer */}
                            <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                              <span className={`font-semibold ${cardTheme.footerColor}`}>
                                {snsPackage.instagram.cardSlides[currentSlideIndex]?.footerNote ||
                                  "Wanderlust AI Studio"}
                              </span>
                              <span className="text-white/40">저장 & 공유 📌</span>
                            </div>
                          </div>

                          {/* Carousel Navigation Buttons */}
                          <div className="flex items-center justify-between mt-4">
                            <button
                              type="button"
                              disabled={currentSlideIndex === 0}
                              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                              className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Dots */}
                            <div className="flex items-center space-x-1.5">
                              {snsPackage.instagram.cardSlides.map((_, dotIdx) => (
                                <button
                                  key={dotIdx}
                                  type="button"
                                  onClick={() => setCurrentSlideIndex(dotIdx)}
                                  className={`h-2 rounded-full transition-all ${
                                    currentSlideIndex === dotIdx
                                      ? "w-6 bg-orange-500"
                                      : "w-2 bg-stone-200 hover:bg-stone-300"
                                  }`}
                                />
                              ))}
                            </div>

                            <button
                              type="button"
                              disabled={currentSlideIndex === snsPackage.instagram.cardSlides.length - 1}
                              onClick={() =>
                                setCurrentSlideIndex((prev) =>
                                  Math.min(snsPackage.instagram!.cardSlides.length - 1, prev + 1)
                                )
                              }
                              className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Download Button */}
                          <div className="text-center mt-3">
                            <button
                              type="button"
                              onClick={handleDownloadCurrentCard}
                              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md"
                            >
                              <Download className="w-4 h-4 text-orange-400" />
                              <span>{currentSlideIndex + 1}번 카드 고화질 PNG 다운로드</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Instagram Caption & Hashtags Box */}
                    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-extrabold text-stone-900 flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-orange-500" />
                          <span>인스타그램 본문 캡션 & 해시태그</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              `${snsPackage.instagram!.caption}\n\n${snsPackage.instagram!.hashtags.join(" ")}`,
                              "insta-caption"
                            )
                          }
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                        >
                          {copiedKey === "insta-caption" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>복사 완료!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-stone-500" />
                              <span>캡션 전체 복사</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs sm:text-sm text-stone-800 whitespace-pre-line leading-relaxed font-sans">
                        {snsPackage.instagram.caption}
                      </div>

                      {/* Hashtags Chips */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-stone-500 flex items-center space-x-1">
                          <Hash className="w-3.5 h-3.5 text-stone-400" />
                          <span>알고리즘 최적화 해시태그 ({snsPackage.instagram.hashtags.length}개)</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {snsPackage.instagram.hashtags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition-colors"
                              onClick={() => handleCopy(tag, `tag-${idx}`)}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. THREADS VIEW */}
                {activePlatform === "threads" && snsPackage.threads && (
                  <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-stone-900 flex items-center space-x-2">
                          <span>🧵 스레드(Threads) 3단계 연속 타래</span>
                        </h3>
                        <p className="text-xs text-stone-500">
                          호기심을 유발하는 독백체로 시작하여 실천 팁으로 이어지는 알고리즘 맞춤형 구성입니다.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(snsPackage.threads!.posts.join("\n\n---\n\n"), "threads-all")
                        }
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                      >
                        {copiedKey === "threads-all" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>전체 타래 복사됨!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-500" />
                            <span>전체 타래 복사</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Thread Posts Timeline */}
                    <div className="space-y-4">
                      {snsPackage.threads.posts.map((postContent, idx) => (
                        <div
                          key={idx}
                          className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-stone-900 text-white">
                              타래 {idx + 1} / {snsPackage.threads!.posts.length}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(postContent, `thread-${idx}`)}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors flex items-center space-x-1"
                            >
                              {copiedKey === `thread-${idx}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>복사됨</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>이 글만 복사</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm text-stone-800 whitespace-pre-line leading-relaxed font-sans">
                            {postContent}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. TWITTER / X VIEW */}
                {activePlatform === "twitterX" && snsPackage.twitterX && (
                  <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-stone-900 flex items-center space-x-2">
                          <span>𝕏 (트위터) 250자 고밀도 압축 트윗</span>
                        </h3>
                        <p className="text-xs text-stone-500">
                          리트윗과 북마크를 자극하는 일목요연한 팩트 요약형 트윗입니다.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(snsPackage.twitterX!.tweet, "twitter-tweet")}
                        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-black text-white transition-colors"
                      >
                        {copiedKey === "twitter-tweet" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>트윗 복사됨!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>트윗 복사하기</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-900 whitespace-pre-line leading-relaxed font-sans">
                      {snsPackage.twitterX.tweet}
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-400 px-1">
                      <span>글자 수: {snsPackage.twitterX.tweet.length}자 / 280자 제한 안전</span>
                      <span>RT 및 인용 유도 최적화 💡</span>
                    </div>
                  </div>
                )}

                {/* 4. META (FACEBOOK) VIEW */}
                {activePlatform === "metaFacebook" && snsPackage.metaFacebook && (
                  <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-stone-900 flex items-center space-x-2">
                          <span>👥 메타(페이스북) 상세 포스팅 가이드</span>
                        </h3>
                        <p className="text-xs text-stone-500">
                          그룹 및 페이지 공유에 적합한 친절하고 상세한 정보성 게시글입니다.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(snsPackage.metaFacebook!.post, "meta-post")}
                        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        {copiedKey === "meta-post" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>포스트 복사됨!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>페이스북 글 복사</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-800 whitespace-pre-line leading-relaxed font-sans">
                      {snsPackage.metaFacebook.post}
                    </div>
                  </div>
                )}

                {/* 5. SHORTFORM VIEW (NO TTS, NO BGM) */}
                {activePlatform === "shortform" && snsPackage.shortform && (
                  <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="text-base font-extrabold text-stone-900 flex items-center space-x-2">
                          <span>🎬 숏폼 (릴스·쇼츠·틱톡) 씬별 연출 & 자막 대본</span>
                        </h3>
                        <p className="text-xs text-stone-500">
                          초반 3초 후킹(Hook)과 씬별 카메라 연출, 굵은 자막, 나레이터 대사를 완벽 매칭했습니다.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const fullScript =
                            `[숏폼 영상: ${snsPackage.shortform!.title}]\n` +
                            `후킹 멘트: ${snsPackage.shortform!.hook}\n\n` +
                            snsPackage.shortform!.scenes
                              .map(
                                (s) =>
                                  `[씬 ${s.sceneNumber} (${s.timeRange})]\n` +
                                  `• 화면 연출: ${s.visualDirection}\n` +
                                  `• 화면 자막: "${s.onScreenText}"\n` +
                                  `• 나레이터 대사: ${s.spokenScript}\n`
                              )
                              .join("\n");
                          handleCopy(fullScript, "shortform-all");
                        }}
                        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                      >
                        {copiedKey === "shortform-all" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>대본 전체 복사됨!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>대본 전체 복사</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Hook Callout */}
                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                      <span className="text-[11px] font-extrabold text-purple-700 uppercase tracking-wider flex items-center space-x-1">
                        <span>⚡ 0~3초 이탈 방지 후킹 멘트 (Hook)</span>
                      </span>
                      <p className="text-sm font-extrabold text-purple-950">
                        "{snsPackage.shortform.hook}"
                      </p>
                    </div>

                    {/* Scenes Breakdown */}
                    <div className="space-y-3">
                      {snsPackage.shortform.scenes.map((scene) => (
                        <div
                          key={scene.sceneNumber}
                          className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-stone-900 text-white">
                              씬 {scene.sceneNumber}
                            </span>
                            <span className="text-xs font-bold text-orange-600 font-mono">
                              ⏱️ {scene.timeRange}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                            {/* Visual Direction */}
                            <div className="p-3 bg-white rounded-xl border border-stone-200/70 space-y-1">
                              <span className="font-bold text-stone-500">
                                🎥 화면 연출 가이드
                              </span>
                              <p className="text-stone-800 leading-relaxed font-medium">
                                {scene.visualDirection}
                              </p>
                            </div>

                            {/* On-screen Text */}
                            <div className="p-3 bg-white rounded-xl border border-stone-200/70 space-y-1">
                              <span className="font-bold text-purple-600">
                                💬 화면 굵은 자막
                              </span>
                              <p className="text-stone-900 font-bold leading-relaxed">
                                "{scene.onScreenText}"
                              </p>
                            </div>

                            {/* Spoken Script */}
                            <div className="p-3 bg-white rounded-xl border border-stone-200/70 space-y-1">
                              <span className="font-bold text-orange-600">
                                🎙️ 나레이터 대사
                              </span>
                              <p className="text-stone-800 leading-relaxed font-medium">
                                {scene.spokenScript}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
