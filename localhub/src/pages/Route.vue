<template>
  <div class="route-page">
    <Header />

    <main class="route-main">
      <section class="hero-card">
        <h2>🗺️ 길찾기</h2>
        <p>여행할 장소를 선택하면 지도 위에서 이동 경로를 확인할 수 있어요.</p>
      </section>

      <section class="planner-card">
        <div class="place-list">
          <div class="section-title-row">
            <h3>장소 선택</h3>
            <span>{{ selectedPlaces.length }}개 선택됨</span>
          </div>

          <div class="place-grid">
            <button
              v-for="place in placeOptions"
              :key="place.id"
              class="place-chip"
              :class="{ active: isSelected(place) }"
              @click="togglePlace(place)"
            >
              {{ place.title }}
            </button>
          </div>
        </div>

        <div class="selected-list">
          <div class="section-title-row">
            <h3>선택된 경로</h3>
            <button class="route-btn" @click="buildRoute">경로 보기</button>
          </div>

          <ul v-if="selectedPlaces.length">
            <li v-for="(place, index) in selectedPlaces" :key="place.id">
              <span class="order">{{ index + 1 }}</span>
              <span>{{ place.title }}</span>
            </li>
          </ul>

          <p v-else class="empty-text">장소를 2개 이상 선택해 주세요.</p>

          <div v-if="routeSummary || routeError" class="route-info">
            <div v-if="routeSummary">{{ routeSummary }}</div>
            <div v-else class="route-error">{{ routeError }}</div>
          </div>
        </div>
      </section>

      <section class="map-card">
        <div id="route-map" class="route-map"></div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

import tourData from '../data/서울_관광지.json'
import leportsData from '../data/서울_레포츠.json'
import cultureData from '../data/서울_문화시설.json'
import shoppingData from '../data/서울_쇼핑.json'
import accommodationData from '../data/서울_숙박.json'

const placeOptions = ref([])
const selectedPlaces = ref([])
const routeSummary = ref('')
const routeError = ref('')
const routeMapInstance = ref(null)
const routeMarkers = ref([])
const routePolyline = ref(null)

const kakaoMapAppKey = import.meta.env.VITE_KAKAO_MAP_APPKEY || ''
const kakaoRestApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY || ''

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

  placeOptions.value = merged.slice(0, 40)
}

function isSelected(place) {
  return selectedPlaces.value.some((item) => item.id === place.id)
}

function togglePlace(place) {
  if (isSelected(place)) {
    selectedPlaces.value = selectedPlaces.value.filter((item) => item.id !== place.id)
  } else {
    selectedPlaces.value = [...selectedPlaces.value, place]
  }
  routeError.value = ''
  routeSummary.value = ''
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

async function buildRoute() {
  if (selectedPlaces.value.length < 2) {
    routeError.value = '장소를 2개 이상 선택해 주세요.'
    routeSummary.value = ''
    return
  }

  routeError.value = ''
  routeSummary.value = '경로를 계산 중입니다...'

  const map = initMap()
  if (!map) return

  if (!kakaoRestApiKey) {
    drawSimpleRoute(selectedPlaces.value)
    routeSummary.value = '카카오 REST API 키가 없어서 기본 경로로 표시합니다.'
    return
  }

  try {
    const payload = {
      origin: {
        x: String(selectedPlaces.value[0].mapx.toFixed(6)),
        y: String(selectedPlaces.value[0].mapy.toFixed(6))
      },
      destination: {
        x: String(selectedPlaces.value[selectedPlaces.value.length - 1].mapx.toFixed(6)),
        y: String(selectedPlaces.value[selectedPlaces.value.length - 1].mapy.toFixed(6))
      },
      waypoints: selectedPlaces.value.slice(1, -1).map((place) => ({
        name: place.title,
        x: String(place.mapx.toFixed(6)),
        y: String(place.mapy.toFixed(6))
      })),
      priority: 'RECOMMEND'
    }

    const response = await fetch('/api/kakao-directions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `KakaoAK ${kakaoRestApiKey}`
      },
      body: JSON.stringify(payload)
    })

    const responseText = await response.text()
    console.log('카카오 응답 상태:', response.status)
    console.log('카카오 응답 본문:', responseText)

    if (!response.ok) {
      throw new Error(`경로 요청 실패: ${response.status} / ${responseText}`)
    }

    let responseData = null
    try {
      responseData = JSON.parse(responseText)
    } catch {
      throw new Error(`경로 응답 파싱 실패: ${responseText}`)
    }

    const route = responseData?.routes?.[0]
    if (!route?.sections?.length) {
      throw new Error(`경로 응답 형식이 올바르지 않습니다: ${responseText}`)
    }

    const path = []
    route.sections.forEach((section) => {
      section.roads?.forEach((road) => {
        const vertexes = road.vertexes || []
        for (let i = 0; i < vertexes.length; i += 2) {
          const x = vertexes[i]
          const y = vertexes[i + 1]
          if (Number.isFinite(x) && Number.isFinite(y)) {
            path.push(new window.kakao.maps.LatLng(y, x))
          }
        }
      })
    })

    if (path.length < 2) {
      throw new Error('경로 좌표를 찾지 못했습니다.')
    }

    clearMap()

    routeMarkers.value.push(
      new window.kakao.maps.Marker({
        map,
        position: path[0],
        title: '출발지'
      })
    )

    routeMarkers.value.push(
      new window.kakao.maps.Marker({
        map,
        position: path[path.length - 1],
        title: '도착지'
      })
    )

    routePolyline.value = new window.kakao.maps.Polyline({
      map,
      path,
      strokeWeight: 6,
      strokeColor: '#ff5a22',
      strokeOpacity: 0.95,
      strokeStyle: 'solid'
    })

    const bounds = new window.kakao.maps.LatLngBounds()
    path.forEach((point) => bounds.extend(point))
    map.setBounds(bounds)

    const distanceKm = route.summary?.distance ? (route.summary.distance / 1000).toFixed(1) : '0.0'
    const durationMin = route.summary?.duration ? Math.max(1, Math.round(route.summary.duration / 60)) : 0
    routeSummary.value = `${distanceKm}km · 약 ${durationMin}분`
  } catch (error) {
    console.error(error)
    drawSimpleRoute(selectedPlaces.value)
    routeError.value = '실제 도로 경로 요청이 실패해서 기본 경로로 표시합니다.'
    routeSummary.value = ''
  }
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
  background: #faf9f6;
  min-height: 100vh;
}

.route-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

.hero-card,
.planner-card,
.map-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #eee;
  box-shadow: 0 6px 20px rgba(0,0,0,0.04);
  padding: 20px;
  margin-bottom: 20px;
}

.hero-card h2 {
  margin: 0 0 8px;
  color: #222;
}

.hero-card p {
  margin: 0;
  color: #666;
}

.planner-card {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 16px;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.place-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.place-chip {
  border: 1px solid #eee;
  background: #fff;
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
}

.place-chip.active {
  background: #ff5a22;
  color: white;
  border-color: #ff5a22;
}

.selected-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.selected-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f3f3;
}

.order {
  display: inline-flex;
  width: 24px;
  height: 24px;
  background: #fff7ef;
  color: #ff5a22;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
}

.route-btn {
  border: none;
  background: #ff5a22;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.route-info {
  margin-top: 12px;
  color: #ff5a22;
  font-weight: 600;
}

.route-error {
  color: #d9534f;
}

.empty-text {
  color: #888;
}

.route-map {
  width: 100%;
  height: 420px;
  border-radius: 12px;
  overflow: hidden;
}

@media (max-width: 800px) {
  .planner-card {
    grid-template-columns: 1fr;
  }
}
</style>