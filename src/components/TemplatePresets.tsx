import React from "react";
import { Sparkles, ArrowRight, Plane, Globe2, Compass } from "lucide-react";
import { TRAVEL_TEMPLATES } from "../lib/templates";
import { TravelTemplate } from "../types";

interface TemplatePresetsProps {
  onSelectTemplate: (template: TravelTemplate) => void;
}

export const TemplatePresets: React.FC<TemplatePresetsProps> = ({ onSelectTemplate }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Banner Header */}
      <div className="bg-white border border-stone-200/80 p-8 rounded-3xl shadow-xl shadow-stone-200/40 space-y-3">
        <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
          <Globe2 className="w-3.5 h-3.5 text-orange-500" />
          <span>인기 여행 블로그 템플릿 라이브러리</span>
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          클릭 한 번으로 즉시 고품질 블로그 생성
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          검증된 인기 여행지 템플릿을 선택하면 해당 코스, 키워드, 감성 어조가 자동으로 입력되어 AI 블로그 글이 즉시 생성됩니다.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TRAVEL_TEMPLATES.map((tmpl) => (
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
                <span className="text-xs bg-orange-50 border border-orange-200 text-orange-600 font-bold px-3 py-1 rounded-full">
                  {tmpl.duration}
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
