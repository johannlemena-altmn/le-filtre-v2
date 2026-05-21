# Mise à jour du skill `methode-app`

*Ajouts tirés du pivot de Le Filtre (mai 2026). Je n'ai pas pu écrire directement dans le
fichier du skill — il est dans un dossier système. À appliquer toi-même dans
`methode-app/SKILL.md`, ou lors d'une session où le dossier des skills est accessible.*

---

## Ajout 1 — Nouvelle section, à insérer JUSTE AVANT « Phase 0.5 »

```markdown
## Phase 0-bis · Si c'est un pivot — auditer l'app existante AVANT de réinterviewer

Quand Johann veut faire évoluer une app qui existe déjà et qu'il sent « qu'il ne va pas dans
la bonne direction », ne pas sauter directement aux fonctionnalités. Faire d'abord cet audit
— il prend 20 min et il a sauvé Le Filtre d'une dérive (mai 2026).

**Les quatre tests de dérive :**

1. **Le JTBD est-il écrit quelque part ?** Ouvrir les mémos / docs du projet. S'ils sont à
   ~90% des listes de fonctionnalités et que nulle part une phrase ne dit « cette app sert
   à ___ » → alarme. L'app a grandi par accumulation, pas par approfondissement d'un usage.

2. **Pipeline ou rituel ?** Un pipeline *pousse les choses vers la sortie* (throughput) ;
   une habitude *fait revenir* l'utilisateur. Si le problème est un problème d'habitude mais
   que l'app est un pipeline, elle est structurellement à contre-sens.

3. **L'objet central colle-t-il à la façon dont l'utilisateur pense ?** Si l'app a pour
   unité X (ex. « le signal ») mais que l'utilisateur, lui, pense en Y (ex. « la question
   qu'il rumine »), il faut inverser le modèle de données.

4. **L'app a-t-elle dérivé de ses valeurs fondatrices ?** (frugalité, sobriété, simplicité…)
   Plus de modes, plus d'écran, plus de coût ≠ plus de valeur.

**Le diagnostic fréquent :** l'app résout très bien un problème que l'utilisateur n'a pas,
et touche à peine celui qu'il a. Dans ce cas → pivot.

**Un pivot est surtout de la SOUSTRACTION.** Ne pas rajouter pour « sauver » l'existant.
Trier ce qui est construit en quatre tas : *réutilisé tel quel · repensé · mis de côté
(retiré du chemin, pas supprimé) · allégé*. Puis **refaire l'interview JTBD de la Phase 0**
sur le vrai problème, et reprendre le fil normal de la méthode.

> Note de design pour les outils d'habitude : une habitude tient par **déclencheur → geste →
> récompense**. Ne pas amputer la récompense (ex. « publier ») — la *séquencer* après le
> travail, jamais en faire un mode toujours ouvert qui disperse.
```

---

## Ajout 2 — Nouvelle section, à insérer APRÈS « Phase 1 » et avant « Phase 2 »

```markdown
## Stratégie de modèles (Opus / Sonnet / Haiku)

Ne pas tout faire avec le modèle le plus puissant — c'est cher et ça limite vite.

- **Opus** — le travail de tête : auditer un pivot, figer le modèle de données, arbitrer
  une décision d'architecture, débloquer un bug retors, faire une passe de revue.
  ~10–20 % des sessions.
- **Sonnet** — l'exécution : écrire les composants, le CSS, le CRUD, les écrans, itérer
  sur la maquette, les correctifs courants. ~80 % du travail.
- **Haiku** — au sein de l'app elle-même, pour les appels IA frugaux (scoring simple,
  relances, synthèses courtes).

Condition pour que le va-et-vient soit indolore : la mémoire du projet vit dans des
**fichiers** (`BRIEF_*.md`, `SCHEMA.md`), pas dans la conversation. Chaque session, quel
que soit le modèle, commence par les relire.
```

---

## Ajout 3 — Compléter la section « Signaux d'alerte »

Ajouter ces puces à la liste existante :

```markdown
- Les mémos du projet sont des listes de fonctionnalités, le JTBD n'est écrit nulle part
- L'app capture le « quoi » mais jamais le « pourquoi » → l'intention se perd entre deux sessions
- L'app est un pipeline (pousse vers la sortie) alors que le besoin est une habitude (faire revenir)
- À chaque session on veut ajouter ; jamais soustraire
```

---

## Ajout 4 — Compléter la section « Références »

```markdown
- **Habitudes** : Fogg / Clear — déclencheur → geste → récompense ; réduire le coût de ré-entrée
- **Collector's fallacy** : accumuler/organiser n'est pas penser — se méfier du faux sentiment de progrès
- **Le Filtre v1 → v2** (mai 2026) : cas d'école de pivot par soustraction, d'« outil de
  triage éditorial » vers « rituel de pensée »
```
