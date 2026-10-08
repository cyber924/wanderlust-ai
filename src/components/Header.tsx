import React from "react";
import {
  Compass,
  Sparkles,
  Camera,
  FolderHeart,
  User,
  Globe2,
  BookOpen,
  Share2,
  Shield,
  TrendingUp,
} from "lucide-react";
import { UserProfile } from "../types";

interface HeaderProps {
  activeTab: "generator" | "image-generator" | "templates" | "posts" | "webzine" | "auth" | "sns" | "admin" | "pre-search" | "scheduling";
  setActiveTab: (tab: "generator" | "image-generator" | "templates" | "posts" | "webzine" | "auth" | "sns" | "admin" | "pre-search" | "scheduling") => void;
  categoryType: "travel" | "life_info";
  setCategoryType: (category: "travel" | "life_info") => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  postsCount: number;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  categoryType,
  setCategoryType,
  user,
  onOpenAuth,
  postsCount,
  isAdmin,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/80 text-stone-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Service Name - Click navigates to Default Webzine */}
          <div
            onClick={() => setActiveTab("webzine")}
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-base shadow-md shadow-orange-500/20 group-hover:bg-orange-600 transition-colors">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg tracking-tight text-stone-900 whitespace-nowrap">
                  Wanderlust AI
                </span>
                <span className="hidden xl:inline-block px-1.5 py-0.5 text-[9px] font-bold tracking-tight text-orange-600 bg-orange-50 border border-orange-200/60 rounded-full whitespace-nowrap">
                  여행 & 생활정보
                </span>
              </div>
              <p className="text-[10px] text-stone-400 hidden lg:block leading-none mt-0.5 whitespace-nowrap">
                AI 협업기반 여행기 & 생활정보
              </p>
            </div>
          </div>

          {/* Navigation Menu - Compact, single line, no badges, single icons */}
          <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
            {/* 🔍 사전조사 */}
            <button
              onClick={() => setActiveTab("pre-search")}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "pre-search"
                  ? "bg-orange-50 text-orange-600 border border-orange-200 font-bold shadow-xs"
                  : "text-stone-700 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
              <span>사전조사</span>
            </button>

            {/* ✈️ 여행 글 생성 */}
            <button
              onClick={() => {
                setCategoryType("travel");
                setActiveTab("generator");
              }}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "generator" && categoryType === "travel"
                  ? "bg-orange-50 text-orange-600 border border-orange-200 font-bold shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <span className="text-sm">✈️</span>
              <span>여행 글 생성</span>
            </button>

            {/* 💡 생활정보 글 생성 */}
            <button
              onClick={() => {
                setCategoryType("life_info");
                setActiveTab("generator");
              }}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "generator" && categoryType === "life_info"
                  ? "bg-amber-50 text-amber-700 border border-amber-300 font-bold shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <span className="text-sm">💡</span>
              <span>생활정보</span>
            </button>

            {/* ⏰ 예약 발행 */}
            <button
              onClick={() => setActiveTab("scheduling")}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "scheduling"
                  ? "bg-amber-50 text-amber-700 border border-amber-300 font-bold shadow-xs animate-pulse"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <span className="text-sm">⏰</span>
              <span>예약 발행</span>
            </button>

            {/* 📸 AI 이미지 생성 */}
            <button
              onClick={() => setActiveTab("image-generator")}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "image-generator"
                  ? "bg-orange-50 text-orange-600 border border-orange-200 font-bold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-orange-500" />
              <span>AI 이미지</span>
            </button>

            {/* 📖 웹진 (Magazine & Hub) - Removed HOT badge and duplicate emoji */}
            <button
              onClick={() => setActiveTab("webzine")}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "webzine"
                  ? "bg-stone-900 text-white font-bold shadow-sm"
                  : "text-stone-700 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <BookOpen className={`w-3.5 h-3.5 ${activeTab === "webzine" ? "text-orange-400" : "text-stone-600"}`} />
              <span>웹진</span>
            </button>

            {/* 📱 SNS (All-in-One SNS Studio) - Removed NEW badge and duplicate emoji */}
            <button
              onClick={() => setActiveTab("sns")}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "sns"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-sm"
                  : "text-stone-700 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Share2 className={`w-3.5 h-3.5 ${activeTab === "sns" ? "text-white" : "text-orange-500"}`} />
              <span>SNS</span>
            </button>

            {/* 🌐 템플릿 */}
            <button
              onClick={() => setActiveTab("templates")}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "templates"
                  ? "bg-orange-50 text-orange-600 border border-orange-200 font-bold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-amber-500" />
              <span>템플릿</span>
            </button>

            {/* 📂 보관함 */}
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "posts"
                  ? "bg-orange-50 text-orange-600 border border-orange-200 font-bold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <FolderHeart className="w-3.5 h-3.5 text-rose-500" />
              <span>보관함</span>
              {postsCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-extrabold bg-orange-500 text-white rounded-full leading-none">
                  {postsCount}
                </span>
              )}
            </button>

            {/* 🛡️ 관리자 */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === "admin"
                    ? "bg-amber-50 text-amber-700 border border-amber-300 font-bold"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>관리자</span>
              </button>
            )}
          </nav>

          {/* User Profile / Firebase Auth */}
          <div className="flex items-center space-x-2 shrink-0">
            {user ? (
              <div
                onClick={onOpenAuth}
                className="flex items-center space-x-2 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 px-2.5 py-1 rounded-xl cursor-pointer transition-all"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-6 h-6 rounded-full border border-orange-400 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">
                    {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-stone-800 leading-tight">
                    {user.displayName || "회원님"}
                  </p>
                  <p className="text-[9px] text-orange-600 leading-none font-medium">DB 연결중</p>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5" />
                <span>로그인 / 계정</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
