<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  tutorId: {
    type: [String, Number],
    required: true,
  },
});

const reviews = ref([]);
const loading = ref(false);
const error = ref(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
const reviewUrl = `${API_BASE}/api/review/tutor`;

async function fetchReviews() {
  if (!props.tutorId) return;

  loading.value = true;
  error.value = null;

  try {
    const res = await fetch(`${reviewUrl}/${props.tutorId}`);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log('Reviews für Tutor', props.tutorId, data);
    reviews.value = data;
  } catch (e) {
    console.error('Fehler beim Laden der Reviews:', e);
    error.value = 'Bewertungen konnten nicht geladen werden.';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchReviews);
</script>

<template>
  <div class="reviews-wrapper">
    <!-- Loading -->
    <p v-if="loading" class="small text-muted mb-1">Lade Bewertungen…</p>

    <!-- Error -->
    <p v-else-if="error" class="small text-danger mb-1">{{ error }}</p>

    <!-- Keine Reviews -->
    <p v-else-if="reviews.length === 0" class="small text-muted mb-1">
      Keine Bewertungen vorhanden.
    </p>

    <!-- Reviews -->
    <div v-else class="d-flex flex-column gap-1">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="review-item p-2 border rounded"
      >
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong class="small">{{ review.userName }}</strong>

          <div class="text-warning small">
            <i
              v-for="n in 5"
              :key="n"
              :class="n <= review.stars ? 'bi bi-star-fill' : 'bi bi-star'"
            ></i>
          </div>
        </div>

        <p class="small text-muted mb-0">{{ review.text }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reviews-wrapper {
  margin-top: 8px;
}

.review-item {
  background: #fafafa;
}

.review-item:hover {
  background: #f1f1f1;
  transition: 0.2s ease;
}
</style>