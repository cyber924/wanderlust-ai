import React from "react";
import {
  Compass,
  Sparkles,
  Camera,
  FolderHeart,
  User,
  Globe2,
} from "lucide-react";
import { UserProfile } from "../types";

interface HeaderProps {
  activeTab: "generator" | "image-generator" | "templates" | "posts" | "auth";
  setActiveTab: (tab: "generator" | "image-generator" | "templates" | "posts" | "auth") => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  postsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  postsCount,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/80 text-stone-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Service Name */}
          <div
            onClick={() => setActiveTab("generator")}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-orange-500/20 group-hover:bg-orange-600 transition-colors">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-stone-900">
                  Wanderlust AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-orange-600 bg-orange-50 border border-orange-200/60 rounded-full">
                  여행 스튜디오
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                제미나이 AI 기반 여행 글 & 감성 사진 자동 생성
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={() => setActiveTab("generator")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === "generator"
                  ? "bg-orange-50 text-orange-600 border border-orange-200 font-bold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>AI 글 생성</span>
            </button>

            <button
              onClick={() => setActiveTab("image-generator")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === "image-generator"
                  ? "bg-orange-50 text-orange-600 border border-orange-200 font-bold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Camera className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-stone-900">AI 이미지 생성</span>
              <span className="bg-orange-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                NEW
              </span>
            </button>

            <button
              onClick={() => setActiveTab("templates")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === "templates"
                  ? "bg-orange-50 text-orange-600 border border-orange-200 font-bold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Globe2 className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">인기 템플릿</span>
              <span className="sm:hidden">템플릿</span>
            </button>

            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all relative ${
                activeTab === "posts"
                  ? "bg-orange-50 text-orange-600 border border-orange-200 font-bold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <FolderHeart className="w-4 h-4 text-rose-500" />
              <span>보관함 (내 DB)</span>
              {postsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold bg-orange-500 text-white rounded-full">
                  {postsCount}
                </span>
              )}
            </button>
          </nav>

          {/* User Profile / Firebase Auth */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div
                onClick={onOpenAuth}
                className="flex items-center space-x-2 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-7 h-7 rounded-full border border-orange-400 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">
                    {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-stone-800 leading-tight">
                    {user.displayName || "회원님"}
                  </p>
                  <p className="text-[10px] text-orange-600 leading-none">Firebase 연결됨</p>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-orange-500/10 transition-all active:scale-[0.98]"
              >
                <User className="w-4 h-4" />
                <span>파이어베이스 로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
