# SCHEMA — Le Filtre v2

*Modèle de données · figé en session Opus, mai 2026 · à lire avec BRIEF_PIVOT.md*

Ce document fige la structure des données **avant** de coder. C'est la décision la plus
structurante du projet — celle qu'on ne veut pas refaire à mi-parcours. Tout le reste
(composants, écrans, IA) se construit par-dessus.

Principe directeur : l'unité centrale est la **Question vivante**, pas la ressource.
Tout objet existe par rapport à une question.

---

## 1. Les six objets

### Chantier
Le projet long de Johann. Peu nombreux, stables (4 aujourd'hui).

```js
{
  id: string,              // crypto.randomUUID()
  nom: string,             // "Lettre — Sobriété matières"
  description: string,     // optionnel, une phrase
  couleur: string,         // accent visuel (hex), optionnel
  createdAt: number,       // Date.now()
  archivedAt: number|null  // null = actif
}
```

### Question — l'unité centrale
La question vivante. Elle porte **l'intention** — ce qui s'évaporait avant.

```js
{
  id: string,
  chantierId: string|null,   // null = question flottante (pas encore classée)
  intitule: string,          // "Comment raconter le design pour qu'il soit compris ?"
  intention: string,         // OBLIGATOIRE — "pourquoi je creuse ça"
  statut: "vivante"|"mure"|"produite"|"archivee",
  createdAt: number,
  derniereActiviteAt: number,  // alimente "dort depuis X jours" + la régularité
  activiteLog: number[]        // timestamps des retours sur le fil (pour la régularité)
}
```

> `intention` ne peut pas être vide à la création. C'est le garde-fou anti-perte d'intention.

### Ressource — la connexion
Une vidéo, un article, un livre, une note, un fichier. Toujours accrochée à une question.

```js
{
  id: string,
  questionId: string,        // toujours rattachée (voir "questions flottantes" plus bas)
  type: "texte"|"lien"|"audio"|"fichier",
  titre: string,             // libellé court
  contenu: string,           // texte, URL, transcription, ou texte extrait
  pourquoi: string,          // OBLIGATOIRE — la ligne d'intention "pourquoi ça compte"
  meta: {
    url: string|null,
    fichierNom: string|null,
    dureeLectureMin: number|null,  // l'indicateur "≈ X min"
    extraitDe: string|null         // ex: "PDF p.40-58, filtré par l'intention"
  },
  createdAt: number
}
```

> `pourquoi` est obligatoire, comme `intention`. Sans cette ligne, le fil meurt — c'est
> le cœur du diagnostic.

### Relance — le moteur de la pensée
Une question qui creuse, posée à chaque rituel. Y répondre fait mûrir le fil.

```js
{
  id: string,
  questionId: string,
  texte: string,             // "Laquelle de tes ressources te contredit ?"
  reponse: string|null,      // null = pas encore répondu
  generePar: "ia"|"manuel",
  modele: string|null,       // "haiku" — suivi de frugalité
  createdAt: number,
  reponduAt: number|null
}
```

### Analyse — résultat en cache de l'espace d'analyse
Une synthèse du fil. Mise en cache pour ne pas rappeler l'IA inutilement.

```js
{
  id: string,
  questionId: string,
  synthese: string,
  tensions: [{ texte: string }],
  manques: string[],
  plan: string[],
  modele: string,            // "haiku" par défaut
  coutEur: number,
  hashFil: string,           // hash du contenu du fil → invalidation du cache
  createdAt: number
}
```

> Avant tout appel IA : recalculer `hashFil` (concat des ressources + relances). Si
> identique à une analyse existante → réutiliser, zéro appel.

### Production — le brouillon de fin de fil
Atteint quand la question est mûre. Pré-rempli de la matière du fil.

```js
{
  id: string,
  questionId: string,
  titre: string,
  contenu: string,           // brouillon Markdown
  blocsCites: string[],      // ids de Ressource cités
  createdAt: number,
  updatedAt: number
}
```

---

## 2. La maturité — calculée, jamais stockée brute

La maturité n'est PAS un champ stocké : elle se **calcule à la volée** depuis les données.
Cela évite toute valeur périmée.

```js
function maturite(question, ressources, relances) {
  // chaque dimension : 0–100
  const matiere    = Math.min(100, ressources.length / 4 * 100);  // ~4 ressources = plein
  const relRep     = relances.filter(r => r.reponse).length;
  const reflexion  = Math.min(100, relRep / 3 * 100);             // ~3 relances = plein
  const regularite = scoreRegularite(question.activiteLog);        // voir ci-dessous
  const score = Math.round((matiere + reflexion + regularite) / 3); // poids ÉGAUX
  return { matiere, reflexion, regularite, score };
}
```

- **Poids égaux (⅓ chacun)** — c'est le « mix équilibré » choisi par Johann. Vérifié sur
  la maquette : (75+40+42)/3 ≈ 52, et (90+95+88)/3 ≈ 91.
- **Régularité** : v1 simple — compter les jours distincts d'activité sur les 14 derniers
  jours, rapporter à un objectif (ex. 5 jours = 100%). Pénaliser un long silence.
- Les seuils (4 ressources, 3 relances, 5 jours) sont **réglables** — à ajuster pendant
  les vrais tests, ne pas les graver.
- Une question passe `statut: "mure"` quand `score >= 80`. Le bouton **Produire**
  s'active à ce seuil.

---

## 3. IndexedDB — structure Dexie

On garde Dexie.js (déjà maîtrisé sur v1), mais avec de **vraies tables** au lieu d'un blob
unique.

```js
db.version(1).stores({
  chantiers:   'id, nom, archivedAt',
  questions:   'id, chantierId, statut, derniereActiviteAt',
  ressources:  'id, questionId, type, createdAt',
  relances:    'id, questionId, reponduAt',
  analyses:    'id, questionId, hashFil',
  productions: 'id, questionId, updatedAt',
  kv:          'key'   // réglages globaux : modèle IA, thème, coût mensuel
});
```

`localStorage` reste pour : `lf_api_key` (clé API), `lf_theme`, `lf_modele` (haiku par défaut).

---

## 4. Migration depuis Le Filtre v1

v1 stockait un blob unique avec un tableau `items` (les signaux). Le modèle v2 est
différent — pas de migration automatique propre.

**Recommandation :** v2 démarre **vierge**. Optionnellement, proposer un import des anciens
`items` v1 comme **ressources flottantes** (questionId pointant vers une question fourre-tout
« À reclasser »), que Johann range ensuite manuellement. À traiter en slice 3, pas avant.

---

## 5. Décisions ouvertes (à confirmer pendant les tests)

- **Questions flottantes** — à la capture en 10 s, Johann ne connaît pas toujours la
  question. Deux options : (a) capture obligatoirement rattachée à une question existante
  ou nouvelle ; (b) une « boîte à reclasser » où une ressource attend sans question.
  Le schéma autorise (b) via une question spéciale flottante. *Recommandation : implémenter
  (a) d'abord, garder (b) en réserve si les tests montrent une friction.*
- **Seuils de maturité** — 4 / 3 / 5. À régler à l'usage.
- **Poids de la maturité** — égaux pour l'instant ; à rééquilibrer si « empiler » triche
  encore la jauge.
