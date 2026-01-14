import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import TutorDetail from '@/views/TutorDetail.vue'
import Register from '@/views/Register.vue'
import { authGuard } from '@auth0/auth0-vue'
import Checkout from "@/views/Checkout.vue"
import Impressum from "@/views/Impressum.vue"
import Contact from "@/views/Contact.vue"
import About from "@/views/About.vue"
import FAQ from "@/views/FAQ.vue"
import Datenschutz from "@/views/Datenschutz.vue"
import AdminTransactions from "@/views/AdminTransactions.vue"


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
  },

  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue'),
    beforeEnter: authGuard,
  },
  {
    path: "/checkout",
    name: "checkout",
    component: Checkout,
  },


{
  path: "/impressum",
  name: "impressum",
  component: Impressum
},
{
  path: '/contact',
  name: 'contact',
  component: Contact
},

{
  path: "/about",
  name: "about",
  component: About
},

{
  path: "/faq",
  name: "faq",
  component: FAQ
},

{
  path: "/datenschutz",
  name: "datenschutz",
  component: Datenschutz
},

{
  path: "/admintransactions",
  name: "admintransactions",
  component: AdminTransactions
},

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router