<template>
  <div class="map-page-container">
    <Header />

    <!-- 상단 필터 및 스탬프 레벨 섹션 -->
    <section class="search-filter-section">
      <div class="filter-wrapper">
        
        <!-- 🎖️ 실시간 스탬프 레벨 대시보드 (기존 유지) -->
        <div class="stamp-level-dashboard">
          <div class="level-badge-wrap">
            <span class="level-tag">Lv.{{ userLevel.lv }}</span>
            <span class="level-title">{{ userLevel.title }}</span>
            
            <!-- ℹ️ 오른쪽 위에 깔끔하게 배치된 자세히보기 버튼 -->
            <button class="level-detail-btn" @click="isModalOpen = true">
              자세히 보기 <span>ℹ️</span>
            </button>
          </div>
          <div class="level-progress-bar">
            <div class="progress-fill" :style="{ width: userLevel.percent + '%' }"></div>
          </div>
          <p class="stamp-summary-text">
            총 <strong>{{ stampedIds.length }}</strong>곳의 스탬프를 획득했습니다! 
            <span v-if="userLevel.lv < 5">(다음 등급까지 {{ userLevel.next - stampedIds.length }}개 남음)</span>
            <span v-else>🎉 서울을 완전히 정복하셨습니다!</span>
          </p>
        </div>

        <!-- 🔍 세련되고 깔끔하게 개선된 검색창 (추천 드롭다운 연동 레이어 감싸기) -->
        <div class="search-row">
          <div class="search-wrapper" style="position: relative; width: 100%; z-index: 99;">
            <div class="search-input-box">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="장소, 지역, 키워드 검색" 
                @focus="isDropdownOpen = true"
                @blur="handleBlur"
                @keyup.enter="selectFirstRecommendation"
              />
              <button class="search-btn" @click="handleSearch">🔍</button>
            </div>

            <!-- ★ 입력 포커스 시 나타나는 실시간 추천 드롭다운 목록 -->
            <ul 
              v-if="isDropdownOpen && filteredRecommendations.length" 
              class="recommendation-dropdown"
            >
              <li
                v-for="place in filteredRecommendations"
                :key="place.contentid"
                @mousedown="clickRecommendation(place)"
              >
                <div class="recommend-item">
                  <span class="recommend-title">{{ place.title }}</span>
                  <span class="recommend-address">{{ place.addr1 }}</span>
                </div>
              </li>
            </ul>
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

        <!-- 💮 스탬프 지도 보기 필터 -->
        <div class="stamp-filter-row">
          <label class="stamp-checkbox-label">
            <input 
              type="checkbox" 
              v-model="showOnlyStamped" 
              @change="handleStampFilterChange"
            />
            <span class="checkbox-custom"></span>
            💮 내가 스탬프 찍은 장소만 모아보기
          </label>
        </div>
      </div>
    </section>

    <!-- 🗺️ 지도 섹션 -->
    <main class="map-section">
      <div id="map" class="kakao-map"></div>
    </main>

    <!-- 📋 리스트 섹션 -->
    <section class="list-section">
      <div class="list-header">
        <h3>
          {{ showOnlyStamped ? '내 발자국 스탬프 목록' : '검색 결과' }}
          <span class="count-text">({{ filteredList.length }})</span>
        </h3>
      </div>
      
      <div class="horizontal-card-list" v-if="filteredList.length > 0">
          <div
            v-for="f in filteredList"
            :key="f.contentid"
            class="horizontal-card"
            @click="focusOnMap(f)"
          >
            <div class="card-action-buttons">
              <button
                :class="['card-fav-btn', { 'favorited': isFavorited(f.contentid) }]"
                @click.stop="toggleFavorite(f.contentid)"
              >
                {{ isFavorited(f.contentid) ? '★' : '☆' }}
              </button>

              <div class="stamp-btn-wrapper">
                <button
                  :class="['card-stamp-btn', { 'stamped': isStamped(f.contentid) }]"
                  @click.stop="toggleStamp(f.contentid)"
                >
                  {{ isStamped(f.contentid) ? '💮' : '○' }}
                </button>
                <span :class="['stamp-label', { 'stamped-active': isStamped(f.contentid) }]">
                  {{ isStamped(f.contentid) ? '다녀옴!' : '도장 찍기' }}
                </span>
              </div>
            </div>
          </div>
            <div class="card-img-area" :class="{ 'no-image': !f.firstimage }">
              <img
                :src="f.firstimage || noImagePlaceholder"
                alt="장소 이미지"
                @error="event => event.target.src = noImagePlaceholder"
              />
            </div>
      </div>

      <div class="no-data" v-else>
        <p v-if="showOnlyStamped">아직 찍은 스탬프가 없거나 필터 조건에 맞는 스탬프가 없습니다. 🥲</p>
        <p v-else>검색 결과와 일치하는 장소가 없습니다. 🥲</p>
      </div>
    </section>

    <!-- 💮 등급별 스탬프 가이드 팝업 (모달) -->
    <div class="modal-overlay" v-if="isModalOpen" @click.self="isModalOpen = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>💮 등급별 스탬프 레벨 안내</h3>
          <button class="modal-close-btn" @click="isModalOpen = false">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-intro">서울 곳곳을 탐험하고 스탬프를 찍어 나만의 여행 등급을 높여보세요!</p>
          
          <table class="level-table">
            <thead>
              <tr>
                <th>등급</th>
                <th>등급 이름</th>
                <th>필요 스탬프 수</th>
              </tr>
            </thead>
            <tbody>
              <tr :class="{ 'current-lv-row': userLevel.lv === 1 }">
                <td class="lv-col"><span class="lv-badge badge-l1">Lv.1</span></td>
                <td class="title-col">🐣 집밖은 위험해 초보</td>
                <td class="cond-col">0 ~ 1개</td>
              </tr>
              <tr :class="{ 'current-lv-row': userLevel.lv === 2 }">
                <td class="lv-col"><span class="lv-badge badge-l2">Lv.2</span></td>
                <td class="title-col">🌱 서투른 첫발걸음</td>
                <td class="cond-col">2 ~ 5개</td>
              </tr>
              <tr :class="{ 'current-lv-row': userLevel.lv === 3 }">
                <td class="lv-col"><span class="lv-badge badge-l3">Lv.3</span></td>
                <td class="title-col">🥉 발바닥에 땀나는 방랑자</td>
                <td class="cond-col">6 ~ 11개</td>
              </tr>
              <tr :class="{ 'current-lv-row': userLevel.lv === 4 }">
                <td class="lv-col"><span class="lv-badge badge-l4">Lv.4</span></td>
                <td class="title-col">🥈 골목길 탐험대장</td>
                <td class="cond-col">12 ~ 19개</td>
              </tr>
              <tr :class="{ 'current-lv-row': userLevel.lv === 5 }">
                <td class="lv-col"><span class="lv-badge badge-l5">Lv.5</span></td>
                <td class="title-col">🥇 서울 정복왕 (프로 여행러)</td>
                <td class="cond-col">20개 이상</td>
              </tr>
            </tbody>
          </table>
          
          <div class="current-status-box">
            현재 회원님의 스탬프 수는 <strong>{{ stampedIds.length }}개</strong>이며, 
            지금 등급은 <strong>Lv.{{ userLevel.lv }} {{ userLevel.title }}</strong> 입니다.
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-confirm-btn" @click="isModalOpen = false">확인</button>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import noImagePlaceholder from '../assets/free-icon-seoul-4480815.png'
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
const showOnlyStamped = ref(false)

// 드롭다운 가시성 상태 관리
const isDropdownOpen = ref(false)

// 💮 모달 열기/닫기 상태
const isModalOpen = ref(false)

// 💮 스탬프 / ⭐ 즐겨찾기 상태 로컬스토리지 연동
const stampedIds = ref([])
const favoriteIds = ref([])

const districts = [
  '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
  '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
  '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
]

let mapInstance = null
const markers = ref([])
const overlays = {}

// 🏆 스탬프 개수에 따른 사용자 레벨 계산
const userLevel = computed(() => {
  const count = stampedIds.value.length
  if (count >= 20) {
    return { lv: 5, title: '🥇 서울 정복왕 (프로 여행러)', percent: 100, next: 20 }
  } else if (count >= 12) {
    return { lv: 4, title: '🥈 골목길 탐험대장', percent: ((count - 12) / 8) * 100, next: 20 }
  } else if (count >= 6) {
    return { lv: 3, title: '🥉 발바닥에 땀나는 방랑자', percent: ((count - 6) / 6) * 100, next: 12 }
  } else if (count >= 2) {
    return { lv: 2, title: '🌱 서투른 첫발걸음', percent: ((count - 2) / 4) * 100, next: 6 }
  } else {
    return { lv: 1, title: '🐣 집밖은 위험해 초보', percent: (count / 2) * 100, next: 2 }
  }
})

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

const toggleStamp = (contentid) => {
  const index = stampedIds.value.indexOf(contentid)
  if (index > -1) {
    stampedIds.value.splice(index, 1)
  } else {
    stampedIds.value.push(contentid)
  }
  localStorage.setItem('seoul_stamped_places', JSON.stringify(stampedIds.value))
  updateMarkers()
}

const isStamped = (contentid) => {
  return stampedIds.value.includes(contentid)
}

// ⭐ 즐겨찾기 토글
const toggleFavorite = (contentid) => {
  const index = favoriteIds.value.indexOf(contentid)
  if (index > -1) {
    favoriteIds.value.splice(index, 1)
  } else {
    favoriteIds.value.push(contentid)
  }
  localStorage.setItem('seoul_favorite_places', JSON.stringify(favoriteIds.value))
  updateMarkers()
}

const isFavorited = (contentid) => {
  return favoriteIds.value.includes(contentid)
}

// 전체 카테고리에서 병합된 전체 장소 목록 (드롭다운 추천용 기반 데이터)
const allMergedPlaces = computed(() => {
  let combined = []
  categoryTabs.forEach(tab => {
    if (tab.data && tab.data.items) {
      combined = [...combined, ...tab.data.items]
    }
  })
  // 중복 제거
  const uniqueList = []
  const ids = new Set()
  combined.forEach(item => {
    if (!ids.has(item.contentid)) {
      ids.add(item.contentid)
      uniqueList.push(item)
    }
  })
  return uniqueList
})

// ★ 실시간 드롭다운 추천 리스트 계산 (상위 8개 노출)
const filteredRecommendations = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return []
  return allMergedPlaces.value
    .filter(place => {
      const titleMatch = place.title && place.title.toLowerCase().includes(query)
      const addrMatch = place.addr1 && place.addr1.toLowerCase().includes(query)
      return titleMatch || addrMatch
    })
    .slice(0, 8)
})

// 입력 포커스가 해제될 때 부드럽게 드롭다운 닫기
const handleBlur = () => {
  setTimeout(() => {
    isDropdownOpen.value = false
  }, 200)
}

// 드롭다운 장소 클릭 액션
const clickRecommendation = (place) => {
  searchQuery.value = place.title
  isDropdownOpen.value = false
  
  // 만약 검색창이 비어 있다면 전체 카테고리를 활성화하여 강제로 카드가 보이도록 유도
  if (currentCategory.value === 'none') {
    currentCategory.value = 'all'
  }
  
  updateMarkers()
  
  // 마커 업데이트 후 즉시 해당 위치로 초점 이동 및 스크롤
  setTimeout(() => {
    focusOnMap(place)
  }, 150)
}

// 검색창에서 엔터를 쳤을 때 자동 매칭
const selectFirstRecommendation = () => {
  if (filteredRecommendations.value.length > 0) {
    clickRecommendation(filteredRecommendations.value[0])
  } else {
    handleSearch()
  }
}

const rawList = computed(() => {
  if (currentCategory.value === 'none' && !showOnlyStamped.value) return []

  let combined = []
  if (currentCategory.value !== 'all' && currentCategory.value !== 'none') {
    const activeTab = categoryTabs.find(tab => tab.id === currentCategory.value)
    combined = activeTab && activeTab.data && activeTab.data.items ? activeTab.data.items : []
  } else {
    categoryTabs.forEach(tab => {
      if (tab.data && tab.data.items) {
        combined = [...combined, ...tab.data.items]
      }
    })
  }

  const uniqueList = []
  const ids = new Set()
  combined.forEach(item => {
    if (!ids.has(item.contentid)) {
      ids.add(item.contentid)
      uniqueList.push(item)
    }
  })

  return uniqueList
})

const filteredList = computed(() => {
  let list = [...rawList.value]

  if (showOnlyStamped.value) {
    list = list.filter(item => isStamped(item.contentid))
  }

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
}

const updateMarkers = () => {
  if (!mapInstance) return
  
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
      const stamped = isStamped(f.contentid)

      const marker = new kakao.maps.Marker({ position })
      marker.setMap(mapInstance)
      markers.value.push(marker)

      const content = `
        <div class="map-overlay-card ${stamped ? 'stamped-overlay' : ''}">
          <div class="overlay-badge-stamp" style="${stamped ? 'display: block;' : 'display: none;'}">💮 다녀옴</div>
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

  if (filteredList.value.length > 0 && (selectedDistrict.value !== 'all' || showOnlyStamped.value)) {
    const firstItem = filteredList.value[0]
    const newCenter = new kakao.maps.LatLng(Number(firstItem.mapy), Number(firstItem.mapx))
    mapInstance.panTo(newCenter)
    mapInstance.setLevel(6)
  } else if (selectedDistrict.value === 'all' && mapInstance && !showOnlyStamped.value) {
    mapInstance.panTo(new kakao.maps.LatLng(37.5665, 126.9780))
    mapInstance.setLevel(7)
  }
}

const handleCategoryChange = () => { updateMarkers() }
const handleDistrictChange = () => { updateMarkers() }
const handleSearch = () => { updateMarkers() }
const handleStampFilterChange = () => { updateMarkers() }

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
  // 💮 스탬프 목록 복구
  const savedStamps = localStorage.getItem('seoul_stamped_places')
  if (savedStamps) {
    try {
      stampedIds.value = JSON.parse(savedStamps)
    } catch (e) {
      stampedIds.value = []
    }
  }

  // ⭐ 즐겨찾기 목록 복구
  const savedFavorites = localStorage.getItem('seoul_favorite_places')
  if (savedFavorites) {
    try {
      favoriteIds.value = JSON.parse(savedFavorites)
    } catch (e) {
      favoriteIds.value = []
    }
  }

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
  padding: 24px 10%;
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

/* 🏵️ 스탬프 대시보드 UI */
.stamp-level-dashboard {
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(135deg, #fffcf5 0%, #fff3e5 100%);
  border: 1px solid #ffe3c4;
  border-radius: 16px;
  padding: 18px 24px;
  margin-bottom: 16px;
  box-shadow: 0 4px 15px rgba(255, 122, 0, 0.04);
}

.level-badge-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  position: relative;
}

.level-tag {
  background: #ff5a22;
  color: white;
  font-weight: 800;
  font-size: 13px;
  padding: 3px 10px;
  border-radius: 20px;
}

.level-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.level-detail-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #777777;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
  padding: 4px 8px;
}

.level-detail-btn:hover {
  color: #ff5a22;
  text-decoration: underline;
}

.level-progress-bar {
  background: #e2e8f0;
  border-radius: 10px;
  height: 8px;
  width: 100%;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  background: linear-gradient(90deg, #ff9e2c, #ff5a22);
  height: 100%;
  border-radius: 10px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.stamp-summary-text {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.stamp-summary-text strong {
  color: #ff5a22;
  font-size: 15px;
}

.stamp-filter-row {
  display: flex;
  margin-top: 4px;
}

.stamp-checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #ff5a22;
  user-select: none;
}

/* 🔍 세련되고 깔끔하게 개선된 검색창 영역 */
.search-row {
  width: 100%;
}

.search-input-box {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.search-input-box input {
  width: 100%;
  padding: 14px 50px 14px 20px;
  border-radius: 12px;
  border: 1.5px solid #eaeaea;
  background-color: #ffffff;
  font-size: 15px;
  color: #333333;
  outline: none;
  box-sizing: border-box;
  transition: all 0.25s ease;
}

.search-input-box input:hover {
  border-color: #ff9e2c;
}

.search-input-box input:focus {
  border-color: #ff5a22;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(255, 90, 34, 0.1); 
}

.search-btn {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #ff5a22;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.search-btn:hover {
  transform: translateY(-50%) scale(1.15);
}

/* ★ 추가: 기존 UI 무너지지 않으면서 검색어 자동 완성 띄우는 드롭다운 스타일 */
.recommendation-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1.5px solid #ffdec0;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(255, 90, 34, 0.1);
  margin: 0;
  padding: 8px 0;
  list-style: none;
  max-height: 260px;
  overflow-y: auto;
  text-align: left;
  z-index: 1000;
}

.recommendation-dropdown li {
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.recommendation-dropdown li:hover {
  background-color: #fff9f5;
}

.recommend-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.recommend-title {
  font-weight: 700;
  color: #222222;
  font-size: 14.5px;
}

.recommend-address {
  font-size: 12px;
  color: #888888;
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

/* 🛠️ 우측 상단 즐겨찾기(★) 및 스탬프(💮) 다중 버튼 액션바 */
.card-action-buttons {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 5;
}

.card-fav-btn {
  background: transparent !important; 
  border: none !important;          
  box-shadow: none !important;       
  width: 38px;
  height: 38px;
  font-size: 24px;                  
  color: #d1d1d1;                    
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, color 0.2s ease;
  margin-top: -16px; /* 스탬프 세로 정렬 가이드와 정렬 균형 맞춤 */
}

.card-fav-btn:hover {
  transform: scale(1.2);
  color: #ffb800;                    
}

.card-fav-btn.favorited {
  color: #ffb800;
}

/* 💮 스탬프 영역 수직 정렬 부모 */
.stamp-btn-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 60px; /* 텍스트 변경 시 가로 폭 고정 */
}

.card-stamp-btn {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.card-stamp-btn:hover {
  transform: scale(1.1) rotate(-5deg);
  border-color: #ff5a22;
}

.card-stamp-btn.stamped {
  background: #fff0eb;
  border-color: #ff5a22;
  box-shadow: 0 2px 8px rgba(255, 90, 34, 0.2);
  transform: scale(1.1) rotate(10deg); /* 스탬프 도장이 찍히는 인터랙티브 모션 */
}

/* 스탬프 하단 라벨 (기본: 도장 찍기) */
.stamp-label {
  font-size: 11px;
  font-weight: 500;
  color: #8a8a8a;
  transition: color 0.2s ease, font-weight 0.2s ease;
  white-space: nowrap;
}

/* 스탬프 획득 시 하단 라벨 (활성화: 다녀옴!) */
.stamp-label.stamped-active {
  color: #ff5a22;
  font-weight: 800;
  animation: popIn 0.3s ease-in-out;
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.card-img-area {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.card-img-area.no-image {
  background: #ffd59e;
}

.card-img-area img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-img-area.no-image img {
  object-fit: contain;
  padding: 12px;
}

.card-info-area {
  margin-left: 20px;
  margin-right: 120px; /* 우측 스탬프/즐겨찾기 버튼 영역 확보 */
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

.no-data {
  text-align: center;
  padding: 50px 0;
  font-size: 15px;
  color: #888888;
}

/* 💮 등급 안내 팝업 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: #ffffff;
  width: 90%;
  max-width: 480px;
  border-radius: 20px;
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
  overflow: hidden;
  animation: modal-fadeIn 0.25s ease-out;
}

@keyframes modal-fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background-color: #fff9f6;
  border-bottom: 1px solid #ffe8df;
}

.modal-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #ff5a22;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #aaaaaa;
  cursor: pointer;
  padding: 0;
}

.modal-close-btn:hover {
  color: #333333;
}

.modal-body {
  padding: 24px;
}

.modal-intro {
  font-size: 13.5px;
  color: #666666;
  margin-top: 0;
  margin-bottom: 18px;
  line-height: 1.4;
}

.level-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.level-table th, .level-table td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13.5px;
}

.level-table th {
  background-color: #fafafa;
  color: #555555;
  font-weight: 600;
}

.current-lv-row {
  background-color: #fff4f0;
}

.lv-col {
  width: 65px;
}

.lv-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 12px;
  color: white;
}

.badge-l1 { background: #b0b0b0; }
.badge-l2 { background: #55b355; }
.badge-l3 { background: #cd7f32; }
.badge-l4 { background: #aaa9ad; }
.badge-l5 { background: #d4af37; }

.title-col {
  font-weight: 500;
  color: #333333;
}

.cond-col {
  text-align: right;
  color: #666666;
}

.current-status-box {
  background-color: #f7fafc;
  border: 1px dashed #cbd5e0;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  color: #4a5568;
  line-height: 1.5;
}

.current-status-box strong {
  color: #ff5a22;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #eee;
  background-color: #fafafa;
}

.modal-confirm-btn {
  background-color: #ff5a22;
  color: white;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s;
}

.modal-confirm-btn:hover {
  background-color: #e04410;
}

/* 지도 오버레이 */
:deep(.map-overlay-card) {
  padding: 10px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  width: 190px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.12);
  pointer-events: none;
  position: relative;
}

:deep(.map-overlay-card.stamped-overlay) {
  border: 2px solid #ff7a00;
  box-shadow: 0 10px 25px rgba(255, 90, 34, 0.2);
}

:deep(.overlay-badge-stamp) {
  position: absolute;
  top: 15px;
  left: 15px;
  background: #ff5a22;
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
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