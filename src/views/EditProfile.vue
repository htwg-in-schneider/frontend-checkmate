<script setup>
import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

const { getAccessTokenSilently } = useAuth0()
const API_BASE = import.meta.env.VITE_API_BASE_URL

// Daten-Modelle
const userForm = ref({ name: '', email: '' })
const studentForm = ref({ aboutMe: '', fieldOfStudy: '', subject: '', semester: 1, university: '', imageUrl: '' })

const loading = ref(true)
const saving = ref(false)
const message = ref('')

async function loadData() {
  loading.value = true
  try {
    const token = await getAccessTokenSilently()
    const headers = { Authorization: `Bearer ${token}` }

    // 1. Basis-User Daten holen (Name, Email)
    const userRes = await fetch(`${API_BASE}/api/users/me`, { headers })
    if (userRes.ok) userForm.value = await userRes.json()

    // 2. Studenten-Profil Daten holen
    const studentRes = await fetch(`${API_BASE}/api/students/me`, { headers })
    if (studentRes.ok) studentForm.value = await studentRes.json()
  } catch (e) {
    console.error("Fehler beim Laden:", e)
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  saving.value = true
  message.value = ''
  try {
    const token = await getAccessTokenSilently()
    const headers = { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    }

    // A) User-Update (Name/Email) -> PATCH
    await fetch(`${API_BASE}/api/users/me`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(userForm.value)
    })

    // B) Student-Update (Profilfelder) -> PUT
    const sRes = await fetch(`${API_BASE}/api/students/me`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(studentForm.value)
    })

    if (sRes.ok) {
      message.value = "Profil erfolgreich gespeichert! ✅"
    }
  } catch (e) {
    message.value = "Fehler beim Speichern. ❌"
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <main class="profile-page">
    <div class="profile-card shadow">
      <h2>Mein Profil bearbeiten</h2>

      <div v-if="loading" class="text-center">Lädt Profildaten...</div>

      <form v-else @submit.prevent="saveProfile">
        <div class="section">
          <h3>Stammdaten</h3>
          <div class="form-group">
            <label>Name</label>
            <input v-model="userForm.name" type="text" class="form-control" placeholder="Dein Name" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="userForm.email" type="email" class="form-control" />
          </div>
        </div>

        <hr />

        <div class="section">
          <h3>Studium & Profil</h3>
          <div class="form-group">
            <label>Universität / Hochschule</label>
            <input v-model="studentForm.university" type="text" class="form-control" />
          </div>
          <div class="row">
            <div class="form-group col">
              <label>Fachbereich</label>
              <input v-model="studentForm.fieldOfStudy" type="text" class="form-control" placeholder="z.B. Informatik" />
            </div>
            <div class="form-group col">
              <label>Semester</label>
              <input v-model="studentForm.semester" type="number" class="form-control" />
            </div>
          </div>
          <div class="form-group">
            <label>Über mich (Beschreibung)</label>
            <textarea v-model="studentForm.aboutMe" class="form-control" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Profilbild URL</label>
            <input v-model="studentForm.imageUrl" type="text" class="form-control" />
          </div>
        </div>

        <div v-if="message" class="alert">{{ message }}</div>

        <button type="submit" class="save-btn" :disabled="saving">
          {{ saving ? 'Speichert...' : 'Änderungen speichern' }}
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.profile-page {
  background-color: #f3efdf;
  min-height: 90vh;
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}
.profile-card {
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 20px;
  padding: 2rem;
}
.section h3 {
  color: #697C44;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
.form-group {
  margin-bottom: 1.2rem;
}
.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
}
.form-control {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.save-btn {
  background-color: #697C44;
  color: white;
  width: 100%;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
}
.save-btn:hover { background-color: #556636; }
.alert {
  margin-top: 1rem;
  text-align: center;
  font-weight: bold;
}
</style>