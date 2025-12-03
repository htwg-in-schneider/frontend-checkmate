<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from '@/components/Button.vue';

const router = useRouter();

// Dein Tutor-Endpunkt:
const url = 'http://localhost:8081/api/tutors';

// Tutor-Objekt (muss exakt die Felder des Backends haben)
const tutor = ref({
  name: '',
  subject: '',
  semester: 1,
  image: ''
});

async function createTutor() {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tutor.value),
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Erstellen: ${response.status}`);
    }

    alert('Tutor erfolgreich erstellt!');
    router.push('/tutors'); // oder '/', wenn du willst
  } catch (error) {
    console.error('Fehler beim Erstellen des Tutors:', error);
    alert('Tutor konnte nicht erstellt werden.');
  }
}
</script>

<template>
  <div class="container py-5">
    <h2 class="fw-bold mb-4">Neuen Tutor erstellen</h2>

    <form @submit.prevent="createTutor">
      <div class="mb-3">
        <label for="tutorName" class="form-label">Name</label>
        <input
          type="text"
          id="tutorName"
          class="form-control"
          v-model="tutor.name"
          required
        />
      </div>

      <div class="mb-3">
        <label for="tutorSubject" class="form-label">Fach</label>
        <input
          type="text"
          id="tutorSubject"
          class="form-control"
          v-model="tutor.subject"
          required
        />
      </div>

      <div class="mb-3">
        <label for="tutorSemester" class="form-label">Semester</label>
        <input
          type="number"
          id="tutorSemester"
          class="form-control"
          v-model="tutor.semester"
          min="1"
          required
        />
      </div>

      <div class="mb-3">
        <label for="tutorImage" class="form-label">Bild-URL</label>
        <input
          type="text"
          id="tutorImage"
          class="form-control"
          v-model="tutor.image"
        />
      </div>

      <Button type="submit" variant="accent">Erstellen</Button>
    </form>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
}
</style>