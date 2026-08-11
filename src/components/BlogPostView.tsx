import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Save,
  Share2,
  Calendar,
  MapPin,
  Clock,
  Tag,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  Eye,
  Map,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Flame,
  ArrowLeft,
  Heart,
} from "lucide-react";
import { BlogPost } from "../types";

interface BlogPostViewProps {
  post: BlogPost;
  onSavePost: (post: BlogPost) => Promise<void>;
  onBackToGenerator: () => void;
  isSaved?: boolean;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({
  post,
  onSavePost,
  onBackToGenerator,
  isSaved = false,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "markdown" | "itinerary">("preview");
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(isSaved);
  const [editedMarkdown, setEditedMarkdown] = useState(post.markdownContent);

  // Cover image generation state
  const [coverImageUrl, setCoverImageUrl] = useState<string>(
    post.coverImageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
  );
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Spot photo map state
  const [spotPhotos, setSpotPhotos] = useState<{ [spotKey: string]: string }>({});
  const [generatingSpotKey, setGeneratingSpotKey] = useState<string | null>(null);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(editedMarkdown);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedPost: BlogPost = {
        ...post,
        markdownContent: editedMarkdown,
        coverImageUrl,
      };
      await onSavePost(updatedPost);
      setSavedSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateCoverPhoto = async () => {
    setIsGeneratingImage(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Scenic aesthetic travel blog cover photo for ${post.title}`,
          destination: post.destination,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setCoverImageUrl(data.imageUrl);
      }
    } catch (err) {
      console.error("Cover image generation error:", err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateSpotPhoto = async (dayIdx: number, spotIdx: number, spotName: string, prompt?: string) => {
    const key = `${dayIdx}_${spotIdx}`;
    setGeneratingSpotKey(key);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt || `A beautiful photograph of ${spotName} in ${post.destination}`,
          destination: post.destination,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setSpotPhotos((prev) => ({ ...prev, [key]: data.imageUrl }));
      }
    } catch (err) {
      console.error("Spot image generation error:", err);
    } finally {
      setGeneratingSpotKey(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-stone-200/80 p-4 rounded-2xl shadow-sm">
        <button
          onClick={onBackToGenerator}
          className="flex items-center space-x-2 text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>새 글 작성으로 이동</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cover Photo AI Generator */}
          <button
            onClick={handleGenerateCoverPhoto}
            disabled={isGeneratingImage}
            className="flex items-center space-x-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
          >
            {isGeneratingImage ? (
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-orange-500" />
            )}
            <span>AI 커버 사진 생성</span>
          </button>

          {/* Copy to Naver/Tistory Clipboard */}
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center space-x-1.5 bg-stone-800 hover:bg-stone-900 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? "복사 완료!" : "본문 전체 복사"}</span>
          </button>

          {/* Save to Firebase Firestore */}
          <button
            onClick={handleSave}
            disabled={isSaving || savedSuccess}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              savedSuccess
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/10"
            }`}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : savedSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{savedSuccess ? "DB 저장됨" : "파이어베이스 DB 저장"}</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-stone-200 space-x-2">
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "preview"
              ? "border-orange-500 text-orange-600 bg-orange-50/50"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>블로그 미리보기</span>
        </button>

        <button
          onClick={() => setActiveTab("itinerary")}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "itinerary"
              ? "border-orange-500 text-orange-600 bg-orange-50/50"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Map className="w-4 h-4" />
          <span>일정 코스맵 ({post.itinerary.length}일차)</span>
        </button>

        <button
          onClick={() => setActiveTab("markdown")}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "markdown"
              ? "border-orange-500 text-orange-600 bg-orange-50/50"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>마크다운 / 수정 에디터</span>
        </button>
      </div>

      {/* TAB 1: PREVIEW */}
      {activeTab === "preview" && (
        <article className="bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-xl shadow-stone-200/40 space-y-8">
          {/* Hero Cover Image & Title Overlay */}
          <div className="relative h-72 sm:h-96 w-full overflow-hidden group">
            <img
              src={coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 space-y-3">
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="bg-orange-500/90 text-white px-3 py-1 rounded-full shadow-md backdrop-blur-md">
                  📍 {post.destination}
                </span>
                <span className="bg-stone-800/80 text-white px-3 py-1 rounded-full shadow-md backdrop-blur-md">
                  🗓️ {post.duration}
                </span>
                <span className="bg-amber-600/80 text-white px-3 py-1 rounded-full shadow-md backdrop-blur-md">
                  ✨ {post.concept}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {post.title}
              </h1>

              <p className="text-stone-200 text-sm sm:text-base font-medium line-clamp-2">
                {post.subtitle}
              </p>
            </div>
          </div>

          {/* Travel Meta Summary Bar */}
          <div className="px-6 sm:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-stone-50 border border-stone-200/80 p-4 rounded-2xl text-center">
              <div>
                <p className="text-[11px] text-stone-500 font-medium">추천 계절</p>
                <p className="text-sm font-bold text-orange-600 mt-0.5">{post.season}</p>
              </div>
              <div>
                <p className="text-[11px] text-stone-500 font-medium">예상 예산</p>
                <p className="text-sm font-bold text-stone-800 mt-0.5">{post.budget}</p>
              </div>
              <div>
                <p className="text-[11px] text-stone-500 font-medium">추천 타깃</p>
                <p className="text-sm font-bold text-stone-800 mt-0.5">{post.targetAudience}</p>
              </div>
              <div>
                <p className="text-[11px] text-stone-500 font-medium">문체 톤</p>
                <p className="text-sm font-bold text-emerald-600 mt-0.5 truncate">{post.tone}</p>
              </div>
            </div>
          </div>

          {/* Travel Tips Callout */}
          {post.travelTips && post.travelTips.length > 0 && (
            <div className="mx-6 sm:mx-8 bg-amber-50 border border-amber-200/80 rounded-2xl p-5 space-y-2">
              <h3 className="text-sm font-bold text-amber-900 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>에디터 추천 꿀팁 & 필수 준비물</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-900/90 pt-1">
                {post.travelTips.map((tip, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Itinerary Section */}
          <div className="px-6 sm:px-8 space-y-6">
            <h2 className="text-xl font-bold text-stone-900 flex items-center space-x-2 border-b border-stone-200 pb-3">
              <Map className="w-5 h-5 text-orange-500" />
              <span>일정별 추천 코스 안내</span>
            </h2>

            <div className="space-y-6">
              {post.itinerary.map((dayItem, dayIdx) => (
                <div
                  key={dayIdx}
                  className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                      D{dayItem.day}
                    </span>
                    <h3 className="text-base font-bold text-stone-900">{dayItem.title}</h3>
                  </div>

                  <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-orange-200">
                    {dayItem.activities.map((act, actIdx) => {
                      const spotKey = `${dayIdx}_${actIdx}`;
                      const photoUrl = spotPhotos[spotKey];

                      return (
                        <div key={actIdx} className="space-y-2 pt-1">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              {act.time && (
                                <span className="text-xs font-semibold text-stone-600 flex items-center gap-1 bg-white border border-stone-200 px-2 py-0.5 rounded-md">
                                  <Clock className="w-3 h-3 text-orange-500" />
                                  {act.time}
                                </span>
                              )}
                              <span className="text-sm font-bold text-stone-900">{act.spot}</span>
                            </div>

                            {/* AI Image for Spot Button */}
                            <button
                              onClick={() =>
                                handleGenerateSpotPhoto(
                                  dayIdx,
                                  actIdx,
                                  act.spot,
                                  act.photoPrompt
                                )
                              }
                              disabled={generatingSpotKey === spotKey}
                              className="text-[11px] bg-white hover:bg-orange-50 text-stone-700 hover:text-orange-600 border border-stone-200 px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1"
                            >
                              {generatingSpotKey === spotKey ? (
                                <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Camera className="w-3 h-3 text-orange-500" />
                              )}
                              <span>사진 AI 생성</span>
                            </button>
                          </div>

                          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                            {act.description}
                          </p>

                          {act.tip && (
                            <div className="text-xs bg-amber-50/80 border border-amber-200/60 p-2.5 rounded-xl text-amber-900 flex items-start space-x-1.5">
                              <span className="font-bold text-amber-600">💡 꿀팁:</span>
                              <span>{act.tip}</span>
                            </div>
                          )}

                          {/* Rendered Spot Photo if generated */}
                          {photoUrl && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-stone-200 max-h-60">
                              <img
                                src={photoUrl}
                                alt={act.spot}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Markdown Blog Post Body */}
          <div className="px-6 sm:px-8 space-y-4">
            <h2 className="text-xl font-bold text-stone-900 flex items-center space-x-2 border-b border-stone-200 pb-3">
              <FileText className="w-5 h-5 text-orange-500" />
              <span>블로그 포스팅 본문 미리보기</span>
            </h2>

            <div className="bg-stone-50 border border-stone-200 p-6 rounded-2xl text-stone-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {post.markdownContent}
            </div>
          </div>

          {/* SEO Tags Footer */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <p className="text-xs font-bold text-stone-500 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-orange-500" />
                <span>추천 SEO 태그 & 키워드</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-xl border border-orange-200/80 font-medium"
                  >
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>
      )}

      {/* TAB 2: ITINERARY SUMMARY MAP */}
      {activeTab === "itinerary" && (
        <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-stone-200/40">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900">{post.destination} 일정 요약 코스맵</h2>
              <p className="text-xs text-stone-500">{post.duration} • {post.concept}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {post.itinerary.map((dayItem, dIdx) => (
              <div
                key={dIdx}
                className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="bg-orange-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg">
                    DAY {dayItem.day}
                  </span>
                  <h3 className="font-bold text-stone-900 text-sm">{dayItem.title}</h3>
                </div>

                <div className="space-y-3">
                  {dayItem.activities.map((act, aIdx) => (
                    <div
                      key={aIdx}
                      className="flex items-start space-x-3 bg-white p-3 rounded-xl border border-stone-200 text-xs"
                    >
                      <span className="font-bold text-orange-500 w-5">{aIdx + 1}.</span>
                      <div className="space-y-1">
                        <p className="font-bold text-stone-900 text-sm">{act.spot}</p>
                        <p className="text-stone-600">{act.description}</p>
                        {act.tip && <p className="text-amber-700 text-[11px]">💡 {act.tip}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MARKDOWN EDITOR */}
      {activeTab === "markdown" && (
        <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl shadow-stone-200/40">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-stone-800 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-orange-500" />
              <span>마크다운 본문 편집 (네이버/티스토리/브런치 직접 복사용)</span>
            </label>
            <button
              onClick={handleCopyMarkdown}
              className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-xl font-semibold hover:bg-orange-100 transition-colors"
            >
              {isCopied ? "복사완료!" : "마크다운 전체 복사"}
            </button>
          </div>

          <textarea
            value={editedMarkdown}
            onChange={(e) => setEditedMarkdown(e.target.value)}
            rows={22}
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-800 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
