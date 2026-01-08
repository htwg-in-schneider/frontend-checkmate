<template>
  <div class="contact-container" >

  <form @submit.prevent="sendMail">
 
    <input v-model="name" type="text" placeholder="Name" required />
    <input v-model="email" type="email" placeholder="E-Mail" required />
    <textarea v-model="message" placeholder="Nachricht" required></textarea>
    <button type="submit">Absenden</button>
  </form>

  </div>  
</template>

<script setup>
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const message = ref('')

function sendMail() {
  const mailtoLink =
    `mailto:checkMate@dgmail.com?subject=Kontaktanfrage&body=` +
    `Name: ${name.value}%0A` +
    `E-Mail: ${email.value}%0A%0A` +
    message.value

  window.location.href = mailtoLink
}
</script>

<style>

.contact-container{
  width: min(85%, 700px);
  margin: 0 auto;
  background: #F3EFDF;
  padding: 2rem 1.6rem;
  border-radius: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  text-align: center;
}

/* form als flex-spalte + automatische abstände */
.contact-container form{
  display: flex;
  flex-direction: column;
  gap: 1.25rem;           /* DAS macht Abstand zwischen textarea und button */
  align-items: center;    /* zentriert die felder */
}

/* inputs/textarea: volle breite im container */
.contact-container input,
.contact-container textarea{
  width: 100%;
  max-width: 600px;
  padding: 0.8rem;
  border: 1px solid #697C44;
  font-size: 1rem;
  box-sizing: border-box;
}

.contact-container input{
  height: 44px;           /* fingerfreundlich */
  border-radius: 50px;
}

.contact-container textarea{
  min-height: 150px;
  border-radius: 20px;
  resize: vertical;
}

/* button: auch sauber mit abstand */
.contact-container button{
  width: 100%;
  max-width: 220px;
  height: 44px;
  border: none;
  background-color: #697C44;
  color: white;
  font-size: 1.1rem;
  font-weight: 400;
  border-radius: 100px;
  cursor: pointer;
  transition: .2s;
}


</style>
