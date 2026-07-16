import { ref } from 'vue'

export const POSTS_STORAGE_KEY = 'localhub-posts'

export const defaultPosts = [
  {
    id: 1,
    title: '성수동 맛집 추천합니다.',
    writer: '익명',
    password: '1234',
    region: '성동구',
    category: '자유게시판',
    content: '성수동에서 가볼 만한 맛집을 소개합니다.',
    createdAt: '2026-07-14',
    views: 12,
    likes: 3,
    likedByMe: false,
    tags: ['성수', '맛집', '서울'],
    image: '',
    comments: [{ id: 1, writer: '민수', text: '저도 가보고 싶어요.' }],
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
    tags: ['한강', '피크닉', '여의도'],
    image: '',
    comments: [],
  },
  {
    id: 3,
    title: '이번 주 축제 일정',
    writer: '김철수',
    password: '2222',
    region: '강남구',
    category: '자유게시판',
    content: '이번 주 진행되는 지역 축제 정보를 정리했습니다.',
    createdAt: '2026-07-12',
    views: 15,
    likes: 5,
    likedByMe: false,
    tags: ['축제', '주말', '지역행사'],
    image: '',
    comments: [],
  },
]

/**
 * localStorage에서 게시글을 읽어온다.
 * board.vue의 loadPosts()와 동일한 정규화 로직을 공유한다.
 */
export function readPostsFromStorage() {
  const saved = localStorage.getItem(POSTS_STORAGE_KEY)

  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          ...item,
          region: item.region || '',
          category: item.category || '자유게시판',
          likes: item.likes || 0,
          likedByMe: item.likedByMe || false,
          tags: item.tags || [],
          image: item.image || '',
          comments: item.comments || [],
          views: item.views || 0,
        }))
      }
    } catch (error) {
      console.error('저장된 게시글을 불러오지 못했습니다.', error)
    }
  }

  return defaultPosts.map((p) => ({ ...p }))
}

/** 다른 컴포넌트에서 바로 쓸 수 있는 반응형 버전이 필요할 때 사용 */
export function usePosts() {
  const posts = ref(readPostsFromStorage())
  return { posts }
}