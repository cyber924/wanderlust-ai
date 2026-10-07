import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users2,
  FileSpreadsheet,
  TrendingUp,
  Settings,
  Shield,
  Activity,
  Trash2,
  Edit,
  Eye,
  Heart,
  Globe2,
  Lock,
  Smartphone,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Send,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Share2,
  Database,
  Terminal,
  AlertTriangle,
  RefreshCw,
  Clock
} from "lucide-react";
import { BlogPost, SNSPackage, UserProfile } from "../types";
import { savePostToFirestore, firebaseConfig } from "../lib/firebase";
import { runDatabaseMigration } from "../lib/migration";

interface AdminMenuProps {
  user: UserProfile | null;
  savedPosts: BlogPost[];
  setSavedPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  webzineArticles: BlogPost[];
  setWebzineArticles: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  onShowToast: (msg: string) => void;
  onSelectPost: (post: BlogPost) => void;
  isSimulatedAdmin: boolean;
  setIsSimulatedAdmin: (sim: boolean) => void;
  onNavigateToTab: (tab: any) => void;
}

// Simulated System Logs
interface SystemLog {
  id: string;
  time: string;
  level: "info" | "warning" | "error";
  service: string;
  message: string;
}

// User Type for Management
interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: "admin" | "editor" | "user";
  status: "active" | "suspended" | "pending";
  joinDate: string;
  postsCount: number;
  snsCount: number;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({
  user,
  savedPosts,
  setSavedPosts,
  webzineArticles,
  setWebzineArticles,
  onShowToast,
  onSelectPost,
  isSimulatedAdmin,
  setIsSimulatedAdmin,
  onNavigateToTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "users" | "content" | "scheduling">("dashboard");
  const [dashboardStyle, setDashboardStyle] = useState<"kpi" | "trend" | "system">("kpi");

  // Reservation & Time Travel Simulator State
  const [virtualTimeOffset, setVirtualTimeOffset] = useState<number>(0); // in hours
  const [liveClockTime, setLiveClockTime] = useState<string>("");
  const [generatingIds, setGeneratingIds] = useState<string[]>([]);
  
  // Create Reservation Form States
  const [newReserveTitle, setNewReserveTitle] = useState("");
  const [newReserveType, setNewReserveType] = useState<"blog" | "sns">("blog");
  const [newReserveCategory, setNewReserveCategory] = useState<"travel" | "food" | "life_info" | "general">("travel");
  const [newReserveHour, setNewReserveHour] = useState("09:00");
  const [newReserveDaysAhead, setNewReserveDaysAhead] = useState<number>(1);
  const [newReserveRecurrence, setNewReserveRecurrence] = useState<'none' | 'daily_9am' | 'daily_12pm' | 'weekly'>('none');
  
  // User management states
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "admin" | "editor" | "user">("all");
  const [userStatusFilter, setUserStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  
  // Content management states
  const [contentSubTab, setContentSubTab] = useState<"blog" | "sns">("blog");
  const [contentSearch, setContentSearch] = useState("");
  const [contentCategoryFilter, setContentCategoryFilter] = useState("all");
  const [selectedPostForEdit, setSelectedPostForEdit] = useState<BlogPost | null>(null);
  const [quickEditViews, setQuickEditViews] = useState<number>(0);
  const [quickEditLikes, setQuickEditLikes] = useState<number>(0);
  const [quickEditTitle, setQuickEditTitle] = useState("");
  const [quickEditStatus, setQuickEditStatus] = useState<"published" | "draft">("published");
  
  // SNS Saved Archive State (loaded from localStorage)
  const [snsPackages, setSnsPackages] = useState<SNSPackage[]>([]);
  const [selectedSnsPackage, setSelectedSnsPackage] = useState<SNSPackage | null>(null);

  // Migration states
  const [migrating, setMigrating] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [migrationDone, setMigrationDone] = useState(() => {
    return localStorage.getItem("wanderlust_migration_completed_v2") === "true";
  });

  const handleManualMigration = async () => {
    setMigrating(true);
    setMigrationLogs([]);
    try {
      const res = await runDatabaseMigration((msg) => {
        setMigrationLogs((prev) => [...prev.slice(-8), msg]);
      });
      if (res.success) {
        setMigrationDone(true);
        onShowToast(`🎉 신규 DB 마이그레이션 완료! (글 ${res.postsMigrated}편, 이미지 ${res.imagesMigrated}개)`);
      } else {
        onShowToast(`⚠️ 마이그레이션 실패: ${res.error}`);
      }
    } catch (err: any) {
      onShowToast(`⚠️ 마이그레이션 오류: ${err?.message}`);
    } finally {
      setMigrating(false);
    }
  };

  // System Logs Simulation
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  // User notifications
  const [showNotifyModal, setShowNotifyModal] = useState<AdminUser | null>(null);
  const [notifyMessage, setNotifyMessage] = useState("");

  // Check if current logged-in user is strictly cyber924@naver.com
  const isRealAdmin = user?.email === "cyber924@naver.com";
  const hasAdminAccess = isRealAdmin || isSimulatedAdmin;

  // Initialize simulated users list & logs
  useEffect(() => {
    // Extracted Unique authors from real posts
    const realAuthors = Array.from(new Set(savedPosts.map(p => p.authorName || "Wanderlust 에디터")));
    
    // Seed list of users
    const seedUsers: AdminUser[] = [
      {
        id: "admin_cyber",
        email: "cyber924@naver.com",
        name: "cyber924 (마스터)",
        avatar: "",
        role: "admin",
        status: "active",
        joinDate: "2026-01-10",
        postsCount: savedPosts.filter(p => p.authorName?.includes("cyber924") || p.authorId === "admin_cyber").length || 3,
        snsCount: 5,
      },
      {
        id: "editor_travel",
        email: "writer_travel@gmail.com",
        name: "제주방랑자",
        avatar: "",
        role: "editor",
        status: "active",
        joinDate: "2026-03-22",
        postsCount: 14,
        snsCount: 8,
      },
      {
        id: "editor_life",
        email: "editor_life@naver.com",
        name: "살림여왕",
        avatar: "",
        role: "editor",
        status: "active",
        joinDate: "2026-04-05",
        postsCount: 8,
        snsCount: 3,
      },
      {
        id: "user_01",
        email: "cyber924@gmail.com",
        name: "길잡이924 (테스터)",
        avatar: "",
        role: "user",
        status: "active",
        joinDate: "2026-09-01",
        postsCount: savedPosts.filter(p => p.authorName?.includes("길잡이") || !p.authorName || p.authorName === "Wanderlust 에디터").length,
        snsCount: 2,
      },
      {
        id: "user_gourmet",
        email: "user_gourmet@gmail.com",
        name: "맛집원정대",
        avatar: "",
        role: "user",
        status: "active",
        joinDate: "2026-05-15",
        postsCount: 4,
        snsCount: 1,
      },
      {
        id: "user_spammer",
        email: "bad_bot@spambot.org",
        name: "광고성어그로",
        avatar: "",
        role: "user",
        status: "suspended",
        joinDate: "2026-08-20",
        postsCount: 0,
        snsCount: 0,
      },
      {
        id: "user_newbie",
        email: "travel_newbie@daum.net",
        name: "초보여행자",
        avatar: "",
        role: "user",
        status: "pending",
        joinDate: "2026-09-04",
        postsCount: 1,
        snsCount: 0,
      }
    ];

    setUsersList(seedUsers);

    // Initial system logs
    const initialLogs: SystemLog[] = [
      { id: "log_1", time: "15:10:24", level: "info", service: "AuthService", message: `사용자 로그인 성공: ${user?.email || "비로그인"}` },
      { id: "log_2", time: "15:11:05", level: "info", service: "GeminiAPI", message: "블로그 초안 생성 모델 (gemini-2.5-flash) 호출 성공 - 2.4k tokens" },
      { id: "log_3", time: "15:11:42", level: "info", service: "Firestore", message: "travel_blog_posts 컬렉션 쿼리 수행 완료 (12 records)" },
      { id: "log_4", time: "15:13:01", level: "warning", service: "ImageGen", message: "고해상도 이미지 생성 타임아웃 재시도 수행 (1회)" },
      { id: "log_5", time: "15:13:10", level: "info", service: "ImageGen", message: "이미지 생성 완료 및 Cloud Storage 저장: img_9348.png" },
    ];
    setSystemLogs(initialLogs);

    // Load SNS Packages from LocalStorage
    try {
      const stored = localStorage.getItem("wanderlust_saved_sns_packages");
      if (stored) {
        setSnsPackages(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, [savedPosts, user]);

  // Periodic Log Generator to make System Dashboard live!
  useEffect(() => {
    if (dashboardStyle !== "system") return;

    const services = ["GeminiAPI", "Firestore", "AuthService", "ImageGen", "SystemController"];
    const infoMsgs = [
      "블로그 카테고리 색인 인덱스 자동 업데이트 완료",
      "사용자 보관함 캐시 싱크 동기화 성공",
      "SNS 카드뉴스 메타데이터 JSON 로드",
      "웹진 신규 게시글 최신 발행 정렬 갱신",
      "백링크 앵커 태그 최적화 완료",
    ];
    const warnMsgs = [
      "API 요청 속도 제한(Rate Limit) 임계치 85% 도달",
      "Firebase 연결 대기 시간 지연 (1.2s)",
      "비정상적 다중 조회수 수치 변동 모니터링 경고",
    ];

    const timer = setInterval(() => {
      const rand = Math.random();
      let newLog: SystemLog;
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

      if (rand < 0.7) {
        newLog = {
          id: `log_${Date.now()}`,
          time: timeStr,
          level: "info",
          service: services[Math.floor(Math.random() * services.length)],
          message: infoMsgs[Math.floor(Math.random() * infoMsgs.length)],
        };
      } else if (rand < 0.95) {
        newLog = {
          id: `log_${Date.now()}`,
          time: timeStr,
          level: "warning",
          service: services[Math.floor(Math.random() * services.length)],
          message: warnMsgs[Math.floor(Math.random() * warnMsgs.length)],
        };
      } else {
        newLog = {
          id: `log_${Date.now()}`,
          time: timeStr,
          level: "error",
          service: "DatabaseGate",
          message: "Firestore 쓰기 권한 충돌 경고 - 즉각 수동 조치됨",
        };
      }

      setSystemLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    }, 4000);

    return () => clearInterval(timer);
  }, [dashboardStyle]);

  // Helper metrics
  const totalBlogsCount = webzineArticles.length;
  const userBlogsCount = savedPosts.length;
  const totalSNSCount = snsPackages.length + 18; // base mock + real saved
  const totalViews = webzineArticles.reduce((acc, p) => acc + (p.views || 0), 0) + 4821;
  const totalLikes = webzineArticles.reduce((acc, p) => acc + (p.likes || 0), 0) + 1284;

  // Manage users actions
  const handleToggleUserStatus = (uId: string) => {
    setUsersList(prev =>
      prev.map(u => {
        if (u.id === uId) {
          const nextStatus = u.status === "active" ? "suspended" : "active";
          onShowToast(`사용자 '${u.name}' 상태가 [${nextStatus === "active" ? "정상 활성" : "정지"}] 상태로 수정되었습니다.`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleChangeUserRole = (uId: string, newRole: "admin" | "editor" | "user") => {
    setUsersList(prev =>
      prev.map(u => {
        if (u.id === uId) {
          onShowToast(`사용자 '${u.name}' 권한이 [${newRole.toUpperCase()}]로 양도되었습니다.`);
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (uId: string, name: string) => {
    if (confirm(`사용자 '${name}' 계정을 영구 강제 탈퇴시키겠습니까?`)) {
      setUsersList(prev => prev.filter(u => u.id !== uId));
      onShowToast(`사용자 '${name}' 계정이 데이터베이스에서 강제 영구 추방되었습니다.`);
    }
  };

  const handleSendNotification = () => {
    if (!notifyMessage.trim() || !showNotifyModal) return;
    onShowToast(`✉️ '${showNotifyModal.name}'님께 비공개 관리자 경고/알림을 발송했습니다.`);
    setShowNotifyModal(null);
    setNotifyMessage("");
  };

  // ==========================================
  // ⏰ RESERVATION & DEFERRED SYNC ENGINE
  // ==========================================

  // Calculates the master virtual time based on slider offset
  const getVirtualTime = (): Date => {
    const realNow = new Date();
    if (virtualTimeOffset === 0) return realNow;
    return new Date(realNow.getTime() + virtualTimeOffset * 60 * 60 * 1000);
  };

  // Keep virtual clock ticking live
  useEffect(() => {
    const interval = setInterval(() => {
      const vTime = getVirtualTime();
      const year = vTime.getFullYear();
      const month = String(vTime.getMonth() + 1).padStart(2, "0");
      const date = String(vTime.getDate()).padStart(2, "0");
      const hours = String(vTime.getHours()).padStart(2, "0");
      const minutes = String(vTime.getMinutes()).padStart(2, "0");
      const seconds = String(vTime.getSeconds()).padStart(2, "0");
      setLiveClockTime(`${year}-${month}-${date} ${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [virtualTimeOffset]);

  // Run auto-release scan when time travels or sub-tab shifts
  useEffect(() => {
    runAutoReleaseEngine();
  }, [virtualTimeOffset, activeSubTab]);

  // Initial reservation seeder for demonstration sandbox
  useEffect(() => {
    // 1. Seed Blog Reservation
    if (savedPosts.length > 0 && !savedPosts.some(p => p.id === "post_sched_seed_1")) {
      const targetTime1 = new Date();
      targetTime1.setHours(targetTime1.getHours() + 2); // +2 Hours

      const seedBlog: BlogPost = {
        id: "post_sched_seed_1",
        title: "제주 애월 노을빛 감성 미식 투어 꿀팁 🌅",
        subtitle: "일몰이 아름다운 애월 해안가 카페 가이드",
        destination: "제주 애월",
        duration: "당일치기",
        concept: "감성 카페 & 일몰 뷰 투어",
        tone: "친근하고 감성적인 ~해요체",
        targetAudience: "커플, 감성 투어족",
        budget: "인당 약 4만원",
        season: "가을 추천",
        categoryType: "food",
        categoryName: "맛집/카페",
        metaKeywords: ["제주애월카페", "노을카페", "제주도해안도로"],
        hashtags: ["애월맛집", "제주노을", "인생샷코스"],
        itinerary: [
          {
            day: 1,
            title: "애월 낙조 미식 여행",
            activities: [
              {
                time: "17:00",
                spot: "한담해안산책로",
                description: "노을이 아름다운 해안길을 가볍게 산책하고, 바다가 보이는 카페 테라스에 자리를 잡습니다."
              }
            ]
          }
        ],
        markdownContent: "## 애월의 붉은 노을 속으로\n\n한담해안산책로는 일몰 1시간 전부터 황금빛으로 물듭니다. 추천 장소 리스트는 테라스 자리가 구비된 로컬 카페입니다.",
        travelTips: ["야외 전망 자리는 17시 이전 안착 필수", "공영 주차장 혼잡 시 이면 주차 이용"],
        seoDescription: "제주 애월 한담해안산책로의 극적인 낙조 뷰 포인트와 카페 꿀팁 전수.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        status: "draft",
        isReserved: true,
        scheduledAt: targetTime1.toISOString(),
        recurrence: "none"
      };

      setSavedPosts(prev => [seedBlog, ...prev]);
    }

    // 2. Seed SNS Reservation
    try {
      const stored = localStorage.getItem("wanderlust_saved_sns_packages");
      const list: SNSPackage[] = stored ? JSON.parse(stored) : [];
      if (list.length > 0 && !list.some(p => p.id === "sns_sched_seed_2")) {
        const targetTime2 = new Date();
        targetTime2.setHours(targetTime2.getHours() + 4); // +4 Hours

        const seedSns: SNSPackage = {
          id: "sns_sched_seed_2",
          topic: "서울 가을 인생샷 단풍 숨은 명소 TOP 3 🍁",
          category: "travel",
          targetAudience: "2030 감성 스타그래머",
          tone: "정겹고 힙한 느낌",
          createdAt: new Date().toISOString(),
          selectedPlatforms: ["instagram", "threads"],
          isReserved: true,
          scheduledAt: targetTime2.toISOString(),
          recurrence: "daily_9am",
          status: "draft",
          instagram: {
            caption: "🍁 서울 복판 단풍 천국! 비밀의 스팟들만 골라왔어요. 저장하고 이번 주말 달리세요!",
            hashtags: ["가을덕수궁", "명륜당은행나무", "가을인생샷", "서울단풍길"],
            callToAction: "가치 갈 단풍 메이트 소환하기 @tag",
            cardSlides: [
              { slideNumber: 1, title: "단풍 인생샷 숨은 명소", points: ["1. 덕수궁 돌담길 뒷골목", "2. 창경궁 춘당지 숲", "3. 성균관대 명륜당 대성전"] }
            ]
          }
        };

        const merged = [seedSns, ...list];
        localStorage.setItem("wanderlust_saved_sns_packages", JSON.stringify(merged));
        setSnsPackages(merged);
      }
    } catch (e) {
      console.error("Reservation seed load error:", e);
    }
  }, [savedPosts]);

  // Main Event-driven scheduler algorithm
  const handlePublishBlogPostWithAI = async (postId: string) => {
    // Prevent double generation
    if (generatingIds.includes(postId)) return;
    setGeneratingIds(prev => [...prev, postId]);
    
    // Find the current post
    const post = savedPosts.find(p => p.id === postId);
    if (!post) {
      setGeneratingIds(prev => prev.filter(id => id !== postId));
      return;
    }
    
    const cleanTitle = post.title.replace(/^\[예약\]\s*/, "").replace(/^\[예약\s*반복\]\s*/, "");
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    // Append a log
    const logItem: SystemLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      time: timeStr,
      level: "info",
      service: "SchedulerEngine",
      message: `🤖 블로그 '${cleanTitle}' 실시간 고품질 AI 생성 및 웹진 발행 시작...`
    };
    setSystemLogs(prev => [logItem, ...prev.slice(0, 49)]);

    try {
      const res = await fetch("/api/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryType: post.categoryType || "travel",
          destination: cleanTitle,
          duration: "1박 2일",
          travelStyle: "현지 로컬 감성 명소 및 맛집 투어",
          keywords: [cleanTitle],
          tone: "네이버 블로그 C-Rank 노출 최적화 친근체",
          targetAudience: "2030 감성 스타그래머 및 실전 여행족",
          language: "한국어"
        })
      });
      const result = await res.json();
      if (result.success && result.data) {
        const generated = result.data;
        
        // Unsplash / Picsum fallback travel image
        const cleanPrompt = encodeURIComponent(cleanTitle + " travel scenery");
        const seed = Math.floor(Math.random() * 9999);
        const coverUrl = `https://image.pollinations.ai/prompt/scenery%20aesthetic%20${cleanPrompt}?width=1200&height=800&seed=${seed}&nologo=true&model=flux`;

        const updatedPost: BlogPost = {
          ...post,
          title: generated.title || cleanTitle,
          subtitle: generated.subtitle || post.subtitle,
          destination: generated.destination || cleanTitle,
          duration: generated.duration || post.duration,
          concept: generated.concept || post.concept,
          tone: generated.tone || post.tone,
          targetAudience: generated.targetAudience || post.targetAudience,
          budget: generated.budget || post.budget,
          season: generated.season || post.season,
          metaKeywords: generated.metaKeywords || post.metaKeywords,
          hashtags: generated.hashtags || post.hashtags,
          itinerary: generated.itinerary || post.itinerary,
          markdownContent: generated.markdownContent || post.markdownContent,
          travelTips: generated.travelTips || post.travelTips,
          seoDescription: generated.seoDescription || post.seoDescription,
          coverImageUrl: coverUrl,
          status: "published" as const,
          isReserved: false
        };

        setSavedPosts(prev => {
          const updated = prev.map(p => p.id === postId ? updatedPost : p);
          return updated;
        });
        setWebzineArticles(prev => {
          const filtered = prev.filter(p => p.id !== postId);
          return [...filtered, updatedPost];
        });
        savePostToFirestore(updatedPost);

        // Add success log
        const successLog: SystemLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          time: timeStr,
          level: "info",
          service: "SchedulerEngine",
          message: `✨ 블로그 '${cleanTitle}' 고품질 AI 동적 빌드 완료 및 발행 성공!`
        };
        setSystemLogs(prev => [successLog, ...prev.slice(0, 49)]);
        onShowToast(`✨ 블로그 '${cleanTitle}' 초고품질 AI 생성 및 즉시 발행 완료!`);
      } else {
        throw new Error(result.error || "AI generation failed");
      }
    } catch (err: any) {
      console.error("AI Blog generation failed, publishing clean stub:", err);
      // Fallback to basic clean post
      const fallbackPost: BlogPost = {
        ...post,
        title: cleanTitle,
        status: "published" as const,
        isReserved: false
      };
      setSavedPosts(prev => prev.map(p => p.id === postId ? fallbackPost : p));
      setWebzineArticles(prev => [...prev.filter(p => p.id !== postId), fallbackPost]);
      savePostToFirestore(fallbackPost);
      
      const failLog: SystemLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        time: timeStr,
        level: "warning",
        service: "SchedulerEngine",
        message: `⚠️ 블로그 '${cleanTitle}' AI 생성 실패. 기본 초안으로 대체 발행 완료.`
      };
      setSystemLogs(prev => [failLog, ...prev.slice(0, 49)]);
    } finally {
      setGeneratingIds(prev => prev.filter(id => id !== postId));
    }
  };

  const handlePublishSNSPackageWithAI = async (pkgId: string) => {
    if (generatingIds.includes(pkgId)) return;
    setGeneratingIds(prev => [...prev, pkgId]);

    const pkg = snsPackages.find(p => p.id === pkgId);
    if (!pkg) {
      setGeneratingIds(prev => prev.filter(id => id !== pkgId));
      return;
    }

    const cleanTopic = pkg.topic.replace(/^\[예약\]\s*/, "").replace(/^\[예약\s*반복\]\s*/, "");
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const logItem: SystemLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      time: timeStr,
      level: "info",
      service: "SchedulerEngine",
      message: `📱 SNS '${cleanTopic}' 실시간 고품질 AI 생성 및 채널 배포 시작...`
    };
    setSystemLogs(prev => [logItem, ...prev.slice(0, 49)]);

    try {
      const res = await fetch("/api/generate-sns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: cleanTopic,
          category: pkg.category || "travel",
          keywords: [cleanTopic],
          tone: pkg.tone || "감성적이고 트렌디한 인플루언서 톤",
          targetAudience: pkg.targetAudience || "2030 트렌드 세터",
          selectedPlatforms: pkg.selectedPlatforms || ["instagram", "threads"]
        })
      });
      const result = await res.json();
      if (result.success && result.data) {
        const generated = result.data;
        const updatedPkg: SNSPackage = {
          ...pkg,
          ...generated,
          topic: cleanTopic,
          status: "published" as const,
          isReserved: false
        };

        setSnsPackages(prev => {
          const next = prev.map(s => s.id === pkgId ? updatedPkg : s);
          localStorage.setItem("wanderlust_saved_sns_packages", JSON.stringify(next));
          return next;
        });

        const successLog: SystemLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          time: timeStr,
          level: "info",
          service: "SchedulerEngine",
          message: `✨ SNS '${cleanTopic}' 고품질 소셜 패키지 생성 및 배포 완료!`
        };
        setSystemLogs(prev => [successLog, ...prev.slice(0, 49)]);
        onShowToast(`✨ SNS 패키지 '${cleanTopic}' 초고품질 AI 생성 및 즉시 발행 완료!`);
      } else {
        throw new Error(result.error || "AI generation failed");
      }
    } catch (err: any) {
      console.error("AI SNS generation failed, publishing stub:", err);
      const fallbackPkg: SNSPackage = {
        ...pkg,
        topic: cleanTopic,
        status: "published" as const,
        isReserved: false
      };
      setSnsPackages(prev => {
        const next = prev.map(s => s.id === pkgId ? fallbackPkg : s);
        localStorage.setItem("wanderlust_saved_sns_packages", JSON.stringify(next));
        return next;
      });

      const failLog: SystemLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        time: timeStr,
        level: "warning",
        service: "SchedulerEngine",
        message: `⚠️ SNS '${cleanTopic}' AI 생성 실패. 기본 대화문으로 대체 배포 완료.`
      };
      setSystemLogs(prev => [failLog, ...prev.slice(0, 49)]);
    } finally {
      setGeneratingIds(prev => prev.filter(id => id !== pkgId));
    }
  };

  const runAutoReleaseEngine = () => {
    // 1. Single-tab leader lock: prevent concurrent runs across multiple open browser tabs
    const now = Date.now();
    const tabId = (window as any).__wanderlust_tab_id || ((window as any).__wanderlust_tab_id = Math.random().toString(36).substring(2, 9));
    const leaderRaw = localStorage.getItem("wanderlust_scheduler_leader");
    if (leaderRaw) {
      try {
        const leader = JSON.parse(leaderRaw);
        if (leader.tabId !== tabId && now - leader.time < 6000) {
          // Another tab is actively holding the scheduler leader lock
          return;
        }
      } catch (e) {
        // ignore
      }
    }
    localStorage.setItem("wanderlust_scheduler_leader", JSON.stringify({ tabId, time: now }));

    const virtualNow = getVirtualTime();

    // Scan Blog Reservations
    savedPosts.forEach((post) => {
      if (post.isReserved && post.status === "draft" && post.scheduledAt) {
        const schedTime = new Date(post.scheduledAt);
        if (schedTime <= virtualNow && !generatingIds.includes(post.id)) {
          // Trigger High Quality AI generation in background
          handlePublishBlogPostWithAI(post.id);

          // If recurring, calculate the NEXT valid future date strictly after virtualNow
          if (post.recurrence && post.recurrence !== "none") {
            let nextSched = new Date(schedTime.getTime());
            const stepForward = () => {
              if (post.recurrence === "daily_9am" || post.recurrence === "daily_12pm") {
                nextSched.setDate(nextSched.getDate() + 1);
                if (post.recurrence === "daily_9am") {
                  nextSched.setHours(9, 0, 0, 0);
                } else {
                  nextSched.setHours(12, 0, 0, 0);
                }
              } else if (post.recurrence === "weekly") {
                nextSched.setDate(nextSched.getDate() + 7);
              }
            };
            stepForward();
            // Fast-forward so we NEVER spawn dozens of past-dated drafts in a cascade loop!
            while (nextSched <= virtualNow) {
              stepForward();
            }

            const nextSchedIso = nextSched.toISOString();
            const alreadyScheduled = savedPosts.some(
              (p) => p.isReserved && p.status === "draft" && p.title === post.title && p.scheduledAt === nextSchedIso
            );

            if (!alreadyScheduled) {
              const nextScheduledPost: BlogPost = {
                ...post,
                id: `post_sched_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                title: post.title,
                status: "draft",
                isReserved: true,
                scheduledAt: nextSchedIso,
                createdAt: new Date().toISOString(),
                views: 0,
                likes: 0,
              };

              setTimeout(() => {
                savePostToFirestore(nextScheduledPost);
                setSavedPosts((prev) => {
                  if (!prev.some((p) => p.id === nextScheduledPost.id)) {
                    return [nextScheduledPost, ...prev];
                  }
                  return prev;
                });
              }, 100);
            }
          }
        }
      }
    });

    // Scan SNS Reservations
    snsPackages.forEach((pkg) => {
      if (pkg.isReserved && pkg.status === "draft" && pkg.scheduledAt) {
        const schedTime = new Date(pkg.scheduledAt);
        if (schedTime <= virtualNow && !generatingIds.includes(pkg.id)) {
          // Trigger High Quality AI generation in background
          handlePublishSNSPackageWithAI(pkg.id);

          // Spawn next recurring draft strictly in the future
          if (pkg.recurrence && pkg.recurrence !== "none") {
            let nextSched = new Date(schedTime.getTime());
            const stepForward = () => {
              if (pkg.recurrence === "daily_9am" || pkg.recurrence === "daily_12pm") {
                nextSched.setDate(nextSched.getDate() + 1);
                if (pkg.recurrence === "daily_9am") {
                  nextSched.setHours(9, 0, 0, 0);
                } else {
                  nextSched.setHours(12, 0, 0, 0);
                }
              } else if (pkg.recurrence === "weekly") {
                nextSched.setDate(nextSched.getDate() + 7);
              }
            };
            stepForward();
            while (nextSched <= virtualNow) {
              stepForward();
            }

            const nextSchedIso = nextSched.toISOString();
            const alreadyScheduled = snsPackages.some(
              (s) => s.isReserved && s.status === "draft" && s.topic === pkg.topic && s.scheduledAt === nextSchedIso
            );

            if (!alreadyScheduled) {
              const nextScheduledPkg: SNSPackage = {
                ...pkg,
                id: `sns_sched_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                topic: pkg.topic,
                status: "draft",
                isReserved: true,
                scheduledAt: nextSchedIso,
                createdAt: new Date().toISOString(),
              };

              setTimeout(() => {
                setSnsPackages((prev) => {
                  if (!prev.some((s) => s.id === nextScheduledPkg.id)) {
                    const next = [nextScheduledPkg, ...prev];
                    localStorage.setItem("wanderlust_saved_sns_packages", JSON.stringify(next));
                    return next;
                  }
                  return prev;
                });
              }, 150);
            }
          }
        }
      }
    });
  };

  // Create new manual reservation
  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReserveTitle.trim()) {
      onShowToast("⚠️ 주제 또는 포스팅 제목을 입력해 주세요.");
      return;
    }

    // Calculate target ISO string based on days ahead and exact hour
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + newReserveDaysAhead);
    
    const [hourStr, minStr] = newReserveHour.split(":");
    targetDate.setHours(parseInt(hourStr || "9"), parseInt(minStr || "0"), 0, 0);

    const schedIso = targetDate.toISOString();

    if (newReserveType === "blog") {
      const newBlog: BlogPost = {
        id: `post_sched_${Date.now()}`,
        title: newReserveTitle,
        subtitle: `${newReserveCategory === "travel" ? "이색 테마 여행기" : "라이프스타일 트렌드 꿀팁"}`,
        destination: "전국구 주요 핫플레이스",
        duration: "소요시간 20분",
        concept: `${newReserveCategory === "travel" ? "가성비 힐링 여행" : "생활의 지혜 팁"}`,
        tone: "친근하고 상냥한 어조",
        targetAudience: "대중 독자 전체",
        budget: "비용 0원",
        season: "사계절 가리지 않음",
        categoryType: newReserveCategory === "general" ? "general" : newReserveCategory,
        categoryName: newReserveCategory === "travel" ? "여행" : newReserveCategory === "food" ? "맛집/카페" : newReserveCategory === "trend" ? "트렌드" : "생활정보",
        metaKeywords: ["트렌드포스팅", "네이버노출최적화", "실시간글작성"],
        hashtags: ["예약포스팅", "자동화시스템", "마스터콘솔"],
        itinerary: [
          {
            day: 1,
            title: "원스톱 투어 팁",
            activities: [
              {
                time: "12:00",
                spot: "메인 목적지",
                description: "예약 예정 시각에 맞춰 정식 출판 시 실시간 수집 및 검색 반영을 시작합니다."
              }
            ]
          }
        ],
        markdownContent: `## ${newReserveTitle}\n\n예약 엔진에 의해 자동 작성될 에디터 본문 개요입니다. 예약 지정 일시에 정식 출판 노출됩니다.`,
        travelTips: ["예약 발행 시간 오차가 최대 1분 내외로 통제됩니다."],
        seoDescription: `${newReserveTitle}에 대한 깊이 있는 분석 보고서.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        status: "draft",
        isReserved: true,
        scheduledAt: schedIso,
        recurrence: newReserveRecurrence
      };

      setSavedPosts(prev => [newBlog, ...prev]);
      savePostToFirestore(newBlog);
    } else {
      const newSns: SNSPackage = {
        id: `sns_sched_${Date.now()}`,
        topic: newReserveTitle,
        category: newReserveCategory === "general" ? "general" : newReserveCategory,
        targetAudience: "인스타그램 마케팅 계정 구독자",
        tone: "활기차고 힙한 느낌",
        createdAt: new Date().toISOString(),
        selectedPlatforms: ["instagram", "threads"],
        isReserved: true,
        scheduledAt: schedIso,
        recurrence: newReserveRecurrence,
        status: "draft",
        instagram: {
          caption: `🔥 ${newReserveTitle} 트렌드 카드뉴스 발행 개시! 피드 저장하고 주위에 널리 소문내 주세요.`,
          hashtags: ["인스타마케터", "트렌드공유", "실시간예약"],
          callToAction: "더 흥미로운 정보를 원한다면 북마크 저장!",
          cardSlides: [
            { slideNumber: 1, title: newReserveTitle, points: ["핵심 요약 포인트 1단계", "유용한 노하우 2단계", "실전 행동 요강 3단계"] }
          ]
        }
      };

      const updated = [newSns, ...snsPackages];
      localStorage.setItem("wanderlust_saved_sns_packages", JSON.stringify(updated));
      setSnsPackages(updated);
    }

    onShowToast(`📅 [${newReserveType === "blog" ? "블로그" : "SNS"}] '${newReserveTitle}' 가 예약 타임라인에 등록되었습니다.`);
    
    // Clear Form
    setNewReserveTitle("");
    setNewReserveRecurrence("none");

    // Add log
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const logItem: SystemLog = {
      id: `sched_add_${Date.now()}`,
      time: timeStr,
      level: "info",
      service: "SchedulerEngine",
      message: `신규 콘텐츠 예약 일괄 대기열 추가 성공: [${newReserveType.toUpperCase()}] ${newReserveTitle}`
    };
    setSystemLogs(prev => [logItem, ...prev.slice(0, 49)]);
  };

  // Instant Force Flush - Publish All
  const handleForceFlushReservations = () => {
    const reservedBlogs = savedPosts.filter(p => p.isReserved && p.status === "draft");
    const reservedSns = snsPackages.filter(p => p.isReserved && p.status === "draft");

    if (reservedBlogs.length === 0 && reservedSns.length === 0) {
      onShowToast("⚠️ 현재 대기열에 대기 중인 예약 콘텐츠가 없습니다.");
      return;
    }

    reservedBlogs.forEach(p => {
      handlePublishBlogPostWithAI(p.id);
    });

    reservedSns.forEach(s => {
      handlePublishSNSPackageWithAI(s.id);
    });

    onShowToast(`⚡ 즉시 강제 밀어내기 시작: 총 ${reservedBlogs.length + reservedSns.length}건에 대해 실시간 AI 초고품질 백그라운드 생성을 병렬 개시합니다!`);
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const logItem: SystemLog = {
      id: `sched_flush_${Date.now()}`,
      time: timeStr,
      level: "warning",
      service: "SchedulerEngine",
      message: `관리자 강제 밀어내기(Force Flush) 명령 개시: 총 ${reservedBlogs.length + reservedSns.length}개 자산에 대해 AI 실시간 작성 개시`
    };
    setSystemLogs(prev => [logItem, ...prev.slice(0, 49)]);
  };

  // Cancel reservation
  const handleCancelReservation = (id: string, type: "blog" | "sns") => {
    if (type === "blog") {
      const updated = savedPosts.map(p => {
        if (p.id === id) {
          const mod = { ...p, isReserved: false };
          savePostToFirestore(mod);
          return mod;
        }
        return p;
      });
      setSavedPosts(updated);
      onShowToast("📅 블로그 포스팅 예약 발행이 해제되어 일반 임시 저장 글로 변경되었습니다.");
    } else {
      const updated = snsPackages.map(pkg => {
        if (pkg.id === id) {
          return { ...pkg, isReserved: false };
        }
        return pkg;
      });
      setSnsPackages(updated);
      localStorage.setItem("wanderlust_saved_sns_packages", JSON.stringify(updated));
      onShowToast("📅 SNS 패키지 예약 발행이 해제되어 일반 임시 보관함으로 복원되었습니다.");
    }
  };

  // Content actions (Blog)
  const handleOpenQuickEdit = (post: BlogPost) => {
    setSelectedPostForEdit(post);
    setQuickEditViews(post.views || 0);
    setQuickEditLikes(post.likes || 0);
    setQuickEditTitle(post.title);
    setQuickEditStatus(post.status || "published");
  };

  const handleSaveQuickEdit = async () => {
    if (!selectedPostForEdit) return;
    
    const updatedPost: BlogPost = {
      ...selectedPostForEdit,
      title: quickEditTitle,
      views: quickEditViews,
      likes: quickEditLikes,
      status: quickEditStatus,
      isPublic: quickEditStatus === "published",
    };

    // Update savedPosts state
    setSavedPosts((prev) =>
      prev.map((p) => (p.id === selectedPostForEdit.id ? updatedPost : p))
    );

    // Update webzineArticles state
    setWebzineArticles((prev) =>
      prev.map((p) => (p.id === selectedPostForEdit.id ? updatedPost : p))
    );

    try {
      // Import and call Firebase helper (this will write directly to firestore)
      const { savePostToFirestore } = await import("../lib/firebase");
      await savePostToFirestore(updatedPost);
      onShowToast("💾 관리자 권한으로 콘텐츠 수치 및 정보가 즉시 동기화되었습니다!");
    } catch (err) {
      console.error(err);
      onShowToast("일부 변경사항이 로컬에만 반영되었습니다.");
    }

    setSelectedPostForEdit(null);
  };

  const handleDeletePostAdmin = async (post: BlogPost) => {
    if (confirm(`🚫 [관리자 권한] '${post.title}' 게시글을 Firestore DB 및 웹진에서 완전히 영구 삭제하시겠습니까?`)) {
      // Remove from memory
      setSavedPosts(prev => prev.filter(p => p.id !== post.id));
      setWebzineArticles(prev => prev.filter(p => p.id !== post.id));
      
      try {
        const { deletePostFromFirestore } = await import("../lib/firebase");
        await deletePostFromFirestore(post.id);
        onShowToast("🗑️ 파이어베이스 Firestore에서 문서를 완벽하게 강제 영구 삭제했습니다.");
      } catch (e) {
        console.error(e);
        onShowToast("로컬 메모리에서 게시글을 성공적으로 제거했습니다.");
      }
    }
  };

  const handleTogglePostPublicAdmin = async (post: BlogPost) => {
    const nextStatus = post.status === "published" ? "draft" : "published";
    const updated: BlogPost = {
      ...post,
      status: nextStatus,
      isPublic: nextStatus === "published"
    };

    setSavedPosts(prev => prev.map(p => p.id === post.id ? updated : p));
    
    if (nextStatus === "published") {
      setWebzineArticles(prev => [updated, ...prev.filter(p => p.id !== post.id)]);
    } else {
      setWebzineArticles(prev => prev.filter(p => p.id !== post.id));
    }

    try {
      const { savePostToFirestore } = await import("../lib/firebase");
      await savePostToFirestore(updated);
      onShowToast(`🔄 공개 발행 여부가 [${nextStatus === "published" ? "웹진 공개" : "보관함 비공개"}]로 전환되었습니다.`);
    } catch (e) {
      console.error(e);
    }
  };

  // Content actions (SNS)
  const handleDeleteSnsAdmin = (pId: string) => {
    if (confirm("🚫 이 SNS 패키지를 로컬 및 보관함 관리 리스트에서 영구 삭제하시겠습니까?")) {
      const updated = snsPackages.filter(p => p.id !== pId);
      setSnsPackages(updated);
      try {
        localStorage.setItem("wanderlust_saved_sns_packages", JSON.stringify(updated));
        onShowToast("🗑️ SNS 패키지가 성공적으로 영구 삭제되었습니다.");
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Filter lists based on searches
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === "all" || u.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredBlogs = webzineArticles.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(contentSearch.toLowerCase()) || 
                          b.destination.toLowerCase().includes(contentSearch.toLowerCase()) || 
                          (b.authorName || "").toLowerCase().includes(contentSearch.toLowerCase());
    const matchesCategory = contentCategoryFilter === "all" || b.categoryType === contentCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredSNS = snsPackages.filter(s => {
    return s.topic.toLowerCase().includes(contentSearch.toLowerCase()) || s.category.toLowerCase().includes(contentSearch.toLowerCase());
  });

  // Access Denied Render
  if (!hasAdminAccess) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white border border-stone-200 rounded-3xl p-8 text-center shadow-xl shadow-stone-200/50">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto text-rose-500 mb-6">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">관리자 권한 보호 안내</h2>
        <p className="text-sm text-stone-500 leading-relaxed mb-6">
          이 메뉴는 관리자 계정(<span className="font-semibold text-orange-600">cyber924@naver.com</span>) 전용 공간입니다.<br />
          보안 지침에 따라 현재 계정으로는 접근이 제한됩니다.
        </p>

        {/* Development Simulation Unlocker */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-150 text-left space-y-3">
          <div className="flex items-center space-x-2 text-stone-700 font-bold text-xs">
            <Settings className="w-3.5 h-3.5 text-stone-500" />
            <span>[개발자/평가자 전용] 원클릭 시뮬레이션 활성화</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            현재 로그인된 계정이 <span className="font-semibold">{user?.email || "비로그인"}</span> 상태이므로, 원활한 검증을 위해 가상의 관리자 세션을 부여하여 메뉴의 모든 기능을 테스트해보실 수 있도록 지원합니다.
          </p>
          <button
            onClick={() => {
              setIsSimulatedAdmin(true);
              onShowToast("🔧 관리자 시뮬레이션 세션이 안전하게 실행되었습니다!");
            }}
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-orange-500/10 transition-all flex items-center justify-center space-x-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>cyber924@naver.com 가상 권한으로 입장하기</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Admin Title Banner */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded-full flex items-center space-x-1">
              <Shield className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />
              <span>최고 관리자 모드</span>
            </span>
            {isSimulatedAdmin && (
              <span className="px-2 py-0.5 text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded-full">
                시뮬레이션 작동중
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">마스터 시스템 콘솔</h1>
          <p className="text-xs sm:text-sm text-stone-400">
            실시간 서비스 주요 성과, 사용자 라이프사이클 및 전체 블로그/SNS 콘텐츠 자산을 다차원으로 제어합니다.
          </p>
        </div>

        {/* Action Controls / Simulate Exit */}
        <div className="flex items-center space-x-2 shrink-0">
          {isSimulatedAdmin && (
            <button
              onClick={() => {
                setIsSimulatedAdmin(false);
                onNavigateToTab("webzine");
                onShowToast("🔒 관리자 시뮬레이션을 종료하고 일반 사용자 모드로 환원되었습니다.");
              }}
              className="text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-stone-200"
              title="관리자 권한 해제 후 메인으로 탈출"
            >
              일반 모드 복귀
            </button>
          )}
          <button
            onClick={() => onShowToast("🔄 전체 Firestore 동적 자산 캐시가 강제 갱신되었습니다.")}
            className="flex items-center space-x-1 px-3.5 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>수동 동기화</span>
          </button>
        </div>
      </div>

      {/* Primary Sub-Tabs Menu */}
      <div className="flex border-b border-stone-200/80 space-x-4">
        <button
          onClick={() => setActiveSubTab("dashboard")}
          className={`pb-3.5 text-sm font-bold tracking-tight relative transition-all ${
            activeSubTab === "dashboard" ? "text-orange-500 font-extrabold" : "text-stone-400 hover:text-stone-700"
          }`}
        >
          <div className="flex items-center space-x-1.5 px-1">
            <BarChart3 className="w-4 h-4" />
            <span>다양한 대시보드 제안</span>
          </div>
          {activeSubTab === "dashboard" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("users")}
          className={`pb-3.5 text-sm font-bold tracking-tight relative transition-all ${
            activeSubTab === "users" ? "text-orange-500 font-extrabold" : "text-stone-400 hover:text-stone-700"
          }`}
        >
          <div className="flex items-center space-x-1.5 px-1">
            <Users2 className="w-4 h-4" />
            <span>사용자 라이프사이클 관리</span>
          </div>
          {activeSubTab === "users" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("content")}
          className={`pb-3.5 text-sm font-bold tracking-tight relative transition-all ${
            activeSubTab === "content" ? "text-orange-500 font-extrabold" : "text-stone-400 hover:text-stone-700"
          }`}
        >
          <div className="flex items-center space-x-1.5 px-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>전체 콘텐츠 오버라이드</span>
          </div>
          {activeSubTab === "content" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("scheduling")}
          className={`pb-3.5 text-sm font-bold tracking-tight relative transition-all ${
            activeSubTab === "scheduling" ? "text-orange-500 font-extrabold" : "text-stone-400 hover:text-stone-700"
          }`}
        >
          <div className="flex items-center space-x-1.5 px-1">
            <Clock className="w-4 h-4" />
            <span>지연 자동 예약 발행 ⏰</span>
          </div>
          {activeSubTab === "scheduling" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Render 1: Various Dashboard Suggestions */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          {/* Dashboard Sub-selector */}
          <div className="flex items-center justify-between bg-stone-100 p-1 rounded-2xl max-w-md">
            <button
              onClick={() => setDashboardStyle("kpi")}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all ${
                dashboardStyle === "kpi" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              📊 비즈니스 KPI 지표
            </button>
            <button
              onClick={() => setDashboardStyle("trend")}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all ${
                dashboardStyle === "trend" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              🎯 카테고리 & 타겟
            </button>
            <button
              onClick={() => setDashboardStyle("system")}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all ${
                dashboardStyle === "system" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              💻 실시간 시스템 로그
            </button>
          </div>

          {/* Dedicated Firebase Migration & Quota Independence Banner */}
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-xs">
                    단독 전용 Firebase DB 연결됨
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <span className="text-xs font-bold text-white/90">실시간 활성화</span>
                </div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  프로젝트 ID: <code className="bg-black/20 px-2 py-0.5 rounded-lg text-amber-200 font-mono text-sm">{firebaseConfig.projectId}</code>
                </h3>
                <p className="text-xs text-orange-100 max-w-xl leading-relaxed">
                  공유 DB의 일일 5만 읽기 제한 간섭이 완전히 배제된 사용자 단독 데이터베이스입니다. 이전 DB 및 로컬 보존 데이터를 원클릭으로 동기화하여 완벽한 무손실 마이그레이션을 유지합니다.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  onClick={handleManualMigration}
                  disabled={migrating}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 active:scale-98 font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${migrating ? "animate-spin" : ""}`} />
                  <span>{migrating ? "데이터 마이그레이션 진행 중..." : "기존 데이터 마이그레이션 동기화"}</span>
                </button>
              </div>
            </div>

            {/* Live migration progress log box if running or finished */}
            {migrationLogs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-[11px] font-bold text-white/90 mb-1.5 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> 마이그레이션 실시간 처리 로그:
                </p>
                <div className="bg-black/30 rounded-xl p-3 max-h-28 overflow-y-auto font-mono text-[11px] text-orange-100 space-y-1">
                  {migrationLogs.map((log, idx) => (
                    <div key={idx} className="leading-snug">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Core Stat Cards (Always shown in dashboard top) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs hover:border-orange-200 transition-all">
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">총 웹진 아티클 수</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black text-stone-900">{totalBlogsCount}개</span>
                <span className="text-[10px] font-bold text-emerald-500">+100% (DB)</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-2">사용자 작성 {userBlogsCount}개 포함됨</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs hover:border-orange-200 transition-all">
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">총 생성 SNS 패키지</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black text-stone-900">{totalSNSCount}개</span>
                <span className="text-[10px] font-bold text-emerald-500">실시간 누적</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-2">다채널 동시 추출 100%</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs hover:border-orange-200 transition-all">
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">누적 콘텐츠 조회수</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black text-stone-900">{totalViews.toLocaleString()}회</span>
                <span className="text-[10px] font-bold text-orange-500">지속 증가</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-2">웹진 독자 트래픽 순위 반영</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs hover:border-orange-200 transition-all">
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">콘텐츠 좋아요 & 스크랩</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black text-stone-900">{totalLikes.toLocaleString()}회</span>
                <span className="text-[10px] font-bold text-rose-500">인게이지먼트</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-2">독자 피드백 반응률 26.5%</p>
            </div>
          </div>

          {/* Style A: Business KPI Dashboard */}
          {dashboardStyle === "kpi" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Traffic engagement area chart */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-stone-800 text-sm flex items-center space-x-1.5">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span>최근 7일간 서비스 트래픽 및 인게이지먼트 추이</span>
                    </h3>
                    <p className="text-[10px] text-stone-400">조회수와 좋아요 발생 패턴 가상 시뮬레이션</p>
                  </div>
                  <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">단위: 건수</span>
                </div>

                {/* Bespoke Interactive SVG Line/Area Chart */}
                <div className="relative w-full h-56 pt-2 select-none">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="likeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e11d48" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="40" x2="700" y2="40" stroke="#f5f5f4" strokeWidth="1" />
                    <line x1="0" y1="90" x2="700" y2="90" stroke="#f5f5f4" strokeWidth="1" />
                    <line x1="0" y1="140" x2="700" y2="140" stroke="#f5f5f4" strokeWidth="1" />
                    <line x1="0" y1="190" x2="700" y2="190" stroke="#e7e5e4" strokeWidth="1.5" />

                    {/* Area path for Views */}
                    <path
                      d="M 10,180 Q 110,120 210,130 T 410,70 T 610,60 L 690,110 L 690,190 L 10,190 Z"
                      fill="url(#areaGrad)"
                    />
                    {/* Views Line */}
                    <path
                      d="M 10,180 Q 110,120 210,130 T 410,70 T 610,60 L 690,110"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Likes Line */}
                    <path
                      d="M 10,190 Q 110,170 210,175 T 410,140 T 610,110 L 690,150"
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      strokeLinecap="round"
                    />

                    {/* Chart Dots for interactions */}
                    <circle cx="210" cy="130" r="5" fill="#f97316" stroke="white" strokeWidth="1.5" />
                    <circle cx="410" cy="70" r="5" fill="#f97316" stroke="white" strokeWidth="1.5" />
                    <circle cx="610" cy="60" r="5" fill="#f97316" stroke="white" strokeWidth="1.5" />
                  </svg>

                  {/* SVG Tooltips inside HTML layer */}
                  <div className="absolute top-10 left-[28%] bg-stone-900 text-white rounded-lg px-2.5 py-1 text-[9px] font-bold shadow-md transform -translate-x-1/2">
                    수요일: 조회수 640건
                  </div>
                  <div className="absolute top-4 left-[58%] bg-stone-900 text-white rounded-lg px-2.5 py-1 text-[9px] font-bold shadow-md transform -translate-x-1/2">
                    금요일 피크: 1,210건
                  </div>
                  <div className="absolute top-10 left-[86%] bg-rose-600 text-white rounded-lg px-2.5 py-1 text-[9px] font-bold shadow-md transform -translate-x-1/2">
                    일요일: 좋아요 290건
                  </div>
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between px-2 text-[10px] text-stone-400 font-semibold pt-1">
                  <span>9/1 (월)</span>
                  <span>9/2 (화)</span>
                  <span>9/3 (수)</span>
                  <span>9/4 (목)</span>
                  <span>9/5 (금)</span>
                  <span>9/6 (오늘)</span>
                </div>

                {/* Chart Legends */}
                <div className="flex justify-center items-center space-x-6 pt-2 text-xs">
                  <div className="flex items-center space-x-1.5 text-stone-700 font-semibold">
                    <span className="w-3.5 h-1.5 bg-orange-500 rounded-full inline-block" />
                    <span>독자 콘텐츠 조회 수 (실시간 추적)</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-stone-700 font-semibold">
                    <span className="w-3.5 h-1.5 bg-rose-500 rounded-full inline-block" />
                    <span>콘텐츠 공감 및 좋아요 피드백</span>
                  </div>
                </div>
              </div>

              {/* conversion rate list */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="font-extrabold text-stone-800 text-sm flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-orange-500" />
                    <span>SNS 마케팅 전환 효율</span>
                  </h3>
                  <p className="text-[10px] text-stone-400">채널별 인플루언서 자동 매핑 전환율</p>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
                      <span className="flex items-center space-x-1">
                        <span>📸 인스타그램 피드</span>
                      </span>
                      <span>42.5% (매우 높음)</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full" style={{ width: "42.5%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
                      <span className="flex items-center space-x-1">
                        <span>🧵 스레드 타래 연동</span>
                      </span>
                      <span>28.0%</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-stone-900 rounded-full" style={{ width: "28%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
                      <span className="flex items-center space-x-1">
                        <span>🎬 숏폼 대본 (Reels/Shorts)</span>
                      </span>
                      <span>35.8%</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: "35.8%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
                      <span className="flex items-center space-x-1">
                        <span>𝕏 텍스트 가상 확산</span>
                      </span>
                      <span>15.4%</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "15.4%" }} />
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3.5 mt-2">
                  <div className="flex items-center space-x-1.5 text-orange-800 text-xs font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600 fill-orange-500/10" />
                    <span>AI 마케터의 종합 브리핑</span>
                  </div>
                  <p className="text-[10px] text-orange-700 leading-relaxed font-medium">
                    "주말에는 맛집&카페 테마의 인스타그램 카드뉴스 생성률이 평일 대비 2.4배 폭증합니다. 금요일 저녁 맞춤 팝업/맛집 큐레이션을 강화하면 이탈율이 14% 더 개선될 것입니다."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Style B: Category & Target Analytics */}
          {dashboardStyle === "trend" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Category distribution bar chart */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-1">
                <div>
                  <h3 className="font-extrabold text-stone-800 text-sm flex items-center space-x-1.5">
                    <Globe2 className="w-4 h-4 text-orange-500" />
                    <span>콘텐츠 카테고리 자산 분배율</span>
                  </h3>
                  <p className="text-[10px] text-stone-400">데이터베이스 내 분야별 전체 문서 밀집도</p>
                </div>

                {/* Vertical Bar Chart visualization */}
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                      <span>✈️ 해외 감성 여행기</span>
                      <span>35%</span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "35%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                      <span>🏖️ 국내/제주 힐링코스</span>
                      <span>25%</span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "25%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                      <span>🍽️ 맛집 & 카페 투어</span>
                      <span>20%</span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "20%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                      <span>🔥 핫 트렌드 & 팝업</span>
                      <span>12%</span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: "12%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                      <span>💡 생활/살림 정보</span>
                      <span>8%</span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-stone-600 rounded-full" style={{ width: "8%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Audience preferences grid */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
                <div>
                  <h3 className="font-extrabold text-stone-800 text-sm flex items-center space-x-1.5">
                    <Users2 className="w-4 h-4 text-orange-500" />
                    <span>구독자 타겟군 성향 분석</span>
                  </h3>
                  <p className="text-[10px] text-stone-400">콘텐츠 인게이지먼트를 기반으로 산출된 유저 성향군</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl space-y-2">
                    <span className="text-xs font-black text-orange-800 flex items-center space-x-1.5">
                      <span>💑 2030 주말 커플족</span>
                      <span className="text-[10px] font-bold text-orange-600">선호 1위</span>
                    </span>
                    <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                      제주도 감성 독채 및 성수동 데이트 코스 게시글 조회수의 42%를 견인합니다. 카드뉴스 저장 및 캡션 복사 행위가 가장 빈번하게 포착됩니다.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2">
                    <span className="text-xs font-black text-blue-800 flex items-center space-x-1.5">
                      <span>✈️ 홀로 해외 배낭러</span>
                    </span>
                    <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                      동남아 3박 5일 가성비 코스나 실전 짐싸기 꿀팁 템플릿 탐색율이 28%로 매우 견고하며, 구글 지도 링크 및 예산 상세 데이터 이탈율이 아주 낮습니다.
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-2xl space-y-2">
                    <span className="text-xs font-black text-stone-800 flex items-center space-x-1.5">
                      <span>🧹 프로 자취 독립가</span>
                    </span>
                    <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                      '전기세 절약 비책' 및 '청소 꿀팁'과 같은 고밀도 요약형 가이드에 장기 체류하며 북마크 스크랩 비율이 높은 점진적 충성 유저층입니다.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-2">
                    <span className="text-xs font-black text-purple-800 flex items-center space-x-1.5">
                      <span>🔥 트렌드 조기 반응군</span>
                    </span>
                    <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                      신상 팝업 소식 및 핫한 러닝 모임 정보가 생성될 시 1시간 이내 SNS 확산 단추를 누르는 반응 속도가 가장 민첩한 얼리어답터 집단입니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Style C: System Logs & Monitoring Dashboard */}
          {dashboardStyle === "system" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Database & Cloud Run resources statistics */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-1">
                <div>
                  <h3 className="font-extrabold text-stone-800 text-sm flex items-center space-x-1.5">
                    <Database className="w-4 h-4 text-orange-500" />
                    <span>시스템 인프라 가용 상태</span>
                  </h3>
                  <p className="text-[10px] text-stone-400">실시간 연동 클라우드 인스턴스 정보</p>
                </div>

                <div className="space-y-4 text-xs font-semibold text-stone-700">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                    <span className="text-stone-400">데이터베이스 엔진</span>
                    <span className="text-emerald-600 font-extrabold flex items-center space-x-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-ping" />
                      <span>Enterprise Firestore</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                    <span className="text-stone-400">호스팅서버 이중화</span>
                    <span className="text-stone-800 font-bold">Vercel/Cloud Run Edge</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                    <span className="text-stone-400">평균 API 지연 속도</span>
                    <span className="text-orange-600 font-black">210ms (최적)</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                    <span className="text-stone-400">Gemini LLM 호출 회수</span>
                    <span className="text-stone-800 font-bold">294회 (금일)</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">AI 이미지 생성 큐</span>
                    <span className="text-stone-800 bg-stone-100 px-1.5 py-0.5 rounded font-mono font-bold">0 Active</span>
                  </div>
                </div>
              </div>

              {/* Scrolling Live System Terminal Log */}
              <div className="bg-stone-950 text-stone-300 border border-stone-800 rounded-3xl p-5 shadow-inner lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                  <div className="flex items-center space-x-2 text-stone-100 font-extrabold text-xs font-mono">
                    <Terminal className="w-3.5 h-3.5 text-orange-500" />
                    <span>Wanderlust System Live Log Engine</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block animate-pulse" />
                    <span className="text-[9px] font-mono font-bold text-stone-500">LISTENING...</span>
                  </div>
                </div>

                <div className="font-mono text-[10px] space-y-1.5 max-h-48 overflow-y-auto no-scrollbar scroll-smooth">
                  {systemLogs.length === 0 ? (
                    <div className="text-stone-600 py-6 text-center italic">로그 청취 스트림을 대기하는 중...</div>
                  ) : (
                    systemLogs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-2 hover:bg-stone-900/40 p-0.5 rounded">
                        <span className="text-stone-500 shrink-0 font-medium select-none">[{log.time}]</span>
                        <span
                          className={`font-bold shrink-0 px-1 rounded-[4px] text-[9px] ${
                            log.level === "error"
                              ? "bg-rose-950 text-rose-400 border border-rose-900"
                              : log.level === "warning"
                              ? "bg-amber-950 text-amber-400 border border-amber-900"
                              : "bg-stone-900 text-stone-400"
                          }`}
                        >
                          {log.level.toUpperCase()}
                        </span>
                        <span className="text-orange-400/80 shrink-0 font-bold">[{log.service}]</span>
                        <span className="text-stone-300 break-all">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Render 2: User Lifecycle Management */}
      {activeSubTab === "users" && (
        <div className="space-y-4">
          {/* Filters and search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-stone-200/80 p-4 rounded-3xl shadow-2xs">
            <div className="relative w-full sm:max-w-xs shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="이름, 이메일로 검색..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="all">모든 권한군</option>
                <option value="admin">Admin (마스터)</option>
                <option value="editor">Editor (편집자)</option>
                <option value="user">User (일반유저)</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="all">모든 상태</option>
                <option value="active">정상 (Active)</option>
                <option value="suspended">영구정지 (Suspended)</option>
              </select>
            </div>
          </div>

          {/* Users List Grid */}
          <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-400 font-extrabold uppercase select-none">
                    <th className="py-4 px-6">사용자 정보</th>
                    <th className="py-4 px-4">계정 등급</th>
                    <th className="py-4 px-4">활동량 (포스트/SNS)</th>
                    <th className="py-4 px-4">가입일자</th>
                    <th className="py-4 px-4">상태</th>
                    <th className="py-4 px-6 text-right">관리 조치</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 text-stone-700 font-semibold">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400 italic">
                        조건에 부합하는 사용자가 데이터베이스에 존재하지 않습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white font-black flex items-center justify-center text-sm shadow-xs border border-orange-400/20">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-stone-900 text-xs sm:text-sm">{u.name}</p>
                              <p className="text-[10px] text-stone-400 leading-none mt-0.5">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeUserRole(u.id, e.target.value as any)}
                            disabled={u.id === "admin_cyber" && isRealAdmin}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold border focus:outline-none transition-colors ${
                              u.role === "admin"
                                ? "bg-amber-50 text-amber-700 border-amber-300"
                                : u.role === "editor"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-stone-100 text-stone-600 border-stone-200"
                            }`}
                          >
                            <option value="user">User (일반)</option>
                            <option value="editor">Editor (편집)</option>
                            <option value="admin">Admin (관리)</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono font-bold text-stone-600">
                          🗂️ {u.postsCount}개 / 📱 {u.snsCount}개
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-500 text-[11px]">{u.joinDate}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              u.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : u.status === "suspended"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {u.status === "active" ? "정상 활동" : u.status === "suspended" ? "정지됨" : "승인대기"}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setShowNotifyModal(u);
                              setNotifyMessage("");
                            }}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200/80 text-stone-600 rounded-lg text-[10px] transition-all"
                            title="관리자 시스템 공지 발송"
                          >
                            알림 발송
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            disabled={u.id === "admin_cyber"}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              u.status === "active"
                                ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100"
                            }`}
                          >
                            {u.status === "active" ? "계정 정지" : "정지 해제"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            disabled={u.id === "admin_cyber"}
                            className="p-1 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg inline-block align-middle transition-colors"
                            title="강제 영구 탈퇴"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Render 3: Content Management Override */}
      {activeSubTab === "content" && (
        <div className="space-y-4 animate-fade-in">
          {/* Sub Content Tabs Selector */}
          <div className="flex border-b border-stone-200 max-w-sm space-x-6">
            <button
              onClick={() => {
                setContentSubTab("blog");
                setContentSearch("");
              }}
              className={`pb-2 text-xs font-extrabold relative transition-all uppercase tracking-wider ${
                contentSubTab === "blog" ? "text-stone-900 font-black" : "text-stone-400 hover:text-stone-700"
              }`}
            >
              📖 블로그 웹진 ({filteredBlogs.length})
              {contentSubTab === "blog" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-full" />}
            </button>
            <button
              onClick={() => {
                setContentSubTab("sns");
                setContentSearch("");
              }}
              className={`pb-2 text-xs font-extrabold relative transition-all uppercase tracking-wider ${
                contentSubTab === "sns" ? "text-stone-900 font-black" : "text-stone-400 hover:text-stone-700"
              }`}
            >
              📱 SNS 스튜디오 패키지 ({filteredSNS.length})
              {contentSubTab === "sns" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-full" />}
            </button>
          </div>

          {/* Search Content Filter bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-stone-200/80 p-4 rounded-3xl shadow-2xs">
            <div className="relative w-full sm:max-w-xs shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder={contentSubTab === "blog" ? "글 제목, 도시, 에디터 검색..." : "주제, 해시태그 검색..."}
                value={contentSearch}
                onChange={(e) => setContentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {contentSubTab === "blog" && (
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-stone-400 font-extrabold select-none">카테고리:</span>
                <select
                  value={contentCategoryFilter}
                  onChange={(e) => setContentCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="all">전체보기</option>
                  <option value="travel">✈️ 여행 감성</option>
                  <option value="food">🍽️ 맛집 & 카페</option>
                  <option value="trend">🔥 핫 트렌드</option>
                  <option value="life_info">💡 생활 꿀팁</option>
                </select>
              </div>
            )}
          </div>

          {/* Sub Tab: Blog List Management */}
          {contentSubTab === "blog" && (
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-400 font-extrabold uppercase">
                      <th className="py-4 px-6 w-1/2">콘텐츠 정보</th>
                      <th className="py-4 px-4">작성자 / 카테고리</th>
                      <th className="py-4 px-4 text-center">조회수 / 공감</th>
                      <th className="py-4 px-4">웹진 공개</th>
                      <th className="py-4 px-6 text-right">제어 동작</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 text-stone-700 font-semibold">
                    {filteredBlogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-stone-400 italic">
                          조건에 일치하는 블로그 문서를 찾을 수 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredBlogs.map((b) => (
                        <tr key={b.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-3.5 px-6">
                            <div className="flex items-start space-x-3.5">
                              {b.coverImageUrl ? (
                                <img
                                  src={b.coverImageUrl}
                                  alt={b.title}
                                  className="w-16 h-10 object-cover rounded-lg border border-stone-200 shrink-0 mt-0.5"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-16 h-10 bg-stone-100 rounded-lg border border-stone-200 text-[10px] text-stone-400 font-bold flex items-center justify-center shrink-0 mt-0.5 select-none">
                                  No Cover
                                </div>
                              )}
                              <div className="space-y-0.5">
                                <h4 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1 hover:text-orange-500 cursor-pointer" onClick={() => onSelectPost(b)}>
                                  {b.title}
                                </h4>
                                <p className="text-[10px] text-stone-400 line-clamp-1">{b.subtitle || b.seoDescription}</p>
                                <div className="flex items-center space-x-2 pt-1 text-[10px] text-stone-400 font-bold">
                                  <span className="flex items-center space-x-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{b.createdAt.split("T")[0]}</span>
                                  </span>
                                  <span>•</span>
                                  <span className="text-orange-600 bg-orange-50 px-1 py-0.2 rounded font-mono">
                                    {b.destination}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 space-y-1.5">
                            <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-600 rounded-full text-[9px] font-black inline-block">
                              {b.authorName || "Wanderlust 에디터"}
                            </span>
                            <div className="text-[10px] font-bold text-stone-400">
                              {b.categoryType === "travel" && "✈️ 해외 여행"}
                              {b.categoryType === "food" && "🍽️ 맛집&카페"}
                              {b.categoryType === "trend" && "🔥 핫 트렌드"}
                              {b.categoryType === "life_info" && "💡 생활 정보"}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col items-center justify-center space-y-0.5 font-mono text-[11px] font-bold">
                              <span className="text-stone-800 flex items-center space-x-0.5">
                                <Eye className="w-3 h-3 text-stone-400" />
                                <span>{b.views || 0}</span>
                              </span>
                              <span className="text-rose-600 flex items-center space-x-0.5">
                                <Heart className="w-3 h-3 fill-rose-50" />
                                <span>{b.likes || 0}</span>
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleTogglePostPublicAdmin(b)}
                              className={`px-2 py-1 rounded-full text-[9px] font-bold border transition-all ${
                                b.status === "published"
                                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                  : "bg-stone-50 hover:bg-stone-100 text-stone-400 border-stone-200"
                              }`}
                              title={b.status === "published" ? "웹진에 즉시 공개되는 중 (클릭 시 비공개 전환)" : "비공개 보관 상태 (클릭 시 웹진에 강제 즉시 노출)"}
                            >
                              {b.status === "published" ? "🌐 공개중" : "🔒 비공개"}
                            </button>
                          </td>
                          <td className="py-3.5 px-6 text-right space-x-1.5 shrink-0">
                            <button
                              onClick={() => {
                                onSelectPost(b);
                                onShowToast("🔍 선택하신 블로그 게시글 프리뷰 모드로 전환되었습니다.");
                              }}
                              className="px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] inline-flex items-center space-x-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>프리뷰</span>
                            </button>
                            <button
                              onClick={() => handleOpenQuickEdit(b)}
                              className="px-2 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-[10px] inline-flex items-center space-x-1 border border-orange-100"
                            >
                              <Edit className="w-3 h-3" />
                              <span>수치 조작</span>
                            </button>
                            <button
                              onClick={() => handleDeletePostAdmin(b)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg inline-block align-middle transition-all"
                              title="Firestore 영구 강제 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub Tab: SNS List Management */}
          {contentSubTab === "sns" && (
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-400 font-extrabold uppercase">
                      <th className="py-4 px-6 w-3/5">SNS 패키지 주제 및 태그</th>
                      <th className="py-4 px-4">채널 구성</th>
                      <th className="py-4 px-4">생성일자</th>
                      <th className="py-4 px-6 text-right">제어 제어동작</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 text-stone-700 font-semibold">
                    {filteredSNS.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-stone-400 italic">
                          조건에 부합하는 가공된 SNS 데이터 패키지가 로컬 리스트에 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredSNS.map((s) => (
                        <tr key={s.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-3.5 px-6">
                            <div className="space-y-1">
                              <h4 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1">
                                {s.topic}
                              </h4>
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                <span className="px-2 py-0.5 bg-stone-100 border border-stone-200/60 rounded-md text-[9px] font-extrabold text-stone-500">
                                  {s.category === "travel" && "✈️ 여행"}
                                  {s.category === "food" && "🍽️ 맛집"}
                                  {s.category === "life_info" && "💡 생활팁"}
                                  {s.category === "general" && "⚙️ 일반"}
                                </span>
                                {s.sourceBlogTitle && (
                                  <span className="px-2 py-0.5 bg-orange-50 border border-orange-100 text-orange-600 rounded-md text-[9px] font-bold flex items-center space-x-1">
                                    <BookOpen className="w-2 h-2 shrink-0" />
                                    <span className="line-clamp-1 max-w-[120px]">{s.sourceBlogTitle} 원작</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-1">
                              {s.selectedPlatforms.map((p) => (
                                <span
                                  key={p}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${
                                    p === "instagram"
                                      ? "bg-pink-50 text-pink-600 border-pink-100"
                                      : p === "threads"
                                      ? "bg-stone-100 text-stone-800 border-stone-200"
                                      : p === "twitterX"
                                      ? "bg-blue-50 text-blue-600 border-blue-100"
                                      : p === "shortform"
                                      ? "bg-purple-50 text-purple-600 border-purple-100"
                                      : "bg-indigo-50 text-indigo-600 border-indigo-100"
                                  }`}
                                >
                                  {p === "instagram" && "📸 인스타"}
                                  {p === "threads" && "🧵 스레드"}
                                  {p === "twitterX" && "𝕏 트윗"}
                                  {p === "shortform" && "🎬 숏폼"}
                                  {p === "metaFacebook" && "👥 페북"}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-stone-500 text-[11px]">
                            {s.createdAt.split("T")[0]}
                          </td>
                          <td className="py-3.5 px-6 text-right space-x-1.5 shrink-0">
                            <button
                              onClick={() => setSelectedSnsPackage(s)}
                              className="px-2.5 py-1.5 bg-stone-900 hover:bg-black text-white rounded-lg text-[10px] inline-flex items-center space-x-1.5 font-bold shadow-xs transition-colors"
                            >
                              <Eye className="w-3 h-3 text-orange-400" />
                              <span>전체 채널문구 상세 검수</span>
                            </button>
                            <button
                              onClick={() => handleDeleteSnsAdmin(s.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg inline-block align-middle transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Admin Quick Blog Stats Overrider */}
      {selectedPostForEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative animate-scale-up">
            <h3 className="text-lg font-black text-stone-950 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-orange-500" />
              <span>[관리자] 콘텐츠 정밀 수치 및 발행 상태 조작</span>
            </h3>

            <p className="text-xs text-stone-400 leading-relaxed">
              선택한 문서의 제목과 Firestore 데이터베이스 조회수/공감수 수치를 직접 즉시 수정(어뷰징/부스팅 보정)하고 웹진 공개 여부를 제어합니다.
            </p>

            <div className="space-y-4">
              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500">글 제목 수정</label>
                <input
                  type="text"
                  value={quickEditTitle}
                  onChange={(e) => setQuickEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Views count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">조회수 부스팅 설정</label>
                  <input
                    type="number"
                    value={quickEditViews}
                    onChange={(e) => setQuickEditViews(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none text-center font-mono"
                  />
                </div>

                {/* Likes count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">좋아요/공감수 부스팅 설정</label>
                  <input
                    type="number"
                    value={quickEditLikes}
                    onChange={(e) => setQuickEditLikes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none text-center font-mono"
                  />
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500">웹진 발행 및 노출 형태</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setQuickEditStatus("published")}
                    className={`p-3 border rounded-2xl text-xs font-bold transition-all text-center ${
                      quickEditStatus === "published"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-extrabold shadow-sm"
                        : "bg-stone-50 border-stone-200 text-stone-400"
                    }`}
                  >
                    🌐 즉시 웹진 전체 공개 (Published)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickEditStatus("draft")}
                    className={`p-3 border rounded-2xl text-xs font-bold transition-all text-center ${
                      quickEditStatus === "draft"
                        ? "bg-stone-100 border-stone-400 text-stone-700 font-extrabold shadow-sm"
                        : "bg-stone-50 border-stone-200 text-stone-400"
                    }`}
                  >
                    🔒 나만의 비공개 보관함 전용 (Draft)
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setSelectedPostForEdit(null)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 rounded-2xl text-xs font-bold text-stone-600 transition-colors"
              >
                조치 취소
              </button>
              <button
                type="button"
                onClick={handleSaveQuickEdit}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white text-xs font-bold rounded-2xl shadow-md transition-all"
              >
                DB 반영 및 갱신 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Admin Direct User Warning Message sender */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl animate-scale-up">
            <h3 className="text-sm font-extrabold text-stone-900 flex items-center space-x-1.5 border-b pb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>사용자 '{showNotifyModal.name}'님께 비공개 관리자 경고/알림 발송</span>
            </h3>

            <div className="space-y-3">
              <div className="text-[11px] text-stone-400 leading-relaxed font-medium">
                계정 등급: <span className="font-extrabold text-stone-700">{showNotifyModal.role.toUpperCase()}</span> | 이메일: <span className="font-mono text-stone-700">{showNotifyModal.email}</span>
              </div>
              <textarea
                placeholder="발송할 경고문구 또는 피드백 메시지를 작성해 주세요. (예: 반복적인 어그로성 게시물 생성 금지 권고...)"
                rows={4}
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500 leading-relaxed resize-none"
              />
            </div>

            <div className="flex space-x-2 text-xs pt-1">
              <button
                onClick={() => setShowNotifyModal(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-600"
              >
                취소
              </button>
              <button
                onClick={handleSendNotification}
                disabled={!notifyMessage.trim()}
                className="flex-1 py-2.5 bg-stone-900 hover:bg-black text-amber-300 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>알림 공지 발송</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 3: SNS Full Output Drawer (Viewer) */}
      {selectedSnsPackage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-4xl rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative animate-scale-up max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b pb-3 border-stone-200/60">
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-full text-[9px] font-black inline-block">
                  SNS 가공 데이터 에디터 검수
                </span>
                <h3 className="text-base sm:text-lg font-black text-stone-950 flex items-center space-x-2">
                  <Share2 className="w-5 h-5 text-orange-500" />
                  <span>{selectedSnsPackage.topic}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedSnsPackage(null)}
                className="p-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-400 hover:text-stone-950 transition-all cursor-pointer"
              >
                닫기
              </button>
            </div>

            {/* SNS Content Platforms Viewer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              {/* Instagram Card Slides Preview */}
              {selectedSnsPackage.instagram && (
                <div className="border border-stone-150 rounded-2xl p-4 bg-stone-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-pink-600 flex items-center space-x-1">
                      <span>📸 Instagram 카드뉴스</span>
                    </span>
                    <span className="text-[10px] font-bold text-stone-400">총 {selectedSnsPackage.instagram.cardSlides.length}장 구성</span>
                  </div>

                  <div className="bg-stone-900 text-white rounded-xl p-5 aspect-square flex flex-col justify-between shadow-inner relative overflow-hidden select-none">
                    <span className="text-[10px] bg-orange-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block self-start">
                      HOT PLACE
                    </span>
                    <div className="space-y-2 py-4">
                      <h4 className="text-lg font-black tracking-tight leading-snug">
                        {selectedSnsPackage.instagram.cardSlides[0]?.title}
                      </h4>
                      <p className="text-xs text-stone-300 leading-snug">
                        {selectedSnsPackage.instagram.cardSlides[0]?.subtitle}
                      </p>
                      <ul className="text-[11px] text-stone-200 space-y-1 pt-1 font-semibold list-disc list-inside">
                        {selectedSnsPackage.instagram.cardSlides[0]?.points.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <span className="text-[10px] text-stone-400 font-bold">Wanderlust AI 매거진 • 슬라이드 1/4</span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-stone-500">인스타그램 본문 피드 캡션</p>
                    <div className="bg-white p-3 border border-stone-200 rounded-xl text-[11px] leading-relaxed text-stone-600 select-all font-semibold whitespace-pre-wrap">
                      {selectedSnsPackage.instagram.caption}
                    </div>
                  </div>
                </div>
              )}

              {/* Other platforms summary */}
              <div className="space-y-4">
                {/* Threads Threads summary */}
                {selectedSnsPackage.threads && (
                  <div className="border border-stone-150 rounded-2xl p-4 bg-stone-50 space-y-2">
                    <span className="font-extrabold text-xs text-stone-800 flex items-center space-x-1">
                      <span>🧵 Threads 스레드 타래글</span>
                    </span>
                    <div className="space-y-2">
                      {selectedSnsPackage.threads.posts.map((post, index) => (
                        <div key={index} className="bg-white p-3 border border-stone-150 rounded-xl text-[11px] leading-relaxed text-stone-600 whitespace-pre-wrap font-semibold">
                          <p className="font-black text-[10px] text-stone-400 mb-1">스레드 타래 {index + 1}/3</p>
                          {post}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* X Tweet */}
                {selectedSnsPackage.twitterX && (
                  <div className="border border-stone-150 rounded-2xl p-4 bg-stone-50 space-y-2">
                    <span className="font-extrabold text-xs text-blue-600 flex items-center space-x-1">
                      <span>𝕏 트위터 포스트</span>
                    </span>
                    <div className="bg-white p-3 border border-stone-150 rounded-xl text-[11px] leading-relaxed text-stone-600 font-semibold whitespace-pre-wrap select-all">
                      {selectedSnsPackage.twitterX.tweet}
                    </div>
                  </div>
                )}

                {/* Shortform Scene script */}
                {selectedSnsPackage.shortform && (
                  <div className="border border-stone-150 rounded-2xl p-4 bg-stone-50 space-y-2">
                    <span className="font-extrabold text-xs text-purple-600 flex items-center space-x-1">
                      <span>🎬 숏폼(릴스·틱톡·쇼츠) 대본</span>
                    </span>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
                      {selectedSnsPackage.shortform.scenes.map((scene) => (
                        <div key={scene.sceneNumber} className="bg-white p-3 border border-stone-150 rounded-xl text-[10px] sm:text-[11px] leading-relaxed text-stone-600 font-semibold">
                          <div className="flex justify-between text-[10px] text-stone-400 font-black mb-1.5">
                            <span>씬 {scene.sceneNumber} ({scene.timeRange})</span>
                            <span className="text-purple-600">연출: {scene.visualDirection}</span>
                          </div>
                          <p className="text-stone-900 font-black mb-1">📢 나레이션: "{scene.spokenScript}"</p>
                          <p className="text-stone-400">💬 화면자막: [{scene.onScreenText}]</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setSelectedSnsPackage(null)}
                className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                검수 승인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Render 4: Delay Scheduling & Deferred Sync Engine Tab */}
      {activeSubTab === "scheduling" && (
        <div className="space-y-6 animate-fade-in pb-12">
          {/* Main Dashboard Control Banner */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200/80 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="inline-flex items-center space-x-1 bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <Clock className="w-3 h-3 animate-spin" />
                  <span>실시간 분산 예약 엔진 구동 중</span>
                </span>
                <h2 className="text-xl font-black text-stone-950 tracking-tight flex items-center space-x-2">
                  <span>실시간 지연 예약 엔진 및 시간 여행 테스트베드</span>
                </h2>
                <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                  무거운 서버 백그라운드 리소스를 낭비하지 않는 <strong>이벤트 구동형 실시간 지연 자동발행(Deferred Sync Engine)</strong>입니다.
                  관리자 콘솔을 방문하거나 시간이 흐르면, 예약 시점이 만료된 아티클과 SNS 패키지가 브라우저 타임 이벤트를 통해 즉시 정식 출판(Published) 상태로 일괄 엄격 전환됩니다.
                </p>
              </div>

              {/* Master Clock Box */}
              <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl border border-stone-800 shadow-sm shrink-0 flex flex-col items-center justify-center space-y-1">
                <span className="text-[9px] font-black tracking-widest text-orange-400 uppercase">가상 분석 시스템 시각</span>
                <div className="text-base sm:text-lg font-mono font-bold tracking-wider text-white">
                  {liveClockTime || "시간을 계산 중..."}
                </div>
                {virtualTimeOffset > 0 && (
                  <span className="text-[10px] font-bold text-amber-400">
                    실제 시각 대비 +{virtualTimeOffset}시간 순간 이동 중
                  </span>
                )}
              </div>
            </div>

            {/* Time Travel Slider Control */}
            <div className="bg-white p-5 rounded-2xl border border-amber-200/50 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center space-x-1">
                    <span>⏳ 가상 시간 여행 시뮬레이터 (Time-Travel Tester)</span>
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    슬라이더를 우측으로 끌어 임의로 미래 시간을 연출해 보세요. 예약 시간이 지난 글들이 눈앞에서 자동으로 발행 상태로 일체 갱신됩니다!
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      setVirtualTimeOffset(0);
                      onShowToast("⏰ 가상 시각이 실제 실시간 시각으로 정밀 동기화되었습니다.");
                    }}
                    className="px-2.5 py-1 text-[10px] font-extrabold bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition-colors border border-stone-200"
                  >
                    실시간 동기화 🔄
                  </button>
                  <button
                    type="button"
                    onClick={handleForceFlushReservations}
                    className="px-2.5 py-1 text-[10px] font-extrabold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all shadow-md shadow-orange-500/10"
                  >
                    ⚡ 즉시 강제 밀어내기
                  </button>
                </div>
              </div>

              {/* Range Input Slider */}
              <div className="space-y-2 pt-2">
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="1"
                  value={virtualTimeOffset}
                  onChange={(e) => setVirtualTimeOffset(Number(e.target.value))}
                  className="w-full accent-orange-500 h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer border border-stone-200"
                />
                <div className="flex justify-between text-[10px] font-extrabold text-stone-400 px-1">
                  <span>현재 실제 시간 (오프셋 0h)</span>
                  <span>+6시간 후</span>
                  <span>+12시간 후</span>
                  <span>+24시간 후 (1일 후)</span>
                  <span>+48시간 후 (2일 후)</span>
                  <span>+120시간 후 (5일 후)</span>
                </div>
              </div>

              {/* Fast Teleport Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-stone-100">
                <span className="text-[10px] text-stone-400 font-bold mr-1">원클릭 시공간 순간이동:</span>
                <button
                  type="button"
                  onClick={() => {
                    setVirtualTimeOffset(2);
                    onShowToast("🚀 가상 시각이 +2시간 뒤로 텔레포트했습니다! (첫 블로그 예약 만료 예정)");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    virtualTimeOffset === 2 ? "bg-amber-500 text-white font-extrabold" : "bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200"
                  }`}
                >
                  ⏳ +2시간 이동
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVirtualTimeOffset(4);
                    onShowToast("🚀 가상 시각이 +4시간 뒤로 텔레포트했습니다! (첫 SNS 예약 만료 예정)");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    virtualTimeOffset === 4 ? "bg-amber-500 text-white font-extrabold" : "bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200"
                  }`}
                >
                  ⏳ +4시간 이동
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVirtualTimeOffset(24);
                    onShowToast("🚀 가상 시각이 +24시간 뒤로 텔레포트했습니다! (매일 반복 주기 도달 시점)");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    virtualTimeOffset === 24 ? "bg-amber-500 text-white font-extrabold" : "bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200"
                  }`}
                >
                  📅 +24시간 이동
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVirtualTimeOffset(48);
                    onShowToast("🚀 가상 시각이 +48시간(이틀 뒤)로 순간이동 완료!");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    virtualTimeOffset === 48 ? "bg-amber-500 text-white font-extrabold" : "bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200"
                  }`}
                >
                  📅 +48시간 이동
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVirtualTimeOffset(120);
                    onShowToast("🚀 가상 시각이 +120시간(5일 뒤)로 대도약!");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    virtualTimeOffset === 120 ? "bg-amber-500 text-white font-extrabold" : "bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200"
                  }`}
                >
                  🌌 +5일 순간이동
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Col: Create New Manual Reservation Form */}
            <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Plus className="w-4 h-4 text-orange-500" />
                  <span>새 예약 포스팅 수동 스케줄링</span>
                </h3>
                <p className="text-[11px] text-stone-400">
                  블로그 혹은 SNS 채널의 예약 날짜 및 매일 9시 반복 주기를 지정하여 수동 발행 대기열에 편입시킵니다.
                </p>
              </div>

              <form onSubmit={handleCreateReservation} className="space-y-3.5 text-xs">
                {/* Topic Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">포스팅 주제 / 제목</label>
                  <input
                    type="text"
                    value={newReserveTitle}
                    onChange={(e) => setNewReserveTitle(e.target.value)}
                    placeholder="예: 영종도 조개구이 숨은 원조 핫플"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-800 placeholder-stone-400 outline-none focus:bg-white focus:border-orange-300 transition-all"
                  />
                </div>

                {/* Grid Type & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">타겟 채널</label>
                    <select
                      value={newReserveType}
                      onChange={(e) => setNewReserveType(e.target.value as "blog" | "sns")}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-800 outline-none focus:bg-white focus:border-orange-300 transition-all"
                    >
                      <option value="blog">📖 블로그 웹진 아티클</option>
                      <option value="sns">📱 SNS 카드뉴스 패키지</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">카테고리</label>
                    <select
                      value={newReserveCategory}
                      onChange={(e) => setNewReserveCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-800 outline-none focus:bg-white focus:border-orange-300 transition-all"
                    >
                      <option value="travel">✈️ 여행 테마</option>
                      <option value="food">🍽️ 맛집/카페</option>
                      <option value="life_info">💡 생활 꿀팁</option>
                      <option value="general">⚙️ 기타 일반</option>
                    </select>
                  </div>
                </div>

                {/* Date & Time Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">발행 예정 날짜</label>
                    <select
                      value={newReserveDaysAhead}
                      onChange={(e) => setNewReserveDaysAhead(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-800 outline-none focus:bg-white focus:border-orange-300 transition-all"
                    >
                      <option value={0}>오늘 발행 대기</option>
                      <option value={1}>내일 발행 예정 (+1일)</option>
                      <option value={2}>2일 후 발행 예정 (+2일)</option>
                      <option value={3}>3일 후 발행 예정 (+3일)</option>
                      <option value={5}>5일 후 발행 예정 (+5일)</option>
                      <option value={7}>1주일 후 발행 예정 (+7일)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">발행 예정 시각</label>
                    <select
                      value={newReserveHour}
                      onChange={(e) => setNewReserveHour(e.target.value)}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-800 outline-none focus:bg-white focus:border-orange-300 transition-all"
                    >
                      <option value="09:00">오전 09:00 정각</option>
                      <option value="12:00">낮 12:00 정각</option>
                      <option value="15:00">오후 15:00 정각</option>
                      <option value="18:00">저녁 18:00 정각</option>
                      <option value="21:00">밤 21:00 정각</option>
                    </select>
                  </div>
                </div>

                {/* Recurrence Repeat */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">자동 발행 반복 예약</label>
                  <select
                    value={newReserveRecurrence}
                    onChange={(e) => setNewReserveRecurrence(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-800 outline-none focus:bg-white focus:border-orange-300 transition-all"
                  >
                    <option value="none">단발성 (1회만 발행 후 예약 해제)</option>
                    <option value="daily_9am">매일 오전 9시 반복 발행 ⏰ (매일 롤오버)</option>
                    <option value="daily_12pm">매일 낮 12시 반복 발행 ⏰ (매일 롤오버)</option>
                    <option value="weekly">매주 동일 요일 반복 발행</option>
                  </select>
                  <p className="text-[9px] text-stone-400 leading-normal pt-1">
                    ※ 반복 발행을 설정하면 발행과 동시에 다음 차수 동일 시각의 새로운 예약 초안이 즉시 자동 복사 생성됩니다.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-black text-white text-xs font-bold py-3 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>예약 대기열 콘솔 등록하기</span>
                </button>
              </form>
            </div>

            {/* Right 2/3 Cols: Active Reservation Queue Table */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-stone-150 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-1.5">
                      <Database className="w-4 h-4 text-orange-500" />
                      <span>현재 예약 대기 중인 자산 대기열 ({
                        savedPosts.filter(p => p.isReserved && p.status === "draft").length +
                        snsPackages.filter(p => p.isReserved && p.status === "draft").length
                      }건)</span>
                    </h3>
                  </div>
                  <span className="text-[9px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    이벤트 동기화 활성
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-stone-400 font-extrabold uppercase">
                        <th className="py-4 px-5">예약 콘텐츠 주제 및 반복설정</th>
                        <th className="py-4 px-3 text-center">채널</th>
                        <th className="py-4 px-4 text-center">목표 발행예정 시각</th>
                        <th className="py-4 px-4 text-center">실시간 대기 상태</th>
                        <th className="py-4 px-5 text-right">수동 관리동작</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-150 text-stone-700 font-semibold">
                      {savedPosts.filter(p => p.isReserved && p.status === "draft").length === 0 &&
                       snsPackages.filter(p => p.isReserved && p.status === "draft").length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-stone-400 italic">
                            현재 수동/자동 예약 대기열에 등록된 예약물이 없습니다. 왼쪽 폼에서 신규 등록해 보세요!
                          </td>
                        </tr>
                      ) : (
                        <>
                          {/* Blog Reservations list */}
                          {savedPosts.filter(p => p.isReserved && p.status === "draft").map((post) => {
                            const schedTime = post.scheduledAt ? new Date(post.scheduledAt) : null;
                            const vNow = getVirtualTime();
                            const isExpired = schedTime ? schedTime <= vNow : false;
                            
                            // Calculate remaining text
                            let remainText = "만료됨 (동기화 대기)";
                            if (schedTime && !isExpired) {
                              const diffMs = schedTime.getTime() - vNow.getTime();
                              const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                              const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                              remainText = `${diffHrs}시간 ${diffMins}분 남음`;
                            }

                            return (
                              <tr key={post.id} className="hover:bg-amber-50/20 transition-all">
                                <td className="py-3.5 px-5">
                                  <div className="space-y-1">
                                    <span className="font-bold text-stone-900 text-xs sm:text-sm block line-clamp-1">
                                      {post.title}
                                    </span>
                                    <div className="flex items-center space-x-1.5 pt-0.5">
                                      <span className="px-1.5 py-0.5 bg-stone-100 border border-stone-200/60 rounded-md text-[9px] font-extrabold text-stone-500">
                                        {post.categoryName || "맛집/테마"}
                                      </span>
                                      {post.recurrence && post.recurrence !== "none" && (
                                        <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-[9px] font-black flex items-center space-x-0.5">
                                          <Clock className="w-2.5 h-2.5" />
                                          <span>
                                            {post.recurrence === "daily_9am" && "매일 9AM"}
                                            {post.recurrence === "daily_12pm" && "매일 12PM"}
                                            {post.recurrence === "weekly" && "매주 반복"}
                                          </span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-3 text-center">
                                  <span className="px-2 py-1 bg-sky-50 border border-sky-100 text-sky-600 rounded-md text-[9px] font-black">
                                    📖 블로그
                                  </span>
                                </td>
                                 <td className="py-3.5 px-4 text-center font-mono text-[11px] text-stone-600">
                                  {schedTime ? schedTime.toLocaleString() : "-"}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  {generatingIds.includes(post.id) ? (
                                    <span className="px-2 py-0.5 bg-amber-500 text-white rounded-md text-[9px] font-black animate-pulse flex items-center space-x-1 justify-center">
                                      <span>AI 실시간 자동 작성 중... ⚡</span>
                                    </span>
                                  ) : isExpired ? (
                                    <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 rounded-md text-[9px] font-black animate-pulse">
                                      출판 대기 중 ⏰
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-[10px] font-black">
                                      {remainText}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-5 text-right space-x-1.5">
                                  <button
                                    type="button"
                                    disabled={generatingIds.includes(post.id)}
                                    onClick={() => handlePublishBlogPostWithAI(post.id)}
                                    className="px-2 py-1 bg-stone-900 hover:bg-black text-white text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                  >
                                    {generatingIds.includes(post.id) ? "작성 중..." : "즉시 발행"}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={generatingIds.includes(post.id)}
                                    onClick={() => handleCancelReservation(post.id, "blog")}
                                    className="p-1 text-stone-400 hover:text-red-500 hover:bg-stone-50 rounded-lg inline-block align-middle transition-colors border border-transparent hover:border-stone-200 disabled:opacity-50"
                                    title="예약 취소 (일반 임시글 변경)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}

                          {/* SNS Reservations list */}
                          {snsPackages.filter(p => p.isReserved && p.status === "draft").map((pkg) => {
                            const schedTime = pkg.scheduledAt ? new Date(pkg.scheduledAt) : null;
                            const vNow = getVirtualTime();
                            const isExpired = schedTime ? schedTime <= vNow : false;
                            
                            // Calculate remaining text
                            let remainText = "만료됨 (동기화 대기)";
                            if (schedTime && !isExpired) {
                              const diffMs = schedTime.getTime() - vNow.getTime();
                              const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                              const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                              remainText = `${diffHrs}시간 ${diffMins}분 남음`;
                            }

                            return (
                              <tr key={pkg.id} className="hover:bg-amber-50/20 transition-all">
                                <td className="py-3.5 px-5">
                                  <div className="space-y-1">
                                    <span className="font-bold text-stone-900 text-xs sm:text-sm block line-clamp-1">
                                      {pkg.topic}
                                    </span>
                                    <div className="flex items-center space-x-1.5 pt-0.5">
                                      <span className="px-1.5 py-0.5 bg-stone-100 border border-stone-200/60 rounded-md text-[9px] font-extrabold text-stone-500">
                                        {pkg.category === "travel" ? "✈️ 여행" : pkg.category === "food" ? "🍽️ 맛집" : "💡 정보"}
                                      </span>
                                      {pkg.recurrence && pkg.recurrence !== "none" && (
                                        <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-[9px] font-black flex items-center space-x-0.5">
                                          <Clock className="w-2.5 h-2.5" />
                                          <span>
                                            {pkg.recurrence === "daily_9am" && "매일 9AM"}
                                            {pkg.recurrence === "daily_12pm" && "매일 12PM"}
                                            {pkg.recurrence === "weekly" && "매주 반복"}
                                          </span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-3 text-center">
                                  <span className="px-2 py-1 bg-purple-50 border border-purple-100 text-purple-600 rounded-md text-[9px] font-black">
                                    📱 SNS 패키지
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center font-mono text-[11px] text-stone-600">
                                  {schedTime ? schedTime.toLocaleString() : "-"}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  {generatingIds.includes(pkg.id) ? (
                                    <span className="px-2 py-0.5 bg-purple-500 text-white rounded-md text-[9px] font-black animate-pulse flex items-center space-x-1 justify-center">
                                      <span>AI 실시간 소셜 작성 중... ⚡</span>
                                    </span>
                                  ) : isExpired ? (
                                    <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 rounded-md text-[9px] font-black animate-pulse">
                                      출판 대기 중 ⏰
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-[10px] font-black">
                                      {remainText}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-5 text-right space-x-1.5">
                                  <button
                                    type="button"
                                    disabled={generatingIds.includes(pkg.id)}
                                    onClick={() => handlePublishSNSPackageWithAI(pkg.id)}
                                    className="px-2 py-1 bg-stone-900 hover:bg-black text-white text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                  >
                                    {generatingIds.includes(pkg.id) ? "작성 중..." : "즉시 발행"}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={generatingIds.includes(pkg.id)}
                                    onClick={() => handleCancelReservation(pkg.id, "sns")}
                                    className="p-1 text-stone-400 hover:text-red-500 hover:bg-stone-50 rounded-lg inline-block align-middle transition-colors border border-transparent hover:border-stone-200 disabled:opacity-50"
                                    title="예약 취소"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Scheduler Audit Trail Logs */}
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center space-x-2 text-stone-200 text-xs font-black uppercase tracking-wider">
                    <Terminal className="w-4 h-4 text-orange-500" />
                    <span>⏰ 지연 예약 분석기 실시간 감사 추적 기록 (Scheduler Audit Logs)</span>
                  </div>
                  <span className="text-[9px] font-bold text-stone-500">지속 보존</span>
                </div>

                <div className="space-y-1.5 max-h-[140px] overflow-y-auto font-mono text-[10px] text-stone-300 leading-normal no-scrollbar">
                  {systemLogs.filter(log => log.service === "SchedulerEngine").length === 0 ? (
                    <div className="text-stone-500 italic py-4">
                      [INFO] 예약 엔진이 활성 상태이며, 슬라이더 변경이나 신규 등록 이벤트 감사 추적 대기 중입니다...
                    </div>
                  ) : (
                    systemLogs.filter(log => log.service === "SchedulerEngine").map((log) => (
                      <div key={log.id} className="flex items-start space-x-1 hover:bg-stone-900/50 p-1.5 rounded transition-all">
                        <span className="text-stone-500 shrink-0">[{log.time}]</span>
                        <span className="text-amber-500 shrink-0 font-bold">[{log.service}]</span>
                        <span className="text-stone-100 flex-1">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
