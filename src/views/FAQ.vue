<template>
  <section class="faq">
    <h1 class="faq-title">FAQ</h1>
    <p class="faq-subtitle">Die häufigsten Fragen – kurz & easy beantwortet 💚</p>

    <details class="faq-item">
      <summary>
        <span>Was ist CheckMate? ♟️</span>
        <span class="chevron"></span>
      </summary>
      <div class="faq-body">
        CheckMate bringt Studierende und Tutor:innen zusammen, damit Lernen einfacher, persönlicher und effektiver wird 📚🤝
      </div>
    </details>

    <details class="faq-item">
      <summary>
        <span>Muss ich mich anmelden, um eine Stunde zu buchen? 🔐</span>
        <span class="chevron"></span>
      </summary>
      <div class="faq-body">
        Ja 😊 Damit deine Buchungen sicher gespeichert werden können, brauchst du ein Login (z.B. über Auth0).
      </div>
    </details>

    <details class="faq-item">
      <summary>
        <span>Wie buche ich eine Tutor-Stunde? 🗓️</span>
        <span class="chevron" ></span>
      </summary>
      <div class="faq-body">
        Öffne die Tutor:innen-Liste, klicke auf <strong>„Stunde buchen“</strong>, wähle Termin & Dauer aus und lege die Buchung in den Warenkorb 🛒
      </div>
    </details>

    <details class="faq-item">
      <summary>
        <span>Kann ich mehrere Stunden in den Warenkorb legen? 🛒</span>
        <span class="chevron" ></span>
      </summary>
      <div class="faq-body">
        Yes! Du kannst mehrere Buchungen hinzufügen und später gesammelt im Checkout absenden ✅
      </div>
    </details>

    <details class="faq-item">
      <summary>
        <span>Wie sehe ich den Preis? 💶</span>
        <span class="chevron" </span>
      </summary>
      <div class="faq-body">
        Im Buchungs-Modal siehst du den Stundenpreis und den Gesamtpreis (abhängig von der Dauer) sofort transparent ✨
      </div>
    </details>

    <details class="faq-item">
      <summary>
        <span>Kann ich meine Buchung wieder entfernen? 🧹</span>
        <span class="chevron"</span>
      </summary>
      <div class="faq-body">
        Klar 😊 Im Warenkorb kannst du Buchungen entfernen oder die Anzahl ändern.
      </div>
    </details>

    <details class="faq-item">
      <summary>
        <span>Wie kontaktiere ich euch? 💌</span>
        <span class="chevron" </span>
      </summary>
      <div class="faq-body">
        Über das Kontaktformular im Footer oder per Mail – wir freuen uns auf deine Nachricht! 🥰
      </div>
    </details>

    <details class="faq-item">
      <summary>
        <span>Gibt es schon echte Zahlungen? 💳</span>
        <span class="chevron" </span>
      </summary>
      <div class="faq-body">
        Aktuell ist es eine Basic-Demo ohne Payment & ohne Validierung – Fokus liegt auf Flow (Warenkorb → Checkout → Backend) ✅
      </div>
    </details>
  </section>
</template>

<style scoped>
.faq {
  width: min(92%, 900px);
  margin: 0 auto;
  padding: 2.5rem 1rem;
}

.faq-title {
  font-size: 2rem;
  margin-bottom: 0.25rem;
}

.faq-subtitle {
  opacity: 0.85;
  margin-bottom: 1.5rem;
}

.faq-item {
  background: #F3EFDF;
  border: 1px solid rgba(105,124,68,0.35);
  border-radius: 18px;
  padding: 0.9rem 1rem;
  margin-bottom: 0.9rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

.faq-item summary {
  list-style: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  font-weight: 600;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-body {
    background: #F3EFDF;
  margin-top: 0.8rem;
  line-height: 1.5;
}

.chevron {
  transition: transform 0.2s ease;
  opacity: 0.8;
}

.faq-item[open] .chevron {
  transform: rotate(180deg);
}


</style>