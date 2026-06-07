// ============================================================
// rituel.jsx — Le Filtre v2
// Écran Rituel : question dormante + bouton "Reprendre ce fil"
// ============================================================

const { useState, useEffect, useCallback } = React;

function EcranRituel({ navigate }) {
  const [question, setQuestion]   = useState(null);
  const [ressources, setRessources] = useState([]);
  const [relances, setRelances]   = useState([]);
  const [maturite, setMaturite]   = useState(null);
  const [chantier, setChantier]   = useState(null);
  const [serie, setSerie]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [vide, setVide]           = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    setSerie(await window.DB.serieGlobale());
    const q = await window.DB.questionDormante();
    if (!q) {
      setVide(true);
      setLoading(false);
      return;
    }
    setQuestion(q);

    const rs = await window.DB.listerRessources(q.id);
    const rl = await window.DB.listerRelances(q.id);
    setRessources(rs);
    setRelances(rl);
    setMaturite(window.DB.calculerMaturite(q, rs, rl));

    if (q.chantierId) {
      const chantiers = await window.DB.listerChantiers();
      setChantier(chantiers.find(c => c.id === q.chantierId) || null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { charger(); }, [charger]);

  // Passer à la question suivante la plus dormante (excluant la courante)
  async function autreQuestion() {
    const toutes = await window.DB.listerQuestions();
    const autres = toutes
      .filter(q => q.id !== question?.id && q.statut !== 'archivee')
      .sort((a, b) => a.derniereActiviteAt - b.derniereActiviteAt);
    if (autres.length > 0) {
      const q   = autres[0];
      const rs  = await window.DB.listerRessources(q.id);
      const rl  = await window.DB.listerRelances(q.id);
      const cs  = await window.DB.listerChantiers();
      setQuestion(q);
      setRessources(rs);
      setRelances(rl);
      setMaturite(window.DB.calculerMaturite(q, rs, rl));
      setChantier(cs.find(c => c.id === q.chantierId) || null);
    }
  }

  function joursDormance() {
    if (!question) return 0;
    return Math.round((Date.now() - question.derniereActiviteAt) / 86400000);
  }

  function jauge(score) {
    // 6 segments
    const segments = [0, 1, 2, 3, 4, 5].map(i => {
      const seuil = (i + 1) * (100 / 6);
      if (score >= seuil && score >= 80) return 'on';
      if (score >= seuil) return 'warm';
      return '';
    });
    return segments;
  }

  // Relance du jour : première relance non répondue, ou une phrase d'invite par défaut
  const relanceDuJour = relances.find(r => !r.reponse) || null;

  if (loading) {
    return (
      <div className="app">
        <div className="topbar">
          <span className="brand">Le Filtre<span className="dot">.</span></span>
        </div>
        <div className="empty"><span className="e">◐</span><p>Chargement…</p></div>
      </div>
    );
  }

  if (vide || !question) {
    return (
      <div className="app screen-enter">
        <div className="topbar">
          <span className="brand">Le Filtre<span className="dot">.</span></span>
          <span className="tagline">rituel de pensée</span>
        </div>
        <div className="eyebrow">Ton rituel · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        <div className="empty" style={{ paddingTop: '32px' }}>
          <span className="e">🌱</span>
          <p>Aucune question vivante pour l'instant.<br />Crée ton premier chantier et ouvre un fil.</p>
          <button
            className="btn terre"
            style={{ marginTop: '20px', width: 'auto', padding: '12px 24px' }}
            onClick={() => navigate('chantiers')}
          >
            Ouvrir mes chantiers
          </button>
        </div>
        <p className="gentle">
          Une idée vient de passer&nbsp;? <a onClick={() => navigate('capture')}>Capture-la</a> avant qu'elle s'efface.
        </p>
      </div>
    );
  }

  const jours     = joursDormance();
  const segments  = jauge(maturite?.score || 0);
  const estMure   = question.statut === 'mure';

  return (
    <div className="app screen-enter">
      <div className="topbar">
        <span className="brand">Le Filtre<span className="dot">.</span></span>
        <span className="tagline">rituel de pensée</span>
      </div>

      <div className="eyebrow">
        Ton rituel · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>

      {serie && (
        <div className="serie">
          <div className="serie-week">
            {serie.semaine.map((d, i) => (
              <span key={i} className={`day${d.actif ? ' on' : ''}${d.today ? ' today' : ''}`}>
                {d.lettre}
              </span>
            ))}
          </div>
          <div className={`serie-count${serie.serie > 0 ? '' : ' off'}`}>
            {serie.serie > 0 ? `🔥 ${serie.serie} jour${serie.serie > 1 ? 's' : ''}` : 'commence ta série'}
          </div>
        </div>
      )}

      <p className="h-screen">Une question t'attend.</p>
      <p className="sub-screen">Dix minutes. Une seule chose à faire&nbsp;: penser un peu plus loin.</p>

      <div className="ritual-card">
        <div className="dormant">
          {jours === 0
            ? '● Active aujourd\'hui'
            : `● Ce fil dort depuis ${jours} jour${jours > 1 ? 's' : ''}`}
        </div>

        <div className="big-q">{question.intitule}</div>

        <div className="intention">
          Pourquoi je creuse ça — <em>{question.intention}</em>
        </div>

        <div className="ritual-meta">
          <span>📎 {ressources.length} ressource{ressources.length !== 1 ? 's' : ''}</span>
          {chantier && <span>🧩 {chantier.nom}</span>}
          <span>{estMure ? '🌾 Mûr' : `🌱 Maturité ${maturite?.score || 0}%`}</span>
        </div>

        <div className="gauge">
          {segments.map((cls, i) => <i key={i} className={cls} />)}
        </div>

        {relanceDuJour && (
          <div className="relance-box">
            <div className="relance-box-tag" style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              color: 'var(--blue)',
              marginBottom: '6px',
            }}>⟡ Relance du jour</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontStyle: 'italic', color: 'var(--ink)' }}>
              « {relanceDuJour.texte} »
            </div>
          </div>
        )}

        {!relanceDuJour && (
          <div style={{
            background: 'var(--blue-soft)',
            border: '1px solid #c6d4d9',
            borderRadius: '12px',
            padding: '14px',
            margin: '18px 0',
          }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontStyle: 'italic', color: 'var(--ink)' }}>
              « Quelle connexion entre tes ressources tu n'as pas encore vue&nbsp;? »
            </div>
          </div>
        )}

        <div className="btn-row">
          <button
            className="btn primary"
            onClick={() => navigate('question', { questionId: question.id })}
          >
            Reprendre ce fil — 10 min
          </button>
          <button className="btn ghost" onClick={autreQuestion}>
            Plus tard — une autre
          </button>
        </div>
      </div>

      <p className="gentle">
        Une idée vient de passer&nbsp;? <a onClick={() => navigate('capture')}>Capture-la</a> avant qu'elle s'efface.
      </p>

      <div style={{ height: '16px' }} />
    </div>
  );
}

window.EcranRituel = EcranRituel;
