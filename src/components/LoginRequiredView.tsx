import React from "react";
import {
  Lock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Database,
  Camera,
  PenTool,
  CheckCircle2,
  Globe2,
} from "lucide-react";

interface LoginRequiredViewProps {
  tabType: "generator" | "image-generator" | "posts" | "templates";
  categoryType?: "travel" | "life_info";
  onOpenAuth: () => void;
  onGoToWebzine: () => void;
}

export const LoginRequiredView: React.FC<LoginRequiredViewProps> = ({
  tabType,
  categoryType = "travel",
  onOpenAuth,
  onGoToWebzine,
}) => {
  const getContextInfo = () => {
    switch (tabType) {
      case "generator":
        return {
          badge: categoryType === "life_info" ? "💡 생활정보 글 생성기" : "✈️ 여행 블로그 글 생성기",
          title:
            categoryType === "life_info"
              ? "AI 협업 맞춤형 생활정보 꿀팁 작성"
              : "AI 협업 맞춤형 여행기 & 코스 작성",
          description:
            "목적지, 일정, 추천 맛집과 테마를 입력하면 네이버·티스토리 맞춤형 고품격 블로그 포스팅이 완성됩니다.",
          icon: <PenTool className="w-8 h-8 text-orange-500" />,
        };
      case "image-generator":
        return {
          badge: "📸 고화질 스냅사진 스튜디오",
          title: "AI 감성 여행 스냅사진 생성",
          description:
            "원하는 여행지의 계절, 분위기, 촬영 구도를 선택하여 블로그 본문용 고화질 감성 사진을 생성하고 글에 바로 삽입하세요.",
          icon: <Camera className="w-8 h-8 text-orange-500" />,
        };
      case "posts":
        return {
          badge: "📂 내 클라우드 DB 보관함",
          title: "나만의 글 & 스냅사진 보관소",
          description:
            "작성한 모든 여행기와 생활정보 글을 클라우드 DB에 안전하게 보관하고 언제든 수정, 삭제, 웹진 공개 발행을 관리할 수 있습니다.",
          icon: <Database className="w-8 h-8 text-orange-500" />,
        };
      default:
        return {
          badge: "✨ 크리에이터 전용 기능",
          title: "로그인 후 이용하실 수 있습니다",
          description: "Wanderlust의 모든 작성 및 생성 도구는 로그인 후 자유롭게 이용하실 수 있습니다.",
          icon: <Sparkles className="w-8 h-8 text-orange-500" />,
        };
    }
  };

  const info = getContextInfo();

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 animate-fade-in">
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xl overflow-hidden text-center p-6 sm:p-12 relative">
        {/* Decorative background circle */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

        {/* Lock / Feature Icon Header */}
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 bg-orange-50 border border-orange-200/70 rounded-3xl flex items-center justify-center shadow-md shadow-orange-500/10">
              {info.icon}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-stone-900 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full border border-orange-200/60">
              {info.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {info.title}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed">
              {info.description}
            </p>
          </div>

          {/* Member Benefits Box */}
          <div className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl p-5 my-6 text-left space-y-3">
            <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
              ✨ Wanderlust 회원 전용 혜택
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-700 font-medium">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>AI 협업 맞춤형 여행기 및 생활정보 글 무제한 생성</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>고화질 맞춤 감성 스냅사진 렌더링 & 본문 삽입</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>클라우드 DB 실시간 자동 저장 및 언제 어디서나 수정</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>공개 웹진 1클릭 발행 & 네이버/티스토리 소스 퍼가기</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md pt-2">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <span>⚡ 1초 간편 로그인 / 가입</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onGoToWebzine}
              className="w-full sm:w-auto bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center space-x-2 shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-orange-500" />
              <span>📖 공개 웹진 구경하기</span>
            </button>
          </div>

          <p className="text-[11px] text-stone-400 pt-2">
            * 웹진의 모든 여행기와 꿀팁은 로그인 없이도 자유롭게 열람 및 퍼가기가 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
};
