// ================================================
// KLIKOO Store — Notifications Quotidiennes + Fêtes Islamiques
// Cron: 0 15 * * * node send-notifications.js  (16h Maroc)
// ================================================

const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// ================================================
// PRODUITS — Remplacer par tes vrais produits
// ================================================
const PRODUITS = [
  {
    nom: "Écouteurs Bluetooth Pro",
    prix: "299 DH", ancienPrix: "450 DH",
    image: "https://res.cloudinary.com/djagllief/image/upload/v1/produit1.jpg",
    url: "https://klikoo.ma/#products"
  },
  {
    nom: "Montre Connectée Sport",
    prix: "499 DH", ancienPrix: "750 DH",
    image: "https://res.cloudinary.com/djagllief/image/upload/v1/produit2.jpg",
    url: "https://klikoo.ma/#products"
  },
  {
    nom: "Sac à Dos Imperméable",
    prix: "189 DH", ancienPrix: "320 DH",
    image: "https://res.cloudinary.com/djagllief/image/upload/v1/produit3.jpg",
    url: "https://klikoo.ma/#products"
  },
  {
    nom: "Chargeur Rapide 65W",
    prix: "149 DH", ancienPrix: "250 DH",
    image: "https://res.cloudinary.com/djagllief/image/upload/v1/produit4.jpg",
    url: "https://klikoo.ma/#products"
  },
  {
    nom: "Lampe LED Bureau",
    prix: "129 DH", ancienPrix: "200 DH",
    image: "https://res.cloudinary.com/djagllief/image/upload/v1/produit5.jpg",
    url: "https://klikoo.ma/#products"
  },
  {
    nom: "Cafetière Turque Premium",
    prix: "219 DH", ancienPrix: "380 DH",
    image: "https://res.cloudinary.com/djagllief/image/upload/v1/produit6.jpg",
    url: "https://klikoo.ma/#products"
  },
  {
    nom: "Parfum Oriental Oud",
    prix: "349 DH", ancienPrix: "550 DH",
    image: "https://res.cloudinary.com/djagllief/image/upload/v1/produit7.jpg",
    url: "https://klikoo.ma/#products"
  }
];

// ================================================
// FÊTES ISLAMIQUES — Dates Hijri converties en Grégorien
// ⚠️ Mettre à jour chaque année !
// ================================================
const FETES_ISLAMIQUES = [
  // Ramadan 2025 (approximatif — ajuster selon l'annonce officielle)
  {
    nom: "Ramadan Kareem",
    debut: "2026-02-18", fin: "2026-03-19",
    titre: "رمضان كريم 🌙",
    message: "كل عام وأنتم بخير — Ramadan Moubarak à tous nos clients ! Des offres spéciales Ramadan vous attendent 🌙✨",
    emoji: "🌙",
    offre: "Offres Spéciales Ramadan — jusqu'à 40% de réduction !"
  },
  // Eid Al-Fitr 2026
  {
    nom: "Eid Al-Fitr",
    debut: "2026-03-20", fin: "2026-03-22",
    titre: "عيد الفطر المبارك 🎉",
    message: "تقبل الله منا ومنكم — Aïd Moubarak ! Profitez de nos offres spéciales Aïd Al-Fitr 🎊",
    emoji: "🎉",
    offre: "Cadeaux Aïd Al-Fitr — Livraison express 24h !"
  },
  // Eid Al-Adha 2026
  {
    nom: "Eid Al-Adha",
    debut: "2026-05-27", fin: "2026-05-29",
    titre: "عيد الأضحى المبارك 🐑",
    message: "تقبل الله منا ومنكم — Aïd Al-Adha Moubarak ! 🐑 De belles offres pour célébrer ensemble",
    emoji: "🐑",
    offre: "Offres Aïd Al-Adha — Commandez avant la fête !"
  },
  // Mawlid An-Nabawi 2026
  {
    nom: "Mawlid An-Nabawi",
    debut: "2026-09-04", fin: "2026-09-05",
    titre: "المولد النبوي الشريف ﷺ",
    message: "بمناسبة المولد النبوي الشريف — كل عام وأنتم بخير 🌹 Des offres spéciales pour cette occasion bénie",
    emoji: "🌹",
    offre: "Offres Mawlid — Produits sélectionnés à prix spécial !"
  },
  // Ras As-Sana Al-Hijria 2026
  {
    nom: "Ras As-Sana Al-Hijria",
    debut: "2026-07-17", fin: "2026-07-18",
    titre: "رأس السنة الهجرية 🌙",
    message: "كل عام وأنتم بخير بمناسبة رأس السنة الهجرية الجديدة 🌙 عام مبارك وسعيد",
    emoji: "🌙",
    offre: "Bonne Année Hijri — Offres de célébration !"
  },
  // Laylat Al-Qadr (27 Ramadan 2026)
  {
    nom: "Laylat Al-Qadr",
    debut: "2026-03-14", fin: "2026-03-15",
    titre: "ليلة القدر 🌟",
    message: "ليلة القدر خير من ألف شهر 🌟 تقبل الله دعاءكم وطاعتكم في هذه الليلة المباركة",
    emoji: "🌟",
    offre: "Nuit du Destin — Offres bénies jusqu'à l'aube !"
  },
  // Fête du Trône Maroc
  {
    nom: "Fête du Trône",
    debut: "2026-07-30", fin: "2026-07-31",
    titre: "عيد العرش المجيد 🇲🇦",
    message: "بمناسبة عيد العرش المجيد — كل عام والمغرب بألف خير 🇲🇦 KLIKOO Store يهنئ جميع المغاربة",
    emoji: "🇲🇦",
    offre: "Fête du Trône — Promotions Made in Morocco !"
  },
  // Fête de l'Indépendance Maroc
  {
    nom: "Fête de l'Indépendance",
    debut: "2026-11-18", fin: "2026-11-19",
    titre: "عيد الاستقلال 🇲🇦",
    message: "بمناسبة عيد الاستقلال — كل عام والمغرب بألف خير 🇲🇦 فخورون بوطننا الحبيب",
    emoji: "🇲🇦",
    offre: "Vive l'Indépendance — Offres spéciales !"
  }
];


// ================================================
// ANNIVERSAIRES CLIENTS
// ================================================
function getAnniversairesAujourdhui() {
  const birthdaysFile = './birthdays.json';
  if (!fs.existsSync(birthdaysFile)) return [];

  const birthdays = JSON.parse(fs.readFileSync(birthdaysFile, 'utf8'));
  const today = new Date();
  const todayMD = `${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  return birthdays.filter(b => {
    if (!b.dateNaissance || !b.fcmToken) return false;
    const bMD = b.dateNaissance.slice(5); // MM-DD
    return bMD === todayMD;
  });
}

const MESSAGES_ANNIVERSAIRE = [
  { titre: "🎂 Joyeux Anniversaire de KLIKOO !", body: "Mabrouk {prenom} ! 🎉 Votre boutique préférée vous souhaite un joyeux anniversaire ! 🎁 -20% sur toute la boutique aujourd'hui !" },
  { titre: "🎉 Bon Anniversaire {prenom} !", body: "عيد ميلاد سعيد 🎂 KLIKOO Store vous offre -20% aujourd'hui pour votre anniversaire !" },
  { titre: "🎁 Surprise Anniversaire KLIKOO !", body: "Mabrouk {prenom} 🥳 Un cadeau vous attend sur klikoo.ma — -20% toute la journée !" }
];

// ================================================
// MESSAGES QUOTIDIENS
// ================================================
const MESSAGES_SOIR = [
  "🛍️ Offre de 16h — Produit du jour KLIKOO !",
  "⏰ 16h ! Votre deal quotidien vous attend 👇",
  "🔥 Offre exclusive — aujourd'hui seulement !",
  "💛 Produit du jour à prix choc !",
  "🎯 Votre offre quotidienne vient d'arriver !"
];


// ================================================
// TOMBOLA — Fin de mois (2000 DH)
// ================================================

// Messages tombola inscription (10h sbah)
const MESSAGES_TOMBOLA_INSCRIPTION = [
  { titre: "🎰 Tombola KLIKOO — Inscrivez-vous !", body: "Tentez de gagner 2000 DH ! L'inscription se ferme ce soir. Chaque achat = 1 ticket 🎟️" },
  { titre: "🏆 2000 DH à gagner ce mois !", body: "La tombola KLIKOO est ouverte ! Inscrivez-vous maintenant — tirage fin du mois 🎰" },
  { titre: "🎟️ Votre chance de gagner 2000 DH !", body: "Tombola mensuelle KLIKOO — chaque achat vous donne un ticket. Inscrivez-vous !" }
];

// Messages tombola rappel (J-1)
const MESSAGES_TOMBOLA_RAPPEL = [
  { titre: "⏰ Dernière chance — Tombola KLIKOO !", body: "Le tirage est DEMAIN ! Achetez avant minuit pour avoir vos tickets 🎟️ 2000 DH en jeu !" },
  { titre: "🔥 J-1 avant le tirage — 2000 DH !", body: "Demain on tire au sort le gagnant KLIKOO ! Commandez maintenant pour participer 🎰" }
];

// Messages tombola tirage (dernier jour du mois)
const MESSAGES_TOMBOLA_TIRAGE = [
  { titre: "🎰 TIRAGE AU SORT — Tombola KLIKOO !", body: "C'est aujourd'hui ! Le gagnant des 2000 DH sera annoncé ce soir. Bonne chance à tous ! 🍀" },
  { titre: "🏆 Jour du Tirage — 2000 DH !", body: "Le grand tirage KLIKOO a lieu ce soir ! Vérifiez votre téléphone 📱 Bonne chance !" }
];

function getTombolaEvent() {
  const today = new Date();
  const day = today.getDate();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  if (day === 1)        return 'inscription';   // 1er du mois → inscription ouverte
  if (day === lastDay - 1) return 'rappel';     // Avant-dernier jour → rappel
  if (day === lastDay)  return 'tirage';        // Dernier jour → tirage
  return null;
}

async function envoyerTombola(tokens, type) {
  let msgs;
  if (type === 'inscription') msgs = MESSAGES_TOMBOLA_INSCRIPTION;
  else if (type === 'rappel') msgs = MESSAGES_TOMBOLA_RAPPEL;
  else msgs = MESSAGES_TOMBOLA_TIRAGE;

  const tmpl = msgs[Math.floor(Math.random() * msgs.length)];

  const batchSize = 500;
  let success = 0;
  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);
    try {
      const res = await admin.messaging().sendEachForMulticast({
        tokens: batch,
        notification: { title: tmpl.titre, body: tmpl.body },
        webpush: {
          notification: {
            title: tmpl.titre,
            body: tmpl.body,
            icon: 'https://klikoo.ma/icon-192x192.png',
            badge: 'https://klikoo.ma/icon-96x96.png',
            requireInteraction: true,
            vibrate: [300, 100, 300, 100, 300],
            image: 'https://klikoo.ma/icon-512x512.png',
            actions: [{ action: 'open', title: '🎟️ Participer maintenant' }]
          },
          fcmOptions: { link: 'https://klikoo.ma/tombola.html' }
        }
      });
      success += res.successCount;
    } catch (err) {
      console.error('Erreur tombola batch:', err.message);
    }
  }
  console.log(`🎰 Tombola (${type}) → ${success} notifications envoyées`);
}

// ================================================
// LOGIQUE PRINCIPALE
// ================================================
function getFeteAujourdhui() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  for (const fete of FETES_ISLAMIQUES) {
    if (todayStr >= fete.debut && todayStr <= fete.fin) {
      return fete;
    }
  }
  return null;
}

async function envoyerNotifications() {
  let tokens = [];
  try {
    const data = fs.readFileSync('./tokens.json', 'utf8');
    tokens = JSON.parse(data);
  } catch (e) {
    fs.writeFileSync('./tokens.json', '[]');
    console.log('tokens.json créé — aucun abonné encore.');
    return;
  }

  if (tokens.length === 0) {
    console.log('Aucun abonné pour le moment.');
    return;
  }

  // 0️⃣ Vérifier tombola fin de mois
  const tombolaEvent = getTombolaEvent();
  if (tombolaEvent) {
    console.log(`🎰 Tombola event: ${tombolaEvent}`);
    await envoyerTombola(tokens, tombolaEvent);
  }

  // 1️⃣ Vérifier anniversaires clients → envoyer message personnalisé
  const anniversaires = getAnniversairesAujourdhui();
  for (const client of anniversaires) {
    const tmpl = MESSAGES_ANNIVERSAIRE[Math.floor(Math.random() * MESSAGES_ANNIVERSAIRE.length)];
    const titre = tmpl.titre.replace('{prenom}', client.prenom);
    const body  = tmpl.body.replace('{prenom}', client.prenom);
    try {
      await admin.messaging().send({
        token: client.fcmToken,
        notification: { title: titre, body },
        webpush: {
          notification: {
            title: titre, body,
            icon: 'https://klikoo.ma/icon-192x192.png',
            badge: 'https://klikoo.ma/icon-96x96.png',
            requireInteraction: true,
            vibrate: [300, 100, 300, 100, 300],
            actions: [{ action: 'open', title: '🎁 Voir mon cadeau' }]
          },
          fcmOptions: { link: 'https://klikoo.ma/#products' }
        }
      });
      console.log(`🎂 Anniversaire envoyé à ${client.prenom} (${client.email})`);
    } catch (err) {
      console.error(`Erreur anniversaire ${client.email}:`, err.message);
    }
  }

  // 2️⃣ Vérifier si c'est un jour de fête
  const fete = getFeteAujourdhui();

  let notification, data, logMsg;

  if (fete) {
    // === MESSAGE DE FÊTE ===
    console.log(`🎊 Aujourd'hui: ${fete.nom}`);
    notification = {
      title: fete.titre,
      body: fete.message,
      image: 'https://klikoo.ma/icon-512x512.png'
    };
    data = {
      url: 'https://klikoo.ma/#products',
      type: 'fete',
      fete: fete.nom
    };
    logMsg = `🎊 Notification fête: ${fete.nom}`;
  } else {
    // === MESSAGE PRODUIT QUOTIDIEN ===
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const produit = PRODUITS[dayOfYear % PRODUITS.length];
    const message = MESSAGES_SOIR[Math.floor(Math.random() * MESSAGES_SOIR.length)];

    console.log(`📦 Produit du jour: ${produit.nom}`);
    notification = {
      title: message,
      body: `${produit.nom} — ${produit.prix} (au lieu de ${produit.ancienPrix})`,
      image: produit.image
    };
    data = {
      url: produit.url,
      prix: produit.prix,
      type: 'produit'
    };
    logMsg = `📦 Notification produit: ${produit.nom}`;
  }

  console.log(`📤 Envoi à ${tokens.length} abonnés...`);

  const batchSize = 500;
  let success = 0, failed = 0;

  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);
    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: batch,
        notification,
        data,
        webpush: {
          notification: {
            ...notification,
            icon: 'https://klikoo.ma/icon-192x192.png',
            badge: 'https://klikoo.ma/icon-96x96.png',
            requireInteraction: fete ? true : false,
            vibrate: [200, 100, 200],
            actions: [{ action: 'open', title: fete ? '🎊 Voir les offres' : '🛍️ Voir le produit' }]
          },
          fcmOptions: { link: data.url }
        }
      });

      success += response.successCount;
      failed += response.failureCount;

      // Supprimer tokens invalides
      const invalidTokens = [];
      response.responses.forEach((r, idx) => {
        if (!r.success && r.error?.code === 'messaging/registration-token-not-registered') {
          invalidTokens.push(batch[idx]);
        }
      });
      if (invalidTokens.length > 0) {
        const cleaned = tokens.filter(t => !invalidTokens.includes(t));
        fs.writeFileSync('./tokens.json', JSON.stringify(cleaned, null, 2));
        console.log(`🧹 ${invalidTokens.length} tokens invalides supprimés`);
      }
    } catch (err) {
      console.error('Erreur batch:', err.message);
    }
  }

  console.log(`${logMsg}`);
  console.log(`✅ Succès: ${success} | ❌ Échecs: ${failed}`);
  console.log(`📅 ${new Date().toLocaleString('fr-MA')}`);
}

envoyerNotifications().catch(console.error);
