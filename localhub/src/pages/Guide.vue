<template>
  <div class="guide-page">
    <div class="guide-header">
      <p class="guide-eyebrow">LocalHub 이용 안내</p>
      <h2 class="guide-title">궁금한 점이 있다면<br /><span class="accent">여기서 확인</span>하세요</h2>
      <p class="guide-lead">LocalHub 지도 보기와 커뮤니티 기능을 더 편리하게 이용하는 방법을 안내합니다.</p>
    </div>

    <div class="guide-body">
      <section class="guide-panel">
        <span class="panel-tag">소개</span>
        <h3>서비스 소개</h3>
        <p>
          LocalHub는 서울의 다양한 장소를 찾아보고, 즐겨찾기하고,
          게시글을 통해 정보를 공유할 수 있는 지역 기반 커뮤니티 서비스입니다.
        </p>
      </section>

      <div class="guide-grid">
        <section class="guide-panel">
          <span class="panel-tag">지도보기</span>
          <h3>🗺️ 지도 검색</h3>
          <p>검색창에 장소명, 지역, 키워드를 입력하면 지도 위에 결과가 표시됩니다.</p>
          <ul>
            <li>검색 결과는 목록과 지도로 동시에 확인할 수 있습니다.</li>
            <li>카드를 클릭하면 해당 장소로 지도가 이동합니다.</li>
          </ul>
        </section>

        <section class="guide-panel">
          <span class="panel-tag">즐겨찾기</span>
          <h3>⭐ 즐겨찾기</h3>
          <p>지도에서 별표를 눌러 즐겨찾기에 추가할 수 있습니다.</p>
          <ul>
            <li>즐겨찾기 목록에서 원하는 장소를 간편하게 다시 확인할 수 있습니다.</li>
            <li>경로 짜기 페이지에서도 즐겨찾기 장소를 추가할 수 있습니다.</li>
          </ul>
        </section>
      </div>

      <section class="guide-panel">
        <span class="panel-tag">스탬프</span>
        <h3>💮 스탬프 레벨</h3>
        <p>다녀온 장소를 모아 스탬프를 획득하면 레벨이 올라갑니다.</p>

        <div class="level-track">
          <div class="level-card" v-for="(lv, i) in levels" :key="lv.grade">
            <span class="level-index">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="level-badge" :style="{ background: lv.soft, color: lv.color }">{{ lv.grade }}</span>
            <p class="level-name">{{ lv.name }}</p>
            <p class="level-count">{{ lv.range }}</p>
            <div class="level-bar">
              <span :style="{ width: lv.fill, background: lv.color }"></span>
            </div>
          </div>
        </div>
      </section>

      <section class="guide-panel notice-panel">
        <span class="panel-tag notice-tag">유의사항</span>
        <h3>📢 이용 시 유의사항</h3>
        <ul>
          <li>다른 이용자를 배려하는 언어를 사용해주세요.</li>
          <li>허위 정보 및 광고성 게시글은 삭제될 수 있습니다.</li>
          <li>개인정보가 포함된 게시글 작성은 삼가해주세요.</li>
          <li>문제가 발생하면 관리자에게 문의해 주세요.</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
const levels = [
  { grade: 'Lv.1', name: '집밖은 위험해 초보', range: '0 ~ 1개', color: '#9AA1A9', soft: '#F1F2F4', fill: '20%' },
  { grade: 'Lv.2', name: '서투른 첫발걸음', range: '2 ~ 5개', color: '#3FA65A', soft: '#EAF7EE', fill: '40%' },
  { grade: 'Lv.3', name: '발바닥에 땀나는 방랑자', range: '6 ~ 11개', color: '#4C8DDB', soft: '#EAF2FC', fill: '60%' },
  { grade: 'Lv.4', name: '골목길 탐험대장', range: '12 ~ 19개', color: '#E8632C', soft: '#FFF1E8', fill: '80%' },
  { grade: 'Lv.5', name: '서울 정복왕 (프로 여행러)', range: '20개 이상', color: '#D9A62E', soft: '#FDF4E1', fill: '100%' },
];
</script>

<style scoped>
.guide-page {
  --brand: #ff6a3d;
  --brand-soft: #fff1e8;
  --ink: #1a1a1a;
  --gray: #6b7280;
  --line: #eeeeee;
  --bg: #ffffff;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  color: var(--ink);
  background: var(--bg);
  padding: 40px 48px 64px;
}

.guide-header {
  max-width: 720px;
  margin-bottom: 32px;
}

.guide-eyebrow {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray);
}

.guide-title {
  margin: 0 0 14px;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.guide-title .accent {
  color: var(--brand);
}

.guide-lead {
  margin: 0;
  color: var(--gray);
  line-height: 1.7;
  font-size: 15px;
}

.guide-body {
  display: grid;
  gap: 18px;
}

.guide-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.guide-panel {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 26px 28px;
  box-shadow: 0 10px 30px rgba(20, 20, 20, 0.04);
}

.panel-tag {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--brand-soft);
  color: var(--brand);
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 12px;
}

.notice-tag {
  background: #eef0f2;
  color: #55606b;
}

.guide-panel h3 {
  margin: 0 0 12px;
  font-size: 17px;
  font-weight: 800;
}

.guide-panel p {
  margin: 0 0 10px;
  line-height: 1.75;
  color: var(--gray);
  font-size: 14.5px;
}

.guide-panel ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
  color: var(--gray);
  line-height: 1.75;
  font-size: 14.5px;
}

.guide-panel ul li {
  position: relative;
  padding-left: 16px;
  margin-bottom: 6px;
}

.guide-panel ul li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--brand);
}

/* ===== 스탬프 레벨 ===== */
.level-track {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-top: 10px;
}

.level-card {
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.level-card:hover {
  box-shadow: 0 10px 24px rgba(20, 20, 20, 0.07);
  transform: translateY(-2px);
}

.level-index {
  font-size: 12px;
  color: #b6bcc3;
  font-weight: 700;
}

.level-badge {
  align-self: flex-start;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.level-name {
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.4;
  min-height: 38px;
  color: var(--ink);
}

.level-count {
  font-size: 12.5px;
  color: var(--gray);
}

.level-bar {
  margin-top: 4px;
  height: 5px;
  border-radius: 999px;
  background: #f1f2f4;
  overflow: hidden;
}

.level-bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
}

.notice-panel {
  background: #fafafa;
}

@media (max-width: 960px) {
  .guide-page { padding: 28px 20px 48px; }
  .guide-title { font-size: 26px; }
  .guide-grid { grid-template-columns: 1fr; }
  .level-track { grid-template-columns: repeat(2, 1fr); }
}
</style>