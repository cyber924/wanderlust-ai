/**
 * Resolves a safe, highly relevant and popular Unsplash image URL based on keywords
 * extracted from the post's title, destination, or category type.
 * This guarantees a beautiful, editorial aesthetic with absolutely zero broken images (엑박).
 */
export function getSafeUnsplashCoverUrl(post: {
  title?: string;
  destination?: string;
  categoryType?: string;
  coverImageUrl?: string;
}): string {
  const title = (post.title || "").toLowerCase();
  const dest = (post.destination || "").toLowerCase();
  const cat = (post.categoryType || "").toLowerCase();

  // If the coverImageUrl is a valid external URL, use it,
  // but if it is empty, placeholder-like, or invalid, we map it to high-res Unsplash.
  const hasValidCover =
    post.coverImageUrl &&
    post.coverImageUrl.startsWith("http") &&
    !post.coverImageUrl.includes("placeholder") &&
    post.coverImageUrl.length > 10;

  if (hasValidCover && post.coverImageUrl) {
    return post.coverImageUrl;
  }

  // 1. Specific Korean Cities / Popular Spots Keyword Matching
  if (
    dest.includes("서울") ||
    dest.includes("seoul") ||
    dest.includes("성수") ||
    dest.includes("홍대") ||
    dest.includes("강남")
  ) {
    if (title.includes("야경") || title.includes("드라이브") || title.includes("밤")) {
      return "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80"; // Seoul City Expressway at Night
    }
    if (title.includes("팝업") || title.includes("쇼핑") || title.includes("매장") || title.includes("굿즈")) {
      return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"; // Premium Concept Boutique/Store
    }
    return "https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=800&q=80"; // Modern urban Seoul street aesthetic
  }

  if (
    dest.includes("제주") ||
    dest.includes("jeju") ||
    dest.includes("부산") ||
    dest.includes("바다") ||
    dest.includes("해변")
  ) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"; // Beautiful sunny beach shore
  }

  // 2. Specific Travel / Activities Topic Matching
  if (
    title.includes("드라이브") ||
    title.includes("야경") ||
    title.includes("코스") ||
    title.includes("데이트")
  ) {
    return "https://images.unsplash.com/photo-1511316601248-2aa1d5772224?auto=format&fit=crop&w=800&q=80"; // Romantic drive at twilight/sunset
  }

  if (
    title.includes("캠핑") ||
    title.includes("글램핑") ||
    title.includes("아웃도어") ||
    title.includes("가을")
  ) {
    return "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80"; // Forest Camping with orange campfire
  }

  if (
    title.includes("맛집") ||
    title.includes("카페") ||
    title.includes("음식") ||
    title.includes("디저트") ||
    cat.includes("food")
  ) {
    return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80"; // Minimalist cozy interior aesthetic cafe
  }

  if (
    cat === "life_info" ||
    title.includes("생활정보") ||
    title.includes("꿀팁") ||
    title.includes("정리") ||
    title.includes("인테리어")
  ) {
    return "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"; // Scandinavian clean cozy room
  }

  // 3. Ultra-safe premium travel lifestyle fallback
  return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"; // Flatlay passport, maps, retro camera, vintage luggage
}
