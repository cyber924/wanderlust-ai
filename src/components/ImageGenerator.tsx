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
} from "lucide-react";
import { GeneratedImage } from "../types";

interface ImageGeneratorProps {
  onShowToast: (msg: string) => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  onShowToast,
}) => {
  const [destination, setDestination] = useState("프랑스 파리 에펠탑 반짝이는 야경과 센강");
  const [count, setCount] = useState<number>(2); // Default 2 images
  const [style, setStyle] = useState("감성 시네마틱");
  const [lighting, setLighting] = useState("도시 야경");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [viewAngle, setViewAngle] = useState("파노라마 광각");
  const [customDetail, setCustomDetail] = useState("반짝이는 조명의 에펠탑, 센강에 비치는 불빛, 낭만적인 밤하늘");

  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getFallbackImage = (dest: string) => {
    const d = (dest || "").toLowerCase();
    if (d.includes("파리") || d.includes("에펠") || d.includes("paris")) {
      return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80";
    }
    if (d.includes("제주") || d.includes("함덕") || d.includes("해변") || d.includes("바다") || d.includes("beach")) {
      return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
    }
    if (d.includes("여자") || d.includes("여성") || d.includes("사람") || d.includes("한국") || d.includes("woman") || d.includes("girl")) {
      return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80";
    }
    if (d.includes("la") || d.includes("로스앤젤레스") || d.includes("산타모니카")) {
      return "https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=1200&q=80";
    }
    if (d.includes("시드니") || d.includes("오페라")) {
      return "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80";
    }
    if (d.includes("도쿄") || d.includes("일본") || d.includes("시부야")) {
      return "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80";
    }
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
  };

  // Popular destination presets
  const presets = [
    { label: "파리 에펠탑 야경", value: "프랑스 파리 에펠탑 반짝이는 야경과 센강" },
    { label: "제주도 함덕해변", value: "제주도 함덕 에메랄드빛 해변과 야자수" },
    { label: "LA 산타모니카", value: "미국 LA 산타모니카 피어 붉은 노을과 관람차" },
    { label: "도쿄 시부야 거리", value: "일본 도쿄 시부야 네온사인 거리와 카페" },
    { label: "발리 우붓 리조트", value: "발리 우붓 정글 뷰 수영장과 야자수 힐링" },
    { label: "시드니 오페라하우스", value: "호주 시드니 오페라하우스와 푸른 하버뷰" },
    { label: "스위스 융프라우", value: "스위스 알프스 융프라우 설산과 산악열차" },
  ];

  const styles = [
    { id: "감성 시네마틱", label: "🎬 시네마틱 영화", desc: "영화 같은 깊이감과 감성" },
    { id: "35mm 필름", label: "📸 35mm 필름", desc: "빈티지 아날로그 감성" },
    { id: "드론 항공샷", label: "🚁 드론 항공 샷", desc: "시원한 조감도 풍경" },
    { id: "프로 DSLR", label: "📷 프로 DSLR", desc: "선명하고 선명한 4K 화질" },
    { id: "인스타 감성", label: "🌅 인스타 스냅", desc: "트렌디한 라이프스타일" },
    { id: "수채화 일러스트", label: "🎨 수채화 아트", desc: "부드럽고 따뜻한 그림" },
  ];

  const lightings = [
    { id: "골든아워 노을", label: "🌇 골든아워 / 노을" },
    { id: "청량한 한낮", label: "☀️ 청량한 한낮 햇살" },
    { id: "도시 야경", label: "🌃 네온 도시 야경" },
    { id: "새벽 안개", label: "🌫️ 아침 새벽 안개" },
    { id: "비 오는 날", label: "🌦️ 감성 비 오는 날" },
  ];

  const viewAngles = [
    { id: "파노라마 광각", label: "🏔️ 파노라마 광각" },
    { id: "감성 디테일", label: "☕ 감성 디테일샷" },
    { id: "풍경 속 여행자", label: "🧍 풍경 속 여행자" },
  ];

  const aspectRatios = [
    { id: "16:9", label: "16 : 9", desc: "블로그 대표 가로형" },
    { id: "4:3", label: "4 : 3", desc: "스탠다드 사진" },
    { id: "1:1", label: "1 : 1", desc: "인스타그램 정사각형" },
    { id: "3:4", label: "3 : 4", desc: "스마트폰 세로형" },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      onShowToast("여행지 또는 촬영 장소를 입력해주세요!");
      return;
    }

    setLoading(true);
    setGeneratedImages([]);

    try {
      const response = await fetch("/api/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          count,
          style,
          lighting,
          aspectRatio,
          viewAngle,
          customDetail,
        }),
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (pErr) {
        throw new Error("서버 응답 오류가 발생했습니다.");
      }

      if (data.success && Array.isArray(data.images)) {
        setGeneratedImages(data.images);
        onShowToast(`🎉 AI 여행 사진 ${data.images.length}장이 성공적으로 생성되었습니다!`);
      } else {
        throw new Error(data.error || "이미지 생성 실패");
      }
    } catch (err: any) {
      console.error("Image generation error:", err);
      onShowToast("이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (url: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    onShowToast("📋 이미지 URL이 클립보드에 복사되었습니다!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = async (img: GeneratedImage, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (img.imageUrl.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = img.imageUrl;
        link.download = `wanderlust_${img.destination}_${img.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onShowToast("📥 이미지를 다운로드했습니다.");
      } else {
        const response = await fetch(img.imageUrl, { mode: "cors" }).catch(() => null);
        if (response && response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `wanderlust_${img.destination}_${img.id}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          onShowToast("📥 이미지를 성공적으로 다운로드했습니다.");
        } else {
          window.open(img.imageUrl, "_blank");
          onShowToast("📥 새 탭에서 이미지 다운로드를 시작합니다.");
        }
      }
    } catch (err) {
      window.open(img.imageUrl, "_blank");
      onShowToast("📥 이미지를 다운로드합니다.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Banner */}
      <div className="bg-white border border-stone-200/80 p-8 rounded-3xl shadow-xl shadow-stone-200/40 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
          <Camera className="w-3.5 h-3.5 text-orange-500" />
          <span>제미나이 3.6 & 3.1 Flash AI 초고화질 여행 사진 스튜디오</span>
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          AI 여행 이미지 생성기
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          원하는 여행지와 감성 스타일, 시간대, 화각 옵션을 선택하면 AI가 감성 넘치는 고품질 여행 스냅사진을 1~3장 즉시 생성해 드립니다.
        </p>
      </div>

      {/* Main Generator Form & Options */}
      <form onSubmit={handleGenerate} className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-stone-200/40">
        
        {/* Step 1: Destination & Presets */}
        <div className="space-y-3">
          <label className="block text-sm font-extrabold text-stone-900 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span>1. 여행지 / 촬영 장소</span>
          </label>

          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="예: 제주도 함덕 에메랄드빛 해변, 파리 에펠탑 야경..."
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all shadow-sm"
            required
          />

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs font-semibold text-stone-400 py-1 flex items-center gap-1">
              <Compass className="w-3 h-3 text-orange-400" />
              인기 장소:
            </span>
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setDestination(preset.value)}
                className="text-xs bg-stone-100 hover:bg-orange-50 text-stone-700 hover:text-orange-600 border border-stone-200/80 hover:border-orange-200 px-3 py-1.5 rounded-xl font-medium transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Image Count Selection (1 ~ 3) */}
        <div className="space-y-3">
          <label className="block text-sm font-extrabold text-stone-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-orange-500" />
              <span>2. 생성할 이미지 개수 (1~3개)</span>
            </div>
            <span className="text-xs text-orange-600 font-bold bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
              선택: {count}장
            </span>
          </label>

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCount(num)}
                className={`py-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all flex flex-col items-center justify-center space-y-1 ${
                  count === num
                    ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 scale-[1.02]"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/80"
                }`}
              >
                <span className="text-base">{num === 1 ? "📷 1장" : num === 2 ? "📸 2장" : "🖼️ 3장"}</span>
                <span className="text-[11px] opacity-80 font-normal">
                  {num === 1 ? "빠른 단일 생성" : num === 2 ? "추천 (다양한 각도)" : "최대 3장 갤러리"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Photo Style */}
        <div className="space-y-3">
          <label className="block text-sm font-extrabold text-stone-900 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-orange-500" />
            <span>3. 사진 스타일</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {styles.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStyle(item.id)}
                className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between space-y-1 ${
                  style === item.id
                    ? "bg-orange-50 border-orange-300 text-orange-700 font-bold shadow-sm"
                    : "bg-stone-50 hover:bg-stone-100/80 border-stone-200/80 text-stone-700"
                }`}
              >
                <span className="text-xs font-extrabold">{item.label}</span>
                <span className="text-[10px] text-stone-500">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Lighting & Time of Day */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-extrabold text-stone-900 flex items-center space-x-2">
              <Sun className="w-4 h-4 text-orange-500" />
              <span>4. 시간대 & 날씨 조명</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {lightings.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLighting(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    lighting === item.id
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/80"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Framing / View Angle */}
          <div className="space-y-3">
            <label className="block text-sm font-extrabold text-stone-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-orange-500" />
              <span>5. 구도 & 화각</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {viewAngles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setViewAngle(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    viewAngle === item.id
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/80"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 5: Aspect Ratio */}
        <div className="space-y-3">
          <label className="block text-sm font-extrabold text-stone-900 flex items-center space-x-2">
            <Maximize2 className="w-4 h-4 text-orange-500" />
            <span>6. 화면 비율</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {aspectRatios.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAspectRatio(item.id)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  aspectRatio === item.id
                    ? "bg-orange-50 border-orange-300 text-orange-700 font-bold"
                    : "bg-stone-50 hover:bg-stone-100 border-stone-200/80 text-stone-700"
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] text-stone-500">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 6: Custom Details */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-700">
            7. 세부 추가 연출 요구사항 (선택)
          </label>
          <textarea
            value={customDetail}
            onChange={(e) => setCustomDetail(e.target.value)}
            rows={2}
            placeholder="예: 피크닉 매트와 아메리카노, 에메랄드빛 바다, 하얀 파도..."
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-extrabold text-base shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>AI가 감성 여행 사진 {count}장을 생성 중입니다...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>✨ AI 여행 사진 {count}장 생성하기</span>
            </>
          )}
        </button>
      </form>

      {/* Loading Skeleton Indicator */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="flex items-center space-x-2 text-orange-600 font-bold text-sm bg-orange-50 border border-orange-200 p-4 rounded-2xl">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>구도와 노을 조명을 계산하여 AI 여행 스냅사진을 랜더링하는 중입니다...</span>
          </div>

          <div className={`grid gap-6 ${count === 1 ? "grid-cols-1 max-w-xl mx-auto" : count === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
            {Array.from({ length: count }).map((_, idx) => (
              <div key={idx} className="bg-stone-200/70 aspect-video rounded-3xl animate-pulse flex items-center justify-center text-stone-400">
                <Camera className="w-8 h-8 opacity-40 animate-bounce" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Images Output Gallery */}
      {generatedImages.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-extrabold text-stone-900">
                생성된 AI 여행 사진 갤러리 ({generatedImages.length}장)
              </h2>
            </div>
            <span className="text-xs text-stone-500 font-medium">
              클릭하여 원본을 확인하거나 블로그에 활용하세요
            </span>
          </div>

          <div
            className={`grid gap-6 ${
              generatedImages.length === 1
                ? "grid-cols-1 max-w-2xl mx-auto"
                : generatedImages.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {generatedImages.map((img, index) => (
              <div
                key={img.id}
                className="bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-xl shadow-stone-200/40 flex flex-col justify-between group hover:border-orange-300 transition-all"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden bg-stone-100 cursor-pointer min-h-[240px] flex items-center justify-center" onClick={() => setSelectedImage(img)}>
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
                    onClick={() => setSelectedImage(img)}
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

                  {/* Actions Bar - Simple & Clean */}
                  <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => handleDownload(img, e)}
                      className="py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-orange-500/20 active:scale-[0.98]"
                    >
                      <Download className="w-4 h-4" />
                      <span>사진 다운로드</span>
                    </button>

                    <button
                      onClick={(e) => handleCopyUrl(img.imageUrl, img.id, e)}
                      className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 border border-stone-200"
                    >
                      {copiedId === img.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">URL 복사됨</span>
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

      {/* Lightbox / High-Res Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in" onClick={() => setSelectedImage(null)}>
          <div className="bg-white border border-stone-200 rounded-3xl max-w-4xl w-full p-4 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden text-stone-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <h3 className="font-extrabold text-lg text-stone-900">{selectedImage.destination}</h3>
                <p className="text-xs text-stone-500">스타일: {selectedImage.style} | 조명: {selectedImage.lighting}</p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-stone-100 max-h-[70vh] flex items-center justify-center">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.destination}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const fallback = getFallbackImage(selectedImage.destination);
                  if (e.currentTarget.src !== fallback) {
                    e.currentTarget.src = fallback;
                  }
                }}
                className="w-full h-full object-contain max-h-[70vh]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={(e) => handleCopyUrl(selectedImage.imageUrl, selectedImage.id, e)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl flex items-center space-x-1"
              >
                <Copy className="w-4 h-4" />
                <span>이미지 링크 복사</span>
              </button>

              <button
                onClick={(e) => handleDownload(selectedImage, e)}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>고화질 이미지 다운로드</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
