<template>
  <Header />

  <main class="home">

    <!-- Hero Carousel -->
    <section
      class="hero"
      @mouseenter="pauseAutoplay"
      @mouseleave="resumeAutoplay"
    >
      <div
        v-for="(slide, i) in heroSlides"
        :key="slide.title"
        class="hero-bg"
        :class="{ active: i === currentSlide }"
        :style="{ backgroundImage: `url(${slide.image})` }"
      ></div>
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <p class="hero-eyebrow">{{ heroSlides[currentSlide].eyebrow }}</p>
        <h1>{{ heroSlides[currentSlide].title }}</h1>

        <!-- 💡 '자세히 보기' 버튼이 삭제되고 검색창이 바로 배치됩니다. -->
        <div class="search-box">
          <input
            v-model="searchQuery"
            @keyup.enter="goSearch"
            placeholder="지역, 장소, 맛집을 검색해보세요"
          />
          <button class="search-btn" aria-label="검색" @click="goSearch">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Bottom-left carousel controls -->
      <div class="hero-controls">
        <span class="hero-count">{{ pad(currentSlide + 1) }}</span>
        <span class="hero-line"></span>
        <span class="hero-count">{{ pad(heroSlides.length) }}</span>

        <div class="hero-buttons">
          <button @click="prevSlide" aria-label="이전 슬라이드">‹</button>
          <button @click="togglePlay" aria-label="재생/일시정지">
            {{ isPlaying ? '❚❚' : '▶' }}
          </button>
          <button @click="nextSlide" aria-label="다음 슬라이드">›</button>
        </div>
      </div>
    </section>

    <!-- 동네 소식 (카드 캐러셀) -->
    <section class="feed-section" ref="feedSection">
      <div class="feed-heading">
        <p class="feed-eyebrow"> 서울에서 일어나는 다양한 소식</p>
        <h2 class="feed-title">Seoul <span>Now!</span></h2>
      </div>

      <div class="feed-carousel">
        <button
          class="feed-arrow feed-arrow-left"
          @click="scrollFeed(-1)"
          aria-label="이전"
        >‹</button>

        <div class="feed-cards" ref="feedTrack">
          <!-- 내용(content)이 포함된 카드 디자인 -->
          <article
            v-for="post in posts"
            :key="post.id"
            class="feed-card"
            @click="openPost(post)"
          >
            <div>
              <div class="feed-card-header">
                <span class="feed-card-tag">{{ post.category }}</span>
                <span class="feed-card-region">{{ post.region || '전체' }}</span>
              </div>
              <h3 class="feed-card-title">{{ post.title }}</h3>
              <p class="feed-card-content">{{ post.content || '본문 내용이 없는 게시글입니다.' }}</p>
            </div>
            
            <div class="feed-card-footer">
              <span class="feed-card-date">{{ post.createdAt }}</span>
              <div class="feed-card-stats">
                <span class="stat-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="stat-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {{ post.views }}
                </span>
                <span class="stat-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="stat-icon"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                  {{ post.likes }}
                </span>
              </div>
            </div>
          </article>

          <div v-if="posts.length === 0" class="feed-empty">
            아직 등록된 게시글이 없어요.
            <RouterLink to="/community">첫 글을 남겨보세요 →</RouterLink>
          </div>
        </div>

        <button
          class="feed-arrow feed-arrow-right"
          @click="scrollFeed(1)"
          aria-label="다음"
        >›</button>
      </div>

      <!-- 카드 목록 하단 영역 (좌측 페이징 수 + 우측 바로가기) -->
      <div class="feed-bottom-controls">
        <p class="feed-page">{{ feedPage }} / {{ posts.length }}</p>
        <RouterLink to="/community" class="feed-more-link">게시판 바로가기 →</RouterLink>
      </div>
    </section>

  </main>

  <Footer />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { readPostsFromStorage } from '../composables/usePosts.js'
import seoulAttractions from '../data/서울_관광지.json'
import seoulSports from '../data/서울_레포츠.json'
import seoulCulture from '../data/서울_문화시설.json'
import seoulShopping from '../data/서울_쇼핑.json'
import seoulLodging from '../data/서울_숙박.json'
import seoulFestival from '../data/서울_축제공연행사.json'

const router = useRouter()

/* ---------------- Hero Carousel ---------------- */
const heroSlides = [
  {
    eyebrow: '초여름 햇살 아래',
    title: '펼쳐지는 서울의 녹음',
    image: 'https://tong.visitkorea.or.kr/cms/resource_photo/34/3538134_image2_1.jpg',
  },
  {
    eyebrow: '숨어있는',
    title: '놀거리를 찾아서',
    image: 'http://tong.visitkorea.or.kr/cms/resource/71/3497571_image2_1.jpg',
  },
  {
    eyebrow: '주민이 직접 추천하는',
    title: '진짜 로컬 스팟',
    image: 'https://tong.visitkorea.or.kr/cms/resource/20/3506720_image2_1.jpg',
  },
]

const currentSlide = ref(0)
const isPlaying = ref(true)
let autoplayTimer = null

function pad(n) {
  return String(n).padStart(2, '0')
}

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % heroSlides.length
}
function prevSlide() {
  currentSlide.value =
    (currentSlide.value - 1 + heroSlides.length) % heroSlides.length
}
function togglePlay() {
  isPlaying.value = !isPlaying.value
  isPlaying.value ? startAutoplay() : stopAutoplay()
}
function startAutoplay() {
  stopAutoplay()
  autoplayTimer = setInterval(nextSlide, 5000)
}
function stopAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer)
}
function pauseAutoplay() {
  stopAutoplay()
}
function resumeAutoplay() {
  if (isPlaying.value) startAutoplay()
}

onMounted(startAutoplay)
onUnmounted(stopAutoplay)

/* ---------------- Feed Section scroll ---------------- */
const feedSection = ref(null)

/* ---------------- Feed cards (게시판 데이터 연동) ---------------- */
const allPosts = ref([])

onMounted(() => {
  allPosts.value = readPostsFromStorage()
})

// 최신 글 순으로 정렬해서 6개만 미리보기
const posts = computed(() =>
  allPosts.value
    .slice()
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 6)
)

const searchQuery = ref('')

// combine seoul datasets with source label
const seoulDataMap = {
  '관광지': seoulAttractions,
  '레포츠': seoulSports,
  '문화시설': seoulCulture,
  '쇼핑': seoulShopping,
  '숙박': seoulLodging,
  '축제/공연': seoulFestival
}

// flatten posts source (use allPosts already loading)
function normalizeTitle(item) {
  // try common fields, fallback to joined string
  return (
    item.title ||
    item.name ||
    item.시설명 ||
    item.명칭 ||
    (typeof item === 'string' ? item : JSON.stringify(item))
  )
}

// search places by stringifying entry (robust for unknown schema)
const seoulResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  const results = []
  Object.entries(seoulDataMap).forEach(([source, arr]) => {
    if (!Array.isArray(arr)) return
    arr.forEach((item, idx) => {
      const hay = JSON.stringify(item).toLowerCase()
      if (hay.includes(q)) {
        results.push({
          _id: `${source}-${idx}`,
          source,
          title: normalizeTitle(item),
          raw: item
        })
      }
    })
  })
  return results.slice(0, 8) // limit
})

// posts search
const allStoredPosts = ref([])
onMounted(() => {
  allStoredPosts.value = readPostsFromStorage()
})

const postResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return allStoredPosts.value
    .filter((p) => {
      const hay = (
        (p.title || '') +
        ' ' +
        (p.content || '') +
        ' ' +
        (p.writer || '') +
        ' ' +
        ((p.tags || []).join(' ') || '')
      ).toLowerCase()
      return hay.includes(q)
    })
    .slice(0, 6)
})

// handler for explicit search button (keeps results reactive already)
function onSearch() {
  // no-op for now; computed results update automatically
  // Could be used to log analytics or focus results box
}

// open place -> navigate to map with query (Map.vue can use query.q)
function openPlace(result) {
  const q = result.title
  router.push({ name: 'Map', query: { q } })
}

function openPost(post) {
  router.push({ name: 'PostDetail', params: { id: post.id } })
}

/* ---------------- Feed carousel scroll ---------------- */
const feedTrack = ref(null)
const feedPage = ref(1)

function scrollFeed(dir) {
  const track = feedTrack.value
  if (!track) return
  const cardWidth = track.firstElementChild?.offsetWidth || 300
  track.scrollBy({ left: dir * (cardWidth + 24), behavior: 'smooth' })
  setTimeout(() => {
    const idx = Math.round(track.scrollLeft / (cardWidth + 24)) + 1
    feedPage.value = Math.min(Math.max(idx, 1), posts.value.length || 1)
  }, 300)
}

function goSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  router.push({ name: 'Search', query: { q } })
}
</script>

<style scoped>
.home {
  background: #fbfbfd;
  min-height: 100vh;
  padding-bottom: 100px;
}

/* ---------------- Hero ---------------- */
.hero {
  position: relative;
  max-width: 1200px;
  height: 560px;
  margin: 40px auto;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center center;
  filter: brightness(0.72);
  opacity: 0;
  transition: opacity 1s ease;
}
.hero-bg.active {
  opacity: 1;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.6));
}

.hero-content {
  position: absolute;
  left: 48px;
  bottom: 90px;
  z-index: 1;
  color: #fff;
  max-width: 560px;
  text-align: left;
}

.hero-eyebrow {
  font-size: 15px;
  opacity: 0.85;
  margin-bottom: 8px;
  letter-spacing: 0.02em;
}

.hero-content h1 {
  font-size: 40px;
  line-height: 1.3;
  color: #fff;
  margin-bottom: 24px; /* 버튼이 빠졌으므로 검색창과의 적절한 여백 확보 */
}

.search-box {
  display: flex;
  align-items: center;
  width: 480px;
  max-width: 90vw;
  height: 56px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 999px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  transition: border-color 0.3s, box-shadow 0.3s;
}
.search-box:focus-within {
  border-color: #ffffff;
  box-shadow: 0 12px 35px rgba(255, 255, 255, 0.1);
}
.search-box input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  padding: 0 0 0 24px;
  font-size: 15px;
  background: transparent;
  color: #ffffff;
}
.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-btn {
  width: 60px;
  height: 100%;
  border: none;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.25s, transform 0.25s;
}
.search-btn:hover {
  opacity: 0.8;
  transform: scale(1.05);
}
.search-icon {
  width: 22px;
  height: 22px;
}

/* Hero controls */
.hero-controls {
  position: absolute;
  left: 48px;
  bottom: 32px;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}
.hero-line {
  width: 60px;
  height: 1px;
  background: rgba(255, 255, 255, 0.5);
}
.hero-buttons {
  display: flex;
  gap: 8px;
  margin-left: 14px;
}
.hero-buttons button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: transparent;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.25s;
}
.hero-buttons button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* ---------------- Feed section ---------------- */
.feed-section {
  max-width: 1100px;
  margin: 80px auto 0;
  text-align: center;
}
.feed-heading {
  margin-bottom: 32px; /* 헤딩과 캐러셀 사이의 간격 미세 조정 */
}
.feed-eyebrow {
  color: #999;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.005em;
  margin-bottom: 4px; /* 💡 소제목 하단 마진을 줄여 제목과의 간격을 좁힙니다 */
}
.feed-title {
  font-size: 30px;
  font-weight: 800;
  color: #111;
  margin: 0; /* 불필요한 기본 마진 제거로 정밀한 간격 확보 */
}
.feed-title span {
  color: #ff7a00;
}

.feed-carousel {
  position: relative;
  display: flex;
  align-items: center;
}

.feed-cards {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 12px 6px 24px;
  scrollbar-width: none;
}
.feed-cards::-webkit-scrollbar {
  display: none;
}

/* 카드 디자인 */
.feed-card {
  cursor: pointer;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.04);
  scroll-snap-align: start;
  flex: 0 0 300px;
  height: 260px;
  border-radius: 20px;
  padding: 26px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s;
}
.feed-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.06);
  border-color: rgba(255, 122, 0, 0.15);
}

.feed-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.feed-card-tag {
  font-size: 11px;
  color: #ff7a00;
  background: rgba(255, 122, 0, 0.08);
  padding: 4px 10px;
  border-radius: 99px;
  font-weight: 700;
}
.feed-card-region {
  font-size: 11px;
  color: #888;
  font-weight: 500;
}

.feed-card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.35;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.feed-card-content {
  font-size: 13.5px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
}

.feed-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  padding-top: 14px;
}
.feed-card-date {
  font-size: 12px;
  color: #999;
}
.feed-card-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #777;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.stat-icon {
  width: 14px;
  height: 14px;
  opacity: 0.6;
}

/* 카드 하단 정보 / 우측 링크 */
.feed-bottom-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1050px;
  margin: 20px auto 0;
  padding: 0 10px;
}
.feed-page {
  font-size: 13.5px;
  color: #999;
  font-weight: 500;
  margin: 0;
}
.feed-more-link {
  font-size: 14px;
  color: #ff7a00;
  font-weight: 700;
  text-decoration: none;
  padding: 8px 20px;
  border-radius: 99px;
  background-color: rgba(255, 122, 0, 0.06);
  transition: background-color 0.25s, transform 0.25s;
}
.feed-more-link:hover {
  background-color: rgba(255, 122, 0, 0.12);
  transform: translateX(3px);
}

/* 빈 상태 스타일 */
.feed-empty {
  flex: 1;
  padding: 60px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
.feed-empty a {
  color: #ff7a00;
  font-weight: 700;
  text-decoration: none;
}

/* 내비게이션 화살표 */
.feed-arrow {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: #fff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  font-size: 20px;
  color: #444;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, background-color 0.2s;
}
.feed-arrow:hover {
  background-color: #ff7a00;
  color: white;
  border-color: #ff7a00;
}
.feed-arrow-left {
  margin-right: 12px;
}
.feed-arrow-right {
  margin-left: 12px;
}
.search-results {
  margin-top: 10px;
  background: rgba(255,255,255,0.95);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  color: #222;
}
.results-group h4 {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #777;
}
.search-results ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.search-results li {
  padding: 8px 6px;
  cursor: pointer;
  border-radius: 8px;
}
.search-results li:hover {
  background: #faf7f4;
}
.post-title { font-weight: 700; }
.post-meta { color: #777; font-size: 12px; }
.no-results { color: #777; padding: 8px 6px; }

/* ---------------- Responsive ---------------- */
@media (max-width: 768px) {
  .hero {
    height: 460px;
    margin: 20px 16px;
  }
  .hero-content {
    left: 24px;
    bottom: 130px;
    max-width: 85%;
  }
  .hero-content h1 {
    font-size: 28px;
  }
  .search-box {
    width: 100%;
  }
  .hero-controls {
    left: 24px;
    bottom: 20px;
  }
  .feed-card {
    flex: 0 0 260px;
    height: 250px;
    padding: 20px;
  }
}
</style>