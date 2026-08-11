import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI Client
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

  // API Route: Generate Travel Blog Post
  app.post("/api/generate-blog", async (req, res) => {
    try {
      const {
        destination,
        duration = "3박 4일",
        travelStyle = "감성 여행 및 맛집 투어",
        keywords = [],
        tone = "친근하고 감성적인 ~해요체",
        specificSpots = "",
        language = "한국어",
      } = req.body;

      if (!destination || typeof destination !== "string") {
        return res.status(400).json({ error: "여행지(destination)를 입력해주세요." });
      }

      const ai = getGenAI();

      const prompt = `
당신은 대한민국 최고의 전문 여행 블로거이자 여행 트렌드 에디터입니다.
다음 조건에 따라 네이버 블로그/티스토리 스타일의 생생하고 감성적이며 정보가 알찬 **여행 블로그 글**을 작성해주세요.

[입력 정보]
- 여행지/주제: ${destination}
- 여행 기간: ${duration}
- 여행 스타일: ${travelStyle}
- 주요 키워드/명소: ${keywords.join(", ")} ${specificSpots ? `(${specificSpots})` : ""}
- 문체 및 어조: ${tone}
- 작성 언어: ${language}

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
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "당신은 인기 블로그 에디터입니다. 읽기 쉽고 네이버 블로그/티스토리 스타일의 감성적이면서도 정보가 꽉 찬 풍부한 여행 글을 생성하세요. JSON 스키마 형식에 맞춰 정확한 JSON으로 반환해야 합니다.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "매력적인 블로그 제목" },
              subtitle: { type: Type.STRING, description: "감성적인 부제목 및 요약 문구" },
              destination: { type: Type.STRING, description: "여행지 명칭" },
              duration: { type: Type.STRING, description: "여행 일정" },
              concept: { type: Type.STRING, description: "여행 컨셉" },
              tone: { type: Type.STRING, description: "사용한 어조" },
              targetAudience: { type: Type.STRING, description: "추천 타겟 독자층" },
              budget: { type: Type.STRING, description: "예상 1인당 비용" },
              season: { type: Type.STRING, description: "추천 여행 계절" },
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
                description: "일정별 세부 코스",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER, description: "일차 (1, 2, 3...)" },
                    title: { type: Type.STRING, description: "해당 일차 대표 타이틀" },
                    activities: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING, description: "방문 시간대 (예: 10:00 AM)" },
                          spot: { type: Type.STRING, description: "장소/명소 이름" },
                          description: { type: Type.STRING, description: "장소 설명 및 솔직한 후기/느낌" },
                          tip: { type: Type.STRING, description: "꿀팁 또는 추천 메뉴/포토스팟" },
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
                description: "꼭 알아두어야 할 핵심 여행 꿀팁 리스트",
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
      res.status(500).json({
        success: false,
        error: error.message || "여행 블로그 생성 중 오류가 발생했습니다.",
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

  // Helper to convert Korean travel prompt to rich detailed English prompt for image models
  async function createDetailedEnglishPrompt(
    ai: any,
    destination: string,
    style?: string,
    lighting?: string,
    viewAngle?: string,
    customDetail?: string
  ): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Translate and convert this travel image request into a single clean English prompt for 4K travel photography:
Destination/Topic: ${destination}
Style: ${style || "Cinematic travel photography"}
Lighting: ${lighting || "Golden hour"}
View Angle: ${viewAngle || "Wide perspective"}
Custom Detail: ${customDetail || ""}

Output ONLY concise English keywords and short phrase, max 15 words, no punctuation quotes or brackets.`,
      });
      const translated = response.text?.trim().replace(/['"]/g, "");
      if (translated && translated.length > 5) {
        return translated;
      }
    } catch (err) {
      console.warn("Failed to translate prompt to English:", err);
    }
    return `4k travel photography of ${destination}`;
  }

  // Helper to generate image using Gemini or Pollinations with Unsplash Fallback
  async function generateImageWithGeminiOrAI(
    ai: any,
    englishPrompt: string,
    destination: string,
    index: number = 0,
    aspectRatio: string = "16:9"
  ): Promise<string> {
    const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    const targetAspect = validAspectRatios.includes(aspectRatio) ? aspectRatio : "16:9";

    // 1. Try official Gemini Image Generation model
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: `High resolution 4k travel photo: ${englishPrompt}` }],
        },
        config: {
          imageConfig: {
            aspectRatio: targetAspect as any,
          },
        },
      });

      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          }
        }
      }
    } catch (geminiErr) {
      console.warn("Gemini image generation model unavailable:", geminiErr);
    }

    // 2. Pollinations AI Clean URL
    try {
      const seed = Math.floor(Math.random() * 800000) + 100000 + index * 99;
      const cleanPrompt = encodeURIComponent(englishPrompt.replace(/[^a-zA-Z0-9\s,]/g, ""));
      return `https://image.pollinations.ai/prompt/${cleanPrompt}?nologo=true&seed=${seed}`;
    } catch (err) {
      console.warn("Pollinations URL generation error:", err);
    }

    // 3. Fallback to guaranteed Unsplash high-res photo matching destination
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

        const imageUrl = await generateImageWithGeminiOrAI(ai, englishPrompt, destination, i, aspectRatio);

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


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
