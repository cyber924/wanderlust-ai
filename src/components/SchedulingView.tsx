import React, { useState, useEffect } from "react";
import {
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  RefreshCw,
  Sliders,
  User,
  TrendingUp,
  Layers,
  AlertCircle,
  Calendar,
  ChevronRight,
  Info,
  CheckCircle,
  FileText
} from "lucide-react";
import { ScheduledTask, BlogPost } from "../types";
import {
  fetchScheduledTasksFromFirestore,
  saveScheduledTaskToFirestore,
  deleteScheduledTaskFromFirestore,
  savePostToFirestore
} from "../lib/firebase";
import { getRandomAutopilotTopics } from "../utils/autopilotTopics";

interface SchedulingViewProps {
  user: any;
  onShowToast: (msg: string) => void;
  savedPosts: BlogPost[];
  setSavedPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
}

export const SchedulingView: React.FC<SchedulingViewProps> = ({
  user,
  onShowToast,
  savedPosts,
  setSavedPosts,
}) => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Clock ticking state in exact Korean format
  const [currentLiveTime, setCurrentLiveTime] = useState<string>("");

  useEffect(() => {
    const formatKoreanTime = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "오후" : "오전";
      const displayHours = hours % 12 || 12;
      return `${year}년 ${month}월 ${day}일 ${ampm} ${displayHours}시 ${minutes}분`;
    };

    // Initial update
    setCurrentLiveTime(formatKoreanTime(new Date()));

    const timer = setInterval(() => {
      setCurrentLiveTime(formatKoreanTime(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Form states
  const [categoryType, setCategoryType] = useState<"travel" | "life_info" | "food" | "trend">("food");
  const [publishCount, setPublishCount] = useState<number>(1); // Range: 1 to 3
  const [scheduledTime, setScheduledTime] = useState<string>("08:00");
  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [recurrence, setRecurrence] = useState<"none" | "daily_8am" | "daily_6pm" | "weekly_9am">("daily_8am");
  const [persona, setPersona] = useState<"minji" | "sophie" | "yujin" | "park" | "default">("default");

  // Load scheduled tasks on mount
  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await fetchScheduledTasksFromFirestore();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load scheduled tasks:", error);
      onShowToast("⚠️ 예약 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Handle manual submit to create scheduled task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onShowToast("🔒 로그인이 필요한 기능입니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate target scheduledAt ISO string
      const [hours, minutes] = scheduledTime.split(":");
      const targetDate = new Date(scheduledDate);
      targetDate.setHours(parseInt(hours || "8"), parseInt(minutes || "0"), 0, 0);

      // Enforce: if selected recurring daily_8am or daily_6pm, auto set time appropriately
      if (recurrence === "daily_8am") {
        targetDate.setHours(8, 0, 0, 0);
      } else if (recurrence === "daily_6pm") {
        targetDate.setHours(18, 0, 0, 0);
      } else if (recurrence === "weekly_9am") {
        targetDate.setHours(9, 0, 0, 0);
      }

      // Automatically generate a default representative topic title dynamically
      const generatedAutopilotTopics = getRandomAutopilotTopics(categoryType, publishCount);

      const newTask: ScheduledTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        categoryType,
        topicKeywords: generatedAutopilotTopics,
        scheduledAt: targetDate.toISOString(),
        recurrence,
        persona,
        status: "pending",
        createdAt: new Date().toISOString(),
        publishCount
      };

      await saveScheduledTaskToFirestore(newTask);
      onShowToast(`📅 ${getCategoryLabel(categoryType)} 테마 ${publishCount}개 일괄 자율 예약이 등록되었습니다!`);
      
      loadTasks();
    } catch (error) {
      console.error("Failed to save scheduled task:", error);
      onShowToast("⚠️ 예약 등록 도중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete scheduled task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteScheduledTaskFromFirestore(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      onShowToast("🗑️ 예약 일정이 정상 취소되었습니다.");
    } catch (error) {
      console.error("Failed to delete task:", error);
      onShowToast("⚠️ 예약 취소 도중 오류가 발생했습니다.");
    }
  };

  // Immediate Publish / Force Trigger On Demand (Loops for chosen publishCount)
  const handleImmediatePublish = async (task: ScheduledTask) => {
    const totalToGenerate = task.publishCount || 1;
    onShowToast(`⚡ [오토파일럿 가동] ${totalToGenerate}개의 고품질 AI 블로그 아티클을 자율 생성하고 발행을 시작합니다...`);
    
    // Optimistically update status to processing
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: "processing" as const } : t))
    );

    try {
      // Pick unique topics for this categoryType up to the chosen publishCount
      const chosenTopics = getRandomAutopilotTopics(task.categoryType, totalToGenerate);
      const generatedPostIds: string[] = [];
      const newPostsList: BlogPost[] = [];

      for (let i = 0; i < totalToGenerate; i++) {
        const topic = chosenTopics[i] || "인기 핫플레이스 가이드";
        
        console.log(`[Scheduler] Autonomous topic generated for loop ${i+1}/${totalToGenerate}: "${topic}"`);

        // Call backend API
        const res = await fetch("/api/generate-blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryType: task.categoryType,
            destination: topic,
            duration: task.categoryType === "life_info" ? "소요시간 10분" : "2박 3일",
            travelStyle: task.categoryType === "life_info" ? "실생활 유용한 살림 가이드" : "감성 명소 및 이색 먹거리",
            keywords: [topic],
            tone: "🔥 네이버 스마트블록 & DIA+ 상위노출 최적화체 (키워드/경험 중심)",
            targetAudience: "2030 감성 세대 및 네이버 블로그 검색 독자",
            language: "한국어"
          })
        });

        const result = await res.json();
        if (result.success && result.data) {
          const generated = result.data;

          // Auto-generate beautiful cover image URL via Pollinations
          const cleanPrompt = encodeURIComponent(topic + " travel scenery aesthetic");
          const seed = Math.floor(Math.random() * 999999) + i * 133;
          const coverImageUrl = `https://image.pollinations.ai/prompt/scenery%20aesthetic%20${cleanPrompt}?width=1200&height=800&seed=${seed}&nologo=true&model=flux`;

          const newPost: BlogPost = {
            id: `post_auto_${Date.now()}_${i}`,
            title: generated.title || `[자동발행] ${topic}`,
            subtitle: generated.subtitle || "",
            destination: generated.destination || topic,
            duration: generated.duration || "1박 2일",
            concept: generated.concept || "감성 힐링 투어",
            tone: generated.tone || "친근하고 감성적인 ~해요체",
            targetAudience: generated.targetAudience || "전체 독자층",
            budget: generated.budget || "합리적인 소비",
            season: generated.season || "사계절 추천",
            categoryType: task.categoryType,
            categoryName:
              task.categoryType === "travel"
                ? "여행"
                : task.categoryType === "food"
                ? "맛집/카페"
                : task.categoryType === "trend"
                ? "트렌드"
                : "생활정보",
            metaKeywords: generated.metaKeywords || [topic],
            hashtags: generated.hashtags || [`#${topic}`],
            itinerary: generated.itinerary || [],
            markdownContent: generated.markdownContent || "",
            travelTips: generated.travelTips || [],
            seoDescription: generated.seoDescription || "",
            coverImageUrl,
            views: Math.floor(Math.random() * 45) + 20,
            likes: Math.floor(Math.random() * 8) + 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: "published",
            isPublic: true,
            authorName:
              task.persona === "minji"
                ? "민지 (20대 트렌드 에디터)"
                : task.persona === "sophie"
                ? "소피 (미식 푸드 디렉터)"
                : task.persona === "yujin"
                ? "유진 (살림 리빙 퀸)"
                : task.persona === "park"
                ? "박 부장 (실전 배테랑 여행가)"
                : "Wanderlust AI 오토파일럿"
          };

          const savedId = await savePostToFirestore(newPost);
          const finalPost = { ...newPost, id: savedId };

          newPostsList.push(finalPost);
          generatedPostIds.push(savedId);
        } else {
          throw new Error(result.error || "AI generation failed");
        }
      }

      // Update client-side savedPosts state with all generated posts
      if (newPostsList.length > 0) {
        setSavedPosts((prev) => [...newPostsList, ...prev]);
      }

      // Update scheduled task in Firestore depending on recurrence
      if (task.recurrence && task.recurrence !== "none") {
        const nextSched = new Date(task.scheduledAt);
        if (task.recurrence === "daily_8am") {
          nextSched.setDate(nextSched.getDate() + 1);
          nextSched.setHours(8, 0, 0, 0);
        } else if (task.recurrence === "daily_6pm") {
          nextSched.setDate(nextSched.getDate() + 1);
          nextSched.setHours(18, 0, 0, 0);
        } else if (task.recurrence === "weekly_9am") {
          nextSched.setDate(nextSched.getDate() + 7);
          nextSched.setHours(9, 0, 0, 0);
        }
        
        while (nextSched <= new Date()) {
          nextSched.setDate(nextSched.getDate() + 1);
        }

        // Keep topics pool fresh for the next release run
        const nextTopics = getRandomAutopilotTopics(task.categoryType, totalToGenerate);

        const updatedTask: ScheduledTask = {
          ...task,
          topicKeywords: nextTopics,
          scheduledAt: nextSched.toISOString(),
          status: "pending",
          lastExecutedPostId: generatedPostIds[0]
        };
        await saveScheduledTaskToFirestore(updatedTask);
      } else {
        const updatedTask: ScheduledTask = {
          ...task,
          status: "completed",
          lastExecutedPostId: generatedPostIds[0]
        };
        await saveScheduledTaskToFirestore(updatedTask);
      }

      onShowToast(`🎉 [오토파일럿 발행 완료] 지정하신 ${totalToGenerate}개의 기사가 고품질로 완벽히 생성되어 웹진에 전역 공개되었습니다!`);
      loadTasks();
    } catch (error) {
      console.error("Immediate scheduled publish failed:", error);
      onShowToast("⚠️ 즉시 발행 도중 인공지능 응답 수집에 실패했습니다.");
      
      const failedTask: ScheduledTask = {
        ...task,
        status: "failed"
      };
      await saveScheduledTaskToFirestore(failedTask);
      loadTasks();
    }
  };

  // Text helpers
  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case "travel":
        return "✈️";
      case "food":
        return "🍽️";
      case "trend":
        return "🔥";
      case "life_info":
        return "💡";
      default:
        return "📅";
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "travel":
        return "감성 여행";
      case "food":
        return "맛집/카페";
      case "trend":
        return "핫 트렌드";
      case "life_info":
        return "생활 정보";
      default:
        return "기타";
    }
  };

  const getRecurrenceLabel = (rec: string) => {
    switch (rec) {
      case "none":
        return "일회성 즉시";
      case "daily_8am":
        return "매일 아침 8시";
      case "daily_6pm":
        return "매일 저녁 6시";
      case "weekly_9am":
        return "매주 월요일 아침 9시";
      default:
        return "미지정";
    }
  };

  const getPersonaLabel = (p: string) => {
    switch (p) {
      case "minji":
        return "💁‍♀️ 에디터 민지 (20대 트렌드)";
      case "sophie":
        return "👩‍🍳 소피 (푸드/미식 디렉터)";
      case "yujin":
        return "🧹 유진 (실용 리빙 살림 퀸)";
      case "park":
        return "👨‍💼 박 부장 (실전 배테랑 아재)";
      default:
        return "🤖 Wanderlust 오토파일럿";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-16">
      {/* 🧭 Header Section */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>Autopilot Queue Active</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white">
              AI 오토파일럿 예약 발행 센터
            </h1>
            <p className="text-stone-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              사용자가 원하는 요일과 시간에 테마별(여행, 맛집, 트렌드, 생활정보) 스케줄을 설정하면, 인공지능이 주제부터 시작해 본문과 4K 스냅사진까지 100% 알아서 동적으로 자동완성하고 공식 출판합니다.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end justify-center gap-2 shrink-0">
            <button
              onClick={loadTasks}
              className="px-5 py-2.5 bg-stone-850 hover:bg-stone-800 text-white border border-stone-700/60 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>일정 동기화</span>
            </button>
            {/* Live Clock displayed precisely under the synchronization button */}
            {currentLiveTime && (
              <span className="text-[11px] font-semibold text-orange-400 bg-stone-950/80 border border-stone-800 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm font-mono tabular-nums select-none mt-1">
                <Clock className="w-3 h-3 text-orange-400" />
                <span>현재 시각: {currentLiveTime}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Queue List Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Schedule Form (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-500" />
              <span>새로운 오토파일럿 일정 등록</span>
            </h2>
            <p className="text-xs text-stone-400">
              테마와 개수를 선택하면 인공지능이 최적의 타이틀을 선별해 자율 집필합니다.
            </p>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-5">
            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 block">발행 테마 선택</label>
              <div className="grid grid-cols-2 gap-2">
                {(["travel", "food", "trend", "life_info"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryType(cat)}
                    className={`py-3 px-4 border rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-2 ${
                      categoryType === cat
                        ? "bg-orange-50/60 border-orange-500 text-orange-700 font-extrabold shadow-2xs"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <span>{getCategoryEmoji(cat)}</span>
                    <span>{getCategoryLabel(cat)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Autonomous Topic Selection Banner replacing the keywords input */}
            <div className="p-4 bg-orange-50/40 border border-orange-200/50 rounded-2xl flex items-start gap-2.5 animate-fade-in shadow-2xs select-none">
              <Sparkles className="w-4.5 h-4.5 text-orange-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-orange-800">AI 100% 오토파일럿 자율 주제</span>
                <p className="text-[10px] sm:text-[11px] text-orange-700 leading-relaxed font-semibold">
                  더 이상 번거롭게 키워드나 명소를 고민하지 마세요. Wanderlust AI가 네이버 스마트블록 알고리즘과 빅데이터 검색어 지수를 실시간 대조하여, 클릭률이 보장된 매혹적인 기획 글감을 스스로 설정해 기사를 자동 창조해 냅니다.
                </p>
              </div>
            </div>

            {/* Publish Count Picker (1 to 3) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 block">한 번에 동시 발행할 건수 설정</label>
              <div className="grid grid-cols-3 gap-2">
                {([1, 2, 3] as const).map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setPublishCount(count)}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5 ${
                      publishCount === count
                        ? "bg-orange-50 border-orange-500 text-orange-700 font-extrabold shadow-2xs"
                        : "bg-stone-50/60 border-stone-200 text-stone-500 hover:bg-white"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{count}건 발행</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-stone-400 pl-1">
                ※ 2개 이상의 아티클 지정 시, 서로 겹치지 않는 각기 다른 유니크한 주제들로 병렬 자동 집필을 병행합니다.
              </p>
            </div>

            {/* Recurrence selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 block">발행 주기 (스케줄)</label>
              <select
                value={recurrence}
                onChange={(e: any) => setRecurrence(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="none">🔄 일회성 예약 (지정일시 일시발행)</option>
                <option value="daily_8am">🌅 매일 아침 8시 자동 발행 (추천)</option>
                <option value="daily_6pm">🌇 매일 저녁 6시 퇴근길 자동 발행</option>
                <option value="weekly_9am">🗓️ 매주 월요일 아침 9시 주말 트래픽 대비 발행</option>
              </select>
            </div>

            {/* Date & Time selection (only if recurrence is none) */}
            {recurrence === "none" && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 block">발행 예약일</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 block">발행 시각</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* AI Persona selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 block">페르소나 (AI 전담 에디터)</label>
              <select
                value={persona}
                onChange={(e: any) => setPersona(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="default">🤖 Wanderlust 오토파일럿 (표준 최적화)</option>
                <option value="minji">💁‍♀️ 민지 - 20대 최신 힙지 트렌드 세터</option>
                <option value="sophie">👩‍🍳 소피 - 미식 탐방가이자 푸드 인플루언서</option>
                <option value="yujin">🧹 유진 - 주부/자취 필수 노하우 살림 퀸</option>
                <option value="park">👨‍💼 박 부장 - 전국 방방곡곡 맛깔나는 숨은 명소 대가</option>
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !user}
              className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-stone-200 disabled:text-stone-400 active:scale-98 text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-orange-500/10 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              <span>{user ? "자율 예약 스케줄 등록 및 가동" : "예약하려면 로그인이 필요합니다"}</span>
            </button>
          </form>
        </div>

        {/* Right Side: Reservation Queue List (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-stone-100">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-orange-500" />
                  <span>실시간 예약 대기열 큐 (Queue)</span>
                </h2>
                <p className="text-xs text-stone-400">
                  현재 활성화 및 대기 중인 모든 자동화 일정 리스트입니다.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-600 rounded-full text-xs font-bold">
                대기건수: <span className="font-mono text-orange-600 font-extrabold">{tasks.length}</span>건
              </span>
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-xs text-stone-400 font-bold">실시간 파이어베이스 DB 예약 큐 수집 중...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 border border-dashed border-stone-200 rounded-2xl">
                <div className="w-12 h-12 bg-stone-50 border border-stone-200/60 rounded-xl flex items-center justify-center text-stone-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-black text-stone-800">활성화된 예약 일정이 없습니다.</p>
                  <p className="text-[11px] text-stone-400">좌측 양식을 사용해 첫번째 오토파일럿 발행을 예약해 보세요!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-stone-50 hover:bg-white border border-stone-200 hover:border-orange-200 hover:shadow-xs rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 bg-white border border-stone-200/80 rounded-lg text-[10px] font-extrabold text-stone-600 flex items-center space-x-1 shrink-0">
                          <span>{getCategoryEmoji(task.categoryType)}</span>
                          <span>{getCategoryLabel(task.categoryType)}</span>
                        </span>
                        <span className="text-[10px] font-bold text-orange-600 font-mono tracking-wide">
                          {getRecurrenceLabel(task.recurrence)}
                        </span>
                        
                        {/* Status badge */}
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold border ${
                            task.status === "pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : task.status === "processing"
                              ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
                              : task.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {task.status === "pending" && "대기중"}
                          {task.status === "processing" && "AI 생성중"}
                          {task.status === "completed" && "완료됨"}
                          {task.status === "failed" && "실패"}
                        </span>

                        {/* publishCount indicator badge */}
                        {task.publishCount && task.publishCount > 1 && (
                          <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[9px] font-black">
                            🗂️ {task.publishCount}건 벌크발행
                          </span>
                        )}
                      </div>

                      {/* Topic */}
                      <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm leading-snug">
                        {task.topicKeywords.join(", ")}
                      </h4>

                      <div className="flex items-center space-x-3 text-[10px] text-stone-400 font-semibold">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="font-mono text-[11px] text-stone-600 font-bold">
                            발행예정: {new Date(task.scheduledAt).toLocaleDateString("ko-KR", {
                              month: "long",
                              day: "numeric",
                            })}{" "}
                            {new Date(task.scheduledAt).toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[150px]">{getPersonaLabel(task.persona)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                      {task.status === "pending" && (
                        <button
                          onClick={() => handleImmediatePublish(task)}
                          className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-[10px] font-extrabold rounded-lg flex items-center space-x-1 transition-all cursor-pointer shadow-sm shadow-orange-500/10"
                          title="스케줄 무관 즉시 강제 발행"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>즉시발행</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-colors cursor-pointer"
                        title="예약 일정 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="p-4 bg-stone-100/60 border border-stone-200 rounded-2xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-700">페이지 접속 시 자동 점검 엔진 작동중</span>
              <p className="text-[10px] text-stone-500 leading-relaxed font-semibold">
                Wanderlust AI는 서버 크론 탭 대신 최첨단 <strong>이벤트 클라이언트 리프레시 동기화(Deferred client refresh)</strong>를 사용합니다. 어떠한 유저라도 페이지에 접속하거나 새로고침하는 순간, 예약 예정 시간이 지난 모든 일정들을 데이터베이스 상에서 일괄 자동 감지하여 백그라운드 AI 아티클 작성을 즉각 개시하고 정식 출판물로 자동 전환합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
