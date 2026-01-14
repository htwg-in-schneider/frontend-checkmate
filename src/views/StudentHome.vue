<script setup>
import { useRouter } from 'vue-router'
import Footer from '@/components/Footer.vue'

const router = useRouter()

function goStudyPartner() {
  router.push('/study-partner') // Route später anlegen
}

function goTutorSearch() {
  router.push('/tutoren') // hast du schon
}

function goLessons() {
  router.push('/unterricht') // Route später anlegen
}

function goMatches() {
  router.push('/matches') // Route später anlegen
}
</script>

<template>
  <Navbar />

  <main class="page">
    <div class="cards">
      <button class="card card1" @click="goStudyPartner">
        <span>Study Partner<br />suchen</span>
      </button>

      <button class="card card2" @click="goTutorSearch">
        <span>Tutor suchen</span>
      </button>

      <button class="card card3" @click="goLessons">
        <span>Unterrichts -<br />stunden</span>
      </button>

      <button class="card card3" @click="goMatches">
        <span>Meine Matches</span>
      </button>

    </div>
  </main>

  <Footer />
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3efdf;
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
  overflow: visible;
}

.cards {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
}

.card {
  width: 100%;
  border: none;
  border-radius: 18px;
  padding: 2.4rem 1.5rem;
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  transition: transform 0.08s ease;
}

.card:active {
  transform: scale(0.98);
}

.card1 {
  background: rgba(105, 124, 68, 0.85);
}

.card2 {
  background: rgba(164, 108, 58, 0.85);
}

.card3 {
  background: rgba(189, 207, 170, 1);
  color: #ffffff;
}

.card span {
  display: inline-block;
  text-align: center;
  line-height: 1.2;
}
</style>
