import { createRouter, createWebHistory } from 'vue-router';
import TutorCatalog from '@/views/TutorCatalog.vue';
import TutorDetail from '@/views/TutorDetail.vue';
import CreateTutor from '@/views/CreateTutor.vue';
import EditTutor from '@/views/EditTutor.vue';

const routes = [
  { path: '/', component: TutorCatalog },
  { 
    path: '/tutor/view/:id', 
    name: 'tutor',
    component: TutorCatalog,
    props: true

  },
  { path: '/tutor/create', component: CreateTutor },
  { path: '/tutor/edit/:id', component: EditTutor },

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;