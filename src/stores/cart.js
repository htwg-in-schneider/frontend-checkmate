import { defineStore } from "pinia"

const LS_KEY = "checkmate_cart_v1"

function loadFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : { items: [] }
  } catch {
    return { items: [] }
  }
}

function saveToLS(state) {
  localStorage.setItem(LS_KEY, JSON.stringify({ items: state.items }))
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: loadFromLS().items, // Array of booking-drafts
  }),

  getters: {
    count: (s) => s.items.reduce((sum, it) => sum + (it.qty ?? 1), 0),
    total: (s) =>
      s.items.reduce((sum, it) => sum + (Number(it.priceTotal) || 0) * (it.qty ?? 1), 0),
  },

  actions: {
    addBooking(draft) {
      // Wenn gleicher Tutor + gleicher Termin + gleiche Dauer -> qty erhöhen
      const key = `${draft.tutorId}|${draft.startAt}|${draft.durationMinutes}`
      const existing = this.items.find((x) => x.key === key)

      if (existing) {
        existing.qty = (existing.qty ?? 1) + 1
      } else {
        this.items.push({ ...draft, key, qty: 1 })
      }
      saveToLS(this.$state)
    },

    inc(key) {
      const it = this.items.find((x) => x.key === key)
      if (it) it.qty = (it.qty ?? 1) + 1
      saveToLS(this.$state)
    },

    dec(key) {
      const it = this.items.find((x) => x.key === key)
      if (!it) return
      it.qty = (it.qty ?? 1) - 1
      if (it.qty <= 0) this.items = this.items.filter((x) => x.key !== key)
      saveToLS(this.$state)
    },

    remove(key) {
      this.items = this.items.filter((x) => x.key !== key)
      saveToLS(this.$state)
    },

    clear() {
      this.items = []
      saveToLS(this.$state)
    },
  },
})