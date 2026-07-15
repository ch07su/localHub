<template>
  <div class="board-page">
    <Header />

    <main class="board-container">
      <!-- Banner: title + write button + tabs -->
      <section class="board-header banner">
        <div class="banner-left">
          <p class="eyebrow">커뮤니티</p>
<<<<<<< HEAD
          <h1>서울잇다</h1>
          <p>추천 장소, 맛집, 축제 정보와 경험을 나누세요.</p>
=======
          <h1>지역 커뮤니티</h1>
          <p>서울 시민들과 소통하고, 유용한 정보를 나누세요.</p>
>>>>>>> 49b367f278a52a01127579755c4cd54ccc8669da
        </div>

        <div class="banner-right">
          <button class="write-btn" @click="startCreate">글쓰기</button>

          <!-- activity cards under write button -->
          <div class="activity-cards">
            <button class="activity-card" @click="goToActivity('likes')">
              <div class="card-left">👍</div>
              <div class="card-body">
                <div class="card-title">내가 추천한 글</div>
                <div class="card-sub">추천한 글 모아보기</div>
              </div>
              <div class="card-badge">{{ likesCount }}</div>
            </button>

            <button class="activity-card" @click="goToActivity('favorites')">
              <div class="card-left">⭐</div>
              <div class="card-body">
                <div class="card-title">내가 관심 등록한 글</div>
                <div class="card-sub">관심 있는 글 확인하기</div>
              </div>
              <div class="card-badge">{{ favorites.length }}</div>
            </button>
          </div>
        </div>

        <nav class="board-tabs" aria-label="게시판 탭">
          <button
            v-for="tab in boardTabs"
            :key="tab.key"
            class="tab-btn"
            :class="{ active: selectedBoardTab === tab.key }"
            @click="selectedBoardTab = tab.key"
          >
            <span class="tab-title">{{ tab.label }}</span>
            <span class="tab-count">{{ tabCount(tab.key) }}</span>
          </button>
        </nav>
      </section>

      <!-- toolbar: search, region, topic -->
      <section class="toolbar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="제목, 작성자, 내용, 태그로 검색하세요."
        />

        <div class="filter-group">
          <select v-model="selectedRegion">
            <option value="전체">지역 선택</option>
            <option v-for="region in regionOptions" :key="region" :value="region">
              {{ region }}
            </option>
          </select>

          <select v-model="selectedCategory">
            <option value="주제">주제 선택</option>
            <option value="공지사항">공지사항</option>
            <option value="자유게시판">자유게시판</option>
            <option value="Q&A">Q&A</option>
          </select>
        </div>
      </section>

      <!-- write form -->
      <section v-if="showForm" class="write-form">
        <h2>{{ isEditing ? '게시글 수정' : '새 글 작성' }}</h2>

        <div class="form-row">
          <input v-model="form.title" placeholder="제목" />
          <input v-model="form.writer" placeholder="작성자" />
        </div>

        <div class="form-row">
          <input v-model="form.password" type="password" placeholder="비밀번호" />
          <select v-model="form.region">
            <option value="">지역 선택</option>
            <option v-for="region in regionOptions" :key="region" :value="region">
              {{ region }}
            </option>
          </select>
        </div>

        <div class="form-row">
          <select v-model="form.category">
            <option value="공지사항">공지사항</option>
            <option value="자유게시판">자유게시판</option>
            <option value="Q&A">Q&A</option>
          </select>

          <input
            v-model="form.tagInput"
            class="tag-input"
            placeholder="태그를 쉼표로 입력하세요. 예: 서울, 밤산책"
          />
        </div>

        <textarea v-model="form.content" rows="6" placeholder="내용을 입력하세요."></textarea>

        <input type="file" accept="image/*" @change="handleImageUpload" />

        <img v-if="form.image" :src="form.image" class="preview-image" />

        <div class="form-actions">
          <button class="submit-btn" @click="submitPost">
            {{ isEditing ? '수정하기' : '등록하기' }}
          </button>
          <button class="cancel-btn" @click="cancelForm">취소</button>
        </div>
      </section>

      <!-- posts list -->
      <section class="post-list">
        <div class="table-wrapper">
          <table class="post-table">
            <thead>
              <tr>
                <th class="col-no">번호</th>
                <th class="col-title">제목</th>
                <th class="col-writer">작성자</th>
                <th class="col-region">지역</th>
                <th class="col-date">작성일</th>
                <th class="col-views">조회</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(post, index) in filteredPosts"
                :key="post.id"
                @click="openPostDetail(post)"
              >
                <td class="col-no">{{ filteredPosts.length - index }}</td>
                <td class="col-title">
                  <span class="category-chip">{{ post.category }}</span>
                  <span class="title-text">{{ post.title }}</span>
                </td>
                <td class="col-writer">{{ post.writer }}</td>
                <td class="col-region">{{ post.region || '미지정' }}</td>
                <td class="col-date">{{ post.createdAt }}</td>
                <td class="col-views">{{ post.views }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredPosts.length === 0" class="empty-box">
          검색 결과가 없습니다.
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

const STORAGE_KEY = 'localhub-posts'
const FAVORITES_KEY = 'localhub-favorites'
const router = useRouter()

const regionOptions = [
  '종로구','중구','용산구','성동구','광진구','동대문구','중랑구','성북구','강북구','도봉구',
  '노원구','은평구','서대문구','마포구','양천구','강서구','구로구','금천구','영등포구','동작구',
  '관악구','서초구','강남구','송파구','강동구'
]

const boardTabs = [
  { key: 'all', label: '전체 게시글' },
  { key: 'notice', label: '공지사항' },
  { key: 'free', label: '자유게시판' },
  { key: 'qa', label: 'Q&A' }
]

const defaultPosts = [
  {
    id: 1,
    title: '성수동 맛집 추천합니다.',
    writer: '익명',
    password: '1234',
    region: '성동구',
    category: '공지사항',
    content: '성수동에서 가볼 만한 맛집을 소개합니다.',
    createdAt: '2026-07-14',
    views: 12,
    likes: 3,
    likedByMe: false,
    tags: ['성수','맛집','서울'],
    image: '',
    comments: [{ id: 1, writer: '민수', text: '저도 가보고 싶어요.' }]
  },
  {
    id: 2,
    title: '한강 피크닉 장소 추천',
    writer: '홍길동',
    password: '1111',
    region: '영등포구',
    category: '자유게시판',
    content: '여의도 한강공원에서 피크닉하기 좋아요.',
    createdAt: '2026-07-13',
    views: 8,
    likes: 2,
    likedByMe: false,
    tags: ['한강','피크닉','여의도'],
    image: '',
    comments: []
  },
  {
    id: 3,
    title: '이번 주 축제 일정',
    writer: '김철수',
    password: '2222',
    region: '강남구',
    category: 'Q&A',
    content: '이번 주 진행되는 지역 축제 정보를 정리했습니다.',
    createdAt: '2026-07-12',
    views: 15,
    likes: 5,
    likedByMe: false,
    tags: ['축제','주말','지역행사'],
    image: '',
    comments: []
  }
]

const posts = ref([])
const favorites = ref([])
const searchQuery = ref('')
const selectedRegion = ref('전체')
const selectedCategory = ref('주제') // topic selector (separate from board tab)
const selectedTag = ref('전체')
const selectedBoardTab = ref('all')
const showForm = ref(false)
const isEditing = ref(false)
const selectedPost = ref(null)

const form = ref({
  title: '',
  writer: '',
  password: '',
  region: '',
  category: '자유게시판',
  content: '',
  image: '',
  tagInput: ''
})

const commentWriter = ref('')
const commentText = ref('')

const availableTags = computed(() => {
  const tags = new Set()
  posts.value.forEach((post) => {
    ;(post.tags || []).forEach((tag) => tags.add(tag))
  })
  return ['전체', ...Array.from(tags).sort()]
})

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.value))
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))
}

function loadPosts() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        posts.value = parsed.map((item) => ({
          ...item,
          region: item.region || '',
          category: item.category || '자유게시판',
          likes: item.likes || 0,
          likedByMe: item.likedByMe || false,
          tags: item.tags || [],
          image: item.image || '',
          comments: item.comments || [],
          views: item.views || 0
        }))
        selectedPost.value = posts.value[0] || null
        return
      }
    } catch (error) {
      console.error('저장된 게시글을 불러오지 못했습니다.', error)
    }
  }

  posts.value = defaultPosts.map((p) => ({ ...p }))
  selectedPost.value = posts.value[0] || null
  savePosts()
}

function loadFavorites() {
  const saved = localStorage.getItem(FAVORITES_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) favorites.value = parsed
    } catch (error) {
      console.error('관심 게시글을 불러오지 못했습니다.', error)
    }
  }
}

const likesCount = computed(() => posts.value.filter((p) => p.likedByMe).length)

const tabCount = (key) => {
  if (key === 'all') return posts.value.length
  if (key === 'notice') return posts.value.filter((p) => p.category === '공지사항').length
  if (key === 'free') return posts.value.filter((p) => p.category === '자유게시판').length
  if (key === 'qa') return posts.value.filter((p) => p.category === 'Q&A').length
  return 0
}

const filteredPosts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return posts.value.filter((post) => {
    const matchRegion =
      selectedRegion.value === '전체' || post.region === selectedRegion.value

    const matchBoardTab =
      selectedBoardTab.value === 'all' ||
      (selectedBoardTab.value === 'notice' && post.category === '공지사항') ||
      (selectedBoardTab.value === 'free' && post.category === '자유게시판') ||
      (selectedBoardTab.value === 'qa' && post.category === 'Q&A')

    const matchCategory =
      selectedCategory.value === '주제' || post.category === selectedCategory.value

    const matchTag =
      selectedTag.value === '전체' || (post.tags || []).includes(selectedTag.value)

    const matchQuery =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.writer.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      (post.tags || []).join(' ').toLowerCase().includes(query)

    return matchRegion && matchBoardTab && matchCategory && matchTag && matchQuery
  })
})

function resetForm() {
  form.value = {
    title: '',
    writer: '',
    password: '',
    region: '',
    category: '자유게시판',
    content: '',
    image: '',
    tagInput: ''
  }
  isEditing.value = false
}

function startCreate() {
  resetForm()
  showForm.value = true
}

function startEdit(post) {
  form.value = {
    title: post.title,
    writer: post.writer,
    password: '',
    region: post.region || '',
    category: post.category || '자유게시판',
    content: post.content,
    image: post.image || '',
    tagInput: (post.tags || []).join(', ')
  }
  isEditing.value = true
  showForm.value = true
  selectedPost.value = post
}

function cancelForm() {
  showForm.value = false
  resetForm()
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    form.value.image = reader.result
  }
  reader.readAsDataURL(file)
}

function submitPost() {
  if (!form.value.title || !form.value.writer || !form.value.password || !form.value.content) {
    alert('제목, 작성자, 비밀번호, 내용을 모두 입력해주세요.')
    return
  }

  const tags = form.value.tagInput
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  if (isEditing.value && selectedPost.value) {
    if (form.value.password !== selectedPost.value.password) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    posts.value = posts.value.map((post) =>
      post.id === selectedPost.value.id
        ? {
            ...post,
            title: form.value.title,
            writer: form.value.writer,
            region: form.value.region,
            category: form.value.category,
            content: form.value.content,
            tags,
            image: form.value.image
          }
        : post
    )
  } else {
    const newPost = {
      id: Date.now(),
      title: form.value.title,
      writer: form.value.writer,
      password: form.value.password,
      region: form.value.region,
      category: form.value.category,
      content: form.value.content,
      createdAt: new Date().toISOString().slice(0, 10),
      views: 0,
      likes: 0,
      likedByMe: false,
      tags,
      image: form.value.image,
      comments: []
    }

    posts.value.unshift(newPost)
    selectedPost.value = newPost
  }

  savePosts()
  showForm.value = false
  resetForm()
  alert(isEditing.value ? '게시글이 수정되었습니다.' : '게시글이 등록되었습니다.')
}

function deletePost(post) {
  const inputPassword = window.prompt('삭제하려면 비밀번호를 입력하세요.')
  if (!inputPassword) return

  if (inputPassword !== post.password) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  posts.value = posts.value.filter((item) => item.id !== post.id)
  selectedPost.value = posts.value[0] || null
  savePosts()
  alert('게시글이 삭제되었습니다.')
}

function selectPost(post) {
  selectedPost.value = posts.value.find((item) => item.id === post.id) || null
  savePosts()
}

function openPostDetail(post) {
  selectPost(post)
  router.push({ name: 'PostDetail', params: { id: post.id } })
}

function toggleLike(post) {
  posts.value = posts.value.map((item) => {
    if (item.id !== post.id) return item

    const alreadyLiked = item.likedByMe
    return {
      ...item,
      likedByMe: !alreadyLiked,
      likes: Math.max(0, item.likes + (alreadyLiked ? -1 : 1))
    }
  })

  selectedPost.value = posts.value.find((item) => item.id === post.id) || null
  savePosts()
}

function isFavorite(postId) {
  return favorites.value.includes(postId)
}

function toggleFavorite(post) {
  if (favorites.value.includes(post.id)) {
    favorites.value = favorites.value.filter((id) => id !== post.id)
  } else {
    favorites.value.push(post.id)
  }

  saveFavorites()
}

function goToActivity(type) {
  router.push({ name: 'MyActivity', params: { type } })
}

function addComment() {
  if (!selectedPost.value) return
  if (!commentWriter.value.trim() || !commentText.value.trim()) {
    alert('댓글 작성자와 내용을 입력해주세요.')
    return
  }

  posts.value = posts.value.map((post) =>
    post.id === selectedPost.value.id
      ? {
          ...post,
          comments: [
            ...(post.comments || []),
            {
              id: Date.now(),
              writer: commentWriter.value.trim(),
              text: commentText.value.trim()
            }
          ]
        }
      : post
  )

  commentWriter.value = ''
  commentText.value = ''

  selectedPost.value = posts.value.find((post) => post.id === selectedPost.value.id) || null
  savePosts()
}

onMounted(() => {
  loadPosts()
  loadFavorites()
})

watch(posts, savePosts, { deep: true })
</script>

<style scoped>
.board-page {
  min-height: 100vh;
  background: #ffffff;
}

.board-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 32px 20px 80px;
}

/* Banner / Tabs */
.board-header.banner {
  display: block;
  padding-bottom: 12px;
  margin-bottom: 18px;
  border-bottom: 1px solid #f3f3f3;
}

.banner-left {
  display: inline-block;
}

.banner-right {
  float: right;
  margin-top: 8px; /* push slightly down so header won't overlap */
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

/* activity cards under write button */
.activity-cards {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.activity-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(180deg, #fff 0%, #fffaf6 100%);
  border: 1px solid #fde8d6;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  min-width: 220px;
  box-shadow: 0 8px 20px rgba(255,122,61,0.06);
  transition: transform .12s ease, box-shadow .12s ease;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(255,122,61,0.12);
}

.card-left {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #fff2e8;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.card-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.card-title {
  font-weight: 800;
  color: #222;
  font-size: 13px;
}

.card-sub {
  font-size: 12px;
  color: #7a7a7a;
}

.card-badge {
  margin-left: 8px;
  background: #fff7f2;
  color: #ff7a3d;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 12px;
}

/* tabs */
.board-tabs {
  display: flex;
  gap: 12px;
  margin-top: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  color: #666;
  transition: transform .12s ease, box-shadow .12s ease;
}

.tab-btn .tab-title {
  font-size: 14px;
}

.tab-btn .tab-count {
  background: #fff7f2;
  color: #ff7a3d;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.tab-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(0,0,0,0.06); }

.tab-btn.active {
  background: linear-gradient(135deg,#ffefea 0%, #fff6f2 100%);
  border-color: #ffb79a;
  color: #ff7a3d;
  box-shadow: 0 8px 18px rgba(255,122,61,0.08);
}

/* Write button */
.write-btn {
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  background: #ff7a3d;
  color: white;
}

/* rest of styles (search, filters, table, forms) */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.toolbar input,
.write-form input,
.write-form select,
.write-form textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e3e3e3;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: white;
}

.toolbar input:focus,
.write-form input:focus,
.write-form select:focus,
.write-form textarea:focus,
.filter-group select:focus {
  outline: none;
  border-color: #ff7a3d;
}

.toolbar input {
  flex: 1;
  min-width: 240px;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-group select {
  border: 1px solid #e3e3e3;
  background: white;
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.write-form {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #eee;
  margin-bottom: 24px;
}

.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.preview-image {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 10px;
  margin-top: 12px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.table-wrapper {
  background: white;
  border: 1px solid #ebebeb;
  border-radius: 10px;
  overflow: hidden;
}

.post-table {
  width: 100%;
  border-collapse: collapse;
}

.post-table thead th {
  background: #fafafa;
  color: #777;
  font-size: 13px;
  font-weight: 700;
  padding: 13px 10px;
  border-bottom: 1px solid #ebebeb;
  text-align: center;
  white-space: nowrap;
}

.post-table thead th.col-title {
  text-align: left;
  padding-left: 16px;
}

.post-table tbody td {
  padding: 13px 10px;
  border-bottom: 1px solid #f2f2f2;
  font-size: 14px;
  color: #333;
  text-align: center;
}

.post-table tbody tr {
  cursor: pointer;
  transition: background 0.15s ease;
}

.post-table tbody tr:hover {
  background: #fafafa;
}

.col-no {
  width: 60px;
  color: #999;
}

.col-title {
  text-align: left;
  padding-left: 16px !important;
  font-weight: 500;
}

.col-writer,
.col-region,
.col-date,
.col-views {
  width: 100px;
  color: #666;
  font-size: 13px;
}

.category-chip {
  display: inline-block;
  background: #eef2f7;
  color: #4b5a6b;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  margin-right: 8px;
}

.title-text {
  color: #222;
}

.empty-box {
  background: white;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px;
  color: #888;
  text-align: center;
  font-weight: 600;
}

@media (max-width: 900px) {
  .form-row {
    flex-direction: column;
  }
  .banner-right {
    float: none;
    margin-top: 12px;
    align-items: flex-start;
  }
  .activity-cards {
    flex-direction: column;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .col-writer,
  .col-date {
    display: none;
  }
}
</style>