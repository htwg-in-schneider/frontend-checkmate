
<script setup>
import logo from '@/assets/img/logoheader2.png'
import { useAuth0 } from '@auth0/auth0-vue'

import { useCartStore } from "@/stores/cart"
import { computed } from "vue"
import { useRouter } from "vue-router"


const { loginWithRedirect, logout, isAuthenticated, isLoading } = useAuth0()

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

function goCheckout() {
  router.push("/checkout")
}


function goProfile() {
  router.push("/edit-profile") // Navigiert direkt zur Profilseite
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
 

     <button 
        id="profile-btn" 
        v-if="isAuthenticated" 
        @click="goProfile"
      >
        <i class="bi bi-person"></i>
      </button>

      <button
        id="sign"
        v-if="!isLoading && !isAuthenticated"
        @click="onLoginClick"
      >
        Einloggen
      </button>

      <button
        id="sign"
        v-else-if="!isLoading && isAuthenticated"
        @click="onLogoutClick"
      >
        Abmelden
      </button>
    </div>
  </div>
</template>



<style scoped>
 .header {
  background: rgba(255, 255, 255, 0.35); /* Glass-Effekt */
  background-color: #697C44;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 0.7rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  top: 0;
  z-index: 1000;
}
/* Dein Profil-Button Style */
#profile-btn {
  background-color: grey;
  color: white;
  border: 1px solid white;
  border-radius: 90px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

/* Dropdown Logik */
.user-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none; /* Standardmäßig versteckt */
  position: absolute;
  right: 0;
  background-color: white;
  min-width: 160px;
  box-shadow: 0px 8px 16px rgba(0,0,0,0.2);
  z-index: 1001;
  border-radius: 8px;
  margin-top: 5px;
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
}

.dropdown-content button:hover {
  background-color: #f1f1f1;
}

/* Zeige Menü bei Hover über den Container */
.user-dropdown:hover .dropdown-content {
  display: block;
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