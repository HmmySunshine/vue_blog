import Vue from 'vue'
import VueRouter from 'vue-router'
import AdminDashboard from '../components/AdminDashboard.vue'
import LoginTest from '../components/LoginTest.vue'
import TestChat from '@/components/TestChat.vue'
// 替换旧的 RegisterTest 引入
import RegisterView from '@/views/RegisterView.vue'
import PhotoWall from '@/components/PhotoWall.vue'
//import { component } from 'vue/types/umd'
import FileDown from '@/components/FileDown.vue'
import ArticleList from '@/components/ArticleList.vue'
import ArticleDetail from '@/components/ArticleDetail.vue'
import AlgoliaSearch from '@/components/AlgoliaSearch.vue'

Vue.use(VueRouter)

const routes = [
  // ... 其他路由配置 ...
  {
    path: '/admin',
    name: 'Admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, isAdmin: true }
  }
  ,
  {
	path: '/login',
	name: 'Login',
	component: LoginTest
  },
  {
    path:'/find',
    name:'Find',
    component: AlgoliaSearch
  },
  {
	path:'/chat',
	name:'Chat',
	component: TestChat
  }
  ,
  {
	path:'/register',
	name:'Register',
	// 更新组件引用
	component: RegisterView
  },
  {
    path:'/alist',
    name:'Alist',
    component:FileDown
  }
  ,
  {
    path: '/photos',
    name: 'Photos',
    component: PhotoWall
  }
  ,
  {
    path:'/articles',
    name:'Articles',
    component:ArticleList
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: ArticleDetail,
    props: true
  }
  ,
  {
    path : '/timeline',
    name : 'Timeline',
    component : () => import('@/components/TimeLine.vue')
  }
  ,
  {
    path: '/tags',
    name: 'tags',
    component: () => import('@/views/TagsView.vue')
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('@/views/CategoriesView.vue')
  },
  {
    path: '/tag/:tagId',
    name: 'tagArticles',
    component: () => import('@/components/TagArticles.vue')  // 修改为 components 目录
  },
  {
    path: '/category/uncategorized',
    name: 'uncategorizedArticles',
    component: () => import('@/components/CategoryArticles.vue'),
    beforeEnter: (to, from, next) => {
      // 确保设置了 categoryId
      to.params.categoryId = 'uncategorized';
      next();
    }
  },
  {
    path: '/category/:categoryId',
    name: 'CategoryArticles',
    component: () => import('@/components/CategoryArticles.vue')
  }
]

const router = new VueRouter({
  routes
})

// 添加路由守卫确保只有管理员可以访问后台
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')
    
    if (!token) {
      next('/login')
    } else if (to.matched.some(record => record.meta.isAdmin) && userRole !== 'admin') {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router