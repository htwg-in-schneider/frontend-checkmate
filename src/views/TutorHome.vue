<script setup>
import { useRouter } from 'vue-router'
import Footer from '@/components/Footer.vue'

const router = useRouter()

function goCreateOffer() {
  router.push('/angebot-erstellen') // Route ggf. später anlegen
}

function goMyOffers() {
  router.push('/meine-angebote') // Route ggf. später anlegen
}

function goLessons() {
  router.push('/unterricht') // Route ggf. später anlegen
}
</script>

<template>
  <Navbar />

   <div class="con text-center">
      <h2 class="page-title">TUTOR</h2>
    </div>
  <main class="page">
    <div class="text-center">
      <h2 class="page-title">ADMIN</h2>
    </div>
    <div class="cards">
      <button class="card card1" @click="goCreateOffer">
        <span>Angebot<br />erstellen</span>
      </button>

      <button class="card card2" @click="goMyOffers">
        <span>Meine<br />Angebote</span>
      </button>

      <button class="card card3" @click="goLessons">
        <span>Unterrichts -<br />stunden</span>
      </button>
    </div>
  </main>

</template>

<style scoped>

.con {  
    background: #f3efdf;
    padding-top: 1.5rem;

}
.page-title{
    margin: 0rem;
    font-size: 50px;
    font-weight: 700;
    color:   #a66a23;
}

.page {
  min-height: 100vh;
  background: #f3efdf;
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
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
  background: #93a3b3; /* graublau wie im Screenshot */
}

.card2 {
  background: #a66a23; /* braun */
}

.card3 {
  background: #bdcfaa; /* grün */
}

.card span {
  display: inline-block;
  text-align: center;
  line-height: 1.2;
}
</style>
