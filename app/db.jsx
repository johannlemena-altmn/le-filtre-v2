// ============================================================
// db.jsx — Le Filtre v2
// Couche données : Dexie (IndexedDB) + fonctions CRUD
// Schéma figé dans SCHEMA.md — ne pas modifier sans accord
// ============================================================

// ── Initialisation Dexie ────────────────────────────────────
const db = new Dexie('lefiltre_v2');

db.version(1).stores({
  chantiers:   'id, nom, archivedAt',
  questions:   'id, chantierId, statut, derniereActiviteAt',
  ressources:  'id, questionId, type, createdAt',
  relances:    'id, questionId, reponduAt',
  analyses:    'id, questionId, hashFil',
  productions: 'id, questionId, updatedAt',
  kv:          'key',  // réglages globaux
});

// ── Helpers ─────────────────────────────────────────────────

function uuid() {
  return crypto.randomUUID();
}

function now() {
  return Date.now();
}

// ── CHANTIERS ───────────────────────────────────────────────

async function creerChantier({ nom, description = '', couleur = null }) {
  const chantier = {
    id:          uuid(),
    nom,
    description,
    couleur,
    createdAt:   now(),
    archivedAt:  null,
  };
  await db.chantiers.add(chantier);
  return chantier;
}

async function listerChantiers() {
  return db.chantiers
    .where('archivedAt').equals(0).toArray()
    .catch(() =>
      // IndexedDB stocke null comme 0 dans certains index — fallback
      db.chantiers.toArray().then(all => all.filter(c => !c.archivedAt))
    );
}

async function archiverChantier(id) {
  return db.chantiers.update(id, { archivedAt: now() });
}

// ── QUESTIONS ───────────────────────────────────────────────

async function creerQuestion({ chantierId = null, intitule, intention }) {
  if (!intention || intention.trim() === '') {
    throw new Error('L\'intention est obligatoire — c\'est ce qui sauve le pourquoi.');
  }
  const question = {
    id:                 uuid(),
    chantierId,
    intitule,
    intention,
    statut:             'vivante',
    createdAt:          now(),
    derniereActiviteAt: now(),
    activiteLog:        [now()],
  };
  await db.questions.add(question);
  return question;
}

async function listerQuestions(chantierId) {
  if (chantierId) {
    return db.questions
      .where('chantierId').equals(chantierId)
      .toArray()
      .then(qs => qs.filter(q => q.statut !== 'archivee'));
  }
  return db.questions.toArray().then(qs => qs.filter(q => q.statut !== 'archivee'));
}

async function getQuestion(id) {
  return db.questions.get(id);
}

async function mettreAJourActivite(questionId) {
  const q = await db.questions.get(questionId);
  if (!q) return;
  const log = [...(q.activiteLog || []), now()];
  return db.questions.update(questionId, {
    derniereActiviteAt: now(),
    activiteLog:        log,
  });
}

async function mettreAJourStatut(questionId, statut) {
  return db.questions.update(questionId, { statut });
}

async function questionDormante() {
  // La question la plus ancienne sans activité (statut vivante ou mure)
  const questions = await db.questions
    .where('statut').anyOf(['vivante', 'mure'])
    .toArray();
  if (!questions.length) return null;
  return questions.sort((a, b) => a.derniereActiviteAt - b.derniereActiviteAt)[0];
}

// ── RESSOURCES ──────────────────────────────────────────────

async function creerRessource({ questionId, type, titre, contenu, pourquoi, meta = {} }) {
  if (!pourquoi || pourquoi.trim() === '') {
    throw new Error('Le champ "pourquoi ça compte" est obligatoire.');
  }
  const ressource = {
    id:         uuid(),
    questionId,
    type,       // texte | lien | audio | fichier
    titre,
    contenu,
    pourquoi,
    meta: {
      url:              meta.url              || null,
      fichierNom:       meta.fichierNom       || null,
      dureeLectureMin:  meta.dureeLectureMin  || null,
      extraitDe:        meta.extraitDe        || null,
    },
    createdAt: now(),
  };
  await db.ressources.add(ressource);
  // Mettre à jour l'activité de la question
  await mettreAJourActivite(questionId);
  return ressource;
}

async function listerRessources(questionId) {
  return db.ressources
    .where('questionId').equals(questionId)
    .sortBy('createdAt');
}

// ── RELANCES ────────────────────────────────────────────────

async function creerRelance({ questionId, texte, generePar = 'manuel' }) {
  const relance = {
    id:         uuid(),
    questionId,
    texte,
    reponse:    null,
    generePar,
    modele:     null,
    createdAt:  now(),
    reponduAt:  null,
  };
  await db.relances.add(relance);
  return relance;
}

async function listerRelances(questionId) {
  return db.relances
    .where('questionId').equals(questionId)
    .sortBy('createdAt');
}

async function repondreRelance(relanceId, reponse) {
  await db.relances.update(relanceId, {
    reponse,
    reponduAt: now(),
  });
  const relance = await db.relances.get(relanceId);
  if (relance) await mettreAJourActivite(relance.questionId);
}

// ── PRODUCTIONS ─────────────────────────────────────────────

async function creerProduction({ questionId, titre, contenu = '' }) {
  const prod = {
    id:          uuid(),
    questionId,
    titre,
    contenu,
    blocsCites:  [],
    createdAt:   now(),
    updatedAt:   now(),
  };
  await db.productions.add(prod);
  await mettreAJourStatut(questionId, 'produite');
  return prod;
}

async function getProduction(questionId) {
  const prods = await db.productions
    .where('questionId').equals(questionId)
    .sortBy('updatedAt');
  return prods[prods.length - 1] || null;
}

async function mettreAJourProduction(id, contenu) {
  return db.productions.update(id, { contenu, updatedAt: now() });
}

// ── SECOND CERVEAU : stats globales + récolte ────────────────
// La récolte centralise tout ce qui a été produit, pour le
// reprojeter plus tard sur d'autres projets.

async function statsGlobales() {
  const [chantiers, questions, productions] = await Promise.all([
    listerChantiers(),
    db.questions.toArray(),
    db.productions.toArray(),
  ]);
  const actives = questions.filter(q => q.statut !== 'archivee');
  return {
    chantiers:   chantiers.length,
    vivantes:    actives.filter(q => q.statut === 'vivante').length,
    mures:       actives.filter(q => q.statut === 'mure').length,
    produites:   actives.filter(q => q.statut === 'produite').length,
    productions: productions.length,
  };
}

// Réutiliser une production ailleurs : elle devient une ressource
// (type texte) d'une autre question. C'est "projeter sur un autre
// projet". L'intention (pourquoi) reste obligatoire — on ne perd jamais
// le fil de la réutilisation. On garde un lien de provenance dans meta.
async function reutiliserProduction({ production, questionCibleId, pourquoi }) {
  return creerRessource({
    questionId: questionCibleId,
    type:       'texte',
    titre:      production.titre || 'Production réutilisée',
    contenu:    production.contenu || '',
    pourquoi,
    meta: {
      extraitDe: `Production « ${production.titre || 'sans titre'} »`,
    },
  });
}

// Toutes les productions, enrichies de leur question + chantier,
// les plus récentes d'abord. C'est le cœur du "second cerveau".
async function listerRecolte() {
  const prods = await db.productions.orderBy('updatedAt').reverse().toArray();
  const out = [];
  for (const p of prods) {
    const q = await db.questions.get(p.questionId);
    let chantierNom = null;
    if (q && q.chantierId) {
      const c = await db.chantiers.get(q.chantierId);
      chantierNom = c ? c.nom : null;
    }
    out.push({ production: p, question: q || null, chantierNom });
  }
  return out;
}

// ── MATURITÉ ────────────────────────────────────────────────
// Calculée à la volée — jamais stockée brute (cf. SCHEMA.md)

function scoreRegularite(activiteLog = []) {
  const OBJECTIF_JOURS = 5;
  const FENETRE_MS = 14 * 24 * 60 * 60 * 1000; // 14 jours
  const maintenant = now();
  const recent = activiteLog.filter(t => maintenant - t < FENETRE_MS);
  // Jours distincts
  const jours = new Set(recent.map(t => new Date(t).toDateString()));
  return Math.min(100, (jours.size / OBJECTIF_JOURS) * 100);
}

// Régularité globale : les 7 derniers jours + la série en cours.
// Ancre l'habitude "revenir" sans gamification lourde.
async function serieGlobale() {
  const questions = await db.questions.toArray();
  const jours = new Set();
  for (const q of questions) {
    for (const t of (q.activiteLog || [])) jours.add(new Date(t).toDateString());
  }
  const aujourdhui = new Date();
  const initiales = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  const semaine = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(aujourdhui);
    d.setDate(aujourdhui.getDate() - i);
    semaine.push({
      lettre: initiales[d.getDay()],
      actif:  jours.has(d.toDateString()),
      today:  i === 0,
    });
  }
  // Série : jours consécutifs actifs. Tolérance : si rien aujourd'hui
  // mais hier actif, on compte depuis hier (la journée n'est pas finie).
  let serie = 0;
  const start = jours.has(aujourdhui.toDateString()) ? 0 : 1;
  for (let i = start; ; i++) {
    const d = new Date(aujourdhui);
    d.setDate(aujourdhui.getDate() - i);
    if (jours.has(d.toDateString())) serie++;
    else break;
  }
  return { semaine, serie };
}

function calculerMaturite(question, ressources, relances) {
  const matiere    = Math.min(100, (ressources.length / 4) * 100);
  const relRep     = relances.filter(r => r.reponse).length;
  const reflexion  = Math.min(100, (relRep / 3) * 100);
  const regularite = scoreRegularite(question.activiteLog);
  const score      = Math.round((matiere + reflexion + regularite) / 3);
  return { matiere: Math.round(matiere), reflexion: Math.round(reflexion), regularite: Math.round(regularite), score };
}

// Passe automatiquement la question à "mure" si score >= 80
async function evaluerMaturite(questionId) {
  const question  = await db.questions.get(questionId);
  if (!question || question.statut === 'produite' || question.statut === 'archivee') return null;
  const ressources = await listerRessources(questionId);
  const relances   = await listerRelances(questionId);
  const maturite   = calculerMaturite(question, ressources, relances);
  if (maturite.score >= 80 && question.statut === 'vivante') {
    await mettreAJourStatut(questionId, 'mure');
  }
  return maturite;
}

// ── Helpers durée de lecture ─────────────────────────────────

function estimerDureeLecture(texte) {
  // ~200 mots/min en lecture
  const mots = (texte || '').trim().split(/\s+/).length;
  return Math.max(1, Math.round(mots / 200));
}

function iconeType(type) {
  const icons = { texte: '✍️', lien: '🔗', audio: '🎙️', fichier: '📄' };
  return icons[type] || '📎';
}

function tempsRelatif(ts) {
  const diff = Date.now() - ts;
  const min  = Math.floor(diff / 60000);
  const h    = Math.floor(diff / 3600000);
  const j    = Math.floor(diff / 86400000);
  if (j > 0)  return `il y a ${j} jour${j > 1 ? 's' : ''}`;
  if (h > 0)  return `il y a ${h}h`;
  if (min > 0) return `il y a ${min} min`;
  return 'à l\'instant';
}

// ── KV (réglages globaux) ────────────────────────────────────

async function kvGet(key, defaut = null) {
  const row = await db.kv.get(key);
  return row ? row.value : defaut;
}

async function kvSet(key, value) {
  return db.kv.put({ key, value });
}

// ── Export (window.DB) — accessible depuis les autres modules ─
window.DB = {
  // Chantiers
  creerChantier, listerChantiers, archiverChantier,
  // Questions
  creerQuestion, listerQuestions, getQuestion,
  mettreAJourActivite, mettreAJourStatut, questionDormante,
  // Ressources
  creerRessource, listerRessources,
  // Relances
  creerRelance, listerRelances, repondreRelance,
  // Productions
  creerProduction, getProduction, mettreAJourProduction,
  // Second cerveau
  statsGlobales, listerRecolte, reutiliserProduction,
  // Régularité / habitude
  serieGlobale,
  // Maturité
  calculerMaturite, evaluerMaturite,
  // Helpers
  estimerDureeLecture, iconeType, tempsRelatif,
  // KV
  kvGet, kvSet,
};
