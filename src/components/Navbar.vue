<script setup>
import logo from "@/assets/img/logoheader2.png"
import { useAuth0 } from "@auth0/auth0-vue"
import { useCartStore } from "@/stores/cart"
import { computed, ref, onMounted, watch, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"

const router = useRouter()
const cart = useCartStore()
const cartCount = computed(() => cart.count)

const {
  loginWithRedirect,
  logout,
  isAuthenticated,
  isLoading,
  getAccessTokenSilently,
  user,
} = useAuth0()

const onLoginClick = () => {
  loginWithRedirect({ appState: { target: "/app" } })
}

const onLogoutClick = () => {
  logout({ logoutParams: { returnTo: window.location.origin + "/frontend-checkmate/" } })
}

/* ==========================
   ✅ ROLE STATE (backend)
   ========================== */
const role = ref(null) // "STUDENT" | "TUTOR" | "ADMIN" | null
const isAdmin = computed(() => role.value === "ADMIN")
const isTutor = computed(() => role.value === "TUTOR" || role.value === "ADMIN") // Admin zählt wie Tutor

async function loadBackendProfile() {
  try {
    const token = await getAccessTokenSilently()
    const res = await fetch(`${API_BASE}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Profile failed: ${res.status}`)
    const profile = await res.json()
    role.value = profile?.role ?? null
  } catch (e) {
    role.value = null
  }
}

watch(
  () => isAuthenticated.value,
  async (loggedIn) => {
    if (loggedIn) await loadBackendProfile()
    else role.value = null
  },
  { immediate: true }
)

/* ==========================
   ✅ NAV
   ========================== */
function go(path) {
  closeBurger()
  router.push(path)
}

function goCheckout() {
  closeBurger()
  router.push("/checkout")
}

function goProfile() {
  closeBurger()
  router.push("/edit-profile")
}

function goHome() {
  closeBurger()

  // Wenn ihr Home-Routen pro Rolle habt:
  if (role.value === "TUTOR") router.replace("/tutor")
  else if (role.value === "ADMIN") router.replace("/admin")
  else router.replace("/student")
}

/* ==========================
   ✅ BURGER MENU (click-open)
   ========================== */
const burgerOpen = ref(false)

function toggleBurger() {
  burgerOpen.value = !burgerOpen.value
}

function closeBurger() {
  burgerOpen.value = false
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
        <button id="profile-btn" @click="goProfile" class="avatar-wrapper">
          <div class="avatar" :style="{ color: 'gray' }">
            {{ (user?.name || user?.nickname || "?").slice(0, 1).toUpperCase() }}
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
        @click="goCheckout"
      >
        <i class="bi bi-cart"></i>
        <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
      </button>

      <!-- ✅ Burger -->
      <div class="burger-wrap" v-if="!isLoading && isAuthenticated">
        <button class="nav-btn burger-btn" aria-label="Menü öffnen" @click="toggleBurger">
          ☰
        </button>

        <div class="burger-menu" :class="{ open: burgerOpen }">
          <button class="menu-item" @click="goHome">Home</button>

          <hr class="menu-sep" />

          <!-- ✅ Diese 3 nur für STUDENT -->
          <button v-if="!isTutor" class="menu-item" @click="go('/study-partner')">
            Studypartner suchen
          </button>

          <button v-if="!isTutor" class="menu-item" @click="go('/tutoren')">
            Tutor suchen
          </button>

          <button v-if="!isTutor" class="menu-item" @click="go('/matches')">
            Meine Matches
          </button>

          <!-- ✅ Für alle eingeloggten (Tutor+Student) -->
          <button class="menu-item" @click="go('/unterricht')">
            Unterrichtsstunden
          </button>

          <button class="menu-item" @click="go('/messages')">Nachrichten</button>

          <!-- ✅ Admin -->
          <button v-if="isAdmin" class="menu-item admin" @click="go('/adminTransactions')">
            Alle Transaktionen
          </button>
          <button v-if="isAdmin" class="menu-item admin" @click="go('/adminUsersView')">
            Userübersicht
          </button>


    
        </div>
      </div>

      <button id="sign" v-if="!isLoading && !isAuthenticated" @click="onLoginClick">
        Einloggen
      </button>
    </div>
  </div>
</template>

<style scoped>
.header {
  background-color: #697c44;
  padding: 0.7rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  overflow: visible !important;
  top: 0;
  z-index: 1200;
}

/* Profil */
#profile-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.avatar {
  background-color: lightgray;
  border: 1px solid gray;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  transition: transform 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

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
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 1300;
  border-radius: 8px;
  margin-top: 5px;
  overflow: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  transition-delay: 0.1s;
}

.user-dropdown:hover .dropdown-content {
  opacity: 1;
  visibility: visible;
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

.logout-item {
  border-top: 1px solid #eee !important;
  color: #a46c3a !important;
}

.logo {
  width: 400px;
  height: auto;
  flex-shrink: 1;
  max-width: 100%;
}

@media (max-width: 750px) {
  .logo {
    content: url("@/assets/img/logofooter.png");
    width: 55px;
  }
}

/* Buttons */
.nav-btn {
  background-color: #c5bfb3;
  color: #697c44;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  font-weight: bolder;
}

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

/* ===== Burger ===== */
.burger-wrap {
  position: relative;
  display: inline-block;
}

/* default hidden */
.burger-menu {
  display: flex;
  flex-direction: column;
  opacity: 0;
  visibility: hidden;
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  min-width: 220px;
  border-radius: 12px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.18);
  z-index: 1300;
  margin-top: 8px;
  overflow: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

/* open when clicked */
.burger-menu.open {
  opacity: 1;
  visibility: visible;
}

.menu-item {
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  border: none;
  background: white;
  cursor: pointer;
  color: #333;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
}

.menu-item:hover {
  background-color: #f1f1f1;
}

.menu-sep {
  margin: 0;
  border: none;
  border-top: 1px solid #eee;
}

.admin {
  color: #418841;
}
</style>