// ============================================================
// app.jsx — Le Filtre v2
// Root React : état global + routeur entre écrans
// ============================================================

const { useState, useEffect } = React;

// ── Écrans disponibles ─────────────────────────────────────
// tab principal → pour garder le bon bouton de nav allumé
const TAB_PARENT = {
  question: 'chantiers',
  produire: 'chantiers',
  capture:  'capture',
  rituel:   'rituel',
  chantiers:'chantiers',
};

function App() {
  const [ecran, setEcran]             = useState('rituel');
  const [params, setParams]           = useState({});
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [toast, setToast]             = useState(null);

  // ── Navigation ────────────────────────────────────────────
  function navigate(screen, p = {}) {
    if (screen === 'question' && p.questionId) {
      setActiveQuestion(p.questionId);
      setEcran('chantiers'); // fiche question s'affiche dans l'écran chantiers
    } else {
      setActiveQuestion(null);
      setEcran(screen);
      setParams(p);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Rendu de l'écran courant ──────────────────────────────
  function renderScreen() {
    switch (ecran) {
      case 'rituel':
        return <EcranRituel navigate={navigate} />;
      case 'capture':
        return <EcranCapture navigate={navigate} params={params} />;
      case 'chantiers':
        return (
          <EcranChantiers
            navigate={navigate}
            activeQuestion={activeQuestion}
            setActiveQuestion={setActiveQuestion}
          />
        );
      case 'produire':
        return <EcranProduire navigate={navigate} params={params} />;
      default:
        return <EcranRituel navigate={navigate} />;
    }
  }

  const tabActif = activeQuestion ? 'chantiers' : (TAB_PARENT[ecran] || ecran);

  return (
    <>
      {renderScreen()}

      {/* ── Bottom nav ── */}
      <nav className="botnav">
        <button
          className={tabActif === 'rituel' ? 'active' : ''}
          onClick={() => navigate('rituel')}
        >
          <span className="ico">◐</span>
          Rituel
        </button>
        <button
          className={tabActif === 'capture' ? 'active' : ''}
          onClick={() => navigate('capture')}
        >
          <span className="ico">＋</span>
          Capturer
        </button>
        <button
          className={tabActif === 'chantiers' ? 'active' : ''}
          onClick={() => { setActiveQuestion(null); navigate('chantiers'); }}
        >
          <span className="ico">▦</span>
          Chantiers
        </button>
      </nav>

      {/* ── Toast ── */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

// ── Mount ─────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
