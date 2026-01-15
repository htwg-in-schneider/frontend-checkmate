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

const { loginWithRedirect, logout, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()

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
      <!-- Sprache -->
      <button id="lang" @click="toggleLanguage">
        <i class="fa-solid fa-globe"></i> Sprache
      </button>

      <!-- Profil -->
      <button
        id="profile-btn"
        v-if="isAuthenticated"
        @click="goProfile"
      >
        <i class="bi bi-person"></i>
      </button>

      <!-- Warenkorb -->
      <button
        v-if="isAuthenticated"
        class="nav-btn position-relative"
        @click="router.push('/checkout')"
      >
        🛒
        <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
      </button>

      <!-- ✅ Burger statt Abmelden -->
      <div class="burger-wrap" v-if="!isLoading && isAuthenticated">
        <button class="nav-btn burger-btn" @click.stop="toggleBurger" aria-label="Menü öffnen">
          ☰
        </button>

        <teleport to="body">
          <div v-if="burgerOpen" class="burger-overlay" @click="closeBurger"></div>

          <div v-if="burgerOpen" class="burger-menu" @click.stop>
            <button class="menu-item" @click="go('/study-partner')">Studypartner suchen</button>
            <button class="menu-item" @click="go('/tutoren')">Tutor suchen</button>
            <button class="menu-item" @click="go('/unterricht')">Unterrichtsstunden</button>
            <button class="menu-item" @click="go('/matches')">Meine Matches</button>
            <button class="menu-item" @click="go('/messages')">Nachrichten</button>


            <!-- ✅ Admin sieht zusätzlich "Alle Transaktionen" -->
            <button
              v-if="isAdmin"
              class="menu-item admin"
              @click="go('/adminTransactions')"
            >
              Alle Transaktionen
            </button>

            <hr class="menu-sep" />

            <button class="menu-item logout-item" @click="logoutFromBurger">Abmelden</button>
          </div>
        </teleport>
      </div>

      <!-- Einloggen (nur wenn NICHT eingeloggt) -->
      <button
        id="sign"
        v-if="!isLoading && !isAuthenticated"
        @click="onLoginClick"
      >
        Einloggen
      </button>

      <!-- ❌ Abmelden-Button absichtlich NICHT mehr hier -->
    </div>
  </div>
</template>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.35);
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
}

/* Profil Button bleibt wie bei dir */
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