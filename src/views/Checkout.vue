<script setup>
import { ref, computed } from "vue"
import { useCartStore } from "@/stores/cart"
import { useAuth0 } from "@auth0/auth0-vue"
import { useRouter } from "vue-router"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
const cart = useCartStore()
const router = useRouter()

const { isAuthenticated, loginWithRedirect, getAccessTokenSilently, user } = useAuth0()

// nur Bookings anzeigen/verschicken
const bookingItems = computed(() => (cart.items || []).filter((it) => it.type === "booking"))

// total berechnet aus bookingItems
const total = computed(() => {
  return bookingItems.value.reduce((sum, it) => sum + Number(it.priceTotal || 0), 0)
})

const submitting = ref(false)
const error = ref(null)
const ok = ref(false)

const checkoutNote = ref("")
const buyerEmail = ref(user.value?.email || "")

function isValidEmail(v) {
  if (!v) return true // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim())
}

/**
 * Anzeige ohne Date()-Parsing (robust gegen LocalDateTime mit Nano-Sekunden)
 * Akzeptiert z.B.
 * - 2026-01-15T14:00
 * - 2026-01-15 14:00
 * - 2026-01-15T14:00:00
 * - 2026-01-15T14:00:00.123456789
 */
function formatStartAt(startAt) {
  const s0 = String(startAt || "").trim()
  if (!s0) return ""

  let s = s0.replace(" ", "T")
  s = s.replace(/\.\d+$/, "") // Nanoseconds weg

  const [datePart, timePartFull] = s.split("T")
  if (!datePart || !timePartFull) return s0

  const time = timePartFull.slice(0, 5) // HH:mm
  const [y, m, d] = datePart.split("-")
  if (!y || !m || !d) return s0

  return `${d}.${m}.${y} ${time}`
}

/**
 * Für Spring LocalDateTime:
 * - ersetzt " " -> "T"
 * - schneidet Nanoseconds ab
 * - ergänzt Sekunden, wenn nur HH:mm vorhanden ist
 */
function normalizeStartAt(startAt) {
  let s = String(startAt || "").trim()
  if (!s) return s

  s = s.replace(" ", "T")
  s = s.replace(/\.\d+$/, "") // Nanoseconds weg

  // wenn kein T drin ist, lassen wir es wie es ist
  if (!s.includes("T")) return s

  // Sekunden ergänzen, falls nur HH:mm vorhanden
  if (/T\d{2}:\d{2}$/.test(s)) return `${s}:00`

  return s
}

async function submitOrder() {
  error.value = null
  ok.value = false
  submitting.value = true

  try {
    if (!isAuthenticated.value) {
      await loginWithRedirect({ appState: { target: "/checkout" } })
      return
    }

    if (!bookingItems.value.length) throw new Error("Warenkorb ist leer.")

    const token = await getAccessTokenSilently()

    const payload = {
      buyerEmail: buyerEmail.value || "",
      note: checkoutNote.value || "",
      bookings: bookingItems.value.map((it) => ({
        tutorId: it.tutorId,
        tutorName: it.tutorName,
        startAt: it.startAt, // dein Backend nimmt LocalDateTime
        durationMinutes: Number(it.durationMinutes),
        price: Number(it.priceTotal),
        note: it.note || "",
      })),
    }

    const res = await fetch(`${API_BASE}/api/transactions/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`Checkout fehlgeschlagen (${res.status}): ${txt}`)
    }

    ok.value = true
    cart.clear()
    router.push("/unterricht") // ✅ direkt weiter
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    submitting.value = false
  }
}

function removeItem(it) {
  // cart.remove erwartet bei dir vermutlich einen "key"
  // falls key fehlt -> fallback über startAt+tutorId (wie in :key)
  const k = it?.key || `${it?.startAt}-${it?.tutorId}`
  cart.remove(k)
}
</script>

<template>
  <div class="container py-4">
    <h1>Warenkorb / Checkout</h1>

    <p v-if="bookingItems.length === 0">Warenkorb ist leer.</p>

    <div v-else>
      <h3>Deine Buchungen</h3>

      <div
        v-for="it in bookingItems"
        :key="it.key || it.startAt + '-' + it.tutorId"
        class="border rounded p-2 mb-2"
      >
        <div class="d-flex justify-content-between">
          <div>
            <strong>{{ it.tutorName }}</strong>
            <div class="text-muted">
              {{ it.subject }} • {{ it.durationMinutes }} Min • Termin: {{ formatStartAt(it.startAt) }}
            </div>
            <div>Preis: {{ Number(it.priceTotal).toFixed(2) }} €</div>
            <div v-if="it.note" class="text-muted">Notiz: {{ it.note }}</div>
          </div>

          <div class="d-flex gap-2 align-items-start">
            <button class="btn btn-sm btn-outline-danger" @click="removeItem(it)">
              Entfernen
            </button>
          </div>
        </div>
      </div>

      <hr />

      <label class="form-label">Email (optional)</label>
      <input v-model="buyerEmail" class="form-control mb-2" placeholder="name@mail.com" />

      <label class="form-label">Kommentar (optional)</label>
      <textarea v-model="checkoutNote" class="form-control" rows="2"></textarea>

      <div class="mt-3"><strong>Total:</strong> {{ total.toFixed(2) }} €</div>

      <button class="btn btn-success mt-3" :disabled="submitting" @click="submitOrder">
        {{ submitting ? "Sende..." : "Buchungen absenden" }}
      </button>

      <p v-if="ok" class="text-success mt-2">Transaktion gespeichert ✅</p>

      <!-- ✅ Fehlertext sinnvoll anzeigen -->
      <p v-if="error" class="text-danger mt-2">
        {{ error.includes("409") ? "Termin leider nicht mehr verfügbar" : error }}
      </p>
    </div>
  </div>
</template>