import React, { useState } from "react";
import {
  Camera,
  Sparkles,
  Sliders,
  Download,
  Copy,
  Check,
  Maximize2,
  X,
  FileText,
  MapPin,
  Sun,
  Layers,
  Image as ImageIcon,
  Compass,
  RefreshCw,
  Info,
  FolderHeart,
  Link2,
  Trash2,
  Search,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";
import { BlogPost, GeneratedImage } from "../types";
import { ImageLinkModal } from "./ImageLinkModal";

interface ImageGeneratorProps {
  savedPosts?: BlogPost[];
  galleryImages?: GeneratedImage[];
  onSaveImageToGallery?: (image: GeneratedImage) => Promise<void>;
  onDeleteImageFromGallery?: (imageId: string) => Promise<void>;
  onClearAllImagesFromGallery?: () => Promise<void> | void;
  onSetImageAsCover?: (post: BlogPost, image: GeneratedImage) => Promise<void> | void;
  onSetImageAsSpot?: (
    post: BlogPost,
    image: GeneratedImage,
    dayIdx: number,
    spotIdx: number
  ) => Promise<void> | void;
  onInsertImageIntoContent?: (
    post: BlogPost,
    image: GeneratedImage,
    position: "top" | "bottom"
  ) => Promise<void> | void;
  onCreateNewPostWithImage?: (image: GeneratedImage) => void;
  onShowToast: (msg: string) => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  savedPosts = [],
  galleryImages = [],
  onSaveImageToGallery,
  onDeleteImageFromGallery,
  onClearAllImagesFromGallery,
  onSetImageAsCover = () => {},
  onSetImageAsSpot = () => {},
  onInsertImageIntoContent = () => {},
  onCreateNewPostWithImage = () => {},
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"create" | "gallery">("create");
  const [selectedCategory, setSelectedCategory] = useState<"travel" | "living" | "food">("travel");
  const [destination, setDestination] = useState("프랑스 파리 에펠탑 반짝이는 야경과 센강");
  const [count, setCount] = useState<number>(2); // Default 2 images
  const [style, setStyle] = useState("감성 시네마틱");
  const [lighting, setLighting] = useState("도시 야경");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [viewAngle, setViewAngle] = useState("파노라마 광각");
  const [customDetail, setCustomDetail] = useState("반짝이는 조명의 에펠탑, 센강에 비치는 불빛, 낭만적인 밤하늘");

  const [loading, setLoading] = useState(false);
  const [recentGeneratedImages, setRecentGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImageForLightbox, setSelectedImageForLightbox] = useState<GeneratedImage | null>(null);
  const [selectedImageForLink, setSelectedImageForLink] = useState<GeneratedImage | null>(null);
  const [imageToDelete, setImageToDelete] = useState<GeneratedImage | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [gallerySearchTerm, setGallerySearchTerm] = useState("");

  const getFallbackImage = (dest: string) => {
    const d = (dest || "").toLowerCase();
    if (d.includes("주방") || d.includes("living") || d.includes("침실") || d.includes("거실") || d.includes("인테리어") || d.includes("interior") || d.includes("room") || d.includes("데스크")) {
      return "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80";
    }
    if (d.includes("요리") || d.includes("디저트") || d.includes("카페") || d.includes("dessert") || d.includes("cafe") || d.includes("food") || d.includes("라떼") || d.includes("한식")) {
      return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80";
    }
    if (d.includes("파리") || d.includes("에펠") || d.includes("paris")) {
      return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80";
    }
    if (d.includes("제주") || d.includes("함덕") || d.includes("해변") || d.includes("바다") || d.includes("beach") || d.includes("ocean")) {
      return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
    }
    if (d.includes("여자") || d.includes("여성") || d.includes("사람") || d.includes("한국") || d.includes("woman") || d.includes("girl") || d.includes("인물")) {
      return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80";
    }
    if (d.includes("la") || d.includes("로스앤젤레스") || d.includes("산타모니카") || d.includes("할리우드")) {
      return "https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=1200&q=80";
    }
    if (d.includes("시드니") || d.includes("오페라") || d.includes("호주")) {
      return "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80";
    }
    if (d.includes("도쿄") || d.includes("일본") || d.includes("시부야") || d.includes("교토") || d.includes("오사카")) {
      return "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80";
    }
    if (d.includes("스위스") || d.includes("알프스") || d.includes("융프라우") || d.includes("설산") || d.includes("mountain")) {
      return "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80";
    }
    if (d.includes("발리") || d.includes("동남아") || d.includes("휴양지") || d.includes("리조트") || d.includes("수영장")) {
      return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80";
    }
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
  };

  // Popular presets mapped by blogging category
  const presetCategories = {
    travel: [
      { label: "파리 에펠탑 야경", value: "프랑스 파리 에펠탑 반짝이는 야경과 센강", detail: "반짝이는 조명의 에펠탑, 센강에 비치는 불빛, 낭만적인 밤하늘" },
      { label: "제주도 함덕해변", value: "제주도 함덕 에메랄드빛 해변과 야자수", detail: "에메랄드빛 투명한 바다, 부드러운 백사장, 흔들리는 푸른 야자수" },
      { label: "LA 산타모니카", value: "미국 LA 산타모니카 피어 붉은 노을과 관람차", detail: "태평양의 아름다운 일몰, 붉게 타오르는 하늘, 화려한 관람차 실루엣" },
      { label: "도쿄 시부야 거리", value: "일본 도쿄 시부야 네온사인 거리와 카페", detail: "네온사인이 반짝이는 거리, 횡단보도를 건너는 사람들, 시티 라이트" },
      { label: "스위스 융프라우", value: "스위스 알프스 융프라우 만년설과 푸른 초원", detail: "설산 융프라우 봉우리, 푸른 잔디와 야생화, 깨끗한 햇살" },
      { label: "발리 우붓 리조트", value: "인도네시아 발리 우붓 열대 우림 인피니티 풀", detail: "울창한 정글 숲, 럭셔리 인피니티 풀, 평화롭고 조용한 힐링 감성" },
    ],
    living: [
      { label: "북유럽 감성 거실", value: "cozy scandinavian style living room interior with warm wood plants", detail: "따뜻한 베이지 소파, 미니멀 목재 가구, 실내 반려식물, 은은한 간접 조명" },
      { label: "우드톤 주방 정리", value: "clean wood style kitchen drawer and shelves organizer minimal aesthetic", detail: "가지런히 수납된 세라믹 그릇, 깔끔한 원목 수저, 주방 인테리어 연출 사진" },
      { label: "화이트 침실 스타일링", value: "minimalist white aesthetic bedroom with warm morning sunbeam", detail: "깔끔한 화이트 베딩, 원목 협탁, 창가 사이로 부드럽게 쏟아지는 아침 햇살" },
      { label: "감성 데스크 셋업", value: "clean minimalist tech desk setup on wood table with plant decoration", detail: "화이트 무선 키보드, 아기자기한 데스크테리어 소품, 따뜻하고 깔끔한 업무 공간" },
    ],
    food: [
      { label: "감성 디저트 홈카페", value: "aesthetic minimal home cafe pouring milk into iced latte coffee", detail: "투명 유리컵에 담긴 아이스 카페라떼, 하얀 접시 위의 크로와상, 감성 카페 조명" },
      { label: "전통 한식 플레이팅", value: "premium traditional korean food tabletop dining styling with luxury dishes", detail: "단정하고 정갈한 한식 반찬, 정성 가득한 한 그릇 밥상, 정갈한 도자기 식기" },
      { label: "캠핑 모닥불 바베큐", value: "cozy rustic camping campfire bbq food grilling over live wood fire", detail: "캠핑장 모닥불에 구워지는 맛있는 고기 꼬치, 은은한 모닥불 불꽃, 야외 캠핑 감성" },
    ]
  };

  const styleOptions = [
    { label: "감성 시네마틱", desc: "영화의 한 장면 같은 색감과 깊이" },
    { label: "인스타 감성 스냅", desc: "밝고 화사한 인플루언서 스타일" },
    { label: "내셔널지오그래픽", desc: "생생하고 사실적인 자연 다큐멘터리" },
    { label: "빈티지 필름 35mm", desc: "따뜻한 아날로그 필름 그레인 질감" },
    { label: "미니멀 미학", desc: "단순하고 여백의 미가 돋보이는 구도" },
  ];

  const lightingOptions = [
    { label: "도시 야경", desc: "반짝이는 네온과 가로등 조명" },
    { label: "골든 아워 (일몰/일출)", desc: "따스한 황금빛 햇살과 부드러운 그림자" },
    { label: "화창한 한낮 햇살", desc: "맑고 깨끗한 자연광과 청명한 하늘" },
    { label: "안개 자욱한 새벽", desc: "신비롭고 몽환적인 은은한 빛" },
    { label: "블루 아워 (해질녘 직후)", desc: "하늘이 짙은 푸른빛으로 물드는 시간" },
  ];

  const aspectRatioOptions = [
    { label: "16:9 (블로그/유튜브)", value: "16:9" },
    { label: "4:3 (표준 사진)", value: "4:3" },
    { label: "1:1 (정사각형/인스타)", value: "1:1" },
    { label: "9:16 (릴스/숏폼)", value: "9:16" },
  ];

  const handleGenerate = async () => {
    if (!destination.trim()) {
      onShowToast("여행지 또는 피사체를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const promptText = `${destination}, ${style} style, ${lighting} lighting, ${viewAngle} perspective, ${customDetail}, photorealistic, ultra high resolution 8k, award winning travel photography`;

      const res = await fetch("/api/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          destination,
          count,
          style,
          lighting,
          aspectRatio,
        }),
      });

      const data = await res.json();

      if (data.images && Array.isArray(data.images)) {
        const newImgs: GeneratedImage[] = data.images.map((item: any, idx: number) => ({
          id: item.id || `img_${Date.now()}_${idx}`,
          imageUrl: item.imageUrl || item.url || getFallbackImage(destination),
          destination: item.destination || destination,
          style: item.style || style,
          lighting: item.lighting || lighting,
          aspectRatio: item.aspectRatio || aspectRatio,
          prompt: item.prompt || promptText,
          createdAt: item.createdAt || new Date().toISOString(),
        }));

        setRecentGeneratedImages(newImgs);

        // Auto persist all new images to Firestore and local gallery!
        if (onSaveImageToGallery) {
          for (const img of newImgs) {
            await onSaveImageToGallery(img);
          }
        }

        onShowToast(`🎉 AI 여행 사진 ${newImgs.length}장이 성공적으로 생성되어 갤러리(DB)에 자동 저장되었습니다!`);
      } else {
        throw new Error("No images returned");
      }
    } catch (err) {
      console.error(err);
      // Fallback images
      const fallbackUrl = getFallbackImage(destination);
      const fallbackImgs: GeneratedImage[] = Array.from({ length: count }).map((_, idx) => ({
        id: `img_fallback_${Date.now()}_${idx}`,
        imageUrl: fallbackUrl,
        destination,
        style,
        lighting,
        aspectRatio,
        prompt: destination,
        createdAt: new Date().toISOString(),
      }));

      setRecentGeneratedImages(fallbackImgs);

      if (onSaveImageToGallery) {
        for (const img of fallbackImgs) {
          await onSaveImageToGallery(img);
        }
      }

      onShowToast(`🎉 AI 여행 사진이 생성되어 갤러리 보관함에 저장되었습니다.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (url: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    onShowToast("📋 이미지 URL이 클립보드에 복사되었습니다!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (img: GeneratedImage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const link = document.createElement("a");
    link.href = img.imageUrl;
    link.download = `wanderlust_${img.destination.slice(0, 15)}_${Date.now()}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast("📥 사진 다운로드를 시작했습니다.");
  };

  const handleDelete = (img: GeneratedImage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setImageToDelete(img);
  };

  const handleConfirmDeleteImage = async () => {
    if (!imageToDelete) return;
    const targetId = imageToDelete.id;
    setImageToDelete(null);
    if (onDeleteImageFromGallery) {
      await onDeleteImageFromGallery(targetId);
    }
    setRecentGeneratedImages((prev) => prev.filter((img) => img.id !== targetId));
  };

  const handleConfirmClearAll = async () => {
    setIsClearingAll(false);
    if (onClearAllImagesFromGallery) {
      await onClearAllImagesFromGallery();
    }
    setRecentGeneratedImages([]);
  };

  const filteredGallery = galleryImages.filter((img) => {
    const term = gallerySearchTerm.toLowerCase();
    return (
      img.destination.toLowerCase().includes(term) ||
      img.style.toLowerCase().includes(term) ||
      img.lighting.toLowerCase().includes(term) ||
      (img.prompt && img.prompt.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header & Mode Switch Tabs */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <Camera className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              AI 멀티테마 블로그 스튜디오 & 갤러리 보관함
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            여행, 생활정보, 푸드, 인테리어 등 다채로운 주제의 고화질 감성 사진을 생성하고 작성 중인 포스트와 바로 연동해 보세요.
          </p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center bg-stone-100 p-1.5 rounded-2xl border border-stone-200 shrink-0">
          <button
            onClick={() => setActiveSubTab("create")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === "create"
                ? "bg-white text-orange-600 shadow-sm font-extrabold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>AI 사진 생성기</span>
          </button>

          <button
            onClick={() => setActiveSubTab("gallery")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
              activeSubTab === "gallery"
                ? "bg-white text-orange-600 shadow-sm font-extrabold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <FolderHeart className="w-4 h-4 text-rose-500" />
            <span>보관함 ({galleryImages.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: CREATE TAB */}
      {activeSubTab === "create" && (
        <div className="space-y-8 animate-fade-in">
          {/* Main Controls Card */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-stone-200/40">
            {/* Category Select Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-stone-700 block">
                📝 블로그 포스트 대주제 선택
              </label>
              <div className="flex items-center space-x-1.5 bg-stone-50 p-1.5 border border-stone-200 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("travel");
                    const target = presetCategories.travel[0];
                    setDestination(target.value);
                    setCustomDetail(target.detail);
                    onShowToast("✈️ 여행 테마가 선택되었습니다.");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    selectedCategory === "travel"
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/10"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  ✈️ 테마 여행 코스
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("living");
                    const target = presetCategories.living[0];
                    setDestination(target.value);
                    setCustomDetail(target.detail);
                    onShowToast("🏠 생활/살림 테마가 선택되었습니다.");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    selectedCategory === "living"
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/10"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  🏠 생활/살림 정보
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("food");
                    const target = presetCategories.food[0];
                    setDestination(target.value);
                    setCustomDetail(target.detail);
                    onShowToast("☕ 푸드/홈카페 테마가 선택되었습니다.");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    selectedCategory === "food"
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/10"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  ☕ 푸드/홈카페
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-stone-700 flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-orange-500" />
                <span>추천 고유 키워드 및 연출 프리셋</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {presetCategories[selectedCategory].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDestination(preset.value);
                      if (preset.detail) setCustomDetail(preset.detail);
                      onShowToast(`🎯 '${preset.label}' 연출 키워드가 즉시 세팅되었습니다.`);
                    }}
                    className={`text-xs px-3.5 py-2 rounded-xl border transition-all ${
                      destination === preset.value
                        ? "bg-orange-50 text-orange-600 border-orange-300 font-bold shadow-sm"
                        : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Input & Image Count */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 space-y-2">
                <label className="text-xs font-extrabold text-stone-800 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>핵심 대상 및 촬영하고 싶은 오브젝트/배경 (한국어/영문) *</span>
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="예: 깔끔한 원목 주방 수저 정리함, 화사한 에스프레소 추출 샷..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3.5 text-stone-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-stone-800 flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-orange-500" />
                  <span>생성 수량</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-stone-100 p-1 rounded-2xl border border-stone-200">
                  {[1, 2, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCount(num)}
                      className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                        count === num
                          ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      {num}장
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Styles & Lighting Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Photo Style */}
              <div className="space-y-2.5">
                <label className="text-xs font-extrabold text-stone-800 flex items-center space-x-1">
                  <Camera className="w-3.5 h-3.5 text-orange-500" />
                  <span>사진 감성 스타일</span>
                </label>
                <div className="space-y-1.5">
                  {styleOptions.map((opt) => (
                    <div
                      key={opt.label}
                      onClick={() => setStyle(opt.label)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        style === opt.label
                          ? "bg-orange-50 border-orange-400 font-bold shadow-sm text-orange-950"
                          : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">{opt.label}</p>
                        <p className="text-[11px] text-stone-500">{opt.desc}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          style === opt.label
                            ? "border-orange-500 bg-orange-500 text-white"
                            : "border-stone-300"
                        }`}
                      >
                        {style === opt.label && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lighting Conditions */}
              <div className="space-y-2.5">
                <label className="text-xs font-extrabold text-stone-800 flex items-center space-x-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>촬영 시간대 및 조명 연출</span>
                </label>
                <div className="space-y-1.5">
                  {lightingOptions.map((opt) => (
                    <div
                      key={opt.label}
                      onClick={() => setLighting(opt.label)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        lighting === opt.label
                          ? "bg-amber-50 border-amber-400 font-bold shadow-sm text-amber-950"
                          : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">{opt.label}</p>
                        <p className="text-[11px] text-stone-500">{opt.desc}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          lighting === opt.label
                            ? "border-amber-500 bg-amber-500 text-white"
                            : "border-stone-300"
                        }`}
                      >
                        {lighting === opt.label && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Aspect Ratio & Detail Prompt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-stone-800 flex items-center space-x-1">
                  <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                  <span>사진 비율 (Aspect Ratio)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {aspectRatioOptions.map((ratio) => (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        aspectRatio === ratio.value
                          ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                          : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-stone-800 flex items-center space-x-1">
                  <Sliders className="w-3.5 h-3.5 text-orange-500" />
                  <span>세부 연출 디테일 (선택)</span>
                </label>
                <input
                  type="text"
                  value={customDetail}
                  onChange={(e) => setCustomDetail(e.target.value)}
                  placeholder="예: 반짝이는 불빛, 푸른 하늘, 따뜻한 커피 한 잔..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Generate Action Button */}
            <div className="pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>고화질 감성 스냅 렌더링 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-200" />
                    <span>고화질 맞춤 감성 스냅 {count}장 생성하기</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading Animation Skeleton */}
          {loading && (
            <div className="bg-white border border-stone-200/80 rounded-3xl p-8 space-y-6 shadow-xl text-center animate-pulse">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <Camera className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900">
                  '{destination}' 현장 사진을 생성하고 있습니다
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  감성 스타일({style})과 {lighting}을 반영하여 최상의 화질로 렌더링 중입니다.
                </p>
              </div>
              <div
                className={`grid gap-4 ${
                  count === 1 ? "grid-cols-1" : count === 2 ? "grid-cols-2" : "grid-cols-4"
                }`}
              >
                {Array.from({ length: count }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-video bg-stone-100 rounded-2xl flex items-center justify-center text-stone-300"
                  >
                    <Camera className="w-6 h-6 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Generated Images Output Gallery */}
          {recentGeneratedImages.length > 0 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl font-extrabold text-stone-900">
                    방금 생성된 AI 여행 사진 ({recentGeneratedImages.length}장)
                  </h2>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  클릭하여 확대하거나 블로그에 바로 연결하세요
                </span>
              </div>

              <div
                className={`grid gap-6 ${
                  recentGeneratedImages.length === 1
                    ? "grid-cols-1 max-w-2xl mx-auto"
                    : recentGeneratedImages.length === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1 sm:grid-cols-3"
                }`}
              >
                {recentGeneratedImages.map((img, index) => (
                  <div
                    key={img.id}
                    className="bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-xl shadow-stone-200/40 flex flex-col justify-between group hover:border-orange-300 transition-all"
                  >
                    {/* Image Container */}
                    <div
                      className="relative overflow-hidden bg-stone-100 cursor-pointer min-h-[240px] flex items-center justify-center"
                      onClick={() => setSelectedImageForLightbox(img)}
                    >
                      <img
                        src={img.imageUrl}
                        alt={img.destination}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const fallback = getFallbackImage(img.destination);
                          if (e.currentTarget.src !== fallback) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-stone-900/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span>Photo #{index + 1}</span>
                      </div>
                      <button
                        onClick={() => setSelectedImageForLightbox(img)}
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white text-stone-800 p-2 rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        title="확대 보기"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Card Content & Meta */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-base font-extrabold text-stone-900 line-clamp-2">
                          {img.destination}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                          <span className="bg-orange-50 text-orange-600 font-bold px-2 py-0.5 rounded-md border border-orange-200">
                            #{img.style}
                          </span>
                          <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200">
                            #{img.lighting}
                          </span>
                          <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200">
                            {img.aspectRatio}
                          </span>
                        </div>
                      </div>

                      {/* Primary Action: Link to Blog Post */}
                      <button
                        type="button"
                        onClick={() => setSelectedImageForLink(img)}
                        className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-orange-500/20 active:scale-[0.98]"
                      >
                        <Link2 className="w-4 h-4" />
                        <span>🔗 블로그에 연결 / 커버로 등록</span>
                      </button>

                      {/* Secondary Actions Bar */}
                      <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2">
                        <button
                          onClick={(e) => handleDownload(img, e)}
                          className="py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 border border-stone-200"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>다운로드</span>
                        </button>

                        <button
                          onClick={(e) => handleCopyUrl(img.imageUrl, img.id, e)}
                          className="py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 border border-stone-200"
                        >
                          {copiedId === img.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">복사됨</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>URL 복사</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: GALLERY / ARCHIVE TAB */}
      {activeSubTab === "gallery" && (
        <div className="space-y-6 animate-fade-in">
          {/* Search and stats bar */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={gallerySearchTerm}
                onChange={(e) => setGallerySearchTerm(e.target.value)}
                placeholder="여행지, 스타일, 태그 검색..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
              <span>
                총 <strong className="text-stone-900">{galleryImages.length}</strong>장의 사진이 DB에 저장되어 있습니다.
              </span>
              {galleryImages.length > 0 && onClearAllImagesFromGallery && (
                <button
                  type="button"
                  onClick={() => setIsClearingAll(true)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1"
                  title="보관함 전체 비우기"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>보관함 비우기</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveSubTab("create")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-sm flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>새 사진 생성</span>
              </button>
            </div>
          </div>

          {/* Gallery Image Grid */}
          {filteredGallery.length === 0 ? (
            <div className="bg-white border border-stone-200/80 rounded-3xl p-16 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-3xl flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-800">
                  {gallerySearchTerm ? "검색 조건에 맞는 사진이 없습니다." : "보관된 AI 여행 사진이 없습니다."}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  AI 사진 생성기에서 고화질 여행 사진을 만들어 보세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab("create")}
                className="inline-flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/20"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>지금 AI 사진 생성하기</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGallery.map((img) => (
                <div
                  key={img.id}
                  className="bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  {/* Photo Thumbnail */}
                  <div
                    className="relative overflow-hidden bg-stone-100 cursor-pointer aspect-video"
                    onClick={() => setSelectedImageForLightbox(img)}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.destination}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallback = getFallbackImage(img.destination);
                        if (e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Linked blog badge */}
                    {img.linkedBlogTitle && (
                      <div className="absolute bottom-2 left-2 bg-stone-900/85 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg truncate max-w-[90%] flex items-center space-x-1">
                        <Link2 className="w-3 h-3 text-orange-400 shrink-0" />
                        <span className="truncate">연결: {img.linkedBlogTitle}</span>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedImageForLightbox(img)}
                      className="absolute top-2 right-2 bg-white/90 text-stone-800 p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Photo Info */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-stone-900 line-clamp-1">
                        {img.destination}
                      </h4>
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium border border-orange-200">
                          #{img.style}
                        </span>
                        <span className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                          #{img.lighting}
                        </span>
                        <span className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                          {img.aspectRatio}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => setSelectedImageForLink(img)}
                        className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1"
                      >
                        <Link2 className="w-3.5 h-3.5 text-orange-500" />
                        <span>블로그에 연결</span>
                      </button>

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={(e) => handleDownload(img, e)}
                          className="py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-lg text-[11px] font-semibold border border-stone-200 flex items-center justify-center space-x-1"
                          title="다운로드"
                        >
                          <Download className="w-3 h-3" />
                          <span>저장</span>
                        </button>

                        <button
                          onClick={(e) => handleCopyUrl(img.imageUrl, img.id, e)}
                          className="py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-lg text-[11px] font-semibold border border-stone-200 flex items-center justify-center space-x-1"
                          title="URL 복사"
                        >
                          {copiedId === img.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>링크</span>
                        </button>

                        <button
                          onClick={(e) => handleDelete(img, e)}
                          className="py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[11px] font-semibold border border-rose-200 flex items-center justify-center space-x-1"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>삭제</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Single Photo Confirmation Modal */}
      {imageToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setImageToDelete(null)}
        >
          <div
            className="bg-white border border-stone-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-scale-up text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-stone-900">
                사진 삭제
              </h3>
              <p className="text-xs text-stone-500">
                '<strong className="text-stone-800">{imageToDelete.destination}</strong>' 사진을 보관함(DB)에서 삭제하시겠습니까?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setImageToDelete(null)}
                className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteImage}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/20"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Photos Confirmation Modal */}
      {isClearingAll && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsClearingAll(false)}
        >
          <div
            className="bg-white border border-stone-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-scale-up text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-stone-900">
                보관함 전체 비우기
              </h3>
              <p className="text-xs text-stone-500">
                보관함에 저장된 <strong className="text-rose-600">{galleryImages.length}장</strong>의 사진을 모두 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsClearingAll(false)}
                className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/20"
              >
                전체 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / High-Res Image Modal */}
      {selectedImageForLightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedImageForLightbox(null)}
        >
          <div
            className="bg-white border border-stone-200 rounded-3xl max-w-4xl w-full p-4 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden text-stone-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <h3 className="font-extrabold text-lg text-stone-900">
                  {selectedImageForLightbox.destination}
                </h3>
                <p className="text-xs text-stone-500">
                  스타일: {selectedImageForLightbox.style} | 조명: {selectedImageForLightbox.lighting}
                </p>
              </div>
              <button
                onClick={() => setSelectedImageForLightbox(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-stone-100 max-h-[65vh] flex items-center justify-center">
              <img
                src={selectedImageForLightbox.imageUrl}
                alt={selectedImageForLightbox.destination}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const fallback = getFallbackImage(selectedImageForLightbox.destination);
                  if (e.currentTarget.src !== fallback) {
                    e.currentTarget.src = fallback;
                  }
                }}
                className="w-full h-full object-contain max-h-[65vh]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between pt-2 gap-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) =>
                    handleCopyUrl(
                      selectedImageForLightbox.imageUrl,
                      selectedImageForLightbox.id,
                      e
                    )
                  }
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 border border-stone-200"
                >
                  <Copy className="w-4 h-4" />
                  <span>이미지 링크 복사</span>
                </button>

                <button
                  onClick={(e) => handleDownload(selectedImageForLightbox, e)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 border border-stone-200"
                >
                  <Download className="w-4 h-4" />
                  <span>다운로드</span>
                </button>
              </div>

              <button
                onClick={() => {
                  const targetImg = selectedImageForLightbox;
                  setSelectedImageForLightbox(null);
                  setSelectedImageForLink(targetImg);
                }}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl flex items-center space-x-1.5 shadow-md shadow-orange-500/20"
              >
                <Link2 className="w-4 h-4" />
                <span>🔗 이 사진을 블로그 글에 연결하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image-to-Blog Link Modal */}
      <ImageLinkModal
        isOpen={Boolean(selectedImageForLink)}
        onClose={() => setSelectedImageForLink(null)}
        image={selectedImageForLink}
        savedPosts={savedPosts}
        onSetAsCover={onSetImageAsCover}
        onSetAsSpot={onSetImageAsSpot}
        onInsertIntoContent={onInsertImageIntoContent}
        onCreateNewPostWithImage={onCreateNewPostWithImage}
      />
    </div>
  );
};
