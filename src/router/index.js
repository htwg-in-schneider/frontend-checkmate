import { createRouter, createWebHistory } from 'vue-router';

import TutorCatalog from '../views/TutorCatalog.vue';  
import TutorDetail from '../views/TutorDetail.vue';     

const routes = [
  {
    path: '/',
    name: 'home',
    component: TutorCatalog
  },
  {
    path: '/tutor/:id',
    name: 'tutor',
    component: TutorDetail,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;