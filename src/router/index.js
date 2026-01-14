import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import TutorDetail from '@/views/TutorDetail.vue'
import Register from '@/views/Register.vue'

import { authGuard } from '@auth0/auth0-vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },

  {
    path: '/app',
    name: 'AppRouter',
    component: () => import('@/views/AppRouter.vue'),
    beforeEnter: authGuard,
  },

  {
    path: '/register',
    name: 'register',
    component: Register,
  },

  {
    path: '/student',
    name: 'StudentHome',
    component: () => import('@/views/StudentHome.vue'),
    beforeEnter: authGuard,
  },

  {
    path: '/study-partner',
    name: 'StudentCatalog',
    component: () => import('@/views/StudentCatalog.vue'),
    beforeEnter: authGuard,
  },
  {
    path: '/matches',
    name: 'matches',
    component: () => import('@/views/Matches.vue'),
  },
  {
  path: '/edit-profile',
  name: 'EditProfile',
  component: () => import('../views/EditProfile.vue'), // oder wo deine Datei liegt
  beforeEnter: authGuard,
},
  {
    path: '/tutor',
    name: 'TutorHome',
    component: () => import('@/views/TutorHome.vue'),
    beforeEnter: authGuard,
  },

  {
    path: '/tutor/:id',
    name: 'tutor',
    component: TutorDetail,
    props: true,
  },

  {
    path: '/tutoren',
    name: 'TutorList',
    component: () => import('@/components/TutorList.vue'),
  },

  {
    path: '/tutor/:id/edit',
    name: 'editTutor',
    component: () => import('@/views/EditTutor.vue'),
    props: true,
    beforeEnter: authGuard,
  }, // ✅ WICHTIG: Komma

  //{
    //path: '/profile',
    //name: 'profile',
    //component: () => import('@/views/Profile.vue'),
   // beforeEnter: authGuard,
  //},
  {
    path: "/checkout",
    name: "checkout",
    component: () => import("@/views/CheckoutView.vue"),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router