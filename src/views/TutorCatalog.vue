<script setup>
import { ref, onMounted, computed } from 'vue';

import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import TutorCard from '@/components/TutorCard.vue';
import TutorFilter from '@/components/TutorFilter.vue';

const url = 'http://localhost:8081/api/tutors'; // wie im Backend

// komplette Liste aus dem Backend
const tutors = ref([]);
// gefilterte Liste für die Anzeige
const filteredTutors = ref([]);

onMounted(fetchTutors);

async function fetchTutors() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    tutors.value = data;
    filteredTutors.value = data; // initial: alle anzeigen
    console.log('Tutors geladen:', data);
  } catch (error) {
    console.error('Error fetching tutors:', error);
  }
}

// alle Subjects aus den Tutoren ziehen
const availableSubjects = computed(() =>
  Array.from(new Set(tutors.value.map((t) => t.subject).filter(Boolean)))
);

// wird von <TutorFilter> aufgerufen
function handleTutorUpdate(filter) {
  console.log('Filter erhalten:', filter);

  if (!filter || (!filter.name && !filter.subject)) {
    filteredTutors.value = tutors.value;
    return;
  }

  const name = (filter.name || '').toLowerCase();
  const subject = filter.subject || '';

  filteredTutors.value = tutors.value.filter((t) => {
    const matchesName =
      !name || t.name.toLowerCase().includes(name);
    const matchesSubject =
      !subject || t.subject === subject;
    return matchesName && matchesSubject;
  });
}
</script>

<template>
  <Navbar />

  <!-- Header -->
  <section class="py-5 text-center">
    <div class="container">
      <h2 class="fw-bold">Unsere Tutor:innen</h2>
      <p>
        Finde die passende Unterstützung für dein Studium – einfach, persönlich
        und effektiv.
      </p>
    </div>
  </section>

  <!-- 🔍 Filter-Bar (soll oben direkt sichtbar sein) -->
  <TutorFilter
    :subjects="availableSubjects"
    @tutorUpdate="handleTutorUpdate"
  />

  <!-- Tutor Grid -->
  <div class="container py-4">
    <div class="row g-4">
      <div
        v-for="tutor in filteredTutors"
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
/* optional */
</style>