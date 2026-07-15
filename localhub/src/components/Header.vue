<template>

<header class="header">


  <div class="logo">

    <span class="pin">📍</span>
    LocalHub

  </div>



  <nav>

    <RouterLink to="/">
      홈
    </RouterLink>


    <RouterLink to="/community">
      게시판
    </RouterLink>


    <RouterLink to="/map">
      지도
    </RouterLink>


    <RouterLink to="/recommend">
      추천
    </RouterLink>


  </nav>



  <div class="actions">

    <button>
      🔍
    </button>


    <button class="login">
      로그인
    </button>

  </div>



</header>

</template>



<style scoped>


.header{


display:flex;


align-items:center;


justify-content:space-between;


height:80px;


padding:0 60px;


background:white;


border-bottom:1px solid #eee;


position:sticky;


top:0;


z-index:100;



}





.logo{


font-size:26px;


font-weight:800;


color:#222;


display:flex;


align-items:center;


gap:6px;


}





.pin{


font-size:25px;


}





nav{


display:flex;


gap:40px;


}





nav a{


text-decoration:none;


color:#555;


font-size:16px;


font-weight:600;


transition:.3s;


}





nav a:hover{


color:#ff7a00;


}





.router-link-active{


color:#ff7a00;


}





.actions{


display:flex;


align-items:center;


gap:15px;


}





.actions button{


border:none;


background:none;


font-size:18px;


cursor:pointer;


}





.login{


background:#ff7a00 !important;


color:white;


padding:10px 20px;


border-radius:20px;


font-size:14px !important;


font-weight:600;


}



.login:hover{


background:#e96d00 !important;


}




</style>