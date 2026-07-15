<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <h2>📅 서울/경기 축제 일정표</h2>
    </div>

    <FullCalendar :options="calendarOptions" />

    <!-- 선택 날짜의 축제 리스트 모달 -->
    <div v-if="showList" class="modal-backdrop" @click.self="closeList">
      <div class="festival-list">
        <button class="close-btn" @click="closeList">✕</button>
        <h3>{{ selectedDateDisplay }}의 축제 ({{ selectedItems.length }})</h3>
        <div class="cards">
          <div v-for="item in selectedItems" :key="item.contentid" class="card">
            <img :src="item.firstimage || placeholder" alt="썸네일" />
            <div class="card-body">
              <h4 class="title">{{ item.title }}</h4>
              <div class="period">{{ formatPeriod(item) }}</div>
              <div class="location">{{ item.addr1 || item.zipcode || '위치 정보 없음' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import koLocale from '@fullcalendar/core/locales/ko'
import festivals from '../data/서울_축제공연행사.json'

export default defineComponent({
  components: { FullCalendar },
  setup() {
    const placeholder = 'https://via.placeholder.com/360x200?text=No+Image'
    const showList = ref(false)
    const selectedItems = ref([])
    const selectedDateDisplay = ref('')
    const calendarOptions = ref({
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: koLocale,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth'
      },
      events: [],
      dateClick: handleDateClick,
      eventDisplay: 'block',
      dayMaxEventRows: true
    })

    // 유틸: API에서 날짜 필드를 찾아서 YYYY-MM-DD 반환
    function normalizeDateStr(raw) {
      if (!raw) return null
      // 숫자형 YYYYMMDD -> YYYY-MM-DD
      const digits = raw.toString().trim()
      if (/^\d{8}$/.test(digits)) {
        return `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6,8)}`
      }
      // 이미 YYYY-MM-DD 또는 YYYY.MM.DD 등인 경우 간단 변환
      const isoLike = digits.replace(/\./g, '-').replace(/\//g, '-')
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(isoLike)) {
        const [y,m,d] = isoLike.split('-').map(s=>s.padStart(2,'0'))
        return `${y}-${m}-${d}`
      }
      return null
    }

    // 특정 아이템에서 start/end 찾기 (다양한 필드명 처리)
    function parseStart(item) {
      return normalizeDateStr(item.eventstartdate || item.eventStartDate || item.startdate || item.start || item.eventBeginDate || null)
    }
    function parseEnd(item) {
      return normalizeDateStr(item.eventenddate || item.eventEndDate || item.enddate || item.end || item.eventEndDate || null)
    }

    // 기간 텍스트 표시
    function formatPeriod(item) {
      const s = parseStart(item)
      const e = parseEnd(item)
      if (s && e) return `${s} ~ ${e}`
      if (s && !e) return `${s}`
      return item.modifiedtime || item.createdtime || '기간 정보 없음'
    }

    // 날짜 사이 포함 여부 (클릭한 날짜가 축제 기간 내부인지)
    function dateWithin(item, ymd) {
      const s = parseStart(item)
      const e = parseEnd(item)
      if (!s && !e) return false
      if (s && !e) return s === ymd
      if (!s && e) return e === ymd
      return (s <= ymd && ymd <= e)
    }

    // FullCalendar에 넣을 이벤트 생성
    function buildEvents() {
      const ev = []
      for (const it of (festivals.items || [])) {
        const s = parseStart(it)
        const e = parseEnd(it)
        // 시작일 없으면 생략(또는 createdtime을 사용하려면 여기에 추가)
        if (!s) continue
        ev.push({
          title: it.title || '축제',
          start: s,
          end: e ? addOneDayForFullCalendarEnd(e) : undefined,
          allDay: true,
          extendedProps: it
        })
      }
      calendarOptions.value.events = ev
    }

    // FullCalendar는 end를 'exclusive'로 해석하므로 하루 더하기 (문자열 yyyy-mm-dd)
    function addOneDayForFullCalendarEnd(ymd) {
      if (!ymd) return undefined
      const d = new Date(ymd + 'T00:00:00')
      d.setDate(d.getDate() + 1)
      return d.toISOString().slice(0,10)
    }

    // 날짜 클릭 핸들러
    function handleDateClick(info) {
      const ymd = info.dateStr // 'YYYY-MM-DD'
      const items = (festivals.items || []).filter(it => dateWithin(it, ymd))
      selectedItems.value = items
      selectedDateDisplay.value = `${ymd}`
      showList.value = true
    }

    function closeList() {
      showList.value = false
      selectedItems.value = []
    }

    onMounted(() => {
      buildEvents()
    })

    return {
      calendarOptions,
      showList,
      selectedItems,
      selectedDateDisplay,
      closeList,
      placeholder,
      formatPeriod
    }
  }
})
</script>

<style scoped>
.calendar-container { background: #fff; padding: 30px; border-radius: 12px; max-width: 1000px; margin: 40px auto; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display:flex; align-items:flex-end; justify-content:center; padding:20px; z-index:1000;}
.festival-list { background:#fff; width:100%; max-width:900px; border-radius:12px; padding:18px; box-shadow:0 8px 30px rgba(0,0,0,0.15); max-height:80vh; overflow:auto; position:relative;}
.close-btn { position:absolute; right:12px; top:8px; border:none; background:transparent; font-size:18px; cursor:pointer;}
.cards { display:grid; grid-template-columns: repeat(auto-fit,minmax(260px,1fr)); gap:14px; margin-top:12px;}
.card { border-radius:8px; overflow:hidden; background:#fff; border:1px solid #eee; display:flex; flex-direction:column;}
.card img { width:100%; height:140px; object-fit:cover; display:block;}
.card-body { padding:10px;}
.title { font-size:16px; margin:0 0 6px 0; }
.period { font-size:13px; color:#666; margin-bottom:6px;}
.location { font-size:13px; color:#888;}
</style>