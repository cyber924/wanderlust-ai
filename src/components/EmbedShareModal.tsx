import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Code2,
  FileText,
  Sparkles,
  Link,
  Info,
  CheckCircle2,
  Send,
} from "lucide-react";
import { BlogPost } from "../types";

interface EmbedShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: BlogPost | null;
  onShowToast: (msg: string) => void;
}

export const EmbedShareModal: React.FC<EmbedShareModalProps> = ({
  isOpen,
  onClose,
  post,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<"naver" | "tistory" | "markdown" | "link">("naver");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen || !post) return null;

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://wanderlust-ai.web.app";
  const shareUrl = `${currentOrigin}/#webzine-${post.id}`;

  // ----------------------------------------------------
  // HTML Snippet for Naver Blog & Rich Text Copy
  // ----------------------------------------------------
  const generateNaverRichHtml = () => {
    let itineraryHtml = "";
    (post.itinerary || []).forEach((dayItem) => {
      itineraryHtml += `
        <div style="margin: 24px 0 16px 0; padding: 12px 16px; background-color: #fff7ed; border-left: 4px solid #f97316; border-radius: 4px;">
          <h3 style="margin: 0; font-size: 17px; font-weight: bold; color: #c2410c;">📅 DAY ${dayItem.day}: ${dayItem.title}</h3>
        </div>
      `;
      (dayItem.activities || []).forEach((act) => {
        itineraryHtml += `
          <div style="margin-bottom: 20px; padding: 14px; background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px;">
            <p style="margin: 0 0 6px 0; font-size: 15px; font-weight: bold; color: #1c1917;">
              ${act.time ? `<span style="display:inline-block; padding: 2px 6px; font-size: 12px; background-color: #ffedd5; color: #c2410c; border-radius: 4px; margin-right: 6px;">${act.time}</span>` : ""}
              📍 ${act.spot}
            </p>
            <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.6; color: #44403c;">${act.description}</p>
            ${
              act.imageUrl
                ? `<div style="text-align: center; margin: 12px 0;">
                    <img src="${act.imageUrl}" alt="${act.spot}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);" />
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #78716c;">▲ ${act.spot} 현장 스냅</p>
                   </div>`
                : ""
            }
            ${
              act.tip
                ? `<div style="padding: 8px 12px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 6px; font-size: 13px; color: #854d0e;">
                    💡 <strong>꿀팁:</strong> ${act.tip}
                   </div>`
                : ""
            }
          </div>
        `;
      });
    });

    const tipsHtml =
      (post.travelTips || []).length > 0
        ? `<div style="margin: 28px 0; padding: 18px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px;">
            <h4 style="margin: 0 0 10px 0; font-size: 16px; color: #854d0e;">💡 에디터 추천 필수 체크 꿀팁</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.7; color: #713f12;">
              ${post.travelTips.map((t) => `<li>${t}</li>`).join("")}
            </ul>
           </div>`
        : "";

    // Brand Viral Backlink Banner Card
    const sourceBacklinkCard = `
      <div style="margin: 36px 0 20px 0; padding: 20px; background-color: #fffaf5; border: 2px dashed #f97316; border-radius: 12px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <p style="margin: 0 0 6px 0; font-size: 15px; font-weight: bold; color: #c2410c;">
          ✨ 이 여행기는 <strong>Wanderlust 웹진</strong>에서 발행되었습니다.
        </p>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #78716c;">
          AI 협업 맞춤형 여행 코스 & 고화질 스냅 매거진 (Pound CO.)
        </p>
        <a href="${shareUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 9px 20px; background-color: #f97316; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; border-radius: 8px; box-shadow: 0 2px 5px rgba(249,115,22,0.3);">
          Wanderlust 원본 코스 보러가기 ➔
        </a>
      </div>
    `;

    return `
      <div style="max-width: 720px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; color: #1c1917; line-height: 1.7;">
        ${
          post.coverImageUrl
            ? `<div style="text-align: center; margin-bottom: 24px;">
                <img src="${post.coverImageUrl}" alt="${post.title}" style="max-width: 100%; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
               </div>`
            : ""
        }
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px; color: #0c0a09; line-height: 1.4;">${post.title}</h1>
        <p style="font-size: 16px; color: #78716c; margin-bottom: 20px;">${post.subtitle}</p>
        <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
        ${itineraryHtml}
        ${tipsHtml}
        ${sourceBacklinkCard}
      </div>
    `;
  };

  // ----------------------------------------------------
  // Markdown Snippet with Backlink Attribution
  // ----------------------------------------------------
  const generateMarkdownSnippet = () => {
    let md = `# ${post.title}\n\n`;
    md += `> ${post.subtitle}\n\n`;

    if (post.coverImageUrl) {
      md += `![${post.title}](${post.coverImageUrl})\n\n`;
    }

    md += `## ✈️ 여행 개요\n`;
    md += `- **여행지 / 주제**: ${post.destination}\n`;
    md += `- **일정 / 소요**: ${post.duration}\n`;
    md += `- **컨셉**: ${post.concept}\n`;
    md += `- **예산**: ${post.budget}\n\n`;

    (post.itinerary || []).forEach((dayItem) => {
      md += `### 📅 DAY ${dayItem.day}: ${dayItem.title}\n\n`;
      (dayItem.activities || []).forEach((act) => {
        md += `#### 📍 ${act.time ? `[${act.time}] ` : ""}${act.spot}\n`;
        md += `${act.description}\n\n`;
        if (act.imageUrl) {
          md += `![${act.spot}](${act.imageUrl})\n*▲ ${act.spot} 현장 스냅*\n\n`;
        }
        if (act.tip) {
          md += `> 💡 **꿀팁**: ${act.tip}\n\n`;
        }
      });
    });

    if (post.travelTips && post.travelTips.length > 0) {
      md += `## 💡 에디터 추천 필수 꿀팁\n`;
      post.travelTips.forEach((tip) => {
        md += `- ${tip}\n`;
      });
      md += `\n`;
    }

    md += `---\n\n`;
    md += `> ✨ **출처**: [Wanderlust 웹진 - ${post.title}](${shareUrl})\n`;
    md += `> *AI 협업 맞춤형 여행 코스 & 라이프 매거진 (Pound CO.)*\n`;

    return md;
  };

  // ----------------------------------------------------
  // Copy Handlers
  // ----------------------------------------------------
  const handleCopyNaverRich = async () => {
    const htmlContent = generateNaverRichHtml();
    const textContent = `${post.title}\n\n${post.subtitle}\n\n출처: ${shareUrl}`;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([htmlContent], { type: "text/html" });
        const blobText = new Blob([textContent], { type: "text/plain" });
        const item = new ClipboardItem({
          "text/html": blobHtml,
          "text/plain": blobText,
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(htmlContent);
      }
      setCopiedType("naver");
      onShowToast("📋 네이버 블로그용 서식 및 출처 배너가 복사되었습니다! 스마트에디터에 Ctrl+V 하세요.");
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      // Fallback
      await navigator.clipboard.writeText(htmlContent);
      setCopiedType("naver");
      onShowToast("📋 서식 코드가 복사되었습니다!");
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleCopyTistoryHtml = async () => {
    const htmlContent = generateNaverRichHtml();
    await navigator.clipboard.writeText(htmlContent);
    setCopiedType("tistory");
    onShowToast("📋 티스토리 HTML 코드가 복사되었습니다! 에디터 HTML 모드에 붙여넣으세요.");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyMarkdown = async () => {
    const mdContent = generateMarkdownSnippet();
    await navigator.clipboard.writeText(mdContent);
    setCopiedType("markdown");
    onShowToast("📋 마크다운 서식과 백링크 출처가 복사되었습니다!");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopiedType("link");
    onShowToast("🔗 웹진 공유 링크가 복사되었습니다!");
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900 flex items-center gap-1.5">
                <span>블로그로 퍼가기 & 소스 복사</span>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                  출처 자동 동봉
                </span>
              </h3>
              <p className="text-xs text-stone-500 line-clamp-1">
                {post.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 bg-stone-100/60 px-4 pt-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("naver")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === "naver"
                ? "bg-white text-emerald-600 border-t-2 border-emerald-500 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>🟢 네이버 블로그 서식</span>
          </button>

          <button
            onClick={() => setActiveTab("tistory")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === "tistory"
                ? "bg-white text-orange-600 border-t-2 border-orange-500 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>🟠 티스토리 / HTML</span>
          </button>

          <button
            onClick={() => setActiveTab("markdown")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === "markdown"
                ? "bg-white text-stone-900 border-t-2 border-stone-800 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>마크다운 (MD)</span>
          </button>

          <button
            onClick={() => setActiveTab("link")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === "link"
                ? "bg-white text-blue-600 border-t-2 border-blue-500 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>웹진 단축 링크</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Naver Tab */}
          {activeTab === "naver" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-xs text-emerald-900">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">네이버 스마트에디터 ONE 전용 복사</p>
                  <p className="mt-0.5 text-emerald-700">
                    아래 버튼을 누른 후 네이버 블로그 글쓰기 창에서 <strong>Ctrl + V</strong>(붙여넣기)를 누르면 색상, 사진, 박스 서식과 <strong>Wanderlust AI 출처 배너</strong>가 그대로 붙여넣어집니다.
                  </p>
                </div>
              </div>

              <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/50 max-h-56 overflow-y-auto text-xs text-stone-700 space-y-2">
                <p className="font-bold text-stone-900 text-sm">📋 복사될 레이아웃 미리보기:</p>
                <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-2">
                  <div className="font-bold text-stone-900">{post.title}</div>
                  <div className="text-stone-500">{post.subtitle}</div>
                  <div className="p-2 bg-orange-50 text-orange-800 rounded text-[11px] font-semibold">
                    📅 DAY 1: 코스 일정 및 현장 스냅 사진 포함
                  </div>
                  <div className="p-2 bg-yellow-50 text-yellow-900 rounded text-[11px]">
                    💡 꿀팁 상자 및 상세 설명
                  </div>
                </div>
              </div>

              {/* Source Backlink Preview */}
              <div className="p-4 bg-orange-50/60 border border-dashed border-orange-300 rounded-2xl text-center space-y-1">
                <p className="text-xs font-bold text-orange-900 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>하단에 자동 삽입되는 고품격 출처 카드</span>
                </p>
                <p className="text-[11px] text-stone-600">
                  ✨ 이 여행기는 Wanderlust AI 웹진에서 발행되었습니다. (링크 포함)
                </p>
              </div>

              <button
                onClick={handleCopyNaverRich}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
              >
                {copiedType === "naver" ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-200" />
                    <span>네이버 블로그용 서식 복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>네이버 블로그용 전체 서식 복사하기</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tistory / HTML Tab */}
          {activeTab === "tistory" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-2xl flex items-start space-x-3 text-xs text-orange-900">
                <Code2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">티스토리 & 웹사이트 HTML 모드</p>
                  <p className="mt-0.5 text-orange-700">
                    티스토리 글쓰기 우측 상단 <strong>[기본모드 ➔ HTML]</strong>로 전환 후 코드를 붙여넣으시면 인라인 스타일이 적용된 잡지형 레이아웃이 완벽하게 렌더링됩니다.
                  </p>
                </div>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  value={generateNaverRichHtml()}
                  rows={8}
                  className="w-full font-mono text-xs p-3 bg-stone-900 text-stone-200 rounded-2xl border border-stone-700 focus:outline-none"
                />
              </div>

              <button
                onClick={handleCopyTistoryHtml}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
              >
                {copiedType === "tistory" ? (
                  <>
                    <Check className="w-5 h-5 text-orange-200" />
                    <span>HTML 소스코드 복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>HTML 소스코드 복사하기</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Markdown Tab */}
          {activeTab === "markdown" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-stone-100 border border-stone-200 rounded-2xl flex items-start space-x-3 text-xs text-stone-800">
                <FileText className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">마크다운(Markdown) 포맷</p>
                  <p className="mt-0.5 text-stone-600">
                    노션(Notion), 벨로그(Velog), 깃허브, 티스토리 마크다운 모드에 적합한 표준 마크다운과 백링크 출처가 복사됩니다.
                  </p>
                </div>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  value={generateMarkdownSnippet()}
                  rows={8}
                  className="w-full font-mono text-xs p-3 bg-stone-900 text-stone-200 rounded-2xl border border-stone-700 focus:outline-none"
                />
              </div>

              <button
                onClick={handleCopyMarkdown}
                className="w-full py-3.5 bg-stone-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
              >
                {copiedType === "markdown" ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span>마크다운 복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>마크다운 전체 복사하기</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Direct Link Tab */}
          {activeTab === "link" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start space-x-3 text-xs text-blue-900">
                <Link className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Wanderlust AI 웹진 공식 링크</p>
                  <p className="mt-0.5 text-blue-700">
                    로그인 없이도 누구나 이 멋진 여행기를 최고급 웹진 스타일로 감상할 수 있는 고유 링크입니다.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-4 py-3 bg-stone-100 border border-stone-200 rounded-2xl text-xs font-mono text-stone-800 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all flex items-center space-x-1.5 shrink-0 shadow-md shadow-blue-600/10"
                >
                  {copiedType === "link" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copiedType === "link" ? "복사됨" : "URL 복사"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>✨ Wanderlust AI 웹진 라이선스: 출처 표기 시 자유로운 활용 가능</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
