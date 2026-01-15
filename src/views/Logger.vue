<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Footer from '@/components/Footer.vue'


const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

async function login() {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Bitte fülle erstmal alle Felder aus'
    return
  }

  try {
    // Beispiel-Request → passe URL an dein Backend an
    const res = await fetch('http://localhost:8081/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    })

    if (!res.ok) {
      error.value = 'Login fehlgeschlagen.'
      return
    }

    // Nach Login weiterleiten
    router.push('/tutoren')

  } catch (err) {
    error.value = 'Ihre E-Mail oder Passwort ist falsch!\nBitte erneut versuchen. '
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="footer-logo">
        <img src="@/assets/img/logofooter.png" alt="CheckMate Logo" />
      </div>

      <h2>Bei CheckMate anmelden</h2>

      <p class="error">{{ error }}</p>

      <input 
        type="email" 
        placeholder="E-Mail" 
        v-model="email"
        :class="{ invalid: error }"
      />

      <input 
        type="password" 
        placeholder="Passwort" 
        v-model="password"
        :class="{ invalid: error }"
      />

    <div class="action-row">
      <button @click="login">Anmelden</button>

      <p class="switch">
        Neu bei CheckMate?
        <br></br>
        <router-link to="/register" exact tag="div">Jetzt Konto erstellen</router-link>
      </p>
      </div>

    </div>

  </div>

  <div class="homepage">
      <a @click="$router.push('/')">Zurück zur Startseite</a>
    </div>

  

</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #697C44;
}


.homepage {
  text-align: center;
  background-color: #697C44;

}

.homepage a {
  color: #171304;
  font-size: 0.9rem;
  text-decoration: underline;
  cursor: pointer;
  background-color: #697C44;
  
}


.footer-logo {
  width: 70px;                /* Größe anpassen */
  height: 70px;
  position: absolute;
  top: -40px;                  /* sitzt über der Box */
  left: 50%;
  transform: translateX(-50%); /* zentriert */
}

.footer-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.login-box {
  position: relative;  
  width: 85%;
  max-width: 370px;
  min-height: 460px;
  background: #F3EFDF;
  padding-top: 2rem;
  padding-left: 2rem;
  padding-right:1.6rem ;
  border-radius: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  text-align: center;
}


h2 {
  font-size: 28px;
  margin-top: 20px;
  margin-bottom: 30px;
  text-align: start;

}

input {
  width: 100%;
  height: 21px;
  padding: 0.8rem;
  margin-bottom: 2rem;
  border-radius: 50px;
  border: 1px solid #697C44;
}

.invalid {
  border: 2px solid #d9534f !important; /* rot */
  
}


a { color: #697C44; }

button {
  width: 150px;
  height: 35px;
  border: none;
  background-color: #697C44;
  color: white;
  font-size: 1.2rem;
  font-weight:400;
  border-radius: 100px;
  cursor: pointer;
  transition: .2s;
}


button:hover {
  background-color: #556538;
}

p {
margin: 0;    
}

.error {
  min-height: 30px;  /* Fix für Layoutshift */
  color: red;
  font-size: 0.7rem;
  margin-bottom: 10px;
  white-space: pre-line;
}

.switch {
  
  font-size: 0.7rem;
  margin-left: 20px;
  
}

.action-row {
  display: flex;
  justify-content: space-between;  /* Abstand zwischen Buttons */
  align-items: center;
  margin-top: 2rem;
}
</style>
