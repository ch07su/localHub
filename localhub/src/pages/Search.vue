<template>
  <div class="search-page">
    <Header />

    <main class="search-container">
      <section class="search-topbar">
        <div class="search-input-box">
          <input
            type="text"
            v-model="searchText"
            @keyup.enter="submitSearch"
            placeholder="검색어를 입력하세요"
          />
          <button class="search-button" @click="submitSearch">
            검색
          </button>
        </div>

        <div class="search-summary">
          
          <p>
            장소 {{ totalPlaceCount }}개 · 게시글 {{ postResults.length }}개
          </p>
        </div>
      </section>

      <section class="place-results">
        <div class="section-header">
          <h2>장소 검색 결과</h2>
          <span>{{ placeResults.length }}개</span>
        </div>

        <div class="place-grid">
          <article
            v-for="item in placeResults.slice(0, 6)"
            :key="item._id"
            class="place-card"
            @click="openPlace(item)"
          >
            <div class="card-img-area">
              <img
                :src="getPlaceImage(item.raw)"
                :alt="item.title"
                @error="onImageError"
              />
            </div>
            <div class="card-body">
              <span class="place-badge">{{ item.source }}</span>
              <h3 class="place-title">{{ item.title }}</h3>
              <p class="place-address">
                {{ item.raw.addr1 || item.raw.addr2 || '주소 정보 없음' }}
              </p>
            </div>
          </article>
        </div>

        <div class="more-wrap" v-if="placeResults.length > 6">
          <button class="more-button" @click="toggleSlider">
            {{ showSlider ? '슬라이드 닫기' : '더보기' }}
          </button>
        </div>

        <div v-if="showSlider" class="slider-section">
          <div class="slider-header">
            <h3>전체 장소 결과</h3>
            <span>{{ placeResults.length }}개</span>
          </div>
          <div class="slider-track">
            <article
              v-for="item in placeResults"
              :key="item._id"
              class="slider-card"
              @click="openPlace(item)"
            >
              <div class="card-img-area" :class="{ 'no-image': !hasRealImage(item.raw) }">
                <img
                    :src="getPlaceImage(item.raw)"
                    :alt="item.title"
                    @error="onImageError"
                />
                </div>
                <div class="card-body">
                <span class="place-badge">{{ item.source }}</span>
                <h3 class="place-title">{{ item.title }}</h3>
                <p class="place-address">
                  {{ item.raw.addr1 || item.raw.addr2 || '주소 정보 없음' }}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="board-results">
        <div class="section-header">
          <h2>게시글 검색 결과</h2>
          <span>{{ postResults.length }}개</span>
        </div>

        <div v-if="postResults.length === 0" class="empty">
          게시글 검색 결과가 없습니다.
        </div>

        <ul v-else class="board-list">
          <li
            v-for="post in postResults"
            :key="post.id"
            class="board-item"
            @click="openPost(post)"
          >
            <strong>{{ post.title }}</strong>
            <p>{{ post.category }} · {{ post.region || '지역없음' }}</p>
          </li>
        </ul>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import noImagePlaceholder from '../assets/free-icon-seoul-4480815.png'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { readPostsFromStorage } from '../composables/usePosts.js'

import seoulAttractions from '../data/서울_관광지.json'
import seoulSports from '../data/서울_레포츠.json'
import seoulCulture from '../data/서울_문화시설.json'
import seoulShopping from '../data/서울_쇼핑.json'
import seoulLodging from '../data/서울_숙박.json'
import seoulFestival from '../data/서울_축제공연행사.json'

const route = useRoute()
const router = useRouter()

const query = computed(() => (route.query.q || '').toString().trim())
const searchText = ref(query.value)
const showSlider = ref(false)

watch(query, (q) => {
  searchText.value = q
  showSlider.value = false
})

const seoulDataMap = {
  관광지: seoulAttractions,
  레포츠: seoulSports,
  문화시설: seoulCulture,
  쇼핑: seoulShopping,
  숙박: seoulLodging,
  '축제/공연': seoulFestival
}

const allPosts = ref([])

onMounted(() => {
  allPosts.value = readPostsFromStorage()
})

function normalizeTitle(item) {
  return (
    item.title ||
    item.name ||
    item.시설명 ||
    item.명칭 ||
    JSON.stringify(item)
  )
}

const placeResults = computed(() => {
  const q = query.value.toLowerCase()
  if (!q) return []
  const results = []
  Object.entries(seoulDataMap).forEach(([source, data]) => {
    const items = Array.isArray(data) ? data : data.items || []
    items.forEach((item, index) => {
      if (JSON.stringify(item).toLowerCase().includes(q)) {
        results.push({
          _id: `${source}-${index}`,
          source,
          title: normalizeTitle(item),
          raw: item
        })
      }
    })
  })
  return results
})

const postResults = computed(() => {
  const q = query.value.toLowerCase()
  if (!q) return []
  return allPosts.value.filter((post) => {
    const hay = (
      (post.title || '') +
      ' ' +
      (post.content || '') +
      ' ' +
      (post.writer || '') +
      ' ' +
      ((post.tags || []).join(' ') || '')
    ).toLowerCase()
    return hay.includes(q)
  })
})

const totalPlaceCount = computed(() => placeResults.value.length)

function submitSearch() {
  const q = searchText.value.trim()
  if (!q) return
  router.push({ name: 'Search', query: { q } })
}

function toggleSlider() {
  showSlider.value = !showSlider.value
}

function getPlaceImage(raw) {
  return (
    raw.firstimage ||
    raw.firstimage2 ||
    raw.image ||
    noImagePlaceholder
  )
}

function hasRealImage(raw) {
  return !!(raw.firstimage || raw.firstimage2 || raw.image)
}

function onImageError(event) {
  event.target.src = 'https://via.placeholder.com/400x240?text=No+Image'
}

function openPlace(item) {
  router.push({ name: 'Map', query: { q: item.title } })
}

function openPost(post) {
  router.push({ name: 'PostDetail', params: { id: post.id } })
}
</script>

<style scoped>
.search-container {
  max-width: 1120px;
  margin: 30px auto 80px;
  padding: 0 20px;
}

.search-topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
}

.search-input-box {
  flex: 1;
  min-width: 320px;
  display: flex;
  gap: 8px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 999px;
  padding: 8px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
}

.search-input-box input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 16px;
  font-size: 16px;
  border-radius: 999px;
}

.search-input-box input::placeholder {
  color: #999;
}

.search-button {
  border: none;
  background: #ff7a00;
  color: #fff;
  padding: 0 24px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
}

.search-summary {
  color: #555;
  font-size: 14px;
  min-width: 240px;
  text-align: right;
}

.search-summary p {
  margin: 0;
}

.search-summary strong {
  color: #111;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.result-count {
  color: #777;
  font-size: 14px;
}

.place-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.place-card {
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.place-card:hover {
  transform: translateY(-4px);
}

.card-img-area {
  position: relative;
  min-height: 180px;
  overflow: hidden;
}

.card-img-area img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.card-body {
  padding: 18px 18px 20px;
}

.place-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 122, 0, 0.1);
  color: #ff7a00;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 10px;
}

.place-title {
  margin: 0 0 10px;
  font-size: 18px;
  line-height: 1.3;
  color: #111;
}

.place-address {
  margin: 0;
  color: #666;
  font-size: 13px;
  line-height: 1.6;
}

.more-wrap {
  text-align: center;
  margin-top: 20px;
}

.more-button {
  border: none;
  background: #111;
  color: #fff;
  padding: 12px 26px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.slider-section {
  margin-top: 24px;
}

.slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.slider-track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 10px;
  scroll-snap-type: x mandatory;
}

.slider-card {
  min-width: 320px;
  flex: 0 0 320px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  background: #fff;
  scroll-snap-align: start;
}

.board-results {
  margin-top: 42px;
}

.board-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.board-item {
  padding: 18px 20px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #eee;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}

.board-item:hover {
  transform: translateY(-2px);
  border-color: #ff7a00;
}

.board-item strong {
  display: block;
  margin-bottom: 8px;
  font-size: 15px;
}

.board-item p {
  margin: 0;
  color: #666;
  font-size: 13px;
}

.empty {
  padding: 20px;
  border-radius: 16px;
  background: #fff7e6;
  color: #7a5b24;
  border: 1px solid #f2d4a5;
  font-size: 14px;
}

@media (max-width: 900px) {
  .place-grid {
    grid-template-columns: 1fr;
  }

  .search-topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-summary {
    text-align: left;
  }

  .slider-card {
    min-width: 100%;
  }
}
.card-img-area {
  position: relative;
  min-height: 180px;
  overflow: hidden;
  background: #ffe6c3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-img-area.no-image img {
  width: auto;
  height: 70%;
  object-fit: contain;
}

.card-img-area.no-image::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #ffd59e;
  z-index: 0;
}

.card-img-area img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  position: relative;
  z-index: 1;
}
</style>