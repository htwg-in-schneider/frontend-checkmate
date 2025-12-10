<script setup>
import Button from '@/components/Button.vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goToTutors() {
  router.push('/tutoren')
}

function showComingSoon() {
  router.push('/coming-soon')
}
</script>

<template>
  <div id="home">

 
    <!-- HEADER-BILDER -->
    <div class="img">
      <img class="img1" src="@/assets/img/webtech1.jpg" alt="b1" />
      <img class="img2" src="@/assets/img/webtech4.jpg" alt="b2" />
      <img class="img3" src="@/assets/img/webtech2.jpg" alt="b3" />
      <img class="img4" src="@/assets/img/webtech3.jpg" alt="b4" />
    </div>

    <h1>Du bist nicht allein!</h1>
    <h2>Finde deinen Study Partner fürs Studium</h2>

    <!-- BUTTONS -->
    <div class="button-stack">
      <button id="register" @click="showComingSoon">
        Jetzt starten
      </button>

      <Button variant="accent" :onClick="goToTutors">
        Hier kommt ihr zu unseren Tutoren
      </Button>
    </div>

    <div class="container section-list my-5">

      <!-- ERFOLGSGESCHICHTE 1 -->
      <div class="story1">
        <img
          src="@/assets/img/erfolgsgeschichte.png"
          alt="Erfolgsgeschichte von Lisa und Max"
          class="story-img"
        />
        <div class="story-text">
          <h4>Erfolgsgeschichte von Lisa und Max</h4>
          <p>
            <strong>Lisa</strong> (BWL) und <strong>Max</strong>
            (Wirtschaftsinformatik) haben sich über
            <strong>CheckMate</strong> kennengelernt – ursprünglich nur, um
            gemeinsam für die Mathe-Klausur zu lernen. 📚
          </p>
          <p>
            Aus Lerntreffen wurden regelmäßige Study Sessions in der
            Bibliothek – und schließlich ein richtig gutes Team, das sich
            gegenseitig motiviert, Feedback gibt und zusammen durchs Semester
            zieht. 💪
          </p>
          <p>
            „Ohne CheckMate hätte ich nie jemanden gefunden, der genau so
            ehrgeizig (und gleichzeitig chaotisch) lernt wie ich“, lacht
            Lisa. „Jetzt macht selbst Statistik Spaß!“ 😄
          </p>
        </div>
      </div>

      <!-- ERFOLGSGESCHICHTE 2 -->
      <div class="story2">
        <img
          src="@/assets/img/tutorin.png"
          alt="Erfolgsgeschichte von Mia"
          class="story-img"
        />
        <div class="story-text">
          <h4>Erfolgsgeschichte von Mia</h4>
          <p>
            <strong>Mia</strong> studiert im fünften Semester Maschinenbau und
            wollte ihr Wissen weitergeben – also hat sie sich bei
            <strong>CheckMate</strong> als Tutorin angemeldet. 🧠💡
          </p>
          <p>
            Schon nach wenigen Tagen meldeten sich mehrere Studierende
            aus niedrigeren Semestern bei ihr, die Unterstützung in
            Mathe II und Thermodynamik suchten...
          </p>
        </div>
      </div>

      <!-- ERFOLGSGESCHICHTE 3 -->
      <div class="story3">
        <img
          src="@/assets/img/studygroup.png"
          alt="Study Group Erfolgsgeschichte"
          class="story-img"
        />
        <div class="story-text">
          <h4>Erfolgsgeschichte einer Study Group</h4>
          <p>
            Was als spontane Lerngruppe für die Statistik-Klausur begann,
            wurde zu einer richtigen <strong>Study-Community</strong>...
          </p>
        </div>
      </div>

      <!-- ABOUT -->
      <details class="about">
        <summary>
          <span>Über uns</span>
          <span class="chevron" aria-hidden="true"></span>
        </summary>
        <div class="about-body">
          <p>
            <strong>CheckMate</strong> ist mehr als nur eine Plattform –
            es ist eine kleine Community von Studierenden...
          </p>
        </div>
      </details>

      <!-- KONTAKT -->
      <details class="contact">
        <summary>
          <span>Kontakt</span>
          <span class="chevron" aria-hidden="true"></span>
        </summary>
        <div class="contact-body">
          <p>
            Du hast Fragen, Feedback? Schreib uns:
            <a href="mailto:hello@checkmate.app">hello@checkmate.app</a>
          </p>
        </div>
      </details>

      <!-- FAQ -->
      <details class="faq">
        <summary>
          <span>FAQ</span>
          <span class="chevron" aria-hidden="true"></span>
        </summary>
        <div class="faq-body">
          <p>
            Hier findest du bald Antworten...
          </p>
        </div>
      </details>

      <!-- FOOTER -->
      <Footer />

    </div>
  </div>
</template>

<style scoped>
.button-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
#home {
  background-color:  #697C44; /* Oder was du willst */
  min-height: 100vh;
}

h1 {
    text-align: center;
    margin-top: 1%;
    font-family: 'Lora', sans-serif; 
    font-size: 85px;
    font-weight: 700;
    color: #262424;

}
h2 {
    text-align: center;
    margin: 1%;
    padding-bottom: 2%;
    font-family: 'Lora', sans-serif; 
    font-size: 32px;
    font-weight: 700;
    color: #262424;
}
@media (max-width: 800px) {
    h1 {
      font-size: clamp(1.8rem, 8vw, 2.8rem); /* kleiner, aber dynamisch */
      margin: 2vh;
    }
  
    h2 {
      font-size: clamp(1rem, 4.5vw, 1.5rem);
      font-style: italic;
      margin-bottom: 1%;
      padding-bottom: 2%;
    }

}

</style>
