<template>
  <div class="map-page-container">
    <Header />

    <section class="search-filter-section">
      <div class="filter-wrapper">
        <div class="search-row">
          <div class="search-input-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="장소, 지역, 키워드 검색" 
              @keyup.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">🔍</button>
          </div>
        </div>

        <div class="select-row">
          <select v-model="selectedDistrict" @change="handleDistrictChange" class="filter-select">
            <option value="all">지역 선택 (전체)</option>
            <option v-for="district in districts" :key="district" :value="district">
              {{ district }}
            </option>
          </select>

          <select v-model="currentCategory" @change="handleCategoryChange" class="filter-select">
            <option value="none">카테고리를 선택하세요</option>
            <option v-for="tab in categoryTabs" :key="tab.id" :value="tab.id">
              {{ tab.name }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <main class="map-section">
      <div id="map" class="kakao-map"></div>
    </main>

    <section class="list-section">
      <div class="list-header">
        <h3>검색 결과 <span class="count-text">({{ filteredList.length }})</span></h3>
      </div>
      
      <div class="horizontal-card-list" v-if="filteredList.length > 0">
        <div 
          v-for="f in filteredList" 
          :key="f.contentid" 
          class="horizontal-card"
          @click="focusOnMap(f)"
        >
          <div class="card-img-area">
            <img
              v-if="f.firstimage"
              :src="f.firstimage"
              alt="장소 이미지"
              @error="event => event.target.style.display = 'none'"
            />
          </div>

          <div class="card-info-area">
            <div class="card-title-row">
              <h4 class="card-title">{{ f.title || '제목 없음' }}</h4>
              <span :class="['category-badge', getCategoryClass(f)]">
                {{ getCategoryNameOfItem(f) }}
              </span>
            </div>
            <p class="card-address">{{ f.addr1 || '주소 정보가 없습니다.' }}</p>
            <p class="card-desc">{{ f.tel ? '📞 ' + f.tel : '상세 정보는 마커를 호버하여 확인하세요.' }}</p>
          </div>

          <div class="card-meta-area">
            <span class="distance-text">1.2km</span>
          </div>
        </div>

        <div class="more-btn-wrap">
          <button class="more-btn">더 많은 장소 보기</button>
        </div>
      </div>

      <div class="no-data" v-else>
        <p>검색 결과와 일치하는 장소가 없습니다. 🥲</p>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

import { onMounted, ref, computed } from 'vue'

import tourData from '../data/서울_관광지.json'
import leportsData from '../data/서울_레포츠.json'
import cultureData from '../data/서울_문화시설.json'
import shoppingData from '../data/서울_쇼핑.json'
import accommodationData from '../data/서울_숙박.json'

const categoryTabs = [
  { id: 'tour', name: '관광지', data: tourData },
  { id: 'leports', name: '레포츠', data: leportsData },
  { id: 'culture', name: '문화시설', data: cultureData },
  { id: 'shopping', name: '쇼핑', data: shoppingData },
  { id: 'accommodation', name: '숙박', data: accommodationData }
]

const kakaoMapAppKey = import.meta.env.VITE_KAKAO_MAP_APPKEY || ''
const currentCategory = ref('none')
const selectedDistrict = ref('all')
const searchQuery = ref('')

const districts = [
  '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
  '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
  '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
]

let mapInstance = null
const markers = ref([])
const overlays = {}

const getDistrictName = (address) => {
  if (!address) return '서울'
  const parts = address.split(' ')
  return parts[1] && parts[1].endsWith('구') ? parts[1] : '서울'
}

const getCategoryNameOfItem = (item) => {
  if (tourData.items?.some(i => i.contentid === item.contentid)) return '관광지'
  if (leportsData.items?.some(i => i.contentid === item.contentid)) return '레포츠'
  if (cultureData.items?.some(i => i.contentid === item.contentid)) return '문화시설'
  if (shoppingData.items?.some(i => i.contentid === item.contentid)) return '쇼핑'
  if (accommodationData.items?.some(i => i.contentid === item.contentid)) return '숙박'
  return '장소'
}

const getCategoryClass = (item) => {
  if (tourData.items?.some(i => i.contentid === item.contentid)) return 'tour-tag'
  if (leportsData.items?.some(i => i.contentid === item.contentid)) return 'leports-tag'
  if (cultureData.items?.some(i => i.contentid === item.contentid)) return 'culture-tag'
  if (shoppingData.items?.some(i => i.contentid === item.contentid)) return 'shopping-tag'
  if (accommodationData.items?.some(i => i.contentid === item.contentid)) return 'accommodation-tag'
  return 'default-tag'
}

const rawList = computed(() => {
  if (currentCategory.value === 'none') return []

  if (currentCategory.value !== 'all') {
    const activeTab = categoryTabs.find(tab => tab.id === currentCategory.value)
    return activeTab && activeTab.data && activeTab.data.items ? activeTab.data.items : []
  }

  let combined = []
  categoryTabs.forEach(tab => {
    if (tab.data && tab.data.items) {
      combined = [...combined, ...tab.data.items]
    }
  })
  return combined
})

const filteredList = computed(() => {
  let list = [...rawList.value]

  if (selectedDistrict.value !== 'all') {
    list = list.filter(item => getDistrictName(item.addr1) === selectedDistrict.value)
  }

  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase()
    list = list.filter(item =>
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.addr1 && item.addr1.toLowerCase().includes(query))
    )
  }

  return list
})

const initMap = () => {
  const container = document.getElementById('map')
  if (!container) return

  const options = {
    center: new kakao.maps.LatLng(37.5665, 126.9780),
    level: 7
  }
  mapInstance = new kakao.maps.Map(container, options)

  updateMarkers()
  if (currentCategory.value === 'none') return
}

const updateMarkers = () => {
  markers.value.forEach(marker => marker.setMap(null))
  markers.value = []

  Object.values(overlays).forEach(o => o.setMap(null))
  for (const key in overlays) {
    delete overlays[key]
  }

  filteredList.value.forEach(f => {
    const lat = Number(f.mapy)
    const lng = Number(f.mapx)

    if (f.mapy && f.mapx && !isNaN(lat) && !isNaN(lng)) {
      const position = new kakao.maps.LatLng(lat, lng)

      const marker = new kakao.maps.Marker({
        position
      })
      marker.setMap(mapInstance)
      markers.value.push(marker)

      const content = `
        <div class="map-overlay-card">
          <img
            src="${f.firstimage || ''}"
            class="overlay-img"
            onerror="this.onerror=null; this.src=''; this.style.background='#eeeeee';"
          >
          <h4 class="overlay-title">${f.title || '제목 없음'}</h4>
          <p class="overlay-addr">${f.addr1 || ''}</p>
        </div>
      `

      const overlay = new kakao.maps.CustomOverlay({
        content,
        position,
        yAnchor: 1.25,
        clickable: false
      })

      overlays[f.contentid] = overlay

      kakao.maps.event.addListener(marker, 'mouseover', () => {
        overlay.setMap(mapInstance)
      })

      kakao.maps.event.addListener(marker, 'mouseout', () => {
        overlay.setMap(null)
      })
    }
  })

  if (filteredList.value.length > 0 && selectedDistrict.value !== 'all') {
    const firstItem = filteredList.value[0]
    const newCenter = new kakao.maps.LatLng(Number(firstItem.mapy), Number(firstItem.mapx))
    mapInstance.panTo(newCenter)
    mapInstance.setLevel(6)
  } else if (selectedDistrict.value === 'all' && mapInstance) {
    mapInstance.panTo(new kakao.maps.LatLng(37.5665, 126.9780))
    mapInstance.setLevel(7)
  }
}

const handleCategoryChange = () => { updateMarkers() }
const handleDistrictChange = () => { updateMarkers() }
const handleSearch = () => { updateMarkers() }

const focusOnMap = (festival) => {
  const lat = Number(festival.mapy)
  const lng = Number(festival.mapx)

  if (mapInstance && !isNaN(lat) && !isNaN(lng)) {
    const moveLatLon = new kakao.maps.LatLng(lat, lng)
    mapInstance.panTo(moveLatLon)
    mapInstance.setLevel(5)

    Object.values(overlays).forEach(o => o.setMap(null))
    if (overlays[festival.contentid]) {
      overlays[festival.contentid].setMap(mapInstance)
      setTimeout(() => {
        if (overlays[festival.contentid]) {
          overlays[festival.contentid].setMap(null)
        }
      }, 3000)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  if (!kakaoMapAppKey) {
    console.error('VITE_KAKAO_MAP_APPKEY가 설정되지 않았습니다. .env 파일에 키를 추가해주세요.')
    return
  }

  if (window.kakao && window.kakao.maps) {
    window.kakao.maps.load(initMap)
  } else {
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${kakaoMapAppKey}`
    script.onload = () => window.kakao.maps.load(initMap)
    script.onerror = () => console.error('카카오 지도 SDK 로딩 실패: 앱 키 또는 네트워크를 확인하세요.')
    document.head.appendChild(script)
  }
})
</script>

<style scoped>
.map-page-container {
  font-family: 'Pretendard', -apple-system, sans-serif;
  color: #333;
  background-color: #fafafa;
  min-height: 100vh;
}

.search-filter-section {
  background: #ffffff;
  padding: 16px 10%;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: center;
}

.filter-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 800px;
}

.search-row {
  width: 100%;
}

.search-input-box {
  position: relative;
  width: 100%;
}

.search-input-box input {
  width: 100%;
  padding: 12px 45px 12px 18px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background-color: #f7f7f7;
  font-size: 14.5px;
  outline: none;
  transition: all 0.2s;
}

.search-input-box input:focus {
  border-color: #ff5a22;
  background-color: #fff;
}

.search-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.select-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.filter-select {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  font-weight: 500;
  color: #4f4f4f;
  background-color: #ffffff;
  cursor: pointer;
  outline: none;
}

.filter-select:focus {
  border-color: #ff5a22;
}

.map-section {
  width: 100%;
}

.kakao-map {
  width: 100%;
  height: 70vh;
}

.list-section {
  max-width: 800px;
  margin: 30px auto;
  padding: 0 20px;
}

.list-header {
  margin-bottom: 16px;
}

.list-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.count-text {
  color: #888888;
  font-weight: 400;
}

.horizontal-card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.horizontal-card {
  display: flex;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.horizontal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}

.card-img-area {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background: #ddd; /* 회색 배경 */
  flex-shrink: 0;
}

.card-img-area img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-info-area {
  margin-left: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.card-title {
  font-size: 17px;
  font-weight: 700;
  color: #111;
  margin: 0;
}

.category-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.tour-tag { background: #ffebeb; color: #ff5a22; }
.leports-tag { background: #eef3ff; color: #3182ce; }
.culture-tag { background: #f0fff4; color: #38a169; }
.shopping-tag { background: #fffaf0; color: #dd6b20; }
.accommodation-tag { background: #faf5ff; color: #805ad5; }
.default-tag { background: #f7fafc; color: #4a5568; }

.card-address {
  font-size: 13.5px;
  color: #666;
  margin: 0 0 6px 0;
}

.card-desc {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.card-meta-area {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 60px;
  flex-shrink: 0;
}

.distance-text {
  font-size: 13.5px;
  color: #888;
  font-weight: 600;
}

.more-btn-wrap {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.more-btn {
  width: 100%;
  padding: 14px;
  border: 1px solid #ff5a22;
  background: #ffffff;
  color: #ff5a22;
  font-weight: 700;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.more-btn:hover {
  background: #ff5a22;
  color: white;
}

.no-data {
  text-align: center;
  padding: 50px 0;
  font-size: 15px;
  color: #888888;
}

:deep(.map-overlay-card) {
  padding: 10px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  width: 190px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.12);
  pointer-events: none;
}

:deep(.overlay-img) {
  width: 100%;
  height: 105px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
  background: #eeeeee;
}

:deep(.overlay-title) {
  font-size: 13.5px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

:deep(.overlay-addr) {
  font-size: 11px;
  color: #718096;
  margin: 0;
}
</style>
```