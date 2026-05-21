# BRIEF DE BUILD — Le Filtre v2

*Passation pour la phase de code · à ouvrir en début de session Sonnet*

Ce document dit **comment construire**. Le *pourquoi* et le *quoi* sont ailleurs — les lire
d'abord, dans l'ordre :

1. `BRIEF_PIVOT.md` — le problème, le JTBD, le modèle à 3 niveaux, le chemin critique.
2. `SCHEMA.md` — le modèle de données figé. Ne pas y déroger sans raison.
3. `maquette-rituel.html` — la référence visuelle et de parcours. Ouvrir dans un navigateur.

---

## Le projet en deux phrases

Le Filtre v2 est un **rituel de pensée** : un outil local-first où Johann capture des
*intentions* (pas seulement des ressources), les rattache à des *questions vivantes*, et y
revient par un rituel court jusqu'à ce qu'une question soit mûre — alors il produit.
C'est un **pivot par soustraction** de Le Filtre v1 : on ne rajoute pas, on recentre.

---

## Stack & repo

**Stack — Pattern B** (cf. methode-app) : HTML + Babel CDN + JSX, zéro build step,
IndexedDB via Dexie.js, API Claude côté client. Déploiement Vercel depuis GitHub.

**Repo — build neuf, pas un fork de v1.** L'architecture v2 (modèle Question-centré) est
trop différente du pipeline 7-phases de v1 pour qu'un refactor soit rentable. On part
propre, dans le dossier `Le Filtre v2`.

À récupérer de l'ancien repo `~/Desktop/Le Filtre - App` par copier-coller (code réutilisable
tel quel) :
- le **design system CSS** (tokens, palette papier, typo Fraunces/Inter/JetBrains) ;
- le wrapper **`window.claude`** (`complete`, `vision`, file d'attente, ordre d'init) ;
- les helpers **Dexie** et le suivi de coût mensuel ;
- les **extractors** : OCR vision, Speech Recognition, `recordAudio`.

Première action de la session de code : `git init` dans `Le Filtre v2`, premier commit
propre, puis connecter le repo à Vercel **avant** d'écrire la première fonctionnalité.

---

## Architecture fichiers cible

```
Le Filtre v2/
├── index.html        — CSS global (design system), globals window.*, chargement scripts
├── app/
│   ├── app.jsx       — Root React, état global, routing entre écrans
│   ├── db.jsx        — Dexie : tables, CRUD chantiers/questions/ressources/relances…
│   ├── rituel.jsx    — Écran Rituel (resurfacing de la question qui dort)
│   ├── capture.jsx   — Écran Capturer (4 modes + champ intention obligatoire)
│   ├── chantiers.jsx — Écran Chantiers + fiche Question
│   ├── analyse.jsx   — Écran Analyser + relances (slice 2)
│   ├── produire.jsx  — Écran Produire (éditeur de fin de fil)
│   └── engine.jsx    — Appels IA : relances, synthèse d'analyse (slice 2)
└── (docs : BRIEF_PIVOT.md, SCHEMA.md, BRIEF_BUILD.md, maquette-rituel.html)
```

---

## Découpage en slices

**Slice 1 — le chemin critique (à faire en premier, rien d'autre).**
Capturer une intention → la retrouver au rituel → connecter → produire.
Aucune IA dans ce slice. L'app doit déjà être utilisable et testable 3 jours.

**Slice 2 — la pensée assistée.**
L'espace Analyser (synthèse, tensions, manques, plan) et les relances IA. Modèle Haiku
par défaut, coût affiché, résultats en cache (`hashFil`).

**Slice 3 — finitions.**
Import des anciens `items` v1, export Markdown/NotebookLM, dark mode, raffinements.

---

## Slice 1 — ordre de construction

Construire **du dehors vers le dedans** : interface d'abord, données ensuite.

1. **Design system** dans `index.html` — tokens CSS, typo, le composant nav du bas. ~1h max.
2. **`db.jsx`** — tables Dexie du SCHEMA + fonctions CRUD. Pas d'UI encore.
3. **Chantiers + fiche Question** — afficher chantiers et questions, créer/éditer une
   question (intitulé + intention obligatoire). La fiche affiche le fil et la jauge.
4. **Capturer** — 4 modes (texte / lien / audio / fichier-PDF), champ `pourquoi`
   obligatoire, rattachement à une question. Indicateur « ≈ X min » pour les liens/textes.
5. **Rituel** — sélectionner la question dormante (plus ancienne `derniereActiviteAt`),
   l'afficher, bouton « Reprendre ce fil » → fiche Question.
6. **Maturité** — implémenter la fonction du SCHEMA (poids égaux), brancher la jauge.
   En slice 1 : `reflexion` peut rester à 0 (pas encore de relances) — c'est normal.
7. **Produire** — éditeur simple (textarea Markdown + colonne « matière du fil »),
   accessible quand `statut: "mure"`.

> ⚠️ Ne pas commencer un slice 2 tant que le slice 1 ne tourne pas et n'a pas été utilisé
> 3 jours en vrai (cf. methode-app Phase 2 + `FRICTION.md`).

---

## Garde-fous (ne pas reproduire la dérive de v1)

- **Soustraction, pas accumulation.** Si une idée de fonctionnalité surgit, la confronter
  au JTBD du `BRIEF_PIVOT`. Si elle n'est pas sur le chemin critique → la noter, ne pas la
  coder.
- **Frugalité IA.** Haiku par défaut. Coût estimé affiché *avant* tout appel. Cache via
  `hashFil`. Aucun appel IA sans action explicite de Johann.
- **Friction de capture.** Le geste de capture doit rester sous ~10 s. Surveiller le choix
  de la question : si c'est lourd, activer la « question flottante » du SCHEMA.
- **Mobile-first.** Tout se teste depuis l'iPhone. `font-size: 16px` sur les inputs,
  zones sûres iOS, nav du bas tactile — déjà fait dans la maquette, le reprendre.

---

## Discipline git & déploiement

- Un commit par fonctionnalité visible : `feat: écran capture 4 modes`. Pas de `update`.
- `git add` + `commit` + `push` avant chaque déploiement Vercel.
- Vercel déploie automatiquement depuis `main`. Pas de `npm run build` — fichiers statiques.
- L'URL Vercel = l'URL de test iPhone.

---

## Modèle à utiliser

**Slice 1 et 2 se construisent avec Sonnet 4.6.** C'est de l'exécution : composants, CSS,
CRUD, écrans. Garder **Opus** uniquement pour : un blocage d'archi imprévu, un bug retors
que Sonnet ne règle pas, ou une passe de revue en fin de slice. Viser ~80% Sonnet.

Tout le contexte est dans ces fichiers : n'importe quelle session, n'importe quel modèle,
commence par les relire. La conversation n'est plus la mémoire — le dossier l'est.

---

## Checklist avant de montrer le slice 1

- [ ] Le chemin critique tourne de bout en bout (capture → rituel → fiche → produire)
- [ ] Données persistées en IndexedDB, rechargement OK
- [ ] Testé sur iPhone via l'URL Vercel
- [ ] 3 jours d'usage perso + `FRICTION.md` tenu
- [ ] `git log` montre un commit par fonctionnalité
