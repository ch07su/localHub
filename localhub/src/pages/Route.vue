<template>
  <div class="route-page">
    <Header />

    <main class="route-main">
      <section class="route-hero">
        <div class="hero-copy">
          <p class="eyebrow">서울 여행 길찾기</p>
          <h1>검색으로 장소를 골라보세요</h1>
          <p>
            장소를 검색해서 필요한 장소를 추가하고, 선택한 장소를 지도 위에 확인하세요.
          </p>
        </div>

        <div class="hero-card">
          <div class="search-box">
            <input
              v-model="placeQuery"
              @input="updateSearchResults"
              placeholder="장소명, 지역, 키워드를 입력하세요"
            />
            <button type="button" @click="selectFirstResult">검색</button>
          </div>

          <ul v-if="searchResults.length" class="search-results">
            <li
              v-for="item in searchResults"
              :key="item.id"
              @click="selectPlace(item)"
            >
              <strong>{{ item.title }}</strong>
              <span>{{ item.address || '주소 정보 없음' }}</span>
            </li>
          </ul>

          <p v-else class="search-hint">
            장소명을 입력하면 추천 결과가 나타납니다.
          </p>
        </div>
      </section>

      <section class="route-layout">
        <div class="route-panel">
          <div class="panel-header">
            <div>
              <p class="panel-label">선택된 장소</p>
              <h2>{{ selectedPlaces.length }}개 선택됨</h2>
            </div>
          </div>

          <div class="selected-cards">
            <div
              v-for="(place, index) in selectedPlaces"
              :key="place.id"
              class="selected-card"
            >
              <div class="selected-card-left">
                <span class="place-order">{{ index + 1 }}</span>
                <div>
                  <p class="place-title">{{ place.title }}</p>
                  <p class="place-address">{{ place.address }}</p>
                </div>
              </div>
              <button class="remove-btn" @click="removePlace(place)">
                삭제
              </button>
            </div>

            <div v-if="!selectedPlaces.length" class="empty-selected">
              검색에서 장소를 추가하면 여기서 경로 순서를 확인할 수 있어요.
            </div>
          </div>

          <button
            class="build-route-btn"
            @click="buildRoute"
            :disabled="selectedPlaces.length < 2"
          >
            지도에 경로 표시
          </button>

          <div class="route-status">
            <p v-if="routeSummary" class="route-summary">{{ routeSummary }}</p>
            <p v-if="routeError" class="route-error">{{ routeError }}</p>
          </div>
        </div>

        <div class="route-map-card">
          <div id="route-map" class="route-map"></div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

import tourData from '../data/서울_관광지.json'
import leportsData from '../data/서울_레포츠.json'
import cultureData from '../data/서울_문화시설.json'
import shoppingData from '../data/서울_쇼핑.json'
import accommodationData from '../data/서울_숙박.json'

const placeQuery = ref('')
const searchResults = ref([])
const placeOptions = ref([])
const selectedPlaces = ref([])
const routeSummary = ref('')
const routeError = ref('')
const routeMapInstance = ref(null)
const routeMarkers = ref([])
const routePolyline = ref(null)

const kakaoMapAppKey = import.meta.env.VITE_KAKAO_MAP_APPKEY || ''

const datasets = [
  { name: '관광지', data: tourData },
  { name: '레포츠', data: leportsData },
  { name: '문화시설', data: cultureData },
  { name: '쇼핑', data: shoppingData },
  { name: '숙박', data: accommodationData }
]

function buildPlaceOptions() {
  const merged = []

  datasets.forEach(({ data }) => {
    ;(data?.items || []).forEach((item) => {
      const lat = Number(item.mapy)
      const lng = Number(item.mapx)

      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        merged.push({
          id: item.contentid || `${item.title}-${merged.length}`,
          title: item.title || '장소',
          address: item.addr1 || '',
          mapx: lng,
          mapy: lat
        })
      }
    })
  })

  placeOptions.value = merged
}

const filteredSearchResults = computed(() => {
  const query = placeQuery.value.trim().toLowerCase()
  if (!query) return []

  return placeOptions.value
    .filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.address.toLowerCase().includes(query)
      )
    })
    .slice(0, 12)
})

function updateSearchResults() {
  searchResults.value = filteredSearchResults.value
}

function selectPlace(place) {
  if (selectedPlaces.value.some((item) => item.id === place.id)) return

  selectedPlaces.value.push(place)
  placeQuery.value = ''
  searchResults.value = []
  routeError.value = ''
  routeSummary.value = ''
  focusMap(place)
}

function removePlace(place) {
  selectedPlaces.value = selectedPlaces.value.filter((item) => item.id !== place.id)
  routeError.value = ''
  routeSummary.value = ''
}

function selectFirstResult() {
  if (filteredSearchResults.value.length > 0) {
    selectPlace(filteredSearchResults.value[0])
  }
}

function loadKakaoMapScript() {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(resolve)
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${kakaoMapAppKey}`
    script.onload = () => window.kakao.maps.load(resolve)
    script.onerror = () => reject(new Error('카카오 지도 로딩 실패'))
    document.head.appendChild(script)
  })
}

function initMap() {
  const container = document.getElementById('route-map')
  if (!container || !window.kakao?.maps) return

  if (!routeMapInstance.value) {
    routeMapInstance.value = new window.kakao.maps.Map(container, {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 7
    })
  }

  return routeMapInstance.value
}

function clearMap() {
  routeMarkers.value.forEach((marker) => marker.setMap(null))
  routeMarkers.value = []

  if (routePolyline.value) {
    routePolyline.value.setMap(null)
    routePolyline.value = null
  }
}

function focusMap(place) {
  const map = initMap()
  if (!map) return

  const position = new window.kakao.maps.LatLng(place.mapy, place.mapx)
  map.panTo(position)
  map.setLevel(5)
}

function drawSimpleRoute(items) {
  const map = initMap()
  if (!map) return

  clearMap()

  const path = items.map((item) => new window.kakao.maps.LatLng(item.mapy, item.mapx))
  const bounds = new window.kakao.maps.LatLngBounds()

  path.forEach((point) => bounds.extend(point))

  items.forEach((item) => {
    const marker = new window.kakao.maps.Marker({
      map,
      position: new window.kakao.maps.LatLng(item.mapy, item.mapx),
      title: item.title
    })
    routeMarkers.value.push(marker)
  })

  if (path.length >= 2) {
    routePolyline.value = new window.kakao.maps.Polyline({
      map,
      path,
      strokeWeight: 6,
      strokeColor: '#ff5a22',
      strokeOpacity: 0.95,
      strokeStyle: 'solid'
    })
  }

  map.setBounds(bounds)
}

function buildRoute() {
  if (selectedPlaces.value.length < 2) {
    routeError.value = '장소를 2개 이상 선택해 주세요.'
    routeSummary.value = ''
    return
  }

  routeError.value = ''
  drawSimpleRoute(selectedPlaces.value)
  routeSummary.value = '선택한 장소를 연결한 단순 경로를 표시했습니다.'
}

onMounted(() => {
  buildPlaceOptions()
  loadKakaoMapScript()
    .then(() => initMap())
    .catch((err) => console.error(err))
})
</script>

<style scoped>
.route-page {
  background: #fff7ef;
  min-height: 100vh;
  color: #333;
}

.route-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

.route-hero {
  display: grid;
  gap: 20px;
  margin-bottom: 24px;
}

.hero-copy {
  padding: 28px 32px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.05);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  color: #ff7a00;
  letter-spacing: 0.05em;
}

.hero-copy h1 {
  margin: 0;
  font-size: 38px;
  line-height: 1.15;
  color: #222;
}

.hero-copy p {
  margin: 14px 0 0;
  max-width: 640px;
  color: #666;
  font-size: 16px;
  line-height: 1.7;
}

.hero-card {
  padding: 28px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.05);
}

.search-box {
  display: flex;
  gap: 12px;
  max-width: 840px;
  margin-bottom: 16px;
}

.search-box input {
  flex: 1;
  padding: 16px 18px;
  border: 1px solid #f0e5d7;
  border-radius: 14px;
  font-size: 16px;
  outline: none;
  background: #fff;
}

.search-box button {
  min-width: 140px;
  border: none;
  border-radius: 14px;
  background: #ff7a00;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.search-results {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
  max-width: 840px;
}

.search-results li {
  padding: 16px 18px;
  border-radius: 16px;
  background: #fff8f2;
  border: 1px solid #ffecd9;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.search-results li:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.search-results strong {
  display: block;
  margin-bottom: 6px;
  color: #222;
}

.search-results span {
  color: #7a7a7a;
  font-size: 14px;
}

.search-hint {
  margin: 0;
  color: #8a8a8a;
  font-size: 15px;
}

.route-layout {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 24px;
}

.route-panel,
.route-map-card {
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.05);
}

.route-panel {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}

.panel-label {
  margin: 0;
  color: #ff8a1f;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.panel-header h2 {
  margin: 0;
  font-size: 28px;
  color: #222;
}

.selected-cards {
  display: grid;
  gap: 12px;
}

.selected-card {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid #f2e4d4;
  background: #fff8f2;
}

.selected-card-left {
  display: flex;
  gap: 14px;
  align-items: center;
}

.place-order {
  display: inline-flex;
  min-width: 36px;
  min-height: 36px;
  border-radius: 50%;
  background: #ffefdc;
  color: #ff7a00;
  justify-content: center;
  align-items: center;
  font-weight: 700;
}

.place-title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: #222;
}

.place-address {
  margin: 0;
  color: #7a7a7a;
  font-size: 14px;
}

.remove-btn {
  border: none;
  background: transparent;
  color: #d24949;
  font-weight: 700;
  cursor: pointer;
}

.empty-selected {
  padding: 24px;
  border-radius: 20px;
  background: #fff3e8;
  color: #8a7a6b;
  text-align: center;
}

.build-route-btn {
  width: 100%;
  padding: 16px 0;
  border: none;
  border-radius: 16px;
  background: #ff5a22;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.build-route-btn:disabled {
  background: #f3b79b;
  cursor: not-allowed;
}

.route-status {
  display: grid;
  gap: 8px;
}

.route-summary {
  padding: 16px;
  border-radius: 16px;
  background: #fef4e8;
  color: #ff7a00;
  font-weight: 700;
}

.route-error {
  padding: 16px;
  border-radius: 16px;
  background: #ffe9e9;
  color: #d24949;
}

.route-map-card {
  min-height: 680px;
  padding: 24px;
}

.route-map {
  width: 100%;
  height: 640px;
  border-radius: 24px;
  border: 1px solid #f0e0d6;
  overflow: hidden;
}

@media (max-width: 1100px) {
  .route-layout {
    grid-template-columns: 1fr;
  }

  .route-map {
    height: 520px;
  }
}

@media (max-width: 760px) {
  .route-main {
    padding: 18px 16px 40px;
  }

  .hero-copy h1 {
    font-size: 30px;
  }

  .search-box {
    flex-direction: column;
  }

  .search-box button {
    width: 100%;
  }

  .route-map {
    height: 420px;
  }
}
</style>