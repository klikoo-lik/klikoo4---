# klikoo.ma — Deploy Guide

## Étape 1 — Deploy sur Vercel (gratuit)
1. Va sur vercel.com → "Add New Project"
2. Upload ce dossier ou connecte GitHub
3. Framework: "Other" (HTML statique)
4. Domain: ajoute klikoo.ma dans Settings > Domains

## Étape 2 — Cloudflare DNS
- Ajoute un CNAME: klikoo.ma → cname.vercel-dns.com

## Étape 3 — Android TWA avec Bubblewrap
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://klikoo.ma/manifest.json
bubblewrap build
```
Le APK sera dans: ./app-release-signed.apk

## Étape 4 — Fix assetlinks.json
Après build, copie le SHA256 de ton keystore:
keytool -list -v -keystore ./android.keystore
Puis remplace REMPLACER_PAR_VOTRE_SHA256_APK dans .well-known/assetlinks.json

## Étape 5 — Upload Play Store
- console.play.google.com
- Crée app → package: ma.klikoo.store
- Upload APK signé → $25 une fois
