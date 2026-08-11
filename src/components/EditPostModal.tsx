import React, { useState } from "react";
import { X, Save, Edit3, MapPin, Calendar, Compass, FileText, Tag } from "lucide-react";
import { BlogPost } from "../types";

interface EditPostModalProps {
  post: BlogPost;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPost: BlogPost) => Promise<void>;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  post,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(post.title);
  const [subtitle, setSubtitle] = useState(post.subtitle);
  const [destination, setDestination] = useState(post.destination);
  const [duration, setDuration] = useState(post.duration);
  const [concept, setConcept] = useState(post.concept);
  const [markdownContent, setMarkdownContent] = useState(post.markdownContent);
  const [hashtagsStr, setHashtagsStr] = useState(post.hashtags.join(", "));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const parsedHashtags = hashtagsStr
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const updatedPost: BlogPost = {
        ...post,
        title,
        subtitle,
        destination,
        duration,
        concept,
        markdownContent,
        hashtags: parsedHashtags,
        updatedAt: new Date().toISOString(),
      };

      await onSave(updatedPost);
      onClose();
    } catch (error) {
      console.error("Failed to edit post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-stone-200/80 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative text-stone-900 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200/80 bg-stone-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">블로그 포스트 수정</h2>
              <p className="text-xs text-stone-500">
                파이어베이스 DB에 저장된 블로그 글 정보를 수정합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-800 p-2 rounded-xl hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">블로그 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 text-stone-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">소제목 / 요약문</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
          </div>

          {/* Destination & Duration & Concept */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>여행지</span>
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2 text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                <span>기간</span>
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2 text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-orange-500" />
                <span>테마 / 컨셉</span>
              </label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2 text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Markdown Body */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-orange-500" />
              <span>본문 마크다운 내용</span>
            </label>
            <textarea
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              rows={10}
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white leading-relaxed"
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-orange-500" />
              <span>SEO 해시태그 (쉼표로 구분)</span>
            </label>
            <input
              type="text"
              value={hashtagsStr}
              onChange={(e) => setHashtagsStr(e.target.value)}
              placeholder="#제주여행, #카페투어, #감성숙소"
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all flex items-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>저장하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
