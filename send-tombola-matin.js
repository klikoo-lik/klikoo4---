// ================================================
// KLIKOO Store — Tombola Notification 10h Sbah
// Cron: 0 9 * * * node send-tombola-matin.js
// (9h UTC = 10h Maroc UTC+1)
// Kaytlaq kull yom 10h — mais kaydir chi haja ghi
// f 1er du mois, avant-dernier jour, o dernier jour
// ================================================

const admin = require('firebase-admin');
const fs    = require('fs');

if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

function getTombolaEvent() {
  const today   = new Date();
  const day     = today.getDate();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  if (day === 1)             return 'inscription';
  if (day === lastDay - 1)   return 'rappel';
  if (day === lastDay)       return 'tirage';
  return null;
}

const MESSAGES = {
  inscription: {
    titre : "🎰 Tombola KLIKOO — C'est parti !",
    body  : "Nouveau mois, nouvelle tombola ! Chaque achat = 1 ticket 🎟️ Gagnez 2000 DH ce mois-ci !",
    action: "🎟️ Je participe !"
  },
  rappel: {
    titre : "⏰ Demain c'est le tirage — 2000 DH !",
    body  : "Dernière chance ! Commandez aujourd'hui pour avoir vos tickets avant le tirage 🎰",
    action: "🛍️ Commander maintenant"
  },
  tirage: {
    titre : "🎰 TIRAGE AU SORT CE SOIR — 2000 DH !",
    body  : "Le grand jour est arrivé ! Le gagnant sera annoncé ce soir sur klikoo.ma 🍀 Bonne chance !",
    action: "🏆 Voir le tirage"
  }
};

async function main() {
  const event = getTombolaEvent();
  if (!event) {
    console.log("Pas d'événement tombola aujourd'hui.");
    return;
  }

  let tokens = [];
  try {
    tokens = JSON.parse(fs.readFileSync('./tokens.json', 'utf8'));
  } catch (e) {
    console.log('tokens.json introuvable');
    return;
  }

  if (tokens.length === 0) {
    console.log('Aucun abonné.');
    return;
  }

  const msg = MESSAGES[event];
  console.log(`🎰 Envoi tombola (${event}) à ${tokens.length} abonnés — 10h Maroc`);

  const batchSize = 500;
  let success = 0, failed = 0;

  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);
    try {
      const res = await admin.messaging().sendEachForMulticast({
        tokens: batch,
        notification: { title: msg.titre, body: msg.body },
        webpush: {
          notification: {
            title: msg.titre,
            body: msg.body,
            icon : 'https://klikoo.ma/icon-192x192.png',
            badge: 'https://klikoo.ma/icon-96x96.png',
            image: 'https://klikoo.ma/icon-512x512.png',
            requireInteraction: true,
            vibrate: [300, 100, 300, 100, 300],
            actions: [
              { action: 'open',  title: msg.action },
              { action: 'close', title: 'Plus tard' }
            ]
          },
          fcmOptions: { link: 'https://klikoo.ma/tombola.html' }
        }
      });
      success += res.successCount;
      failed  += res.failureCount;

      // Nettoyer tokens invalides
      const invalid = [];
      res.responses.forEach((r, idx) => {
        if (!r.success && r.error?.code === 'messaging/registration-token-not-registered') {
          invalid.push(batch[idx]);
        }
      });
      if (invalid.length) {
        const cleaned = tokens.filter(t => !invalid.includes(t));
        fs.writeFileSync('./tokens.json', JSON.stringify(cleaned, null, 2));
        console.log(`🧹 ${invalid.length} tokens supprimés`);
      }
    } catch (err) {
      console.error('Erreur:', err.message);
    }
  }

  console.log(`✅ Succès: ${success} | ❌ Échecs: ${failed}`);
  console.log(`📅 ${new Date().toLocaleString('fr-MA')}`);
}

main().catch(console.error);
