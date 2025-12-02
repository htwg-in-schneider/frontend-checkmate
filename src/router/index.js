import { createRouter, createWebHistory } from 'vue-router';
import TutorCatalog from '@/views/TutorCatalog.vue';
import TutorDetail from '@/views/TutorDetail.vue';
import CreateProduct from '@/views/CreateProduct.vue';
import EditProduct from '@/views/EditProduct.vue';

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