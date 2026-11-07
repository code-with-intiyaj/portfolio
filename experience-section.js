/**
 * ExperienceSection — "Where I've Been"
 * Immersive Horizontal Spatial Canvas controlled by Vertical Scroll
 * Powered by @fiddle-digital/string-tune runtime
 */

export async function initExperienceSection() {
  const section = document.getElementById('experience');
  if (!section) return;

  const stage = document.getElementById('exp-horizontal-stage');
  if (!stage) return;

  const tickerTop = document.getElementById('exp-ticker-top');
  const tickerBottom = document.getElementById('exp-ticker-bottom');
  const hudProgress = document.getElementById('exp-hud-progress');
  const hudPhase = document.getElementById('exp-hud-phase');
  const dateBgs = document.querySelectorAll('.exp-date-bg');
  const jumpButtons = document.querySelectorAll('.exp-jump-btn');
  const panels = Array.from(stage.querySelectorAll('.exp-panel'));

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Resolve StringTune runtime from ES module or global UMD fallback
  let StringTuneClass = null;
  let StringProgress = null;
  let StringProgressPart = null;
  let StringParallax = null;
  let StringMagnetic = null;

  try {
    const mod = await import('./assets/string-tune.mjs');
    StringTuneClass = mod.StringTune || mod.default;
    StringProgress = mod.StringProgress;
    StringProgressPart = mod.StringProgressPart;
    StringParallax = mod.StringParallax;
    StringMagnetic = mod.StringMagnetic;
  } catch (err) {
    console.warn('[Experience] Falling back to global window.StringTune:', err);
    const ST = window.StringTune?.StringTune || window.StringTune;
    if (ST) {
      StringTuneClass = ST;
      StringProgress = window.StringTune.StringProgress || ST.StringProgress;
      StringProgressPart = window.StringTune.StringProgressPart || ST.StringProgressPart;
      StringParallax = window.StringTune.StringParallax || ST.StringParallax;
      StringMagnetic = window.StringTune.StringMagnetic || ST.StringMagnetic;
    }
  }

  let stringTune = null;
  if (StringTuneClass) {
    stringTune = typeof StringTuneClass.getInstance === 'function'
      ? StringTuneClass.getInstance()
      : StringTuneClass;

    // STRICT REQUIREMENT: Keep native browser scrolling 100% active and unblocked
    stringTune.scrollDesktopMode = 'default';
    stringTune.scrollMobileMode = 'default';

    if (StringProgress) stringTune.use(StringProgress);
    if (StringProgressPart) stringTune.use(StringProgressPart);
    if (StringParallax) stringTune.use(StringParallax);
    if (StringMagnetic) stringTune.use(StringMagnetic);

    try {
      stringTune.start(60);
    } catch (e) {
      // Runtime already active
    }

    // Re-assert default mode post-start
    stringTune.scrollDesktopMode = 'default';
    stringTune.scrollMobileMode = 'default';
  }

  // Camera & Interpolation Physics
  let currentTranslateX = 0;
  let targetTranslateX = 0;
  let currentProgress = 0;
  let targetProgress = 0;
  let isTicking = false;

  // Compute maximum horizontal travel based on canvas geometry
  function getDimensions() {
    const totalDist = section.offsetHeight - window.innerHeight;
    const stageWidth = stage.scrollWidth;
    const maxTranslate = Math.max(0, stageWidth - window.innerWidth);
    return { totalDist, maxTranslate };
  }

  // Left edge of every panel relative to the stage (independent of the current transform)
  function getPanelLefts() {
    const stageLeft = stage.getBoundingClientRect().left;
    return panels.map(panel => panel.getBoundingClientRect().left - stageLeft);
  }

  // Which panel is under the middle of the viewport for a given scroll progress
  function activePanelIndex(progress) {
    const probe = progress * maxTranslate + window.innerWidth * 0.5;
    let idx = 0;
    panelLefts.forEach((left, i) => {
      if (left <= probe) idx = i;
    });
    return idx;
  }

  // Scroll progress that brings a panel into view (a little breathing room on the left)
  function progressForPanel(i) {
    if (maxTranslate <= 0) return 0;
    const target = (panelLefts[i] - window.innerWidth * 0.3) / maxTranslate;
    return Math.min(Math.max(target, 0), 1);
  }

  let { totalDist, maxTranslate } = getDimensions();
  let panelLefts = getPanelLefts();
  window.addEventListener('resize', () => {
    ({ totalDist, maxTranslate } = getDimensions());
    panelLefts = getPanelLefts();
    if (prefersReducedMotion) {
      stage.style.transform = 'none';
    }
  }, { passive: true });

  // Update loop for 60/120 FPS camera interpolation
  function renderFrame() {
    isTicking = false;

    if (prefersReducedMotion) {
      return;
    }

    // Smooth inertia lerp (0.09 factor gives tactile, responsive feel)
    currentProgress += (targetProgress - currentProgress) * 0.09;
    currentTranslateX += (targetTranslateX - currentTranslateX) * 0.09;

    // 1. Move Horizontal Camera / Stage
    stage.style.transform = `translate3d(${currentTranslateX.toFixed(2)}px, 0, 0)`;

    // 2. Parallax Drift for Large Background Typography Dates
    dateBgs.forEach(dateEl => {
      const factor = parseFloat(dateEl.getAttribute('data-parallax-factor') || '0.15');
      const dateOffset = -currentTranslateX * factor;
      dateEl.style.transform = `translate3d(${dateOffset.toFixed(2)}px, 0, 0)`;
    });

    // 3. Counter-drifting Background Tickers
    if (tickerTop) {
      const topOffset = currentTranslateX * 0.35;
      tickerTop.style.transform = `translate3d(${topOffset.toFixed(2)}px, 0, 0)`;
    }
    if (tickerBottom) {
      const bottomOffset = -currentTranslateX * 0.25;
      tickerBottom.style.transform = `translate3d(${bottomOffset.toFixed(2)}px, 0, 0)`;
    }

    // 4. Update HUD Progress Bar
    if (hudProgress) {
      hudProgress.style.width = `${(currentProgress * 100).toFixed(1)}%`;
    }

    // 5. Update HUD Phase Title (taken from each panel's data-phase)
    const activeIdx = activePanelIndex(currentProgress);
    if (hudPhase && panels[activeIdx]) {
      const phase = panels[activeIdx].getAttribute('data-phase');
      if (phase && hudPhase.textContent.trim() !== phase) hudPhase.textContent = phase;
    }

    // 6. Highlight active bottom jump button
    jumpButtons.forEach(btn => {
      const isCurrent = parseInt(btn.getAttribute('data-panel-index'), 10) === activeIdx;
      if (isCurrent) {
        btn.classList.add('text-white', 'bg-white/20', 'border-white/40');
        btn.classList.remove('text-neutral-500', 'border-white/5');
      } else {
        btn.classList.remove('text-white', 'bg-white/20', 'border-white/40');
        btn.classList.add('text-neutral-500', 'border-white/5');
      }
    });

    // Keep loop active until settle
    if (Math.abs(targetTranslateX - currentTranslateX) > 0.1 || Math.abs(targetProgress - currentProgress) > 0.001) {
      requestAnimationFrame(renderFrame);
      isTicking = true;
    }
  }

  // Scroll listener computing normalized progress (0.0 to 1.0)
  function onScroll() {
    const rect = section.getBoundingClientRect();
    const scrolled = -rect.top;

    if (totalDist <= 0) return;

    // Normalized progress within the section's vertical travel track
    const rawProgress = scrolled / totalDist;
    targetProgress = Math.min(Math.max(rawProgress, 0), 1);
    targetTranslateX = -targetProgress * maxTranslate;

    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(renderFrame);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Connect StringTune event dispatcher if available
  if (stringTune) {
    stringTune.on('scroll', onScroll);
  }

  // Interactive Chapter Jump Click Handlers
  jumpButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const p = progressForPanel(parseInt(btn.getAttribute('data-panel-index') || '0', 10));
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const targetScroll = sectionTop + p * totalDist;

      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    });
  });

  // Initial calculation
  onScroll();
}

// Auto-boot upon DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExperienceSection);
} else {
  initExperienceSection();
}
