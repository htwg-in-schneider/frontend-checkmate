<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
    tutorId: {
        type: [String, Number],
        required: true
    }
});

const reviews = ref([]);
const reviewUrl = ⁠ ${import.meta.env.VITE_API_BASE_URL}/api/review/tutor ⁠;

async function fetchReviews() {
    try {
        const response = await fetch(⁠ ${reviewUrl}/${props.tutorId} ⁠);
        if (!response.ok) {
            throw new Error(⁠ HTTP error! status: ${response.status} ⁠);
        }
        reviews.value = await response.json();
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

onMounted(() => {
    fetchReviews();
});

// Watch for prop changes in case the component is reused for different tutors without unmounting
watch(() => props.tutorId, () => {
    fetchReviews();
});
</script>

<template>
    <div class="reviews-section mt-5">
        <h3 class="fw-bold mb-4">Kundenbewertungen</h3>
        
        <div v-if="reviews.length > 0" class="d-flex flex-column gap-3">
            <div v-for="review in reviews" :key="review.id" class="card border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="card-title fw-bold mb-0">{{ review.userName }}</h5>
                        <div class="text-warning">
                            <i v-for="n in 5" :key="n" 
                               :class="n <= review.stars ? 'bi bi-star-fill' : 'bi bi-star'"></i>
                        </div>
                    </div>
                    <p class="card-text text-muted">{{ review.text }}</p>
                </div>
            </div>
        </div>
        <div v-else class="alert alert-light" role="alert">
            Noch keine Bewertungen vorhanden.
        </div>
    </div>
</template>