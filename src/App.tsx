import React, { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { PreInvestigation } from "./components/PreInvestigation";
import { BlogGenerator } from "./components/BlogGenerator";
import { ImageGenerator } from "./components/ImageGenerator";
import { BlogPostView } from "./components/BlogPostView";
import { PostList } from "./components/PostList";
import { TemplatePresets } from "./components/TemplatePresets";
import { AuthModal } from "./components/AuthModal";
import { WebzineView } from "./components/WebzineView";
import { WebzineDetailView } from "./components/WebzineDetailView";
import { EmbedShareModal } from "./components/EmbedShareModal";
import { LoginRequiredView } from "./components/LoginRequiredView";
import { SNSStudio } from "./components/SNSStudio";
import { AdminMenu } from "./components/AdminMenu";
import { WEBZINE_SAMPLE_ARTICLES } from "./data/webzineSampleArticles";
import { BlogPost, GeneratedImage, TravelTemplate, UserProfile } from "./types";
import {
  fetchPostsFromFirestore,
  savePostToFirestore,
  deletePostFromFirestore,
  fetchImagesFromFirestore,
  saveImageToFirestore,
  deleteImageFromFirestore,
  clearAllImagesFromFirestore,
  linkImageToBlogInFirestore,
  getLocalPosts,
  getLocalImages,
  auth,
} from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Compass, Sparkles, FolderHeart, CheckCircle2 } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "generator" | "image-generator" | "templates" | "posts" | "webzine" | "auth" | "sns" | "admin" | "pre-search"
  >("pre-search");
  const [categoryType, setCategoryType] = useState<
    "travel" | "life_info" | "food" | "trend"
  >("travel");
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [savedPosts, setSavedPosts] = useState<BlogPost[]>([]);
  const [galleryImages, setGalleryImages] = useState<GeneratedImage[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TravelTemplate | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Admin Simulation State
  const [isSimulatedAdmin, setIsSimulatedAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem("wanderlust_simulate_admin") === "true";
    } catch {
      return false;
    }
  });

  // Sync simulation to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("wanderlust_simulate_admin", String(isSimulatedAdmin));
    } catch (e) {
      console.error(e);
    }
  }, [isSimulatedAdmin]);

  const isAdmin = user?.email === "cyber924@naver.com" || isSimulatedAdmin;

  // Webzine Derived State - Dynamically merges Firestore user posts & static sample articles
  const webzineArticles = useMemo(() => {
    const userPublicPosts = savedPosts
      .filter(
        (p) =>
          p.isPublic === true ||
          p.status === "published" ||
          (p.isPublic !== false && p.status !== "draft")
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const seenIds = new Set(userPublicPosts.map((p) => p.id));
    const extraSamples = WEBZINE_SAMPLE_ARTICLES.filter((s) => !seenIds.has(s.id));

    return [...userPublicPosts, ...extraSamples];
  }, [savedPosts]);

  const [selectedWebzineArticle, setSelectedWebzineArticle] = useState<BlogPost | null>(null);
  const [embedModalPost, setEmbedModalPost] = useState<BlogPost | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("wanderlust_liked_posts");
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });
  const [scrappedPostIds, setScrappedPostIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("wanderlust_scrapped_posts");
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch posts and gallery images from Firestore / local storage on load
  useEffect(() => {
    async function loadData() {
      // 1. Instant Cache-First: populate immediately so user never sees an empty screen
      const cachedPosts = getLocalPosts();
      const cachedImages = getLocalImages();
      if (cachedPosts.length > 0) {
        setSavedPosts(cachedPosts);
      }
      if (cachedImages.length > 0) {
        setGalleryImages(cachedImages);
      }

      // 2. Automatic one-time background migration to user's new Firebase DB
      const migrationCompleted = localStorage.getItem("wanderlust_migration_completed_v2");
      if (!migrationCompleted) {
        try {
          const { runDatabaseMigration } = await import("./lib/migration");
          const res = await runDatabaseMigration();
          if (res.success && res.postsMigrated > 0) {
            setToastMessage(`🎉 신규 전용 DB로 ${res.postsMigrated}편의 글이 안전하게 마이그레이션되었습니다!`);
            setTimeout(() => setToastMessage(null), 4000);
          }
        } catch (mErr) {
          console.warn("Auto-migration notice:", mErr);
        }
      }

      // 3. Fetch latest data from the new Firestore project
      try {
        const [posts, images] = await Promise.all([
          fetchPostsFromFirestore(),
          fetchImagesFromFirestore(),
        ]);
        if (posts && posts.length > 0) {
          setSavedPosts(posts);
        }
        if (images && images.length > 0) {
          setGalleryImages(images);
        }
      } catch (err) {
        console.error("Failed to load initial data from new DB:", err);
      } finally {
        setIsDataLoaded(true);
      }
    }
    loadData();
  }, []);

  // Calculate if the current URL points to a non-existent blog post (yielding a 404)
  const isUrl404 = useMemo(() => {
    if (typeof window !== "undefined" && (window as any).__INITIAL_ERROR__ === "NOT_FOUND") {
      return true;
    }

    const pathname = window.location.pathname;
    const hash = window.location.hash;
    let targetId = "";

    if (pathname.startsWith("/blog/")) {
      targetId = pathname.replace("/blog/", "");
    } else if (hash.startsWith("#/blog/")) {
      targetId = hash.replace("#/blog/", "");
    } else if (hash.startsWith("#webzine-")) {
      targetId = hash.replace("#webzine-", "");
    }

    if (!targetId || targetId === "new" || targetId === "edit" || targetId === "admin") return false;

    // Check if the post ID exists
    const matched = webzineArticles.some((a) => a.id === targetId);

    // If Firestore has loaded and the ID is not found, it is a 404!
    if (isDataLoaded && !matched) {
      return true;
    }

    return false;
  }, [webzineArticles, isDataLoaded]);

  // Deep linking: supports both path-based '/blog/[id]' and hash-based '#/blog/[id]' / '#webzine-[id]'
  useEffect(() => {
    const handleUrlChange = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      
      let targetId = "";
      if (pathname.startsWith("/blog/")) {
        targetId = pathname.replace("/blog/", "");
      } else if (hash.startsWith("#/blog/")) {
        targetId = hash.replace("#/blog/", "");
      } else if (hash.startsWith("#webzine-")) {
        targetId = hash.replace("#webzine-", "");
      }

      if (targetId) {
        const matched = webzineArticles.find((a) => a.id === targetId);
        if (matched) {
          setSelectedWebzineArticle(matched);
          setActiveTab("webzine");
          return;
        }
      }

      if (
        hash === "#/blog" || 
        hash === "#/webzine" || 
        pathname === "/blog" || 
        pathname === "/webzine" || 
        (hash === "" && (pathname === "/" || pathname === ""))
      ) {
        setSelectedWebzineArticle(null);
      }
    };

    handleUrlChange();
    window.addEventListener("hashchange", handleUrlChange);
    window.addEventListener("popstate", handleUrlChange);
    return () => {
      window.removeEventListener("hashchange", handleUrlChange);
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, [webzineArticles]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Webzine Like Toggle
  const handleLikeWebzineArticle = (postId: string) => {
    setLikedPostIds((prev) => {
      const next = new Set(prev);
      const isCurrentlyLiked = next.has(postId);
      if (isCurrentlyLiked) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      try {
        localStorage.setItem("wanderlust_liked_posts", JSON.stringify(Array.from(next)));
      } catch (e) {}

      // Propagate the updated likes directly into savedPosts state
      setSavedPosts((prev) =>
        prev.map((art) => {
          if (art.id !== postId) return art;
          return {
            ...art,
            likes: Math.max(0, (art.likes || 0) + (isCurrentlyLiked ? -1 : 1)),
          };
        })
      );

      if (selectedWebzineArticle && selectedWebzineArticle.id === postId) {
        setSelectedWebzineArticle((cur) =>
          cur
            ? {
                ...cur,
                likes: Math.max(0, (cur.likes || 0) + (isCurrentlyLiked ? -1 : 1)),
              }
            : null
        );
      }

      showToast(isCurrentlyLiked ? "💔 좋아요를 취소했습니다." : "❤️ 웹진 글에 좋아요를 눌렀습니다!");
      return next;
    });
  };

  // Webzine Scrap to My Storage
  const handleScrapWebzineArticle = async (post: BlogPost) => {
    setScrappedPostIds((prev) => {
      const next = new Set(prev);
      const isAlreadyScrapped = next.has(post.id);
      if (isAlreadyScrapped) {
        next.delete(post.id);
        showToast("보관함 스크랩이 해제되었습니다.");
      } else {
        next.add(post.id);
        showToast("🔖 내 보관함(DB)에 스크랩되었습니다! 언제든 보관함 탭에서 확인하세요.");
        // Add to saved posts
        if (!savedPosts.some((p) => p.id === post.id)) {
          setSavedPosts((current) => [post, ...current]);
          savePostToFirestore(post).catch((e) => console.log("Silent Firestore save:", e));
        }
      }
      try {
        localStorage.setItem("wanderlust_scrapped_posts", JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  };

  // Use Webzine Course as Generation Template
  const handleUseWebzineAsTemplate = (post: BlogPost) => {
    setSelectedWebzineArticle(null);
    setSelectedTemplate({
      id: `webzine_template_${post.id}`,
      title: `${post.destination} ${post.concept}`,
      categoryType: post.categoryType || "travel",
      destination: post.destination,
      style: post.concept,
      icon: "✨",
      description: post.subtitle,
      duration: post.duration,
      keywords: post.hashtags || [post.destination, "여행코스"],
      tone: post.tone || "친근하고 감성적인 인스타그램 어조",
    });
    setCurrentPost(null);
    setActiveTab("generator");
    showToast(`✨ '${post.title}' 코스를 기반으로 나만의 글 생성을 시작합니다!`);
  };

  const handleBlogGenerated = async (newBlog: BlogPost) => {
    // Ensure newly generated post is explicitly public and published
    const blogToPublish: BlogPost = {
      ...newBlog,
      isPublic: true,
      status: "published",
    };
    setCurrentPost(blogToPublish);

    try {
      const savedId = await savePostToFirestore(blogToPublish);
      const updated = { ...blogToPublish, id: savedId };
      setCurrentPost(updated);
      setSavedPosts((prev) => [updated, ...prev.filter((p) => p.id !== savedId)]);
      showToast("🎉 블로그 글이 생성되어 웹진에 즉시 공개되었습니다!");
    } catch (err) {
      console.error("Auto save error:", err);
      showToast("🎉 블로그 글이 생성되어 웹진에 공개되었습니다!");
    }
  };

  const handleSavePost = async (postToSave: BlogPost) => {
    try {
      const isPublic = postToSave.isPublic !== false && postToSave.status === "published";
      const savedId = await savePostToFirestore(postToSave);
      const updated = { ...postToSave, id: savedId };
      setCurrentPost(updated);
      setSavedPosts((prev) => [updated, ...prev.filter((p) => p.id !== savedId)]);

      showToast("💾 파이어베이스 DB 및 웹진에 저장되었습니다!");
    } catch (err) {
      console.error(err);
      showToast("저장 중 오류가 발생했습니다.");
    }
  };

  // Toggle Webzine Publish / Draft Status
  const handleTogglePublishPost = async (postId: string) => {
    const target = savedPosts.find((p) => p.id === postId);
    if (!target) return;

    const nextPublished = !(target.isPublic || target.status === "published");
    const updatedPost: BlogPost = {
      ...target,
      isPublic: nextPublished,
      status: nextPublished ? "published" : "draft",
    };

    // Update savedPosts state
    setSavedPosts((prev) =>
      prev.map((p) => (p.id === postId ? updatedPost : p))
    );

    if (currentPost && currentPost.id === postId) {
      setCurrentPost(updatedPost);
    }

    try {
      await savePostToFirestore(updatedPost);
      if (nextPublished) {
        showToast("🎉 웹진에 공개 발행되었습니다! [웹진] 탭 최상단에서 확인 가능합니다.");
      } else {
        showToast("🔒 웹진 발행이 취소되어 나만의 보관함 전용으로 전환되었습니다.");
      }
    } catch (err) {
      console.error("Failed to update post in Firestore:", err);
      showToast(nextPublished ? "웹진에 발행되었습니다." : "발행이 취소되었습니다.");
    }
  };

  const handleEditPost = async (updatedPost: BlogPost) => {
    try {
      await savePostToFirestore(updatedPost);
      setSavedPosts((prev) =>
        prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
      );
      if (currentPost && currentPost.id === updatedPost.id) {
        setCurrentPost(updatedPost);
      }
      showToast("✏️ 블로그 포스트가 성공적으로 수정되었습니다.");
    } catch (err) {
      console.error(err);
      showToast("수정 중 오류가 발생했습니다.");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePostFromFirestore(postId);
      setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
      if (currentPost && currentPost.id === postId) {
        setCurrentPost(null);
      }
      showToast("🗑️ 블로그 글이 보관함(DB)에서 삭제되었습니다.");
    } catch (err) {
      console.error(err);
    }
  };

  // Image Gallery Handlers
  const handleSaveImageToGallery = async (image: GeneratedImage) => {
    try {
      const savedId = await saveImageToFirestore(image);
      const fullImg = { ...image, id: savedId };
      setGalleryImages((prev) => [fullImg, ...prev.filter((i) => i.id !== savedId)]);
    } catch (err) {
      console.error("Error saving image to gallery:", err);
    }
  };

  const handleDeleteImageFromGallery = async (imageId: string) => {
    try {
      await deleteImageFromFirestore(imageId);
      setGalleryImages((prev) => prev.filter((i) => i.id !== imageId));
      showToast("🗑️ 사진이 보관함(DB)에서 삭제되었습니다.");
    } catch (err) {
      console.error("Error deleting image from gallery:", err);
      showToast("사진 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleClearAllImagesFromGallery = async () => {
    try {
      await clearAllImagesFromFirestore();
      setGalleryImages([]);
      showToast("🗑️ 보관함의 모든 사진이 삭제되었습니다.");
    } catch (err) {
      console.error("Error clearing images from gallery:", err);
      showToast("전체 삭제 중 오류가 발생했습니다.");
    }
  };

  // Set Image as Blog Cover
  const handleSetImageAsCover = async (post: BlogPost, image: GeneratedImage) => {
    try {
      const updatedPost: BlogPost = {
        ...post,
        coverImageUrl: image.imageUrl,
      };

      await savePostToFirestore(updatedPost);
      await linkImageToBlogInFirestore(image.id, post.id, post.title, true);

      // Update state
      setSavedPosts((prev) =>
        prev.map((p) => (p.id === post.id ? updatedPost : p))
      );
      if (currentPost && currentPost.id === post.id) {
        setCurrentPost(updatedPost);
      }
      setGalleryImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? { ...img, linkedBlogId: post.id, linkedBlogTitle: post.title, isCover: true }
            : img
        )
      );

      showToast(`🌟 '${post.title}'의 대표 커버 사진으로 지정되었습니다!`);
    } catch (err) {
      console.error(err);
      showToast("커버 사진 지정 중 오류가 발생했습니다.");
    }
  };

  // Insert Image into Blog Content
  const handleInsertImageIntoContent = async (
    post: BlogPost,
    image: GeneratedImage,
    position: "top" | "bottom"
  ) => {
    try {
      const imageMarkdown = `\n\n![${image.destination}](${image.imageUrl})\n*<p align="center" style="color:gray; font-size:12px;">▲ AI가 생성한 ${image.destination} 현장 스냅사진</p>*\n\n`;

      let newMarkdown = post.markdownContent;
      if (position === "top") {
        // Insert after first line or intro
        newMarkdown = imageMarkdown + post.markdownContent;
      } else {
        newMarkdown = post.markdownContent + imageMarkdown;
      }

      const updatedPost: BlogPost = {
        ...post,
        markdownContent: newMarkdown,
      };

      await savePostToFirestore(updatedPost);
      await linkImageToBlogInFirestore(image.id, post.id, post.title, false);

      // Update state
      setSavedPosts((prev) =>
        prev.map((p) => (p.id === post.id ? updatedPost : p))
      );
      if (currentPost && currentPost.id === post.id) {
        setCurrentPost(updatedPost);
      }
      setGalleryImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? { ...img, linkedBlogId: post.id, linkedBlogTitle: post.title, isCover: false }
            : img
        )
      );

      showToast(`📝 '${post.title}' 본문에 사진이 성공적으로 삽입되었습니다!`);
    } catch (err) {
      console.error(err);
      showToast("본문 삽입 중 오류가 발생했습니다.");
    }
  };

  const handleSetImageAsSpot = async (
    post: BlogPost,
    image: GeneratedImage,
    dayIdx: number,
    spotIdx: number
  ) => {
    try {
      const updatedItinerary = post.itinerary.map((d, dI) => {
        if (dI !== dayIdx) return d;
        return {
          ...d,
          activities: d.activities.map((act, aI) => {
            if (aI !== spotIdx) return act;
            return {
              ...act,
              imageUrl: image.imageUrl,
            };
          }),
        };
      });

      const spotName = post.itinerary[dayIdx]?.activities[spotIdx]?.spot || "일정 스팟";
      const imageMarkdown = `\n\n![${spotName}](${image.imageUrl})\n*<p align="center" style="color:gray; font-size:12px;">▲ ${spotName} 현장 스냅사진</p>*\n\n`;
      const updatedMarkdown = post.markdownContent + imageMarkdown;

      const updatedPost: BlogPost = {
        ...post,
        itinerary: updatedItinerary,
        markdownContent: updatedMarkdown,
      };

      await savePostToFirestore(updatedPost);
      await linkImageToBlogInFirestore(image.id, post.id, `${post.title} (${spotName})`, false);

      setSavedPosts((prev) =>
        prev.map((p) => (p.id === post.id ? updatedPost : p))
      );
      if (currentPost && currentPost.id === post.id) {
        setCurrentPost(updatedPost);
      }
      setGalleryImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? { ...img, linkedBlogId: post.id, linkedBlogTitle: `${post.title} (${spotName})`, isCover: false }
            : img
        )
      );

      showToast(`📍 '${spotName}' 일정에 사진이 매핑되었습니다!`);
    } catch (err) {
      console.error(err);
      showToast("일정 사진 매핑 중 오류가 발생했습니다.");
    }
  };

  const handleSelectTemplate = (template: TravelTemplate) => {
    setSelectedTemplate(template);
    if (template.categoryType) {
      setCategoryType(template.categoryType as any);
    }
    setCurrentPost(null);
    setActiveTab("generator");
    showToast(`'${template.title}' 템플릿이 적용되었습니다.`);
  };

  const handleCreateNewPostWithImage = (image: GeneratedImage) => {
    setSelectedTemplate({
      id: `img_template_${Date.now()}`,
      title: `${image.destination} 여행기`,
      destination: image.destination,
      style: `${image.style} 스냅사진 연출 및 감성 맛집 투어`,
      icon: "📸",
      description: `AI로 생성한 ${image.style} 분위기의 사진과 함께하는 알찬 포스팅`,
      duration: "3박 4일",
      keywords: [image.destination, image.style, "감성사진", "AI추천코스"],
      tone: "친근하고 감성적인 ~해요체",
    });
    setCurrentPost(null);
    setActiveTab("generator");
    showToast(`📸 '${image.destination}' 사진으로 새 블로그 글 작성이 시작되었습니다!`);
  };

  const handleSelectTopicFromPreInvestigation = (topic: {
    title: string;
    keywords: string[];
    categoryType: "travel" | "life_info" | "food" | "trend";
    travelStyle: string;
    duration: string;
  }) => {
    const tempTemplate: TravelTemplate = {
      id: `pre_investigation_${Date.now()}`,
      title: topic.title,
      destination: topic.title,
      style: topic.travelStyle,
      icon: topic.categoryType === "travel" ? "🏖️" : "💡",
      description: "사전조사 최적화 주제 기반의 맞춤 포스팅 레이아웃",
      duration: topic.duration,
      keywords: topic.keywords,
      tone: "🔥 네이버 스마트블록 & DIA+ 상위노출 최적화체 (키워드/경험 중심)",
    };
    setSelectedTemplate(tempTemplate);
    setCategoryType(topic.categoryType as any);
    setCurrentPost(null);
    setActiveTab("generator");
    showToast(`📝 사전조사 주제 '${topic.title}'가 글 생성기에 적용되었습니다.`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-stone-900 font-sans selection:bg-orange-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* Top Header Navigation Menu */}
        <Header
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === "generator") {
              setCurrentPost(null);
            }
          }}
          categoryType={categoryType}
          setCategoryType={(cat) => {
            setCategoryType(cat);
            setCurrentPost(null);
          }}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          postsCount={savedPosts.length}
          isAdmin={isAdmin}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-stone-900/20 text-sm font-semibold flex items-center space-x-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isUrl404 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-6">
                <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <h1 className="text-3xl font-black text-stone-900 mb-4">요청한 글을 찾을 수 없습니다.</h1>
              <p className="text-stone-500 max-w-md mb-8">
                존재하지 않거나, 삭제되었거나, 비공개 처리된 게시글입니다. 주소를 다시 확인해 주세요.
              </p>
              <button
                onClick={() => {
                  window.history.pushState(null, "", "/");
                  window.dispatchEvent(new Event("popstate"));
                  setActiveTab("webzine");
                }}
                className="px-6 py-3 bg-stone-950 text-white font-bold rounded-2xl hover:bg-stone-800 transition shadow-lg shadow-stone-950/10"
              >
                웹진 홈으로 돌아가기
              </button>
            </div>
          ) : (
            <>
              {activeTab === "pre-search" && (
                <PreInvestigation
                  onSelectTopic={handleSelectTopicFromPreInvestigation}
                  onShowToast={showToast}
                />
              )}

              {activeTab === "generator" && (
                !user ? (
                  <LoginRequiredView
                    tabType="generator"
                    categoryType={categoryType}
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                    onGoToWebzine={() => setActiveTab("webzine")}
                  />
                ) : (
                  <>
                    {currentPost ? (
                      <BlogPostView
                        post={currentPost}
                        onSavePost={handleSavePost}
                        onBackToGenerator={() => setCurrentPost(null)}
                        isSaved={savedPosts.some((p) => p.id === currentPost.id)}
                        galleryImages={galleryImages}
                        onNavigateToImageGenerator={() => setActiveTab("image-generator")}
                        onNavigateToWebzine={() => setActiveTab("webzine")}
                        onShowToast={showToast}
                      />
                    ) : (
                      <BlogGenerator
                        onBlogGenerated={handleBlogGenerated}
                        selectedTemplate={selectedTemplate}
                        onClearTemplate={() => setSelectedTemplate(null)}
                        categoryType={categoryType}
                        onCategoryTypeChange={setCategoryType}
                      />
                    )}
                  </>
                )
              )}

              {activeTab === "image-generator" && (
                !user ? (
                  <LoginRequiredView
                    tabType="image-generator"
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                    onGoToWebzine={() => setActiveTab("webzine")}
                  />
                ) : (
                  <ImageGenerator
                    savedPosts={savedPosts}
                    galleryImages={galleryImages}
                    onSaveImageToGallery={handleSaveImageToGallery}
                    onDeleteImageFromGallery={handleDeleteImageFromGallery}
                    onClearAllImagesFromGallery={handleClearAllImagesFromGallery}
                    onSetImageAsCover={handleSetImageAsCover}
                    onSetImageAsSpot={handleSetImageAsSpot}
                    onInsertImageIntoContent={handleInsertImageIntoContent}
                    onCreateNewPostWithImage={handleCreateNewPostWithImage}
                    onShowToast={showToast}
                  />
                )
              )}

              {activeTab === "templates" && (
                <TemplatePresets onSelectTemplate={handleSelectTemplate} />
              )}

              {activeTab === "webzine" && (
                selectedWebzineArticle ? (
                  <WebzineDetailView
                    post={selectedWebzineArticle}
                    onBack={() => {
                      window.history.pushState(null, "", "/blog");
                      window.dispatchEvent(new Event("popstate"));
                    }}
                    onLike={() => handleLikeWebzineArticle(selectedWebzineArticle.id)}
                    onScrap={() => handleScrapWebzineArticle(selectedWebzineArticle)}
                    onOpenEmbedModal={(post) => setEmbedModalPost(post)}
                    onUseAsTemplate={handleUseWebzineAsTemplate}
                    isLiked={likedPostIds.has(selectedWebzineArticle.id)}
                    isScrapped={scrappedPostIds.has(selectedWebzineArticle.id)}
                  />
                ) : (
                  <WebzineView
                    articles={webzineArticles}
                    onOpenArticle={(post) => {
                      window.history.pushState(null, "", `/blog/${post.id}`);
                      window.dispatchEvent(new Event("popstate"));
                    }}
                    onOpenEmbedModal={(post) => setEmbedModalPost(post)}
                    onLikeArticle={handleLikeWebzineArticle}
                    onScrapArticle={handleScrapWebzineArticle}
                    onNavigateToGenerator={() => {
                      setCurrentPost(null);
                      setActiveTab("generator");
                    }}
                    onSelectTemplateFromArticle={handleUseWebzineAsTemplate}
                    likedPostIds={likedPostIds}
                    scrappedPostIds={scrappedPostIds}
                  />
                )
              )}

              {activeTab === "sns" && (
                <SNSStudio
                  savedPosts={savedPosts}
                  onOpenBlogView={(post) => {
                    setCurrentPost(post);
                    setActiveTab("generator");
                  }}
                />
              )}

              {activeTab === "posts" && (
                !user ? (
                  <LoginRequiredView
                    tabType="posts"
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                    onGoToWebzine={() => setActiveTab("webzine")}
                  />
                ) : (
                  <PostList
                    posts={savedPosts}
                    onSelectPost={(post) => {
                      setCurrentPost(post);
                      setActiveTab("generator");
                    }}
                    onEditPost={handleEditPost}
                    onDeletePost={handleDeletePost}
                    onCreateNew={() => {
                      setCurrentPost(null);
                      setActiveTab("generator");
                    }}
                    onTogglePublish={handleTogglePublishPost}
                    onShowToast={showToast}
                    onNavigateToSNSArchive={() => setActiveTab("sns")}
                  />
                )
              )}

              {activeTab === "admin" && (
                <AdminMenu
                  user={user}
                  savedPosts={savedPosts}
                  setSavedPosts={setSavedPosts}
                  webzineArticles={webzineArticles}
                  setWebzineArticles={(action) => {
                    if (typeof action === 'function') {
                      const updated = action(webzineArticles);
                      setSavedPosts((prev) =>
                        prev.map((p) => {
                          const match = updated.find((u) => u.id === p.id);
                          return match ? match : p;
                        })
                      );
                    } else {
                      setSavedPosts((prev) =>
                        prev.map((p) => {
                          const match = action.find((u) => u.id === p.id);
                          return match ? match : p;
                        })
                      );
                    }
                  }}
                  onShowToast={showToast}
                  onSelectPost={(post) => {
                    setCurrentPost(post);
                    setActiveTab("generator");
                  }}
                  isSimulatedAdmin={isSimulatedAdmin}
                  setIsSimulatedAdmin={setIsSimulatedAdmin}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Webzine editorial full page modal fallback helper - removed in favor of direct full page WebzineDetailView routing */}

      {/* Blog Embed & Viral Backlink Modal */}
      <EmbedShareModal
        isOpen={Boolean(embedModalPost)}
        onClose={() => setEmbedModalPost(null)}
        post={embedModalPost}
        onShowToast={showToast}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        setUser={setUser}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-8 text-center text-xs text-stone-500 space-y-2">
        <div className="flex items-center justify-center space-x-2 text-stone-700 font-semibold">
          <Compass className="w-4 h-4 text-orange-500" />
          <span>파운드 여행 블로그</span>
        </div>
        <p>© 2026 Wanderlust AI. Powered by Pound CO.</p>
      </footer>
    </div>
  );
}
