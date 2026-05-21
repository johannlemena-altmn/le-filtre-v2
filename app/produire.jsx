// ============================================================
// produire.jsx — Le Filtre v2
// Écran Produire : éditeur Markdown + colonne matière du fil
// Accessible uniquement quand statut === "mure"
// ============================================================

const { useState, useEffect, useCallback, useRef } = React;

function EcranProduire({ navigate, params = {} }) {
  const { questionId } = params;
  const [question, setQuestion]     = useState(null);
  const [ressources, setRessources] = useState([]);
  const [relances, setRelances]     = useState([]);
  const [production, setProduction] = useState(null);
  const [titre, setTitre]           = useState('');
  const [contenu, setContenu]       = useState('');
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [loading, setLoading]       = useState(true);
  const saveTimer                   = useRef(null);

  const charger = useCallback(async () => {
    if (!questionId) return;
    const q  = await window.DB.getQuestion(questionId);
    const rs = await window.DB.listerRessources(questionId);
    const rl = await window.DB.listerRelances(questionId);
    const p  = await window.DB.getProduction(questionId);

    setQuestion(q);
    setRessources(rs);
    setRelances(rl);

    if (p) {
      setProduction(p);
      setTitre(p.titre || '');
      setContenu(p.contenu || '');
    } else {
      // Pré-remplir le titre depuis la question
      setTitre(q?.intitule || '');
      // Pré-remplir le brouillon avec la matière du fil
      const amorce = genererAmorce(q, rs, rl);
      setContenu(amorce);
    }
    setLoading(false);
  }, [questionId]);

  useEffect(() => { charger(); }, [charger]);

  // Auto-save après 1.5s d'inactivité
  async function sauvegarder(nouveauContenu) {
    clearTimeout(saveTimer.current);
    setSaved(false);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        if (production) {
          await window.DB.mettreAJourProduction(production.id, nouveauContenu);
        } else {
          const p = await window.DB.creerProduction({ questionId, titre, contenu: nouveauContenu });
          setProduction(p);
        }
        setSaved(true);
      } finally {
        setSaving(false);
      }
    }, 1500);
  }

  function handleContenu(val) {
    setContenu(val);
    sauvegarder(val);
  }

  // Insérer un bloc depuis la matière du fil
  function insererBloc(ressource) {
    const ligne = `\n\n> ${ressource.pourquoi}\n> — *${ressource.titre}*\n`;
    const nouveau = contenu + ligne;
    setContenu(nouveau);
    sauvegarder(nouveau);
  }

  if (loading) {
    return (
      <div className="app">
        <div className="topbar"><span className="brand">Le Filtre<span className="dot">.</span></span></div>
        <div className="empty"><span className="e">◐</span><p>Chargement…</p></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="app screen-enter">
        <div className="topbar"><span className="brand">Le Filtre<span className="dot">.</span></span></div>
        <div className="empty"><span className="e">🕳</span><p>Question introuvable.</p></div>
      </div>
    );
  }

  const relancesRepondues = relances.filter(r => r.reponse);

  return (
    <div className="app screen-enter">
      <div className="topbar">
        <span className="brand">Le Filtre<span className="dot">.</span></span>
      </div>

      <button className="back" onClick={() => navigate('question', { questionId })}>
        ← La question
      </button>

      <div className="crumb">
        <span className="pill green">🌾 fil mûr</span>
      </div>

      <p className="h-screen">Le fil est mûr. Fais-le sortir.</p>
      <p className="sub-screen">Tout ce que tu as accumulé et pensé est là, à portée.</p>

      {/* Statut sauvegarde */}
      <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '10px', textAlign: 'right' }}>
        {saving ? '⏳ sauvegarde…' : saved ? '✓ sauvegardé' : ''}
      </div>

      {/* Desktop : grille 2 colonnes */}
      <div className="produce-grid">
        {/* Éditeur */}
        <div>
          <div className="editor">
            <input
              type="text"
              value={titre}
              onChange={e => setTitre(e.target.value)}
              placeholder="Titre de ta production…"
              style={{
                fontFamily: 'Fraunces, serif',
                fontSize: '21px',
                fontWeight: '600',
                border: 'none',
                background: 'transparent',
                padding: '0 0 8px',
                marginBottom: '8px',
                borderBottom: '1px dashed var(--border)',
                color: 'var(--ink)',
                width: '100%',
              }}
            />
            <div className="esub" style={{ marginBottom: '12px' }}>
              Brouillon — {question.intitule}
            </div>
            <textarea
              value={contenu}
              onChange={e => handleContenu(e.target.value)}
              placeholder="Commence à écrire ici… Glisse un bloc depuis la matière du fil pour citer une source."
              style={{
                minHeight: '320px',
                border: 'none',
                background: 'transparent',
                padding: '0',
                resize: 'vertical',
                fontSize: '14px',
                lineHeight: '1.7',
                width: '100%',
                color: 'var(--ink)',
              }}
            />
          </div>

          <div className="btn-row" style={{ marginTop: '4px' }}>
            <button
              className="btn primary"
              onClick={async () => {
                if (!production) {
                  const p = await window.DB.creerProduction({ questionId, titre, contenu });
                  setProduction(p);
                } else {
                  await window.DB.mettreAJourProduction(production.id, contenu);
                }
                setSaved(true);
                alert('Production sauvegardée ✓\nExport Markdown disponible dans le slice 3.');
              }}
            >
              Sauvegarder
            </button>
            <button className="btn ghost" onClick={() => navigate('question', { questionId })}>
              Retour au fil
            </button>
          </div>
        </div>

        {/* Matière du fil */}
        <aside>
          <div className="matiere">
            <h4>La matière du fil</h4>

            {ressources.map(r => (
              <div key={r.id} className="mat-item" onClick={() => insererBloc(r)}>
                <div className="mt">{window.DB.iconeType(r.type)} {r.titre}</div>
                <div className="mq">« {r.pourquoi} »</div>
              </div>
            ))}

            {relancesRepondues.map(r => (
              <div key={r.id} className="mat-item" onClick={() => {
                const ligne = `\n\n> ${r.reponse}\n> — *Relance : ${r.texte}*\n`;
                const nouveau = contenu + ligne;
                setContenu(nouveau);
                sauvegarder(nouveau);
              }}>
                <div className="mt">⟡ Relance répondue</div>
                <div className="mq">« {r.reponse} »</div>
              </div>
            ))}

            {ressources.length === 0 && relancesRepondues.length === 0 && (
              <p style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic' }}>
                Pas encore de matière. Capture des ressources et réponds aux relances.
              </p>
            )}
          </div>

          <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '10px', lineHeight: '1.5' }}>
            Clique sur un bloc pour l'insérer comme citation dans l'éditeur.
          </p>
        </aside>
      </div>

      <div style={{ height: '24px' }} />
    </div>
  );
}

// ── Génère une amorce de brouillon depuis le fil ───────────
function genererAmorce(question, ressources, relances) {
  if (!question) return '';
  let texte = '';

  if (ressources.length > 0) {
    texte += `# ${question.intitule}\n\n`;
    texte += `*Mon intention : ${question.intention}*\n\n---\n\n`;
    texte += `## Ce que j'ai accumulé\n\n`;
    ressources.forEach(r => {
      texte += `- **${r.titre}** — « ${r.pourquoi} »\n`;
    });
    texte += '\n';
  }

  const repondues = relances.filter(r => r.reponse);
  if (repondues.length > 0) {
    texte += `## Ce que j'ai pensé\n\n`;
    repondues.forEach(r => {
      texte += `> ${r.texte}\n> → ${r.reponse}\n\n`;
    });
  }

  texte += `## Ce que ça donne\n\n[ Écris ici — laisse le fil te guider. ]\n`;
  return texte;
}

window.EcranProduire = EcranProduire;
