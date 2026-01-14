<script setup>
import TutorReviews from '@/components/TutorReviews.vue';
import { useCartStore } from "@/stores/cart";
import { useAuth0 } from '@auth0/auth0-vue'


const props = defineProps({
  tutor: {
    type: Object,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false 
  },
});
const emit = defineEmits(["deleted"]);
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const { getAccessTokenSilently, isAuthenticated } = useAuth0() // ✅ für Token beim Delete
const cart = useCartStore()

function addLessonToCart() {
  cart.add({
    id: tutor.id, // reicht erstmal tutor.id als unique
    title: `${tutor.subject} bei ${tutor.name}`,
    tutorId: tutor.id,
    tutorName: tutor.name,
    subject: tutor.subject,
    image: tutor.image,
    price: 0, // optional
  })
}

async function deleteTutor() {
   console.log("deleteTutor wurde aufgerufen!");

  //const ok = confirm(`Willst du ${props.tutor.name} wirklich löschen?`);
  //if (!ok) return;
  const token = await getAccessTokenSilently()

  const response = await fetch(`${API_BASE}/api/tutors/${props.tutor.id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,        
    },
  });


  emit("deleted", props.tutor.id);
}

function contactTutor() {
  if (!props.tutor) return;
 // alert(`Du kontaktierst ${props.tutor.name} für ${props.tutor.subject}.`);
}
</script>

<template>

<button class="btn btn-success" @click="addLessonToCart">
  Stunde buchen
</button>

  <div class="card shadow-sm h-100">
   <div class="profile-img-wrapper">
  <img :src="tutor.image" alt="Tutor Bild" class="profile-img" />
</div>

    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ tutor.name }}</h5>
      <p class="card-text">{{ tutor.subject }}</p>
      <p class="text-muted small">Semester: {{ tutor.semester }}</p>

      <!-- ⭐ Reviews direkt unter den Basisinfos -->
      <TutorReviews :tutor-id="tutor.id" />

      <button
  class="btn contact-btn w-100 mt-3"
  @click="contactTutor"
>
  Kontaktieren
</button>
<button
  v-if="isAuthenticated && isAdmin"
  class="btn btn-warning w-100 mt-2"
  @click="$router.push(`/tutor/${tutor.id}/edit`)"
>
  Bearbeiten
</button>
<button
  v-if="isAuthenticated && isAdmin"
  class="btn btn-danger w-100 mt-2"
  @click="deleteTutor"
>
  Löschen
</button>
    </div>
  </div>
</template>

<style scoped>
/* optional: leichte Hover-Animation */
.card {
  border-radius: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  background-color: #F3EFDF;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}
.contact-btn {
  background-color: #607953; /* CheckMate-Grün */
  border-color: #607953;
  color: white;
  font-weight: 600;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  transition: 0.2s ease;
}

.contact-btn:hover {
  background-color: #4f6746; /* dunkleres Grün */
  border-color: #4f6746;
  color: white;
}

/* Profilbild-Container – hält das Bild quadratisch */
.profile-img-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1; /* macht es 1:1 quadratisch */
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f6f6f6; /* leichtes Background-Fallback */
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

/* Das Bild selbst bleibt immer zentriert und füllt das Quadrat */
.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* zuschneiden, aber schön */
  object-position: center;
  display: block;
}

</style>