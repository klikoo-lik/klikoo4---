// ================================================
// KLIKOO — Notifications Anniversaires
// Cron: 0 11 * * * node notif-anniversaires.js
// (11h UTC = 12h Maroc UTC+1)
// ================================================

const admin = require('firebase-admin');
const fs    = require('fs');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(require('./serviceAccountKey.json')) });
}

const MESSAGES = [
  {
    titre: "🎂 عيد ميلاد سعيد من KLIKOO !",
    body : "كل عام وأنتم بخير 🌸 KLIKOO Store يتمنى لكم عيد ميلاد سعيد وكل عام وأنتم بألف خير 💛"
  },
  {
    titre: "🎉 Joyeux Anniversaire de KLIKOO !",
    body : "عيد ميلاد سعيد 🎂 كل عام وأنتم بخير — Toute l'équipe KLIKOO vous souhaite une belle journée 🌟"
  },
  {
    titre: "🌸 كل عام وأنتم بخير !",
    body : "بمناسبة عيد ميلادكم — KLIKOO Store يتمنى لكم يوماً سعيداً مليئاً بالفرح والسعادة 🎂✨"
  },
  {
    titre: "💛 عيد ميلاد سعيد من عائلة KLIKOO",
    body : "كل عام وأنتم بخير وبصحة وسعادة 🌺 نتمنى لكم يوماً جميلاً بمناسبة عيد ميلادكم 🎉"
  },
  {
    titre: "🎂 KLIKOO يحتفل معكم !",
    body : "عيد ميلاد سعيد 🎉 كل عام وأنتم بخير — يسعدنا أنكم من عائلة KLIKOO 💛🇲🇦"
  }
];

function getAnniversairesAujourdhui() {
  if (!fs.existsSync('./birthdays.json')) return [];
  const birthdays = JSON.parse(fs.readFileSync('./birthdays.json', 'utf8'));
  const today   = new Date();
  const todayMD = `${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  return birthdays.filter(b => b.dateNaissance && b.fcmToken && b.dateNaissance.slice(5) === todayMD);
}

async function main() {
  const clients = getAnniversairesAujourdhui();
  if (clients.length === 0) {
    console.log('🎂 Aucun anniversaire aujourd\'hui.');
    return;
  }

  console.log(`🎂 ${clients.length} anniversaire(s) aujourd'hui — envoi à 12h`);

  for (const client of clients) {
    const tmpl  = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    // Personnaliser avec le prénom
    const titre = tmpl.titre;
    const body  = `${client.prenom}، ${tmpl.body}`;

    try {
      await admin.messaging().send({
        token: client.fcmToken,
        notification: { title: titre, body },
        webpush: {
          notification: {
            title: titre,
            body,
            icon : 'https://klikoo.ma/icon-192x192.png',
            badge: 'https://klikoo.ma/icon-96x96.png',
            requireInteraction: true,
            vibrate: [300, 100, 300, 100, 300],
            actions: [{ action: 'open', title: '🛍️ klikoo.ma' }]
          },
          fcmOptions: { link: 'https://klikoo.ma/' }
        }
      });
      console.log(`✅ Anniversaire → ${client.prenom} (${client.email})`);
    } catch (err) {
      console.error(`❌ Erreur ${client.email}:`, err.message);
    }
  }

  console.log(`📅 ${new Date().toLocaleString('fr-MA')}`);
}

main().catch(console.error);
