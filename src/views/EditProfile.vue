<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'

const { getAccessTokenSilently } = useAuth0()
const API_BASE = import.meta.env.VITE_API_BASE_URL

// Daten-Modelle
const userForm = ref({ name: '', email: '' })
const studentForm = ref({ aboutMe: '', fieldOfStudy: '', subjects: [], semester: 1, university: '', imageUrl: '' })

const loading = ref(true)
const saving = ref(false)
const message = ref('')

// ✅ alle Students laden, um daraus unique Subjects zu bauen
const allStudents = ref([])

const availableSubjects = computed(() => {
  const all = allStudents.value.flatMap(s => s?.subjects || [])
  return Array.from(new Set(all))
    .map(s => (s || '').trim())
    .filter(Boolean)
    .sort()
})

async function loadAvailableSubjects(headers) {
  // falls dein Backend das erlaubt:
  const res = await fetch(`${API_BASE}/api/students`, { headers })
  if (res.ok) {
    allStudents.value = await res.json()
  } else {
    console.warn('Konnte Subjects nicht laden, Status:', res.status)
    allStudents.value = []
  }
}

async function loadData() {
  loading.value = true
  try {
    const token = await getAccessTokenSilently()
    const headers = { Authorization: `Bearer ${token}` }

    const userRes = await fetch(`${API_BASE}/api/users/me`, { headers })
    if (userRes.ok) userForm.value = await userRes.json()

    const studentRes = await fetch(`${API_BASE}/api/students/me`, { headers })
    if (studentRes.ok) {
      studentForm.value = await studentRes.json()
      // ✅ absichern
      if (!Array.isArray(studentForm.value.subjects)) studentForm.value.subjects = []
    }

    await loadAvailableSubjects(headers)
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

    const uRes = await fetch(`${API_BASE}/api/users/me`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(userForm.value)
    })

    const sRes = await fetch(`${API_BASE}/api/students/me`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(studentForm.value)
    })

    if (sRes.ok || uRes.ok) message.value = "Profil erfolgreich gespeichert! ✅"
    else message.value = "Fehler beim Speichern. ❌"
  } catch (e) {
    message.value = "Fehler beim Speichern. ❌"
  } finally {
    saving.value = false
  }
}

function addSubject() {
  studentForm.value.subjects.push('')
}

function removeSubject(index) {
  studentForm.value.subjects.splice(index, 1)
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
          <datalist id="subjects-list">
  <option v-for="s in availableSubjects" :key="s" :value="s"></option>
</datalist>
          <h3>Meine Fächer</h3>
          <div class="subjects-container">
            <div v-for="(sub, index) in studentForm.subjects" :key="index" class="subject-input-wrapper">
              <input
  v-model="studentForm.subjects[index]"
  list="subjects-list"
  type="text"
  class="form-control subject-input"
  placeholder="z.B. Mathe 1"
/>
              <button type="button" class="inner-remove-btn" @click="removeSubject(index)">✕</button>
            </div>
          </div>
          
          <button type="button" class="add-subject-btn" @click="addSubject">
            + Fach hinzufügen
          </button>
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
  padding: 0.5rem;
  border: 1px solid  #697C44;;
  border-radius: 10px;
}


/* --- NEUES STYLING FÜR DIE FÄCHER --- */
.subject-input-wrapper {
  position: relative; /* Wichtig für die Positionierung des X */
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
}

.subject-input {
  padding-right: 2.5rem; /* Platz lassen für das X rechts */
}

.inner-remove-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #d9534f; /* Ein schönes Rot */
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: transform 0.2s;
}

.inner-remove-btn:hover {
  transform: scale(1.3);
  color: #dc2e2b;
  font-weight: bolder;
}

.add-subject-btn {
  background-color: transparent;
  color: #697C44;
  border: 2px solid #697C44;
  width: 100%;
  border-radius: 50px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
  height: 40px;
}

.add-subject-btn:hover {
  background-color: #a1b57b;
  border-style: solid;
  color: white;
}
/* ------------------------------------ */

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