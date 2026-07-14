<template>

  <Header />

  <main class="home">

    <section class="hero">

      <h1>서울의 모든 정보를</h1>

      <h2>LocalHub에서 만나보세요</h2>

      <input
        type="text"
        placeholder="검색어를 입력하세요."
      />

    </section>

    <section class="cards">

      <div class="card">

        <h3>📌 최근 게시글</h3>

        <ul>

          <li>성수 맛집 추천합니다.</li>

          <li>서울 야경 명소</li>

          <li>이번 주 축제 일정</li>

        </ul>

      </div>

      <div class="card">

        <h3>🍴 카테고리</h3>

        <ul>

          <li>맛집</li>

          <li>관광지</li>

          <li>축제</li>

        </ul>

      </div>

      <div class="card">

        <h3>⭐ 인기 관광지</h3>

        <ul>

          <li>경복궁</li>

          <li>남산타워</li>

          <li>한강공원</li>

        </ul>

      </div>

    </section>

  </main>

  <Footer />

</template>

<script setup>

import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

</script>

<style scoped>

.home{

max-width:1200px;

margin:auto;

padding:40px;

}

.hero{

text-align:center;

margin-bottom:50px;

}

.hero h1{

font-size:42px;

margin-bottom:10px;

}

.hero h2{

color:#42b883;

margin-bottom:30px;

}

input{

width:500px;

padding:15px;

border-radius:10px;

border:1px solid #ccc;

font-size:16px;

}

.cards{

display:flex;

gap:25px;

justify-content:center;

}

.card{

flex:1;

background:white;

padding:25px;

border-radius:15px;

box-shadow:0 3px 10px rgba(0,0,0,.08);

}

.card h3{

margin-bottom:20px;

}

.card li{

margin-bottom:12px;

}

</style>