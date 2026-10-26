// ================= CINEMATIC INTRO REEL & SPLIT NAME COLLISION =================
(function() {
  let animationFrameId = null;
  let ribbons = [];
  let isIntroActive = true;

  function getEl(id) {
    return document.getElementById(id);
  }

  // Dual Oscillator Web Audio "Ta-Dum" Synthesizer
  function playTaDum(delay = 0) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const now = audioCtx.currentTime + delay;

      // 1. "TA" - Punchy attack
      const taOsc = audioCtx.createOscillator();
      const taGain = audioCtx.createGain();
      taOsc.type = 'sine';
      taOsc.frequency.setValueAtTime(120, now);
      taOsc.frequency.exponentialRampToValueAtTime(40, now + 0.14);
      taGain.gain.setValueAtTime(0.75, now);
      taGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      taOsc.connect(taGain);
      taGain.connect(audioCtx.destination);
      taOsc.start(now);
      taOsc.stop(now + 0.18);

      // 2. "DUM" - Deep cinematic booming swell
      const dumTime = now + 0.14;
      const dumOsc = audioCtx.createOscillator();
      const dumGain = audioCtx.createGain();
      dumOsc.type = 'triangle';
      dumOsc.frequency.setValueAtTime(80, dumTime);
      dumOsc.frequency.exponentialRampToValueAtTime(32, dumTime + 0.8);
      dumGain.gain.setValueAtTime(0.001, dumTime);
      dumGain.gain.linearRampToValueAtTime(0.85, dumTime + 0.04);
      dumGain.gain.exponentialRampToValueAtTime(0.001, dumTime + 2.0);
      dumOsc.connect(dumGain);
      dumGain.connect(audioCtx.destination);
      dumOsc.start(dumTime);
      dumOsc.stop(dumTime + 2.0);
    } catch(e) {}
  }

  // Ribbon Explosion Canvas
  function resizeRibbonCanvas() {
    const canvas = getEl('ribbonCanvas');
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createRibbons() {
    ribbons = [];
    const ribbonCount = 50;
    const centerX = window.innerWidth / 2;
    const nameCont = getEl('nameContainer');
    const spread = Math.max(nameCont ? nameCont.getBoundingClientRect().width * 0.95 : 320, 320);

    for (let i = 0; i < ribbonCount; i++) {
      const x = centerX + (Math.random() - 0.5) * spread;
      ribbons.push({
        x: x,
        width: Math.random() * 5 + 2,
        alpha: Math.random() * 0.8 + 0.3,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }

  function drawRibbons() {
    const canvas = getEl('ribbonCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    ribbons.forEach(r => {
      if (r.alpha > 0.01) {
        alive = true;
        ctx.save();
        const gradient = ctx.createLinearGradient(r.x, 0, r.x, canvas.height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${r.alpha})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(r.x - r.width / 2, 0, r.width, canvas.height);
        ctx.restore();
        r.alpha -= r.decay;
      }
    });

    if (alive) {
      animationFrameId = requestAnimationFrame(drawRibbons);
    }
  }

  function triggerIntroAnimation(withAudio = false) {
    if (withAudio) {
      playTaDum(1.0);
    }

    const comradeIntro = getEl('comradeIntro');
    const brandHeader = getEl('brandHeader');
    const nameCont = getEl('nameContainer');
    const left = nameCont ? nameCont.querySelector('.from-left') : null;
    const right = nameCont ? nameCont.querySelector('.from-right') : null;
    const flash = getEl('flash');
    const storySubtitle = getEl('storySubtitle');
    const photoWrapper = getEl('photoWrapper');
    const bottomBar = getEl('bottomBar');

    const els = [comradeIntro, brandHeader, left, right, flash, storySubtitle, photoWrapper, bottomBar].filter(Boolean);
    els.forEach(el => el.classList.remove('animate'));

    // Trigger reflow
    void (comradeIntro && comradeIntro.offsetWidth);

    els.forEach(el => el.classList.add('animate'));

    setTimeout(() => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      createRibbons();
      drawRibbons();
    }, 1240);
  }

  // Populate Intro Overlay Elements from live Portfolio Data
  function applyIntroData(data) {
    if (!data) return;
    const intro = data.intro || {};
    const profile = data.profile || {};

    const prefix = getEl('introPrefix');
    if (prefix) prefix.textContent = intro.badgePrefix || 'A';

    const brand = getEl('introBrand');
    if (brand) brand.textContent = intro.badgeBrand || profile.brandLogo || 'AshWorks';

    const suffix = getEl('introSuffix');
    if (suffix) suffix.textContent = intro.badgeSuffix || 'ORIGINAL';

    const topLogo = getEl('introTopLogo');
    if (topLogo) topLogo.textContent = intro.topLogo || profile.brandLogo || 'AshWorks';

    const topTag = getEl('introTopTag');
    if (topTag) topTag.textContent = intro.topTag || 'PORTFOLIO';

    // Split Name collision calculation
    let p1Val = intro.titlePart1;
    let p2Val = intro.titlePart2;
    const fullName = (intro.userName || profile.name || 'ASHISH').trim();
    if ((!p1Val || !p2Val) && fullName) {
      const mid = Math.ceil(fullName.length / 2);
      p1Val = p1Val || fullName.substring(0, mid);
      p2Val = p2Val || fullName.substring(mid);
    }

    const p1 = getEl('titlePart1');
    if (p1) p1.textContent = p1Val || 'ASH';

    const p2 = getEl('titlePart2');
    if (p2) p2.textContent = p2Val || 'ISH';

    const sub = getEl('storySubtitle');
    if (sub) sub.textContent = intro.storySubtitle || profile.storySubtitle || '';

    const photo = getEl('profilePhoto');
    if (photo) {
      photo.src = intro.photo || profile.avatarImage || profile.heroImage || 'images/default_avatar.svg';
    }

    const r1 = getEl('rolePrimary');
    const r1Val = intro.rolePrimary || profile.match || 'FRONT END DEVELOPER';
    if (r1) r1.textContent = r1Val;

    const r2 = getEl('roleSecondary');
    const r2Val = intro.roleSecondary || profile.rolePrimary || 'MASTERING BUSINESS MANAGEMENT';
    if (r2) r2.textContent = r2Val;

    const rDiv = getEl('roleDivider');
    if (rDiv) rDiv.style.display = (r1Val && r2Val) ? 'inline' : 'none';

    const playLabel = getEl('playBtnLabel');
    if (playLabel) playLabel.textContent = intro.playBtnText || 'Explore Work';

    const topThumb = getEl('topProfileThumb');
    if (topThumb && (profile.avatarImage || intro.photo)) {
      topThumb.src = profile.avatarImage || intro.photo;
    }

    const topName = getEl('topProfileName');
    if (topName) topName.textContent = profile.name || intro.userName || 'Ashish';
  }

  // Enter main portfolio page smoothly
  function enterPortfolio() {
    if (!isIntroActive) return;
    isIntroActive = false;
    playTaDum(0);

    const flash = getEl('flash');
    if (flash) {
      flash.style.transition = 'opacity 0.45s ease';
      flash.style.backgroundColor = '#141414';
      flash.style.opacity = '1';
    }

    const overlay = getEl('introOverlay');
    setTimeout(() => {
      if (overlay) {
        overlay.classList.add('fade-out');
        setTimeout(() => {
          overlay.style.display = 'none';
        }, 550);
      }
      document.body.style.overflow = '';
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 400);
  }

  // Global Replay Opening (Called from top nav or footer button)
  window.replayIntro = function() {
    isIntroActive = true;
    const overlay = getEl('introOverlay');
    if (!overlay) return;

    document.body.style.overflow = 'hidden';
    overlay.style.display = 'flex';
    overlay.classList.remove('fade-out');

    const flash = getEl('flash');
    if (flash) {
      flash.style.backgroundColor = '#ffffff';
      flash.style.opacity = '0';
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
    triggerIntroAnimation(true);
  };

  // Setup Event Listeners
  window.addEventListener('DOMContentLoaded', () => {
    // Lock scrolling while intro is active
    document.body.style.overflow = 'hidden';

    window.addEventListener('resize', resizeRibbonCanvas);
    resizeRibbonCanvas();

    // Hydrate data
    let initialData = window.DEFAULT_PORTFOLIO_DATA || null;
    try {
      const stored = localStorage.getItem('comrade_portfolio_data');
      if (stored) initialData = JSON.parse(stored);
    } catch(e) {}
    applyIntroData(initialData);

    // Auto-play intro immediately
    triggerIntroAnimation(false);

    // Play button
    const playBtn = getEl('playBtn');
    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        enterPortfolio();
      });
    }

    // Top Right Profile Pill click -> Enter portfolio
    const topProfile = document.querySelector('.top-profile-link');
    if (topProfile) {
      topProfile.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        enterPortfolio();
      });
    }

    // Space or Enter key to Enter
    window.addEventListener('keydown', (e) => {
      if (!isIntroActive) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        enterPortfolio();
      }
    });

    // Clicking anywhere on intro background replays animation with audio
    const overlay = getEl('introOverlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (!isIntroActive) return;
        if (e.target.closest('#playBtn') || e.target.closest('.top-profile-link')) return;
        triggerIntroAnimation(true);
      });
    }
  });
})();
