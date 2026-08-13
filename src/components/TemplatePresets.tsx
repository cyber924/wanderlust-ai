import React, { useState } from "react";
import { Sparkles, ArrowRight, Plane, Globe2, Compass, Zap } from "lucide-react";
import { TRAVEL_TEMPLATES } from "../lib/templates";
import { TravelTemplate } from "../types";

interface TemplatePresetsProps {
  onSelectTemplate: (template: TravelTemplate) => void;
}

export const TemplatePresets: React.FC<TemplatePresetsProps> = ({ onSelectTemplate }) => {
  const [filter, setFilter] = useState<"all" | "travel" | "life_info">("all");

  const filteredTemplates = TRAVEL_TEMPLATES.filter((tmpl) => {
    if (filter === "travel") return tmpl.categoryType === "travel";
    if (filter === "life_info") return tmpl.categoryType === "life_info";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Banner Header */}
      <div className="bg-white border border-stone-200/80 p-8 rounded-3xl shadow-xl shadow-stone-200/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
              <Globe2 className="w-3.5 h-3.5 text-orange-500" />
              <span>인기 블로그 템플릿 라이브러리</span>
            </div>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
              클릭 한 번으로 즉시 고품질 포스팅 생성
            </h1>
            <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
              검증된 인기 여행지 및 생활정보 템플릿을 선택하면 해당 주제와 꿀팁 키워드가 자동으로 세팅되어 완벽한 AI 글을 즉시 생성해 드립니다.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === "all"
                  ? "bg-white text-stone-900 shadow-sm border border-stone-200"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              전체보기
            </button>
            <button
              type="button"
              onClick={() => setFilter("travel")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === "travel"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              ✈️ 여행
            </button>
            <button
              type="button"
              onClick={() => setFilter("life_info")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === "life_info"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              💡 생활정보
            </button>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            onClick={() => onSelectTemplate(tmpl)}
            className="bg-white border border-stone-200/80 rounded-3xl p-6 space-y-4 hover:border-orange-300 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group shadow-xl shadow-stone-200/40"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-4xl p-2 bg-stone-50 rounded-2xl border border-stone-200 group-hover:scale-110 transition-transform">
                  {tmpl.icon}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  tmpl.categoryType === "life_info"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-orange-50 border-orange-200 text-orange-600"
                }`}>
                  {tmpl.categoryType === "life_info" ? "💡 생활정보" : "✈️ 여행"} · {tmpl.duration}
                </span>
              </div>

              <h3 className="text-lg font-bold text-stone-900 group-hover:text-orange-600 transition-colors leading-snug">
                {tmpl.title}
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                {tmpl.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {tmpl.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-lg border border-stone-200"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:text-orange-700">
              <span>이 템플릿으로 작성하기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
