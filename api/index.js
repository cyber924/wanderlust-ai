// src/server/app.ts
import express from "express";
import path3 from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// src/server/seo.ts
import fs2 from "fs";
import path2 from "path";

// src/server/db.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import fs from "fs";
import path from "path";

// src/data/webzineSampleArticles.ts
var SAMPLE_WEBZINE_ARTICLES = [
  {
    id: "webzine_paris_01",
    title: "\uB0AD\uB9CC\uC758 \uB3C4\uC2DC \uD30C\uB9AC 3\uBC15 4\uC77C, \uC13C\uAC15 \uC57C\uACBD\uACFC \uC228\uC740 \uACE8\uBAA9 \uCE74\uD398 \uC644\uBCBD \uC815\uBCF5",
    subtitle: "\uC5D0\uD3A0\uD0D1\uBD80\uD130 \uBABD\uB9C8\uB974\uD2B8\uB974\uAE4C\uC9C0, \uD604\uC9C0\uC778\uCC98\uB7FC \uC990\uAE30\uB294 \uB0AD\uB9CC \uAC10\uC131 \uD30C\uB9AC \uC5EC\uD589 \uCF54\uC2A4",
    destination: "\uD504\uB791\uC2A4 \uD30C\uB9AC (Paris)",
    duration: "3\uBC15 4\uC77C",
    concept: "\uB0AD\uB9CC \uC608\uC220 & \uC13C\uAC15 \uC57C\uACBD & \uACE8\uBAA9 \uBCA0\uC774\uCEE4\uB9AC \uD22C\uC5B4",
    tone: "\uAC10\uC131 \uC5D0\uC138\uC774 / \uCE5C\uADFC\uD55C \uC5EC\uD589 \uAC00\uC774\uB4DC",
    targetAudience: "\uCEE4\uD50C, \uB098\uD640\uB85C \uC5EC\uD589\uAC1D, 2030 \uC720\uB7FD \uBC30\uB0AD\uC5EC\uD589\uC790",
    budget: "1\uC778 \uC57D 120\uB9CC\uC6D0 (\uD56D\uACF5\uAD8C \uC81C\uC678)",
    season: "\uBD04 / \uAC00\uC744 \uCD94\uCC9C",
    categoryType: "travel",
    categoryName: "\uD574\uC678 \uAC10\uC131 \uC5EC\uD589",
    metaKeywords: ["\uD30C\uB9AC\uC5EC\uD589", "\uD30C\uB9AC3\uBC154\uC77C", "\uC5D0\uD3A0\uD0D1\uC57C\uACBD", "\uBABD\uB9C8\uB974\uD2B8\uB974", "\uC13C\uAC15\uD06C\uB8E8\uC988", "\uD30C\uB9AC\uCE74\uD398"],
    hashtags: ["#\uD30C\uB9AC\uC5EC\uD589", "#\uC5D0\uD3A0\uD0D1", "#\uC13C\uAC15\uC57C\uACBD", "#\uC720\uB7FD\uC5EC\uD589", "#\uD30C\uB9AC\uCE74\uD398", "#\uB0AD\uB9CC\uD30C\uB9AC"],
    coverImageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    views: 3420,
    likes: 284,
    status: "published",
    isPublic: true,
    authorName: "Wanderlust \uC5D0\uB514\uD130 Sophie",
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-08-20T10:00:00.000Z",
    seoDescription: "\uD504\uB791\uC2A4 \uD30C\uB9AC 3\uBC15 4\uC77C \uC644\uBCBD \uC5EC\uD589 \uCF54\uC2A4. \uC13C\uAC15 \uBC14\uD1A0\uBB34\uC288 \uC77C\uBAB0 \uD06C\uB8E8\uC988\uBD80\uD130 \uBABD\uB9C8\uB974\uD2B8\uB974 \uC5B8\uB355, \uB9C8\uB808\uC9C0\uAD6C \uBE48\uD2F0\uC9C0 \uC20D\uAE4C\uC9C0 \uD30C\uB9AC\uC758 \uAC10\uC131\uC744 \uC624\uB86F\uC774 \uB2F4\uC558\uC2B5\uB2C8\uB2E4.",
    travelTips: [
      "\uD30C\uB9AC \uC9C0\uD558\uCCA0(\uBA54\uD2B8\uB85C) \uD2F0\uCF13\uC740 Navigo Easy \uCE74\uB4DC\uB97C \uCDA9\uC804\uD558\uC5EC \uC0AC\uC6A9\uD558\uB294 \uAC83\uC774 \uAC00\uC7A5 \uACBD\uC81C\uC801\uC785\uB2C8\uB2E4.",
      "\uB8E8\uBE0C\uB974 \uBC15\uBB3C\uAD00\uACFC \uC624\uB974\uC138 \uBBF8\uC220\uAD00\uC740 \uACF5\uC2DD \uD648\uD398\uC774\uC9C0\uC5D0\uC11C \uCD5C\uC18C 2\uC8FC \uC804 \uC0AC\uC804 \uC2DC\uAC04 \uC608\uC57D\uC744 \uD544\uC218 \uAD8C\uC7A5\uD569\uB2C8\uB2E4.",
      "\uC18C\uB9E4\uCE58\uAE30 \uC608\uBC29\uC744 \uC704\uD574 \uC2A4\uB9C8\uD2B8\uD3F0 \uC2A4\uD2B8\uB7A9\uACFC \uC9C0\uD37C \uB2EC\uB9B0 \uD06C\uB85C\uC2A4\uBC31\uC744 \uAF2D \uCC59\uAE30\uC138\uC694."
    ],
    itinerary: [
      {
        day: 1,
        title: "\uD30C\uB9AC\uC758 \uCCAB\uC778\uC0C1, \uC13C\uAC15\uC758 \uB85C\uB9E8\uD2F1 \uC57C\uACBD \uC18D\uC73C\uB85C",
        activities: [
          {
            time: "\uC624\uD6C4 15:00",
            spot: "\uC0E4\uB97C \uB4DC\uACE8 \uACF5\uD56D \uB3C4\uCC29 \uBC0F \uB9C8\uB808\uC9C0\uAD6C \uC219\uC18C \uCCB4\uD06C\uC778",
            description: "\uD30C\uB9AC \uC2DC\uB0B4\uB85C RER B\uC120\uC744 \uD0C0\uACE0 \uC774\uB3D9\uD558\uC5EC \uB9C8\uB808\uC9C0\uAD6C \uAC10\uC131 \uC219\uC18C\uC5D0 \uC9D0\uC744 \uD480\uACE0 \uAC00\uBCBC\uC6B4 \uB9C8\uC74C\uC73C\uB85C \uCCAB \uD30C\uB9AC \uC0B0\uCC45\uC744 \uC2DC\uC791\uD569\uB2C8\uB2E4.",
            tip: "\uB9C8\uB808\uC9C0\uAD6C \uACE8\uBAA9\uC740 \uB3C4\uBCF4 \uC774\uB3D9\uC774 \uD3B8\uB9AC\uD558\uACE0 \uCE58\uC548\uC774 \uC88B\uC2B5\uB2C8\uB2E4.",
            imageUrl: "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "\uC624\uD6C4 17:30",
            spot: "\uB178\uD2B8\uB974\uB2F4 \uB300\uC131\uB2F9 \uC678\uAD00 & \uC13C\uAC15 \uAC15\uBCC0 \uC0B0\uCC45",
            description: "\uD30C\uB9AC\uC758 \uC2EC\uC7A5\uC778 \uC2DC\uD14C\uC12C\uC73C\uB85C \uC774\uB3D9\uD558\uC5EC \uACE0\uB515 \uC591\uC2DD\uC758 \uC6C5\uC7A5\uD568\uC744 \uB290\uB07C\uACE0, \uC13C\uAC15\uBCC0 \uC170\uC775\uC2A4\uD53C\uC5B4 \uC564 \uCEF4\uD37C\uB2C8 \uC11C\uC810 \uC55E\uC744 \uAC70\uB2D0\uC5B4 \uBD05\uB2C8\uB2E4.",
            tip: "\uAC15\uBCC0 \uACE0\uC11C\uC810(Bouquinistes)\uC5D0\uC11C \uBE48\uD2F0\uC9C0 \uD3EC\uC2A4\uD130 \uAD6C\uACBD\uC744 \uB193\uCE58\uC9C0 \uB9C8\uC138\uC694.",
            imageUrl: "https://images.unsplash.com/photo-1478358161113-b0e11994a36b?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "\uC800\uB141 19:30",
            spot: "\uC13C\uAC15 \uBC14\uD1A0\uBB34\uC288 \uC720\uB78C\uC120 \uD06C\uB8E8\uC988 (\uC77C\uBAB0 & \uC57C\uACBD)",
            description: "\uB178\uC744\uC774 \uC9C0\uB294 \uD669\uAE08\uBE5B \uC13C\uAC15 \uC704\uC5D0\uC11C \uC5D0\uD3A0\uD0D1\uC758 \uC815\uC2DC \uBC18\uC9DD\uC784(\uD654\uC774\uD2B8 \uC5D0\uD3A0)\uC744 \uAC15 \uC704\uC5D0\uC11C \uC870\uB9DD\uD558\uB294 \uD30C\uB9AC \uCD5C\uACE0\uC758 \uD558\uC774\uB77C\uC774\uD2B8\uC785\uB2C8\uB2E4.",
            tip: "\uC120\uC0C1 2\uCE35 \uB4A4\uCABD \uC790\uB9AC\uAC00 \uC0AC\uC9C4 \uBA85\uB2F9\uC785\uB2C8\uB2E4.",
            imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80"
          }
        ]
      },
      {
        day: 2,
        title: "\uC608\uC220\uACFC \uC5ED\uC0AC, \uADF8\uB9AC\uACE0 \uD30C\uB9AC\uC9C0\uC575\uC758 \uD2F0\uD0C0\uC784",
        activities: [
          {
            time: "\uC624\uC804 09:30",
            spot: "\uB8E8\uBE0C\uB974 \uBC15\uBB3C\uAD00 \uBAA8\uB098\uB9AC\uC790 & \uC720\uB9AC \uD53C\uB77C\uBBF8\uB4DC \uD22C\uC5B4",
            description: "\uC138\uACC4 \uCD5C\uB300\uC758 \uC608\uC220 \uBC15\uBB3C\uAD00\uC5D0\uC11C \uBAA8\uB098\uB9AC\uC790\uC640 \uBC00\uB85C\uC758 \uBE44\uB108\uC2A4\uB97C \uB9C8\uC8FC\uD558\uACE0, \uC2DC\uADF8\uB2C8\uCC98 \uC720\uB9AC \uD53C\uB77C\uBBF8\uB4DC \uC55E\uC5D0\uC11C \uC778\uC0DD\uC0F7\uC744 \uB0A8\uAE41\uB2C8\uB2E4.",
            tip: "\uC9C0\uD558\uCCA0 \uC5ED\uACFC \uBC14\uB85C \uC5F0\uACB0\uB418\uB294 \uCE74\uB8E8\uC824 \uC1FC\uD551\uBAB0 \uC785\uAD6C\uB85C \uC785\uC7A5\uD558\uBA74 \uB300\uAE30\uC904\uC774 \uD6E8\uC52C \uC9E7\uC2B5\uB2C8\uB2E4.",
            imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "\uC624\uD6C4 14:00",
            spot: "\uD288\uB974\uB9AC \uC815\uC6D0 \uBCA4\uCE58 \uD734\uC2DD & \uC548\uC824\uB9AC\uB098 \uC1FC\uCF5C\uB77C \uC1FC",
            description: "\uCD08\uB85D\uC0C9 \uD288\uB974\uB9AC \uCCA0\uC81C \uC758\uC790\uC5D0 \uC549\uC544 \uBD84\uC218\uB97C \uBC14\uB77C\uBCF4\uBA70 \uC9C4\uD55C \uD56B\uCD08\uCF5C\uB9BF\uACFC \uBABD\uBE14\uB791 \uB514\uC800\uD2B8\uB85C \uB2EC\uCF64\uD55C \uD30C\uB9AC\uC9C0\uC575 \uD734\uC2DD\uC744 \uB9CC\uB07D\uD569\uB2C8\uB2E4.",
            tip: "\uBD04~\uAC00\uC744\uC5D0\uB294 \uB0A0\uC528\uAC00 \uC88B\uC544 \uC57C\uC678 \uBCA4\uCE58 \uC790\uB9AC\uAC00 \uC778\uAE30 \uB9CC\uC810\uC785\uB2C8\uB2E4.",
            imageUrl: "https://images.unsplash.com/photo-1520939817895-060bdef4ad1b?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "\uC624\uD6C4 18:00",
            spot: "\uC5D0\uD3A0\uD0D1 \uD2B8\uB85C\uCE74\uB370\uB85C \uAD11\uC7A5 & \uC0F9\uB4DC\uB9C8\uB974\uC2A4 \uACF5\uC6D0 \uD53C\uD06C\uB2C9",
            description: "\uBC14\uAC8C\uD2B8\uC640 \uBE0C\uB9AC \uCE58\uC988, \uC640\uC778 \uD55C \uBCD1\uC744 \uC0AC\uB4E4\uACE0 \uC5D0\uD3A0\uD0D1 \uC794\uB514\uBC2D\uC5D0 \uB3D7\uC790\uB9AC\uB97C \uD3B4\uACE0 \uBD88\uBE5B\uC774 \uCF1C\uC9C0\uB294 \uC5D0\uD3A0\uD0D1\uC744 \uBC14\uB77C\uBD05\uB2C8\uB2E4.",
            tip: "\uC640\uC778 \uC624\uD504\uB108\uC640 \uC587\uC740 \uB3D7\uC790\uB9AC\uB97C \uBBF8\uB9AC \uCC59\uAE30\uC2DC\uBA74 \uC88B\uC2B5\uB2C8\uB2E4.",
            imageUrl: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=800&q=80"
          }
        ]
      },
      {
        day: 3,
        title: "\uBABD\uB9C8\uB974\uD2B8\uB974 \uC5B8\uB355\uC758 \uBCF4\uD5E4\uBBF8\uC548 \uAC10\uC131\uACFC \uB9C8\uB808 \uC1FC\uD551",
        activities: [
          {
            time: "\uC624\uC804 10:00",
            spot: "\uC0AC\uD06C\uB808\uCFA8\uB974 \uB300\uC131\uB2F9 & \uD14C\uB974\uD2B8\uB974 \uAD11\uC7A5 \uD654\uAC00 \uAC70\uB9AC",
            description: "\uD30C\uB9AC \uC2DC\uB0B4\uAC00 \uD55C\uB208\uC5D0 \uB0B4\uB824\uB2E4\uBCF4\uC774\uB294 \uBABD\uB9C8\uB974\uD2B8\uB974 \uC5B8\uB355 \uAF2D\uB300\uAE30\uC5D0\uC11C \uAC70\uB9AC\uC758 \uD654\uAC00\uB4E4\uC744 \uB9CC\uB098\uACE0 \uC0AC\uB791\uD574 \uBCBD(Le Mur des Je t'aime)\uC5D0\uC11C \uC0AC\uC9C4\uC744 \uCC0D\uC2B5\uB2C8\uB2E4.",
            tip: "\uC5B8\uB355 \uACC4\uB2E8 \uC624\uB974\uAE30 \uC804 \uD314\uCC0C \uAC15\uB9E4 \uC0C1\uC778\uC744 \uC870\uC2EC\uD558\uACE0 \uCF00\uC774\uBE14\uCE74(Funiculaire)\uB97C \uC774\uC6A9\uD558\uC138\uC694.",
            imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "\uC624\uD6C4 15:00",
            spot: "\uB9C8\uB808\uC9C0\uAD6C \uD3B8\uC9D1\uC20D & \uBA54\uB974\uC2DC(Merci) \uB77C\uC774\uD504\uC2A4\uD0C0\uC77C \uC20D",
            description: "\uAC10\uAC01\uC801\uC778 \uB85C\uCEEC \uBE0C\uB79C\uB4DC\uC640 \uBE48\uD2F0\uC9C0 \uC20D\uB4E4\uC774 \uC990\uBE44\uD55C \uB9C8\uB808 \uACE8\uBAA9\uC5D0\uC11C \uC1FC\uD551\uC744 \uC990\uAE30\uACE0 \uC720\uBA85\uD55C \uD314\uB77C\uD3A0 \uC0CC\uB4DC\uC704\uCE58\uB97C \uB9DB\uBD05\uB2C8\uB2E4.",
            tip: "\uBA54\uB974\uC2DC \uB9E4\uC7A5 \uC55E \uBE68\uAC04 \uBBF8\uB2C8 \uCFE0\uD37C \uC55E\uC5D0\uC11C \uC0AC\uC9C4\uC744 \uB0A8\uACA8\uBCF4\uC138\uC694.",
            imageUrl: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=800&q=80"
          }
        ]
      }
    ],
    markdownContent: `# \uB0AD\uB9CC\uC758 \uB3C4\uC2DC \uD30C\uB9AC 3\uBC15 4\uC77C, \uC13C\uAC15 \uC57C\uACBD\uACFC \uC228\uC740 \uACE8\uBAA9 \uCE74\uD398 \uC644\uBCBD \uC815\uBCF5

\uD504\uB791\uC2A4 \uD30C\uB9AC\uB294 \uC5B8\uC81C\uB098 \uC124\uB818\uC744 \uC8FC\uB294 \uB3C4\uC2DC\uC785\uB2C8\uB2E4. \uACE0\uB515 \uC131\uB2F9\uC758 \uC6C5\uC7A5\uD568\uACFC \uD669\uAE08\uBE5B \uAC00\uB85C\uB4F1, \uADF8\uB9AC\uACE0 \uACE8\uBAA9\uB9C8\uB2E4 \uD37C\uC9C0\uB294 \uACE0\uC18C\uD55C \uBC84\uD130 \uD06C\uB8E8\uC544\uC0C1 \uD5A5\uAE30\uAE4C\uC9C0. \uC774\uBC88 3\uBC15 4\uC77C \uCF54\uC2A4\uB294 \uC720\uBA85 \uB79C\uB4DC\uB9C8\uD06C\uC758 \uD575\uC2EC \uAD00\uB78C\uACFC \uD604\uC9C0 \uD30C\uB9AC\uC9C0\uC575\uC758 \uC5EC\uC720\uB97C \uBAA8\uB450 \uB2F4\uC558\uC2B5\uB2C8\uB2E4.

---

## \u{1F4C5} DAY 1: \uD30C\uB9AC\uC758 \uCCAB\uC778\uC0C1, \uC13C\uAC15\uC758 \uB85C\uB9E8\uD2F1 \uC57C\uACBD \uC18D\uC73C\uB85C
\uD30C\uB9AC\uC5D0 \uCCAB\uBC1C\uC744 \uB0B4\uB51B\uB294 \uB0A0, \uBB34\uB9AC\uD55C \uC77C\uC815 \uB300\uC2E0 \uC13C\uAC15\uC744 \uC911\uC2EC\uC73C\uB85C \uD30C\uB9AC\uC758 \uBD84\uC704\uAE30\uC5D0 \uC816\uC5B4\uB4ED\uB2C8\uB2E4.

### \u{1F4CD} \uC0E4\uB97C \uB4DC\uACE8 \uACF5\uD56D \uB3C4\uCC29 \uBC0F \uB9C8\uB808\uC9C0\uAD6C \uC219\uC18C \uCCB4\uD06C\uC778
\uACF5\uD56D\uC5D0\uC11C \uC2DC\uB0B4\uB85C \uC774\uB3D9 \uD6C4 \uB9C8\uB808\uC9C0\uAD6C\uC5D0 \uC9D0\uC744 \uD480\uC5C8\uC2B5\uB2C8\uB2E4. \uB9C8\uB808\uC9C0\uAD6C\uB294 \uBBF8\uC220\uAD00, \uCE74\uD398, \uB514\uC800\uD2B8 \uC20D\uC774 \uB3C4\uBCF4 \uAC70\uB9AC\uC5D0 \uC788\uC5B4 \uC5EC\uD589\uC758 \uAC70\uC810\uC73C\uB85C \uCD5C\uACE0\uC785\uB2C8\uB2E4.

### \u{1F4CD} \uB178\uD2B8\uB974\uB2F4 \uB300\uC131\uB2F9 & \uC13C\uAC15 \uC0B0\uCC45
\uC2DC\uD14C\uC12C\uC744 \uC911\uC2EC\uC73C\uB85C \uC13C\uAC15\uBCC0\uC744 \uAC70\uB2D0\uBA70 \uD30C\uB9AC\uC758 \uC720\uAD6C\uD55C \uC5ED\uC0AC\uB97C \uB290\uAEF4\uBD05\uB2C8\uB2E4. \uAC15\uBCC0 \uACE0\uC11C\uC810 '\uBD80\uD0A4\uB2C8\uC2A4\uD2B8'\uC5D0\uC11C \uBE48\uD2F0\uC9C0 \uC5FD\uC11C\uB97C \uAD6C\uACBD\uD558\uB294 \uC7AC\uBBF8\uB3C4 \uC3E0\uC3E0\uD569\uB2C8\uB2E4.

### \u{1F4CD} \uC13C\uAC15 \uBC14\uD1A0\uBB34\uC288 \uC720\uB78C\uC120 \uD06C\uB8E8\uC988
\uC77C\uBAB0 30\uBD84 \uC804 \uD0D1\uC2B9\uD558\uC5EC \uC624\uB80C\uC9C0\uBE5B \uB178\uC744\uACFC \uC815\uAC01\uC5D0 \uBC18\uC9DD\uC774\uB294 \uC5D0\uD3A0\uD0D1\uC758 \uBD88\uBE5B \uC1FC\uB97C \uAC10\uC0C1\uD588\uC2B5\uB2C8\uB2E4. \uD30C\uB9AC \uC5EC\uD589 \uC911 \uAC00\uC7A5 \uC78A\uC9C0 \uBABB\uD560 \uC21C\uAC04\uC785\uB2C8\uB2E4.

---

## \u{1F4C5} DAY 2: \uC608\uC220\uACFC \uC5ED\uC0AC, \uADF8\uB9AC\uACE0 \uD30C\uB9AC\uC9C0\uC575\uC758 \uD2F0\uD0C0\uC784
\uC138\uACC4 \uCD5C\uACE0\uC758 \uC608\uC220\uD488\uACFC \uD288\uB974\uB9AC \uC815\uC6D0\uC758 \uD3C9\uD654\uB85C\uC6C0\uC744 \uACBD\uD5D8\uD558\uB294 \uB0A0\uC785\uB2C8\uB2E4.

### \u{1F4CD} \uB8E8\uBE0C\uB974 \uBC15\uBB3C\uAD00 \uD22C\uC5B4
\uC720\uB9AC \uD53C\uB77C\uBBF8\uB4DC\uB97C \uC9C0\uB098 \uBAA8\uB098\uB9AC\uC790\uC640 \uC2B9\uB9AC\uC758 \uC5EC\uC2E0 \uB2C8\uCF00\uC0C1\uC744 \uB9C8\uC8FC\uD588\uC2B5\uB2C8\uB2E4. \uC0AC\uC804 \uC2DC\uAC04 \uC608\uC57D \uB355\uBD84\uC5D0 \uAE34 \uB300\uAE30 \uC5C6\uC774 \uC785\uC7A5\uD560 \uC218 \uC788\uC5C8\uC2B5\uB2C8\uB2E4.

### \u{1F4CD} \uD288\uB974\uB9AC \uC815\uC6D0 & \uC548\uC824\uB9AC\uB098 \uD2F0\uD0C0\uC784
\uC815\uC6D0\uC758 \uCD08\uB85D \uCCA0\uC81C \uC758\uC790\uC5D0 \uC549\uC544 \uD55C\uC228\uC744 \uB3CC\uB9AC\uACE0, \uC778\uADFC \uC548\uC824\uB9AC\uB098\uC5D0\uC11C \uC9C4\uD55C \uD56B\uCD08\uCF5C\uB9BF \uC1FC\uCF5C\uB77C \uC1FC\uB97C \uB9C8\uC2DC\uBA70 \uB2EC\uCF64\uD55C \uD734\uC2DD\uC744 \uB204\uB838\uC2B5\uB2C8\uB2E4.

### \u{1F4CD} \uC0F9\uB4DC\uB9C8\uB974\uC2A4 \uACF5\uC6D0 \uC5D0\uD3A0\uD0D1 \uD53C\uD06C\uB2C9
\uD574\uAC00 \uC800\uBB3C \uBB34\uB835, \uC640\uC778\uACFC \uBC14\uAC8C\uD2B8\uB97C \uB4E4\uACE0 \uC794\uB514\uBC2D\uC5D0\uC11C \uC62C\uB824\uB2E4\uBCF8 \uC5D0\uD3A0\uD0D1\uC740 \uD30C\uB9AC \uC5EC\uD589\uC758 \uB0AD\uB9CC\uC744 \uC815\uC810\uC73C\uB85C \uC774\uB04C\uC5B4\uC90D\uB2C8\uB2E4.

---

## \u{1F4A1} \uC5EC\uD589 \uAFC0\uD301 \uBAA8\uC74C
- **\uAD50\uD1B5**: \uB098\uBE44\uACE0 \uC774\uC9C0 \uCE74\uB4DC\uC5D0 10\uD68C\uAD8C(\uCE74\uB974\uB124)\uC744 \uCDA9\uC804\uD574 \uC0AC\uC6A9\uD558\uC138\uC694.
- **\uC608\uC57D**: \uB8E8\uBE0C\uB974\uC640 \uC624\uB974\uC138\uB294 \uCD5C\uC18C 2\uC8FC \uC804 \uACF5\uC2DD \uC0AC\uC774\uD2B8 \uC0AC\uC804 \uC608\uC57D\uC774 \uD544\uC218\uC785\uB2C8\uB2E4.
- **\uC548\uC804**: \uC18C\uB9E4\uCE58\uAE30 \uBC29\uC9C0\uB97C \uC704\uD574 \uAC00\uBC29\uC740 \uD56D\uC0C1 \uBAB8 \uC55E\uCABD\uC5D0 \uB450\uC138\uC694.`
  },
  {
    id: "webzine_tokyo_02",
    title: "\uB3C4\uCFC4 \uBBF8\uC2DD & \uACE8\uBAA9 \uAC10\uC131 3\uBC15 4\uC77C, \uC2DC\uBD80\uC57C\uBD80\uD130 \uB098\uCE74\uBA54\uAD6C\uB85C\uAE4C\uC9C0",
    subtitle: "\uD2B8\uB80C\uB514\uD55C \uD3B8\uC9D1\uC20D\uACFC \uB808\uD2B8\uB85C \uACE8\uBAA9 \uC774\uC790\uCE74\uC57C, \uB3C4\uCFC4\uC758 \uB0AE\uACFC \uBC24\uC744 \uC624\uB86F\uC774 \uAC77\uB2E4",
    destination: "\uC77C\uBCF8 \uB3C4\uCFC4 (Tokyo)",
    duration: "3\uBC15 4\uC77C",
    concept: "\uB3C4\uCFC4 \uBBF8\uC2DD \uD0D0\uBC29 & \uD3B8\uC9D1\uC20D \uC1FC\uD551 & \uB808\uD2B8\uB85C \uACE8\uBAA9 \uC57C\uACBD",
    tone: "\uD2B8\uB80C\uB514\uD55C \uC7A1\uC9C0 \uD1A4 / \uC2E4\uC6A9\uC801 \uB9DB\uC9D1 \uAC00\uC774\uB4DC",
    targetAudience: "2030 \uC790\uC720\uC5EC\uD589\uC790, \uBBF8\uC2DD\uAC00, \uD63C\uD589\uC871",
    budget: "1\uC778 \uC57D 80\uB9CC\uC6D0 (\uD56D\uACF5\uAD8C \uC81C\uC678)",
    season: "\uC0AC\uACC4\uC808 \uCD94\uCC9C (\uD2B9\uD788 \uBD04 \uBC9A\uAF43 \uC2DC\uC98C)",
    categoryType: "travel",
    categoryName: "\uD574\uC678 \uAC10\uC131 \uC5EC\uD589",
    metaKeywords: ["\uB3C4\uCFC4\uC5EC\uD589", "\uB3C4\uCFC43\uBC154\uC77C", "\uC2DC\uBD80\uC57C\uC2A4\uCE74\uC774", "\uB098\uCE74\uBA54\uAD6C\uB85C", "\uC2E0\uC8FC\uCFE0\uB9DB\uC9D1", "\uAE34\uC790"],
    hashtags: ["#\uB3C4\uCFC4\uC5EC\uD589", "#\uC2DC\uBD80\uC57C\uC2A4\uCE74\uC774", "#\uB098\uCE74\uBA54\uAD6C\uB85C", "#\uB3C4\uCFC4\uB9DB\uC9D1", "#\uC77C\uBCF8\uC790\uC720\uC5EC\uD589", "#\uB3C4\uCFC4\uACE8\uBAA9"],
    coverImageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
    views: 4190,
    likes: 352,
    status: "published",
    isPublic: true,
    authorName: "Wanderlust \uC5D0\uB514\uD130 Ken",
    createdAt: "2026-08-22T08:30:00.000Z",
    updatedAt: "2026-08-22T08:30:00.000Z",
    seoDescription: "\uB3C4\uCFC4 3\uBC15 4\uC77C \uC790\uC720\uC5EC\uD589 \uCF54\uC2A4 \uCD94\uCC9C. \uC2DC\uBD80\uC57C \uC2A4\uCE74\uC774 \uC804\uB9DD\uB300, \uB098\uCE74\uBA54\uAD6C\uB85C \uC6B4\uD558 \uAC10\uC131 \uCE74\uD398, \uC2E0\uC8FC\uCFE0 \uC624\uBAA8\uC774\uB370\uC694\uCF54\uCD08 \uC774\uC790\uCE74\uC57C\uAE4C\uC9C0 \uC54C\uCC28\uAC8C \uAD6C\uC131\uB41C \uBBF8\uC2DD \uAC10\uC131 \uB8E8\uD2B8.",
    travelTips: [
      "\uC2A4\uC774\uCE74(Suica) \uB610\uB294 \uD30C\uC2A4\uBAA8(Pasmo) \uAD50\uD1B5\uCE74\uB4DC\uB97C \uC544\uC774\uD3F0 \uC560\uD50C\uD398\uC774\uC5D0 \uB4F1\uB85D\uD558\uBA74 \uB9E4\uC6B0 \uD3B8\uB9AC\uD569\uB2C8\uB2E4.",
      "\uC2DC\uBD80\uC57C \uC2A4\uCE74\uC774 \uC77C\uBAB0 \uD0C0\uC784 \uC785\uC7A5\uAD8C\uC740 4\uC8FC \uC804 \uC624\uD508 \uB2F9\uC77C \uB9E4\uC9C4\uB418\uBBC0\uB85C \uC0AC\uC804 \uC608\uB9E4\uAC00 \uD544\uC218\uC785\uB2C8\uB2E4.",
      "\uB3C4\uCFC4 \uC9C0\uD558\uCCA0 \uD328\uC2A4(24/48/72\uC2DC\uAC04\uAD8C)\uB294 \uB3C4\uCFC4 \uBA54\uD2B8\uB85C\uC640 \uB3C4\uC5D0\uC774 \uC9C0\uD558\uCCA0 \uBB34\uC81C\uD55C \uD0D1\uC2B9\uC774 \uAC00\uB2A5\uD574 \uAC00\uC131\uBE44\uAC00 \uB6F0\uC5B4\uB0A9\uB2C8\uB2E4."
    ],
    itinerary: [
      {
        day: 1,
        title: "\uB3C4\uCFC4\uC758 \uC911\uC2EC, \uC2DC\uBD80\uC57C\uC758 \uD65C\uAE30\uC640 \uD658\uC0C1\uC801\uC778 \uB178\uC744",
        activities: [
          {
            time: "\uC624\uD6C4 15:30",
            spot: "\uC2DC\uBD80\uC57C \uC2A4\uD06C\uB7A8\uBE14 \uAD50\uCC28\uB85C & \uD558\uCE58\uCF54 \uAD11\uC7A5",
            description: "\uC804 \uC138\uACC4\uC5D0\uC11C \uAC00\uC7A5 \uBD84\uC8FC\uD55C \uC2A4\uD06C\uB7A8\uBE14 \uAD50\uCC28\uB85C\uB97C \uC9C1\uC811 \uAC74\uB108\uBA70 \uB3C4\uCFC4\uC758 \uC2EC\uC7A5\uBC15\uB3D9\uC744 \uB290\uAEF4\uBD05\uB2C8\uB2E4.",
            tip: "\uC2A4\uD0C0\uBC85\uC2A4 \uCE20\uD0C0\uC57C\uC810\uC774\uB098 \uB9C8\uADF8\uB137 \uC804\uB9DD\uB300\uC5D0\uC11C \uB0B4\uB824\uB2E4\uBCF4\uB294 \uBDF0\uAC00 \uBA4B\uC9D1\uB2C8\uB2E4.",
            imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "\uC624\uD6C4 17:30",
            spot: "\uC2DC\uBD80\uC57C \uC2A4\uCE74\uC774(SHIBUYA SKY) \uB8E8\uD504\uD0D1 \uC804\uB9DD\uB300",
            description: "\uC9C0\uC0C1 229m \uC625\uC0C1\uC5D0\uC11C \uB3C4\uCFC4 \uD0C0\uC6CC\uC640 \uD6C4\uC9C0\uC0B0 \uB2A5\uC120 \uB108\uBA38\uB85C \uD3BC\uCCD0\uC9C0\uB294 \uD30C\uB178\uB77C\uB9C8 \uC77C\uBAB0 \uC57C\uACBD\uC744 \uAC10\uC0C1\uD569\uB2C8\uB2E4.",
            tip: "\uC625\uC0C1\uC5D0\uB294 \uAC00\uBC29 \uBC18\uC785\uC774 \uBD88\uAC00\uD558\uBBC0\uB85C \uB77D\uCEE4\uC5D0 \uBCF4\uAD00\uD574\uC57C \uD569\uB2C8\uB2E4.",
            imageUrl: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80"
          }
        ]
      },
      {
        day: 2,
        title: "\uAC10\uC131 \uC6B4\uD558 \uACE8\uBAA9\uACFC \uD2B8\uB80C\uB514\uD55C \uD3B8\uC9D1\uC20D \uD22C\uC5B4",
        activities: [
          {
            time: "\uC624\uC804 11:00",
            spot: "\uB098\uCE74\uBA54\uAD6C\uB85C \uBA54\uAD6C\uB85C\uAC15 \uC6B4\uD558 & \uC2A4\uD0C0\uBC85\uC2A4 \uB9AC\uC800\uBE0C \uB85C\uC2A4\uD130\uB9AC",
            description: "\uC6B4\uD558\uB97C \uB530\uB77C \uB298\uC5B4\uC120 \uB85C\uCEEC \uBD80\uD2F0\uD06C\uB97C \uAD6C\uACBD\uD558\uACE0, \uC138\uACC4\uC801\uC778 \uADDC\uBAA8\uC758 \uC2A4\uD0C0\uBC85\uC2A4 \uB9AC\uC800\uBE0C \uB9E4\uC7A5\uC5D0\uC11C \uC2A4\uD398\uC15C\uD2F0 \uCEE4\uD53C\uB97C \uB9DB\uBD05\uB2C8\uB2E4.",
            tip: "3\uCE35 \uD14C\uB77C\uC2A4 \uC790\uB9AC\uC5D0\uC11C \uAC15\uBCC0 \uBDF0\uB97C \uAC10\uC0C1\uD574\uBCF4\uC138\uC694.",
            imageUrl: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "\uC624\uD6C4 15:00",
            spot: "\uB2E4\uC774\uCE78\uC57C\uB9C8 \uCE20\uD0C0\uC57C \uC11C\uC810 & T-SITE \uC0B0\uCC45",
            description: "\uC232\uC18D\uC5D0 \uC790\uB9AC \uC7A1\uC740 \uD504\uB9AC\uBBF8\uC5C4 \uC11C\uC810\uC5D0\uC11C \uAC74\uCD95\uBBF8\uB97C \uC990\uAE30\uACE0 \uB77C\uC774\uD504\uC2A4\uD0C0\uC77C \uC7A1\uC9C0\uC640 \uB514\uC790\uC778 \uC18C\uD488\uC744 \uB458\uB7EC\uBD05\uB2C8\uB2E4.",
            tip: "\uC778\uADFC \uC544\uAE30\uC790\uAE30\uD55C \uBE0C\uB7F0\uCE58 \uCE74\uD398\uB4E4\uC774 \uB9CE\uC2B5\uB2C8\uB2E4.",
            imageUrl: "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80"
          }
        ]
      }
    ],
    markdownContent: `# \uB3C4\uCFC4 \uBBF8\uC2DD & \uACE8\uBAA9 \uAC10\uC131 3\uBC15 4\uC77C \uC644\uBCBD \uAC00\uC774\uB4DC

\uD654\uB824\uD55C \uB124\uC628\uC0AC\uC778\uACFC \uACE0\uC988\uB109\uD55C \uACE8\uBAA9\uAE38\uC758 \uC815\uCDE8\uAC00 \uACF5\uC874\uD558\uB294 \uB3C4\uC2DC \uB3C4\uCFC4. \uD2B8\uB80C\uB4DC\uB97C \uC120\uB3C4\uD558\uB294 \uAC10\uC131 \uC20D\uACFC \uBBF8\uC290\uB7AD \uB77C\uBA58, \uB808\uD2B8\uB85C \uC57C\uACBD \uBA85\uC18C\uAE4C\uC9C0 3\uBC15 4\uC77C \uB3D9\uC548 \uC54C\uCC28\uAC8C \uC990\uAE38 \uC218 \uC788\uB294 \uC54C\uC9DC\uBC30\uAE30 \uB8E8\uD2B8\uB97C \uC18C\uAC1C\uD569\uB2C8\uB2E4.

## \u{1F4C5} \uD575\uC2EC \uC77C\uC815
- **DAY 1**: \uC2DC\uBD80\uC57C \uC2A4\uD06C\uB7A8\uBE14 \uAD50\uCC28\uB85C \u2794 \uC2DC\uBD80\uC57C \uC2A4\uCE74\uC774 \uC77C\uBAB0 \uC57C\uACBD \u2794 \uC2E0\uC8FC\uCFE0 \uACE8\uBAA9 \uB9DB\uC9D1
- **DAY 2**: \uB098\uCE74\uBA54\uAD6C\uB85C \uC6B4\uD558 \u2794 \uC2A4\uD0C0\uBC85\uC2A4 \uB9AC\uC800\uBE0C \uB85C\uC2A4\uD130\uB9AC \u2794 \uB2E4\uC774\uCE78\uC57C\uB9C8 \uCE20\uD0C0\uC57C \u2794 \uB86F\uD3F0\uAE30 \uD790\uC988
- **DAY 3**: \uC544\uC0AC\uCFE0\uC0AC \uC13C\uC18C\uC9C0 \u2794 \uAE34\uC790 \uBA85\uD488 \uAC70\uB9AC & \uBC31\uD654\uC810 \uB514\uC800\uD2B8 \u2794 \uC624\uB2E4\uC774\uBC14 \uC57C\uACBD

## \u{1F4A1} \uB3C4\uCFC4 \uC5EC\uD589 \uD544\uC218 \uCCB4\uD06C\uB9AC\uC2A4\uD2B8
1. \uAD50\uD1B5: \uC560\uD50C \uC9C0\uAC11\uC5D0 \uC2A4\uC774\uCE74 \uB4F1\uB85D\uD558\uAE30
2. \uC608\uC57D: \uC2DC\uBD80\uC57C \uC2A4\uCE74\uC774 \uBC0F \uC720\uBA85 \uC624\uB9C8\uCE74\uC138 \uC0AC\uC804 \uC608\uC57D \uD544\uC218
3. \uD658\uC804: \uCE74\uB4DC \uACB0\uC81C\uAC00 \uB300\uBD80\uBD84 \uAC00\uB2A5\uD558\uB098 \uC804\uD1B5 \uC2DC\uC7A5\uC774\uB098 \uC790\uD310\uAE30\uC6A9 \uC18C\uC561 \uC5D4\uD654 \uD604\uAE08 \uC900\uBE44`
  },
  {
    id: "webzine_jeju_03",
    title: "\uC81C\uC8FC \uC11C\uCABD \uC5D0\uBA54\uB784\uB4DC\uBE5B \uBC14\uB2E4 & \uC624\uB984 \uD790\uB9C1 2\uBC15 3\uC77C \uAC10\uC131 \uB85C\uB4DC",
    subtitle: "\uD611\uC7AC\uD574\uBCC0\uC758 \uC5D0\uBA54\uB784\uB4DC \uBB3C\uBE5B, \uAE08\uC624\uB984\uC758 \uD669\uAE08\uBE5B \uB178\uC744, \uB3CC\uB2F4\uAE38 \uC624\uC158\uBDF0 \uCE74\uD398 \uD22C\uC5B4",
    destination: "\uB300\uD55C\uBBFC\uAD6D \uC81C\uC8FC\uB3C4 \uC11C\uBD80 (\uC560\uC6D4\xB7\uD55C\uB9BC\xB7\uD55C\uACBD)",
    duration: "2\uBC15 3\uC77C",
    concept: "\uC624\uC158\uBDF0 \uD790\uB9C1 & \uB178\uC744 \uC624\uB984 & \uB85C\uCEEC \uD751\uB3FC\uC9C0 \uBBF8\uC2DD",
    tone: "\uD3B8\uC548\uD558\uACE0 \uB530\uB73B\uD55C \uAC10\uC131 \uD790\uB9C1 \uD1A4",
    targetAudience: "\uCEE4\uD50C, \uD790\uB9C1 \uC5EC\uD589\uC790, \uC6B0\uC815 \uC5EC\uD589",
    budget: "1\uC778 \uC57D 35\uB9CC\uC6D0 (\uB80C\uD130\uCE74 \uD3EC\uD568)",
    season: "\uBD04 / \uCD08\uC5EC\uB984 / \uAC00\uC744 \uAC15\uB825 \uCD94\uCC9C",
    categoryType: "travel",
    categoryName: "\uAD6D\uB0B4/\uC81C\uC8FC \uD790\uB9C1",
    metaKeywords: ["\uC81C\uC8FC\uB3C4\uC5EC\uD589", "\uC81C\uC8FC\uC11C\uCABD\uCF54\uC2A4", "\uD611\uC7AC\uD574\uC218\uC695\uC7A5", "\uAE08\uC624\uB984", "\uC560\uC6D4\uCE74\uD398", "\uC81C\uC8FC2\uBC153\uC77C"],
    hashtags: ["#\uC81C\uC8FC\uC5EC\uD589", "#\uD611\uC7AC\uD574\uBCC0", "#\uAE08\uC624\uB984", "#\uC560\uC6D4\uCE74\uD398", "#\uC81C\uC8FC\uAC10\uC131", "#\uAD6D\uB0B4\uC5EC\uD589"],
    coverImageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
    views: 2850,
    likes: 241,
    status: "published",
    isPublic: true,
    authorName: "Wanderlust \uB85C\uCEEC \uC5D0\uB514\uD130 \uC720\uC9C4",
    createdAt: "2026-08-23T14:15:00.000Z",
    updatedAt: "2026-08-23T14:15:00.000Z",
    seoDescription: "\uC81C\uC8FC\uB3C4 \uC11C\uCABD 2\uBC15 3\uC77C \uD790\uB9C1 \uCF54\uC2A4 \uC644\uBCBD \uAC00\uC774\uB4DC. \uD55C\uB2F4\uD574\uBCC0 \uC0B0\uCC45\uB85C\uBD80\uD130 \uD611\uC7AC \uBC14\uB2E4, \uAE08\uC624\uB984 \uB178\uC744, \uC2E0\uCC3D\uD48D\uCC28\uD574\uC548\uB3C4\uB85C \uB4DC\uB77C\uC774\uBE0C\uAE4C\uC9C0 \uAC10\uC131 \uAC00\uB4DD\uD55C \uC81C\uC8FC \uC5EC\uD589.",
    travelTips: [
      "\uB80C\uD130\uCE74\uB294 \uACF5\uD56D \uC154\uD2C0\uC774 \uBE60\uB978 \uB300\uD615 \uC5C5\uCCB4\uB97C \uC774\uC6A9\uD558\uACE0 \uC644\uC804\uC790\uCC28(\uC288\uD37C\uC790\uCC28) \uBCF4\uD5D8 \uAC00\uC785\uC744 \uAD8C\uC7A5\uD569\uB2C8\uB2E4.",
      "\uAE08\uC624\uB984\uC740 \uC77C\uBAB0 40\uBD84 \uC804 \uC62C\uB77C\uAC00\uC57C \uBD84\uD654\uAD6C \uB108\uBA38\uB85C \uB5A8\uC5B4\uC9C0\uB294 \uD669\uD640\uD55C \uBD89\uC740 \uB178\uC744\uC744 \uAC10\uC0C1\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      "\uC778\uAE30 \uD751\uB3FC\uC9C0 \uC2DD\uB2F9\uC740 '\uCE90\uCE58\uD14C\uC774\uBE14'\uC774\uB098 '\uD14C\uC774\uBE14\uB9C1' \uC571\uC73C\uB85C \uC6D0\uACA9 \uC904\uC11C\uAE30\uB97C \uD574\uB450\uBA74 \uB300\uAE30 \uC2DC\uAC04\uC744 \uB300\uD3ED \uC904\uC77C \uC218 \uC788\uC2B5\uB2C8\uB2E4."
    ],
    itinerary: [
      {
        day: 1,
        title: "\uC5D0\uBA54\uB784\uB4DC \uBC14\uB2E4\uC640 \uC560\uC6D4 \uD55C\uB2F4\uD574\uBCC0\uC758 \uC5EC\uC720",
        activities: [
          {
            time: "\uC624\uD6C4 14:00",
            spot: "\uC560\uC6D4 \uD55C\uB2F4\uD574\uBCC0 \uC0B0\uCC45\uB85C & \uD22C\uBA85 \uCE74\uC57D",
            description: "\uAC80\uC740 \uD604\uBB34\uC554\uACFC \uCCAD\uB7C9\uD55C \uC625\uBE5B \uBC14\uB2E4\uAC00 \uC5B4\uC6B0\uB7EC\uC9C4 \uD574\uC548 \uC0B0\uCC45\uB85C\uB97C \uAC77\uACE0 \uBC14\uB2E4 \uC704 \uD22C\uBA85 \uCE74\uC57D\uC744 \uCCB4\uD5D8\uD569\uB2C8\uB2E4.",
            tip: "\uD30C\uB3C4\uAC00 \uC794\uC794\uD55C \uB0A0\uC5D0\uB9CC \uCE74\uC57D \uC6B4\uD589\uC744 \uD558\uB2C8 \uC0AC\uC804 \uD655\uC778\uD558\uC138\uC694.",
            imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "\uC624\uD6C4 18:00",
            spot: "\uAE08\uC624\uB984 \uC77C\uBAB0 & \uBD84\uD654\uAD6C \uB2A5\uC120 \uC0B0\uCC45",
            description: "\uC57D 15\uBD84 \uC815\uB3C4 \uC624\uB974\uBA74 \uB9CC\uB0A0 \uC218 \uC788\uB294 \uBD84\uD654\uAD6C \uD638\uC218(\uC655\uB9E4)\uC640 \uC11C\uCABD \uBC14\uB2E4\uB85C \uC9C0\uB294 \uD669\uAE08\uBE5B \uB178\uC744\uC744 \uB9C8\uC8FC\uD569\uB2C8\uB2E4.",
            tip: "\uACBD\uC0AC\uAC00 \uC788\uC73C\uBBC0\uB85C \uD3B8\uC548\uD55C \uC6B4\uB3D9\uD654\uB97C \uCC29\uC6A9\uD558\uC138\uC694.",
            imageUrl: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=800&q=80"
          }
        ]
      }
    ],
    markdownContent: `# \uC81C\uC8FC \uC11C\uCABD \uC5D0\uBA54\uB784\uB4DC\uBE5B \uBC14\uB2E4 & \uC624\uB984 \uD790\uB9C1 2\uBC15 3\uC77C

\uB3C4\uC2DC\uC758 \uC18C\uC74C\uC5D0\uC11C \uBC97\uC5B4\uB098 \uD478\uB978 \uBC14\uB2E4\uC640 \uC194\uBC14\uB78C \uC18C\uB9AC\uAC00 \uAC00\uB4DD\uD55C \uC81C\uC8FC\uC758 \uC11C\uCABD\uC73C\uB85C \uB5A0\uB0A9\uB2C8\uB2E4. \uD22C\uBA85\uD55C \uD611\uC7AC \uBC14\uB2E4\uC640 \uBC14\uB78C\uC774 \uBA38\uBB34\uB294 \uC2E0\uCC3D\uD48D\uCC28\uD574\uC548\uB3C4\uB85C, \uADF8\uB9AC\uACE0 \uC624\uB984 \uC704\uC758 \uBD89\uC740 \uB178\uC744\uAE4C\uC9C0 \uB9C8\uC74C\uC774 \uD3B8\uC548\uD574\uC9C0\uB294 \uD790\uB9C1 \uCF54\uC2A4\uC785\uB2C8\uB2E4.`
  },
  {
    id: "webzine_life_cleaning_04",
    title: "\uC790\uCDE8\uC0DD & \uC8FC\uBD80 \uD544\uC218! \uACFC\uD0C4\uC0B0\uC18C\uB2E4 \uD558\uB098\uB85C \uB05D\uB0B4\uB294 10\uBD84 \uC695\uC2E4 \uC0B4\uB9BC \uCCAD\uC18C\uBC95",
    subtitle: "\uACF0\uD321\uC774, \uBB3C\uB54C, \uCC0C\uB4E0 \uB54C\uB97C \uD798\uB4E4\uC774\uC9C0 \uC54A\uACE0 \uD558\uC597\uAC8C \uBC15\uBA78\uD558\uB294 \uAC00\uC131\uBE44 100% \uC2E4\uC804 \uAFC0\uD301",
    destination: "\uC695\uC2E4 & \uC8FC\uBC29 \uC0B4\uB9BC \uB178\uD558\uC6B0",
    duration: "\uC18C\uC694\uC2DC\uAC04 10\uBD84",
    concept: "\uCE5C\uD658\uACBD \uC0B4\uB9BC \uAFC0\uD301 & \uCD08\uAC04\uB2E8 \uCCAD\uC18C \uBE44\uBC95",
    tone: "\uC2E4\uC804\uC801\uC774\uACE0 \uBA85\uCF8C\uD55C \uC0DD\uD65C\uC815\uBCF4 \uAC00\uC774\uB4DC",
    targetAudience: "1\uC778 \uAC00\uAD6C, \uC2E0\uD63C\uBD80\uBD80, \uC0B4\uB9BC \uCD08\uBCF4",
    budget: "\uBE44\uC6A9 \uC57D 3,000\uC6D0 (\uACFC\uD0C4\uC0B0\uC18C\uB2E4 1\uBD09\uC9C0)",
    season: "\uC0AC\uACC4\uC808 \uC720\uC6A9 (\uD2B9\uD788 \uC2B5\uD55C \uC5EC\uB984\uCCA0 / \uC7A5\uB9C8\uCCA0)",
    categoryType: "life_info",
    categoryName: "\uC0DD\uD65C/\uC0B4\uB9BC \uAFC0\uD301",
    metaKeywords: ["\uACFC\uD0C4\uC0B0\uC18C\uB2E4\uD65C\uC6A9\uBC95", "\uC695\uC2E4\uCCAD\uC18C\uAFC0\uD301", "\uD654\uC7A5\uC2E4\uBB3C\uB54C\uC81C\uAC70", "\uC790\uCDE8\uC0DD\uCCAD\uC18C", "\uC0B4\uB9BC\uB178\uD558\uC6B0"],
    hashtags: ["#\uC0B4\uB9BC\uAFC0\uD301", "#\uC695\uC2E4\uCCAD\uC18C", "#\uACFC\uD0C4\uC0B0\uC18C\uB2E4", "#\uC790\uCDE8\uAFC0\uD301", "#\uC0DD\uD65C\uC815\uBCF4", "#\uBB3C\uB54C\uC81C\uAC70"],
    coverImageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    views: 5230,
    likes: 489,
    status: "published",
    isPublic: true,
    authorName: "Wanderlust \uC0B4\uB9BC \uC5F0\uAD6C\uC18C",
    createdAt: "2026-08-24T09:00:00.000Z",
    updatedAt: "2026-08-24T09:00:00.000Z",
    seoDescription: "\uACFC\uD0C4\uC0B0\uC18C\uB2E4\uC640 \uB728\uAC70\uC6B4 \uBB3C\uC744 \uD65C\uC6A9\uD574 \uC695\uC2E4 \uD0C0\uC77C \uC904\uB208 \uACF0\uD321\uC774\uC640 \uC138\uBA74\uB300 \uBB3C\uB54C\uB97C \uD798\uB4E4\uC774\uC9C0 \uC54A\uACE0 10\uBD84 \uB9CC\uC5D0 \uC0C8\uAC83\uCC98\uB7FC \uCCAD\uC18C\uD558\uB294 \uCE5C\uD658\uACBD \uC0B4\uB9BC \uBE44\uBC95.",
    travelTips: [
      "\uACFC\uD0C4\uC0B0\uC18C\uB2E4\uB294 \uBC18\uB4DC\uC2DC 60\u2103 \uC774\uC0C1\uC758 \uB530\uB73B\uD55C \uC628\uC218\uB97C \uC0AC\uC6A9\uD574\uC57C \uAC70\uD488\uC774 \uD65C\uC131\uD654\uB418\uC5B4 \uCC0C\uB4E0 \uB54C\uAC00 \uBD84\uD574\uB429\uB2C8\uB2E4.",
      "\uBC1C\uC0DD\uD558\uB294 \uAE30\uD3EC(\uC0B0\uC18C \uAC00\uC2A4) \uD658\uAE30\uB97C \uC704\uD574 \uCCAD\uC18C \uC911\uC5D0\uB294 \uD654\uC7A5\uC2E4 \uD658\uD48D\uAE30\uB97C \uCF1C\uACE0 \uBB38\uC744 \uD65C\uC9DD \uC5F4\uC5B4\uB450\uC138\uC694.",
      "\uD53C\uBD80 \uBCF4\uD638\uB97C \uC704\uD574 \uACE0\uBB34\uC7A5\uAC11 \uCC29\uC6A9\uC740 \uD544\uC218\uC785\uB2C8\uB2E4."
    ],
    itinerary: [
      {
        day: 1,
        title: "STEP 1: \uC138\uBA74\uB300 \uBC30\uC218\uAD6C & \uC218\uC804 \uBB3C\uB54C \uBC18\uC9DD\uC774\uAC8C \uB2E6\uAE30",
        activities: [
          {
            time: "STEP 1",
            spot: "\uACFC\uD0C4\uC0B0\uC18C\uB2E4 2\uC2A4\uD47C \uBFCC\uB9AC\uACE0 \uC628\uC218 \uBD93\uAE30",
            description: "\uC138\uBA74\uB300 \uBC30\uC218\uAD6C \uAD6C\uBA4D \uC8FC\uBCC0\uC5D0 \uACFC\uD0C4\uC0B0\uC18C\uB2E4\uB97C \uBFCC\uB9B0 \uD6C4 \uB728\uAC70\uC6B4 \uBB3C\uC744 \uC885\uC774\uCEF5 1\uC794 \uBD84\uB7C9 \uCC9C\uCC9C\uD788 \uBD93\uC2B5\uB2C8\uB2E4. \uBF40\uAE00\uBF40\uAE00 \uAC70\uD488\uC774 \uC62C\uB77C\uC624\uBA70 \uBC30\uAD00 \uC18D \uCC0C\uAEBC\uAE30\uC640 \uC545\uCDE8\uAC00 \uC0AC\uB77C\uC9D1\uB2C8\uB2E4.",
            tip: "10\uBD84 \uBC29\uCE58 \uD6C4 \uC0E4\uC6CC\uAE30\uB85C \uD5F9\uAD88\uC8FC\uBA74 \uC218\uC804\uC774 \uAC70\uC6B8\uCC98\uB7FC \uBC18\uC9DD\uC785\uB2C8\uB2E4.",
            imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "STEP 2",
            spot: "\uD0C0\uC77C \uC904\uB208 \uACF0\uD321\uC774 \uD0A4\uCE5C\uD0C0\uC6D4 \uD329 \uC694\uBC95",
            description: "\uB530\uB73B\uD55C \uBB3C\uC5D0 \uACFC\uD0C4\uC0B0\uC18C\uB2E4\uB97C \uAC78\uCB49\uD558\uAC8C \uAC20 \uB4A4 \uACF0\uD321\uC774\uAC00 \uD540 \uD0C0\uC77C \uC904\uB208\uC5D0 \uBC14\uB974\uACE0 \uD0A4\uCE5C\uD0C0\uC6D4\uC744 \uB36E\uC5B4\uB461\uB2C8\uB2E4.",
            tip: "30\uBD84 \uD6C4 \uCE6B\uC194\uB85C \uC0B4\uC0B4 \uBB38\uC9C0\uB978 \uB4A4 \uBB3C\uC744 \uBFCC\uB9AC\uBA74 \uACF0\uD321\uC774\uAC00 \uAE68\uB057\uD558\uAC8C \uC81C\uAC70\uB429\uB2C8\uB2E4.",
            imageUrl: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80"
          }
        ]
      }
    ],
    markdownContent: `# \uACFC\uD0C4\uC0B0\uC18C\uB2E4 \uD558\uB098\uB85C \uB05D\uB0B4\uB294 10\uBD84 \uC695\uC2E4 \uC0B4\uB9BC \uCCAD\uC18C\uBC95

\uD654\uC7A5\uC2E4 \uC904\uB208 \uACF0\uD321\uC774\uC640 \uC138\uBA74\uB300 \uBB3C\uB54C \uB54C\uBB38\uC5D0 \uB3C5\uD55C \uB77D\uC2A4 \uB0C4\uC0C8 \uB9E1\uC73C\uBA70 \uD798\uB4E4\uAC8C \uBB38\uC9C0\uB974\uC168\uB098\uC694? \uACFC\uD0C4\uC0B0\uC18C\uB2E4\uC758 \uC0B0\uC18C \uAE30\uD3EC \uBC1C\uD3EC \uBC18\uC751\uC744 \uD65C\uC6A9\uD558\uBA74 \uD798\uB4E4\uC774\uC9C0 \uC54A\uACE0 10\uBD84 \uB9CC\uC5D0 \uD638\uD154 \uD654\uC7A5\uC2E4\uCC98\uB7FC \uBC18\uC9DD\uC774\uAC8C \uBC14\uAFC0 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`
  }
];
var WEBZINE_SAMPLE_ARTICLES = SAMPLE_WEBZINE_ARTICLES;

// src/server/db.ts
var configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
var firebaseConfigJson = JSON.parse(fs.readFileSync(configPath, "utf-8"));
var firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: process.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId || "(default)"
};
var app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
var db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
async function getBlogPostById(id) {
  try {
    const docRef = doc(db, "travel_blog_posts", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const status = data.status || "published";
      const isPublic = data.isPublic !== void 0 ? Boolean(data.isPublic) : status === "published";
      return {
        id: docSnap.id,
        title: data.title || "",
        subtitle: data.subtitle || "",
        markdownContent: data.markdownContent || "",
        seoDescription: data.seoDescription || "",
        coverImageUrl: data.coverImageUrl || "",
        createdAt: data.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: data.updatedAt || (/* @__PURE__ */ new Date()).toISOString(),
        authorName: data.authorName || "Wanderlust \uC5D0\uB514\uD130",
        status,
        isPublic
      };
    }
  } catch (error) {
    console.error(`Error fetching blog ${id} from travel_blog_posts on server:`, error);
  }
  const sample = WEBZINE_SAMPLE_ARTICLES.find((a) => a.id === id);
  if (sample) {
    return sample;
  }
  return null;
}
async function getAllPublicBlogPosts() {
  const postsMap = /* @__PURE__ */ new Map();
  try {
    const travelRef = collection(db, "travel_blog_posts");
    const querySnapshot = await getDocs(travelRef);
    const now = /* @__PURE__ */ new Date();
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const status = data.status || "published";
      const isPublic = data.isPublic !== void 0 ? Boolean(data.isPublic) : status === "published";
      const createdAt = data.createdAt || "";
      const createdDate = new Date(createdAt);
      if (status === "published" && isPublic && createdDate <= now) {
        postsMap.set(docSnap.id, {
          id: docSnap.id,
          title: data.title || "",
          subtitle: data.subtitle || "",
          markdownContent: data.markdownContent || "",
          seoDescription: data.seoDescription || "",
          coverImageUrl: data.coverImageUrl || "",
          createdAt: data.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: data.updatedAt || (/* @__PURE__ */ new Date()).toISOString(),
          authorName: data.authorName || "Wanderlust \uC5D0\uB514\uD130",
          status,
          isPublic
        });
      }
    });
  } catch (error) {
    console.error("Error fetching all public blogs for sitemap:", error);
  }
  const sortedPosts = Array.from(postsMap.values());
  sortedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return sortedPosts;
}

// src/server/seo.ts
function getBaseUrl(req) {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.get("host") || "localhost:3000";
  return `${protocol}://${host}`;
}
function cleanText(markdown, limit = 140) {
  if (!markdown) return "";
  const plainText = markdown.replace(/[#*`_~\[\]()\-+=>!]/g, " ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (plainText.length <= limit) return plainText;
  return plainText.slice(0, limit) + "...";
}
async function handleSitemap(req, res) {
  try {
    const posts = await getAllPublicBlogPosts();
    const baseUrl = getBaseUrl(req);
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    xml += `  <url>
`;
    xml += `    <loc>${baseUrl}/</loc>
`;
    xml += `    <changefreq>daily</changefreq>
`;
    xml += `    <priority>1.0</priority>
`;
    xml += `  </url>
`;
    xml += `  <url>
`;
    xml += `    <loc>${baseUrl}/blog</loc>
`;
    xml += `    <changefreq>daily</changefreq>
`;
    xml += `    <priority>0.9</priority>
`;
    xml += `  </url>
`;
    for (const post of posts) {
      const rawDate = post.updatedAt || post.createdAt;
      const lastmod = new Date(rawDate).toISOString();
      xml += `  <url>
`;
      xml += `    <loc>${baseUrl}/blog/${post.id}</loc>
`;
      xml += `    <lastmod>${lastmod}</lastmod>
`;
      xml += `    <changefreq>weekly</changefreq>
`;
      xml += `    <priority>0.8</priority>
`;
      xml += `  </url>
`;
    }
    xml += `</urlset>`;
    res.header("Content-Type", "application/xml; charset=utf-8");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Error generating sitemap.xml:", error);
    res.status(500).send("Error generating sitemap");
  }
}
function handleRobots(req, res) {
  const baseUrl = getBaseUrl(req);
  const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send(robots);
}
async function handleBlogDetailPage(req, res, vite) {
  const postId = req.params.id;
  const baseUrl = getBaseUrl(req);
  let html = "";
  try {
    if (process.env.NODE_ENV !== "production" && vite) {
      const templatePath = path2.resolve(process.cwd(), "index.html");
      html = fs2.readFileSync(templatePath, "utf-8");
      html = await vite.transformIndexHtml(req.originalUrl, html);
    } else {
      const templatePath = path2.resolve(process.cwd(), "dist", "index.html");
      html = fs2.readFileSync(templatePath, "utf-8");
    }
  } catch (err) {
    console.error("Error reading index.html in server-side SEO:", err);
    return res.status(500).send("Internal Server Error");
  }
  const post = await getBlogPostById(postId);
  const now = /* @__PURE__ */ new Date();
  const isValid = post && post.status === "published" && post.isPublic !== false && new Date(post.createdAt) <= now;
  if (!isValid) {
    res.status(404);
    let modifiedHtml2 = html;
    modifiedHtml2 = modifiedHtml2.replace(
      "<title>Wanderlust AI - \uC5EC\uD589 \uBE14\uB85C\uADF8 \uC790\uB3D9\uD654</title>",
      "<title>\uAE00\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4 | Wanderlust AI</title>"
    );
    modifiedHtml2 = modifiedHtml2.replace(
      "</head>",
      `  <meta name="robots" content="noindex, follow">
  </head>`
    );
    modifiedHtml2 = modifiedHtml2.replace(
      '<div id="root"></div>',
      '<div id="root"><div style="padding:80px 20px;text-align:center;font-family:sans-serif;"><h1 style="font-size:2rem;color:#1c1917;margin-bottom:12px;">404 - \uAE00\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4</h1><p style="color:#57534e;margin-bottom:24px;">\uC694\uCCAD\uD558\uC2E0 \uBC1C\uD589 \uAE00\uC774 \uC874\uC7AC\uD558\uC9C0 \uC54A\uAC70\uB098 \uBE44\uACF5\uAC1C \uC0C1\uD0DC\uC785\uB2C8\uB2E4.</p><a href="/blog" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">\uACF5\uAC1C \uC6F9\uC9C4 \uBAA9\uB85D\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30</a></div></div>'
    );
    return res.send(modifiedHtml2);
  }
  res.status(200);
  const postTitle = post.title;
  const postDesc = post.seoDescription || cleanText(post.markdownContent || "", 140);
  const postImage = post.coverImageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
  const postUrl = `${baseUrl}/blog/${post.id}`;
  const datePublished = new Date(post.createdAt).toISOString();
  const dateModified = new Date(post.updatedAt || post.createdAt).toISOString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": postTitle,
    "description": postDesc,
    "image": postImage,
    "datePublished": datePublished,
    "dateModified": dateModified,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postUrl
    },
    "author": {
      "@type": "Organization",
      "name": post.authorName || "Wanderlust AI"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Wanderlust AI",
      "url": baseUrl
    }
  };
  let modifiedHtml = html;
  modifiedHtml = modifiedHtml.replace(
    "<title>Wanderlust AI - \uC5EC\uD589 \uBE14\uB85C\uADF8 \uC790\uB3D9\uD654</title>",
    `<title>${postTitle} | Wanderlust AI</title>`
  );
  const additionalHeads = `
    <link rel="canonical" href="${postUrl}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${postTitle.replace(/"/g, "&quot;")}" />
    <meta property="og:description" content="${postDesc.replace(/"/g, "&quot;")}" />
    <meta property="og:image" content="${postImage}" />
    <meta property="og:url" content="${postUrl}" />
    <meta property="article:published_time" content="${datePublished}" />
    <meta property="article:modified_time" content="${dateModified}" />
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>
    <script>
      window.__INITIAL_POST__ = ${JSON.stringify(post)};
    </script>
  `;
  modifiedHtml = modifiedHtml.replace("</head>", `${additionalHeads}
  </head>`);
  const ssrContent = `
    <div style="max-width:800px;margin:40px auto;padding:20px;font-family:sans-serif;color:#1c1917;">
      <nav style="margin-bottom:20px;"><a href="/blog" style="color:#2563eb;text-decoration:none;font-weight:600;">\u2190 \uC6F9\uC9C4 \uBAA9\uB85D\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30</a></nav>
      <article>
        <h1 style="font-size:2.25rem;font-weight:bold;margin-bottom:12px;line-height:1.3;">${postTitle}</h1>
        <p style="font-size:1.125rem;color:#57534e;margin-bottom:20px;">${post.subtitle || ""}</p>
        <div style="display:flex;gap:16px;color:#78716c;font-size:0.875rem;margin-bottom:24px;border-bottom:1px solid #e7e5e4;padding-bottom:16px;">
          <span>\u270D\uFE0F ${post.authorName || "Wanderlust \uC5D0\uB514\uD130"}</span>
          <span>\u{1F4C5} ${new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        ${postImage ? `<img src="${postImage}" alt="${postTitle}" style="width:100%;height:400px;object-fit:cover;border-radius:12px;margin-bottom:24px;" />` : ""}
        <div style="line-height:1.8;color:#292524;white-space:pre-wrap;">${post.markdownContent || ""}</div>
      </article>
    </div>
  `;
  modifiedHtml = modifiedHtml.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);
  return res.send(modifiedHtml);
}
async function handleStaticPage(req, res, vite) {
  const baseUrl = getBaseUrl(req);
  const pathStr = req.path;
  const canonicalUrl = `${baseUrl}${pathStr}`;
  let html = "";
  try {
    if (process.env.NODE_ENV !== "production" && vite) {
      const templatePath = path2.resolve(process.cwd(), "index.html");
      html = fs2.readFileSync(templatePath, "utf-8");
      html = await vite.transformIndexHtml(req.originalUrl, html);
    } else {
      const templatePath = path2.resolve(process.cwd(), "dist", "index.html");
      html = fs2.readFileSync(templatePath, "utf-8");
    }
  } catch (err) {
    console.error(`Error reading index.html for static path ${pathStr}:`, err);
    return res.status(500).send("Internal Server Error");
  }
  let posts = [];
  try {
    posts = await getAllPublicBlogPosts();
  } catch (err) {
    console.error("Error fetching posts for static SSR page:", err);
  }
  let modifiedHtml = html;
  modifiedHtml = modifiedHtml.replace(
    "</head>",
    `    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:url" content="${canonicalUrl}" />
  </head>`
  );
  if (posts.length > 0) {
    const postsHtml = `
      <div style="max-width:1200px;margin:0 auto;padding:40px 20px;font-family:sans-serif;">
        <header style="text-align:center;margin-bottom:40px;">
          <h1 style="font-size:2.5rem;font-weight:bold;color:#1c1917;margin-bottom:12px;">Wanderlust AI \uACF5\uAC1C \uC6F9\uC9C4</h1>
          <p style="font-size:1.125rem;color:#57534e;">AI\uAC00 \uC2E4\uC2DC\uAC04\uC73C\uB85C \uBD84\uC11D\uD558\uACE0 \uBC1C\uD589\uD55C \uC0DD\uC0DD\uD55C \uC5EC\uD589 \uBC0F \uC0DD\uD65C\uC815\uBCF4 \uAC00\uC774\uB4DC</p>
        </header>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px;">
          ${posts.map((p) => `
            <div style="background:#fff;border:1px solid #e7e5e4;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1);">
              ${p.coverImageUrl ? `<img src="${p.coverImageUrl}" alt="${p.title}" style="width:100%;height:200px;object-fit:cover;" />` : ""}
              <div style="padding:20px;">
                <h2 style="font-size:1.25rem;font-weight:bold;margin-bottom:8px;line-height:1.4;">
                  <a href="/blog/${p.id}" style="color:#1c1917;text-decoration:none;">${p.title}</a>
                </h2>
                <p style="font-size:0.95rem;color:#57534e;margin-bottom:16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.seoDescription || p.subtitle || ""}</p>
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;color:#78716c;border-top:1px solid #f5f5f4;padding-top:12px;">
                  <span>\u270D\uFE0F ${p.authorName || "Wanderlust \uC5D0\uB514\uD130"}</span>
                  <a href="/blog/${p.id}" style="color:#2563eb;font-weight:600;text-decoration:none;">\uC790\uC138\uD788 \uBCF4\uAE30 \u2192</a>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    modifiedHtml = modifiedHtml.replace('<div id="root"></div>', `<div id="root">${postsHtml}</div>`);
    modifiedHtml = modifiedHtml.replace(
      "</head>",
      `  <script>window.__INITIAL_POSTS__ = ${JSON.stringify(posts)};</script>
  </head>`
    );
  }
  res.status(200).send(modifiedHtml);
}

// src/server/app.ts
dotenv.config();
var app2 = express();
app2.use(express.json({ limit: "10mb" }));
var distPath = path3.join(process.cwd(), "dist");
app2.use(express.static(distPath));
app2.get("/sitemap.xml", handleSitemap);
app2.get("/robots.txt", handleRobots);
app2.get("/blog/:id", (req, res) => handleBlogDetailPage(req, res));
app2.get("/", (req, res, next) => {
  if (req.path === "/") {
    return handleStaticPage(req, res);
  }
  next();
});
app2.get("/blog", (req, res) => handleStaticPage(req, res));
var getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "dummy-key",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
};
async function generateContentWithFallback(ai, params) {
  const modelsToTry = ["gemini-3.6-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
  let lastError = null;
  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await ai.models.generateContent({
          ...params,
          model
        });
        return res;
      } catch (err) {
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
app2.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Wanderlust AI Travel Blog Generator" });
});
app2.post("/api/generate-blog", async (req, res) => {
  try {
    const {
      categoryType = "travel",
      destination,
      duration = "3\uBC15 4\uC77C",
      travelStyle = "\uAC10\uC131 \uC5EC\uD589 \uBC0F \uB9DB\uC9D1 \uD22C\uC5B4",
      keywords = [],
      tone = "\uCE5C\uADFC\uD558\uACE0 \uAC10\uC131\uC801\uC778 ~\uD574\uC694\uCCB4",
      specificSpots = "",
      targetAudience = "\uC804\uCCB4 \uB3C5\uC790\uCE35",
      language = "\uD55C\uAD6D\uC5B4"
    } = req.body;
    if (!destination || typeof destination !== "string") {
      return res.status(400).json({ error: "\uC8FC\uC81C(destination)\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694." });
    }
    const ai = getGenAI();
    const isLifeInfo = categoryType === "life_info";
    const isFood = categoryType === "food";
    const isTrend = categoryType === "trend";
    const isNaverSeoTone = tone.includes("\uB124\uC774\uBC84") || tone.includes("\uC0C1\uC704\uB178\uCD9C") || tone.includes("\uC2A4\uB9C8\uD2B8\uBE14\uB85D") || tone.includes("C-Rank");
    const naverSeoRules = isNaverSeoTone ? `
[\u{1F525} \uB124\uC774\uBC84 C-Rank & DIA+ \uC2A4\uB9C8\uD2B8\uBE14\uB85D \uC0C1\uC704\uB178\uCD9C \uCD5C\uC801\uD654 \uD575\uC2EC \uC9C0\uCE68]
1. \uAC80\uC0C9\uC5B4 \uBC00\uCC29\uD615 \uC81C\uBAA9: \uD0C0\uAC9F \uBA54\uC778 \uD0A4\uC6CC\uB4DC\uB97C \uC81C\uBAA9 \uAC00\uC7A5 \uC55E\uBD80\uBD84\uC5D0 \uBC30\uCE58\uD558\uACE0, 22~28\uC790 \uB0B4\uC678\uB85C \uD074\uB9AD\uD558\uACE0 \uC2F6\uAC8C \uB9CC\uB4DC\uC138\uC694. (\uC608: "[\uD575\uC2EC\uC815\uB9AC] ${destination} \uC2E4\uC804 \uAC00\uC774\uB4DC & \uD544\uC218 \uC8FC\uC758\uC0AC\uD56D")
2. DIA+ \uC2E4\uC804 \uACBD\uD5D8 \uAC00\uC774\uB4DC: \uB2E8\uC21C \uC0AC\uC2E4 \uB098\uC5F4\uC774 \uC544\uB2CC "\uC9C1\uC811 \uD574\uBCF4\uB2C8...", "\uC2E4\uC81C \uACBD\uD5D8\uC744 \uBC14\uD0D5\uC73C\uB85C \uBF51\uC544\uBCF8 \uAC00\uC7A5 \uC720\uC6A9\uD55C \uD301" \uB4F1 \uC0DD\uC0DD\uD55C \uB9AC\uC5BC\uC2A4\uD1A0\uB9AC \uC5B4\uC870\uB97C \uB179\uC774\uC138\uC694.
3. \uC2A4\uB9C8\uD2B8\uBE14\uB85D \uC18C\uC81C\uBAA9 \uAD6C\uC870\uD654: \uB124\uC774\uBC84 AI\uAC00 \uC2A4\uB9C8\uD2B8\uBE14\uB85D \uC9C0\uC218\uB85C \uC218\uC9D1\uD558\uB3C4\uB85D \uBCF8\uBB38\uC744 \uB2E4\uC74C 4\uAC1C \uD575\uC2EC \uC18C\uC81C\uBAA9 \uC139\uC158\uC73C\uB85C \uBA85\uD655\uD788 \uAD6C\uBD84\uD558\uC138\uC694:
   - ## 1. [\uD575\uC2EC \uC694\uC57D] \uD55C\uB208\uC5D0 \uBCF4\uB294 \uD575\uC2EC \uAC1C\uC694
   - ## 2. [\uC2E4\uC804 \uAC00\uC774\uB4DC] \uB2E8\uACC4\uBCC4 \uB530\uB77C\uD558\uAE30 & \uC2E4\uC804 \uC801\uC6A9 \uB178\uD558\uC6B0
   - ## 3. [\uBE44\uAD50 & \uC8FC\uC758\uC0AC\uD56D] \uC774\uAC83 \uBAA8\uB974\uBA74 \uC190\uD574\uBCF4\uB294 \uC2E4\uC218 \uBC29\uC9C0 \uAFC0\uD301
   - ## 4. [Q&A] \uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38 FAQ
4. \uD0A4\uC6CC\uB4DC \uC790\uC5F0\uC2A4\uB7EC\uC6B4 \uBC00\uB3C4 \uBC30\uCE58: \uBA54\uC778 \uD0A4\uC6CC\uB4DC(${destination})\uB97C \uBCF8\uBB38 \uC804\uCCB4\uC5D0 5~7\uD68C \uC790\uC5F0\uC2A4\uB7FD\uAC8C \uB179\uC5EC\uB0B4\uC138\uC694.
5. \uAC00\uB3C5\uC131 \uADF9\uB300\uD654: \uBAA8\uBC14\uC77C \uC77D\uAE30\uC5D0 \uCD5C\uC801\uD654\uB41C 2~3\uC904 \uB2E8\uC704 \uBB38\uB2E8, \uD575\uC2EC \uD3EC\uC778\uD2B8 \uBCFC\uB4DC\uCC98\uB9AC \uBC0F \uB9C8\uD06C\uB2E4\uC6B4 \uD45C/\uCCB4\uD06C\uB9AC\uC2A4\uD2B8\uB97C \uC544\uB08C\uC5C6\uC774 \uC0AC\uC6A9\uD558\uC138\uC694.
` : "";
    let prompt = "";
    let systemInstruction = "";
    if (isFood) {
      systemInstruction = "\uB2F9\uC2E0\uC740 \uBBF8\uC2DD/\uB9DB\uC9D1/\uCE74\uD398 \uC804\uBB38 \uD30C\uC6CC\uBE14\uB85C\uAC70\uC774\uC790 \uD478\uB4DC \uCE7C\uB7FC\uB2C8\uC2A4\uD2B8\uC785\uB2C8\uB2E4. \uC2DC\uAC01\uACFC \uBBF8\uAC01\uC744 \uC790\uADF9\uD558\uB294 \uC0DD\uC0DD\uD55C \uBB18\uC0AC\uC640 \uC2E4\uC804 \uC6E8\uC774\uD305/\uC8FC\uCC28/\uBA54\uB274 \uCD94\uCC9C \uD301\uC774 \uB2F4\uAE34 \uCD5C\uACE0\uAE09 \uB124\uC774\uBC84 \uBE14\uB85C\uADF8 \uC2A4\uD0C0\uC77C \uAE00\uC744 \uC0DD\uC131\uD558\uC138\uC694. JSON \uC2A4\uD0A4\uB9C8 \uD615\uC2DD\uC5D0 \uB9DE\uCDB0 \uC815\uD655\uD55C JSON\uC73C\uB85C \uBC18\uD658\uD574\uC57C \uD569\uB2C8\uB2E4.";
      prompt = `
\uB2F9\uC2E0\uC740 \uB300\uD55C\uBBFC\uAD6D \uCD5C\uACE0\uC758 \uB9DB\uC9D1 & \uAC10\uC131 \uCE74\uD398 \uC804\uBB38 \uD30C\uC6CC\uBE14\uB85C\uAC70\uC785\uB2C8\uB2E4.
\uB2E4\uC74C \uC870\uAC74\uC5D0 \uB530\uB77C \uB124\uC774\uBC84 \uBE14\uB85C\uADF8/\uC778\uC2A4\uD0C0\uADF8\uB7A8 \uC2A4\uD0C0\uC77C\uC758 \uCE68\uC0D8\uC744 \uC790\uADF9\uD558\uACE0 \uC2E4\uC804 \uC720\uC6A9\uD55C **\uB9DB\uC9D1/\uCE74\uD398 \uD0D0\uBC29 \uBE14\uB85C\uADF8 \uAE00**\uC744 \uC791\uC131\uD574\uC8FC\uC138\uC694.

[\uC785\uB825 \uC815\uBCF4]
- \uB9DB\uC9D1/\uCE74\uD398 \uC8FC\uC81C: ${destination}
- \uBC29\uBB38 \uC2DC\uAC04/\uCF54\uC2A4: ${duration}
- \uB2E4\uC774\uB2DD/\uCE74\uD398 \uC2A4\uD0C0\uC77C: ${travelStyle}
- \uC8FC\uC694 \uBA54\uB274/\uD0A4\uC6CC\uB4DC: ${keywords.join(", ")} ${specificSpots ? `(${specificSpots})` : ""}
- \uBB38\uCCB4 \uBC0F \uC5B4\uC870: ${tone}
- \uC791\uC131 \uC5B8\uC5B4: ${language}
${naverSeoRules}

[\uC791\uC131 \uC9C0\uCE68]
1. \uC81C\uBAA9: \uAC80\uC0C9 \uC720\uC785\uB960\uC774 \uB192\uC740 \uB9E4\uB825\uC801\uC778 \uD3EC\uB9F7 (\uC608: "[\uC131\uC218 \uD56B\uD50C] \uC624\uD508\uB7F0 \uD544\uC218! \uC18C\uAE08\uBE75 \uC131\uC9C0 \uBCA0\uC774\uCEE4\uB9AC \uCE74\uD398 \uC194\uC9C1 \uB0B4\uB3C8\uB0B4\uC0B0 \uD6C4\uAE30 \u{1F950}")
2. \uC678\uAD00 & \uC778\uD14C\uB9AC\uC5B4 \uBD84\uC704\uAE30: \uB9E4\uC7A5 \uCCAB\uC778\uC0C1, \uC778\uD14C\uB9AC\uC5B4 \uBB34\uB4DC, \uC88C\uC11D \uAC04\uACA9 \uBC0F \uC0AC\uC9C4 \uC798 \uB098\uC624\uB294 \uD3EC\uD1A0\uC874 \uBA85\uB2F9 \uBB18\uC0AC
3. \uC2DC\uADF8\uB2C8\uCC98 \uBA54\uB274 \uC2EC\uCE35 \uB9AC\uBDF0: \uD55C \uC785 \uBCA0\uC5B4 \uBB3C\uC5C8\uC744 \uB54C\uC758 \uC2DD\uAC10, \uB9DB\uC758 \uBC38\uB7F0\uC2A4, \uBE44\uC8FC\uC5BC, \uACC1\uB4E4\uC784 \uC74C\uB8CC\uC640\uC758 \uC870\uD654 \uC0DD\uC0DD \uBB18\uC0AC
4. \uC2E4\uC804 \uBC29\uBB38 \uAFC0\uD301 \uD544\uC218 \uD3EC\uD568: \uC624\uD508\uB7F0/\uC6E8\uC774\uD305 \uBC29\uBC95, \uC8FC\uCC28 \uAC00\uB2A5 \uC5EC\uBD80, \uC608\uC57D \uD301, \uCD94\uCC9C \uBC29\uBB38 \uC2DC\uAC04\uB300
5. \uBCF8\uBB38 \uB9C8\uD06C\uB2E4\uC6B4 \uD3EC\uB9F7\uD305: \uB9C8\uD06C\uB2E4\uC6B4 \uD5E4\uB354(##, ###), \uC774\uBAA8\uC9C0, \uC778\uC6A9\uAD6C, \uAC00\uACA9 \uBC0F \uBA54\uB274 \uC694\uC57D \uD45C, \uCCB4\uD06C\uB9AC\uC2A4\uD2B8 \uD65C\uC6A9
6. \uC0AC\uC9C4 \uAC00\uC774\uB4DC: [\uC0AC\uC9C4: \uB300\uD45C \uC2DC\uADF8\uB2C8\uCC98 \uBA54\uB274 \uD074\uB85C\uC988\uC5C5 \uC0AC\uC9C4] \uB4F1 \uC801\uC7AC\uC801\uC18C\uC5D0 \uAC00\uC774\uB4DC \uC0BD\uC785
7. SEO \uD0A4\uC6CC\uB4DC \uBC0F \uD574\uC2DC\uD0DC\uADF8(#\uB9DB\uC9D1 #\uCE74\uD398\uD22C\uC5B4 \uB4F1 8~12\uAC1C) \uD3EC\uD568
`;
    } else if (isTrend) {
      systemInstruction = "\uB2F9\uC2E0\uC740 \uB300\uD55C\uBBFC\uAD6D \uCD5C\uC2E0 \uD2B8\uB80C\uB4DC/\uD56B\uD50C\uB808\uC774\uC2A4/\uB77C\uC774\uD504\uC2A4\uD0C0\uC77C \uC804\uBB38 \uB9E4\uAC70\uC9C4 \uC5D0\uB514\uD130\uC785\uB2C8\uB2E4. 2030 \uC138\uB300\uAC00 \uC5F4\uAD11\uD558\uB294 \uCD5C\uC2E0 \uC720\uD589\uACFC \uBB38\uD654\uC758 \uD575\uC2EC\uC744 \uC9DA\uACE0 \uC2E4\uC804 \uCC38\uC5EC \uAC00\uC774\uB4DC\uB97C \uC804\uB2EC\uD558\uB294 \uAC10\uAC01\uC801\uC778 \uBE14\uB85C\uADF8 \uAE00\uC744 \uC0DD\uC131\uD558\uC138\uC694. JSON \uC2A4\uD0A4\uB9C8 \uD615\uC2DD\uC5D0 \uB9DE\uCDB0 \uC815\uD655\uD55C JSON\uC73C\uB85C \uBC18\uD658\uD574\uC57C \uD569\uB2C8\uB2E4.";
      prompt = `
\uB2F9\uC2E0\uC740 \uD2B8\uB80C\uB4DC\uB97C \uAC00\uC7A5 \uBE60\uB974\uAC8C \uC77D\uB294 \uD56B\uC774\uC288 & \uB77C\uC774\uD504\uC2A4\uD0C0\uC77C \uC804\uBB38 \uC5D0\uB514\uD130\uC785\uB2C8\uB2E4.
\uB2E4\uC74C \uC870\uAC74\uC5D0 \uB530\uB77C \uB124\uC774\uBC84 \uBE14\uB85C\uADF8/\uB9E4\uAC70\uC9C4 \uC2A4\uD0C0\uC77C\uC758 \uD2B8\uB80C\uB514\uD558\uACE0 \uD765\uBBF8\uC9C4\uC9C4\uD55C **\uCD5C\uC2E0 \uD2B8\uB80C\uB4DC \uBE14\uB85C\uADF8 \uAE00**\uC744 \uC791\uC131\uD574\uC8FC\uC138\uC694.

[\uC785\uB825 \uC815\uBCF4]
- \uD2B8\uB80C\uB4DC \uC8FC\uC81C: ${destination}
- \uC18C\uC694 \uC2DC\uAC04/\uC77C\uC815: ${duration}
- \uD2B8\uB80C\uB4DC \uD14C\uB9C8: ${travelStyle}
- \uD575\uC2EC \uD0A4\uC6CC\uB4DC: ${keywords.join(", ")} ${specificSpots ? `(${specificSpots})` : ""}
- \uBB38\uCCB4 \uBC0F \uC5B4\uC870: ${tone}
- \uC791\uC131 \uC5B8\uC5B4: ${language}
${naverSeoRules}

[\uC791\uC131 \uC9C0\uCE68]
1. \uC81C\uBAA9: \uD2B8\uB80C\uB4DC \uC138\uD130\uB4E4\uC758 \uD074\uB9AD\uC744 \uBD80\uB974\uB294 \uD5E4\uB4DC\uB77C\uC778 (\uC608: "[\uC694\uC998 \uB300\uC138] 2030\uC774 \uB7EC\uB2DD \uD06C\uB8E8\uC5D0 \uC5F4\uAD11\uD558\uB294 \uC9C4\uC9DC \uC774\uC720 & \uD55C\uAC15 \uB098\uC774\uD2B8\uB7F0 \uC785\uBB38 \uAC00\uC774\uB4DC \u{1F3C3}\u200D\u2642\uFE0F")
2. \uC65C \uC9C0\uAE08 \uC774 \uD2B8\uB80C\uB4DC\uAC00 \uB728\uB294\uAC00? \uBC30\uACBD\uACFC \uC2EC\uB9AC\uC801/\uBB38\uD654\uC801 \uC694\uC778 \uBD84\uC11D
3. \uC2E4\uC804 \uCC38\uC5EC/\uCCB4\uD5D8 \uAC00\uC774\uB4DC: \uCD08\uBCF4\uC790\uAC00 \uC27D\uAC8C \uC2DC\uC791\uD558\uB294 \uBC95, \uC900\uBE44\uBB3C, \uD544\uC218 \uCCB4\uD06C\uB9AC\uC2A4\uD2B8 \uBC0F \uCD94\uCC9C \uBA85\uC18C
4. \uAFC0\uD301 & \uC8FC\uC758\uC0AC\uD56D: \uBE44\uC6A9, \uC5D0\uD2F0\uCF13, \uC2E4\uD328 \uC5C6\uC774 200% \uC990\uAE30\uB294 \uC2E4\uC804 \uB178\uD558\uC6B0
5. \uBCF8\uBB38 \uB9C8\uD06C\uB2E4\uC6B4: \uB9C8\uD06C\uB2E4\uC6B4 \uD5E4\uB354(##, ###), \uC778\uC6A9\uAD6C, \uC774\uBAA8\uC9C0, \uBE44\uAD50 \uD45C, \uC694\uC57D \uBC15\uC2A4 \uD65C\uC6A9
6. \uC0AC\uC9C4 \uAC00\uC774\uB4DC: [\uC0AC\uC9C4: \uD604\uC7A5 \uC5F4\uAE30 \uBC0F \uD2B8\uB80C\uB514\uD55C \uC778\uC99D\uC0F7 \uC5F0\uCD9C \uD301] \uAC00\uC774\uB4DC \uC0BD\uC785
7. SEO \uD0A4\uC6CC\uB4DC \uBC0F \uD574\uC2DC\uD0DC\uADF8(#\uD2B8\uB80C\uB4DC #\uD56B\uD50C\uB808\uC774\uC2A4 \uB4F1 8~12\uAC1C) \uD3EC\uD568
`;
    } else if (isLifeInfo) {
      systemInstruction = "\uB2F9\uC2E0\uC740 \uC0DD\uD65C\uC815\uBCF4 \uC804\uBB38 \uBE14\uB85C\uADF8 \uC5D0\uB514\uD130\uC785\uB2C8\uB2E4. \uB3C5\uC790\uB4E4\uC774 \uBC14\uB85C \uB530\uB77C\uD560 \uC218 \uC788\uB294 \uAC00\uB3C5\uC131 \uB6F0\uC5B4\uB09C \uC0DD\uD65C \uAFC0\uD301 \uD3EC\uC2A4\uD305\uC744 \uC0DD\uC131\uD558\uC138\uC694. JSON \uC2A4\uD0A4\uB9C8 \uD615\uC2DD\uC5D0 \uB9DE\uCDB0 \uC815\uD655\uD55C JSON\uC73C\uB85C \uBC18\uD658\uD574\uC57C \uD569\uB2C8\uB2E4.";
      prompt = `
\uB2F9\uC2E0\uC740 \uB300\uD55C\uBBFC\uAD6D \uCD5C\uACE0\uC758 \uC0DD\uD65C\uC815\uBCF4, \uC2E4\uC804 \uC0B4\uB9BC/\uC808\uC57D/\uAC74\uAC15/IT \uAFC0\uD301 \uC804\uBB38 \uC5D0\uB514\uD130\uC785\uB2C8\uB2E4.
\uB2E4\uC74C \uC870\uAC74\uC5D0 \uB530\uB77C \uB124\uC774\uBC84 \uBE14\uB85C\uADF8/\uD2F0\uC2A4\uD1A0\uB9AC \uC2A4\uD0C0\uC77C\uC758 \uC2E4\uC6A9\uC801\uC774\uACE0 \uB530\uB77C \uD558\uAE30 \uC26C\uC6B4 **\uC0DD\uD65C\uC815\uBCF4 \uBC0F \uAFC0\uD301 \uBE14\uB85C\uADF8 \uAE00**\uC744 \uC791\uC131\uD574\uC8FC\uC138\uC694.

[\uC785\uB825 \uC815\uBCF4]
- \uC8FC\uC694 \uC8FC\uC81C/\uC9C8\uBB38: ${destination}
- \uC0DD\uD65C \uBD84\uC57C/\uCE74\uD14C\uACE0\uB9AC: ${travelStyle}
- \uC8FC\uC694 \uD0A4\uC6CC\uB4DC/\uD3EC\uC778\uD2B8: ${keywords.join(", ")} ${specificSpots ? `(${specificSpots})` : ""}
- \uCD94\uCC9C \uD0C0\uAC9F \uB3C5\uC790: ${targetAudience}
- \uBB38\uCCB4 \uBC0F \uC5B4\uC870: ${tone}
- \uC791\uC131 \uC5B8\uC5B4: ${language}
${naverSeoRules}

[\uC791\uC131 \uC9C0\uCE68]
1. \uC81C\uBAA9\uC740 \uC870\uD68C\uC218\uB97C \uC720\uBC1C\uD558\uB294 \uBA85\uD655\uD558\uACE0 \uC720\uC6A9\uD55C \uD3EC\uB9F7\uC73C\uB85C \uC9C0\uC73C\uC138\uC694. (\uC608: "[\uC0B4\uB9BC\uAFC0\uD301] \uC5D0\uC5B4\uCEE8 \uC804\uAE30\uC138 50% \uC808\uC57D\uD558\uB294 \uC2E4\uC804 \uBC29\uBC95 TOP 5 \u{1F4A1}")
2. \uC11C\uB860\uC5D0\uC11C\uB294 \uB3C5\uC790\uB4E4\uC758 \uACF5\uAC10\uC744 \uC790\uADF9\uD558\uB294 \uBB38\uC81C \uC0C1\uD669\uACFC \uC774 \uAE00\uC744 \uC77D\uC5B4\uC57C \uD558\uB294 \uC774\uC720\uB97C \uC124\uBA85\uD558\uC138\uC694.
3. \uC138\uBD80 \uB2E8\uACC4\uBCC4 \uD575\uC2EC \uB178\uD558\uC6B0(Step 1, Step 2 \uB610\uB294 \uAFC0\uD301 1, \uAFC0\uD301 2 \uB4F1)\uB97C \uAD6C\uCCB4\uC801\uC778 \uC900\uBE44\uBB3C, \uC2E4\uD589 \uBC29\uBC95, \uC8FC\uC758\uC0AC\uD56D\uACFC \uD568\uAED8 \uC815\uB9AC\uD558\uC138\uC694.
4. \uBCF8\uBB38(markdownContent)\uC5D0\uB294 \uB9C8\uD06C\uB2E4\uC6B4 \uD5E4\uB354(##, ###), \uC774\uBAA8\uC9C0, \uCCB4\uD06C\uB9AC\uC2A4\uD2B8, \uAC15\uC870\uBB38\uD45C, \uC778\uC6A9\uBB38(> ), \uD45C \uB4F1\uC744 \uD65C\uC6A9\uD558\uC5EC \uB9E4\uC6B0 \uAC00\uB3C5\uC131 \uB192\uC740 \uC0DD\uD65C \uBE14\uB85C\uADF8 \uAE00\uC744 \uC644\uC131\uD558\uC138\uC694.
5. \uC911\uAC04\uC911\uAC04 \uC774\uD574\uB97C \uB3D5\uB294 \uC774\uBBF8\uC9C0 \uC0BD\uC785 \uC704\uCE58\uC5D0 [\uC0AC\uC9C4: \uC0AC\uC9C4 \uC124\uBA85 \uBC0F \uD65C\uC6A9 \uD301] \uAC00\uC774\uB4DC\uB97C \uB123\uC5B4\uC8FC\uC138\uC694.
6. \uC2E4\uD328 \uC5C6\uB294 \uC2E4\uC804 \uD544\uC218 \uCCB4\uD06C\uD3EC\uC778\uD2B8 \uBC0F \uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38(FAQ) \uAFC0\uD301 \uB9AC\uC2A4\uD2B8\uB97C \uC54C\uCC28\uAC8C \uD3EC\uD568\uD558\uC138\uC694.
7. \uBE14\uB85C\uADF8 \uAC80\uC0C9 \uB178\uCD9C\uC744 \uC704\uD55C SEO \uD0A4\uC6CC\uB4DC \uBC0F \uD574\uC2DC\uD0DC\uADF8(#\uC0DD\uD65C\uAFC0\uD301 #\uC0B4\uB9BC\uB178\uD558\uC6B0 \uB4F1 8~12\uAC1C)\uB97C \uD3EC\uD568\uD574\uC8FC\uC138\uC694.
`;
    } else {
      systemInstruction = "\uB2F9\uC2E0\uC740 \uC778\uAE30 \uC5EC\uD589 \uBE14\uB85C\uADF8 \uC5D0\uB514\uD130\uC785\uB2C8\uB2E4. \uC77D\uAE30 \uC27D\uACE0 \uB124\uC774\uBC84 \uBE14\uB85C\uADF8/\uD2F0\uC2A4\uD1A0\uB9AC \uC2A4\uD0C0\uC77C\uC758 \uAC10\uC131\uC801\uC774\uBA74\uC11C\uB3C4 \uC815\uBCF4\uAC00 \uAF49 \uCC2C \uD48D\uBD80\uD55C \uC5EC\uD589 \uAE00\uC744 \uC0DD\uC131\uD558\uC138\uC694. JSON \uC2A4\uD0A4\uB9C8 \uD615\uC2DD\uC5D0 \uB9DE\uCDB0 \uC815\uD655\uD55C JSON\uC73C\uB85C \uBC18\uD658\uD574\uC57C \uD569\uB2C8\uB2E4.";
      prompt = `
\uB2F9\uC2E0\uC740 \uB300\uD55C\uBBFC\uAD6D \uCD5C\uACE0\uC758 \uC804\uBB38 \uC5EC\uD589 \uBE14\uB85C\uAC70\uC774\uC790 \uC5EC\uD589 \uD2B8\uB80C\uB4DC \uC5D0\uB514\uD130\uC785\uB2C8\uB2E4.
\uB2E4\uC74C \uC870\uAC74\uC5D0 \uB530\uB77C \uB124\uC774\uBC84 \uBE14\uB85C\uADF8/\uD2F0\uC2A4\uD1A0\uB9AC \uC2A4\uD0C0\uC77C\uC758 \uC0DD\uC0DD\uD558\uACE0 \uAC10\uC131\uC801\uC774\uBA70 \uC815\uBCF4\uAC00 \uC54C\uCC2C **\uC5EC\uD589 \uBE14\uB85C\uADF8 \uAE00**\uC744 \uC791\uC131\uD574\uC8FC\uC138\uC694.

[\uC785\uB825 \uC815\uBCF4]
- \uC5EC\uD589\uC9C0/\uC8FC\uC81C: ${destination}
- \uC5EC\uD589 \uAE30\uAC04: ${duration}
- \uC5EC\uD589 \uC2A4\uD0C0\uC77C: ${travelStyle}
- \uC8FC\uC694 \uD0A4\uC6CC\uB4DC/\uBA85\uC18C: ${keywords.join(", ")} ${specificSpots ? `(${specificSpots})` : ""}
- \uBB38\uCCB4 \uBC0F \uC5B4\uC870: ${tone}
- \uC791\uC131 \uC5B8\uC5B4: ${language}
${naverSeoRules}

[\uC791\uC131 \uC9C0\uCE68]
1. \uC81C\uBAA9\uC740 \uAC80\uC0C9 \uD074\uB9AD\uC744 \uC720\uB3C4\uD558\uB294 \uAC10\uC131\uC801\uC774\uACE0 \uB9E4\uB825\uC801\uC778 \uD3EC\uB9F7\uC73C\uB85C \uC9C0\uC73C\uC138\uC694. (\uC608: "[\uC81C\uC8FC 3\uBC15 4\uC77C] \uC5D0\uBA54\uB784\uB4DC\uBE5B \uBC14\uB2E4\uC640 \uC228\uC740 \uAC10\uC131 \uCE74\uD398 \uD22C\uC5B4 \uCF54\uC2A4 \uCD1D\uC815\uB9AC \u2728")
2. \uC11C\uB860\uC5D0\uC11C\uB294 \uD574\uB2F9 \uC5EC\uD589\uC9C0\uC758 \uB9E4\uB825\uACFC \uC5EC\uD589\uC744 \uB5A0\uB098\uAC8C \uB41C \uACC4\uAE30/\uBD84\uC704\uAE30\uB97C \uC0DD\uC0DD\uD558\uAC8C \uC804\uB2EC\uD558\uC138\uC694.
3. \uC77C\uC815\uBCC4 \uCF54\uC2A4(Day 1, Day 2 \uB4F1)\uB294 \uAD6C\uCCB4\uC801\uC778 \uC2DC\uAC04\uB300\uC640 \uBA85\uC18C \uC774\uB984, \uAFC0\uD301, \uCD94\uCC9C \uD3EC\uD1A0\uC874\uC744 \uB2F4\uC73C\uC138\uC694.
4. \uBCF8\uBB38(markdownContent)\uC5D0\uB294 \uB9C8\uD06C\uB2E4\uC6B4 \uD5E4\uB354(##, ###), \uC774\uBAA8\uC9C0, \uC778\uC6A9\uBB38(> ), \uAC15\uC870, \uCCB4\uD06C\uB9AC\uC2A4\uD2B8, \uD45C \uB4F1\uC744 \uD65C\uC6A9\uD558\uC5EC \uAC00\uB3C5\uC131\uC774 \uB6F0\uC5B4\uB09C \uB124\uC774\uBC84 \uBE14\uB85C\uADF8 \uC2A4\uD0C0\uC77C \uAE00\uC744 \uC791\uC131\uD558\uC138\uC694.
5. \uC911\uAC04\uC911\uAC04 \uC0AC\uC9C4\uC774 \uB4E4\uC5B4\uAC08 \uC704\uCE58\uC5D0 [\uC0AC\uC9C4: \uC0AC\uC9C4 \uC124\uBA85 \uBC0F \uD3EC\uD1A0\uC874 \uD301] \uACFC \uAC19\uC740 \uAC00\uC774\uB4DC\uB97C \uB123\uC5B4\uC8FC\uC138\uC694.
6. \uD544\uC218 \uC5EC\uD589 \uAFC0\uD301(\uC900\uBE44\uBB3C, \uAD50\uD1B5\uD3B8, Best \uC2DC\uC98C, \uC608\uC0C1 \uACBD\uBE44)\uC744 \uC54C\uCC28\uAC8C \uC815\uB9AC\uD574\uC8FC\uC138\uC694.
7. \uBE14\uB85C\uADF8 \uAC80\uC0C9 \uB178\uCD9C\uC744 \uC704\uD55C SEO \uD0A4\uC6CC\uB4DC \uBC0F \uD574\uC2DC\uD0DC\uADF8(#\uC5EC\uD589\uC9C0 #\uAC10\uC131\uC5EC\uD589 \uB4F1 8~12\uAC1C)\uB97C \uD3EC\uD568\uD574\uC8FC\uC138\uC694.
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
            title: { type: Type.STRING, description: "\uB9E4\uB825\uC801\uC778 \uBE14\uB85C\uADF8 \uC81C\uBAA9" },
            subtitle: { type: Type.STRING, description: "\uBD80\uC81C\uBAA9 \uBC0F \uD575\uC2EC \uC694\uC57D \uBB38\uAD6C" },
            destination: { type: Type.STRING, description: "\uC8FC\uC81C \uB610\uB294 \uC5EC\uD589\uC9C0 \uBA85\uCE6D" },
            duration: { type: Type.STRING, description: "\uC18C\uC694\uC2DC\uAC04 \uB610\uB294 \uC77C\uC815" },
            concept: { type: Type.STRING, description: "\uD14C\uB9C8 \uB610\uB294 \uCEE8\uC149" },
            tone: { type: Type.STRING, description: "\uC0AC\uC6A9\uD55C \uC5B4\uC870" },
            targetAudience: { type: Type.STRING, description: "\uCD94\uCC9C \uD0C0\uAC9F \uB3C5\uC790\uCE35" },
            budget: { type: Type.STRING, description: "\uC608\uC0C1 \uBE44\uC6A9 (\uB610\uB294 \uBE44\uC6A9 0\uC6D0)" },
            season: { type: Type.STRING, description: "\uCD94\uCC9C \uC2DC\uAE30 \uB610\uB294 \uC720\uC6A9\uD55C \uACC4\uC808" },
            seoDescription: { type: Type.STRING, description: "\uAC80\uC0C9 \uC5D4\uC9C4 \uB178\uCD9C\uC6A9 \uC694\uC57D\uAE00 (120\uC790 \uB0B4\uC678)" },
            metaKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "\uC8FC\uC694 \uAC80\uC0C9 \uD0A4\uC6CC\uB4DC \uBAA9\uB85D"
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "\uCD94\uCC9C \uD574\uC2DC\uD0DC\uADF8 (#\uC73C\uB85C \uC2DC\uC791\uD558\uB294 \uB2E8\uC5B4\uB4E4)"
            },
            itinerary: {
              type: Type.ARRAY,
              description: "\uB2E8\uACC4\uBCC4 \uC2E4\uD589 \uAC00\uC774\uB4DC \uB610\uB294 \uC77C\uC815\uBCC4 \uCF54\uC2A4",
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER, description: "\uC21C\uC11C \uBC88\uD638 (1, 2, 3...)" },
                  title: { type: Type.STRING, description: "\uD574\uB2F9 \uB2E8\uACC4/\uC77C\uCC28 \uB300\uD45C \uD0C0\uC774\uD2C0" },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING, description: "\uC18C\uC694\uC2DC\uAC04 \uB610\uB294 \uAD8C\uC7A5 \uC2DC\uAC04\uB300" },
                        spot: { type: Type.STRING, description: "\uB2E8\uACC4/\uD56D\uBAA9/\uC7A5\uC18C \uC774\uB984" },
                        description: { type: Type.STRING, description: "\uC0C1\uC138 \uC124\uBA85 \uBC0F \uC2E4\uD589 \uD301" },
                        tip: { type: Type.STRING, description: "\uD575\uC2EC \uC8FC\uC758\uC0AC\uD56D \uB610\uB294 \uAFC0\uD301" },
                        photoPrompt: { type: Type.STRING, description: "\uC774\uBBF8\uC9C0 \uC0DD\uC131\uC744 \uC704\uD55C \uC601\uBB38 \uD504\uB86C\uD504\uD2B8" }
                      },
                      required: ["spot", "description"]
                    }
                  }
                },
                required: ["day", "title", "activities"]
              }
            },
            travelTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "\uC2E4\uC804 \uD575\uC2EC \uAFC0\uD301/\uCCB4\uD06C\uD3EC\uC778\uD2B8 \uB9AC\uC2A4\uD2B8"
            },
            markdownContent: {
              type: Type.STRING,
              description: "\uB124\uC774\uBC84/\uD2F0\uC2A4\uD1A0\uB9AC \uBE14\uB85C\uADF8\uC5D0 \uBC14\uB85C \uBCF5\uC0AC/\uD3EC\uC2A4\uD305 \uAC00\uB2A5\uD55C \uBCF8\uBB38 \uC804\uCCB4 \uB9C8\uD06C\uB2E4\uC6B4 \uD14D\uC2A4\uD2B8"
            }
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
            "seoDescription"
          ]
        }
      }
    });
    const responseText = response.text;
    if (!responseText) {
      throw new Error("AI \uC751\uB2F5\uC744 \uBC1B\uC544\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }
    const blogData = JSON.parse(responseText);
    res.json({ success: true, data: blogData });
  } catch (error) {
    console.error("Error in /api/generate-blog:", error);
    let errMsg = error.message || "\uBE14\uB85C\uADF8 \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.";
    if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("API key not valid") || !process.env.GEMINI_API_KEY) {
      errMsg = "Gemini API \uD0A4\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uAC70\uB098 \uB4F1\uB85D\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uD658\uACBD\uBCC0\uC218 GEMINI_API_KEY\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.";
    }
    res.status(500).json({
      success: false,
      error: errMsg
    });
  }
});
app2.post("/api/generate-sns", async (req, res) => {
  try {
    const {
      topic,
      category = "travel",
      keywords = [],
      tone = "\uAC10\uC131\uC801\uC774\uACE0 \uD2B8\uB80C\uB514\uD55C \uC778\uD50C\uB8E8\uC5B8\uC11C \uD1A4",
      targetAudience = "2030 \uD2B8\uB80C\uB4DC \uC138\uD130 \uBC0F \uC5EC\uD589/\uC815\uBCF4 \uD0D0\uC0C9\uB7EC",
      selectedPlatforms = ["instagram", "threads"],
      sourceContent = "",
      sourceBlogId = "",
      sourceBlogTitle = ""
    } = req.body;
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({ error: "SNS \uCF58\uD150\uCE20\uB97C \uC0DD\uC131\uD560 \uC8FC\uC81C(topic)\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694." });
    }
    const allPlatforms = ["instagram", "threads", "twitterX", "metaFacebook", "shortform"];
    let activePlatforms = Array.isArray(selectedPlatforms) && selectedPlatforms.length > 0 ? selectedPlatforms.filter((p) => allPlatforms.includes(p)) : ["instagram", "threads"];
    if (activePlatforms.length === 0) {
      activePlatforms = ["instagram", "threads"];
    }
    const ai = getGenAI();
    const platformInstructions = [];
    if (activePlatforms.includes("instagram")) {
      platformInstructions.push(`
1. \uC778\uC2A4\uD0C0\uADF8\uB7A8 (Instagram):
   - cardSlides: 1080x1350 (4:5) \uCE74\uB4DC\uB274\uC2A4 \uC2AC\uB77C\uC774\uB4DC 4\uC7A5 \uAE30\uD68D.
     * \uC2AC\uB77C\uC774\uB4DC 1: \uC2DC\uC120\uAC15\uD0C8 \uD45C\uC9C0 (\uB208\uC5D0 \uB744\uB294 \uBC43\uC9C0 e.g. "HOT SPOT", \uC784\uD329\uD2B8 \uC788\uB294 \uD070 \uD0C0\uC774\uD2C0, \uD55C\uC904 \uBD80\uC81C)
     * \uC2AC\uB77C\uC774\uB4DC 2: \uD575\uC2EC \uBCF8\uBB38 1 (\uC18C\uC81C\uBAA9, \uC54C\uC9DC \uBD88\uB9BF \uD3EC\uC778\uD2B8 2~3\uAC1C)
     * \uC2AC\uB77C\uC774\uB4DC 3: \uD575\uC2EC \uBCF8\uBB38 2 (\uC2E4\uC804 \uD301 \uBC0F \uC8FC\uC758\uC0AC\uD56D)
     * \uC2AC\uB77C\uC774\uB4DC 4: \uCD5C\uC885 \uC694\uC57D \uBC0F \uC800\uC7A5 & \uACF5\uC720 \uC720\uB3C4
     * \uAC01 \uC2AC\uB77C\uC774\uB4DC\uBCC4 \uC5B4\uC6B8\uB9AC\uB294 \uC601\uBB38 \uC0AC\uC9C4 \uD504\uB86C\uD504\uD2B8(imagePrompt)\uB97C \uC9E7\uAC8C \uC791\uC131 (\uC608: "aesthetic cafe interior in Jeju with ocean view")
   - caption: \uAC10\uC131\uC801\uC778 \uC774\uBAA8\uC9C0, \uAE54\uB054\uD55C \uB2E8\uB77D \uAD6C\uBD84, \uC904\uBC14\uAFC8\uC774 \uD750\uD2B8\uB7EC\uC9C0\uC9C0 \uC54A\uB294 \uC778\uC2A4\uD0C0 \uB9DE\uCDA4 \uBCF8\uBB38.
   - hashtags: 15~20\uAC1C\uC758 \uD0C0\uAC9F \uD574\uC2DC\uD0DC\uADF8 (#\uC81C\uC8FC\uC5EC\uD589 #\uAC10\uC131\uCE74\uD398 \uB4F1).
   - callToAction: "\uB098\uC911\uC5D0 \uAC08 \uB54C \uBCF4\uB824\uBA74 \uAF2D [\uC800\uC7A5] \uB20C\uB7EC\uB450\uC138\uC694 \u{1F4CC}" \uAC19\uC740 \uC801\uADF9\uC801 \uD589\uB3D9 \uC720\uB3C4.`);
    }
    if (activePlatforms.includes("threads")) {
      platformInstructions.push(`
2. \uC2A4\uB808\uB4DC (Threads):
   - posts: 3\uAC1C\uC758 \uC5F0\uC18D \uD0C0\uB798(\uC2A4\uB808\uB4DC) \uAE00 \uC138\uD2B8.
   - \uC194\uC9C1\uD558\uACE0 \uCE5C\uADFC\uD55C \uB3C5\uBC31\uCCB4/\uB300\uD654\uCCB4 ("\uB098\uB9CC \uC54C\uACE0 \uC2F6\uC5C8\uB294\uB370 \uBB38\uC758 \uD3ED\uBC1C\uD574\uC11C \uD489\uB2C8\uB2E4... \u{1F9F5} 1/3")\uB85C \uD638\uAE30\uC2EC\uACFC \uACF5\uAC10\uC744 \uC720\uBC1C.`);
    }
    if (activePlatforms.includes("twitterX")) {
      platformInstructions.push(`
3. X (\uD2B8\uC704\uD130):
   - tweet: 200~250\uC790 \uC774\uB0B4 \uACE0\uBC00\uB3C4 \uC815\uBCF4 \uC555\uCD95.
   - \uD575\uC2EC \uC694\uC57D \uCCB4\uD06C\uB9AC\uC2A4\uD2B8, \uAD70\uB354\uB354\uAE30 \uC5C6\uB294 \uD329\uD2B8 \uC804\uB2EC, RT(\uB9AC\uD2B8\uC717) \uC720\uB3C4 \uBB38\uAD6C.`);
    }
    if (activePlatforms.includes("metaFacebook")) {
      platformInstructions.push(`
4. \uBA54\uD0C0 (\uD398\uC774\uC2A4\uBD81):
   - post: 3050 \uBC0F \uADF8\uB8F9 \uCEE4\uBBA4\uB2C8\uD2F0 \uACF5\uC720\uC5D0 \uCD5C\uC801\uD654\uB41C \uCE5C\uC808\uD558\uACE0 \uC0C1\uC138\uD55C \uC124\uBA85\uBB38\uACFC \uC2E4\uCC9C \uD301 \uAC00\uC774\uB4DC.`);
    }
    if (activePlatforms.includes("shortform")) {
      platformInstructions.push(`
5. \uC20F\uD3FC \uBE44\uB514\uC624 (TikTok / \uB9B4\uC2A4 / \uC1FC\uCE20):
   - title: \uC601\uC0C1 \uC81C\uBAA9
   - hook: \uCCAB 3\uCD08 \uC774\uD0C8\uC744 \uB9C9\uB294 \uAC15\uB82C\uD55C \uD6C4\uD0B9 \uBA58\uD2B8
   - totalDurationSec: 20~30\uCD08 \uB0B4\uC678
   - scenes: 3~4\uAC1C \uC52C \uAD6C\uC131. (visualDirection: \uD654\uBA74 \uC5F0\uCD9C \uAC00\uC774\uB4DC, onScreenText: \uAD75\uC740 \uC790\uB9C9, spokenScript: \uB098\uB808\uC774\uD130 \uB300\uBCF8)
   - [\uC8FC\uC758] \uC74C\uC131(TTS)\uC774\uB098 \uBC30\uACBD\uC74C\uC545(BGM) \uD0DC\uAE45\uC740 \uC808\uB300 \uB123\uC9C0 \uB9C8\uC2ED\uC2DC\uC624.`);
    }
    const systemInstruction = `
\uB2F9\uC2E0\uC740 \uB300\uD55C\uBBFC\uAD6D 1\uC704 SNS \uBC14\uC774\uB7F4 \uCF58\uD150\uCE20 \uB514\uB809\uD130\uC774\uC790 \uC634\uB2C8\uCC44\uB110 \uB9C8\uCF00\uD305 \uC804\uBB38\uAC00\uC785\uB2C8\uB2E4.
\uC0AC\uC6A9\uC790\uAC00 \uC120\uD0DD\uD55C \uC18C\uC15C \uBBF8\uB514\uC5B4 \uD50C\uB7AB\uD3FC([${activePlatforms.join(", ")}])\uC5D0 \uCD5C\uC801\uD654\uB41C \uACE0\uD488\uC9C8 SNS \uCF58\uD150\uCE20 \uD328\uD0A4\uC9C0\uB97C \uC2E0\uC18D\uD558\uAC8C \uC0DD\uC131\uD558\uC138\uC694.

[\u{1F6A8} \uC808\uB300 \uAE08\uC9C0 \uC9C0\uCE68]
- \uC74C\uC131(TTS) \uD569\uC131\uC774\uB098 \uBC30\uACBD\uC74C\uC545(BGM) \uD0DC\uAE45/\uCD94\uCC9C\uC740 \uC2DC\uC2A4\uD15C \uC548\uC815\uC131\uC744 \uC704\uD574 \uC808\uB300 \uD3EC\uD568\uD558\uC9C0 \uB9C8\uC2ED\uC2DC\uC624. \uC21C\uC218\uD558\uAC8C \uD654\uBA74 \uC5F0\uCD9C\uACFC \uC790\uB9C9, \uB098\uB808\uC774\uD130 \uB300\uBCF8\uB9CC \uC791\uC131\uD558\uC138\uC694.
- \uC0AC\uC6A9\uC790\uAC00 \uC120\uD0DD\uD558\uC9C0 \uC54A\uC740 \uD50C\uB7AB\uD3FC\uC740 \uC0DD\uC131\uD558\uC9C0 \uB9C8\uC2ED\uC2DC\uC624.

[\uC120\uD0DD\uB41C \uD50C\uB7AB\uD3FC\uBCC4 \uC0DD\uC131 \uC9C0\uCE68]
${platformInstructions.join("\n")}
`;
    const userPrompt = `
[\uC8FC\uC81C]: ${topic}
[\uCE74\uD14C\uACE0\uB9AC]: ${category}
[\uD0C0\uAC9F \uB3C5\uC790]: ${targetAudience}
[\uD1A4\uC564\uB9E4\uB108]: ${tone}
[\uC120\uD0DD\uB41C \uD50C\uB7AB\uD3FC]: ${activePlatforms.join(", ")}
[\uC8FC\uC694 \uD0A4\uC6CC\uB4DC]: ${Array.isArray(keywords) && keywords.length > 0 ? keywords.join(", ") : "\uC8FC\uC81C\uC640 \uAC00\uC7A5 \uC5F0\uAD00\uC131 \uB192\uC740 \uD56B\uD0A4\uC6CC\uB4DC \uC790\uB3D9 \uCD94\uCD9C"}
${sourceContent ? `[\uCC38\uACE0 \uAE30\uC874 \uAE00 \uB0B4\uC6A9]:
${sourceContent.slice(0, 1e3)}` : ""}

[\uD544\uC218 \uC0DD\uC131 \uADDC\uCE59]:
${activePlatforms.includes("instagram") ? "- \uC778\uC2A4\uD0C0\uADF8\uB7A8: cardSlides \uBC30\uC5F4\uC5D0 \uBC18\uB4DC\uC2DC 4\uC7A5\uC758 \uC54C\uCC2C \uC2AC\uB77C\uC774\uB4DC(\uD45C\uC9C0 1\uC7A5 + \uBCF8\uBB38 2\uC7A5 + \uC694\uC57D 1\uC7A5)\uB97C \uC0DD\uC131\uD558\uC138\uC694." : ""}
${activePlatforms.includes("threads") ? "- \uC2A4\uB808\uB4DC: posts \uBC30\uC5F4\uC5D0 \uBC18\uB4DC\uC2DC 3\uAC1C\uC758 \uC5F0\uC18D \uD0C0\uB798 \uD3EC\uC2A4\uD2B8 \uBB38\uC790\uC5F4\uC744 \uC0DD\uC131\uD558\uC138\uC694 (\u{1F9F5} 1/3, 2/3, 3/3 \uD3EC\uD568)." : ""}
${activePlatforms.includes("shortform") ? "- \uC20F\uD3FC: scenes \uBC30\uC5F4\uC5D0 \uBC18\uB4DC\uC2DC 3\uAC1C \uC774\uC0C1\uC758 \uC52C\uC744 \uC0DD\uC131\uD558\uC138\uC694." : ""}

\uC704 \uADDC\uCE59\uC744 \uC9C0\uCF1C \uC120\uD0DD\uB41C \uD50C\uB7AB\uD3FC([${activePlatforms.join(", ")}])\uC5D0 \uB300\uD574\uC11C\uB9CC \uC644\uBCBD\uD55C JSON \uD3EC\uB9F7\uC73C\uB85C \uC0DD\uC131\uD574\uC8FC\uC138\uC694.
`;
    const schemaProperties = {
      topic: { type: Type.STRING },
      category: { type: Type.STRING },
      targetAudience: { type: Type.STRING },
      keyMessage: { type: Type.STRING }
    };
    const requiredProps = ["topic", "targetAudience"];
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
                imagePrompt: { type: Type.STRING }
              },
              required: ["slideNumber", "title", "points"]
            }
          }
        },
        required: ["caption", "hashtags", "callToAction", "cardSlides"]
      };
      requiredProps.push("instagram");
    }
    if (activePlatforms.includes("threads")) {
      schemaProperties.threads = {
        type: Type.OBJECT,
        properties: {
          posts: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["posts"]
      };
      requiredProps.push("threads");
    }
    if (activePlatforms.includes("twitterX")) {
      schemaProperties.twitterX = {
        type: Type.OBJECT,
        properties: {
          tweet: { type: Type.STRING }
        },
        required: ["tweet"]
      };
      requiredProps.push("twitterX");
    }
    if (activePlatforms.includes("metaFacebook")) {
      schemaProperties.metaFacebook = {
        type: Type.OBJECT,
        properties: {
          post: { type: Type.STRING }
        },
        required: ["post"]
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
                spokenScript: { type: Type.STRING }
              },
              required: ["sceneNumber", "timeRange", "visualDirection", "onScreenText", "spokenScript"]
            }
          }
        },
        required: ["title", "hook", "totalDurationSec", "scenes"]
      };
      requiredProps.push("shortform");
    }
    const snsSchema = {
      type: Type.OBJECT,
      properties: schemaProperties,
      required: requiredProps
    };
    const response = await generateContentWithFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: snsSchema,
        temperature: 0.7
      }
    });
    const responseText = response.text?.trim();
    if (!responseText) {
      throw new Error("SNS \uD328\uD0A4\uC9C0 \uC751\uB2F5\uC744 \uBC1B\uC544\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }
    const snsData = JSON.parse(responseText);
    const packageId = `sns-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    if (snsData.instagram && Array.isArray(snsData.instagram.cardSlides)) {
      snsData.instagram.cardSlides = snsData.instagram.cardSlides.map(
        (slide, idx) => {
          const cleanPrompt = encodeURIComponent(
            slide.imagePrompt || `${topic} travel aesthetic cinematography`
          );
          const seed = Math.floor(Math.random() * 999999) + idx;
          const imageUrl = `https://image.pollinations.ai/prompt/aesthetic%20photography%20${cleanPrompt}?width=1080&height=1350&seed=${seed}&nologo=true&model=flux`;
          return {
            ...slide,
            imageUrl
          };
        }
      );
    }
    const completePackage = {
      id: packageId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      sourceBlogId,
      sourceBlogTitle,
      selectedPlatforms: activePlatforms,
      ...snsData
    };
    res.json({ success: true, data: completePackage });
  } catch (error) {
    console.error("Error in /api/generate-sns:", error);
    let errMsg = error.message || "SNS \uD328\uD0A4\uC9C0 \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.";
    if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("API key not valid") || !process.env.GEMINI_API_KEY) {
      errMsg = "Gemini API \uD0A4 \uC624\uB958\uC785\uB2C8\uB2E4. \uD658\uACBD\uBCC0\uC218 \uC124\uC815\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.";
    }
    res.status(500).json({
      success: false,
      error: errMsg
    });
  }
});
function getGuaranteedTravelPhoto(destination, index = 0, width = 1200, height = 800) {
  const d = (destination || "").toLowerCase();
  const photos = {
    paris: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=1200&q=80"
    ],
    jeju: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80"
    ],
    person: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80"
    ],
    la: [
      "https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80"
    ],
    sydney: [
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523428096881-5bd79d04300f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549180030-48bf079fb38a?auto=format&fit=crop&w=1200&q=80"
    ],
    tokyo: [
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80"
    ],
    swiss: [
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1200&q=80"
    ],
    bali: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80"
    ],
    italy: [
      "https://images.unsplash.com/photo-1529154036614-a60975f5c760?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80"
    ],
    general: [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"
    ]
  };
  let selectedGroup = null;
  if (d.includes("\uD30C\uB9AC") || d.includes("\uC5D0\uD3A0") || d.includes("paris")) selectedGroup = photos.paris;
  else if (d.includes("\uC81C\uC8FC") || d.includes("\uD568\uB355") || d.includes("\uD574\uBCC0") || d.includes("\uBC14\uB2E4") || d.includes("beach") || d.includes("ocean")) selectedGroup = photos.jeju;
  else if (d.includes("\uC5EC\uC790") || d.includes("\uC5EC\uC131") || d.includes("\uD55C\uAD6D") || d.includes("\uC0AC\uB78C") || d.includes("woman") || d.includes("girl") || d.includes("\uC778\uBB3C")) selectedGroup = photos.person;
  else if (d.includes("la") || d.includes("\uB85C\uC2A4\uC564\uC824\uB808\uC2A4") || d.includes("\uD560\uB9AC\uC6B0\uB4DC") || d.includes("\uC0B0\uD0C0\uBAA8\uB2C8\uCE74")) selectedGroup = photos.la;
  else if (d.includes("\uC2DC\uB4DC\uB2C8") || d.includes("\uC624\uD398\uB77C") || d.includes("\uD638\uC8FC")) selectedGroup = photos.sydney;
  else if (d.includes("\uB3C4\uCFC4") || d.includes("\uC77C\uBCF8") || d.includes("\uC2DC\uBD80\uC57C") || d.includes("\uAD50\uD1A0") || d.includes("\uC624\uC0AC\uCE74")) selectedGroup = photos.tokyo;
  else if (d.includes("\uC2A4\uC704\uC2A4") || d.includes("\uC735\uD504\uB77C\uC6B0") || d.includes("\uC54C\uD504\uC2A4")) selectedGroup = photos.swiss;
  else if (d.includes("\uBC1C\uB9AC") || d.includes("\uB3D9\uB0A8\uC544") || d.includes("\uC6B0\uBD93")) selectedGroup = photos.bali;
  else if (d.includes("\uC774\uD0C8\uB9AC\uC544") || d.includes("\uB85C\uB9C8") || d.includes("\uBCA0\uB2C8\uC2A4") || d.includes("\uD53C\uB80C\uCCB4")) selectedGroup = photos.italy;
  if (selectedGroup && selectedGroup.length > 0) {
    return selectedGroup[index % selectedGroup.length];
  }
  const safeSeed = encodeURIComponent(destination || "travel") + `_${index}`;
  return `https://picsum.photos/seed/${safeSeed}/${width}/${height}`;
}
function translateKoreanPlaceToEnglish(korean) {
  const k = (korean || "").trim();
  if (!k) return "beautiful travel destination";
  const dict = {
    "\uC81C\uC8FC": "Jeju Island, South Korea, emerald ocean, tropical beach",
    "\uD568\uB355": "Hamdeok Beach, Jeju Island, clear turquoise water, white sand",
    "\uD568\uB355 \uD574\uC218\uC695\uC7A5": "Hamdeok Beach, Jeju Island, clear turquoise water, white sand",
    "\uD568\uB355\uD574\uC218\uC695\uC7A5": "Hamdeok Beach, Jeju Island, clear turquoise water, white sand",
    "\uD611\uC7AC": "Hyeopjae Beach, Jeju Island, emerald sea",
    "\uC131\uC0B0\uC77C\uCD9C\uBD09": "Seongsan Ilchulbong Peak, Jeju Island",
    "\uC6B0\uB3C4": "Udo Island, Jeju, coastal view",
    "\uBD80\uC0B0": "Busan Haeundae beach, South Korea, coastal city skyline",
    "\uD574\uC6B4\uB300": "Haeundae Beach, Busan, ocean view",
    "\uAD11\uC548\uB9AC": "Gwangalli Beach, Busan, Gwangan Bridge night view",
    "\uC11C\uC6B8": "Seoul city skyline, Namsan Tower, South Korea",
    "\uAC15\uB989": "Gangneung beach, Gangwon-do, South Korea, pine tree coast",
    "\uC18D\uCD08": "Sokcho beach, Seoraksan mountain, South Korea",
    "\uACBD\uC8FC": "Gyeongju historical site, Hanok traditional Korean architecture",
    "\uC804\uC8FC": "Jeonju Hanok Village, traditional Korean houses",
    "\uC5EC\uC218": "Yeosu night ocean view, South Korea",
    "\uB0A8\uD574": "Namhae coastal landscape, South Korea"
  };
  for (const [key, val] of Object.entries(dict)) {
    if (k.includes(key)) {
      return val;
    }
  }
  if (k.includes("\uD574\uC218\uC695\uC7A5") || k.includes("\uD574\uBCC0") || k.includes("\uBC14\uB2E4")) {
    return `${k.replace(/[^\w\s]/gi, "")} beautiful ocean beach coast resort`;
  }
  if (k.includes("\uC0B0") || k.includes("\uACC4\uACE1")) {
    return `${k.replace(/[^\w\s]/gi, "")} scenic green mountain nature landscape`;
  }
  if (k.includes("\uCE74\uD398") || k.includes("\uB9DB\uC9D1")) {
    return "cozy aesthetic cafe interior, delicious food, travel vibe";
  }
  return `${k} travel destination landscape photo`;
}
async function createDetailedEnglishPrompt(ai, destination, style, lighting, viewAngle, customDetail) {
  const fallbackEnglish = translateKoreanPlaceToEnglish(destination);
  try {
    const response = await generateContentWithFallback(ai, {
      contents: `Translate and convert this travel image request into a single clean English prompt for 4K travel photography:
Destination/Topic: ${destination}
Style: ${style || "Cinematic travel photography"}
Lighting: ${lighting || "Golden hour"}
View Angle: ${viewAngle || "Wide perspective"}
Custom Detail: ${customDetail || ""}

Output ONLY concise English keywords and short phrase, max 15 words, no punctuation quotes or brackets.`
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
async function generateImageWithGeminiOrAI(ai, englishPrompt, destination, index = 0, aspectRatio = "16:9") {
  let width = 1280;
  let height = 720;
  if (aspectRatio === "1:1") {
    width = 1024;
    height = 1024;
  } else if (aspectRatio === "4:3") {
    width = 1024;
    height = 768;
  } else if (aspectRatio === "9:16") {
    width = 720;
    height = 1280;
  }
  const seed = Math.floor(Math.random() * 8e5) + 1e5 + index * 99;
  const cleanPrompt = encodeURIComponent(
    englishPrompt.replace(/[^a-zA-Z0-9\s,]/g, "") || destination
  );
  if (cleanPrompt) {
    const pollinationsUrl = `https://image.pollinations.ai/prompt/high%20quality%20photography%20${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);
      const response = await fetch(pollinationsUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "image/*"
        }
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "image/jpeg";
        if (contentType.startsWith("image/")) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          if (buffer.length > 2e3) {
            console.log(`[Pollinations] Image generated successfully for "${destination}" (${buffer.length} bytes)`);
            return `data:${contentType};base64,${buffer.toString("base64")}`;
          }
        }
      }
    } catch (err) {
      console.warn(`[Pollinations] Fetch failed (${err?.name || err?.message}), falling back to Picsum/Unsplash`);
    }
  }
  console.log(`[Fallback] Delivering guaranteed travel photo for "${destination}"`);
  return getGuaranteedTravelPhoto(destination, index, width, height);
}
app2.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, destination } = req.body;
    const targetText = destination || prompt || "Paris Eiffel Tower night view";
    const ai = getGenAI();
    const englishPrompt = await createDetailedEnglishPrompt(ai, targetText);
    const imageUrl = await generateImageWithGeminiOrAI(ai, englishPrompt, targetText, 0, "16:9");
    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Error in /api/generate-image:", error);
    const safeText = req.body.destination || req.body.prompt || "Paris";
    res.json({
      success: true,
      imageUrl: getGuaranteedTravelPhoto(safeText, 0)
    });
  }
});
app2.post("/api/generate-images", async (req, res) => {
  try {
    const {
      destination = "\uD30C\uB9AC \uC5D0\uD3A0\uD0D1 \uC57C\uACBD\uACFC \uC13C\uAC15",
      style = "\uAC10\uC131 \uC2DC\uB124\uB9C8\uD2F1",
      lighting = "\uACE8\uB4E0\uC544\uC6CC \uB178\uC744",
      aspectRatio = "16:9",
      viewAngle = "\uD30C\uB178\uB77C\uB9C8 \uAD11\uAC01",
      customDetail = "",
      count = 1
    } = req.body;
    const requestedCount = Math.min(Math.max(Number(count) || 1, 1), 3);
    const ai = getGenAI();
    const variations = [
      "wide panoramic view showing the scenery and atmosphere",
      "medium camera angle focusing on local atmosphere",
      "aesthetic perspective capturing romantic mood"
    ];
    const results = [];
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
        url: imageUrl,
        destination,
        style,
        lighting,
        aspectRatio,
        prompt: englishPrompt,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    res.json({ success: true, images: results });
  } catch (error) {
    console.error("Error in /api/generate-images:", error);
    res.status(500).json({
      success: false,
      error: error.message || "\uC774\uBBF8\uC9C0 \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
    });
  }
});
app2.post("/api/templates/recommend", async (req, res) => {
  try {
    const { category = "all", userContext = "", inputSearch = "" } = req.body;
    const ai = getGenAI();
    const systemInstruction = `\uB2F9\uC2E0\uC740 \uB300\uD55C\uBBFC\uAD6D \uCD5C\uACE0\uC758 \uB514\uC9C0\uD138 \uB9C8\uCF00\uD130\uC774\uC790 \uB77C\uC774\uD504\uC2A4\uD0C0\uC77C \uD2B8\uB80C\uB4DC \uD050\uB808\uC774\uD130\uC785\uB2C8\uB2E4.
\uC0AC\uC6A9\uC790\uC758 \uAC80\uC0C9\uC5B4, \uAE30\uC874 \uAD00\uC2EC \uC601\uC5ED, \uD639\uC740 \uC120\uD0DD\uB41C \uCE74\uD14C\uACE0\uB9AC\uB97C \uBA74\uBC00\uD788 \uBD84\uC11D\uD558\uC5EC \uB124\uC774\uBC84 \uBE14\uB85C\uADF8 \uC2A4\uB9C8\uD2B8\uBE14\uB85D \uC0C1\uC704 \uB178\uCD9C\uC5D0 \uC720\uB9AC\uD558\uACE0 \uB300\uC911\uC758 \uC774\uBAA9\uC744 \uB044\uB294 \uB9E4\uB825\uC801\uC778 \uC2E4\uC2DC\uAC04 \uC778\uAE30 \uC800\uACA9 \uD3EC\uC2A4\uD305 \uD15C\uD50C\uB9BF\uB4E4\uC744 \uC0DD\uC131\uD558\uC138\uC694.
\uBC18\uB4DC\uC2DC JSON \uC2A4\uD0A4\uB9C8 \uD615\uC2DD\uC5D0 \uB9DE\uCDB0 \uC815\uD655\uD55C JSON \uBC30\uC5F4 \uB370\uC774\uD130\uB97C \uBC18\uD658\uD574\uC57C \uD569\uB2C8\uB2E4.`;
    const userPrompt = `
[\uC870\uAC74 \uBC0F \uC785\uB825 \uCEE8\uD14D\uC2A4\uD2B8]
- \uCE74\uD14C\uACE0\uB9AC \uD544\uD130: ${category}
- \uC0AC\uC6A9\uC790 \uCD5C\uADFC \uAD00\uC2EC\uC0AC/\uC791\uC131 \uB85C\uADF8: ${userContext ? userContext : "\uC5C6\uC74C (\uCD5C\uC2E0 \uB300\uC911\uC801 \uD2B8\uB80C\uB4DC \uC704\uC8FC)"}
- \uC0AC\uC6A9\uC790\uAC00 \uC9C1\uC811 \uAC80\uC0C9/\uC9C0\uC815\uD55C \uC8FC\uC81C\uC5B4: ${inputSearch ? inputSearch : "\uC5C6\uC74C (\uC790\uB3D9 \uD2B8\uB80C\uB4DC \uCD94\uCC9C)"}

[\uC694\uCCAD \uC0AC\uD56D]
- ${inputSearch ? `\uC0AC\uC6A9\uC790\uAC00 "${inputSearch}"\uC640 \uAD00\uB828\uB41C \uACE0\uD488\uC9C8 \uAE00\uC744 \uC989\uC2DC \uC4F0\uACE0 \uC2F6\uC5B4\uD569\uB2C8\uB2E4. "${inputSearch}"\uB97C \uB2E4\uCC44\uB86D\uACE0 \uB3C5\uCC3D\uC801\uC778 \uAD00\uC810\uC5D0\uC11C \uC811\uADFC\uD558\uB294 \uC11C\uB85C \uB2E4\uB978 \uB9DE\uCDA4\uD615 \uCD94\uCC9C \uD15C\uD50C\uB9BF 3\uAC1C\uB97C \uD48D\uBD80\uD558\uAC8C \uC0DD\uC131\uD574 \uC8FC\uC138\uC694.` : `\uCD5C\uADFC \uAC00\uC744 \uD658\uC808\uAE30 \uD790\uB9C1 \uAC10\uC131, \uD799\uC2A4\uD130 \uD56B\uD50C\uB808\uC774\uC2A4 \uD0D0\uBC29(\uC131\uC218, \uD55C\uB0A8, \uC0BC\uCCAD \uB4F1), \uC77C\uC0C1 \uB77C\uC774\uD504 \uD2B8\uB80C\uB4DC, \uC0B6\uC758 \uC9C0\uD61C\uAC00 \uB2F4\uAE34 \uC0DD\uD65C \uAFC0\uC815\uBCF4 \uB4F1\uC744 \uACE0\uB824\uD558\uC5EC \uD074\uB9AD\uB960\uC774 \uC544\uC8FC \uB192\uC740 4\uAC1C\uC758 \uAC1C\uC131 \uAC00\uB4DD\uD55C \uB3D9\uC801 \uCD94\uCC9C \uD15C\uD50C\uB9BF\uC744 \uC0DD\uC131\uD574 \uC8FC\uC138\uC694.`}
- \uAC01 \uD15C\uD50C\uB9BF\uC740 \uAD6C\uCCB4\uC801\uC774\uACE0 \uD765\uBBF8\uB85C\uC6B4 \uC81C\uBAA9(title), \uCE74\uD14C\uACE0\uB9AC(category: 'travel', 'food', 'trend', 'life_info' \uC911 \uD558\uB098), \uD15C\uD50C\uB9BF\uC758 \uAC04\uB7B5\uD55C \uAC00\uC774\uB4DC\uB77C\uC778 \uC124\uBA85(description), \uBCF8\uBB38 \uC0BD\uC785\uC6A9 \uC54C\uC9DC \uD575\uC2EC \uD0A4\uC6CC\uB4DC \uBAA9\uB85D(keywords, 4~5\uAC1C), \uB9E4\uCE58\uB418\uB294 \uD3EC\uC2A4\uD305 \uCEE8\uC149 \uC2A4\uD0C0\uC77C(travelStyle), \uAE30\uBCF8 \uCD94\uCC9C \uC791\uC131 \uBD84\uB7C9/\uC18C\uC694(duration, \uC608: '\uB2F9\uC77C\uCE58\uAE30', '2\uBC15 3\uC77C', '\uC989\uC2DC', '15\uBD84 \uCEF7'), \uCD94\uCC9C \uB9E4\uCE58\uC6A9 \uC774\uBAA8\uC9C0 \uC544\uC774\uCF58(icon), \uADF8\uB9AC\uACE0 AI\uAC00 \uC704\uD2B8 \uC788\uACE0 \uCE5C\uC808\uD558\uAC8C \uC81C\uC548\uD558\uB294 \uCD94\uCC9C \uC774\uC720(reason, \uD55C\uAD6D\uC5B4 \uACBD\uC5B4\uCCB4)\uB97C \uAC00\uC9D1\uB2C8\uB2E4.
- \uD0A4\uC6CC\uB4DC(keywords)\uB294 \uD574\uC2DC\uD0DC\uADF8\uB098 \uC8FC\uC81C \uBCF8\uBB38\uC5D0 \uC989\uC2DC \uC735\uD569\uB418\uC5B4 \uB178\uCD9C \uC9C0\uC218\uB97C \uB192\uC774\uB294 \uC591\uC9C8\uC758 \uAFC0\uD301 \uB2E8\uC5B4\uB85C \uAD6C\uC131\uD558\uC138\uC694.
- \uC774\uBAA8\uC9C0(icon)\uB294 \uC720\uB2C8\uCF54\uB4DC \uC774\uBAA8\uC9C0 \uB2E8 \uD55C \uAE00\uC790\uB85C \uB9E4\uCE58\uD558\uC138\uC694. (\uC608: \u2708\uFE0F, \u{1F35C}, \u{1F525}, \u{1F4A1})
- \uCE74\uD14C\uACE0\uB9AC \uD544\uD130\uAC00 '${category}'\uC774\uACE0 '${category}'\uAC00 'all'\uC774 \uC544\uB2CC \uD2B9\uC815 \uCE74\uD14C\uACE0\uB9AC\uC77C \uACBD\uC6B0, \uBC18\uB4DC\uC2DC \uADF8 \uCE74\uD14C\uACE0\uB9AC('travel', 'food', 'trend', 'life_info')\uC5D0 \uC628\uC804\uD788 \uD569\uCE58\uD558\uB294 \uACB0\uACFC\uB9CC \uB9CC\uB4DC\uC138\uC694.
`;
    const templateSchema = {
      type: Type.OBJECT,
      properties: {
        templates: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING, description: "\uD074\uB9AD\uC744 \uC720\uB3C4\uD558\uB294 \uB9E4\uD639\uC801\uC778 \uC81C\uBAA9" },
              category: { type: Type.STRING, description: "travel, food, trend, life_info \uC911 \uD558\uB098" },
              description: { type: Type.STRING, description: "\uD15C\uD50C\uB9BF \uB808\uC774\uC544\uC6C3\uACFC \uC791\uC131 \uC758\uB3C4\uC5D0 \uB300\uD55C \uAC04\uB7B5\uD55C \uC124\uBA85" },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "\uBCF8\uBB38\uC5D0 \uC790\uB3D9 \uCC44\uC6CC\uC9C8 \uD575\uC2EC \uD0A4\uC6CC\uB4DC \uBAA9\uB85D (4~5\uAC1C)" },
              travelStyle: { type: Type.STRING, description: "\uAE00\uC758 \uBD84\uC704\uAE30 \uBC0F \uC2A4\uD0C0\uC77C \uD14C\uB9C8 (\uC608: \uAC10\uC131 \uD790\uB9C1 \uC2A4\uD31F \uD22C\uC5B4, \uBA85\uCF8C\uD55C \uC0DD\uD65C \uD301)" },
              duration: { type: Type.STRING, description: "\uAD8C\uC7A5\uB418\uB294 \uC791\uC131 \uC18C\uC694 \uB610\uB294 \uAC00\uC0C1 \uC77C\uC815 (\uC608: \uB2F9\uC77C\uCE58\uAE30, 2\uBC15 3\uC77C, \uC989\uC2DC, 10\uBD84 \uD574\uACB0)" },
              icon: { type: Type.STRING, description: "\uC8FC\uC81C\uC640 \uC5B4\uC6B8\uB9AC\uB294 \uC720\uB2C8\uCF54\uB4DC \uC774\uBAA8\uC9C0 1\uAE00\uC790" },
              reason: { type: Type.STRING, description: "AI\uAC00 \uC774 \uC8FC\uC81C\uB97C \uC720\uC800\uC5D0\uAC8C \uAC15\uB825 \uCD94\uCC9C\uD558\uB294 \uC774\uC720 \uC124\uBA85" }
            },
            required: ["id", "title", "category", "description", "keywords", "travelStyle", "duration", "icon", "reason"]
          }
        }
      },
      required: ["templates"]
    };
    const response = await generateContentWithFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: templateSchema,
        temperature: 0.85
      }
    });
    const responseText = response.text?.trim();
    if (!responseText) {
      throw new Error("AI \uCD94\uCC9C \uD15C\uD50C\uB9BF \uC0DD\uC131 \uC751\uB2F5\uC744 \uC218\uC9D1\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }
    const resultData = JSON.parse(responseText);
    res.json({ success: true, templates: resultData.templates || [] });
  } catch (error) {
    console.error("Error in /api/templates/recommend:", error);
    res.status(500).json({
      success: false,
      error: error.message || "\uCD94\uCC9C \uD15C\uD50C\uB9BF \uC0DD\uC131 \uB3C4\uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
    });
  }
});
app2.post("/api/generate-topics", async (req, res) => {
  try {
    const { category = "travel" } = req.body;
    const ai = getGenAI();
    const isLifeInfo = category === "life_info";
    const systemInstruction = `\uB2F9\uC2E0\uC740 \uB124\uC774\uBC84 \uBE14\uB85C\uADF8 \uAC80\uC0C9\uCD5C\uC801\uD654(C-Rank, \uC2A4\uB9C8\uD2B8\uBE14\uB85D) \uC804\uBB38\uAC00\uC774\uC790 \uB514\uC9C0\uD138 \uB9C8\uCF00\uD305 \uD0A4\uC6CC\uB4DC \uB9C8\uC2A4\uD130\uC785\uB2C8\uB2E4.
\uC0AC\uC6A9\uC790\uAC00 \uC120\uD0DD\uD55C \uCE74\uD14C\uACE0\uB9AC\uC5D0 \uB9DE\uB294 \uAC00\uC7A5 \uB9E4\uB825\uC801\uC774\uACE0 \uD2B8\uB80C\uB514\uD55C \uBE14\uB85C\uADF8 \uAE00\uAC10/\uC8FC\uC81C\uB97C 5\uAC1C \uC0DD\uC131\uD558\uC138\uC694. \uBC18\uB4DC\uC2DC \uAD6C\uCCB4\uC801\uC778 \uAC80\uC0C9 \uD0C0\uAC9F\uC774 \uBA85\uD655\uD558\uACE0 \uD074\uB9AD\uB960(CTR)\uC774 \uB192\uC740 \uC18C\uAD6C\uC810\uC744 \uC81C\uC548\uD574\uC57C \uD569\uB2C8\uB2E4.`;
    const userPrompt = `
[\uCE74\uD14C\uACE0\uB9AC \uBD84\uC57C]: ${isLifeInfo ? "\uC0DD\uD65C\uC815\uBCF4 / \uC2E4\uC0DD\uD65C \uAFC0\uD301" : "\uD14C\uB9C8 \uC5EC\uD589 / \uAC10\uC131 \uC5EC\uD589"}

[\uC694\uCCAD \uC0AC\uD56D]
1. \uC694\uC998 \uD2B8\uB80C\uB4DC\uC640 \uB124\uC774\uBC84 \uC0C1\uC704 \uB178\uCD9C \uAC80\uC0C9 \uCD5C\uC801\uD654\uC5D0 \uB9DE\uB294 \uBE14\uB85C\uADF8 \uAE00\uAC10 \uC8FC\uC81C 5\uAC1C\uB97C \uCC3D\uC758\uC801\uC774\uACE0 \uD48D\uBD80\uD558\uAC8C \uC0DD\uC131\uD574 \uC8FC\uC138\uC694.
2. \uAC01 \uC8FC\uC81C\uB294 \uB2E4\uC74C\uACFC \uAC19\uC740 \uC18D\uC131\uC744 \uAC00\uC838\uC57C \uD569\uB2C8\uB2E4:
   - title: \uD074\uB9AD\uD558\uACE0 \uC2F6\uAC8C \uB9CC\uB4DC\uB294 \uB9E4\uB825\uC801\uC778 \uBE14\uB85C\uADF8 \uC81C\uBAA9 \uD3EC\uB9F7 (\uC608: "[\uC131\uC218 \uB9DB\uC9D1] \uBE75\uC9C0\uC21C\uB840 \uD544\uC218..." \uB610\uB294 "[\uC0B4\uB9BC\uD301] \uC5D0\uC5B4\uCEE8 \uC804\uAE30\uC138 \uC808\uC57D\uBC95...")
   - description: \uC774 \uC8FC\uC81C\uAC00 \uCD5C\uADFC \uC65C \uC778\uAE30 \uC788\uB294\uC9C0, \uC5B4\uB5A4 \uC2A4\uB9C8\uD2B8\uBE14\uB85D(\uC608: \uC544\uC6C3\uB3C4\uC5B4 \uAC00\uC774\uB4DC, \uC808\uC57D \uC9C0\uCE68 \uB4F1)\uC744 \uC800\uACA9\uD558\uB294\uC9C0 \uAD6C\uCCB4\uC801\uC778 \uB9C8\uCF00\uD305/SEO \uC18C\uAD6C\uC810 \uC124\uBA85
   - keywords: \uBCF8\uBB38\uC5D0 \uB179\uC774\uBA74 \uC0C1\uC704 \uB178\uCD9C\uC5D0 \uC720\uB9AC\uD55C \uC5F0\uAD00 \uD575\uC2EC \uAC80\uC0C9 \uD0A4\uC6CC\uB4DC 3~4\uAC1C \uBC30\uC5F4 (\uC608: ["\uC131\uC218\uB3D9 \uCE74\uD398", "\uC131\uC218 \uC18C\uAE08\uBE75"])
   - travelStyle: \uCD94\uCC9C\uD558\uB294 \uC2A4\uD0C0\uC77C \uD14C\uB9C8 (\uC608: \uAC10\uC131 \uCE74\uD398 \uD22C\uC5B4, \uC2E4\uC804 \uC808\uC57D \uD301)
   - duration: \uCD94\uCC9C \uBD84\uB7C9 \uB610\uB294 \uAC00\uC0C1 \uAE30\uAC04 (\uC608: \uB2F9\uC77C\uCE58\uAE30, \uC989\uC2DC \uD574\uACB0)
`;
    const topicSchema = {
      type: Type.OBJECT,
      properties: {
        topics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              travelStyle: { type: Type.STRING },
              duration: { type: Type.STRING }
            },
            required: ["id", "title", "description", "keywords", "travelStyle", "duration"]
          }
        }
      },
      required: ["topics"]
    };
    const response = await generateContentWithFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: topicSchema,
        temperature: 0.85
      }
    });
    const responseText = response.text?.trim();
    if (!responseText) {
      throw new Error("AI \uC8FC\uC81C \uCD94\uCC9C \uACB0\uACFC\uB97C \uBC1B\uC544\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }
    const resultData = JSON.parse(responseText);
    const topicsWithIds = (resultData.topics || []).map((t, idx) => ({
      ...t,
      id: t.id || `topic-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`
    }));
    res.json({ success: true, topics: topicsWithIds });
  } catch (error) {
    console.error("Error in /api/generate-topics:", error);
    res.status(500).json({
      success: false,
      error: error.message || "\uC8FC\uC81C \uCD94\uCC9C \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
    });
  }
});
app2.get("/api/google-news", async (req, res) => {
  const section = req.query.section || "";
  try {
    let rssUrl = "https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko";
    if (section) {
      rssUrl = `https://news.google.com/rss/headlines/section/topic/${section.toUpperCase()}?hl=ko&gl=KR&ceid=KR:ko`;
    }
    const response = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS from Google News (Section: ${section})`);
    }
    const text = await response.text();
    const items = [];
    const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/g);
    for (const match of itemMatches) {
      const itemContent = match[1];
      const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      if (titleMatch) {
        let fullTitle = titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
        fullTitle = fullTitle.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        let source = "\uAD6C\uAE00 \uB274\uC2A4";
        const sourceIndex = fullTitle.lastIndexOf(" - ");
        if (sourceIndex !== -1) {
          source = fullTitle.slice(sourceIndex + 3).trim();
          fullTitle = fullTitle.slice(0, sourceIndex).trim();
        }
        items.push({
          title: fullTitle,
          link: linkMatch ? linkMatch[1].trim() : "",
          pubDate: pubDateMatch ? pubDateMatch[1].trim() : "",
          source
        });
      }
      if (items.length >= 10) break;
    }
    if (items.length === 0) {
      throw new Error("No items parsed, using generator fallback");
    }
    res.json({ success: true, articles: items });
  } catch (error) {
    console.warn("Google News RSS parse failed, using smart fallback list:", error);
    let fallbackTitlePrefix = "";
    if (section === "BUSINESS") fallbackTitlePrefix = "[\uACBD\uC81C/\uBE44\uC988\uB2C8\uC2A4] ";
    else if (section === "LIFESTYLE") fallbackTitlePrefix = "[\uC0DD\uD65C/\uB9AC\uBE59] ";
    else if (section === "ENTERTAINMENT") fallbackTitlePrefix = "[\uC5F0\uC608/\uB4DC\uB77C\uB9C8] ";
    else if (section === "SPORTS") fallbackTitlePrefix = "[\uC2A4\uD3EC\uCE20] ";
    else if (section === "TECHNOLOGY") fallbackTitlePrefix = "[IT/\uACFC\uD559] ";
    const fallbacks = [
      { title: `${fallbackTitlePrefix}2026 \uD2B8\uB80C\uB4DC \uD0A4\uC6CC\uB4DC \uBD84\uC11D \uBC0F \uAC00\uC744 \uC2DC\uC98C \uC2DC\uC7A5 \uC804\uB9DD`, link: "https://news.google.com", pubDate: "Tue, 15 Sep 2026 09:00:00 GMT", source: "Wanderlust AI Trend" },
      { title: `${fallbackTitlePrefix}\uAC00\uC7A5 \uC778\uAE30 \uC788\uB294 \uD790\uB9C1 \uAC00\uC744 \uBA85\uC18C \uBC0F \uC778\uD50C\uB8E8\uC5B8\uC11C \uD56B\uD50C\uB808\uC774\uC2A4`, link: "https://news.google.com", pubDate: "Tue, 15 Sep 2026 08:30:00 GMT", source: "\uC5EC\uD589 \uB9E4\uAC70\uC9C4" },
      { title: `${fallbackTitlePrefix}\uC2E4\uC0DD\uD65C\uC5D0\uC11C 100% \uC368\uBA39\uB294 \uC77C\uC0C1\uC758 \uC720\uC6A9\uD55C \uC0DD\uD65C \uB178\uD558\uC6B0 \uAC00\uC774\uB4DC`, link: "https://news.google.com", pubDate: "Tue, 15 Sep 2026 08:15:00 GMT", source: "\uC0DD\uD65C \uAFC0\uD301 \uD5EC\uC2A4" },
      { title: `${fallbackTitlePrefix}\uC694\uC998 \uB300\uC138\uB85C \uB5A0\uC624\uB974\uB294 \uB3C4\uC2EC \uC18D \uD14C\uB9C8 \uD50C\uB808\uC774\uC2A4 \uC644\uBCBD \uD22C\uC5B4`, link: "https://news.google.com", pubDate: "Tue, 15 Sep 2026 07:45:00 GMT", source: "\uD2B8\uB80C\uB4DC \uB9AC\uD3EC\uD2B8" },
      { title: `${fallbackTitlePrefix}\uC2DC\uC98C\uBCC4 \uC544\uC6C3\uB3C4\uC5B4 \uD2B8\uB80C\uB4DC\uC640 \uB77C\uC774\uD504\uC2A4\uD0C0\uC77C \uC7A5\uBE44 \uACE0\uB974\uB294 \uBC29\uBC95`, link: "https://news.google.com", pubDate: "Tue, 15 Sep 2026 07:00:00 GMT", source: "\uC544\uC6C3\uB3C4\uC5B4 \uB77C\uC774\uD504" }
    ];
    res.json({ success: true, articles: fallbacks });
  }
});
app2.get("*", (_req, res) => {
  res.sendFile(path3.join(distPath, "index.html"));
});
var app_default = app2;

// api/index.ts
var index_default = app_default;
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
