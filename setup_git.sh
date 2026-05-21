#!/bin/bash
# Script de setup git — Le Filtre v2
# À lancer depuis le dossier Le Filtre v2 ou via : bash ~/Desktop/Le\ Filtre\ v2/setup_git.sh

set -e
cd ~/Desktop/Le\ Filtre\ v2

echo "→ Nettoyage des locks git…"
rm -f .git/HEAD.lock .git/index.lock 2>/dev/null || true

echo "→ Ajout des fichiers…"
git add index.html app/ .gitignore

echo "→ Commit slice 1…"
git commit -m "feat: slice 1 — chemin critique complet (capture → rituel → question → produire)"

echo "→ Connexion au remote GitHub…"
git remote add origin https://github.com/johannlemena-altmn/le-filtre-v2.git 2>/dev/null || git remote set-url origin https://github.com/johannlemena-altmn/le-filtre-v2.git

echo "→ Push vers main…"
git branch -M main
git push -u origin main

echo ""
echo "✓ Tout est pushé sur GitHub !"
echo "  → Connecte maintenant Vercel sur vercel.com/new"
