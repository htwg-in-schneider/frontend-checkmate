<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import TutorReviews from '../components/TutorReviews.vue';

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
});

const tutor = ref(null);
const loading = ref(true);
const error = ref(null);
const showReviews = ref(false);

onMounted(async () => {
  try {
   // const res = await fetch(`http://localhost:8081/api/tutors/${props.id}`);
    const res = `${import.meta.env.VITE_API_BASE_URL}/api/tutors`;


    if (res.status === 404) {
      error.value = "Tutor:in nicht gefunden.";
    } else if (!res.ok) {
      throw new Error(res.status);
    } else {
      tutor.value = await res.json();
    }

  } catch (err) {
    console.error(err);
    error.value = "Fehler beim Laden.";
  } finally {
    loading.value = false;
  }
});

const contactTutor = () => {
  if (!tutor.value) return;
  alert(`Du kontaktierst ${tutor.value.name} für ${tutor.value.subject}.`);
};

const toggleReviews = () => {
  showReviews.value = !showReviews.value;
};
</script>

<template>
  <Navbar />

  <section class="container py-5">
    <p v-if="loading" class="text-center">Lade Tutor:in...</p>

    <div v-else-if="error" class="text-center py-5">
      <h2 class="mb-3">{{ error }}</h2>
      <button class="btn btn-outline-secondary" @click="$router.push('/tutors')">
        Zurück zur Liste
      </button>
    </div>

    <!-- DETAILANSICHT — KORREKT, EINZIG, FUNKTIONIEREND -->
    <div v-else class="row align-items-start g-4">
      <div class="col-md-5 col-lg-4">
        <img
          :src="tutor.image"
          class="img-fluid rounded shadow-sm"
          :alt="`Tutor: ${tutor.name}`"
        />
      </div>

      <div class="col-md-7 col-lg-8">

        <!-- KLICKBARER NAME – FIXED -->
        <h2
          class="fw-bold mb-2 tutor-name-click"
          @click="toggleReviews"
        >
          {{ tutor.name }}
        </h2>

        <p class="text-muted mb-2">{{ tutor.subject }}</p>
        <p><strong>Semester:</strong> {{ tutor.semester }}</p>

        <p class="mb-4">
          {{ tutor.name }} unterstützt Studierende in
          <strong>{{ tutor.subject }}</strong> und bringt Erfahrung aus dem
          {{ tutor.semester }}. Semester mit.
        </p>

        <button class="btn btn-outline-secondary me-2" @click="$router.back()">
          Zurück
        </button>

        <button class="btn btn-primary" @click="contactTutor">
          Kontaktanfrage senden
        </button>
      </div>
    </div>

    <!-- REVIEWS -->
    <TutorReviews
      v-if="tutor && showReviews"
      :tutor-id="tutor.id"
      class="mt-5"
    />
  </section>

  <Footer />
</template>

<style scoped>
.tutor-name-click {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
  transition: opacity 0.2s ease;
}

.tutor-name-click:hover {
  opacity: 0.7;
}
</style>