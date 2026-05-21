# Brief de pivot — de « Le Filtre » au rituel de pensée

*Boussole écrite · Session de recadrage design-thinking · Mai 2026*

---

## Le problème, en une phrase

Johann n'a pas un problème d'information — il a un problème **d'intention perdue**.
Il capte bien (une vidéo, un article du matin, un livre). Mais entre le moment où une idée
le traverse et le moment où il voudrait y revenir, le *pourquoi* s'évapore. Sans le pourquoi,
impossible de relier, donc impossible d'aller au bout, donc aucune habitude ne se forme.

Confirmé trois fois, indépendamment :
- *« je ne me souviens plus pourquoi j'ai écrit un truc »* (message initial)
- *« je ne savais plus pourquoi je voulais en tirer quelque chose »* (vidéo → livre Storytelling)
- *« je ne me rappelais plus ce que je voulais faire »* (article du matin)

---

## Le JTBD

> **Quand une idée me traverse — souvent un pont entre deux ressources — je veux capturer
> l'intention (la question que je me pose, ce que je cherche à comprendre) aussi vite que
> l'idée arrive, afin d'y revenir plus tard sans reconstruire le « pourquoi », et faire
> avancer ma pensée plutôt que de la perdre.**

---

## Le recadrage

**Le Filtre actuel** est un *pipeline de traitement* en 7 phases dont l'objet central est le
**signal** (une ressource captée, scorée, triée). Il muscle l'étape « analyser » et pousse
vers la sortie « publier ».

**Le problème :** Johann ne pense pas en signaux. Il pense en **questions qu'il rumine**.
Les ressources ne sont que du carburant pour ces questions. Et ce qui casse n'est ni la
capture ni l'analyse — c'est le *retour*. Un pipeline pousse vers la sortie ; une habitude
de pensée fait *revenir*. L'app est structurellement à contre-sens.

**Conséquence design :** on inverse l'app. L'unité n'est plus le signal, c'est la
**question vivante**.

---

## Le modèle à 3 niveaux

**Chantier** — les vrais projets longs de Johann : la Lettre sobriété matières, Boussole,
le mémoire, le studio low-tech / AMO. Peu nombreux, stables. Remplacent les 8 blocs thématiques.

**Question vivante** — l'unité de l'app. À l'intérieur d'un chantier (ou flottante), une
question ouverte. C'est elle qui *porte l'intention*.

**Ressource / connexion** — vidéo, article, livre, note vocale. S'accroche à une question.
À la capture, un seul champ obligatoire : **une ligne disant pourquoi ça compte pour cette
question.** C'est ce geste qui sauve l'intention.

---

## La boucle d'habitude

Une habitude tient par trois temps : **déclencheur → geste → récompense.**

- **Déclencheur** : l'app te tend une question qui dort (la plus ancienne sans activité),
  accompagnée d'une **relance** — une question qui creuse.
- **Geste** : 10 minutes — tu ajoutes ou relis une ressource, tu écris une ligne de
  connexion, tu réponds à la relance.
- **Récompense** : la question « mûrit ». Une jauge de maturité avance. Quand elle est mûre,
  un bouton **Produire** ouvre l'éditeur, déjà rempli de tout ce que le fil a accumulé.

> Publier n'est pas écarté — c'est la **récompense de fin de fil**, séquencée après le
> travail de pensée, pas un mode toujours ouvert qui disperse.

### La jauge de maturité (décision session 2)

La jauge n'est pas un simple compteur. Elle mêle **trois dimensions pondérées** :

- **Matière** — les ressources accrochées au fil.
- **Réflexion** — les relances auxquelles tu as répondu.
- **Régularité** — la fréquence de tes retours sur le fil.

Empiler des ressources ne fait pas mûrir une question : il faut aussi *penser* et *revenir*.
C'est ce qui rend la jauge « intelligente » et qui pousse l'habitude par le design.

### L'espace d'analyse (décision session 2)

Pour chaque question, un espace dédié aide à *comprendre et relier* — le vrai but de Johann.
Il contient : une **synthèse du fil**, les **tensions** entre ressources, **ce qui manque**
pour conclure, un **plan émergent**, et les **relances**. C'est l'aide à la pensée *in-app*,
qui évite de passer systématiquement par NotebookLM (gardé en option pour les grosses
synthèses). ⚠️ C'est l'écran le plus riche, donc le plus à risque de redevenir une usine à
gaz : règle de garde — une question = un espace, rien ne s'y fait sans Johann, modèle Haiku
par défaut, résultats mis en cache.

---

## Chemin critique (le slice vertical minimal)

Le seul parcours qui doit fonctionner pour que l'app ait un sens :

1. Une idée traverse Johann → **capture en 10 secondes** : la ressource (texte, lien, audio
   ou fichier/PDF) + la ligne d'intention + à quelle question l'accrocher.
2. Plus tard, l'app **lui tend une question qui dort** + une relance.
3. Il **ajoute / relit / écrit une ligne de connexion / répond à la relance** (10 min).
4. La question **mûrit** ; quand elle est mûre → **Produire**.

Tout le reste est secondaire et ne se construit pas tant que ce parcours-là ne tourne pas.

---

## Ce qui est réutilisé / mis de côté

**Réutilisé tel quel :** la capture multi-modes, IndexedDB (Dexie), le design system,
le Brief Canvas (phase 07 → devient le **cœur** de l'app), la Lecture Active (clipping de
passages), Plume (mais déplacé *en bout de fil*, déclenché par « Produire »).

**Repensé, pas supprimé :** l'ancien épistémo 6D et l'analyse multi-critères deviennent
l'**espace d'analyse par question** (synthèse, tensions, manques, plan, relances) — au
service de « comprendre et relier », plus un score de triage.

**Mis de côté (retiré du chemin, pas supprimé) :** le moteur de scoring 5 critères, le
cluster 2D/3D, mindmap / storyboard / infographie / social listening, les 8 blocs thématiques.

**Allégé :** le tri reste, mais réduit à l'instinct réel de Johann — un simple indicateur
« ≈ X min de lecture ». Pas de scoring IA lourd.

**Modes de capture conservés :** texte, lien, audio (dictée vocale), fichier / PDF. Pour un
PDF lourd, pas de compression aveugle : l'app extrait ce qui répond à la question accrochée.

---

## Verdict de faisabilité

**Oui, ça vaut la peine — et le pivot est plus réaliste que la trajectoire actuelle.**

- La version « rituel de pensée » est *plus petite* : elle réutilise toute la stack existante.
- Elle a besoin de très peu — voire pas — d'IA → frugale et sobre, alignée sur la boussole
  de Johann (moins d'écran, faible empreinte matérielle).
- Le PDF de 200 pages, problème non résolu jusqu'ici, devient tractable : on n'extrait plus
  « quelque chose » d'un PDF, on extrait « ce qui répond à ma question ».
- Le travail principal du pivot est de la **soustraction**, pas du code en plus.

**Risque à surveiller :** l'app ne crée pas l'habitude à la place de Johann. Elle doit
réduire le coût de ré-entrée à presque zéro et offrir une récompense visible — sinon elle
redeviendra un tas mort, plus joli mais tout aussi inerte.

**Point de vigilance frugalité :** Johann a choisi un *vrai espace d'analyse* in-app plutôt
qu'une simple relance. C'est légitime (l'aide à penser est dans le JTBD), mais c'est aussi
là que la dérive « usine à gaz » de Le Filtre v1 pourrait recommencer. Garde-fous : un seul
espace par question, modèle Haiku par défaut, coût affiché, résultats en cache, et rien qui
ne se déclenche sans une action de Johann.

---

*Session 2 : maquette v2 mobile-first livrée (`maquette-rituel.html`). Étape suivante —
validation du parcours, puis attaque du code sur le slice vertical.*
