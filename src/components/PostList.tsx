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
} from "lucide-react";
import { BlogPost } from "../types";
import { EditPostModal } from "./EditPostModal";

interface PostListProps {
  posts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
  onEditPost: (updatedPost: BlogPost) => Promise<void>;
  onDeletePost: (postId: string) => void;
  onCreateNew: () => void;
}

export const PostList: React.FC<PostListProps> = ({
  posts,
  onSelectPost,
  onEditPost,
  onDeletePost,
  onCreateNew,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.hashtags.some((h) => h.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-stone-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-stone-200/40">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-orange-500" />
            <h1 className="text-2xl font-extrabold text-stone-900">파이어베이스 DB 보관함</h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500">
            내 DB에 저장된 전체 여행 블로그 글 목록입니다. 언제든지 상세보기, 수정, 삭제가 가능합니다.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-md shadow-orange-500/10 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>새 블로그 생성하기</span>
        </button>
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
                    src={
                      post.coverImageUrl ||
                      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
                    }
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

                {/* Explicit Action Buttons: 상세보기 / 수정 / 삭제 */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPost(post);
                    }}
                    className="flex items-center justify-center space-x-1 py-2 bg-stone-100 hover:bg-orange-50 text-stone-700 hover:text-orange-600 rounded-xl text-xs font-bold transition-all border border-stone-200/80 hover:border-orange-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>상세보기</span>
                  </button>

                  <button
                    onClick={(e) => handleOpenEdit(post, e)}
                    className="flex items-center justify-center space-x-1 py-2 bg-stone-100 hover:bg-orange-50 text-stone-700 hover:text-orange-600 rounded-xl text-xs font-bold transition-all border border-stone-200/80 hover:border-orange-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>수정</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`'${post.title}' 블로그 포스트를 보관함에서 삭제하시겠습니까?`)) {
                        onDeletePost(post.id);
                      }
                    }}
                    className="flex items-center justify-center space-x-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all border border-rose-200/80"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>삭제</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          isOpen={Boolean(editingPost)}
          onClose={() => setEditingPost(null)}
          onSave={onEditPost}
        />
      )}
    </div>
  );
};

