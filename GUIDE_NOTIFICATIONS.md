# 🔔 KLIKOO — Guide Notifications Push (Gratuit)
## Firebase Cloud Messaging — Kull yom s-sba7 automatique

---

## ÉTAPE 1 — Créer projet Firebase (5 min)

1. Dkhl: **console.firebase.google.com**
2. Click **"Ajouter un projet"**
3. Nom: `klikoo-store`
4. Désactiver Google Analytics (optionnel)
5. Click **"Créer le projet"** ✅

---

## ÉTAPE 2 — Activer Web App (3 min)

1. F la page projet → Click icône **`</>`** (Web)
2. Nom: `klikoo-web`
3. Click **"Enregistrer l'application"**
4. **Copier la config** qui ressemble à:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "klikoo-store.firebaseapp.com",
  projectId: "klikoo-store",
  storageBucket: "klikoo-store.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

5. Coller cette config dans **2 fichiers**:
   - `sw.js` → remplacer `FIREBASE_CONFIG`
   - `notifications.js` → remplacer `FIREBASE_CONFIG`

---

## ÉTAPE 3 — Récupérer la clé VAPID (2 min)

1. Firebase Console → **Paramètres du projet** (roue dentée)
2. Onglet **"Cloud Messaging"**
3. Section **"Certificats push Web"**
4. Click **"Générer une paire de clés"**
5. Copier la **Clé publique** (VAPID Key)
6. Coller dans `notifications.js` → `VAPID_KEY`

---

## ÉTAPE 4 — Ajouter notifications.js au site (2 min)

Ouvrir `index.html` et ajouter AVANT `</body>`:

```html
<script src="/notifications.js"></script>
```

Faire pareil pour: `about.html`, `blog.html`, `contact.html`, `wishlist.html`

---

## ÉTAPE 5 — Uploader les fichiers modifiés

Uploader sur GitHub (puis sync CapConnect):
- `sw.js` ← modifié
- `notifications.js` ← nouveau
- `save-token.php` ← nouveau
- `index.html` ← modifié (+ autres .html)

---

## ÉTAPE 6 — Configurer l'envoi automatique (cron job)

### A) Sur ton PC/serveur local:
```bash
# Installer Node.js puis:
npm install firebase-admin

# Télécharger clé service depuis Firebase:
# Paramètres → Comptes de service → Générer une clé privée
# Sauvegarder comme: serviceAccountKey.json

# Tester manuellement:
node send-notifications.js
```

### B) Cron job (kull yom 9h du matin):
```bash
# Ouvrir crontab:
crontab -e

# Ajouter cette ligne:
0 15 * * * cd /chemin/vers/klikoo && node send-notifications.js >> /tmp/klikoo-notif.log 2>&1
```

### C) Alternative GRATUITE — GitHub Actions:
Créer fichier `.github/workflows/daily-notif.yml` dans ton repo:

```yaml
name: Daily Notifications
on:
  schedule:
    - cron: '0 15 * * *'  # 16h Maroc (UTC+1 = 15h UTC)
  workflow_dispatch:      # permet de lancer manuellement

jobs:
  send:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install firebase-admin
      - run: node send-notifications.js
        env:
          FIREBASE_KEY: ${{ secrets.FIREBASE_SERVICE_KEY }}
```

---

## ÉTAPE 7 — Mettre à jour les produits

Ouvrir `send-notifications.js` → section `PRODUITS`
Remplacer par tes vrais produits avec:
- `nom` — nom du produit
- `prix` — prix actuel
- `ancienPrix` — ancien prix (barré)
- `image` — URL image Cloudinary
- `url` — lien direct produit

---

## ✅ Résultat final

```
Client visite klikoo.ma
       ↓
Popup "Activer notifications" apparaît
       ↓
Client accepte → token sauvegardé dans tokens.json
       ↓
Chaque soir à 16h → cron lance send-notifications.js
       ↓
Notification push sur téléphone client 📱
"☀️ Écouteurs Bluetooth — 299 DH (au lieu de 450 DH)"
       ↓
Client clique → arrive sur klikoo.ma 🛍️
```

---

## 💰 Coût total: 0 DH/mois
- Firebase: gratuit jusqu'à 500k messages/mois ✅
- GitHub Actions: gratuit 2000 min/mois ✅
- Hosting CapConnect: déjà payé ✅

---

## 🎰 TOMBOLA — Configuration Cron

### 2 cron jobs à configurer:

```bash
# Notifications quotidiennes 16h (produit + fêtes + anniversaires)
0 15 * * * cd /chemin/klikoo && node send-notifications.js >> /tmp/klikoo.log 2>&1

# Tombola 10h sbah (1er du mois, avant-dernier, dernier jour)
0 9 * * * cd /chemin/klikoo && node send-tombola-matin.js >> /tmp/klikoo-tombola.log 2>&1
```

### Planning tombola automatique:
| Jour | Heure | Message |
|------|-------|---------|
| 1er du mois | 10h | 🎰 Tombola ouverte — inscription ! |
| Avant-dernier jour | 10h | ⏰ Dernière chance — tirage demain ! |
| Dernier jour | 10h | 🎰 TIRAGE AU SORT CE SOIR ! |
| Dernier jour | 16h | 🎰 Rappel tirage ce soir ! |

