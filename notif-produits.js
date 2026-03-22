// ================================================
// KLIKOO — Notifications Produit du Jour
// Cron: 0 15 * * * node notif-produits.js
// (15h UTC = 16h Maroc UTC+1)
// ================================================

const admin = require('firebase-admin');
const fs    = require('fs');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(require('./serviceAccountKey.json')) });
}

// ⚠️ Remplacer par tes vrais produits — 1 produit différent par jour
const PRODUITS = [
  { nom: "Écouteurs Bluetooth Pro",    prix: "299 DH", ancienPrix: "450 DH", image: "https://res.cloudinary.com/djagllief/image/upload/v1/produit1.jpg", url: "https://klikoo.ma/#products" },
  { nom: "Montre Connectée Sport",     prix: "499 DH", ancienPrix: "750 DH", image: "https://res.cloudinary.com/djagllief/image/upload/v1/produit2.jpg", url: "https://klikoo.ma/#products" },
  { nom: "Sac à Dos Imperméable",      prix: "189 DH", ancienPrix: "320 DH", image: "https://res.cloudinary.com/djagllief/image/upload/v1/produit3.jpg", url: "https://klikoo.ma/#products" },
  { nom: "Chargeur Rapide 65W",        prix: "149 DH", ancienPrix: "250 DH", image: "https://res.cloudinary.com/djagllief/image/upload/v1/produit4.jpg", url: "https://klikoo.ma/#products" },
  { nom: "Lampe LED Bureau",           prix: "129 DH", ancienPrix: "200 DH", image: "https://res.cloudinary.com/djagllief/image/upload/v1/produit5.jpg", url: "https://klikoo.ma/#products" },
  { nom: "Cafetière Turque Premium",   prix: "219 DH", ancienPrix: "380 DH", image: "https://res.cloudinary.com/djagllief/image/upload/v1/produit6.jpg", url: "https://klikoo.ma/#products" },
  { nom: "Parfum Oriental Oud",        prix: "349 DH", ancienPrix: "550 DH", image: "https://res.cloudinary.com/djagllief/image/upload/v1/produit7.jpg", url: "https://klikoo.ma/#products" }
];

const MESSAGES = [
  "🛍️ Offre de 16h — Produit du jour KLIKOO !",
  "⏰ 16h ! Votre deal quotidien vous attend 👇",
  "🔥 Offre exclusive — aujourd'hui seulement !",
  "💛 Produit du jour à prix choc !",
  "🎯 Votre offre quotidienne vient d'arriver !"
];

async function main() {
  let tokens = [];
  try { tokens = JSON.parse(fs.readFileSync('./tokens.json', 'utf8')); }
  catch (e) { console.log('tokens.json introuvable'); return; }
  if (!tokens.length) { console.log('Aucun abonné.'); return; }

  // Produit différent chaque jour (rotation par jour de l'année)
  const today     = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const produit   = PRODUITS[dayOfYear % PRODUITS.length];
  const titre     = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  const body      = `${produit.nom} — ${produit.prix} (au lieu de ${produit.ancienPrix})`;

  console.log(`📦 Produit du jour: ${produit.nom}`);
  console.log(`📤 Envoi à ${tokens.length} abonnés — 16h Maroc`);

  const batchSize = 500;
  let success = 0, failed = 0;

  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);
    try {
      const res = await admin.messaging().sendEachForMulticast({
        tokens: batch,
        notification: { title: titre, body, image: produit.image },
        webpush: {
          notification: {
            title: titre, body,
            icon : 'https://klikoo.ma/icon-192x192.png',
            badge: 'https://klikoo.ma/icon-96x96.png',
            image: produit.image,
            requireInteraction: false,
            vibrate: [200, 100, 200],
            actions: [{ action: 'open', title: '🛍️ Voir le produit' }]
          },
          fcmOptions: { link: produit.url }
        }
      });
      success += res.successCount;
      failed  += res.failureCount;

      const invalid = res.responses.map((r,i) => (!r.success && r.error?.code==='messaging/registration-token-not-registered') ? batch[i] : null).filter(Boolean);
      if (invalid.length) {
        fs.writeFileSync('./tokens.json', JSON.stringify(tokens.filter(t=>!invalid.includes(t)), null, 2));
        console.log(`🧹 ${invalid.length} tokens supprimés`);
      }
    } catch (err) { console.error('Erreur batch:', err.message); }
  }

  console.log(`📦 ${produit.nom} → ✅ ${success} | ❌ ${failed}`);
  console.log(`📅 ${new Date().toLocaleString('fr-MA')}`);
}

main().catch(console.error);
