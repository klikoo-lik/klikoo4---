// ================================================
// KLIKOO Store — Push Notifications (Frontend)
// ================================================
// ⚠️ Remplacer TOUTES les valeurs REMPLACER_* par ta config Firebase

const FIREBASE_CONFIG = {
  apiKey: "REMPLACER_API_KEY",
  authDomain: "REMPLACER.firebaseapp.com",
  projectId: "REMPLACER_PROJECT_ID",
  storageBucket: "REMPLACER.appspot.com",
  messagingSenderId: "REMPLACER_SENDER_ID",
  appId: "REMPLACER_APP_ID"
};

// ⚠️ Remplacer par ton VAPID Key depuis Firebase Console
const VAPID_KEY = "REMPLACER_VAPID_KEY";

let messaging = null;

async function initNotifications() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

  // Charger Firebase dynamiquement
  await loadFirebase();

  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  messaging = firebase.messaging();

  // Afficher bouton "Activer les notifications"
  showNotifButton();
}

function loadFirebase() {
  return new Promise(resolve => {
    if (window.firebase) return resolve();
    const scripts = [
      'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js'
    ];
    let loaded = 0;
    scripts.forEach(src => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => { if (++loaded === scripts.length) resolve(); };
      document.head.appendChild(s);
    });
  });
}

function showNotifButton() {
  // Ne pas afficher si déjà accepté
  if (localStorage.getItem('klikoo_notif') === 'granted') return;
  if (Notification.permission === 'denied') return;

  // Créer le bouton
  const btn = document.createElement('div');
  btn.id = 'notif-btn';
  btn.innerHTML = `
    <div style="
      position:fixed; bottom:80px; right:16px; z-index:9999;
      background:#ff8716; color:#fff; border-radius:16px;
      padding:12px 18px; cursor:pointer; box-shadow:0 4px 20px rgba(255,135,22,0.4);
      font-family:inherit; font-size:14px; display:flex; align-items:center; gap:10px;
      animation: slideIn 0.4s ease;
    ">
      <span style="font-size:20px">🔔</span>
      <div>
        <div style="font-weight:700">Activer les notifications</div>
        <div style="font-size:12px; opacity:0.9">Offre du jour à 16h chaque jour !</div>
      </div>
      <span id="notif-close" style="margin-left:8px; opacity:0.7; font-size:18px">✕</span>
    </div>
    <style>
      @keyframes slideIn { from { transform: translateX(120%); } to { transform: translateX(0); } }
    </style>
  `;

  document.body.appendChild(btn);

  btn.querySelector('#notif-close').addEventListener('click', e => {
    e.stopPropagation();
    btn.remove();
    localStorage.setItem('klikoo_notif', 'dismissed');
  });

  btn.addEventListener('click', async () => {
    btn.remove();
    await requestPermission();
  });
}

async function requestPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    // Récupérer FCM token
    const token = await messaging.getToken({ vapidKey: VAPID_KEY });
    if (token) {
      console.log('FCM Token:', token);
      localStorage.setItem('klikoo_notif', 'granted');
      localStorage.setItem('klikoo_fcm_token', token);

      // Envoyer token au serveur
      await saveTokenToServer(token);

      // Afficher confirmation
      showToast('🔔 Notifications activées ! Vous recevrez nos offres chaque matin.');
    }
  } catch (err) {
    console.error('Erreur notifications:', err);
  }
}

async function saveTokenToServer(token) {
  try {
    await fetch('/save-token.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, timestamp: Date.now() })
    });
  } catch (e) {
    // Fallback: sauvegarder dans localStorage seulement
    console.log('Token sauvegardé localement:', token);
  }
}

function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
    background:#1a1a1a; color:#fff; padding:12px 24px; border-radius:12px;
    z-index:99999; font-size:14px; box-shadow:0 4px 20px rgba(0,0,0,0.3);
    border-left:4px solid #ff8716; max-width:90vw; text-align:center;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

// Lancer au chargement
window.addEventListener('load', initNotifications);
