<script setup>
import TutorReviews from '@/components/TutorReviews.vue';

const props = defineProps({
  tutor: {
    type: Object,
    required: true,
  },
});

function contactTutor() {
  if (!props.tutor) return;
  alert(`Du kontaktierst ${props.tutor.name} für ${props.tutor.subject}.`);
}
</script>

<template>
  <div class="card shadow-sm h-100">
    <img
      :src="tutor.image"
      class="card-img-top"
      alt="Tutor Bild"
      style="height: 220px; object-fit: cover;"
    />

    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ tutor.name }}</h5>
      <p class="card-text">{{ tutor.subject }}</p>
      <p class="text-muted small">Semester: {{ tutor.semester }}</p>

      <!-- ⭐ Reviews direkt unter den Basisinfos -->
      <TutorReviews :tutor-id="tutor.id" />

      <button
        class="btn btn-primary w-100 mt-3"
        @click="contactTutor"
      >
        Kontaktieren
      </button>
    </div>
  </div>
</template>

<style scoped>
/* optional: leichte Hover-Animation */
.card {
  border-radius: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}
</style>