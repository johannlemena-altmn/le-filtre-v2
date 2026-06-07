# Backlog & évolution — Le Filtre v2

*Le sas où les idées de features attendent — pour qu'on puisse en ajouter dans quelques
semaines sans casser la discipline du projet.*

## Règle du jeu (ne pas sauter cette étape)

Le Filtre v1 est mort d'**accumulation**. Avant de coder une idée, elle passe ce filtre :

1. **Confronter au JTBD** (`BRIEF_PIVOT.md`) : *« capturer l'intention aussi vite que
   l'idée arrive, pour y revenir sans reconstruire le pourquoi, et faire avancer sa
   pensée. »* Si l'idée ne sert pas ça → elle reste ici, on ne la code pas.
2. **Soustraction d'abord** : est-ce qu'on peut résoudre le besoin en *retirant* ou en
   *enrichissant* l'existant plutôt qu'en ajoutant un écran/objet ? Si oui, préférer ça.
3. **Frugalité** : pas d'IA si pas nécessaire ; si IA → Haiku, coût affiché, cache.
4. **Test avant la suite** : on ne démarre pas une nouvelle brique tant que la précédente
   n'a pas tourné en vrai quelques jours.

## Comment ajouter une idée

Ajouter une ligne dans le tableau ci-dessous. Statut : `💡 idée` → `✅ retenue`
(passe le filtre) → `🚧 en cours` → `🟢 livrée` ou `🗄 écartée` (avec raison).
Une idée *retenue* devient une **brique** dans `JOURNAL_CONSTRUCTION.md`.

## Tableau

| Idée | Sert le JTBD ? | Statut | Note |
| --- | --- | --- | --- |
| Geste de capture plus direct depuis l'accueil | oui (vitesse de capture) | 💡 idée | à valider au test : la nav suffit-elle ? |
| Recherche / filtre dans la récolte | oui (retrouver pour reprojeter) | 💡 idée | utile quand la récolte grossit |
| Import des anciens `items` v1 | partiel | 💡 idée | slice 3 ; comme ressources « à reclasser » |
| Export Markdown / NotebookLM | oui (faire sortir) | 💡 idée | slice 3 |
| Espace d'analyse IA (synthèse/tensions/manques/plan) | oui (comprendre/relier) | ✅ retenue | = slice 2, Haiku, coût affiché, cache `hashFil` |
| Relances générées par IA | oui (penser) | ✅ retenue | slice 2 ; le manuel existe déjà |
| Dark mode | non (confort) | 💡 idée | slice 3, cosmétique |

*Tenir à jour. Quand une idée arrive « dans quelques semaines », elle entre ici d'abord.*
