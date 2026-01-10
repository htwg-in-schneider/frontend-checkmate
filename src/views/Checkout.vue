<script setup>
import { ref, computed } from "vue"
import { useCartStore } from "@/stores/cart"
import { useAuth0 } from "@auth0/auth0-vue"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
const cart = useCartStore()
const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()

const items = computed(() => cart.items)
const total = computed(() => cart.total)

const submitting = ref(false)
const error = ref(null)
const ok = ref(false)

// Für euch optional: statt Shipping -> Kontakt/Kommentar
const checkoutNote = ref("")

async function submitOrder() {
  error.value = null
  ok.value = false
  submitting.value = true

  try {
    if (!isAuthenticated.value) {
      await loginWithRedirect({ appState: { target: "/checkout" } })
      return
    }

    const token = await getAccessTokenSilently()

    const payload = {
      items: cart.items,
      total: total.value,
      note: checkoutNote.value,
    }

    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`Backend ${res.status}: ${txt}`)
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

    <p v-if="items.length === 0">Warenkorb ist leer.</p>

    <div v-else>
      <h3>Deine Buchungen</h3>

      <div
        v-for="it in items"
        :key="it.key"
        class="border rounded p-2 mb-2"
      >
        <div class="d-flex justify-content-between">
          <div>
            <strong>{{ it.tutorName }}</strong>
            <div class="text-muted">
              {{ it.subject }} • {{ it.durationMinutes }} Min • Termin: {{ it.startAt }}
            </div>
            <div>Preis: {{ it.priceTotal }} € (x{{ it.qty }})</div>
            <div v-if="it.note" class="text-muted">Notiz: {{ it.note }}</div>
          </div>

          <div class="d-flex gap-2 align-items-start">
            <button class="btn btn-sm btn-outline-secondary" @click="cart.dec(it.key)">-</button>
            <button class="btn btn-sm btn-outline-secondary" @click="cart.inc(it.key)">+</button>
            <button class="btn btn-sm btn-outline-danger" @click="cart.remove(it.key)">Entfernen</button>
          </div>
        </div>
      </div>

      <hr />

      <label class="form-label">Kommentar (optional)</label>
      <textarea v-model="checkoutNote" class="form-control" rows="2" />

      <div class="mt-3"><strong>Total:</strong> {{ total.toFixed(2) }} €</div>

      <button class="btn btn-success mt-3" :disabled="submitting" @click="submitOrder">
        {{ submitting ? "Sende..." : "Buchungen absenden" }}
      </button>

      <p v-if="ok" class="text-success mt-2">Bestellung gesendet ✅</p>
      <p v-if="error" class="text-danger mt-2">{{ error }}</p>
    </div>
  </div>
</template>