import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const app = express();

app.use(express.json({ limit: "10mb" }));

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
    const isNaverSeoTone =
      tone.includes("네이버") ||
      tone.includes("상위노출") ||
      tone.includes("스마트블록") ||
      tone.includes("C-Rank");

    const naverSeoRules = isNaverSeoTone
      ? `
[🔥 네이버 C-Rank & DIA+ 스마트블록 상위노출 최적화 핵심 지침]
1. 검색어 밀착형 제목: 타겟 메인 키워드를 제목 가장 앞부분에 배치하고, 22~28자 내외로 클릭하고 싶게 만드세요. (예: "[핵심정리] ${destination} 실전 가이드 & 필수 주의사항")
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

    const prompt = isLifeInfo
      ? `
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
1. 제목은 조회수를 유발하는 명확하고 유용한 포맷으로 지으세요. (예: "[살림꿀팁] 에어컨 전기세 50% 절약하는 실전 방법 TOP 5 💡")
2. 서론에서는 독자들의 공감을 자극하는 문제 상황과 이 글을 읽어야 하는 이유를 설명하세요.
3. 세부 단계별 핵심 노하우(Step 1, Step 2 또는 꿀팁 1, 꿀팁 2 등)를 구체적인 준비물, 실행 방법, 주의사항과 함께 정리하세요.
4. 본문(markdownContent)에는 마크다운 헤더(##, ###), 이모지, 체크리스트, 강조문표, 인용문(> ), 표 등을 활용하여 매우 가독성 높은 생활 블로그 글을 완성하세요.
5. 중간중간 이해를 돕는 이미지 삽입 위치에 [사진: 사진 설명 및 활용 팁] 가이드를 넣어주세요.
6. 실패 없는 실전 필수 체크포인트 및 자주 묻는 질문(FAQ) 꿀팁 리스트를 알차게 포함하세요.
7. 블로그 검색 노출을 위한 SEO 키워드 및 해시태그(#생활꿀팁 #살림노하우 등 8~12개)를 포함해주세요.
`
      : `
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
1. 제목은 검색 클릭을 유도하는 감성적이고 매력적인 포맷으로 지으세요. (예: "[제주 3박 4일] 에메랄드빛 바다와 숨은 감성 카페 투어 코스 총정리 ✨")
2. 서론에서는 해당 여행지의 매력과 여행을 떠나게 된 계기/분위기를 생생하게 전달하세요.
3. 일정별 코스(Day 1, Day 2 등)는 구체적인 시간대와 명소 이름, 꿀팁, 추천 포토존을 담으세요.
4. 본문(markdownContent)에는 마크다운 헤더(##, ###), 이모지, 인용문(> ), 강조, 체크리스트, 표 등을 활용하여 가독성이 뛰어난 네이버 블로그 스타일 글을 작성하세요.
5. 중간중간 사진이 들어갈 위치에 [사진: 사진 설명 및 포토존 팁] 과 같은 가이드를 넣어주세요.
6. 필수 여행 꿀팁(준비물, 교통편, Best 시즌, 예상 경비)을 알차게 정리해주세요.
7. 블로그 검색 노출을 위한 SEO 키워드 및 해시태그(#여행지 #감성여행 등 8~12개)를 포함해주세요.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: isLifeInfo
          ? "당신은 생활정보 전문 블로그 에디터입니다. 독자들이 바로 따라할 수 있는 가독성 뛰어난 생활 꿀팁 포스팅을 생성하세요. JSON 스키마 형식에 맞춰 정확한 JSON으로 반환해야 합니다."
          : "당신은 인기 블로그 에디터입니다. 읽기 쉽고 네이버 블로그/티스토리 스타일의 감성적이면서도 정보가 꽉 찬 풍부한 여행 글을 생성하세요. JSON 스키마 형식에 맞춰 정확한 JSON으로 반환해야 합니다.",
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
            budget: { type: Type.STRING, description: "예상 비용 (또는 비용 0원)" },
            season: { type: Type.STRING, description: "추천 시기 또는 유용한 계절" },
            seoDescription: { type: Type.STRING, description: "검색 엔진 노출용 요약글 (120자 내외)" },
            metaKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "주요 검색 키워드 목록",
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "추천 해시태그 (#으로 시작하는 단어들)",
            },
            itinerary: {
              type: Type.ARRAY,
              description: "단계별 실행 가이드 또는 일정별 코스",
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER, description: "순서 번호 (1, 2, 3...)" },
                  title: { type: Type.STRING, description: "해당 단계/일차 대표 타이틀" },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING, description: "소요시간 또는 권장 시간대" },
                        spot: { type: Type.STRING, description: "단계/항목/장소 이름" },
                        description: { type: Type.STRING, description: "상세 설명 및 실행 팁" },
                        tip: { type: Type.STRING, description: "핵심 주의사항 또는 꿀팁" },
                        photoPrompt: { type: Type.STRING, description: "이미지 생성을 위한 영문 프롬프트" },
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
              description: "실전 핵심 꿀팁/체크포인트 리스트",
            },
            markdownContent: {
              type: Type.STRING,
              description: "네이버/티스토리 블로그에 바로 복사/포스팅 가능한 본문 전체 마크다운 텍스트",
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
      errMsg =
        "Gemini API 키가 올바르지 않거나 등록되지 않았습니다. 환경변수 GEMINI_API_KEY를 확인해 주세요.";
    }
    res.status(500).json({
      success: false,
      error: errMsg,
    });
  }
});

// Helper to get guaranteed working high-resolution Unsplash photo based on destination
function getGuaranteedTravelPhoto(destination: string, index: number = 0): string {
  const d = (destination || "").toLowerCase();
  const photos = {
    paris: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=1200&q=80",
    ],
    jeju: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80",
    ],
    person: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80",
    ],
    la: [
      "https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80",
    ],
    sydney: [
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523428096881-5bd79d04300f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549180030-48bf079fb38a?auto=format&fit=crop&w=1200&q=80",
    ],
    tokyo: [
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    ],
    general: [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
    ],
  };

  let selectedGroup = photos.general;
  if (d.includes("파리") || d.includes("에펠") || d.includes("paris")) selectedGroup = photos.paris;
  else if (d.includes("제주") || d.includes("함덕") || d.includes("해변") || d.includes("바다") || d.includes("beach")) selectedGroup = photos.jeju;
  else if (d.includes("여자") || d.includes("여성") || d.includes("한국") || d.includes("사람") || d.includes("woman") || d.includes("girl")) selectedGroup = photos.person;
  else if (d.includes("la") || d.includes("로스앤젤레스") || d.includes("할리우드") || d.includes("산타모니카")) selectedGroup = photos.la;
  else if (d.includes("시드니") || d.includes("오페라") || d.includes("호주")) selectedGroup = photos.sydney;
  else if (d.includes("도쿄") || d.includes("일본") || d.includes("시부야")) selectedGroup = photos.tokyo;

  return selectedGroup[index % selectedGroup.length];
}

function translateKoreanPlaceToEnglish(korean: string): string {
  const k = (korean || "").trim();
  if (!k) return "beautiful travel destination";

  const dict: Record<string, string> = {
    "제주": "Jeju Island, South Korea, emerald ocean, tropical beach",
    "함덕": "Hamdeok Beach, Jeju Island, clear turquoise water, white sand",
    "함덕 해수욕장": "Hamdeok Beach, Jeju Island, clear turquoise water, white sand",
    "함덕해수욕장": "Hamdeok Beach, Jeju Island, clear turquoise water, white sand",
    "협재": "Hyeopjae Beach, Jeju Island, emerald sea",
    "성산일출봉": "Seongsan Ilchulbong Peak, Jeju Island",
    "우도": "Udo Island, Jeju, coastal view",
    "부산": "Busan Haeundae beach, South Korea, coastal city skyline",
    "해운대": "Haeundae Beach, Busan, ocean view",
    "광안리": "Gwangalli Beach, Busan, Gwangan Bridge night view",
    "서울": "Seoul city skyline, Namsan Tower, South Korea",
    "강릉": "Gangneung beach, Gangwon-do, South Korea, pine tree coast",
    "속초": "Sokcho beach, Seoraksan mountain, South Korea",
    "경주": "Gyeongju historical site, Hanok traditional Korean architecture",
    "전주": "Jeonju Hanok Village, traditional Korean houses",
    "여수": "Yeosu night ocean view, South Korea",
    "남해": "Namhae coastal landscape, South Korea",
  };

  for (const [key, val] of Object.entries(dict)) {
    if (k.includes(key)) {
      return val;
    }
  }

  if (k.includes("해수욕장") || k.includes("해변") || k.includes("바다")) {
    return `${k.replace(/[^\w\s]/gi, "")} beautiful ocean beach coast resort`;
  }
  if (k.includes("산") || k.includes("계곡")) {
    return `${k.replace(/[^\w\s]/gi, "")} scenic green mountain nature landscape`;
  }
  if (k.includes("카페") || k.includes("맛집")) {
    return "cozy aesthetic cafe interior, delicious food, travel vibe";
  }

  return `${k} travel destination landscape photo`;
}

async function createDetailedEnglishPrompt(
  ai: any,
  destination: string,
  style?: string,
  lighting?: string,
  viewAngle?: string,
  customDetail?: string
): Promise<string> {
  const fallbackEnglish = translateKoreanPlaceToEnglish(destination);
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Translate and convert this travel image request into a single clean English prompt for 4K travel photography:
Destination/Topic: ${destination}
Style: ${style || "Cinematic travel photography"}
Lighting: ${lighting || "Golden hour"}
View Angle: ${viewAngle || "Wide perspective"}
Custom Detail: ${customDetail || ""}

Output ONLY concise English keywords and short phrase, max 15 words, no punctuation quotes or brackets.`,
    });
    const translated = response.text?.trim().replace(/['"]/g, "");
    if (translated && translated.length > 5 && !/[가-힣]/.test(translated)) {
      return translated;
    }
  } catch (err) {
    console.warn("Failed to translate prompt to English, using local dictionary:", err);
  }
  return `${fallbackEnglish}, ${style || "Cinematic photography"}, ${lighting || "natural lighting"}`;
}

async function generateImageWithGeminiOrAI(
  ai: any,
  englishPrompt: string,
  destination: string,
  index: number = 0,
  aspectRatio: string = "16:9"
): Promise<string> {
  try {
    const seed = Math.floor(Math.random() * 800000) + 100000 + index * 99;
    const cleanPrompt = encodeURIComponent(
      englishPrompt.replace(/[^a-zA-Z0-9\s,]/g, "") || destination
    );
    if (cleanPrompt) {
      return `https://image.pollinations.ai/prompt/high%20quality%20photography%20${cleanPrompt}?nologo=true&seed=${seed}`;
    }
  } catch (err) {
    console.warn("Pollinations URL generation error:", err);
  }

  return getGuaranteedTravelPhoto(destination, index);
}

// API Route: Generate AI Photo for Blog (Single)
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, destination } = req.body;
    const targetText = destination || prompt || "Paris Eiffel Tower night view";
    const ai = getGenAI();

    const englishPrompt = await createDetailedEnglishPrompt(ai, targetText);
    const imageUrl = await generateImageWithGeminiOrAI(ai, englishPrompt, targetText, 0, "16:9");

    res.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    const safeText = req.body.destination || req.body.prompt || "Paris";
    res.json({
      success: true,
      imageUrl: getGuaranteedTravelPhoto(safeText, 0),
    });
  }
});

// API Route: Generate Multiple Travel Images (Count: 1~3)
app.post("/api/generate-images", async (req, res) => {
  try {
    const {
      destination = "파리 에펠탑 야경과 센강",
      style = "감성 시네마틱",
      lighting = "골든아워 노을",
      aspectRatio = "16:9",
      viewAngle = "파노라마 광각",
      customDetail = "",
      count = 1,
    } = req.body;

    const requestedCount = Math.min(Math.max(Number(count) || 1, 1), 3);
    const ai = getGenAI();

    const variations = [
      "wide panoramic view showing the scenery and atmosphere",
      "medium camera angle focusing on local atmosphere",
      "aesthetic perspective capturing romantic mood",
    ];

    const results: Array<{
      id: string;
      imageUrl: string;
      destination: string;
      style: string;
      lighting: string;
      aspectRatio: string;
      prompt: string;
      createdAt: string;
    }> = [];

    for (let i = 0; i < requestedCount; i++) {
      const variationText = variations[i % variations.length];
      const englishPrompt = await createDetailedEnglishPrompt(
        ai,
        destination,
        style,
        lighting,
        `${viewAngle}, ${variationText}`,
        customDetail
      );

      const imageUrl = await generateImageWithGeminiOrAI(
        ai,
        englishPrompt,
        destination,
        i,
        aspectRatio
      );

      results.push({
        id: `img_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
        imageUrl,
        destination,
        style,
        lighting,
        aspectRatio,
        prompt: englishPrompt,
        createdAt: new Date().toISOString(),
      });
    }

    res.json({ success: true, images: results });
  } catch (error: any) {
    console.error("Error in /api/generate-images:", error);
    res.status(500).json({
      success: false,
      error: error.message || "이미지 생성 중 오류가 발생했습니다.",
    });
  }
});

export default app;
