import { createRouter, createWebHistory } from 'vue-router';

import Home from '@/views/Home.vue';
import TutorCatalog from '../views/TutorCatalog.vue';
import TutorDetail from '../views/TutorDetail.vue';
import Login from '@/views/Logger.vue';
import Register from '@/views/Register.vue';

const routes = [
   {
    path: '/',
    name: 'home',
    component: Home
  },
 // {
  //  path: '/tutors',
  //  name: 'tutors',
  //  component: TutorCatalog,     // Seite mit Filter + TutorCards
 // },
 {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
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
  component: () => import('@/components/TutorList.vue')
  },
  {
  path: '/tutor/:id/edit',
  name: 'editTutor',
  component: () => import('@/views/EditTutor.vue'),
  props: true
}


];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;