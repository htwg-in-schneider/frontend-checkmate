<script setup>
import { ref, computed } from "vue"
import { useCartStore } from "@/stores/cart"
import { useAuth0 } from "@auth0/auth0-vue"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
const cart = useCartStore()
const { isAuthenticated, loginWithRedirect, getAccessTokenSilently, user } = useAuth0()

// nur Bookings anzeigen/verschicken
const bookingItems = computed(() => (cart.items || []).filter((it) => it.type === "booking"))

// total: entweder aus store oder berechnet (falls cart.total nicht passt)
const total = computed(() => {
  // wenn du cart.total schon korrekt hast, kannst du das hier auch einfach: return cart.total
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

// macht aus "2026-01-15T14:00" -> "2026-01-15T14:00:00"
function normalizeStartAt(startAt) {
  const s = String(startAt || "")
  if (!s.includes("T")) return s
  // wenn schon Sekunden drin sind, nichts ändern
  if (/T\d{2}:\d{2}:\d{2}$/.test(s)) return s
  // wenn nur HH:mm drin ist -> Sekunden ergänzen
  if (/T\d{2}:\d{2}$/.test(s)) return `${s}:00`
  return s
}

async function submitTransaction() {
  error.value = null
  ok.value = false
  submitting.value = true

  try {
    if (!isAuthenticated.value) {
      await loginWithRedirect({ appState: { target: "/checkout" } })
      return
    }

    if (!bookingItems.value.length) {
      throw new Error("Warenkorb ist leer.")
    }

    if (!isValidEmail(buyerEmail.value)) {
      throw new Error("Bitte gib eine gültige Email ein (oder lass das Feld leer).")
    }

    const token = await getAccessTokenSilently()

    // ✅ Payload so, wie das Backend DTO es erwartet
    const payload = {
      buyerEmail: buyerEmail.value || null,
      note: checkoutNote.value,
      items: bookingItems.value.map((it) => ({
        tutorId: it.tutorId,
        tutorName: it.tutorName,
        startAt: normalizeStartAt(it.startAt),
        durationMinutes: Number(it.durationMinutes),
        price: Number(it.priceTotal),
      })),
    }

    const res = await fetch(`${API_BASE}/api/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      // wenn dein GlobalExceptionHandler JSON liefert, sieht man damit die Feldfehler
      const text = await res.text().catch(() => "")
      throw new Error(`Backend ${res.status}: ${text}`)
    }

    ok.value = true
    cart.clear()
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container py-4">
    <h1>Warenkorb / Checkout</h1>

    <p v-if="bookingItems.length === 0">Warenkorb ist leer.</p>

    <div v-else>
      <h3>Deine Buchungen</h3>

      <div v-for="it in bookingItems" :key="it.key || it.startAt + '-' + it.tutorId" class="border rounded p-2 mb-2">
        <div class="d-flex justify-content-between">
          <div>
            <strong>{{ it.tutorName }}</strong>
            <div class="text-muted">
              {{ it.subject }} • {{ it.durationMinutes }} Min • Termin: {{ it.startAt }}
            </div>
            <div>Preis: {{ Number(it.priceTotal).toFixed(2) }} €</div>
            <div v-if="it.note" class="text-muted">Notiz: {{ it.note }}</div>
          </div>

          <div class="d-flex gap-2 align-items-start">
            <!-- Wenn du qty/inc/dec für bookings NICHT willst: diese 2 Buttons entfernen -->
            <button v-if="cart.dec" class="btn btn-sm btn-outline-secondary" @click="cart.dec(it.key)">-</button>
            <button v-if="cart.inc" class="btn btn-sm btn-outline-secondary" @click="cart.inc(it.key)">+</button>

            <button class="btn btn-sm btn-outline-danger" @click="cart.remove(it.key)">Entfernen</button>
          </div>
        </div>
      </div>

      <hr />

      <label class="form-label">Email (optional)</label>
      <input v-model="buyerEmail" class="form-control mb-2" placeholder="name@mail.com" />

      <label class="form-label">Kommentar (optional)</label>
      <textarea v-model="checkoutNote" class="form-control" rows="2"></textarea>

      <div class="mt-3"><strong>Total:</strong> {{ total.toFixed(2) }} €</div>

      <button class="btn btn-success mt-3" :disabled="submitting" @click="submitTransaction">
        {{ submitting ? "Sende..." : "Buchungen absenden" }}
      </button>

      <p v-if="ok" class="text-success mt-2">Transaktion gespeichert ✅</p>
      <p v-if="error" class="text-danger mt-2">{{ error }}</p>
    </div>
  </div>
</template>