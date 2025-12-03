<script setup>
import { computed } from 'vue';

// Pfade angepasst: TutorDetail.vue liegt in src/views,
// Navbar & Footer in src/components
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import { tutors } from '../data.js';

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
});

// passenden Tutor anhand der ID finden
const tutor = computed(() => {
  return tutors.find((t) => String(t.id) === String(props.id)) || null;
});

// simple Kontakt-Action (zum Testen)
const contactTutor = () => {
  if (!tutor.value) return;
  alert(`Du kontaktierst ${tutor.value.name} für ${tutor.value.subject}.`);
};
</script>

<template>
  <Navbar />

  <section class="container py-5">
    <!-- Detailansicht, wenn Tutor gefunden wurde -->
    <div v-if="tutor" class="row align-items-start g-4">
      <div class="col-md-5 col-lg-4">
        <img
          :src="tutor.image"
          class="img-fluid rounded shadow-sm"
          :alt="`Tutor: ${tutor.name}`"
        />
      </div>

      <div class="col-md-7 col-lg-8">
        <h2 class="fw-bold mb-2">{{ tutor.name }}</h2>
        <p class="text-muted mb-2">
          {{ tutor.subject }}
        </p>
        <p class="mb-3">
          <strong>Semester:</strong> {{ tutor.semester }}
        </p>

        <p class="mb-4">
          {{ tutor.name }} unterstützt Studierende in
          <strong>{{ tutor.subject }}</strong> und bringt Erfahrung aus dem
          {{ tutor.semester }}. Semester mit. Hier könnten später weitere Infos
          zu Schwerpunkten, Lehrstil oder verfügbaren Zeiten stehen.
        </p>

        <button class="btn btn-outline-secondary me-2" @click="$router.back()">
          Zurück
        </button>
        <button class="btn btn-primary" @click="contactTutor">
          Kontaktanfrage senden
        </button>
      </div>
    </div>

    <!-- Fallback, wenn keine ID / kein Tutor gefunden -->
    <div v-else class="text-center py-5">
      <h2 class="mb-3">Tutor:in nicht gefunden</h2>
      <p class="mb-4">
        Die angegebene Tutor-ID existiert nicht (mehr). Bitte gehe zurück zur Übersicht.
      </p>
      <button class="btn btn-outline-secondary" @click="$router.push('/')">
        Zurück zur Tutorenliste
      </button>
    </div>
  </section>

  <Footer />
</template>

<style scoped>
h2 {
  font-size: 1.8rem;
}
</style>