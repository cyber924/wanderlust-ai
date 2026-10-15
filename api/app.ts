import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { handleSitemap, handleRobots, handleBlogDetailPage, handleStaticPage } from "./seo.js";

dotenv.config();

export const app = express();

app.use(express.json({ limit: "10mb" }));

// 1. Static files
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));

// 2. SEO & SSR routes
app.get("/sitemap.xml", handleSitemap);
app.get("/robots.txt", handleRobots);
app.get("/blog/:id", (req, res) => handleBlogDetailPage(req, res));
app.get("/", (req, res, next) => {
  if (req.path === "/") {
    return handleStaticPage(req, res);
  }
  next();
});
app.get("/blog", (req, res) => handleStaticPage(req, res));

// Initialize Gemini AI Client dynamically
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "dummy-key",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Robust helper to call Gemini with latest recommended models (gemini-3.6-flash, gemini-3.8-flash, gemini-3.1-flash-lite)
async function generateContentWithFallback(ai: any, params: any) {
  const modelsToTry = ["gemini-3.6-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await ai.models.generateContent({
          ...params,
          model,
        });
        return res;
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || "";
        console.warn(`[Gemini] Model ${model} (attempt ${attempt + 1}) notice:`, msg.slice(0, 150));
        if (msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE")) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        } else {
          break;
        }
      }
    }
  }
  throw lastError;
}

// API Route: Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Wanderlust AI Travel Blog Generator" });
});

// API Route: Generate Travel / Life Info Blog Post
app.post("/api/generate-blog", async (req, res) => {
  try {
    const {
      categoryType = "travel",
      destination,
      duration = "3박 4일",
      travelStyle = "감성 여행 및 맛집 투어",
      keywords = [],
      tone = "친근하고 감성적인 ~해요체",
      specificSpots = "",
      targetAudience = "전체 독자층",
      language = "한국어",
    } = req.body;

    if (!destination || typeof destination !== "string") {
      return res.status(400).json({ error: "주제(destination)를 입력해주세요." });
    }

    const ai = getGenAI();

    const isLifeInfo = categoryType === "life_info";
    const isFood = categoryType === "food";
    const isTrend = categoryType === "trend";
    const isNaverSeoTone =
      tone.includes("네이버") ||
      tone.includes("상위노출") ||
      tone.includes("스마트블록") ||
      tone.includes("C-Rank");

    const naverSeoRules = isNaverSeoTone
      ? `
[🔥 네이버 C-Rank & DIA+ 스마트블록 상위노출 최적화 핵심 지침]
1. 검색어 밀착형 제목: 타겟 메인 키워드를 제목 가장 앞부분에 배치하고, 22~28자 내외로 클릭하고 싶게 만드세요.
2. DIA+ 실전 경험 가이드: 단순 사실 나열이 아닌 "직접 해보니...", "실제 경험을 바탕으로 뽑아본 가장 유용한 팁" 등 생생한 리얼스토리 어조를 녹이세요.
3. 스마트블록 소제목 구조화: 네이버 AI가 스마트블록 지수로 수집하도록 본문을 다음 4개 핵심 소제목 섹션으로 명확히 구분하세요:
   - ## 1. [핵심 요약] 한눈에 보는 핵심 개요
   - ## 2. [실전 가이드] 단계별 따라하기 & 실전 적용 노하우
   - ## 3. [비교 & 주의사항] 이것 모르면 손해보는 실수 방지 꿀팁
   - ## 4. [Q&A] 자주 묻는 질문 FAQ
4. 키워드 자연스러운 밀도 배치: 메인 키워드(${destination})를 본문 전체에 5~7회 자연스럽게 녹여내세요.
5. 가독성 극대화: 모바일 읽기에 최적화된 2~3줄 단위 문단, 핵심 포인트 볼드처리 및 마크다운 표/체크리스트를 아낌없이 사용하세요.
`
      : "";

    let prompt = "";
    let systemInstruction = "";

    if (isFood) {
      systemInstruction =
        "당신은 미식/맛집/카페 전문 파워블로거이자 푸드 칼럼니스트입니다. 시각과 미각을 자극하는 생생한 묘사와 실전 웨이팅/주차/메뉴 추천 팁이 담긴 최고급 네이버 블로그 스타일 글을 생성하세요. JSON 스키마 형식에 맞춰 정확한 JSON으로 반환해야 합니다.";
      prompt = `
당신은 대한민국 최고의 맛집 & 감성 카페 전문 파워블로거입니다.
다음 조건에 따라 네이버 블로그/인스타그램 스타일의 침샘을 자극하고 실전 유용한 **맛집/카페 탐방 블로그 글**을 작성해주세요.

[입력 정보]
- 맛집/카페 주제: ${destination}
- 방문 시간/코스: ${duration}
- 다이닝/카페 스타일: ${travelStyle}
- 주요 메뉴/키워드: ${keywords.join(", ")} ${specificSpots ? `(${specificSpots})` : ""}
- 문체 및 어조: ${tone}
- 작성 언어: ${language}
${naverSeoRules}

[작성 지침]
1. 제목: 검색 유입률이 높은 매력적인 포맷
2. 외관 & 인테리어 분위기: 매장 첫인상, 인테리어 무드, 좌석 간격 및 사진 잘 나오는 포토존 명당 묘사
3. 시그니처 메뉴 심층 리뷰: 한 입 베어 물었을 때의 식감, 맛의 밸런스, 비주얼, 곁들임 음료와의 조화 생생 묘사
4. 실전 방문 꿀팁 필수 포함: 오픈런/웨이팅 방법, 주차 가능 여부, 예약 팁, 추천 방문 시간대
5. 본문 마크다운 포맷팅: 마크다운 헤더(##, ###), 이모지, 인용구, 가격 및 메뉴 요약 표, 체크리스트 활용
6. 사진 가이드: [사진: 대표 시그니처 메뉴 클로즈업 사진] 등 적재적소에 가이드 삽입
7. SEO 키워드 및 해시태그(#맛집 #카페투어 등 8~12개) 포함
`;
    } else if (isTrend) {
      systemInstruction =
        "당신은 대한민국 최신 트렌드/핫플레이스/라이프스타일 전문 매거진 에디터입니다. 2030 세대가 열광하는 최신 유행과 문화의 핵심을 짚고 실전 참여 가이드를 전달하는 감각적인 블로그 글을 생성하세요. JSON 스키마 형식에 맞춰 정확한 JSON으로 반환해야 합니다.";
      prompt = `
당신은 트렌드를 가장 빠르게 읽는 핫이슈 & 라이프스타일 전문 에디터입니다.
다음 조건에 따라 네이버 블로그/매거진 스타일의 트렌디하고 흥미진진한 **최신 트렌드 블로그 글**을 작성해주세요.

[입력 정보]
- 트렌드 주제: ${destination}
- 소요 시간/일정: ${duration}
- 트렌드 테마: ${travelStyle}
- 핵심 키워드: ${keywords.join(", ")} ${specificSpots ? `(${specificSpots})` : ""}
- 문체 및 어조: ${tone}
- 작성 언어: ${language}
${naverSeoRules}

[작성 지침]
1. 제목: 트렌드 세터들의 클릭을 부르는 헤드라인
2. 왜 지금 이 트렌드가 뜨는가? 배경과 심리적/문화적 요인 분석
3. 실전 참여/체험 가이드: 초보자가 쉽게 시작하는 법, 준비물, 필수 체크리스트 및 추천 명소
4. 꿀팁 & 주의사항: 비용, 에티켓, 실패 없이 200% 즐기는 실전 노하우
5. 본문 마크다운: 마크다운 헤더(##, ###), 인용구, 이모지, 비교 표, 요약 박스 활용
6. 사진 가이드: [사진: 현장 열기 및 트렌디한 인증샷 연출 팁] 가이드 삽입
7. SEO 키워드 및 해시태그(#트렌드 #핫플레이스 등 8~12개) 포함
`;
    } else if (isLifeInfo) {
      systemInstruction =
        "당신은 생활정보 전문 블로그 에디터입니다. 독자들이 바로 따라할 수 있는 가독성 뛰어난 생활 꿀팁 포스팅을 생성하세요. JSON 스키마 형식에 맞춰 정확한 JSON으로 반환해야 합니다.";
      prompt = `
당신은 대한민국 최고의 생활정보, 실전 살림/절약/건강/IT 꿀팁 전문 에디터입니다.
다음 조건에 따라 네이버 블로그/티스토리 스타일의 실용적이고 따라 하기 쉬운 **생활정보 및 꿀팁 블로그 글**을 작성해주세요.

[입력 정보]
- 주요 주제/질문: ${destination}
- 생활 분야/카테고리: ${travelStyle}
- 주요 키워드/포인트: ${keywords.join(", ")} ${specificSpots ? `(${specificSpots})` : ""}
- 추천 타겟 독자: ${targetAudience}
- 문체 및 어조: ${tone}
- 작성 언어: ${language}
${naverSeoRules}

[작성 지침]
1. 제목은 조회수를 유발하는 명확하고 유용한 포맷으로 지으세요.
2. 서론에서는 독자들의 공감을 자극하는 문제 상황과 이 글을 읽어야 하는 이유를 설명하세요.
3. 세부 단계별 핵심 노하우(Step 1, Step 2 또는 꿀팁 1, 꿀팁 2 등)를 구체적인 준비물, 실행 방법, 주의사항과 함께 정리하세요.
4. 본문(markdownContent)에는 마크다운 헤더(##, ###), 이모지, 체크리스트, 강조문표, 인용문(> ), 표 등을 활용하여 매우 가독성 높은 생활 블로그 글을 완성하세요.
5. 중간중간 이해를 돕는 이미지 삽입 위치에 [사진: 사진 설명 및 활용 팁] 가이드를 넣어주세요.
6. 실패 없는 실전 필수 체크포인트 및 자주 묻는 질문(FAQ) 꿀팁 리스트를 알차게 포함하세요.
7. 블로그 검색 노출을 위한 SEO 키워드 및 해시태그(#생활꿀팁 #살림노하우 등 8~12개)를 포함해주세요.
`;
    } else {
      systemInstruction =
        "당신은 인기 여행 블로그 에디터입니다. 읽기 쉽고 네이버 블로그/티스토리 스타일의 감성적이면서도 정보가 꽉 찬 풍부한 여행 글을 생성하세요. JSON 스키마 형식에 맞춰 정확한 JSON으로 반환해야 합니다.";
      prompt = `
당신은 대한민국 최고의 전문 여행 블로거이자 여행 트렌드 에디터입니다.
다음 조건에 따라 네이버 블로그/티스토리 스타일의 생생하고 감성적이며 정보가 알찬 **여행 블로그 글**을 작성해주세요.

[입력 정보]
- 여행지/주제: ${destination}
- 여행 기간: ${duration}
- 여행 스타일: ${travelStyle}
- 주요 키워드/명소: ${keywords.join(", ")} ${specificSpots ? `(${specificSpots})` : ""}
- 문체 및 어조: ${tone}
- 작성 언어: ${language}
${naverSeoRules}

[작성 지침]
1. 제목은 검색 클릭을 유도하는 감성적이고 매력적인 포맷으로 지으세요.
2. 서론에서는 해당 여행지의 매력과 여행을 떠나게 된 계기/분위기를 생생하게 전달하세요.
3. 일정별 코스(Day 1, Day 2 등)는 구체적인 시간대와 명소 이름, 꿀팁, 추천 포토존을 담으세요.
4. 본문(markdownContent)에는 마크다운 헤더(##, ###), 이모지, 인용문(> ), 강조, 체크리스트, 표 등을 활용하여 가독성이 뛰어난 네이버 블로그 스타일 글을 작성하세요.
5. 중간중간 사진이 들어갈 위치에 [사진: 사진 설명 및 포토존 팁] 과 같은 가이드를 넣어주세요.
6. 필수 여행 꿀팁(준비물, 교통편, Best 시즌, 예상 경비)을 알차게 정리해주세요.
7. 블로그 검색 노출을 위한 SEO 키워드 및 해시태그(#여행지 #감성여행 등 8~12개)를 포함해주세요.
`;
    }

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "매력적인 블로그 제목" },
            subtitle: { type: Type.STRING, description: "부제목 및 핵심 요약 문구" },
            destination: { type: Type.STRING, description: "주제 또는 여행지 명칭" },
            duration: { type: Type.STRING, description: "소요시간 또는 일정" },
            concept: { type: Type.STRING, description: "테마 또는 컨셉" },
            tone: { type: Type.STRING, description: "사용한 어조" },
            targetAudience: { type: Type.STRING, description: "추천 타겟 독자층" },
            budget: { type: Type.STRING, description: "예상 비용" },
            season: { type: Type.STRING, description: "추천 시기 또는 유용한 계절" },
            seoDescription: { type: Type.STRING, description: "검색 엔진 노출용 요약글" },
            metaKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "주요 검색 키워드 목록",
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "추천 해시태그",
            },
            itinerary: {
              type: Type.ARRAY,
              description: "단계별 실행 가이드 또는 일정별 코스",
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER, description: "순서 번호" },
                  title: { type: Type.STRING, description: "타이틀" },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING, description: "시간대" },
                        spot: { type: Type.STRING, description: "장소 이름" },
                        description: { type: Type.STRING, description: "상세 설명" },
                        tip: { type: Type.STRING, description: "꿀팁" },
                        photoPrompt: { type: Type.STRING, description: "이미지 프롬프트" },
                      },
                      required: ["spot", "description"],
                    },
                  },
                },
                required: ["day", "title", "activities"],
              },
            },
            travelTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "실전 핵심 꿀팁 리스트",
            },
            markdownContent: {
              type: Type.STRING,
              description: "블로그 본문 전체 마크다운 텍스트",
            },
          },
          required: [
            "title",
            "subtitle",
            "destination",
            "duration",
            "metaKeywords",
            "hashtags",
            "itinerary",
            "travelTips",
            "markdownContent",
            "seoDescription",
          ],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("AI 응답을 받아오지 못했습니다.");
    }

    const blogData = JSON.parse(responseText);
    res.json({ success: true, data: blogData });
  } catch (error: any) {
    console.error("Error in /api/generate-blog:", error);
    let errMsg = error.message || "블로그 생성 중 오류가 발생했습니다.";
    if (
      errMsg.includes("API_KEY_INVALID") ||
      errMsg.includes("API key not valid") ||
      !process.env.GEMINI_API_KEY
    ) {
      errMsg = "Gemini API 키가 올바르지 않거나 등록되지 않았습니다.";
    }
    res.status(500).json({
      success: false,
      error: errMsg,
    });
  }
});

// API Route: Generate SNS Package
app.post("/api/generate-sns", async (req, res) => {
  try {
    const {
      topic,
      category = "travel",
      keywords = [],
      tone = "감성적이고 트렌디한 인플루언서 톤",
      targetAudience = "2030 트렌드 세터",
      selectedPlatforms = ["instagram", "threads"],
      sourceContent = "",
      sourceBlogId = "",
      sourceBlogTitle = "",
    } = req.body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({ error: "주제를 입력해주세요." });
    }

    const allPlatforms = ["instagram", "threads", "twitterX", "metaFacebook", "shortform"];
    let activePlatforms: string[] = Array.isArray(selectedPlatforms) && selectedPlatforms.length > 0
      ? selectedPlatforms.filter((p: string) => allPlatforms.includes(p))
      : ["instagram", "threads"];

    if (activePlatforms.length === 0) activePlatforms = ["instagram", "threads"];

    const ai = getGenAI();

    const platformInstructions: string[] = [];
    if (activePlatforms.includes("instagram")) {
      platformInstructions.push(`1. 인스타그램: cardSlides 4장 기획, caption, hashtags, callToAction 포함.`);
    }
    if (activePlatforms.includes("threads")) {
      platformInstructions.push(`2. 스레드: 3개 연속 타래 글 세트.`);
    }
    if (activePlatforms.includes("twitterX")) {
      platformInstructions.push(`3. X (트위터): 250자 이내 요약.`);
    }
    if (activePlatforms.includes("metaFacebook")) {
      platformInstructions.push(`4. 페이스북: 상세 설명문.`);
    }
    if (activePlatforms.includes("shortform")) {
      platformInstructions.push(`5. 숏폼 비디오: title, hook, scenes 구성.`);
    }

    const systemInstruction = `당신은 SNS 바이럴 마케팅 전문가입니다. 선택된 플랫폼([${activePlatforms.join(", ")}])에 최적화된 SNS 패키지를 JSON으로 생성하세요.`;
    const userPrompt = `주제: ${topic}, 카테고리: ${category}, 플랫폼: ${activePlatforms.join(", ")}`;

    const schemaProperties: any = {
      topic: { type: Type.STRING },
      category: { type: Type.STRING },
      targetAudience: { type: Type.STRING },
      keyMessage: { type: Type.STRING },
    };
    const requiredProps: string[] = ["topic", "targetAudience"];

    if (activePlatforms.includes("instagram")) {
      schemaProperties.instagram = {
        type: Type.OBJECT,
        properties: {
          caption: { type: Type.STRING },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          callToAction: { type: Type.STRING },
          cardSlides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                slideNumber: { type: Type.INTEGER },
                badge: { type: Type.STRING },
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                points: { type: Type.ARRAY, items: { type: Type.STRING } },
                footerNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
              },
              required: ["slideNumber", "title", "points"],
            },
          },
        },
        required: ["caption", "hashtags", "callToAction", "cardSlides"],
      };
      requiredProps.push("instagram");
    }

    if (activePlatforms.includes("threads")) {
      schemaProperties.threads = {
        type: Type.OBJECT,
        properties: { posts: { type: Type.ARRAY, items: { type: Type.STRING } } },
        required: ["posts"],
      };
      requiredProps.push("threads");
    }

    if (activePlatforms.includes("twitterX")) {
      schemaProperties.twitterX = {
        type: Type.OBJECT,
        properties: { tweet: { type: Type.STRING } },
        required: ["tweet"],
      };
      requiredProps.push("twitterX");
    }

    if (activePlatforms.includes("metaFacebook")) {
      schemaProperties.metaFacebook = {
        type: Type.OBJECT,
        properties: { post: { type: Type.STRING } },
        required: ["post"],
      };
      requiredProps.push("metaFacebook");
    }

    if (activePlatforms.includes("shortform")) {
      schemaProperties.shortform = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          hook: { type: Type.STRING },
          totalDurationSec: { type: Type.INTEGER },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNumber: { type: Type.INTEGER },
                timeRange: { type: Type.STRING },
                visualDirection: { type: Type.STRING },
                onScreenText: { type: Type.STRING },
                spokenScript: { type: Type.STRING },
              },
              required: ["sceneNumber", "timeRange", "visualDirection", "onScreenText", "spokenScript"],
            },
          },
        },
        required: ["title", "hook", "totalDurationSec", "scenes"],
      };
      requiredProps.push("shortform");
    }

    const response = await generateContentWithFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: schemaProperties,
          required: requiredProps,
        },
        temperature: 0.7,
      },
    });

    const responseText = response.text?.trim();
    if (!responseText) throw new Error("SNS 패키지 응답을 받지 못했습니다.");
    const snsData = JSON.parse(responseText);

    if (snsData.instagram && Array.isArray(snsData.instagram.cardSlides)) {
      snsData.instagram.cardSlides = snsData.instagram.cardSlides.map((slide: any, idx: number) => ({
        ...slide,
        imageUrl: `https://image.pollinations.ai/prompt/aesthetic%20photography%20${encodeURIComponent(slide.imagePrompt || topic)}?width=1080&height=1350&seed=${idx}&nologo=true&model=flux`,
      }));
    }

    res.json({ success: true, data: { id: `sns-${Date.now()}`, createdAt: new Date().toISOString(), sourceBlogId, sourceBlogTitle, selectedPlatforms: activePlatforms, ...snsData } });
  } catch (error: any) {
    console.error("Error in /api/generate-sns:", error);
    res.status(500).json({ success: false, error: error.message || "SNS 생성 오류" });
  }
});

// Image helper
function getGuaranteedTravelPhoto(destination: string, index: number = 0, width: number = 1200, height: number = 800): string {
  const photos = [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
  ];
  return photos[index % photos.length];
}

async function generateImageWithGeminiOrAI(ai: any, prompt: string, destination: string, index: number = 0, aspectRatio: string = "16:9"): Promise<string> {
  return getGuaranteedTravelPhoto(destination, index);
}

app.post("/api/generate-image", async (req, res) => {
  try {
    const { destination, prompt } = req.body;
    const target = destination || prompt || "Travel";
    const ai = getGenAI();
    const imageUrl = await generateImageWithGeminiOrAI(ai, target, target, 0);
    res.json({ success: true, imageUrl });
  } catch (err: any) {
    res.json({ success: true, imageUrl: getGuaranteedTravelPhoto("Travel", 0) });
  }
});

app.post("/api/generate-images", async (req, res) => {
  try {
    const { destination = "Travel", count = 1 } = req.body;
    const cnt = Math.min(Math.max(Number(count) || 1, 1), 3);
    const results = [];
    for (let i = 0; i < cnt; i++) {
      const url = getGuaranteedTravelPhoto(destination, i);
      results.push({
        id: `img_${Date.now()}_${i}`,
        imageUrl: url,
        url,
        destination,
        createdAt: new Date().toISOString(),
      });
    }
    res.json({ success: true, images: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/templates/recommend", async (_req, res) => {
  res.json({
    success: true,
    templates: [
      { id: "t1", title: "로맨틱 감성 여행 코스", category: "travel", description: "힐링 명소 추천", keywords: ["여행", "힐링"], travelStyle: "감성", duration: "2박 3일", icon: "✈️", reason: "인기 급상승 주제" },
      { id: "t2", title: "실속 만점 살림 꿀팁", category: "life_info", description: "10분 청소법", keywords: ["살림", "청소"], travelStyle: "실용", duration: "10분 컷", icon: "💡", reason: "조회수 보장 주제" },
    ]
  });
});

app.post("/api/generate-topics", async (_req, res) => {
  res.json({
    success: true,
    topics: [
      { id: "top-1", title: "가을 감성 힐링 여행지 추천", description: "인기 핫플", keywords: ["여행", "가을"], travelStyle: "감성", duration: "2박 3일" },
      { id: "top-2", title: "과탄산소다 욕실 청소법", description: "살림 꿀팁", keywords: ["살림", "청소"], travelStyle: "실용", duration: "10분" },
    ]
  });
});

app.get("/api/google-news", async (_req, res) => {
  res.json({
    success: true,
    articles: [
      { title: "2026 트렌드 키워드 분석 및 가을 시즌 시장 전망", link: "https://news.google.com", pubDate: "Tue, 15 Sep 2026 09:00:00 GMT", source: "Wanderlust AI" },
      { title: "인기 힐링 명소 및 인플루언서 핫플레이스 탐방", link: "https://news.google.com", pubDate: "Tue, 15 Sep 2026 08:30:00 GMT", source: "여행 매거진" },
    ]
  });
});

// Fallback catch-all for SPA client-side routing
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

export default app;
