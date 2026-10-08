import React, { useState } from "react";
import {
  Search,
  Trash2,
  Edit3,
  Eye,
  Calendar,
  MapPin,
  Tag,
  Copy,
  Check,
  FolderHeart,
  Sparkles,
  Database,
  Plus,
  Share2,
  Globe2,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  Info,
  AlertTriangle,
} from "lucide-react";
import { BlogPost } from "../types";
import { getSafeUnsplashCoverUrl } from "../utils/imageHelper";
import { EditPostModal } from "./EditPostModal";
import { EmbedShareModal } from "./EmbedShareModal";
import { firebaseConfig, auth } from "../lib/firebase";

interface PostListProps {
  posts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
  onEditPost: (updatedPost: BlogPost) => Promise<void>;
  onDeletePost: (postId: string) => void;
  onCreateNew: () => void;
  onTogglePublish?: (postId: string) => void;
  onShowToast?: (msg: string) => void;
  onNavigateToSNSArchive?: () => void;
  onRefreshDB?: () => Promise<void>;
  dbStatus?: "connecting" | "success" | "offline" | "error";
  dbErrorMessage?: string | null;
}

export const PostList: React.FC<PostListProps> = ({
  posts,
  onSelectPost,
  onEditPost,
  onDeletePost,
  onCreateNew,
  onTogglePublish,
  onShowToast = (_msg: string) => {},
  onNavigateToSNSArchive,
  onRefreshDB,
  dbStatus = "success",
  dbErrorMessage = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [embedPost, setEmbedPost] = useState<BlogPost | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.hashtags.some((h) => h.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSync = async () => {
    if (!onRefreshDB) return;
    setIsSyncing(true);
    onShowToast("🔄 실시간 최신 DB 조회 중... 잠시만 기다려 주세요.");
    try {
      await onRefreshDB();
      onShowToast("✨ 최신 데이터베이스(Firestore)로부터 성공적으로 실시간 조회를 완료했습니다!");
    } catch (err) {
      console.error("DB Sync error:", err);
      onShowToast("❌ 실시간 조회 중 오류가 발생했습니다. DB 권한 및 연결 상태를 확인해 주세요.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyMarkdown = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(post.markdownContent);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEdit = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPost(post);
  };

  const handleConfirmDelete = () => {
    if (postToDelete) {
      onDeletePost(postToDelete.id);
      setPostToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-stone-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-stone-200/40">
        <div className="space-y-1">
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-orange-500" />
              <h1 className="text-2xl font-extrabold text-stone-900">콘텐츠 보관함</h1>
            </div>
            {/* 실시간 DB 연결 상태 배지 (Requirement 3 보강) */}
            {dbStatus === "connecting" && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                <RefreshCw className="w-2.5 h-3 animate-spin" />
                <span>실시간 연결 중...</span>
              </span>
            )}
            {dbStatus === "success" && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                <span>실시간 동기화 완료</span>
              </span>
            )}
            {dbStatus === "offline" && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                <span>🟡 오프라인 캐시 모드</span>
              </span>
            )}
            {dbStatus === "error" && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200" title={dbErrorMessage || "연결 오류가 발생했습니다."}>
                <span>🔴 DB 연결 실패</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500">
            내 DB에 저장된 전체 블로그 글과 맞춤 SNS 패키지를 관리할 수 있습니다.
          </p>
          {onNavigateToSNSArchive && (
            <div className="pt-2 flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-stone-900 text-white flex items-center space-x-1.5">
                <span>📝 블로그 포스트</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-orange-500 text-white">
                  {posts.length}
                </span>
              </span>
              <button
                type="button"
                onClick={onNavigateToSNSArchive}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-orange-50 hover:text-orange-600 text-stone-700 transition-colors flex items-center space-x-1.5 border border-stone-200"
              >
                <span>📱 SNS 보관함 바로가기</span>
                <Share2 className="w-3.5 h-3.5 text-orange-500" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* 실시간 가져오기 버튼 */}
          {onRefreshDB && (
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-sm font-bold border transition-all hover:scale-[1.02] ${
                isSyncing
                  ? "bg-stone-50 text-stone-400 border-stone-200 cursor-not-allowed"
                  : "bg-stone-900 hover:bg-stone-800 text-white border-stone-900 shadow-sm"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "최신 DB 조회 중..." : "실시간 가져오기"}</span>
            </button>
          )}

          <button
            onClick={onCreateNew}
            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-md shadow-orange-500/10 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>새 블로그 생성하기</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="보관함 검색: 여행지, 제목, 키워드 또는 해시태그..."
          className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 pl-11 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm shadow-sm"
        />
        <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Post Grid */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white border border-stone-200/80 rounded-3xl p-12 text-center space-y-4 shadow-xl shadow-stone-200/40">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 mx-auto flex items-center justify-center text-orange-500">
            <FolderHeart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">보관함에 저장된 블로그 포스트가 없습니다.</h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            AI 글 생성기에서 새로운 여행 글을 생성해보세요. 자동으로 보관함 DB에 저장됩니다!
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center space-x-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>첫번째 글 생성하러 가기</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="bg-white border border-stone-200/80 rounded-3xl overflow-hidden hover:border-orange-300 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group shadow-xl shadow-stone-200/40"
            >
              <div>
                {/* Cover Photo */}
                <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                  <img
                    src={getSafeUnsplashCoverUrl(post)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      📍 {post.destination}
                    </span>
                    <span className="bg-orange-500/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      {post.duration}
                    </span>
                  </div>

                  {/* Top-Right Publication Status Badge */}
                  <div className="absolute top-3 right-3">
                    {post.isPublic || post.status === "published" ? (
                      <span className="bg-emerald-600/95 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md shadow-emerald-900/20 border border-emerald-400/30">
                        <Globe2 className="w-3 h-3 text-emerald-200" />
                        <span>웹진 공개</span>
                      </span>
                    ) : (
                      <span className="bg-stone-900/80 backdrop-blur-md text-stone-300 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                        <span>🔒 미발행</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-extrabold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {post.subtitle}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.hashtags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200"
                      >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer Actions */}
              <div className="p-5 pt-3 border-t border-stone-100 mt-2 space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="text-[11px] text-stone-400 font-medium">
                    작성일: {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                  </span>

                  <button
                    onClick={(e) => handleCopyMarkdown(post, e)}
                    className="text-[11px] flex items-center space-x-1 text-stone-500 hover:text-orange-600 font-medium transition-colors"
                    title="마크다운 복사"
                  >
                    {copiedId === post.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>복사</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Explicit 5 Action Buttons: 보기 / 퍼가기 / 발행(토글) / 수정 / 삭제 */}
                <div className="grid grid-cols-5 gap-1 pt-1 border-t border-stone-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPost(post);
                    }}
                    className="flex items-center justify-center space-x-1 py-2 bg-stone-100 hover:bg-orange-50 text-stone-700 hover:text-orange-600 rounded-xl text-xs font-bold transition-all border border-stone-200/80 hover:border-orange-200"
                    title="상세 내용 보기"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">보기</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEmbedPost(post);
                    }}
                    className="flex items-center justify-center space-x-1 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-xs font-bold transition-all border border-orange-200"
                    title="네이버/티스토리로 퍼가기"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">퍼가기</span>
                  </button>

                  {/* 🌐 웹진 발행 / 취소 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTogglePublish) {
                        onTogglePublish(post.id);
                      }
                    }}
                    className={`flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                      post.isPublic || post.status === "published"
                        ? "bg-emerald-50 hover:bg-rose-50 text-emerald-700 hover:text-rose-600 border-emerald-200 hover:border-rose-200"
                        : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    }`}
                    title={
                      post.isPublic || post.status === "published"
                        ? "현재 웹진에 공개중 (클릭 시 발행 취소)"
                        : "웹진에 공개 발행하기"
                    }
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {post.isPublic || post.status === "published" ? "공개중" : "발행"}
                    </span>
                  </button>

                  <button
                    onClick={(e) => handleOpenEdit(post, e)}
                    className="flex items-center justify-center space-x-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all border border-stone-200/80"
                    title="글 내용 수정"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">수정</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPostToDelete(post);
                    }}
                    className="flex items-center justify-center space-x-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all border border-rose-200/80"
                    title="보관함에서 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">삭제</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Blog Embed / Share Modal */}
      <EmbedShareModal
        isOpen={Boolean(embedPost)}
        onClose={() => setEmbedPost(null)}
        post={embedPost}
        onShowToast={onShowToast}
      />

      {/* Edit Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          isOpen={Boolean(editingPost)}
          onClose={() => setEditingPost(null)}
          onSave={onEditPost}
        />
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setPostToDelete(null)}
        >
          <div
            className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scale-up text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-stone-900">
                블로그 포스트 삭제
              </h3>
              <p className="text-xs text-stone-500">
                '<strong className="text-stone-800">{postToDelete.title}</strong>' 글을 보관함(DB)에서 정말 삭제하시겠습니까?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/20"
              >
                영구 삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Firebase Environment & Diagnostics Panel */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xl shadow-stone-200/40 space-y-4">
        <button
          type="button"
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="w-full flex items-center justify-between text-left text-stone-800 focus:outline-none cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-orange-500 animate-pulse" />
            <h2 className="text-sm sm:text-base font-extrabold text-stone-900">파이어베이스 자가 진단 및 실시간 환경변수 검사</h2>
          </div>
          <span className="text-xs text-orange-600 font-bold hover:underline">
            {showDiagnostics ? "접기 ▲" : "진단 및 환경변수 비교 펼치기 ▼"}
          </span>
        </button>

        {showDiagnostics && (
          <div className="pt-4 border-t border-stone-100 space-y-6 text-xs animate-fade-in">
            <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl space-y-2">
              <div className="flex items-center space-x-1.5 text-orange-800 font-bold">
                <Info className="w-4 h-4 text-orange-500" />
                <span>실행 환경 및 파이어베이스 연결 정보</span>
              </div>
              <p className="text-stone-500 text-[11px] leading-relaxed">
                Cloud Run과 Vercel 등 배포 주소에 따라 파이어베이스 설정이 다르게 적용되거나 환경변수가 덮어씌워지는 경우를 방지하기 위해, 웹 브라우저가 런타임에 읽어들인 실제 연결 매개변수를 노출합니다. 보안을 위하여 API 키 및 민감성 정보는 일절 노출되지 않습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Firebase Config Display */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-stone-900 flex items-center space-x-1.5 border-b border-stone-200 pb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>클라이언트 환경변수 (Vite Runtime)</span>
                </h3>
                <div className="space-y-1.5 text-stone-600 font-mono text-[11px]">
                  <div className="flex justify-between py-0.5 border-b border-stone-100/50">
                    <span className="text-stone-400">Project ID</span>
                    <span className="font-bold text-stone-800">{firebaseConfig.projectId || "Undefined"}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-stone-100/50">
                    <span className="text-stone-400">Database ID</span>
                    <span className="font-bold text-stone-800">{firebaseConfig.firestoreDatabaseId || "(default)"}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-stone-100/50">
                    <span className="text-stone-400">Auth Domain</span>
                    <span className="font-bold text-stone-800">{firebaseConfig.authDomain || "Undefined"}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-stone-400">App ID</span>
                    <span className="font-bold text-stone-800">{firebaseConfig.appId || "Undefined"}</span>
                  </div>
                </div>
              </div>

              {/* Status & Auth Display */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-stone-900 flex items-center space-x-1.5 border-b border-stone-200 pb-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span>인증 세션 및 Firestore 상태</span>
                </h3>
                <div className="space-y-1.5 text-stone-600 font-mono text-[11px]">
                  <div className="flex justify-between py-0.5 border-b border-stone-100/50">
                    <span className="text-stone-400">인증 상태</span>
                    <span className={`font-bold ${auth.currentUser ? "text-emerald-600" : "text-amber-600"}`}>
                      {auth.currentUser ? "인증 완료 (Authenticated)" : "미인증 (Unauthenticated)"}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-stone-100/50">
                    <span className="text-stone-400">사용자 UID</span>
                    <span className="font-bold text-stone-800 truncate max-w-[150px]" title={auth.currentUser?.uid}>
                      {auth.currentUser?.uid || "None"}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-stone-100/50">
                    <span className="text-stone-400">익명 로그인</span>
                    <span className="font-bold text-stone-800">
                      {auth.currentUser ? (auth.currentUser.isAnonymous ? "Yes (익명 로그인)" : "No (구글/이메일)") : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-stone-400">DB 실시간 상태</span>
                    <span className={`font-bold ${dbStatus === "success" ? "text-emerald-600" : dbStatus === "error" ? "text-rose-600" : "text-amber-600"}`}>
                      {dbStatus === "success" ? "동기화 성공" : dbStatus === "error" ? "연결 에러 / 권한 없음" : "연결 중 / 로딩 중"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message Details */}
            {dbStatus === "error" && dbErrorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl space-y-2">
                <div className="flex items-center space-x-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>실시간 DB 조회 에러 상세정보 (Firestore Connection Error)</span>
                </div>
                <p className="font-mono text-[11px] leading-relaxed text-rose-700 bg-white border border-rose-100 p-3 rounded-xl overflow-x-auto">
                  {dbErrorMessage}
                </p>
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  💡 <strong>해결 가이드:</strong> 만약 <code>permission-denied</code> 오류가 발생할 경우, 파이어베이스 규칙(firestore.rules)에서 <code>blogs</code> 및 <code>travel_blog_posts</code> 컬렉션에 대한 읽기/쓰기 권한이 승인되어 있는지 확인하십시오. 현재 로그인 UID 상태와 Cloud Run의 설정이 Vercel 환경과 정확히 일치하는지 비교할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

