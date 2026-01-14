<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Footer from '@/components/Footer.vue'

const router = useRouter()

// Form Fields
const role = ref('student') 
const university = ref('')
const name = ref('')
const email = ref('')
const password = ref('')
const repeatPassword = ref('')
const course = ref('')
const semester = ref('')
const error = ref('')
const success = ref('')

async function register() {
  error.value = ''
  success.value = ''

  if (!email.value || !password.value || !repeatPassword.value || !name.value) {
    error.value = 'Bitte fülle alle Pflichtfelder aus.'
    return
  }

  if (password.value !== repeatPassword.value) {
    error.value = 'Die Passwörter stimmen nicht überein.'
    return
  }

  try {
    const res = await fetch('http://localhost:8081/api/register', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: role.value,
        university: university.value,
        name: name.value,
        email: email.value,
        password: password.value,
        course: course.value,
        semester: semester.value
      })
    })

    if (!res.ok) {
      error.value = 'Registrierung fehlgeschlagen.'
      return
    }

    success.value = 'Konto erfolgreich erstellt!'
    setTimeout(() => router.push('/login'), 1500)

  } catch (err) {
    error.value = 'Server nicht erreichbar.'
  }
}
</script>

<template>
  <div class="register-container" :class="role">

    <div class="register-box">

      <!-- Logo oben -->
      <div class="logo-top">
        <img src="@/assets/img/logofooter.png" alt="Logo" />
      </div>

      <h2>Bei CheckMate registrieren:</h2>

      <p class="subtitle">Als was willst du CheckMate verwenden?</p>

      <!-- Roles -->
      <div class="role-select">
        <label>
          <input type="radio" value="student" v-model="role" /> Student
        </label>

        <label>
          <input type="radio" value="tutor" v-model="role" /> Tutor
        </label>
      </div>

      <!-- Input-Felder -->
      <input class="input" type="text" placeholder="Hochschule / Universität" v-model="university" />
      <input class="input" type="text" placeholder="Name" v-model="name" />
      <input class="input" type="email" placeholder="E-Mail" v-model="email" />
      <input class="input" type="password" placeholder="Passwort" v-model="password" />
      <input class="input" type="password" placeholder="Passwort wiederholen" v-model="repeatPassword" />
      <input class="input" type="text" placeholder="Studiengang" v-model="course" />
      <input class="input" type="number" placeholder="Semester" v-model="semester" />

      <!-- Fehler -->
      <p class="error">{{ error }}</p>
      <p class="success">{{ success }}</p>

      <button class="register-btn" :class="role" @click="register">Konto erstellen</button>

      <!-- Link -->
      <p class="back">
        Schon ein Konto?  
        <router-link to="/login">Hier anmelden</router-link>
      </p>
    </div>

    <div class="homepage">
      <a @click="$router.push('/')">Zurück zur Startseite</a>
    </div>

  </div>

  <Footer />
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-size: cover;
  background-position: center;
  padding-top: 60px;
}

.register-container.student {
 background-image: url('@/assets/img/matcha.jpg');
}

.register-container.tutor {
 background-image: url('@/assets/img/coffee.jpg');
}


/* Box */
.register-box {
  position: relative;
  width: 85%;
  max-width: 380px;
  background: #F3EFDF;
  border-radius: 30px;
  padding: 2.5rem 2rem 2rem 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

/* Logo oben über der Box */
.logo-top {
  width: 75px;
  height: 75px;
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
}

.logo-top img {
  width: 100%;
  height: 100%;
}

/* Headline */
h2 {
  text-align: start;
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: bold;
}

.subtitle {
  font-size: 0.8rem;
  margin-bottom: 10px;
}

/* Roles */
.role-select {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  margin-top: 20px;
  font-size: 0.9rem;
  color: black;
  margin-left: 30px;
  margin-right: 34px;
}

/* Inputs */
.input {
  width: 100%;
  height: 21px;
  padding: 1rem;
  margin-bottom: 0.9rem;
  border-radius: 50px;
  border: 1px solid #697C44;
  background: white;
}
 input[type='radio'] {
    accent-color: #232323;
}
/* Button */
.register-btn {
  width: 100%;
  height: 38px;
  background: #697C44;
  color: white;
  border: none;
  border-radius: 100px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 10px;
}

.register-btn.tutor {
background: #943C0F;
}
.register-btn.tutor:hover {
  background: #BC693F;
}

/* Messages */
.error {
  color: red;
  font-size: 0.8rem;
  min-height: 20px;
}
.success {
  color: green;
  font-size: 0.8rem;
  min-height: 20px;
}

/* Link */
.back {
  font-size: 0.8rem;
  margin-top: 1rem;
  text-align: center;
}

.homepage {
  margin-top: 1rem;
  font-size: 0.8rem;
}
</style>
