<script setup>
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import TutorCard from '@/components/TutorCard.vue';

import { tutors } from '@/data.js';

function getTutors() {
  return tutors;
}
</script>

<template>
  <Navbar />

  <!-- Header -->
  <section class="py-5 text-center">
    <div class="container">
      <h2 class="fw-bold">Unsere Tutor:innen</h2>
      <p>Finde die passende Unterstützung für dein Studium – einfach, persönlich und effektiv.</p>
    </div>
  </section>

  <!-- Tutor Grid -->
  <div class="container py-4">
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

  <Footer />
</template>

<style scoped>
/* Optional: falls du einen eigenen Look für die Katalogseite willst */
</style>