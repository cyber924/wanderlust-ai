import { BlogPost } from "../types";

export const SAMPLE_WEBZINE_ARTICLES: BlogPost[] = [
  {
    id: "webzine_paris_01",
    title: "낭만의 도시 파리 3박 4일, 센강 야경과 숨은 골목 카페 완벽 정복",
    subtitle: "에펠탑부터 몽마르트르까지, 현지인처럼 즐기는 낭만 감성 파리 여행 코스",
    destination: "프랑스 파리 (Paris)",
    duration: "3박 4일",
    concept: "낭만 예술 & 센강 야경 & 골목 베이커리 투어",
    tone: "감성 에세이 / 친근한 여행 가이드",
    targetAudience: "커플, 나홀로 여행객, 2030 유럽 배낭여행자",
    budget: "1인 약 120만원 (항공권 제외)",
    season: "봄 / 가을 추천",
    categoryType: "travel",
    categoryName: "해외 감성 여행",
    metaKeywords: ["파리여행", "파리3박4일", "에펠탑야경", "몽마르트르", "센강크루즈", "파리카페"],
    hashtags: ["#파리여행", "#에펠탑", "#센강야경", "#유럽여행", "#파리카페", "#낭만파리"],
    coverImageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    views: 3420,
    likes: 284,
    status: "published",
    isPublic: true,
    authorName: "Wanderlust 에디터 Sophie",
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-08-20T10:00:00.000Z",
    seoDescription: "프랑스 파리 3박 4일 완벽 여행 코스. 센강 바토무슈 일몰 크루즈부터 몽마르트르 언덕, 마레지구 빈티지 숍까지 파리의 감성을 오롯이 담았습니다.",
    travelTips: [
      "파리 지하철(메트로) 티켓은 Navigo Easy 카드를 충전하여 사용하는 것이 가장 경제적입니다.",
      "루브르 박물관과 오르세 미술관은 공식 홈페이지에서 최소 2주 전 사전 시간 예약을 필수 권장합니다.",
      "소매치기 예방을 위해 스마트폰 스트랩과 지퍼 달린 크로스백을 꼭 챙기세요."
    ],
    itinerary: [
      {
        day: 1,
        title: "파리의 첫인상, 센강의 로맨틱 야경 속으로",
        activities: [
          {
            time: "오후 15:00",
            spot: "샤를 드골 공항 도착 및 마레지구 숙소 체크인",
            description: "파리 시내로 RER B선을 타고 이동하여 마레지구 감성 숙소에 짐을 풀고 가벼운 마음으로 첫 파리 산책을 시작합니다.",
            tip: "마레지구 골목은 도보 이동이 편리하고 치안이 좋습니다.",
            imageUrl: "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "오후 17:30",
            spot: "노트르담 대성당 외관 & 센강 강변 산책",
            description: "파리의 심장인 시테섬으로 이동하여 고딕 양식의 웅장함을 느끼고, 센강변 셰익스피어 앤 컴퍼니 서점 앞을 거닐어 봅니다.",
            tip: "강변 고서점(Bouquinistes)에서 빈티지 포스터 구경을 놓치지 마세요.",
            imageUrl: "https://images.unsplash.com/photo-1478358161113-b0e11994a36b?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "저녁 19:30",
            spot: "센강 바토무슈 유람선 크루즈 (일몰 & 야경)",
            description: "노을이 지는 황금빛 센강 위에서 에펠탑의 정시 반짝임(화이트 에펠)을 강 위에서 조망하는 파리 최고의 하이라이트입니다.",
            tip: "선상 2층 뒤쪽 자리가 사진 명당입니다.",
            imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80"
          }
        ]
      },
      {
        day: 2,
        title: "예술과 역사, 그리고 파리지앵의 티타임",
        activities: [
          {
            time: "오전 09:30",
            spot: "루브르 박물관 모나리자 & 유리 피라미드 투어",
            description: "세계 최대의 예술 박물관에서 모나리자와 밀로의 비너스를 마주하고, 시그니처 유리 피라미드 앞에서 인생샷을 남깁니다.",
            tip: "지하철 역과 바로 연결되는 카루젤 쇼핑몰 입구로 입장하면 대기줄이 훨씬 짧습니다.",
            imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "오후 14:00",
            spot: "튈르리 정원 벤치 휴식 & 안젤리나 쇼콜라 쇼",
            description: "초록색 튈르리 철제 의자에 앉아 분수를 바라보며 진한 핫초콜릿과 몽블랑 디저트로 달콤한 파리지앵 휴식을 만끽합니다.",
            tip: "봄~가을에는 날씨가 좋아 야외 벤치 자리가 인기 만점입니다.",
            imageUrl: "https://images.unsplash.com/photo-1520939817895-060bdef4ad1b?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "오후 18:00",
            spot: "에펠탑 트로카데로 광장 & 샹드마르스 공원 피크닉",
            description: "바게트와 브리 치즈, 와인 한 병을 사들고 에펠탑 잔디밭에 돗자리를 펴고 불빛이 켜지는 에펠탑을 바라봅니다.",
            tip: "와인 오프너와 얇은 돗자리를 미리 챙기시면 좋습니다.",
            imageUrl: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=800&q=80"
          }
        ]
      },
      {
        day: 3,
        title: "몽마르트르 언덕의 보헤미안 감성과 마레 쇼핑",
        activities: [
          {
            time: "오전 10:00",
            spot: "사크레쾨르 대성당 & 테르트르 광장 화가 거리",
            description: "파리 시내가 한눈에 내려다보이는 몽마르트르 언덕 꼭대기에서 거리의 화가들을 만나고 사랑해 벽(Le Mur des Je t'aime)에서 사진을 찍습니다.",
            tip: "언덕 계단 오르기 전 팔찌 강매 상인을 조심하고 케이블카(Funiculaire)를 이용하세요.",
            imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "오후 15:00",
            spot: "마레지구 편집숍 & 메르시(Merci) 라이프스타일 숍",
            description: "감각적인 로컬 브랜드와 빈티지 숍들이 즐비한 마레 골목에서 쇼핑을 즐기고 유명한 팔라펠 샌드위치를 맛봅니다.",
            tip: "메르시 매장 앞 빨간 미니 쿠퍼 앞에서 사진을 남겨보세요.",
            imageUrl: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=800&q=80"
          }
        ]
      }
    ],
    markdownContent: `# 낭만의 도시 파리 3박 4일, 센강 야경과 숨은 골목 카페 완벽 정복

프랑스 파리는 언제나 설렘을 주는 도시입니다. 고딕 성당의 웅장함과 황금빛 가로등, 그리고 골목마다 퍼지는 고소한 버터 크루아상 향기까지. 이번 3박 4일 코스는 유명 랜드마크의 핵심 관람과 현지 파리지앵의 여유를 모두 담았습니다.

---

## 📅 DAY 1: 파리의 첫인상, 센강의 로맨틱 야경 속으로
파리에 첫발을 내딛는 날, 무리한 일정 대신 센강을 중심으로 파리의 분위기에 젖어듭니다.

### 📍 샤를 드골 공항 도착 및 마레지구 숙소 체크인
공항에서 시내로 이동 후 마레지구에 짐을 풀었습니다. 마레지구는 미술관, 카페, 디저트 숍이 도보 거리에 있어 여행의 거점으로 최고입니다.

### 📍 노트르담 대성당 & 센강 산책
시테섬을 중심으로 센강변을 거닐며 파리의 유구한 역사를 느껴봅니다. 강변 고서점 '부키니스트'에서 빈티지 엽서를 구경하는 재미도 쏠쏠합니다.

### 📍 센강 바토무슈 유람선 크루즈
일몰 30분 전 탑승하여 오렌지빛 노을과 정각에 반짝이는 에펠탑의 불빛 쇼를 감상했습니다. 파리 여행 중 가장 잊지 못할 순간입니다.

---

## 📅 DAY 2: 예술과 역사, 그리고 파리지앵의 티타임
세계 최고의 예술품과 튈르리 정원의 평화로움을 경험하는 날입니다.

### 📍 루브르 박물관 투어
유리 피라미드를 지나 모나리자와 승리의 여신 니케상을 마주했습니다. 사전 시간 예약 덕분에 긴 대기 없이 입장할 수 있었습니다.

### 📍 튈르리 정원 & 안젤리나 티타임
정원의 초록 철제 의자에 앉아 한숨을 돌리고, 인근 안젤리나에서 진한 핫초콜릿 쇼콜라 쇼를 마시며 달콤한 휴식을 누렸습니다.

### 📍 샹드마르스 공원 에펠탑 피크닉
해가 저물 무렵, 와인과 바게트를 들고 잔디밭에서 올려다본 에펠탑은 파리 여행의 낭만을 정점으로 이끌어줍니다.

---

## 💡 여행 꿀팁 모음
- **교통**: 나비고 이지 카드에 10회권(카르네)을 충전해 사용하세요.
- **예약**: 루브르와 오르세는 최소 2주 전 공식 사이트 사전 예약이 필수입니다.
- **안전**: 소매치기 방지를 위해 가방은 항상 몸 앞쪽에 두세요.`
  },
  {
    id: "webzine_tokyo_02",
    title: "도쿄 미식 & 골목 감성 3박 4일, 시부야부터 나카메구로까지",
    subtitle: "트렌디한 편집숍과 레트로 골목 이자카야, 도쿄의 낮과 밤을 오롯이 걷다",
    destination: "일본 도쿄 (Tokyo)",
    duration: "3박 4일",
    concept: "도쿄 미식 탐방 & 편집숍 쇼핑 & 레트로 골목 야경",
    tone: "트렌디한 잡지 톤 / 실용적 맛집 가이드",
    targetAudience: "2030 자유여행자, 미식가, 혼행족",
    budget: "1인 약 80만원 (항공권 제외)",
    season: "사계절 추천 (특히 봄 벚꽃 시즌)",
    categoryType: "travel",
    categoryName: "해외 감성 여행",
    metaKeywords: ["도쿄여행", "도쿄3박4일", "시부야스카이", "나카메구로", "신주쿠맛집", "긴자"],
    hashtags: ["#도쿄여행", "#시부야스카이", "#나카메구로", "#도쿄맛집", "#일본자유여행", "#도쿄골목"],
    coverImageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
    views: 4190,
    likes: 352,
    status: "published",
    isPublic: true,
    authorName: "Wanderlust 에디터 Ken",
    createdAt: "2026-08-22T08:30:00.000Z",
    updatedAt: "2026-08-22T08:30:00.000Z",
    seoDescription: "도쿄 3박 4일 자유여행 코스 추천. 시부야 스카이 전망대, 나카메구로 운하 감성 카페, 신주쿠 오모이데요코초 이자카야까지 알차게 구성된 미식 감성 루트.",
    travelTips: [
      "스이카(Suica) 또는 파스모(Pasmo) 교통카드를 아이폰 애플페이에 등록하면 매우 편리합니다.",
      "시부야 스카이 일몰 타임 입장권은 4주 전 오픈 당일 매진되므로 사전 예매가 필수입니다.",
      "도쿄 지하철 패스(24/48/72시간권)는 도쿄 메트로와 도에이 지하철 무제한 탑승이 가능해 가성비가 뛰어납니다."
    ],
    itinerary: [
      {
        day: 1,
        title: "도쿄의 중심, 시부야의 활기와 환상적인 노을",
        activities: [
          {
            time: "오후 15:30",
            spot: "시부야 스크램블 교차로 & 하치코 광장",
            description: "전 세계에서 가장 분주한 스크램블 교차로를 직접 건너며 도쿄의 심장박동을 느껴봅니다.",
            tip: "스타벅스 츠타야점이나 마그넷 전망대에서 내려다보는 뷰가 멋집니다.",
            imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "오후 17:30",
            spot: "시부야 스카이(SHIBUYA SKY) 루프탑 전망대",
            description: "지상 229m 옥상에서 도쿄 타워와 후지산 능선 너머로 펼쳐지는 파노라마 일몰 야경을 감상합니다.",
            tip: "옥상에는 가방 반입이 불가하므로 락커에 보관해야 합니다.",
            imageUrl: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80"
          }
        ]
      },
      {
        day: 2,
        title: "감성 운하 골목과 트렌디한 편집숍 투어",
        activities: [
          {
            time: "오전 11:00",
            spot: "나카메구로 메구로강 운하 & 스타벅스 리저브 로스터리",
            description: "운하를 따라 늘어선 로컬 부티크를 구경하고, 세계적인 규모의 스타벅스 리저브 매장에서 스페셜티 커피를 맛봅니다.",
            tip: "3층 테라스 자리에서 강변 뷰를 감상해보세요.",
            imageUrl: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "오후 15:00",
            spot: "다이칸야마 츠타야 서점 & T-SITE 산책",
            description: "숲속에 자리 잡은 프리미엄 서점에서 건축미를 즐기고 라이프스타일 잡지와 디자인 소품을 둘러봅니다.",
            tip: "인근 아기자기한 브런치 카페들이 많습니다.",
            imageUrl: "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80"
          }
        ]
      }
    ],
    markdownContent: `# 도쿄 미식 & 골목 감성 3박 4일 완벽 가이드

화려한 네온사인과 고즈넉한 골목길의 정취가 공존하는 도시 도쿄. 트렌드를 선도하는 감성 숍과 미슐랭 라멘, 레트로 야경 명소까지 3박 4일 동안 알차게 즐길 수 있는 알짜배기 루트를 소개합니다.

## 📅 핵심 일정
- **DAY 1**: 시부야 스크램블 교차로 ➔ 시부야 스카이 일몰 야경 ➔ 신주쿠 골목 맛집
- **DAY 2**: 나카메구로 운하 ➔ 스타벅스 리저브 로스터리 ➔ 다이칸야마 츠타야 ➔ 롯폰기 힐즈
- **DAY 3**: 아사쿠사 센소지 ➔ 긴자 명품 거리 & 백화점 디저트 ➔ 오다이바 야경

## 💡 도쿄 여행 필수 체크리스트
1. 교통: 애플 지갑에 스이카 등록하기
2. 예약: 시부야 스카이 및 유명 오마카세 사전 예약 필수
3. 환전: 카드 결제가 대부분 가능하나 전통 시장이나 자판기용 소액 엔화 현금 준비`
  },
  {
    id: "webzine_jeju_03",
    title: "제주 서쪽 에메랄드빛 바다 & 오름 힐링 2박 3일 감성 로드",
    subtitle: "협재해변의 에메랄드 물빛, 금오름의 황금빛 노을, 돌담길 오션뷰 카페 투어",
    destination: "대한민국 제주도 서부 (애월·한림·한경)",
    duration: "2박 3일",
    concept: "오션뷰 힐링 & 노을 오름 & 로컬 흑돼지 미식",
    tone: "편안하고 따뜻한 감성 힐링 톤",
    targetAudience: "커플, 힐링 여행자, 우정 여행",
    budget: "1인 약 35만원 (렌터카 포함)",
    season: "봄 / 초여름 / 가을 강력 추천",
    categoryType: "travel",
    categoryName: "국내/제주 힐링",
    metaKeywords: ["제주도여행", "제주서쪽코스", "협재해수욕장", "금오름", "애월카페", "제주2박3일"],
    hashtags: ["#제주여행", "#협재해변", "#금오름", "#애월카페", "#제주감성", "#국내여행"],
    coverImageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
    views: 2850,
    likes: 241,
    status: "published",
    isPublic: true,
    authorName: "Wanderlust 로컬 에디터 유진",
    createdAt: "2026-08-23T14:15:00.000Z",
    updatedAt: "2026-08-23T14:15:00.000Z",
    seoDescription: "제주도 서쪽 2박 3일 힐링 코스 완벽 가이드. 한담해변 산책로부터 협재 바다, 금오름 노을, 신창풍차해안도로 드라이브까지 감성 가득한 제주 여행.",
    travelTips: [
      "렌터카는 공항 셔틀이 빠른 대형 업체를 이용하고 완전자차(슈퍼자차) 보험 가입을 권장합니다.",
      "금오름은 일몰 40분 전 올라가야 분화구 너머로 떨어지는 황홀한 붉은 노을을 감상할 수 있습니다.",
      "인기 흑돼지 식당은 '캐치테이블'이나 '테이블링' 앱으로 원격 줄서기를 해두면 대기 시간을 대폭 줄일 수 있습니다."
    ],
    itinerary: [
      {
        day: 1,
        title: "에메랄드 바다와 애월 한담해변의 여유",
        activities: [
          {
            time: "오후 14:00",
            spot: "애월 한담해변 산책로 & 투명 카약",
            description: "검은 현무암과 청량한 옥빛 바다가 어우러진 해안 산책로를 걷고 바다 위 투명 카약을 체험합니다.",
            tip: "파도가 잔잔한 날에만 카약 운행을 하니 사전 확인하세요.",
            imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "오후 18:00",
            spot: "금오름 일몰 & 분화구 능선 산책",
            description: "약 15분 정도 오르면 만날 수 있는 분화구 호수(왕매)와 서쪽 바다로 지는 황금빛 노을을 마주합니다.",
            tip: "경사가 있으므로 편안한 운동화를 착용하세요.",
            imageUrl: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=800&q=80"
          }
        ]
      }
    ],
    markdownContent: `# 제주 서쪽 에메랄드빛 바다 & 오름 힐링 2박 3일

도시의 소음에서 벗어나 푸른 바다와 솔바람 소리가 가득한 제주의 서쪽으로 떠납니다. 투명한 협재 바다와 바람이 머무는 신창풍차해안도로, 그리고 오름 위의 붉은 노을까지 마음이 편안해지는 힐링 코스입니다.`
  },
  {
    id: "webzine_life_cleaning_04",
    title: "자취생 & 주부 필수! 과탄산소다 하나로 끝내는 10분 욕실 살림 청소법",
    subtitle: "곰팡이, 물때, 찌든 때를 힘들이지 않고 하얗게 박멸하는 가성비 100% 실전 꿀팁",
    destination: "욕실 & 주방 살림 노하우",
    duration: "소요시간 10분",
    concept: "친환경 살림 꿀팁 & 초간단 청소 비법",
    tone: "실전적이고 명쾌한 생활정보 가이드",
    targetAudience: "1인 가구, 신혼부부, 살림 초보",
    budget: "비용 약 3,000원 (과탄산소다 1봉지)",
    season: "사계절 유용 (특히 습한 여름철 / 장마철)",
    categoryType: "life_info",
    categoryName: "생활/살림 꿀팁",
    metaKeywords: ["과탄산소다활용법", "욕실청소꿀팁", "화장실물때제거", "자취생청소", "살림노하우"],
    hashtags: ["#살림꿀팁", "#욕실청소", "#과탄산소다", "#자취꿀팁", "#생활정보", "#물때제거"],
    coverImageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    views: 5230,
    likes: 489,
    status: "published",
    isPublic: true,
    authorName: "Wanderlust 살림 연구소",
    createdAt: "2026-08-24T09:00:00.000Z",
    updatedAt: "2026-08-24T09:00:00.000Z",
    seoDescription: "과탄산소다와 뜨거운 물을 활용해 욕실 타일 줄눈 곰팡이와 세면대 물때를 힘들이지 않고 10분 만에 새것처럼 청소하는 친환경 살림 비법.",
    travelTips: [
      "과탄산소다는 반드시 60℃ 이상의 따뜻한 온수를 사용해야 거품이 활성화되어 찌든 때가 분해됩니다.",
      "발생하는 기포(산소 가스) 환기를 위해 청소 중에는 화장실 환풍기를 켜고 문을 활짝 열어두세요.",
      "피부 보호를 위해 고무장갑 착용은 필수입니다."
    ],
    itinerary: [
      {
        day: 1,
        title: "STEP 1: 세면대 배수구 & 수전 물때 반짝이게 닦기",
        activities: [
          {
            time: "STEP 1",
            spot: "과탄산소다 2스푼 뿌리고 온수 붓기",
            description: "세면대 배수구 구멍 주변에 과탄산소다를 뿌린 후 뜨거운 물을 종이컵 1잔 분량 천천히 붓습니다. 뽀글뽀글 거품이 올라오며 배관 속 찌꺼기와 악취가 사라집니다.",
            tip: "10분 방치 후 샤워기로 헹궈주면 수전이 거울처럼 반짝입니다.",
            imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
          },
          {
            time: "STEP 2",
            spot: "타일 줄눈 곰팡이 키친타월 팩 요법",
            description: "따뜻한 물에 과탄산소다를 걸쭉하게 갠 뒤 곰팡이가 핀 타일 줄눈에 바르고 키친타월을 덮어둡니다.",
            tip: "30분 후 칫솔로 살살 문지른 뒤 물을 뿌리면 곰팡이가 깨끗하게 제거됩니다.",
            imageUrl: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80"
          }
        ]
      }
    ],
    markdownContent: `# 과탄산소다 하나로 끝내는 10분 욕실 살림 청소법

화장실 줄눈 곰팡이와 세면대 물때 때문에 독한 락스 냄새 맡으며 힘들게 문지르셨나요? 과탄산소다의 산소 기포 발포 반응을 활용하면 힘들이지 않고 10분 만에 호텔 화장실처럼 반짝이게 바꿀 수 있습니다.`
  }
];

export const WEBZINE_SAMPLE_ARTICLES = SAMPLE_WEBZINE_ARTICLES;
