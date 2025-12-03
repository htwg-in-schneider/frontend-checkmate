<template>
  <div class="tutorlist container py-5">
    <h1 class="text-center mb-4">Unsere Tutor:innen</h1>
    <p class="text-center text-muted mb-5">
      (Testseite)
    </p>

    <div class="row g-4">
      <div
        v-for="tutor in getTutors()"
        :key="tutor.id"
        class="col-md-4"
      >
        <TutorCard :tutor="tutor" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { tutors } from '../data.js';
import TutorCard from './TutorCard.vue';

function getTutors() {
  return tutors;
}
</script>

<style scoped>
.tutorlist h1 {
  font-weight: 600;
}

.card {
  border-radius: 10px;
  overflow: hidden;
  transition: 0.2s;
}

.card:hover {
  transform: translateY(-4px);
}
</style>