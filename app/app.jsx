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

// ── Coup de pouce d'installation (écran d'accueil) ──────────
// iOS Safari ne propose jamais l'install : on explique le geste.
// Android/Chrome : on capte beforeinstallprompt pour un vrai bouton.
function InstallHint() {
  const [show, setShow]         = useState(false);
  const [deferred, setDeferred] = useState(null);
  const ua    = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  const isIOS = /iphone|ipad|ipod/i.test(ua);

  useEffect(() => {
    if (localStorage.getItem('lf_install_dismissed')) return;
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (standalone) return; // déjà installée

    function onBeforeInstall(e) {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    let t;
    if (isIOS) t = setTimeout(() => setShow(true), 1400);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      if (t) clearTimeout(t);
    };
  }, [isIOS]);

  function dismiss() {
    localStorage.setItem('lf_install_dismissed', '1');
    setShow(false);
  }
  async function installer() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    dismiss();
  }

  if (!show) return null;

  return (
    <div className="install-hint">
      <span className="ih-ico">◐</span>
      <div className="ih-text">
        {deferred ? (
          <>Installe <b>Le Filtre</b> pour l'avoir sur ton écran d'accueil.</>
        ) : (
          <>Ajoute <b>Le Filtre</b> à ton écran d'accueil&nbsp;: <b>Partager</b> ⎋ → <b>Sur l'écran d'accueil</b>.</>
        )}
      </div>
      {deferred && <button className="ih-cta" onClick={installer}>Installer</button>}
      <button className="ih-close" onClick={dismiss} aria-label="Fermer">×</button>
    </div>
  );
}

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

      {/* ── Coup de pouce d'installation ── */}
      <InstallHint />

      {/* ── Toast ── */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

// ── Mount ─────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
