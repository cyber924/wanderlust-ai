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
  FolderHeart,
  Layers,
  Trash2,
  RefreshCw,
  Globe2,
} from "lucide-react";
import { BlogPost, GeneratedImage } from "../types";
import { getSafeUnsplashCoverUrl } from "../utils/imageHelper";
import { PhotoPickerModal } from "./PhotoPickerModal";
import { EmbedShareModal } from "./EmbedShareModal";

interface BlogPostViewProps {
  post: BlogPost;
  onSavePost: (post: BlogPost) => Promise<void>;
  onBackToGenerator: () => void;
  isSaved?: boolean;
  galleryImages?: GeneratedImage[];
  onSaveImageToGallery?: (image: GeneratedImage) => Promise<void> | void;
  onNavigateToImageGenerator?: () => void;
  onNavigateToWebzine?: () => void;
  onShowToast: (msg: string) => void;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({
  post,
  onSavePost,
  onBackToGenerator,
  isSaved = false,
  galleryImages = [],
  onSaveImageToGallery,
  onNavigateToImageGenerator,
  onNavigateToWebzine,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "markdown" | "itinerary">("preview");
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(isSaved);
  const [isPublished, setIsPublished] = useState<boolean>(post.isPublic || post.status === "published");
  const [editedMarkdown, setEditedMarkdown] = useState(post.markdownContent);
  const [itinerary, setItinerary] = useState(post.itinerary || []);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);

  // Cover image state
  const [coverImageUrl, setCoverImageUrl] = useState<string>(() => {
    return getSafeUnsplashCoverUrl(post);
  });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Spot photo map state (pre-populated with existing itinerary images)
  const [spotPhotos, setSpotPhotos] = useState<{ [spotKey: string]: string }>(() => {
    const initial: { [spotKey: string]: string } = {};
    (post.itinerary || []).forEach((dayItem, dIdx) => {
      (dayItem.activities || []).forEach((act, aIdx) => {
        if (act.imageUrl) {
          initial[`${dIdx}_${aIdx}`] = act.imageUrl;
        }
      });
    });
    return initial;
  });
  const [generatingSpotKey, setGeneratingSpotKey] = useState<string | null>(null);

  // Photo Picker Modal State
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [activeSpotTarget, setActiveSpotTarget] = useState<{
    dayIdx: number;
    spotIdx: number;
    spotName: string;
  } | null>(null);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(editedMarkdown);
    setIsCopied(true);
    onShowToast("📋 마크다운 본문이 클립보드에 복사되었습니다!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedPost: BlogPost = {
        ...post,
        markdownContent: editedMarkdown,
        coverImageUrl,
        itinerary,
        isPublic: isPublished,
        status: isPublished ? "published" : "draft",
      };
      await onSavePost(updatedPost);
      setSavedSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    const nextPublished = !isPublished;
    setIsPublished(nextPublished);
    setIsSaving(true);
    try {
      const updatedPost: BlogPost = {
        ...post,
        isPublic: nextPublished,
        status: nextPublished ? "published" : "draft",
        markdownContent: editedMarkdown,
        coverImageUrl,
        itinerary,
      };
      await onSavePost(updatedPost);
      setSavedSuccess(true);
      if (nextPublished) {
        onShowToast("🎉 웹진에 공개 발행되었습니다! [웹진] 탭에서 누구나 볼 수 있습니다.");
      } else {
        onShowToast("🔒 웹진 발행이 취소되어 나만의 보관함 전용으로 전환되었습니다.");
      }
    } catch (e) {
      console.error(e);
      onShowToast("웹진 발행 처리 중 오류가 발생했습니다.");
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
        setSavedSuccess(false);
        onShowToast("🎉 새 AI 커버 사진이 생성되어 적용되었습니다!");
      }
    } catch (err) {
      console.error("Cover image generation error:", err);
      onShowToast("커버 사진 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateSpotPhoto = async (
    dayIdx: number,
    spotIdx: number,
    spotName: string,
    prompt?: string
  ) => {
    const key = `${dayIdx}_${spotIdx}`;
    setGeneratingSpotKey(key);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt || `High resolution scenic travel photograph of ${spotName} in ${post.destination}`,
          destination: `${post.destination} ${spotName}`,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        const imageUrl = data.imageUrl;
        setSpotPhotos((prev) => ({ ...prev, [key]: imageUrl }));

        // Update itinerary state
        const newItinerary = [...itinerary];
        if (newItinerary[dayIdx] && newItinerary[dayIdx].activities[spotIdx]) {
          newItinerary[dayIdx].activities[spotIdx] = {
            ...newItinerary[dayIdx].activities[spotIdx],
            imageUrl,
          };
          setItinerary(newItinerary);
        }

        // Save generated photo to gallery storage if handler available
        if (onSaveImageToGallery) {
          onSaveImageToGallery({
            id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            imageUrl,
            destination: `${post.destination} - ${spotName}`,
            style: "감성 시네마틱",
            lighting: "골든 아워",
            aspectRatio: "16:9",
            prompt: prompt || `Photograph of ${spotName}`,
            createdAt: new Date().toISOString(),
            linkedBlogId: post.id,
            linkedBlogTitle: post.title,
            isCover: false,
          });
        }

        // Synchronize photo tag into markdown body
        const imageMarkdown = `\n\n![${spotName}](${imageUrl})\n*<p align="center" style="color:gray; font-size:12px;">▲ AI가 생성한 ${spotName} 현장 스냅사진</p>*\n\n`;
        if (editedMarkdown.includes(spotName)) {
          const idx = editedMarkdown.indexOf(spotName);
          const endOfLine = editedMarkdown.indexOf("\n", idx);
          if (endOfLine !== -1) {
            setEditedMarkdown(
              editedMarkdown.slice(0, endOfLine) + imageMarkdown + editedMarkdown.slice(endOfLine)
            );
          } else {
            setEditedMarkdown((prev) => prev + imageMarkdown);
          }
        } else {
          setEditedMarkdown((prev) => prev + imageMarkdown);
        }

        setSavedSuccess(false);
        onShowToast(`📸 '${spotName}' 사진이 생성되어 일정과 본문에 반영되었습니다!`);
      }
    } catch (err) {
      console.error("Spot image generation error:", err);
      onShowToast("스팟 사진 생성 중 오류가 발생했습니다.");
    } finally {
      setGeneratingSpotKey(null);
    }
  };

  const handleSelectSpotPhoto = (
    dayIdx: number,
    spotIdx: number,
    imageUrl: string,
    image: GeneratedImage
  ) => {
    const key = `${dayIdx}_${spotIdx}`;
    setSpotPhotos((prev) => ({ ...prev, [key]: imageUrl }));

    const newItinerary = [...itinerary];
    if (newItinerary[dayIdx] && newItinerary[dayIdx].activities[spotIdx]) {
      newItinerary[dayIdx].activities[spotIdx] = {
        ...newItinerary[dayIdx].activities[spotIdx],
        imageUrl,
      };
      setItinerary(newItinerary);
    }

    const spotName = newItinerary[dayIdx]?.activities[spotIdx]?.spot || "스팟";
    const imageMarkdown = `\n\n![${spotName}](${imageUrl})\n*<p align="center" style="color:gray; font-size:12px;">▲ 갤러리에서 선택된 ${spotName} 현장 스냅사진</p>*\n\n`;
    if (editedMarkdown.includes(spotName)) {
      const idx = editedMarkdown.indexOf(spotName);
      const endOfLine = editedMarkdown.indexOf("\n", idx);
      if (endOfLine !== -1) {
        setEditedMarkdown(
          editedMarkdown.slice(0, endOfLine) + imageMarkdown + editedMarkdown.slice(endOfLine)
        );
      } else {
        setEditedMarkdown((prev) => prev + imageMarkdown);
      }
    } else {
      setEditedMarkdown((prev) => prev + imageMarkdown);
    }

    setSavedSuccess(false);
  };

  const handleRemoveSpotPhoto = (dayIdx: number, spotIdx: number, spotName: string) => {
    const key = `${dayIdx}_${spotIdx}`;
    setSpotPhotos((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    const newItinerary = [...itinerary];
    if (newItinerary[dayIdx] && newItinerary[dayIdx].activities[spotIdx]) {
      newItinerary[dayIdx].activities[spotIdx] = {
        ...newItinerary[dayIdx].activities[spotIdx],
        imageUrl: undefined,
      };
      setItinerary(newItinerary);
    }

    setSavedSuccess(false);
    onShowToast(`🗑️ '${spotName}' 스팟 사진이 제거되었습니다.`);
  };

  const handleSelectCoverFromGallery = (imageUrl: string) => {
    setCoverImageUrl(imageUrl);
    setSavedSuccess(false);
  };

  const handleInsertMarkdownFromGallery = (imageUrl: string, title: string) => {
    const imageMarkdown = `\n\n![${title || "AI 여행 사진"}](${imageUrl})\n*<p align="center" style="color:gray; font-size:12px;">▲ AI가 생성한 ${title || "여행"} 현장 스냅사진</p>*\n\n`;
    setEditedMarkdown((prev) => prev + imageMarkdown);
    setSavedSuccess(false);
  };

  const handleOpenSpotGalleryModal = (dayIdx: number, spotIdx: number, spotName: string) => {
    setActiveSpotTarget({ dayIdx, spotIdx, spotName });
    setIsPhotoPickerOpen(true);
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
          {/* Pick from AI Gallery Modal Button */}
          <button
            onClick={() => {
              setActiveSpotTarget(null);
              setIsPhotoPickerOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-stone-100 hover:bg-orange-50 text-stone-700 hover:text-orange-600 border border-stone-200 hover:border-orange-300 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm"
          >
            <FolderHeart className="w-4 h-4 text-orange-500" />
            <span>🖼️ AI 갤러리에서 사진 가져오기</span>
          </button>

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
            <span>새 커버 AI 생성</span>
          </button>

          {/* Copy to Naver/Tistory Clipboard */}
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center space-x-1.5 bg-stone-800 hover:bg-stone-900 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? "복사 완료!" : "본문 전체 복사"}</span>
          </button>

          {/* Embed / Blog Share with Backlink */}
          <button
            onClick={() => setIsEmbedModalOpen(true)}
            className="flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95"
            title="네이버/티스토리로 퍼가기 (출처 자동 포함)"
          >
            <Share2 className="w-4 h-4" />
            <span>블로그로 퍼가기</span>
          </button>

          {/* Webzine Publish / Unpublish Toggle */}
          <button
            onClick={handleTogglePublish}
            disabled={isSaving}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
              isPublished
                ? "bg-emerald-600 hover:bg-rose-600 text-white shadow-emerald-600/20"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
            }`}
            title={isPublished ? "현재 웹진에 공개중 (클릭 시 발행 취소)" : "웹진에 공개 발행하기"}
          >
            <Globe2 className="w-4 h-4" />
            <span>{isPublished ? "웹진 공개중" : "웹진 공개 발행"}</span>
          </button>

          {/* View in Webzine Shortcut Button */}
          {isPublished && onNavigateToWebzine && (
            <button
              onClick={onNavigateToWebzine}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-stone-900 hover:bg-black text-amber-300 border border-amber-400/40 shadow-sm"
              title="웹진 탭으로 이동하여 내 글 확인"
            >
              <span>📖 웹진에서 확인</span>
            </button>
          )}

          {/* Save to Firebase Firestore */}
          <button
            onClick={handleSave}
            disabled={isSaving || savedSuccess}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              savedSuccess
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-stone-900 hover:bg-black text-white shadow-md"
            }`}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : savedSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{savedSuccess ? "DB 저장됨" : "DB에 저장하기"}</span>
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

            {/* Quick Cover Change Button overlay */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setActiveSpotTarget(null);
                  setIsPhotoPickerOpen(true);
                }}
                className="bg-white/90 hover:bg-white text-stone-800 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center space-x-1.5"
              >
                <FolderHeart className="w-3.5 h-3.5 text-orange-500" />
                <span>커버 사진 변경</span>
              </button>
            </div>

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
              <span>일정별 추천 코스 & 현장 스냅 사진</span>
            </h2>

            <div className="space-y-6">
              {itinerary.map((dayItem, dayIdx) => (
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

                  <div className="space-y-4 pl-2 sm:pl-4 border-l-2 border-orange-200">
                    {dayItem.activities.map((act, actIdx) => {
                      const spotKey = `${dayIdx}_${actIdx}`;
                      const photoUrl = spotPhotos[spotKey] || act.imageUrl;

                      return (
                        <div
                          key={actIdx}
                          className="space-y-2 p-3 -mx-3 rounded-2xl transition-colors hover:bg-white/80 group/spot"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              {act.time && (
                                <span className="text-xs font-semibold text-stone-600 flex items-center gap-1 bg-white border border-stone-200 px-2 py-0.5 rounded-md shadow-2xs">
                                  <Clock className="w-3 h-3 text-orange-500" />
                                  {act.time}
                                </span>
                              )}
                              <span className="text-sm font-bold text-stone-900">{act.spot}</span>
                            </div>

                            {/* Spot Action Buttons: Hidden by default, smoothly appears on hover */}
                            <div
                              className={`flex items-center space-x-1.5 shrink-0 transition-opacity duration-200 ${
                                generatingSpotKey === spotKey
                                  ? "opacity-100"
                                  : "opacity-0 pointer-events-none group-hover/spot:opacity-100 group-hover/spot:pointer-events-auto group-focus-within/spot:opacity-100 group-focus-within/spot:pointer-events-auto"
                              }`}
                            >
                              {/* Pick spot photo from Gallery */}
                              <button
                                type="button"
                                onClick={() => handleOpenSpotGalleryModal(dayIdx, actIdx, act.spot)}
                                className="text-[11px] bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-2 py-1 rounded-lg transition-all flex items-center space-x-1 shadow-xs hover:border-stone-300"
                                title="보관함에서 사진 선택"
                              >
                                <FolderHeart className="w-3 h-3 text-orange-500" />
                                <span>갤러리</span>
                              </button>

                              {/* AI Image for Spot Button */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleGenerateSpotPhoto(
                                    dayIdx,
                                    actIdx,
                                    act.spot,
                                    act.photoPrompt
                                  )
                                }
                                disabled={generatingSpotKey === spotKey}
                                className="text-[11px] bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-2 py-1 rounded-lg transition-all flex items-center space-x-1 font-bold shadow-xs disabled:opacity-50"
                                title="AI로 장소 사진 생성"
                              >
                                {generatingSpotKey === spotKey ? (
                                  <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Sparkles className="w-3 h-3 text-orange-500" />
                                )}
                                <span>AI 생성</span>
                              </button>
                            </div>
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

                          {/* Rendered Spot Photo */}
                          {photoUrl && (
                            <div className="mt-2.5 relative rounded-2xl overflow-hidden border border-stone-200/90 shadow-md group/photo bg-stone-950">
                              <img
                                src={photoUrl}
                                alt={act.spot}
                                referrerPolicy="no-referrer"
                                className="w-full h-56 sm:h-72 object-cover group-hover/photo:scale-[1.02] transition-transform duration-500"
                              />

                              {/* Spot Photo Badge */}
                              <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-xl shadow flex items-center space-x-1.5 border border-white/10">
                                <Camera className="w-3.5 h-3.5 text-orange-400" />
                                <span>📸 {act.spot} 현장 스냅</span>
                              </div>

                              {/* Action controls on the photo: Cleanly hidden until hovered */}
                              <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 opacity-0 group-hover/photo:opacity-100 group-focus-within/photo:opacity-100 transition-opacity duration-200">
                                <button
                                  type="button"
                                  onClick={() => handleOpenSpotGalleryModal(dayIdx, actIdx, act.spot)}
                                  className="bg-white/95 hover:bg-white text-stone-800 text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-md backdrop-blur-md flex items-center space-x-1 transition-all"
                                  title="다른 사진으로 변경"
                                >
                                  <FolderHeart className="w-3.5 h-3.5 text-orange-500" />
                                  <span>변경</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleGenerateSpotPhoto(
                                      dayIdx,
                                      actIdx,
                                      act.spot,
                                      act.photoPrompt
                                    )
                                  }
                                  disabled={generatingSpotKey === spotKey}
                                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-md backdrop-blur-md flex items-center space-x-1 transition-all disabled:opacity-50"
                                  title="AI로 다시 생성"
                                >
                                  {generatingSpotKey === spotKey ? (
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-3.5 h-3.5 text-white" />
                                  )}
                                  <span>재생성</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveSpotPhoto(dayIdx, actIdx, act.spot)}
                                  className="bg-stone-900/85 hover:bg-red-600 text-white text-xs font-bold p-1.5 rounded-xl shadow-md backdrop-blur-md transition-all"
                                  title="사진 제거"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
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
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="text-xl font-bold text-stone-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-orange-500" />
                <span>블로그 포스팅 본문 미리보기</span>
              </h2>

              <button
                onClick={() => {
                  setActiveSpotTarget(null);
                  setIsPhotoPickerOpen(true);
                }}
                className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1"
              >
                <FolderHeart className="w-3.5 h-3.5" />
                <span>갤러리 사진 본문 삽입</span>
              </button>
            </div>

            <div className="bg-stone-50 border border-stone-200 p-6 rounded-2xl text-stone-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {editedMarkdown}
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
            {itinerary.map((dayItem, dIdx) => (
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
                  {dayItem.activities.map((act, aIdx) => {
                    const spotKey = `${dIdx}_${aIdx}`;
                    const photoUrl = spotPhotos[spotKey] || act.imageUrl;

                    return (
                      <div
                        key={aIdx}
                        className="flex flex-col space-y-2 bg-white p-3.5 rounded-xl border border-stone-200 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 font-bold text-stone-900 text-sm">
                            <span className="text-orange-500">{aIdx + 1}.</span>
                            <span>{act.spot}</span>
                          </div>
                          {act.time && (
                            <span className="text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                              {act.time}
                            </span>
                          )}
                        </div>

                        <p className="text-stone-600">{act.description}</p>
                        {act.tip && <p className="text-amber-700 text-[11px]">💡 {act.tip}</p>}

                        {photoUrl && (
                          <div className="mt-1 rounded-xl overflow-hidden border border-stone-200 max-h-40">
                            <img
                              src={photoUrl}
                              alt={act.spot}
                              referrerPolicy="no-referrer"
                              className="w-full h-36 object-cover"
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
      )}

      {/* TAB 3: MARKDOWN EDITOR */}
      {activeTab === "markdown" && (
        <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl shadow-stone-200/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-bold text-stone-800 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-orange-500" />
              <span>마크다운 본문 편집 (네이버/티스토리/브런치 직접 복사용)</span>
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setActiveSpotTarget(null);
                  setIsPhotoPickerOpen(true);
                }}
                className="text-xs bg-stone-100 hover:bg-orange-50 text-stone-700 hover:text-orange-600 border border-stone-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1"
              >
                <FolderHeart className="w-3.5 h-3.5 text-orange-500" />
                <span>📸 갤러리 사진 마크다운에 삽입</span>
              </button>

              <button
                onClick={handleCopyMarkdown}
                className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-xl font-semibold hover:bg-orange-100 transition-colors"
              >
                {isCopied ? "복사완료!" : "마크다운 전체 복사"}
              </button>
            </div>
          </div>

          <textarea
            value={editedMarkdown}
            onChange={(e) => {
              setEditedMarkdown(e.target.value);
              setSavedSuccess(false);
            }}
            rows={22}
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-800 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed"
          />
        </div>
      )}

      {/* Photo Picker Modal */}
      <PhotoPickerModal
        isOpen={isPhotoPickerOpen}
        onClose={() => {
          setIsPhotoPickerOpen(false);
          setActiveSpotTarget(null);
        }}
        galleryImages={galleryImages}
        onSelectCover={handleSelectCoverFromGallery}
        onInsertMarkdown={handleInsertMarkdownFromGallery}
        activeSpotTarget={activeSpotTarget}
        onSelectSpot={handleSelectSpotPhoto}
        onNavigateToImageGenerator={onNavigateToImageGenerator}
        onShowToast={onShowToast}
      />

      {/* Blog Embed & Viral Share Modal */}
      <EmbedShareModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        post={{
          ...post,
          markdownContent: editedMarkdown,
          coverImageUrl,
          itinerary,
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
