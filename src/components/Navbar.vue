<script setup>
import logo from '@/assets/img/logoheader2.png'
import { useAuth0 } from '@auth0/auth0-vue'
import { useCartStore } from "@/stores/cart"
import { computed, ref, onMounted, watch, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"

const router = useRouter()
const cart = useCartStore()
const cartCount = computed(() => cart.count)

const { loginWithRedirect, logout, isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0()

const onLoginClick = () => {
  loginWithRedirect({
    appState: { target: '/app' }
  })
}

const onLogoutClick = () => {
  logout({ logoutParams: { returnTo: window.location.origin + "/frontend-checkmate/" } })
}

function goHome() {
  // Beispiel für ei
  closeBurger(); // WICHTIG: Schließt das Menü nach dem Klick
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

function goCheckout() {
  router.push("/checkout")
}

function goProfile() {
  router.push("/edit-profile")
}

/* ==========================
   ✅ ADMIN STATE + LOAD ROLE
   ========================== */
const isAdmin = ref(false)

async function loadBackendProfile() {
  try {
    const token = await getAccessTokenSilently()
    const res = await fetch(`${API_BASE}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Profile failed: ${res.status}`)
    const profile = await res.json()
    isAdmin.value = profile?.role === "ADMIN"
  } catch (e) {
    isAdmin.value = false
  }
}

watch(
  () => isAuthenticated.value,
  async (loggedIn) => {
    if (loggedIn) await loadBackendProfile()
    else isAdmin.value = false
  },
  { immediate: true }
)

/* ==========================
   ✅ BURGER MENU
   ========================== */
const burgerOpen = ref(false)

function toggleBurger() {
  burgerOpen.value = !burgerOpen.value
}
function closeBurger() {
  burgerOpen.value = false
}

function go(path) {
  closeBurger()
  router.push(path)
}

function logoutFromBurger() {
  closeBurger()
  onLogoutClick()
}

// click outside -> close
function onDocumentClick(e) {
  if (!burgerOpen.value) return
  const menu = document.querySelector(".burger-menu")
  const btn = document.querySelector(".burger-btn")
  if (menu?.contains(e.target)) return
  if (btn?.contains(e.target)) return
  closeBurger()
}
onMounted(() => document.addEventListener("click", onDocumentClick))
onBeforeUnmount(() => document.removeEventListener("click", onDocumentClick))
</script>

<template>
 
  <div class="header">
    <router-link to="/" class="logo">
      <img class="logo" :src="logo" alt="CheckMate Logo" />
    </router-link>

    <div class="right-Side">
   
      <!-- Profil -->
       
   <div v-if="isAuthenticated" class="user-dropdown">
    <button 
      id="profile-btn" 
      @click="goProfile"
      class="avatar-wrapper"
    >
      <div class="avatar" :style="{ color: 'gray' }" >
        {{ (user?.name || user?.nickname || '?').slice(0, 1).toUpperCase() }}
      </div>
    </button>

    <div class="dropdown-content">
      <button @click="goProfile">
        <i class="bi bi-person"></i> Profil bearbeiten
      </button>

      <button @click="onLogoutClick" class="logout-item">
        <i class="bi bi-box-arrow-right"></i> Abmelden
      </button>
    </div>
  </div>
      

      <!-- Warenkorb -->
      <button
        v-if="isAuthenticated"
        class="nav-btn position-relative"
        @click="router.push('/checkout')"
      >
        <i class="bi bi-cart"></i>
        <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
      </button>

      <!-- ✅ Burger statt Abmelden -->
      <div class="burger-wrap" v-if="!isLoading && isAuthenticated">
        <button class="nav-btn burger-btn" @click.stop="toggleBurger" aria-label="Menü öffnen">
          ☰
        </button>

        <teleport to="body">
          <div v-if="burgerOpen" class="burger-menu" @click.stop>
            <button class="menu-item" @click="goHome">
                 Home
            </button>
  
            <hr class="menu-sep" /> 
            <button class="menu-item" @click="go('/study-partner')">Studypartner suchen</button>
           <button class="menu-item" @click="go('/tutoren')">Tutor suchen</button>
           <button class="menu-item" @click="go('/unterricht')">Unterrichtsstunden</button>
           <button class="menu-item" @click="go('/matches')">Meine Matches</button>
           <button class="menu-item" @click="go('/messages')">Nachrichten</button>

           <button v-if="isAdmin" class="menu-item admin" @click="go('/adminTransactions')">
             Alle Transaktionen
           </button>
           <button v-if="isAdmin" class="menu-item admin" @click="go('/adminUsersView')">
             Userübersicht
           </button>
  
          <hr class="menu-sep" />

         </div>
        </teleport>
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
  width: 400px;
  height: auto;
  flex-shrink: 1;
  max-width: 100%;
}

@media (max-width: 750px) {
  .logo {
    content: url('@/assets/img/logofooter.png');
    width: 55px;
  }
}

.nav-btn {
  background-color: #c5bfb3;
  color: #697C44;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  font-weight:bolder;
}

/* Profil Button bleibt wie bei dir */

.right-Side {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ff6600;
  color: white;
  border-radius: 999px;
  font-size: 0.75rem;
  padding: 2px 6px;
}

/* ===== Burger Menü ===== */
.burger-wrap {
  position: relative;
}

.burger-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.25);
  z-index: 9998;
}

.burger-menu {
  position: fixed;
  top: 78px;
  right: 14px;
  width: 240px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 26px rgba(0,0,0,0.18);
  overflow: hidden;
  z-index: 9999;
}

.menu-item {
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  border: none;
  background: white;
  cursor: pointer;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.menu-item:hover {
  background-color: #f1f1f1;
}

.menu-sep {
  margin: 0;
  border: none;
  border-top: 1px solid #eee;
}

.logout-item {
  color: #a46c3a;
}

.admin {
  color: #2f5e2f;
}
</style>