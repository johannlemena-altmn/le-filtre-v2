# Journal de construction — Le Filtre v2

*Mémo de build, tenu au fil des sessions. À rouvrir pour comprendre **comment** et
**pourquoi** l'app a été construite — pour la ré-expliquer, former, conseiller, et
nourrir les skills (`methode-app`).*

> Ce journal ne remplace pas les briefs. Il les complète côté **chantier de code**.
> Ordre de lecture conseillé : `BRIEF_PIVOT.md` (le pourquoi) → `SCHEMA.md` (les
> données) → `BRIEF_BUILD.md` (comment construire) → **ce journal** (ce qui a été fait,
> dans l'ordre, avec les arbitrages).

---

## 0. Repères rapides

- **Ce qu'est l'app** : un *rituel de pensée* local-first. Unité centrale = la
  **question vivante** (pas la ressource). On capture une intention, on la rattache à
  une question, on y revient par un rituel court jusqu'à maturité, puis on **produit**.
- **Stack** : HTML + Babel CDN + JSX (zéro build), React 18 UMD, IndexedDB via Dexie.
  Tout est statique → déploiement Vercel depuis `main`.
- **Architecture fichiers** :
  - `index.html` — design system CSS, métas PWA, chargement ordonné des scripts, SW.
  - `app/db.jsx` — couche données Dexie + toute la logique métier (export `window.DB`).
  - `app/app.jsx` — root React, routeur d'écrans, nav du bas.
  - `app/rituel.jsx` · `capture.jsx` · `chantiers.jsx` · `produire.jsx` — les écrans
    (chacun s'exporte en `window.EcranX`).
- **Convention clé** : pas de bundler. Chaque `*.jsx` est un `<script type="text/babel">`
  exécuté en **portée globale**. Les fonctions top-level deviennent globales ; les écrans
  s'accrochent à `window.*`. La logique passe **toujours** par `window.DB`.

---

## 1. Boussole de cette phase (« app-improvements / écran d'accueil »)

Demande de Johann, reformulée : *« pouvoir accéder à l'app sur mon écran d'accueil
(façon app de reprise sport), avec une section projets centrale mais compacte, et un
"second cerveau" qui centralise ce qui est produit pour le reprojeter sur d'autres
projets. »*

Trois besoins distincts en sont tirés :
1. **Installabilité** (écran d'accueil) → PWA.
2. **Projets centraux mais compacts** → renforcer l'écran Chantiers, pas un nouvel écran.
3. **Second cerveau** → centraliser les **productions** et les rendre **réutilisables**.

Garde-fou permanent (hérité des briefs) : **soustraction, pas accumulation**. Toute
brique est confrontée au JTBD ; on n'ajoute pas d'écran, on enrichit l'existant.
Branche de travail : `claude/app-improvements-home-screen-JEXOv`.

---

## 2. Briques posées (dans l'ordre)

### Brique 1 — PWA : installable + hors-ligne
*Commit : « feat: PWA installable + hors-ligne (accès écran d'accueil) »*

- **Intention** : le vrai blocage pour « l'avoir sur l'écran d'accueil » n'était pas le
  design — c'était l'**absence de manifest / service worker / icônes**. Sans ça, pas
  d'« Ajouter à l'écran d'accueil » propre sur iOS.
- **Fait** :
  - `manifest.webmanifest` — nom, `display: standalone`, `start_url: ./?source=pwa`,
    couleurs papier, icônes (192 / 512 / maskable).
  - `icons/` — icônes générées **sans dépendance** par `scripts/gen_icons.py` (PNG écrit
    à la main via `zlib`/`struct`). Motif **◐** (le rituel) sur fond papier, anneau encre.
  - `sw.js` — service worker : app shell en cache (install), nettoyage des vieux caches
    (activate), et au `fetch` : navigations → réseau puis repli sur l'index en cache ;
    assets locaux → cache-first + MAJ en fond ; CDN (polices, React/Babel/Dexie) →
    stale-while-revalidate.
  - `index.html` — liens manifest + `apple-touch-icon`, métas iOS, enregistrement du SW.
- **Pourquoi ces choix** :
  - *Icônes en Python pur* : le conteneur n'a ni ImageMagick, ni PIL, ni accès réseau
    (allowlist). Générer le PNG octet par octet est la voie robuste et reproductible.
  - *Hors-ligne sérieux* : l'app est local-first (IndexedDB) ; elle **doit** marcher sans
    réseau une fois installée — sinon l'« app écran d'accueil » casse dans le métro.
- **Gotcha** : bumper la constante `CACHE` dans `sw.js` à chaque déploiement qui change un
  fichier de l'app shell, sinon l'ancien cache est servi.
- **Pour régénérer les icônes** : `python3 scripts/gen_icons.py`.

### Brique 2 — Écran Chantiers central : tableau de bord + récolte
*Commit : « feat: écran Chantiers central — tableau de bord + récolte (second cerveau) »*

- **Intention** : rendre les **projets** centraux **sans** bouffer d'espace ni créer
  d'écran. Et matérialiser le « second cerveau » = ce qui est produit, centralisé.
- **Fait** :
  - `db.jsx` : `statsGlobales()` (compte chantiers / vivantes / mûrs / produites /
    productions) et `listerRecolte()` (toutes les productions, enrichies de leur question
    et de leur chantier, plus récentes d'abord).
  - `chantiers.jsx` :
    - **Bandeau de bord** compact en haut (`projets · vivantes · mûrs · récoltés`).
    - **Couleur + description** par chantier (champs déjà au schéma, juste exposés ;
      pastilles de couleur dans la modale de création).
    - **« Ta récolte »** : section repliable en bas, liste les productions ; un clic
      rouvre la production.
  - `index.html` : CSS `.dash`, `.swatches/.swatch`, `.recolte-*`.
- **Pourquoi** : « central mais compact » = un bandeau d'une ligne + une section repliée
  par défaut. On ne réinvente pas le modèle (un *chantier* = déjà un projet). Zéro concept
  neuf.

### Brique 3 — Régularité / série sur le Rituel
*Commit : « feat: traceur de régularité sur le Rituel (semaine + série) »*

- **Intention** : ancrer l'**habitude** (le « revenir ») façon app de reprise sport, mais
  calé sur la boussole de sobriété : pas de notif, pas de badge.
- **Fait** :
  - `db.jsx` : `serieGlobale()` → les **7 derniers jours** (actif/inactif, marque
    aujourd'hui) + la **série** de jours consécutifs. Tolérance : si rien aujourd'hui mais
    hier actif, la série tient (la journée n'est pas finie).
  - `rituel.jsx` : sous la date, 7 pastilles (jour actif = terre, aujourd'hui entouré) +
    compteur « 🔥 N jours » ou « commence ta série » si zéro (sans culpabiliser).
  - `index.html` : CSS `.serie*`.
- **Pourquoi** : la série lit des données **déjà là** (`activiteLog` des questions). On
  *révèle* la régularité, on n'ajoute pas de mécanique gamifiée lourde.

### Brique 4 — Récolte réutilisable : « projeter sur un autre fil »
*Commit : « feat: réutiliser une production dans un autre chantier (second cerveau) »*

- **Intention** : faire de la récolte un **vrai second cerveau** — une production mûrie
  doit pouvoir resservir de **matière** à une autre question (autre projet).
- **Fait** :
  - `db.jsx` : `reutiliserProduction({ production, questionCibleId, pourquoi })` → crée une
    **ressource** (type `texte`) sur la question cible, avec `meta.extraitDe` qui garde la
    provenance. Réutilise `creerRessource` → l'**intention reste obligatoire**.
  - `chantiers.jsx` : bouton `↪` sur chaque ligne de récolte → `ModalReutiliser` (choix du
    fil cible parmi les questions vivantes/mûres + ligne « pourquoi »). Au succès, on
    navigue vers le fil cible pour voir la ressource atterrir.
  - `index.html` : CSS `.rc-reuse`.
- **Pourquoi** : « projeter sur un autre projet » = transformer une sortie en **entrée**
  ailleurs, sans perdre le *pourquoi* (le diagnostic fondateur de l'app). On passe par le
  modèle existant (Ressource) plutôt que d'inventer un objet « réutilisation ».

### Brique 5 — Coup de pouce d'installation + vercel.json
*Commit : « feat: coup de pouce d'installation (iOS/Android) + vercel.json »*

- **Intention** : iOS Safari ne propose **jamais** l'installation tout seul → sans aide,
  « l'avoir sur l'écran d'accueil » échoue silencieusement.
- **Fait** : `app/app.jsx` `InstallHint` (bandeau dismissible : explication Partager →
  Sur l'écran d'accueil sur iOS, ou bouton *Installer* via `beforeinstallprompt` sur
  Android ; masqué si déjà en standalone, mémorise le rejet). `vercel.json` : `sw.js`
  toujours revalidé (jamais figé en cache), bon type MIME du manifest.
- **Déploiement** : PR #1 ouverte → Vercel génère un **aperçu** ; URL relayée à Johann
  pour test iPhone. (Vercel déploie la prod depuis `main`, les previews depuis les PR.)

### Brique 6 — Relances manuelles (sans IA) + agentivité « produire quand même »
*Commit : « feat: relances manuelles + produire quand même (loop bout-en-bout) »*

- **Intention** : en slice 1, la **réflexion** valait toujours 0 (les relances venaient de
  l'IA du slice 2) → la maturité plafonnait et **Produire ne s'activait jamais**. Donc
  Récolte et Reprojeter (briques 2 & 4) étaient intestables. Il fallait débloquer la
  boucle **sans IA**.
- **Fait** :
  - `chantiers.jsx` (FicheQuestion) : section **Relances** — on ajoute une question qui
    creuse (`creerRelance` `generePar:'manuel'`) et on y répond (`repondreRelance`).
    Répondre alimente la **réflexion** + l'activité (donc la régularité).
  - Composant `RelanceItem` (réponse éditable). CSS `.relance-card`.
  - **« Produire quand même »** : lien discret quand le fil n'est pas mûr. La **régularité**
    exige plusieurs jours *par design* (c'est l'habitude) → un test en une session plafonne
    ~73 %. Plutôt que de fausser le seuil, on laisse à Johann le dernier mot (aligné avec
    « rien ne se fait sans Johann » / l'algo conseille, l'humain tranche).
- **Effet** : le parcours complet est désormais testable **aujourd'hui** :
  capture → relance/réponse → produire → récolte → reprojeter.

---

## 2-bis. Convergence vers Zebracorn (décision de trajectoire)

Le Filtre v2 est un **prototype de référence**. La cible réelle est l'app **Zebracorn**,
où la brique **Capturer** (et la philosophie « intention obligatoire ») doit être intégrée.
On fera **converger** le reste là-bas, puis on **supprimera** Le Filtre v2.

- Handoff complet : **`MEMO_ZEBRACORN.md`** (spéc de la capture + modèle minimal + acquis
  techniques + plan de convergence + garde-fous). C'est le doc à ouvrir dans la discussion
  Zebracorn.
- Idées futures (des deux côtés) : **`BACKLOG.md`**, avec le filtre JTBD obligatoire avant
  de coder quoi que ce soit.

---

## 3. Plan / prochaines briques

- **Tester sur iPhone** une fois Vercel à jour (installation écran d'accueil + hors-ligne).
  *Règle convenue : on ne teste que quand une brique est réellement actionnable.*
- **Slice 2 (IA in-app)**, quand le slice 1 aura tourné en vrai : relances + espace
  d'analyse (synthèse / tensions / manques / plan), modèle **Haiku** par défaut, **coût
  affiché avant chaque appel**, cache via `hashFil`. → c'est là que le **compteur de coût
  mensuel** (frugalité) devient de vrais euros (`kv`).
- **Pistes notées, non codées** (à confronter au JTBD avant de toucher) : geste de capture
  plus direct depuis l'accueil ; filtre/recherche dans la récolte quand elle grossira ;
  import des anciens `items` v1 (slice 3) ; export Markdown / NotebookLM (slice 3).

---

## 4. Pour les skills (`methode-app`) — ce qui se généralise

Idées réutilisables au-delà de Le Filtre, à intégrer aux skills le moment venu :

1. **« Écran d'accueil » = PWA, pas du design.** Quand quelqu'un veut « une app sur son
   téléphone » sans store : checklist PWA (manifest + SW + icônes + métas iOS). C'est
   souvent *le* chaînon manquant, et c'est de l'enablement pur (pas du feature bloat).
2. **Générer des assets sans dépendances.** En environnement verrouillé (pas de réseau,
   pas de lib image), savoir écrire un PNG en code (zlib/struct) débloque. Pattern utile.
3. **« Second cerveau » concret = centraliser les *sorties* et les re-router en *entrées*.**
   Le second cerveau n'est pas un dossier de plus : c'est rendre ce qui est **produit**
   réutilisable comme matière d'un autre projet, sans perdre l'intention.
4. **Mécanique d'habitude sobre.** Une « série » qui *révèle* des données déjà capturées
   (jours d'activité) ancre le « revenir » sans notifications ni badges — compatible avec
   une boussole de sobriété. La tolérance « hier compte » évite la culpabilité contre-prod.
5. **« Central mais compact ».** Rendre une section centrale ≠ lui donner tout l'écran :
   un bandeau d'une ligne + une section repliable suffisent. Antidote à l'usine à gaz.
6. **Discipline de frugalité (méta-build).** Suivi de conso : la source exacte des crédits
   est côté plateforme ; côté agent, une **barre de conso** par étape (proxy : appels
   d'outils, téléchargements) donne le rythme de brûlage en direct. Éviter les
   re-validations réseau inutiles (ex. fetch d'un parser) en environnement verrouillé.
7. **Valider sans bundler.** `db.jsx` est du JS pur → `node --check` (via copie `.js`). Les
   fichiers à JSX se relisent à la main faute de Babel hors-ligne. Garder la logique dans
   un fichier sans JSX (ici `db.jsx`) rend la couche critique **vérifiable mécaniquement**.

---

## 5. Journal des commits (branche `claude/app-improvements-home-screen-JEXOv`)

| # | Commit | Brique |
|---|--------|--------|
| 1 | feat: PWA installable + hors-ligne (accès écran d'accueil) | Brique 1 |
| 2 | feat: écran Chantiers central — tableau de bord + récolte | Brique 2 |
| 3 | feat: traceur de régularité sur le Rituel (semaine + série) | Brique 3 |
| 4 | feat: réutiliser une production dans un autre chantier | Brique 4 |
| 5 | docs: journal de construction + plan | (ce fichier) |
| 6 | feat: coup de pouce d'installation (iOS/Android) + vercel.json | Brique 5 |
| 7 | feat: relances manuelles + produire quand même (loop bout-en-bout) | Brique 6 |
| 8 | docs: backlog + mémo Zebracorn + MAJ journal | Convergence |

*Tenir ce tableau à jour à chaque brique. Une ligne par fonctionnalité visible.*
