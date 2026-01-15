<script setup>
import { ref, onMounted, computed } from 'vue'

import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import TutorFilter from '@/components/TutorFilter.vue'
import TutorReviews from '@/components/TutorReviews.vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL
const url = `${API_BASE}/api/tutors`

// komplette Liste aus dem Backend
const tutors = ref([])
// gefilterte Liste für die Anzeige
const filteredTutors = ref([])
const error = ref(null)
const loading = ref(true)

onMounted(fetchTutors)

async function fetchTutors() {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    tutors.value = data
    filteredTutors.value = data // initial: alles anzeigen
  } catch (err) {
    console.error('Error fetching tutors:', err)
    error.value = 'Tutor:innen konnten nicht geladen werden.'
  } finally {
    loading.value = false
  }
}

// verfügbare Themen/Fächer aus den Tutoren bauen
const availableSubjects = computed(() =>
  Array.from(new Set(tutors.value.map((t) => t.subject).filter(Boolean)))
)

// wird vom Filter-Component aufgerufen (TutorFilter feuert @tutorUpdate)
function handleTutorUpdate(filter) {
  if (!filter || (!filter.name && !filter.subject)) {
    filteredTutors.value = tutors.value
    return
  }

  const name = (filter.name || '').toLowerCase()
  const subject = filter.subject || ''

  filteredTutors.value = tutors.value.filter((t) => {
    const matchesName = !name || (t.name || '').toLowerCase().includes(name)
    const matchesSubject = !subject || t.subject === subject
    return matchesName && matchesSubject
  })
}
</script>

<template>
  <Navbar />

  <!-- Header (wie Student-Seite) -->
  <section class="py-5 text-center">
    <div class="container">
      <h2 class="fw-bold">Tutor:innen suchen</h2>
      <p>Tutor:innen auf der Suche</p>
    </div>
  </section>

  <!-- Filter (WICHTIG: ohne absolute wrapper, damit die Box groß aufgehen kann) -->
  <TutorFilter :subjects="availableSubjects" @tutorUpdate="handleTutorUpdate" />

  <div class="container py-4">
    <!-- Lade- & Fehlerzustände -->
    <p v-if="loading" class="text-center">Lade Tutor:innen…</p>
    <p v-else-if="error" class="text-center text-danger">{{ error }}</p>

    <!-- Tutor Grid -->
    <div v-else class="row g-4">
      <div v-for="tutor in filteredTutors" :key="tutor.id" class="col-md-4">
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

            <!-- ⭐ Reviews -->
            <TutorReviews :tutor-id="tutor.id" />

            <button
              class="btn btn-primary w-100 mt-3"
              @click="alert(`Du kontaktierst ${tutor.name} für ${tutor.subject}.`)"
            >
              Kontaktieren
            </button>
          </div>
        </div>
      </div>

      <p v-if="!filteredTutors.length && !loading" class="text-center mt-4">
        Keine Tutor:innen gefunden. Passe die Filter an.
      </p>
    </div>

    <!-- Optional: Zurück Button wie bei Student-Seite -->
    <div class="text-center mt-5">
      <button class="btn btn-outline-secondary" @click="$router.back()">
        Zurück
      </button>
    </div>
  </div>

  <Footer />
</template>

<style scoped>
/* Nichts "filter-top-right" / "filter-clean" hier!
   Der TutorFilter macht den Button rechts und die große Box selbst. */
</style>