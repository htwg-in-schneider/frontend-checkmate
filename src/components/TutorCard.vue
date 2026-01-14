<script setup>
import TutorReviews from "@/components/TutorReviews.vue"
import { useCartStore } from "@/stores/cart"
import { useAuth0 } from "@auth0/auth0-vue"

const props = defineProps({
  tutor: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false },
})

const emit = defineEmits(["book", "deleted", "contact"])

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"

const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()
const cart = useCartStore()

function onBookClick() {
  emit("book", props.tutor)
}

// optional (nur wenn du das wirklich nutzt)
function addLessonToCart() {
  if (!props.tutor) return

  cart.add({
    id: props.tutor.id,
    title: `${props.tutor.subject} bei ${props.tutor.name}`,
    tutorId: props.tutor.id,
    tutorName: props.tutor.name,
    subject: props.tutor.subject,
    image: props.tutor.image,
    price: 0,
  })
}

async function deleteTutor() {
  if (!props.tutor?.id) return

  try {
    const token = await getAccessTokenSilently()

    const response = await fetch(`${API_BASE}/api/tutors/${props.tutor.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      const txt = await response.text().catch(() => "")
      throw new Error(`Delete failed (${response.status}): ${txt}`)
    }

    emit("deleted", props.tutor.id)
  } catch (e) {
    console.error(e)
    alert("Tutor konnte nicht gelöscht werden.")
  }
}

function contactTutor() {
  emit("contact", props.tutor)
}
</script>

<template>
  <div class="card shadow-sm h-100">
    <div class="profile-img-wrapper">
      <img :src="props.tutor.image" alt="Tutor Bild" class="profile-img" />
    </div>

    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ props.tutor.name }}</h5>
      <p class="card-text">{{ props.tutor.subject }}</p>
      <p class="text-muted small">Semester: {{ props.tutor.semester }}</p>

      <p v-if="props.tutor.hourlyRate">
        Preis: <strong>{{ props.tutor.hourlyRate }} € / Stunde</strong>
      </p>

      <button
        v-if="!isLoading && isAuthenticated"
        class="btn btn-success"
        @click="onBookClick"
      >
        Stunde buchen
      </button>

      <TutorReviews :tutor-id="props.tutor.id" />

      <button class="btn contact-btn w-100 mt-3" @click="contactTutor">
        Kontaktieren
      </button>

      <button
        v-if="isAuthenticated && props.isAdmin"
        class="btn btn-warning w-100 mt-2"
        @click="$router.push(`/tutor/${props.tutor.id}/edit`)"
      >
        Bearbeiten
      </button>

      <button
        v-if="isAuthenticated && props.isAdmin"
        class="btn btn-danger w-100 mt-2"
        @click="deleteTutor"
      >
        Löschen
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.contact-btn {
  background-color: #607953;
  border-color: #607953;
  color: white;
  font-weight: 600;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  transition: 0.2s ease;
}

.contact-btn:hover {
  background-color: #4f6746;
  border-color: #4f6746;
  color: white;
}

.profile-img-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f6f6f6;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}
</style>
