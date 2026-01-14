
<script setup>
import logo from '@/assets/img/logoheader2.png'
import { useAuth0 } from '@auth0/auth0-vue'

import { useCartStore } from "@/stores/cart"
import { computed } from "vue"
import { useRouter } from "vue-router"

import { ref, onMounted } from 'vue';


const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const onLoginClick = () => {
 loginWithRedirect({
  appState: { target: '/app' }
})
}

const onLogoutClick = () => {
  logout({ logoutParams: { returnTo: window.location.origin } })
}



const toggleLanguage = () => {
  const select = document.querySelector('.goog-te-combo')
  if (select) {
    const newValue = select.value === 'en' ? 'de' : 'en'
    select.value = newValue
    select.dispatchEvent(new Event('change'))
  } else {
    alert('Google Translate konnte noch nicht geladen werden. Bitte kurz warten.')
  }
}


const cart = useCartStore()
const router = useRouter()
const cartCount = computed(() => cart.count)

// Ergänze 'user' in der Destrukturierung:
const { loginWithRedirect, logout, isAuthenticated, isLoading, user } = useAuth0()

function goCheckout() {
  router.push("/checkout")
}


function goProfile() {
  router.push("/edit-profile") // Navigiert direkt zur Profilseite
}

function goHome() {
  // Beispiel für ei
  // nen Auth0-Rollen-Claim
  const roles = user.value['https://checkmate.app/roles'] || [];
  
  if (roles.includes('student')) {
    router.push('/student');
  } else if (roles.includes('tutor')) {
    router.push('/tutor');
  } else {
    router.push('/');
  }

}

</script>
<template>
<button id="cart" @click="goCheckout" style="position:relative;">
  🛒
  <span
    v-if="cartCount > 0"
    style="
      position:absolute; top:-6px; right:-10px;
      background:red; color:white;
      border-radius:999px; padding:2px 6px;
      font-size:12px;
    "
  >
    {{ cartCount }}
  </span>
</button>

  <div class="header">
    <img class="logo" :src="logo" alt="CheckMate Logo" />

    <div class="right-Side">
 
   <div v-if="isAuthenticated" class="user-dropdown">
     <button 
      id="profile-btn" 
      v-if="isAuthenticated" 
      @click="goProfile"
      class="avatar-wrapper"
>
     <div class="avatar">
       {{ (user?.name || user?.nickname || '?').slice(0, 1).toUpperCase() }}
      </div>
     </button>
     <div class="dropdown-content">
         
     <button class="btn btn-outline-secondary px-4" @click="goHome">
      Home
    </button>

<BackButton />
          <button @click="goProfile">
            <i class="bi bi-person"></i> Profil bearbeiten
          </button>
          <button @click="onLogoutClick" class="logout-item">
            <i class="bi bi-box-arrow-right"></i> Abmelden
          </button>
        </div>
      </div>

      <button
        id="sign"
        v-if="!isLoading && !isAuthenticated"
        @click="onLoginClick"
      >
        Einloggen
      </button>

  
    </div>
  </div>
</template>



<style scoped>
 .header {
 
  background-color: #697C44;
  padding: 0.7rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  overflow: visible !important;
  top: 0;
  z-index: 1200;
}
/* Dein Profil-Button Style */
#profile-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

/* Die Avatar-Kreis-Logik */
.avatar {
  background-color: lightgray; /* Deine Farbe aus dem Tutor-Filter-Toggle */
  border: 1px solid gray;
  border-radius: 50%; /* Perfekt rund */
  width: 50px;        /* Feste Breite */
  height: 50px;       /* Feste Höhe */
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  transition: transform 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  
}

/* Dropdown Logik */
.user-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: flex; 
  flex-direction: column;
  opacity: 0;
  visibility: hidden;
    position: absolute;
  right: 0;
  top: 100%; 
  background-color: white;
  min-width: 180px;
  box-shadow: 0px 8px 16px rgba(0,0,0,0.2);
  z-index: 1300;
  border-radius: 8px;
  margin-top: 5px;
  overflow: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  transition-delay: 0.1s; 
}

/* 2. Den Hover-Zustand anpassen */
.user-dropdown:hover .dropdown-content {
  opacity: 1;
  visibility: visible;
  
  /* VERZÖGERUNG BEIM ÖFFNEN (Enter) */
  /* Beim Drüberfahren soll es sofort (0s) erscheinen */
  transition-delay: 0s;
}

.dropdown-content button {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  color: #333;
  font-size: 14px;
  font-weight: bolder;
}

.dropdown-content button:hover {
  background-color: #f1f1f1;
}

.user-dropdown:hover .dropdown-content {
  display: flex;
}

.logout-item {
  border-top: 1px solid #eee !important;
  color: #a46c3a !important; /* Braunton für Logout */
}

  .logo {
  width: 400px;                  /* Desktopgröße */
  height: auto;
  flex-shrink: 1;                /* darf schrumpfen, wenn zu wenig Platz */
  max-width: 100%;               /* verhindert, dass es den Viewport sprengt */
}

@media (max-width: 750px) {
  .logo {
    content: url('@/assets/img/logofooter.png');
    width: 55px;
  }
}
</style>