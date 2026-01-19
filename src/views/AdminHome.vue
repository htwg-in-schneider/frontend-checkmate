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
function goBill() {
  router.push('/adminTransactions')
}

function goCreateOffer() {
  router.push('/angebot-erstellen') // Route ggf. später anlegen
}
function goMyOffers() {
  router.push('/meine-angebote') // Route ggf. später anlegen
}
</script>
<template>
    <div class="con text-center">
      <h2 class="page-title">ADMIN</h2>
    </div>
  <main class="page">
    
    <div class="content-wrapper">
        
      
      <div class="section">
        <h2 class="section-title">Für Studierende</h2>
        <div class="button-column">
          <button class="card card1" @click="goStudyPartner">
            <span>Alle<br />Studenten</span>
          </button>

        
          <button class="card card2" @click="goLessons">
            <span>Unterrichts -<br />stunden</span>
          </button>

        <button class="card card3" @click="goMatches">
          <span>Meine Matches</span>
        </button>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title-tutor">Für Tutoren</h2>
        <div class="button-column">
         
           <button class="card card4" @click="goTutorSearch">
            <span>Alle Tutoren</span>
          </button>

           <button class="card card5" @click="goMyOffers">
            <span>Alle<br />Angebote</span>
          </button>

          <button class="card card6" @click="goCreateOffer">
            <span>Angebot erstellen</span>
          </button>
        
          <button class="card card7" @click="goBill">
            <span>Alle Trans-<br />aktion</span>
          </button>
        </div>
      </div>

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
}
.page {
  min-height: 100vh;
  background: #f3efdf;
  display: flex;
  justify-content: center;
  padding: 4rem 1rem;
}

.content-wrapper {
  display: flex;
  flex-direction: row; /* Nebeneinander */
  gap: 3rem;           /* Abstand zwischen den Spalten */
  width: 100%;
  max-width: 1000px;   /* Gesamtbreite des Bereichs */
  justify-content: center;
}

.section {
  flex: 1;             /* Beide Spalten nehmen gleich viel Platz ein */
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-title {
  font-weight: 800;
  margin-bottom: 2rem;
  color: #697C44;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.section-title-tutor {
  font-weight: 800;
  margin-bottom: 2rem;
  color: #944b03;
  text-transform: uppercase;
  letter-spacing: 1px;
}


.button-column {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

/* Gemeinsame Button-Styles */
.card {
  width: 100%;
  border: none;
  border-radius: 25px;
  padding: 2.5rem 1.5rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.card:active {
  transform: scale(0.97);
}

/* Farben */
.card1 { background: rgba(168, 191, 123, 0.9); }
.card2 { background: rgba(119, 156, 89, 0.9); }
.card3 { background: rgb(100, 129, 70); color: #fff; }
.card4 { background: rgba(188, 144, 78, 0.9); }
.card5 { background: rgba(157, 105, 52, 0.9); }
.card6 { background: rgb(119, 72, 11); color: #fff; }
.card7 { background: rgb(83, 47, 2); color: #fff; }


.card span {
  display: inline-block;
  text-align: center;
  line-height: 1.2;
}

/* Responsivität: Untereinander auf kleinen Bildschirmen */
@media (max-width: 850px) {
  .content-wrapper {
    flex-direction: column;
    align-items: center;
    gap: 4rem;
  }
  
  .section {
    width: 100%;
  }
}
</style>
