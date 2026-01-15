<script setup>
import { ref, onMounted } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
const OFFERS_URL = `${API_BASE}/api/offers` // <-- ggf. anpassen

const { isAuthenticated, isLoading, getAccessTokenSilently, loginWithRedirect } = useAuth0()

const offers = ref([])
const loading = ref(true)
const error = ref(null)

function lsKey() {
  return "checkmate_offers"
}
function readLocalOffers() {
  try {
    return JSON.parse(localStorage.getItem(lsKey()) || "[]")
  } catch {
    return []
  }
}
function writeLocalOffers(items) {
  localStorage.setItem(lsKey(), JSON.stringify(items))
}

async function loadOffers() {
  loading.value = true
  error.value = null

  try {
    if (!isAuthenticated.value) {
      offers.value = []
      return
    }

    // ---- Versuch: Backend ----
    try {
      const token = await getAccessTokenSilently()
      const res = await fetch(`${OFFERS_URL}/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        offers.value = await res.json()
        return
      }
      console.warn("Backend loadOffers failed:", res.status)
    } catch (backendErr) {
      console.warn("Backend loadOffers error, fallback to localStorage:", backendErr)
    }

    // ---- Fallback: localStorage ----
    offers.value = readLocalOffers().filter((o) => o.owner === "me")
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

async function deleteOffer(offerId) {
  error.value = null

  try {
    // ---- Versuch: Backend ----
    try {
      const token = await getAccessTokenSilently()
      const res = await fetch(`${OFFERS_URL}/${offerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        offers.value = offers.value.filter((o) => o.id !== offerId)
        return
      }
      console.warn("Backend deleteOffer failed:", res.status)
    } catch (backendErr) {
      console.warn("Backend deleteOffer error, fallback to localStorage:", backendErr)
    }

    // ---- Fallback: localStorage ----
    const items = readLocalOffers()
    const next = items.filter((o) => o.id !== offerId)
    writeLocalOffers(next)
    offers.value = offers.value.filter((o) => o.id !== offerId)
  } catch (e) {
    error.value = e?.message ?? String(e)
  }
}

onMounted(loadOffers)
</script>

<template>
  <div class="page">
    <Navbar />

    <section class="py-5 text-center">
      <div class="container">
        <h2 class="fw-bold">Meine Angebote</h2>
        <p>Übersicht deiner Tutor-Angebote</p>
      </div>
    </section>

    <div class="container pb-5" style="max-width: 900px;">
      <p v-if="isLoading" class="text-center">Lade…</p>

      <div v-else>
        <div v-if="!isAuthenticated" class="alert alert-warning">
          Du musst eingeloggt sein, um deine Angebote zu sehen.
          <div class="mt-2">
            <button class="btn btn-primary" @click="loginWithRedirect()">Login</button>
          </div>
        </div>

        <template v-else>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <button class="btn btn-outline-secondary" @click="$router.back()">Zurück</button>
            <button class="btn btn-success" @click="$router.push('/angebot-erstellen')">
              + Angebot erstellen
            </button>
          </div>

          <p v-if="error" class="text-danger">{{ error }}</p>

          <p v-if="loading" class="text-center">Lade Angebote…</p>

          <div v-else>
            <div v-if="!offers.length" class="text-center text-muted">
              Du hast noch keine Angebote erstellt.
            </div>

            <div v-else class="row g-3">
              <div v-for="o in offers" :key="o.id" class="col-md-6">
                <div class="card shadow-sm h-100">
                  <div class="card-body">
                    <h5 class="card-title mb-1">{{ o.title }}</h5>
                    <div class="text-muted small mb-2">{{ o.subject }} · {{ o.location ?? "—" }}</div>

                    <p class="card-text">{{ o.description || "—" }}</p>

                    <div class="d-flex gap-2 mt-3">
                      <span class="badge text-bg-secondary">
                        {{ o.durationMinutes ?? 60 }} min
                      </span>
                      <span class="badge text-bg-success">
                        {{ o.hourlyRate ?? 0 }} € / h
                      </span>
                    </div>

                    <div class="d-flex justify-content-end mt-3">
                      <button class="btn btn-outline-danger btn-sm" @click="deleteOffer(o.id)">
                        Löschen
                      </button>
                    </div>

                    <div class="text-muted small mt-2">
                      Erstellt: {{ (o.createdAt || "").slice(0, 10) || "—" }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
          </div>
        </template>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3efdf;
}
</style>