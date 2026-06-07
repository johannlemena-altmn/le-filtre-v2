// ============================================================
// chantiers.jsx — Le Filtre v2
// Écrans : liste des chantiers + fiche Question
// ============================================================

const { useState, useEffect, useCallback } = React;

// ── Jauge mini (4 segments dans la liste) ──────────────────
function JaugeMini({ score }) {
  // 4 segments : 0-25 / 25-50 / 50-75 / 75-100
  const segments = [25, 50, 75, 100];
  return (
    <span className="q-mini">
      {segments.map((seuil, i) => {
        const pct  = score;
        const cls  = pct >= seuil ? (pct >= 80 ? 'on' : 'warm') : '';
        return <i key={i} className={cls} />;
      })}
    </span>
  );
}

// Palette des chantiers (accents du design system)
const COULEURS = ['#c47050', '#4a8e50', '#5b7c8d', '#a8743f', '#8a6d9e', '#928975'];

// ── Modal création chantier ────────────────────────────────
function ModalChantier({ onClose, onCreer }) {
  const [nom, setNom]         = useState('');
  const [desc, setDesc]       = useState('');
  const [couleur, setCouleur] = useState(COULEURS[0]);
  const [saving, setSaving]   = useState(false);

  async function handleCreer() {
    if (!nom.trim()) return;
    setSaving(true);
    try {
      await onCreer({ nom: nom.trim(), description: desc.trim(), couleur });
      onClose();
    } catch(e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <p className="h-screen" style={{ fontSize: '19px', marginBottom: '18px' }}>
          Nouveau chantier
        </p>
        <div className="field">
          <label>Nom du chantier</label>
          <input
            type="text"
            placeholder="Lettre — Sobriété matières"
            value={nom}
            onChange={e => setNom(e.target.value)}
            autoFocus
          />
        </div>
        <div className="field">
          <label>Description <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optionnel)</span></label>
          <textarea
            rows={2}
            placeholder="Une phrase sur ce chantier…"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Couleur</label>
          <div className="hint">Pour repérer ce chantier d'un coup d'œil.</div>
          <div className="swatches">
            {COULEURS.map(c => (
              <span
                key={c}
                className={`swatch ${couleur === c ? 'sel' : ''}`}
                style={{ background: c }}
                onClick={() => setCouleur(c)}
              />
            ))}
          </div>
        </div>
        <div className="btn-row">
          <button className="btn primary" onClick={handleCreer} disabled={!nom.trim() || saving}>
            {saving ? 'Création…' : 'Créer le chantier'}
          </button>
          <button className="btn ghost" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

// ── Modal création question ────────────────────────────────
function ModalQuestion({ chantierId, chantierNom, onClose, onCreer }) {
  const [intitule, setIntitule]   = useState('');
  const [intention, setIntention] = useState('');
  const [saving, setSaving]       = useState(false);

  async function handleCreer() {
    if (!intitule.trim() || !intention.trim()) return;
    setSaving(true);
    try {
      await onCreer({ chantierId, intitule: intitule.trim(), intention: intention.trim() });
      onClose();
    } catch(e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <p className="eyebrow">{chantierNom}</p>
        <p className="h-screen" style={{ fontSize: '19px', marginBottom: '18px' }}>
          Nouvelle question vivante
        </p>

        <div className="field">
          <label>La question</label>
          <div className="hint">Formule-la comme une vraie question ouverte.</div>
          <textarea
            rows={2}
            placeholder="Comment raconter le design pour qu'il soit compris ?"
            value={intitule}
            onChange={e => setIntitule(e.target.value)}
            autoFocus
          />
        </div>

        <div className="field key">
          <label>Pourquoi tu creuses ça — l'intention</label>
          <div className="hint" style={{ color: '#9a5034' }}>
            C'est <strong>ça</strong> que tu chercheras dans trois semaines. Sans cette ligne, le fil est mort.
          </div>
          <textarea
            rows={2}
            placeholder="Je veux que le studio low-tech sache présenter ses projets sans jargon…"
            value={intention}
            onChange={e => setIntention(e.target.value)}
          />
        </div>

        <div className="btn-row">
          <button
            className="btn primary"
            onClick={handleCreer}
            disabled={!intitule.trim() || !intention.trim() || saving}
          >
            {saving ? 'Création…' : 'Ouvrir ce fil'}
          </button>
          <button className="btn ghost" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

// ── Une relance (question qui creuse) + sa réponse ─────────
function RelanceItem({ relance, onRepondu }) {
  const [edit, setEdit] = useState(!relance.reponse);
  const [val, setVal]   = useState(relance.reponse || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!val.trim()) return;
    setSaving(true);
    await window.DB.repondreRelance(relance.id, val.trim());
    setEdit(false);
    setSaving(false);
    onRepondu();
  }

  return (
    <div className="relance-card">
      <div className="rq">⟡ {relance.texte}</div>
      {relance.reponse && !edit ? (
        <div className="ra" onClick={() => setEdit(true)}>« {relance.reponse} »</div>
      ) : (
        <>
          <textarea
            rows={2}
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder="Ta réponse — c'est elle qui fait mûrir le fil…"
            style={{ marginTop: '8px' }}
          />
          <button className="btn primary" style={{ marginTop: '8px' }} onClick={save} disabled={!val.trim() || saving}>
            {saving ? '…' : (relance.reponse ? 'Mettre à jour' : 'Répondre')}
          </button>
        </>
      )}
    </div>
  );
}

// ── Fiche Question ─────────────────────────────────────────
function FicheQuestion({ questionId, navigate }) {
  const [question, setQuestion]   = useState(null);
  const [ressources, setRessources] = useState([]);
  const [relances, setRelances]   = useState([]);
  const [maturite, setMaturite]   = useState(null);
  const [chantier, setChantier]   = useState(null);
  const [nouvelleRelance, setNouvelleRelance] = useState('');
  const [loading, setLoading]     = useState(true);

  const charger = useCallback(async () => {
    if (!questionId) return;
    const q  = await window.DB.getQuestion(questionId);
    const rs = await window.DB.listerRessources(questionId);
    const rl = await window.DB.listerRelances(questionId);
    const mt = window.DB.calculerMaturite(q, rs, rl);

    setQuestion(q);
    setRessources(rs);
    setRelances(rl);
    setMaturite(mt);

    if (q.chantierId) {
      const chantiers = await window.DB.listerChantiers();
      setChantier(chantiers.find(c => c.id === q.chantierId) || null);
    }
    setLoading(false);

    // Évaluer si la question doit passer à "mure"
    await window.DB.evaluerMaturite(questionId);
  }, [questionId]);

  useEffect(() => { charger(); }, [charger]);

  async function ajouterRelance() {
    if (!nouvelleRelance.trim()) return;
    await window.DB.creerRelance({ questionId, texte: nouvelleRelance.trim(), generePar: 'manuel' });
    setNouvelleRelance('');
    charger();
  }

  if (loading) return <div className="app"><div className="empty"><span className="e">◐</span><p>Chargement…</p></div></div>;
  if (!question) return <div className="app"><div className="empty"><span className="e">🕳</span><p>Question introuvable.</p></div></div>;

  const estMure = question.statut === 'mure' || question.statut === 'produite';

  return (
    <div className="app screen-enter">
      <div className="topbar">
        <span className="brand">Le Filtre<span className="dot">.</span></span>
      </div>

      <button className="back" onClick={() => navigate('chantiers')}>← Chantiers</button>

      <div className="crumb">
        {chantier ? <>Chantier <b>{chantier.nom}</b> · </> : ''}
        <span style={{ color: estMure ? 'var(--green)' : 'var(--muted)' }}>
          {estMure ? 'fil mûr 🌾' : 'question vivante'}
        </span>
      </div>

      <div className="big-q">{question.intitule}</div>
      <div className="intention" style={{ marginBottom: '18px' }}>
        Mon intention — <em>{question.intention}</em>
      </div>

      {/* Jauge de maturité */}
      {maturite && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>Maturité du fil</span>
            <span className={`pill ${estMure ? 'green' : 'terre'}`}>
              {estMure ? '🌾' : '🌱'} {maturite.score}% — {estMure ? 'mûr' : 'en chemin'}
            </span>
          </div>
          <div className="gauge-mix">
            <div className="row">
              <span className="lbl">Matière</span>
              <span className="bar"><span style={{ width: `${maturite.matiere}%`, background: 'var(--green)' }} /></span>
              <span className="pct">{maturite.matiere}%</span>
            </div>
            <div className="row">
              <span className="lbl">Réflexion</span>
              <span className="bar"><span style={{ width: `${maturite.reflexion}%`, background: 'var(--blue)' }} /></span>
              <span className="pct">{maturite.reflexion}%</span>
            </div>
            <div className="row">
              <span className="lbl">Régularité</span>
              <span className="bar"><span style={{ width: `${maturite.regularite}%`, background: 'var(--terre)' }} /></span>
              <span className="pct">{maturite.regularite}%</span>
            </div>
          </div>
          <p style={{ fontSize: '11.5px', color: estMure ? '#356b3a' : 'var(--muted)', marginTop: '10px' }}>
            {estMure
              ? 'Ce fil est mûr : assez de matière, les relances sont traitées, tu y es revenu régulièrement. Tu peux le faire sortir.'
              : 'La jauge mêle trois choses : la matière accrochée, les relances auxquelles tu as répondu, et la régularité de tes retours.'}
          </p>
        </div>
      )}

      {/* Le fil */}
      <div className="section-t">Le fil — {ressources.length} connexion{ressources.length !== 1 ? 's' : ''}</div>

      {ressources.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
          <p style={{ fontSize: '13.5px' }}>Pas encore de ressource accrochée à ce fil.</p>
          <p style={{ fontSize: '12px', marginTop: '6px' }}>Capture quelque chose — une vidéo, un article, une note vocale.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '4px 16px' }}>
          {ressources.map(r => (
            <div key={r.id} className="conn">
              <div className="ic">{window.DB.iconeType(r.type)}</div>
              <div>
                <div className="title">{r.titre}</div>
                <div className="why">« {r.pourquoi} »</div>
                <div className="when">
                  {window.DB.tempsRelatif(r.createdAt)}
                  {r.meta.dureeLectureMin ? ` · ≈ ${r.meta.dureeLectureMin} min` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Les relances — penser, pas seulement empiler */}
      <div className="section-t">
        Relances — {relances.filter(r => r.reponse).length}/{relances.length} traitée{relances.filter(r => r.reponse).length > 1 ? 's' : ''}
      </div>
      <div className="card">
        {relances.length === 0 && (
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '12px' }}>
            Pose-toi une question qui creuse. Y répondre fait <b>penser</b> le fil — pas seulement l'empiler — et fait monter la maturité.
          </p>
        )}
        {relances.map(r => (
          <RelanceItem key={r.id} relance={r} onRepondu={charger} />
        ))}
        <div style={{ marginTop: relances.length ? '12px' : 0 }}>
          <textarea
            rows={2}
            value={nouvelleRelance}
            onChange={e => setNouvelleRelance(e.target.value)}
            placeholder="Quelle question te creuse ? (ex. Laquelle de tes ressources te contredit ?)"
          />
          <button className="btn" style={{ marginTop: '8px' }} onClick={ajouterRelance} disabled={!nouvelleRelance.trim()}>
            + Ajouter une relance
          </button>
        </div>
      </div>

      <div className="btn-row" style={{ marginTop: '16px' }}>
        {estMure ? (
          <button className="btn primary" onClick={() => navigate('produire', { questionId })}>
            🌾 Produire — le fil est mûr
          </button>
        ) : (
          <>
            <button className="btn" disabled title="S'active tout seul quand le fil est mûr (score ≥ 80%)">
              Produire — fil pas encore mûr ({maturite?.score || 0}%)
            </button>
            <button
              className="btn ghost"
              style={{ fontSize: '12.5px' }}
              onClick={() => navigate('produire', { questionId })}
            >
              Je le sens mûr — produire quand même →
            </button>
          </>
        )}
        <button className="btn terre" onClick={() => navigate('capture', { questionId })}>
          + Ajouter une connexion
        </button>
      </div>

      <div style={{ height: '24px' }} />
    </div>
  );
}

// ── Modal réutiliser une production ailleurs ───────────────
function ModalReutiliser({ production, sourceQuestionId, onClose, onFait }) {
  const [questions, setQuestions] = useState([]);
  const [cible, setCible]         = useState('');
  const [pourquoi, setPourquoi]   = useState('');
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    window.DB.listerQuestions().then(qs => {
      setQuestions(qs.filter(q =>
        q.id !== sourceQuestionId &&
        (q.statut === 'vivante' || q.statut === 'mure')
      ));
    });
  }, [sourceQuestionId]);

  async function handle() {
    if (!cible || !pourquoi.trim()) return;
    setSaving(true);
    try {
      await window.DB.reutiliserProduction({ production, questionCibleId: cible, pourquoi: pourquoi.trim() });
      onFait(cible);
    } catch(e) {
      alert(e.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <p className="eyebrow">Second cerveau · réutiliser</p>
        <p className="h-screen" style={{ fontSize: '19px', marginBottom: '6px' }}>
          Projeter sur un autre fil
        </p>
        <p className="sub-screen" style={{ marginBottom: '16px' }}>
          « {production.titre || 'Production'} » deviendra une ressource du fil que tu choisis.
        </p>

        {questions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
            Aucune autre question vivante où la projeter.<br />Ouvre d'abord un fil ailleurs.
          </div>
        ) : (
          <>
            <div className="field">
              <label>Vers quel fil&nbsp;?</label>
              <select value={cible} onChange={e => setCible(e.target.value)}>
                <option value="">— Choisir une question —</option>
                {questions.map(q => (
                  <option key={q.id} value={q.id}>{q.intitule}</option>
                ))}
              </select>
            </div>

            <div className="field key">
              <label>Pourquoi ça compte pour ce fil&nbsp;? — une ligne</label>
              <div className="hint" style={{ color: '#9a5034' }}>
                Sans cette ligne, la reprise se perd. C'est elle qui relie l'ancien au nouveau.
              </div>
              <textarea
                rows={2}
                placeholder="M'apporte un angle déjà mûri sur… / Brique réutilisable pour…"
                value={pourquoi}
                onChange={e => setPourquoi(e.target.value)}
              />
            </div>

            <div className="btn-row">
              <button className="btn primary" onClick={handle} disabled={!cible || !pourquoi.trim() || saving}>
                {saving ? 'Projection…' : 'Projeter sur ce fil'}
              </button>
              <button className="btn ghost" onClick={onClose}>Annuler</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Écran Chantiers ────────────────────────────────────────
function EcranChantiers({ navigate, activeQuestion, setActiveQuestion }) {
  const [chantiers, setChantiers]         = useState([]);
  const [questionsMap, setQuestionsMap]   = useState({});
  const [maturiteMap, setMaturiteMap]     = useState({});
  const [stats, setStats]                 = useState(null);
  const [recolte, setRecolte]             = useState([]);
  const [recolteOuverte, setRecolteOuverte] = useState(false);
  const [modalReutiliser, setModalReutiliser] = useState(null); // { production, sourceQuestionId }
  const [showModalC, setShowModalC]       = useState(false);
  const [modalQuestion, setModalQuestion] = useState(null); // { chantierId, chantierNom }
  const [loading, setLoading]             = useState(true);

  const charger = useCallback(async () => {
    const cs = await window.DB.listerChantiers();
    setChantiers(cs);

    const qMap = {};
    const mMap = {};

    for (const c of cs) {
      const qs = await window.DB.listerQuestions(c.id);
      qMap[c.id] = qs;
      for (const q of qs) {
        const rs = await window.DB.listerRessources(q.id);
        const rl = await window.DB.listerRelances(q.id);
        mMap[q.id] = window.DB.calculerMaturite(q, rs, rl);
      }
    }
    setQuestionsMap(qMap);
    setMaturiteMap(mMap);
    setStats(await window.DB.statsGlobales());
    setRecolte(await window.DB.listerRecolte());
    setLoading(false);
  }, []);

  useEffect(() => { charger(); }, [charger]);

  // Si une question active est demandée, afficher sa fiche
  if (activeQuestion) {
    return (
      <FicheQuestion
        questionId={activeQuestion}
        navigate={(screen, params) => {
          setActiveQuestion(null);
          navigate(screen, params);
        }}
      />
    );
  }

  async function handleCreerChantier(data) {
    await window.DB.creerChantier(data);
    await charger();
  }

  async function handleCreerQuestion(data) {
    await window.DB.creerQuestion(data);
    await charger();
  }

  function ouvrirQuestion(id) {
    setActiveQuestion(id);
  }

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

  return (
    <div className="app screen-enter">
      <div className="topbar">
        <span className="brand">Le Filtre<span className="dot">.</span></span>
        <span className="tagline">rituel de pensée</span>
      </div>

      <div className="eyebrow">Tes projets</div>
      <p className="h-screen">Tes chantiers, d'un coup d'œil.</p>
      <p className="sub-screen">Chaque chantier abrite des questions vivantes. Ce qui mûrit se récolte en bas.</p>

      {stats && chantiers.length > 0 && (
        <div className="dash">
          <div className="stat">
            <div className="num">{stats.chantiers}</div>
            <div className="lbl">projets</div>
          </div>
          <div className="stat">
            <div className="num">{stats.vivantes}</div>
            <div className="lbl">vivantes</div>
          </div>
          <div className="stat">
            <div className="num warm">{stats.mures}</div>
            <div className="lbl">mûrs</div>
          </div>
          <div className="stat">
            <div className="num go">{stats.productions}</div>
            <div className="lbl">récoltés</div>
          </div>
        </div>
      )}

      {chantiers.length === 0 ? (
        <div className="empty">
          <span className="e">▦</span>
          <p>Pas encore de chantier.<br />Un chantier, c'est un projet long — la Lettre, le mémoire, le studio…</p>
          <button className="btn terre" style={{ marginTop: '20px', width: 'auto', padding: '12px 24px' }} onClick={() => setShowModalC(true)}>
            + Créer mon premier chantier
          </button>
        </div>
      ) : (
        <>
          {chantiers.map(c => {
            const qs     = questionsMap[c.id] || [];
            const mures  = qs.filter(q => q.statut === 'mure').length;
            return (
              <div key={c.id} className="chantier" style={{ borderLeft: c.couleur ? `4px solid ${c.couleur}` : undefined }}>
                <h3>{c.nom}</h3>
                {c.description && (
                  <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', margin: '2px 0 6px' }}>{c.description}</p>
                )}
                <div className="ch-meta">
                  {qs.length} question{qs.length !== 1 ? 's' : ''} vivante{qs.length !== 1 ? 's' : ''}
                  {mures > 0 ? ` · ${mures} fil${mures > 1 ? 's' : ''} prêt${mures > 1 ? 's' : ''}` : ''}
                </div>

                {qs.map(q => {
                  const m = maturiteMap[q.id];
                  return (
                    <div key={q.id} className="q-row" onClick={() => ouvrirQuestion(q.id)}>
                      <span className="q-text">{q.intitule}</span>
                      {m && <JaugeMini score={m.score} />}
                    </div>
                  );
                })}

                <div style={{ padding: '8px 0' }}>
                  <button
                    className="btn ghost"
                    style={{ fontSize: '12px', padding: '7px 0' }}
                    onClick={() => setModalQuestion({ chantierId: c.id, chantierNom: c.nom })}
                  >
                    + Nouvelle question
                  </button>
                </div>
              </div>
            );
          })}

          <button className="btn" style={{ marginTop: '4px', marginBottom: '20px' }} onClick={() => setShowModalC(true)}>
            + Nouveau chantier
          </button>
        </>
      )}

      {/* ── La récolte : second cerveau — tout ce qui a été produit ── */}
      {recolte.length > 0 && (
        <div className="card" style={{ marginTop: '8px', marginBottom: '20px' }}>
          <div className="recolte-head" onClick={() => setRecolteOuverte(o => !o)}>
            <div>
              <div className="section-t" style={{ margin: 0 }}>🌾 Ta récolte</div>
              <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
                {recolte.length} production{recolte.length !== 1 ? 's' : ''} — réutilisable pour tes prochains projets
              </div>
            </div>
            <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{recolteOuverte ? '▲' : '▼'}</span>
          </div>

          {recolteOuverte && recolte.map(({ production, question, chantierNom }) => (
            <div key={production.id} className="recolte-item">
              <div className="rc-ic">📜</div>
              <div
                style={{ flex: 1 }}
                onClick={() => question && navigate('produire', { questionId: question.id })}
              >
                <div className="rc-title">{production.titre || (question && question.intitule) || 'Sans titre'}</div>
                <div className="rc-meta">
                  {chantierNom ? `${chantierNom} · ` : ''}{window.DB.tempsRelatif(production.updatedAt)}
                </div>
              </div>
              <button
                className="rc-reuse"
                title="Projeter sur un autre fil"
                onClick={(e) => { e.stopPropagation(); setModalReutiliser({ production, sourceQuestionId: question ? question.id : null }); }}
              >
                ↪
              </button>
            </div>
          ))}
        </div>
      )}

      {showModalC && (
        <ModalChantier
          onClose={() => setShowModalC(false)}
          onCreer={handleCreerChantier}
        />
      )}

      {modalQuestion && (
        <ModalQuestion
          chantierId={modalQuestion.chantierId}
          chantierNom={modalQuestion.chantierNom}
          onClose={() => setModalQuestion(null)}
          onCreer={handleCreerQuestion}
        />
      )}

      {modalReutiliser && (
        <ModalReutiliser
          production={modalReutiliser.production}
          sourceQuestionId={modalReutiliser.sourceQuestionId}
          onClose={() => setModalReutiliser(null)}
          onFait={(cibleId) => { setModalReutiliser(null); navigate('question', { questionId: cibleId }); }}
        />
      )}
    </div>
  );
}

window.EcranChantiers = EcranChantiers;
