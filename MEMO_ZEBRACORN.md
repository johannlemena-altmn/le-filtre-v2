# Fiche mémo — porter « Capturer » (Le Filtre) dans Zebracorn

*Handoff de session. À ouvrir dans la discussion **Zebracorn** pour continuer la
construction au bon endroit. Objectif : intégrer la brique **Capturer** de Le Filtre dans
Zebracorn, puis y faire **converger** le reste — Le Filtre v2 servira de prototype de
référence, à **supprimer ensuite**.*

> Pour qui lit ça à froid : Le Filtre v2 est un prototype local-first (HTML + React via
> Babel CDN + IndexedDB/Dexie, zéro build). Tout son code et ses décisions sont dans le
> repo `le-filtre-v2` (`BRIEF_PIVOT.md`, `SCHEMA.md`, `BRIEF_BUILD.md`,
> `JOURNAL_CONSTRUCTION.md`). Cette fiche résume **ce qui doit voyager vers Zebracorn**.

---

## 1. Le problème que « Capturer » résout (à ne pas perdre en route)

Johann n'a pas un problème d'information — il a un problème **d'intention perdue**. Entre le
moment où une idée le traverse et celui où il voudrait y revenir, le **pourquoi** s'évapore.
Sans le pourquoi, impossible de relier → impossible d'aller au bout → aucune habitude.

**La règle d'or de la capture** : on ne capture jamais une ressource seule. On capture
**une ressource + la ligne d'intention** (« pourquoi ça compte »). Cette ligne est
**obligatoire**. C'est *tout* le geste. Si Zebracorn ne reprend qu'une chose, c'est ça.

---

## 2. La brique « Capturer » — spéc à porter

**Promesse** : le geste tient en **~10 secondes**, depuis n'importe où dans l'app.

**4 modes de capture** (un seul champ change selon le mode) :
- **Texte** — note, pensée, titre de livre. Affiche un indicateur *« ≈ X min de lecture »*.
- **Lien** — URL (+ titre optionnel) : article, vidéo.
- **Audio** — dictée vocale via Web Speech API (transcription en direct, `fr-FR`).
- **Fichier** — PDF / image. Pour un PDF lourd : **ne pas tout avaler** — extraire
  *« ce qui répond à la question »* (l'intention sert de filtre). Frugal et plus utile.

**Champs communs, toujours présents** :
1. **« Pourquoi ça compte ? — une ligne »** → OBLIGATOIRE (garde-fou anti-perte d'intention).
2. **Rattachement à une question** (existante ou nouvelle). Une ressource ne flotte jamais
   seule. À la création d'une question : intitulé + **intention** (obligatoire elle aussi).

**Modèle de données minimal de la capture** (cf. `SCHEMA.md` pour le détail) :
```
Ressource {
  id, questionId,                 // toujours rattachée
  type: texte|lien|audio|fichier,
  titre, contenu,                 // texte / URL / transcription / texte extrait
  pourquoi,                       // OBLIGATOIRE — la ligne d'intention
  meta: { url, fichierNom, dureeLectureMin, extraitDe },
  createdAt
}
```

**Code de référence** : `app/capture.jsx` (écran + 4 modes + sélecteur de question) et
`app/db.jsx` (`creerRessource`, `estimerDureeLecture`). À adapter au stack de Zebracorn.

---

## 3. Le contexte qui donne du sens à la capture (à porter en parallèle)

Capturer seul ne suffit pas : ce qui rend l'intention *utile*, c'est le modèle autour.
À reprendre dans Zebracorn (au moins conceptuellement) :

- **Question vivante** = l'unité centrale (pas la ressource). Elle **porte l'intention**.
- **Chantier** = un projet long. Une question vit dans un chantier (ou flotte).
- **Maturité** d'un fil, calculée (jamais stockée), sur **3 axes à poids égaux** :
  **matière** (ressources) · **réflexion** (relances auxquelles on a répondu) ·
  **régularité** (fréquence des retours). On ne « mûrit » pas en empilant : il faut
  *penser* (relances) et *revenir* (régularité). → anti *collector's fallacy*.
- **Relances** = des questions qui creusent ; y répondre fait penser le fil. Version
  manuelle d'abord (sans IA), IA ensuite (Haiku).
- **Produire** = la récompense de **fin de fil** (pas un mode toujours ouvert).
- **Récolte / second cerveau** = tout ce qui est **produit** est centralisé et
  **réutilisable** : une production peut être **reprojetée** comme ressource d'un autre
  projet (en re-précisant le « pourquoi »). C'est ça, le second cerveau actionnable.
- **Habitude** = boucle *déclencheur → geste → récompense*. Un **traceur de régularité**
  (7 jours + série « ne casse pas la chaîne ») ancre le « revenir », **sans notif ni badge**
  (compatible avec la boussole de sobriété).

---

## 4. Acquis techniques réutilisables (gagnés sur ce build)

- **« App sur l'écran d'accueil » = PWA**, pas du design : `manifest.webmanifest` +
  service worker (offline app-shell) + icônes + métas iOS + un **coup de pouce
  d'installation** (iOS Safari ne propose rien tout seul). Voir `sw.js`, `manifest`,
  `app/app.jsx` (`InstallHint`), `vercel.json` (sw.js toujours revalidé).
- **Générer des icônes sans dépendance** quand l'environnement est verrouillé :
  `scripts/gen_icons.py` (PNG écrit à la main via `zlib`).
- **Stack zéro-build** (HTML + Babel CDN + Dexie) : super pour prototyper vite ; à
  arbitrer pour Zebracorn (si Zebracorn a déjà un bundler/React, porter les composants).
- **Garder la logique métier dans un fichier sans JSX** (`db.jsx`) → vérifiable
  mécaniquement (`node --check`) même hors-ligne.
- **Décision d'agentivité** : laisser à l'utilisateur le **dernier mot** sur l'algo
  (ex. « produire quand même » même si la jauge n'est pas à 80 %). L'algo conseille,
  l'humain tranche.

---

## 5. Plan de convergence vers Zebracorn

1. **Étape 1 — porter Capturer** dans Zebracorn : les 4 modes + le **« pourquoi »
   obligatoire** + rattachement à une question. C'est la brique demandée.
2. **Étape 2 — porter le modèle minimal** qui lui donne du sens : Question (intention) →
   Ressource (pourquoi). Sans ça, la capture redevient un tas mort.
3. **Étape 3 — décider quoi d'autre converge** : maturité, relances, récolte/second
   cerveau, série. Les faire passer par le `BACKLOG.md` (filtre JTBD) côté Zebracorn.
4. **Étape 4 — déprécier Le Filtre v2** une fois la capture (et ce qu'on veut) stabilisée
   dans Zebracorn. Archiver le repo comme référence, puis supprimer.

**À coller dans la discussion Zebracorn pour démarrer** : cette fiche + `SCHEMA.md`
(section Ressource & Question) + `app/capture.jsx`. Première action là-bas : adapter
`capture.jsx` au stack de Zebracorn, en gardant le champ « pourquoi » obligatoire.

---

## 6. Garde-fous à ne pas oublier en portant

- Le **« pourquoi » reste obligatoire** — c'est le cœur, pas un détail UX.
- **Soustraction, pas accumulation** : ne pas re-greffer la complexité de Le Filtre v1.
- **Frugalité** : capture < 10 s ; IA seulement si nécessaire (Haiku, coût affiché, cache).
- **Mobile-first** : inputs `font-size: 16px` (anti-zoom iOS), zones sûres, nav tactile.

---

*Source complète : repo `le-filtre-v2`. Journal détaillé des décisions :
`JOURNAL_CONSTRUCTION.md`. Idées futures : `BACKLOG.md`.*
