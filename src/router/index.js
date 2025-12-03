import { createRouter, createWebHistory } from 'vue-router';

import AppHome from '../App.vue';            // Landing Page mit Stories etc.
import TutorCatalog from '../views/TutorCatalog.vue';
import TutorDetail from '../views/TutorDetail.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: AppHome,          // Startseite: deine große Marketing-Landingpage
  },
  {
    path: '/tutors',
    name: 'tutors',
    component: TutorCatalog,     // Seite mit Filter + TutorCards
  },
  {
    path: '/tutor/:id',
    name: 'tutor',
    component: TutorDetail,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;