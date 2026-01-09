<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from '@/components/Button.vue';
import { useAuth0 } from '@auth0/auth0-vue'

const route = useRoute();
const router = useRouter();
const { getAccessTokenSilently } = useAuth0()
// Backend-Endpoint für einen einzelnen Tutor
//const url = 'http://localhost:8081/api/tutors';
const url = `${import.meta.env.VITE_API_BASE_URL}/api/tutors`;
const tutor = ref({});

onMounted(async () => {
  await fetchTutor();
});

async function fetchTutor() {
  const tutorId = route.params.id;
  try {
    const response = await fetch(`${url}/${tutorId}`);
    if (!response.ok) {
      throw new Error(`Tutor nicht gefunden: ${response.status}`);
    }
    tutor.value = await response.json();
  } catch (error) {
    console.error('Fehler beim Laden des Tutors:', error);
    alert('Tutor konnte nicht geladen werden.');
    router.push('/tutors');
  }
}

async function updateTutor() {
  try {
    const token = await getAccessTokenSilently()

    const response = await fetch(`${url}/${tutor.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tutor.value),
    })

    if (!response.ok) {
      const txt = await response.text().catch(() => '')
      throw new Error(`Fehler beim Aktualisieren: ${response.status} ${txt}`)
    }

    router.push('/tutoren')
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Tutors:', error)
    alert('Tutor konnte nicht aktualisiert werden.')
  }
}
async function deleteTutor() {
  try {
    const token = await getAccessTokenSilently()

    const response = await fetch(`${url}/${tutor.value.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const txt = await response.text().catch(() => '')
      throw new Error(`Fehler beim Löschen: ${response.status} ${txt}`)
    }

    router.push('/tutoren')
  } catch (error) {
    console.error('Fehler beim Löschen des Tutors:', error)
  }
}

</script>

<template>
  <div class="container py-5">
    <h2 class="fw-bold mb-4">Tutor bearbeiten</h2>

    <!-- Bildvorschau -->
    <div class="text-center mb-4" v-if="tutor.image">
      <img
        :src="tutor.image"
        alt="Tutorbild"
        class="img-fluid rounded"
        style="max-height: 300px;"
      />
    </div>

    <form @submit.prevent="updateTutor">
      <div class="mb-3">
        <label for="tutorId" class="form-label">Tutor ID</label>
        <input
          type="text"
          id="tutorId"
          class="form-control"
          v-model="tutor.id"
          readonly
        />
      </div>

      <div class="mb-3">
        <label for="tutorName" class="form-label">Name</label>
        <input
          type="text"
          id="tutorName"
          class="form-control"
          v-model="tutor.name"
        />
      </div>

      <div class="mb-3">
        <label for="tutorSubject" class="form-label">Fach</label>
        <input
          type="text"
          id="tutorSubject"
          class="form-control"
          v-model="tutor.subject"
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
        />
      </div>

      <div class="mb-3">
        <label for="tutorImageUrl" class="form-label">Bild-URL</label>
        <input
          type="text"
          id="tutorImageUrl"
          class="form-control"
          v-model="tutor.image"
        />
      </div>

      <Button type="submit" variant="accent">Aktualisieren</Button>
      <Button
        type="button"
        variant="danger"
        class="ms-2"
        @click="deleteTutor"
      >
        Löschen
      </Button>
    </form>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
}
</style>