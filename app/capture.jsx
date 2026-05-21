// ============================================================
// capture.jsx — Le Filtre v2
// Écran de capture : texte / lien / audio / fichier
// Le geste tient en ~10 secondes. Champ "pourquoi" obligatoire.
// ============================================================

const { useState, useEffect, useRef, useCallback } = React;

const MODES = [
  { id: 'texte',   emoji: '✍️',  nom: 'Texte',   desc: 'note, pensée' },
  { id: 'lien',    emoji: '🔗',  nom: 'Lien',    desc: 'article, vidéo' },
  { id: 'audio',   emoji: '🎙️', nom: 'Audio',   desc: 'voix, dictée' },
  { id: 'fichier', emoji: '📎',  nom: 'Fichier', desc: 'PDF, image' },
];

// ── Sélecteur de question ──────────────────────────────────
function SelectQuestion({ value, onChange, excludeId }) {
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nouvelleQ, setNouvelleQ] = useState('');
  const [nouvelleI, setNouvelleI] = useState('');

  useEffect(() => {
    window.DB.listerQuestions().then(qs => {
      setQuestions(qs.filter(q => q.statut !== 'archivee' && q.statut !== 'produite'));
    });
  }, []);

  const selected = questions.find(q => q.id === value);

  async function creerEtSelectionner() {
    if (!nouvelleQ.trim() || !nouvelleI.trim()) return;
    const q = await window.DB.creerQuestion({
      chantierId: null,
      intitule:   nouvelleQ.trim(),
      intention:  nouvelleI.trim(),
    });
    setQuestions(prev => [...prev, q]);
    onChange(q.id);
    setShowModal(false);
    setNouvelleQ('');
    setNouvelleI('');
  }

  return (
    <>
      <div className="field">
        <label>L'accrocher à une question</label>
        <div className="hint">Une ressource ne flotte jamais seule.</div>
        <select
          value={value || ''}
          onChange={e => {
            if (e.target.value === '__new__') setShowModal(true);
            else onChange(e.target.value);
          }}
          style={{ marginBottom: '6px' }}
        >
          <option value="">— Choisir une question —</option>
          {questions.map(q => (
            <option key={q.id} value={q.id}>{q.intitule}</option>
          ))}
          <option value="__new__">+ Nouvelle question…</option>
        </select>
        {selected && (
          <div className="intention" style={{ marginTop: '6px', fontSize: '12px' }}>
            <em>{selected.intention}</em>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <p className="h-screen" style={{ fontSize: '18px', marginBottom: '16px' }}>
              Nouvelle question vivante
            </p>
            <div className="field">
              <label>La question</label>
              <textarea
                rows={2}
                placeholder="Qu'est-ce qui me questionne ?"
                value={nouvelleQ}
                onChange={e => setNouvelleQ(e.target.value)}
                autoFocus
              />
            </div>
            <div className="field key">
              <label>Pourquoi tu creuses ça</label>
              <div className="hint" style={{ color: '#9a5034' }}>Sans cette ligne, le fil meurt.</div>
              <textarea
                rows={2}
                placeholder="Je veux comprendre… pour pouvoir…"
                value={nouvelleI}
                onChange={e => setNouvelleI(e.target.value)}
              />
            </div>
            <div className="btn-row">
              <button
                className="btn primary"
                onClick={creerEtSelectionner}
                disabled={!nouvelleQ.trim() || !nouvelleI.trim()}
              >
                Créer et sélectionner
              </button>
              <button className="btn ghost" onClick={() => setShowModal(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Mode Texte ─────────────────────────────────────────────
function ChampTexte({ valeur, onChange }) {
  const duree = valeur ? window.DB.estimerDureeLecture(valeur) : null;
  return (
    <div className="field">
      <label>La ressource</label>
      <div className="hint">Une note, une pensée, un titre de livre…</div>
      <textarea
        rows={3}
        placeholder="Titre, note, passage…"
        value={valeur}
        onChange={e => onChange(e.target.value)}
        autoFocus
      />
      {duree && (
        <div className="cost">⏱ durée estimée : <b>≈ {duree} min</b></div>
      )}
    </div>
  );
}

// ── Mode Lien ──────────────────────────────────────────────
function ChampLien({ url, titre, onUrl, onTitre }) {
  return (
    <>
      <div className="field">
        <label>URL</label>
        <input
          type="url"
          placeholder="https://…"
          value={url}
          onChange={e => onUrl(e.target.value)}
          autoFocus
        />
      </div>
      <div className="field">
        <label>Titre <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optionnel)</span></label>
        <input
          type="text"
          placeholder="Article — Le design narratif"
          value={titre}
          onChange={e => onTitre(e.target.value)}
        />
      </div>
    </>
  );
}

// ── Mode Audio ─────────────────────────────────────────────
function ChampAudio({ onTranscription }) {
  const [etat, setEtat]         = useState('idle'); // idle | enregistrement | transcription | done
  const [texte, setTexte]       = useState('');
  const mediaRef                = useRef(null);
  const chunksRef               = useRef([]);
  const recognitionRef          = useRef(null);

  function demarrer() {
    // Web Speech API (transcription en direct)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR();
      rec.lang = 'fr-FR';
      rec.continuous = true;
      rec.interimResults = true;
      let final = '';

      rec.onresult = e => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
          else interim += e.results[i][0].transcript;
        }
        const tout = final + interim;
        setTexte(tout);
        onTranscription(tout.trim());
      };
      rec.onerror = () => setEtat('idle');
      rec.onend   = () => setEtat('done');
      rec.start();
      recognitionRef.current = rec;
      setEtat('enregistrement');
    } else {
      alert('La reconnaissance vocale n\'est pas disponible dans ce navigateur. Essaie Chrome ou Safari.');
    }
  }

  function arreter() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setEtat('done');
  }

  return (
    <div className="field">
      <label>Note vocale</label>
      <div className="hint">Dicte — la transcription apparaît en direct.</div>

      {etat === 'idle' && (
        <button className="btn terre" onClick={demarrer}>
          🎙️ Commencer la dictée
        </button>
      )}
      {etat === 'enregistrement' && (
        <>
          <div style={{
            background: 'var(--terre-soft)', border: '1px solid #e6c9b6',
            borderRadius: '10px', padding: '12px', marginBottom: '10px',
            fontSize: '13.5px', minHeight: '60px', color: 'var(--ink-soft)',
            fontFamily: 'Fraunces, serif', fontStyle: 'italic'
          }}>
            {texte || <span style={{ color: 'var(--muted)' }}>En écoute…</span>}
          </div>
          <button className="btn" onClick={arreter}>⏹ Arrêter</button>
        </>
      )}
      {etat === 'done' && (
        <>
          <textarea
            rows={3}
            value={texte}
            onChange={e => { setTexte(e.target.value); onTranscription(e.target.value); }}
          />
          <button className="btn ghost" style={{ marginTop: '8px', fontSize: '12px' }} onClick={() => { setTexte(''); setEtat('idle'); onTranscription(''); }}>
            Recommencer
          </button>
        </>
      )}
    </div>
  );
}

// ── Mode Fichier ───────────────────────────────────────────
function ChampFichier({ fichier, onFichier, titre, onTitre }) {
  const inputRef = useRef(null);
  const estPDF   = fichier && fichier.type === 'application/pdf' && fichier.size > 1_000_000;

  return (
    <div className="field">
      <label>Fichier</label>
      <div className="hint">PDF, image, document.</div>

      {!fichier ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt,.md,.png,.jpg,.jpeg,.webp"
            style={{ display: 'none' }}
            onChange={e => onFichier(e.target.files[0])}
          />
          <button className="btn" onClick={() => inputRef.current.click()}>
            📎 Choisir un fichier
          </button>
        </>
      ) : (
        <>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', fontSize: '13px', marginBottom: '10px' }}>
            <strong>{fichier.name}</strong>
            <span style={{ color: 'var(--muted)', marginLeft: '8px' }}>
              {(fichier.size / 1024 / 1024).toFixed(1)} Mo
            </span>
          </div>

          {estPDF && (
            <div className="pdf-note">
              🌿 PDF lourd détecté. L'app extraira seulement <strong>ce qui répond à ta question</strong> — c'est ton intention ci-dessous qui sert de filtre. Frugal, et plus utile.
            </div>
          )}

          <button className="btn ghost" style={{ marginTop: '8px', fontSize: '12px' }} onClick={() => onFichier(null)}>
            Changer de fichier
          </button>
        </>
      )}

      <div className="field" style={{ marginTop: '12px' }}>
        <label>Titre <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optionnel)</span></label>
        <input type="text" placeholder="Rapport ADEME — réemploi" value={titre} onChange={e => onTitre(e.target.value)} />
      </div>
    </div>
  );
}

// ── Écran principal Capture ────────────────────────────────
function EcranCapture({ navigate, params = {} }) {
  const [mode, setMode]           = useState('texte');
  const [texte, setTexte]         = useState('');
  const [url, setUrl]             = useState('');
  const [titreLien, setTitreLien] = useState('');
  const [transcription, setTranscription] = useState('');
  const [fichier, setFichier]     = useState(null);
  const [titreFichier, setTitreFichier] = useState('');
  const [pourquoi, setPourquoi]   = useState('');
  const [questionId, setQuestionId] = useState(params.questionId || '');
  const [saving, setSaving]       = useState(false);

  // Pré-sélectionner la question si on arrive de la fiche
  useEffect(() => {
    if (params.questionId) setQuestionId(params.questionId);
  }, [params.questionId]);

  function peutCapturer() {
    if (!pourquoi.trim() || !questionId) return false;
    if (mode === 'texte'   && !texte.trim())         return false;
    if (mode === 'lien'    && !url.trim())            return false;
    if (mode === 'audio'   && !transcription.trim())  return false;
    if (mode === 'fichier' && !fichier)               return false;
    return true;
  }

  async function capturer() {
    setSaving(true);
    try {
      let contenu = '';
      let titre   = '';
      let meta    = {};

      if (mode === 'texte') {
        contenu = texte.trim();
        titre   = texte.trim().slice(0, 60) + (texte.length > 60 ? '…' : '');
        meta.dureeLectureMin = window.DB.estimerDureeLecture(texte);
      } else if (mode === 'lien') {
        contenu = url.trim();
        titre   = titreLien.trim() || url.trim();
        meta.url = url.trim();
      } else if (mode === 'audio') {
        contenu = transcription.trim();
        titre   = 'Note vocale — ' + new Date().toLocaleDateString('fr-FR');
      } else if (mode === 'fichier') {
        contenu = fichier.name;
        titre   = titreFichier.trim() || fichier.name;
        meta.fichierNom = fichier.name;
      }

      await window.DB.creerRessource({
        questionId,
        type:    mode,
        titre,
        contenu,
        pourquoi: pourquoi.trim(),
        meta,
      });

      navigate('question', { questionId });
    } catch(e) {
      alert(e.message);
      setSaving(false);
    }
  }

  return (
    <div className="app screen-enter">
      <div className="topbar">
        <span className="brand">Le Filtre<span className="dot">.</span></span>
      </div>

      <div className="eyebrow">Capture rapide</div>
      <p className="h-screen">Qu'est-ce qui vient de te traverser&nbsp;?</p>
      <p className="sub-screen">Tout entre par ici. Le geste tient en dix secondes.</p>

      {/* Sélecteur de mode */}
      <div className="mode-grid">
        {MODES.map(m => (
          <div
            key={m.id}
            className={`mode ${mode === m.id ? 'sel' : ''}`}
            onClick={() => setMode(m.id)}
          >
            <span className="em">{m.emoji}</span>
            <span className="nm">{m.nom}</span>
            <span className="ds">{m.desc}</span>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Champs selon le mode */}
        {mode === 'texte'   && <ChampTexte valeur={texte} onChange={setTexte} />}
        {mode === 'lien'    && <ChampLien url={url} titre={titreLien} onUrl={setUrl} onTitre={setTitreLien} />}
        {mode === 'audio'   && <ChampAudio onTranscription={setTranscription} />}
        {mode === 'fichier' && <ChampFichier fichier={fichier} onFichier={setFichier} titre={titreFichier} onTitre={setTitreFichier} />}

        {/* Pourquoi — toujours présent, toujours obligatoire */}
        <div className="field key">
          <label>Pourquoi ça compte&nbsp;? — une ligne</label>
          <div className="hint" style={{ color: '#9a5034' }}>
            C'est <strong>ça</strong> que tu chercheras dans trois jours. Sans cette ligne, le fil meurt.
          </div>
          <textarea
            rows={2}
            placeholder="Me donne un angle pour… / À relier à… / Confirme ou contredit…"
            value={pourquoi}
            onChange={e => setPourquoi(e.target.value)}
          />
        </div>

        {/* Sélecteur de question */}
        <SelectQuestion
          value={questionId}
          onChange={setQuestionId}
        />

        <button
          className="btn primary"
          onClick={capturer}
          disabled={!peutCapturer() || saving}
        >
          {saving ? 'Enregistrement…' : 'Capturer et ranger'}
        </button>
      </div>

      <div style={{ height: '24px' }} />
    </div>
  );
}

window.EcranCapture = EcranCapture;
