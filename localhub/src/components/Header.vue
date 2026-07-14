<template>
  <header class="header">

    <div class="logo">
      📍 LocalHub
    </div>

    <nav>

      <RouterLink to="/">홈</RouterLink>

      <RouterLink to="/community">게시판</RouterLink>

      <RouterLink to="/festival">축제</RouterLink>

      <RouterLink to="/map">지도</RouterLink>

    </nav>

  </header>
</template>

<style scoped>

.header{

display:flex;

justify-content:space-between;

align-items:center;

padding:20px 40px;

background:white;

box-shadow:0 2px 5px rgba(0,0,0,.08);

}

.logo{

font-size:24px;

font-weight:bold;

color:#2c3e50;

}

nav{

display:flex;

gap:30px;

}

a{

text-decoration:none;

color:#333;

font-weight:bold;

}

a:hover{

color:#42b883;

}

.router-link-active{

color:#42b883;

}

</style>