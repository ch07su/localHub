<template>

  <Header />

  <main class="home">


    <!-- Hero -->

    <section class="hero">

      <div class="hero-content">


        <h1>
          어디로 떠나볼까요?
        </h1>


        <p>
          서울의 맛집부터 관광지까지<br>
          지역 주민이 직접 공유하는 LocalHub
        </p>



        <div class="search-box">


          <input 
            placeholder="지역, 장소, 맛집을 검색해보세요"
          />


          <button>
            검색
          </button>


        </div>




        



      </div>


    </section>




    <!-- Category -->

    <section class="categories">


      <div class="category-item">

        <div class="category-icon">
          🍽
        </div>

        <p>
          맛집
        </p>

      </div>



      <div class="category-item">

        <div class="category-icon">
          ☕
        </div>

        <p>
          카페
        </p>

      </div>



      <div class="category-item">

        <div class="category-icon">
          🏛
        </div>

        <p>
          관광지
        </p>

      </div>



      <div class="category-item">

        <div class="category-icon">
          🌳
        </div>

        <p>
          자연
        </p>

      </div>



      <div class="category-item">

        <div class="category-icon">
          🎨
        </div>

        <p>
          문화
        </p>

      </div>



      <div class="category-item">

        <div class="category-icon">
          🛍
        </div>

        <p>
          쇼핑
        </p>

      </div>


    </section>





    <!-- Community Shortcut -->

    <section class="community-section">


      <div class="community-card">


        <div class="community-text">


          <h2>
            지역 이야기를 나눠보세요
          </h2>


          <p>
            맛집 후기부터 숨은 명소 추천까지<br>
            LocalHub 게시판에서 지역 정보를 공유하세요.
          </p>



          <RouterLink 
            to="/community"
            class="community-btn"
          >
            게시판 바로가기 →
          </RouterLink>


        </div>




        <div class="community-icon">

          💬

        </div>



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

  background:#faf9f6;

  min-height:100vh;

  padding-bottom:60px;

}





/* Hero */


.hero{


  max-width:1200px;


  height:380px;


  margin:40px auto;


  display:flex;


  justify-content:center;


  align-items:center;


  background:

  linear-gradient(
    135deg,
    #fff7ef,
    #ffffff
  );


  border-radius:24px;


}




.hero-content{


  text-align:center;


}





.hero-content h1{


  font-size:48px;


  font-weight:800;


  color:#222;


  margin-bottom:20px;


}





.hero-content p{


  font-size:20px;


  line-height:1.7;


  color:#666;


  margin-bottom:30px;


}





/* Search */


.search-box{


  display:flex;


  width:600px;


  height:60px;


  margin:auto;


  box-shadow:

  0 5px 20px rgba(0,0,0,.08);


  border-radius:15px;


  overflow:hidden;


}





.search-box input{


  flex:1;


  border:none;


  padding:0 25px;


  font-size:16px;


  outline:none;


}





.search-box button{


  width:120px;


  border:none;


  background:#ff7a00;


  color:white;


  font-size:16px;


  font-weight:bold;


  cursor:pointer;


}





/* Tags */


.tags{


  margin-top:25px;


}




.tags span{


  display:inline-flex;


  align-items:center;


  padding:10px 18px;


  margin:5px;


  background:white;


  border-radius:25px;


  border:1px solid #eee;


  font-size:14px;


  box-shadow:

  0 3px 10px rgba(0,0,0,.04);


}






/* Category */


.categories{


  max-width:1100px;


  margin:40px auto 50px;


  display:flex;


  justify-content:center;


  gap:20px;


}





.category-item{


  width:140px;


  height:130px;


  background:white;


  border-radius:20px;


  display:flex;


  flex-direction:column;


  justify-content:center;


  align-items:center;


  border:1px solid #eee;


  transition:.3s;


  cursor:pointer;


}





.category-item:hover{


  transform:translateY(-6px);


  box-shadow:

  0 10px 25px rgba(0,0,0,.08);


}





.category-icon{


  font-size:42px;


  margin-bottom:12px;


}





.category-item p{


  font-size:16px;


  font-weight:600;


  color:#333;


}






/* Community */


.community-section{


  max-width:1100px;


  margin:0 auto 70px;


}





.community-card{


  background:white;


  border-radius:24px;


  padding:40px;


  display:flex;


  justify-content:space-between;


  align-items:center;


  border:1px solid #eee;


  box-shadow:

  0 5px 20px rgba(0,0,0,.05);


  transition:.3s;


}





.community-card:hover{


  transform:translateY(-5px);


  box-shadow:

  0 10px 30px rgba(0,0,0,.1);


}





.community-text h2{


  font-size:28px;


  font-weight:800;


  color:#222;


  margin-bottom:15px;


}





.community-text p{


  color:#666;


  line-height:1.7;


  margin-bottom:25px;


}





.community-btn{


  display:inline-block;


  background:#ff7a00;


  color:white;


  padding:14px 25px;


  border-radius:12px;


  text-decoration:none;


  font-weight:700;


  transition:.3s;


}





.community-btn:hover{


  background:#e96d00;


}





.community-icon{


  font-size:80px;


}



</style>