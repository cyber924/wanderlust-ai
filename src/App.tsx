import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { BlogGenerator } from "./components/BlogGenerator";
import { ImageGenerator } from "./components/ImageGenerator";
import { BlogPostView } from "./components/BlogPostView";
import { PostList } from "./components/PostList";
import { TemplatePresets } from "./components/TemplatePresets";
import { AuthModal } from "./components/AuthModal";
import { BlogPost, TravelTemplate, UserProfile } from "./types";
import {
  fetchPostsFromFirestore,
  savePostToFirestore,
  deletePostFromFirestore,
  auth,
} from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Compass, Sparkles, FolderHeart, CheckCircle2 } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "generator" | "image-generator" | "templates" | "posts" | "auth"
  >("generator");
  const [categoryType, setCategoryType] = useState<"travel" | "life_info">("travel");
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [savedPosts, setSavedPosts] = useState<BlogPost[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TravelTemplate | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);


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

  // Fetch posts from Firestore / local storage on load
  useEffect(() => {
    async function loadPosts() {
      try {
        const posts = await fetchPostsFromFirestore();
        setSavedPosts(posts);
      } catch (err) {
        console.error("Failed to load posts:", err);
      }
    }
    loadPosts();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBlogGenerated = async (newBlog: BlogPost) => {
    setCurrentPost(newBlog);
    try {
      const savedId = await savePostToFirestore(newBlog);
      const updated = { ...newBlog, id: savedId };
      setCurrentPost(updated);
      setSavedPosts((prev) => [updated, ...prev.filter((p) => p.id !== savedId)]);
      showToast("🎉 제미나이 AI 글 생성 및 보관함(DB) 자동 저장 완료!");
    } catch (err) {
      console.error("Auto save error:", err);
      showToast("🎉 제미나이 AI 여행 블로그 글 생성이 완료되었습니다!");
    }
  };

  const handleSavePost = async (postToSave: BlogPost) => {
    try {
      const savedId = await savePostToFirestore(postToSave);
      const updated = { ...postToSave, id: savedId };
      setCurrentPost(updated);
      setSavedPosts((prev) => [updated, ...prev.filter((p) => p.id !== savedId)]);
      showToast("💾 파이어베이스 DB에 보관되었습니다!");
    } catch (err) {
      console.error(err);
      showToast("저장 중 오류가 발생했습니다.");
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

  const handleSelectTemplate = (template: TravelTemplate) => {
    setSelectedTemplate(template);
    setCurrentPost(null);
    setActiveTab("generator");
    showToast(`'${template.title}' 템플릿이 적용되었습니다.`);
  };

  const handleUseImageForBlog = (destination: string, imageUrl: string) => {
    // Create a temporary travel template with destination and photo
    setSelectedTemplate({
      id: `img_template_${Date.now()}`,
      title: `${destination} 여행기`,
      destination: destination,
      style: "AI 스냅사진 연출 및 감성 맛집 코스",
      icon: "📸",
      description: "AI로 생성한 감성 사진과 함께하는 알찬 포스팅",
      duration: "3박 4일",
      keywords: [destination, "감성사진", "핫플투어", "AI추천코스"],
      tone: "친근하고 감성적인 ~해요체",
    });
    setCurrentPost(null);
    setActiveTab("generator");
    showToast(`📸 '${destination}' 사진이 AI 글 생성기에 적용되었습니다!`);
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
          {activeTab === "generator" && (
            <>
              {currentPost ? (
                <BlogPostView
                  post={currentPost}
                  onSavePost={handleSavePost}
                  onBackToGenerator={() => setCurrentPost(null)}
                  isSaved={savedPosts.some((p) => p.id === currentPost.id)}
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
          )}

          {activeTab === "image-generator" && (
            <ImageGenerator
              onShowToast={showToast}
            />
          )}

          {activeTab === "templates" && (
            <TemplatePresets onSelectTemplate={handleSelectTemplate} />
          )}

          {activeTab === "posts" && (
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
            />
          )}
        </main>
      </div>

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
          <span>Wanderlust AI — 제미나이 & 파이어베이스 여행 블로그 자동화</span>
        </div>
        <p>© 2026 Wanderlust AI. Powered by Gemini 3.6 Flash & Firebase Cloud Firestore.</p>
      </footer>
    </div>
  );
}
