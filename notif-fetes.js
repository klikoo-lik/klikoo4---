// ================================================
// KLIKOO — Notifications Fêtes Islamiques + Nationales
// Cron: 0 8 * * * node notif-fetes.js
// (8h UTC = 9h Maroc UTC+1)
// ================================================

const admin = require('firebase-admin');
const fs    = require('fs');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(require('./serviceAccountKey.json')) });
}

// ⚠️ Mettre à jour les dates chaque année !
const FETES = [
  {
    nom: "Ramadan Kareem",
    debut: "2026-02-18", fin: "2026-03-19",
    titre: "رمضان كريم 🌙",
    body : "كل عام وأنتم بخير — Ramadan Moubarak ! Des offres spéciales Ramadan vous attendent 🌙✨",
    url  : "https://klikoo.ma/#products"
  },
  {
    nom: "Eid Al-Fitr",
    debut: "2026-03-20", fin: "2026-03-22",
    titre: "عيد الفطر المبارك 🎉",
    body : "تقبل الله منا ومنكم — Aïd Moubarak ! Profitez de nos offres spéciales Aïd Al-Fitr 🎊",
    url  : "https://klikoo.ma/#products"
  },
  {
    nom: "Laylat Al-Qadr",
    debut: "2026-03-14", fin: "2026-03-15",
    titre: "ليلة القدر 🌟",
    body : "ليلة القدر خير من ألف شهر 🌟 تقبل الله دعاءكم وطاعتكم في هذه الليلة المباركة",
    url  : "https://klikoo.ma/#products"
  },
  {
    nom: "Eid Al-Adha",
    debut: "2026-05-27", fin: "2026-05-29",
    titre: "عيد الأضحى المبارك 🐑",
    body : "تقبل الله منا ومنكم — Aïd Al-Adha Moubarak ! 🐑 De belles offres pour célébrer ensemble",
    url  : "https://klikoo.ma/#products"
  },
  {
    nom: "Ras As-Sana Al-Hijria",
    debut: "2026-07-17", fin: "2026-07-18",
    titre: "رأس السنة الهجرية 🌙",
    body : "كل عام وأنتم بخير بمناسبة رأس السنة الهجرية الجديدة 🌙 عام مبارك وسعيد",
    url  : "https://klikoo.ma/#products"
  },
  {
    nom: "Mawlid An-Nabawi",
    debut: "2026-09-04", fin: "2026-09-05",
    titre: "المولد النبوي الشريف ﷺ",
    body : "بمناسبة المولد النبوي الشريف — كل عام وأنتم بخير 🌹 Des offres spéciales pour cette occasion bénie",
    url  : "https://klikoo.ma/#products"
  },
  {
    nom: "Fête du Trône",
    debut: "2026-07-30", fin: "2026-07-31",
    titre: "عيد العرش المجيد 🇲🇦",
    body : "بمناسبة عيد العرش المجيد — كل عام والمغرب بألف خير 🇲🇦 KLIKOO Store يهنئ جميع المغاربة",
    url  : "https://klikoo.ma/#products"
  },
  {
    nom: "Fête de l'Indépendance",
    debut: "2026-11-18", fin: "2026-11-19",
    titre: "عيد الاستقلال 🇲🇦",
    body : "بمناسبة عيد الاستقلال — كل عام والمغرب بألف خير 🇲🇦 فخورون بوطننا الحبيب",
    url  : "https://klikoo.ma/#products"
  }
];

function getFeteAujourdhui() {
  const todayStr = new Date().toISOString().split('T')[0];
  return FETES.find(f => todayStr >= f.debut && todayStr <= f.fin) || null;
}

async function main() {
  const fete = getFeteAujourdhui();
  if (!fete) { console.log('📅 Pas de fête aujourd\'hui.'); return; }

  let tokens = [];
  try { tokens = JSON.parse(fs.readFileSync('./tokens.json', 'utf8')); }
  catch (e) { console.log('tokens.json introuvable'); return; }
  if (!tokens.length) { console.log('Aucun abonné.'); return; }

  console.log(`🎊 Fête: ${fete.nom} — envoi à ${tokens.length} abonnés (9h Maroc)`);

  const batchSize = 500;
  let success = 0, failed = 0;

  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);
    try {
      const res = await admin.messaging().sendEachForMulticast({
        tokens: batch,
        notification: { title: fete.titre, body: fete.body, image: 'https://klikoo.ma/icon-512x512.png' },
        webpush: {
          notification: {
            title: fete.titre, body: fete.body,
            icon : 'https://klikoo.ma/icon-192x192.png',
            badge: 'https://klikoo.ma/icon-96x96.png',
            image: 'https://klikoo.ma/icon-512x512.png',
            requireInteraction: true,
            vibrate: [300, 100, 300, 100, 300],
            actions: [{ action: 'open', title: '🎊 Voir les offres' }]
          },
          fcmOptions: { link: fete.url }
        }
      });
      success += res.successCount;
      failed  += res.failureCount;

      // Nettoyer tokens invalides
      const invalid = res.responses.map((r,i) => (!r.success && r.error?.code==='messaging/registration-token-not-registered') ? batch[i] : null).filter(Boolean);
      if (invalid.length) {
        fs.writeFileSync('./tokens.json', JSON.stringify(tokens.filter(t=>!invalid.includes(t)), null, 2));
        console.log(`🧹 ${invalid.length} tokens supprimés`);
      }
    } catch (err) { console.error('Erreur batch:', err.message); }
  }

  console.log(`🎊 ${fete.nom} → ✅ ${success} | ❌ ${failed}`);
  console.log(`📅 ${new Date().toLocaleString('fr-MA')}`);
}

main().catch(console.error);
