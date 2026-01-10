<script setup>
import Button from '@/components/Button.vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import StoryCard from '@/components/StoryCard.vue';
import studyImage from '@/assets/img/studygroup.png'
import success1 from '@/assets/img/erfolgsgeschichte.png'
import tutorin from '@/assets/img/tutorin.png'
import Contact from '@/components/Contact.vue'
import { useAuth0 } from '@auth0/auth0-vue'

import { useRouter } from 'vue-router'

const { loginWithRedirect } = useAuth0()
const router = useRouter()
function start() {
  loginWithRedirect({
  appState: { target: '/app' }
})
}
function goToTutors() {
  router.push('/tutoren')
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
        <button id="register" @click="start">Jetzt starten</button>

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
            <Button variant="accent" :onClick="goToTutors">
        Hier kommt ihr zu unseren Tutoren
      </Button>
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
    <h3>Über CheckMate ♟️✨</h3>

    <p>
      Lernen muss nicht einsam, stressig oder kompliziert sein – und genau deshalb gibt es
      <strong>CheckMate</strong> 💡
    </p>

    <p>
      Unsere Plattform ist aus einer einfachen Idee entstanden:
      <strong>Gemeinsam lernt es sich leichter.</strong> 🤍  
      Wir möchten Studierende, Tutor:innen und Lernbegeisterte zusammenbringen, die sich
      gegenseitig unterstützen, motivieren und weiterbringen.
    </p>

    <p>
      Egal ob Prüfungsvorbereitung 📚, Verständnisfragen 🤔 oder der letzte Motivationsschub 💪 –
      bei CheckMate findest du Menschen, die dich genau dort abholen, wo du gerade stehst.
      Persönlich, flexibel und auf Augenhöhe.
    </p>

    <p>
      Uns ist wichtig, dass Lernen nicht nur effektiv, sondern auch menschlich ist 🤝  
      Vertrauen, Austausch und ein respektvolles Miteinander stehen bei uns im Mittelpunkt.
    </p>

    <p>
      <strong>CheckMate ist mehr als eine Lernplattform.</strong><br />
      Es ist ein Ort für Fragen 💬, Fortschritt 🚀 und gemeinsames Wachsen 🌱
    </p>

    <p>
      Schön, dass du da bist – let’s learn together! 🧠💚
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
             <section id="contact">
              <Contact/>
             </section>
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

.story1, .story3{
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px 10px 15px;
  background-color: #F3EFDF;
  flex-wrap: wrap; /* wichtig: erlaubt Umbruch auf Mobile */
   border-radius: 30px;
  margin-bottom: 20px;
}
.story2 {
  display: flex;
  flex-direction: row-reverse; /* Bild kommt nach rechts */
  align-items: center;
  gap: 20px;
  padding: 30px 10px 15px;
  background-color: #BDCFAA;
  flex-wrap: wrap; /* wichtig: erlaubt Umbruch auf Mobile */
  border-radius: 30px;
  margin-bottom: 20px;
}

.story-img {
  width: 370px;        /* kleineres Bild */
  height: 460px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;      /* Bild bleibt in seiner Größe */
  margin: 19px;
}
h4{
  font-size: 40px;
}

.story-text {
  margin: 15px;
  flex: 1;             /* Text nutzt restlichen Platz */
  min-width: 240px;    /* verhindert zu enge Textspalte */
  font-size: 22px;
  line-height: 1.5;
}

@media (max-width: 760px) {
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
     h4 {
    font-size: 25px;
    }
 
   

.story-text {
    transition: all 0.3s ease;
    
    font-size: 16px;
  }

        
      
    .story1 .story-img, .story2 .story-img, .story3 .story-img {
      grid-area: img;
      width: 350px;        /* kleineres Bild */
      height: 260px;
      aspect-ratio: 1 / 1;       /* optional: quadratisch */
      margin:0px;
    }
}


@media (max-width: 1000px) {
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
     h4 {
    font-size: 25px;
    }
 
   

.story-text {
    transition: all 0.3s ease;
    
    font-size: 16px;
  }

        
      
    .story1 .story-img, .story2 .story-img, .story3 .story-img {
      grid-area: img;
      width: 350px;        /* kleineres Bild */
      height: 260px;
      aspect-ratio: 1 / 1;       /* optional: quadratisch */
      margin:0px;
    }
}

</style>
