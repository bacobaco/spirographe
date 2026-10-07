// Logique applicative, gestion des événements et interface utilisateur du Spirographe Deluxe

import { studioState } from '../state/state.js';
import { FIXED_GEARS, MOBILE_WHEELS, PEN_STYLES, DELUXE_COLORS, PAPER_THEMES } from '../math/gears.js';
import { calculateGearState, getWheelLocalRadius, TOOTH_PITCH } from '../math/engine.js';
import { CanvasRenderer } from '../render/canvasRenderer.js';
import { sounds } from '../audio/sound.js';
import { PRESETS } from '../presets/presets.js';
import { exportAsPNG, exportAsSVG } from '../export/exporter.js';

export class SpiroStudioApp {
  constructor() {
    this.canvas = document.getElementById('spiro-canvas');
    this.renderer = new CanvasRenderer(this.canvas);

    this.activeTab = 'gears'; // 'gears' | 'wheels' | 'pens'
    this.gearCategoryFilter = 'all'; // 'all' | 'circle' | 'shape' | 'linear'
    this.wheelCategoryFilter = 'all'; // 'all' | 'round' | 'shape'

    this.isDraggingWheel = false;
    this.lastFrameTime = performance.now();

    this.initDOM();
    this.bindEvents();
    this.setupResize();
    this.startAnimationLoop();

    this.updateAllUI();
  }

  initDOM() {
    this.renderTabs();
    this.renderSidebarContent();
    this.renderPresetsModal();
    this.updateLayersUI();
    this.updateMathHUD();
  }

  setupResize() {
    const resize = () => {
      const container = this.canvas.parentElement;
      const size = Math.max(320, Math.min(container.clientWidth - 30, container.clientHeight - 30, 880));
      this.renderer.resize(size, size);
      this.requestRender();
    };
    window.addEventListener('resize', resize);
    resize();
  }

  startAnimationLoop() {
    const loop = (currentTime) => {
      const dt = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
      this.lastFrameTime = currentTime;

      if (studioState.isPlaying && studioState.activeLayer) {
        const layer = studioState.activeLayer;
        const totalPoints = layer.points.length;

        const pointsPerSec = (totalPoints / 10) * studioState.speed * 2.8;
        const deltaPoints = Math.max(1, Math.round(pointsPerSec * dt));

        layer.animatedCount = Math.min(totalPoints, (layer.animatedCount || 0) + deltaPoints);
        studioState.progress = layer.animatedCount / totalPoints;

        if (deltaPoints > 0) {
          sounds.playGearTick(0.06);
          sounds.startPenSound();
        }

        if (layer.animatedCount >= totalPoints) {
          studioState.isPlaying = false;
          sounds.stopPenSound();
          this.updatePlayButton();
        }

        this.updateHUDProgress();
      } else {
        sounds.stopPenSound();
      }

      this.requestRender();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  requestRender() {
    const activeLayer = studioState.activeLayer;
    let gearState = null;

    if (activeLayer) {
      const fixedGear = FIXED_GEARS.find(g => g.id === activeLayer.fixedGearId) || studioState.fixedGear;
      const mobileGear = MOBILE_WHEELS.find(w => w.id === activeLayer.mobileGearId) || studioState.mobileGear;

      const progress = studioState.progress;
      const currentTheta = progress * activeLayer.maxTheta;
      const phaseRad = (activeLayer.phaseOffsetDeg * Math.PI) / 180;

      gearState = calculateGearState({
        fixedGear,
        mobileGear,
        holeIndex: activeLayer.holeIndex,
        mode: activeLayer.mode,
        theta: currentTheta,
        phaseOffset: phaseRad,
        unitScale: TOOTH_PITCH
      });
    }

    this.renderer.renderScene({
      paperTheme: studioState.paperTheme,
      layers: studioState.layers,
      activeLayer: studioState.activeLayer,
      activeGearState: gearState,
      showGears: studioState.showGears,
      showGrid: studioState.showGrid,
      zoom: studioState.zoom
    });
  }

  bindEvents() {
    studioState.subscribe(() => {
      this.updateMathHUD();
      this.updateLayersUI();
      this.renderSidebarContent();
      const paperSelect = document.getElementById('paper-theme-select');
      if (paperSelect && studioState.paperTheme) {
        paperSelect.value = studioState.paperTheme.id;
      }
      this.requestRender();
    });

    const playBtn = document.getElementById('btn-play-pause');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        studioState.isPlaying = !studioState.isPlaying;
        sounds.ensureContext();
        sounds.playSelectSnap();
        this.updatePlayButton();
      });
    }

    const instantBtn = document.getElementById('btn-instant-draw');
    if (instantBtn) {
      instantBtn.addEventListener('click', () => {
        studioState.instantDraw();
        this.updatePlayButton();
      });
    }

    const commitBtn = document.getElementById('btn-commit-layer');
    if (commitBtn) {
      commitBtn.addEventListener('click', () => {
        studioState.commitActiveLayer();
      });
    }

    const toggleGearsBtn = document.getElementById('btn-toggle-gears');
    if (toggleGearsBtn) {
      toggleGearsBtn.addEventListener('click', () => {
        studioState.showGears = !studioState.showGears;
        toggleGearsBtn.classList.toggle('active', studioState.showGears);
        sounds.playSelectSnap();
        this.requestRender();
      });
    }

    const toggleGridBtn = document.getElementById('btn-toggle-grid');
    if (toggleGridBtn) {
      toggleGridBtn.addEventListener('click', () => {
        studioState.showGrid = !studioState.showGrid;
        toggleGridBtn.classList.toggle('active', studioState.showGrid);
        sounds.playSelectSnap();
        this.requestRender();
      });
    }

    const speedSlider = document.getElementById('speed-slider');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        studioState.speed = parseFloat(e.target.value);
        document.getElementById('speed-val').textContent = `${studioState.speed.toFixed(1)}x`;
      });
    }

    const phaseSlider = document.getElementById('phase-slider');
    if (phaseSlider) {
      phaseSlider.addEventListener('input', (e) => {
        const deg = parseFloat(e.target.value);
        studioState.setPhaseOffset(deg);
        document.getElementById('phase-val').textContent = `${deg}°`;
      });
    }

    const muteBtn = document.getElementById('btn-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const muted = sounds.toggleMute();
        muteBtn.classList.toggle('active', !muted);
        muteBtn.title = muted ? 'Activer le son' : 'Couper le son';
      });
    }

    const presetsBtn = document.getElementById('btn-presets');
    if (presetsBtn) {
      presetsBtn.addEventListener('click', () => {
        this.openModal('presets-modal');
      });
    }

    const rosetteBtn = document.getElementById('btn-rosette-gen');
    if (rosetteBtn) {
      rosetteBtn.addEventListener('click', () => {
        this.openRosetteModal();
      });
    }

    const layersBtn = document.getElementById('btn-layers-toggle');
    if (layersBtn) {
      layersBtn.addEventListener('click', () => {
        document.getElementById('layers-drawer').classList.toggle('open');
      });
    }

    const closeLayersBtn = document.getElementById('btn-close-layers');
    if (closeLayersBtn) {
      closeLayersBtn.addEventListener('click', () => {
        document.getElementById('layers-drawer').classList.remove('open');
      });
    }

    const clearBtn = document.getElementById('btn-clear-canvas');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Voulez-vous effacer l\'ensemble du dessin ?')) {
          studioState.clearAll();
        }
      });
    }

    const exportPngBtn = document.getElementById('btn-export-png');
    if (exportPngBtn) {
      exportPngBtn.addEventListener('click', () => {
        exportAsPNG({
          canvas: this.canvas,
          paperTheme: studioState.paperTheme,
          layers: [...studioState.layers, studioState.activeLayer],
          scale: 2
        });
      });
    }

    const exportSvgBtn = document.getElementById('btn-export-svg');
    if (exportSvgBtn) {
      exportSvgBtn.addEventListener('click', () => {
        exportAsSVG({
          width: this.renderer.width,
          height: this.renderer.height,
          layers: [...studioState.layers, studioState.activeLayer],
          paperTheme: studioState.paperTheme
        });
      });
    }

    const paperSelect = document.getElementById('paper-theme-select');
    if (paperSelect) {
      paperSelect.addEventListener('change', (e) => {
        const theme = PAPER_THEMES.find(p => p.id === e.target.value);
        if (theme) studioState.setPaperTheme(theme);
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        studioState.isPlaying = !studioState.isPlaying;
        sounds.ensureContext();
        sounds.playSelectSnap();
        this.updatePlayButton();
      } else if (e.code === 'Enter') {
        studioState.instantDraw();
        this.updatePlayButton();
      } else if (e.key === 'c' || e.key === 'C') {
        studioState.commitActiveLayer();
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        if (e.shiftKey) studioState.redo();
        else studioState.undo();
      }
    });

    this.bindCanvasInteraction();
  }

  bindCanvasInteraction() {
    let isInteracting = false;
    let lastAngle = 0;

    const getAngleFromEvent = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = (clientX - rect.left) - rect.width / 2;
      const y = (clientY - rect.top) - rect.height / 2;
      return Math.atan2(y, x);
    };

    const onStart = (e) => {
      isInteracting = true;
      sounds.ensureContext();
      lastAngle = getAngleFromEvent(e);
      studioState.isPlaying = false;
      this.updatePlayButton();
    };

    const onMove = (e) => {
      if (!isInteracting || !studioState.activeLayer) return;
      const angle = getAngleFromEvent(e);
      let diff = angle - lastAngle;

      if (diff > Math.PI) diff -= 2 * Math.PI;
      if (diff < -Math.PI) diff += 2 * Math.PI;

      lastAngle = angle;

      const layer = studioState.activeLayer;
      const angleStep = Math.abs(diff);

      const progressDelta = angleStep / layer.maxTheta;
      studioState.progress = Math.min(1.0, (studioState.progress || 0) + progressDelta);
      layer.animatedCount = Math.round(studioState.progress * layer.points.length);

      sounds.playGearTick(0.08);
      this.updateHUDProgress();
      this.requestRender();
    };

    const onEnd = () => {
      isInteracting = false;
    };

    this.canvas.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    this.canvas.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  }

  updatePlayButton() {
    const playBtn = document.getElementById('btn-play-pause');
    if (!playBtn) return;
    if (studioState.isPlaying) {
      playBtn.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1"></rect>
          <rect x="14" y="4" width="4" height="16" rx="1"></rect>
        </svg>
      `;
      playBtn.title = 'Pause (Espace)';
    } else {
      playBtn.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"></path>
        </svg>
      `;
      playBtn.title = 'Dessiner / Animer (Espace)';
    }
  }

  updateHUDProgress() {
    const pct = Math.round((studioState.progress || 0) * 100);
    const progEl = document.getElementById('hud-progress-val');
    if (progEl) {
      progEl.textContent = `${pct}%`;
    }
  }

  renderTabs() {
    const tabsContainer = document.getElementById('sidebar-tabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = `
      <button class="tab-btn ${this.activeTab === 'gears' ? 'active' : ''}" data-tab="gears">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9"></circle>
          <circle cx="12" cy="12" r="4"></circle>
        </svg>
        Plateaux Fixes
      </button>
      <button class="tab-btn ${this.activeTab === 'wheels' ? 'active' : ''}" data-tab="wheels">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        Roues Mobiles
      </button>
      <button class="tab-btn ${this.activeTab === 'pens' ? 'active' : ''}" data-tab="pens">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
          <path d="M2 2l7.586 7.586"></path>
          <circle cx="11" cy="11" r="2"></circle>
        </svg>
        Stylets & Encre
      </button>
    `;

    tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        sounds.playSelectSnap();
        this.renderTabs();
        this.renderSidebarContent();
      });
    });
  }

  renderSidebarContent() {
    const container = document.getElementById('sidebar-dynamic-content');
    if (!container) return;

    if (this.activeTab === 'gears') {
      this.renderGearsTab(container);
    } else if (this.activeTab === 'wheels') {
      this.renderWheelsTab(container);
    } else if (this.activeTab === 'pens') {
      this.renderPensTab(container);
    }
  }

  // Onglet Plateaux Fixes avec filtres par catégorie
  renderGearsTab(container) {
    let html = `
      <div class="section-header">
        <span class="section-title">Mode d'Entraînement</span>
      </div>

      <div class="mode-toggle-group">
        <button class="mode-btn ${studioState.mode === 'hypo' ? 'active' : ''}" data-mode="hypo">
          <strong>Intérieur</strong>
          <span>Hypotrochoïde</span>
        </button>
        <button class="mode-btn ${studioState.mode === 'epi' ? 'active' : ''}" data-mode="epi">
          <strong>Extérieur</strong>
          <span>Épitrochoïde</span>
        </button>
        <button class="mode-btn ${studioState.mode === 'rack' ? 'active' : ''}" data-mode="rack">
          <strong>Crémaillère</strong>
          <span>Cycloïde</span>
        </button>
      </div>

      <div class="section-header" style="margin-top: 14px;">
        <span class="section-title">Choisir le Plateau Fixe</span>
        <div style="display: flex; gap: 4px;">
          <button class="header-btn gear-cat-btn ${this.gearCategoryFilter === 'all' ? 'btn-primary' : ''}" data-cat="all" style="padding: 2px 7px; font-size: 11px;">Tous (${FIXED_GEARS.length})</button>
          <button class="header-btn gear-cat-btn ${this.gearCategoryFilter === 'shape' ? 'btn-primary' : ''}" data-cat="shape" style="padding: 2px 7px; font-size: 11px;">Formes Spéciales</button>
          <button class="header-btn gear-cat-btn ${this.gearCategoryFilter === 'circle' ? 'btn-primary' : ''}" data-cat="circle" style="padding: 2px 7px; font-size: 11px;">Ronds</button>
        </div>
      </div>

      <div class="gears-grid">
    `;

    const filteredGears = FIXED_GEARS.filter(g => {
      if (this.gearCategoryFilter === 'circle') return g.category === 'circle';
      if (this.gearCategoryFilter === 'shape') return g.category === 'shape';
      if (this.gearCategoryFilter === 'linear') return g.category === 'linear';
      return true;
    });

    for (const gear of filteredGears) {
      const isActive = studioState.fixedGear.id === gear.id;
      const isShape = gear.category === 'shape';
      html += `
        <div class="gear-card ${isActive ? 'active' : ''}" data-gear-id="${gear.id}" style="--gear-color: ${gear.color}">
          <div class="gear-preview-svg">
            ${this.getFixedGearSVG(gear)}
          </div>
          <div class="gear-card-title">${gear.name}</div>
          <div class="gear-card-desc">${gear.subtitle}</div>
          <div class="gear-card-badge" style="${isShape ? 'border-color: var(--accent-rose); color: #f472b6;' : ''}">
            ${gear.outerTeeth}/${gear.innerTeeth} dents ${isShape ? '• Forme' : ''}
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    container.querySelectorAll('.gear-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.gearCategoryFilter = btn.dataset.cat;
        this.renderSidebarContent();
      });
    });

    container.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        studioState.setRollingMode(btn.dataset.mode);
        this.renderSidebarContent();
      });
    });

    container.querySelectorAll('.gear-card').forEach(card => {
      card.addEventListener('click', () => {
        const gear = FIXED_GEARS.find(g => g.id === card.dataset.gearId);
        if (gear) studioState.setFixedGear(gear);
      });
    });
  }

  // Silhouette SVG personnalisée selon la forme du plateau
  getFixedGearSVG(gear) {
    const col = gear.color;
    if (gear.shapeType === 'triangle') {
      return `
        <svg width="54" height="54" viewBox="0 0 100 100">
          <path d="M50,14 C70,14 88,40 88,68 C88,88 68,88 50,88 C32,88 12,88 12,68 C12,40 30,14 50,14 Z" stroke="${col}" stroke-width="4" fill="${col}22"/>
          <circle cx="50" cy="56" r="18" stroke="${col}" stroke-width="2" stroke-dasharray="2,2" fill="none"/>
          <text x="50" y="60" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold" font-family="Outfit">${gear.innerTeeth}</text>
        </svg>
      `;
    }
    if (gear.shapeType === 'square') {
      return `
        <svg width="54" height="54" viewBox="0 0 100 100">
          <rect x="16" y="16" width="68" height="68" rx="18" stroke="${col}" stroke-width="4" fill="${col}22"/>
          <rect x="30" y="30" width="40" height="40" rx="10" stroke="${col}" stroke-width="2" stroke-dasharray="2,2" fill="none"/>
          <text x="50" y="55" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold" font-family="Outfit">${gear.innerTeeth}</text>
        </svg>
      `;
    }
    if (gear.shapeType === 'heart') {
      return `
        <svg width="54" height="54" viewBox="0 0 100 100">
          <path d="M50,82 C22,62 14,46 14,32 C14,18 24,12 36,12 C44,12 48,16 50,22 C52,16 56,12 64,12 C76,12 86,18 86,32 C86,46 78,62 50,82 Z" stroke="${col}" stroke-width="4" fill="${col}22"/>
          <text x="50" y="48" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="bold" font-family="Outfit">${gear.innerTeeth}</text>
        </svg>
      `;
    }
    if (gear.shapeType === 'oval') {
      return `
        <svg width="54" height="54" viewBox="0 0 100 100">
          <ellipse cx="50" cy="50" rx="44" ry="30" stroke="${col}" stroke-width="4" fill="${col}22"/>
          <ellipse cx="50" cy="50" rx="28" ry="18" stroke="${col}" stroke-width="2" stroke-dasharray="2,2" fill="none"/>
          <text x="50" y="54" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold" font-family="Outfit">${gear.innerTeeth}</text>
        </svg>
      `;
    }
    if (gear.category === 'linear') {
      return `
        <svg width="54" height="54" viewBox="0 0 100 100">
          <rect x="8" y="38" width="84" height="24" rx="4" stroke="${col}" stroke-width="3" fill="${col}22"/>
          <line x1="8" y1="38" x2="92" y2="38" stroke="${col}" stroke-width="2" stroke-dasharray="3,3"/>
          <text x="50" y="54" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="bold" font-family="Outfit">${gear.innerTeeth}</text>
        </svg>
      `;
    }
    // Cercle standard
    return `
      <svg width="54" height="54" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" stroke="${col}" stroke-width="4" fill="${col}22"/>
        <circle cx="50" cy="50" r="28" stroke="${col}" stroke-width="3" stroke-dasharray="3,3" fill="none"/>
        <text x="50" y="54" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="bold" font-family="Outfit">${gear.innerTeeth}</text>
      </svg>
    `;
  }

  // Onglet Roues Mobiles avec séparation claire Formes Spéciales / Rondes
  renderWheelsTab(container) {
    let html = `
      <div class="section-header">
        <span class="section-title">Trou de Stylet Actif</span>
        <span class="section-badge">Trou ${studioState.holeIndex + 1} / ${(studioState.mobileGear.holes || []).length}</span>
      </div>

      <div class="hole-selector-wrapper">
        <div class="hole-interactive-preview" id="wheel-interactive-preview">
          <canvas id="hole-preview-canvas" width="340" height="130"></canvas>
        </div>

        <div class="hole-buttons-scroll">
    `;

    const holes = studioState.mobileGear.holes || [];
    for (let i = 0; i < holes.length; i++) {
      const h = holes[i];
      const isSelected = i === studioState.holeIndex;
      html += `
        <button class="hole-chip-btn ${isSelected ? 'active' : ''}" data-hole-idx="${i}" title="${h.label}">
          ${h.number}
        </button>
      `;
    }

    html += `
        </div>
      </div>

      <div class="section-header" style="margin-top: 14px;">
        <span class="section-title">Choisir la Roue Mobile</span>
        <div style="display: flex; gap: 4px;">
          <button class="header-btn wheel-cat-btn ${this.wheelCategoryFilter === 'all' ? 'btn-primary' : ''}" data-filter="all" style="padding: 2px 7px; font-size: 11px;">Toutes (${MOBILE_WHEELS.length})</button>
          <button class="header-btn wheel-cat-btn ${this.wheelCategoryFilter === 'shape' ? 'btn-primary' : ''}" data-filter="shape" style="padding: 2px 7px; font-size: 11px; color: #f472b6;">Formes Spéciales (9)</button>
          <button class="header-btn wheel-cat-btn ${this.wheelCategoryFilter === 'round' ? 'btn-primary' : ''}" data-filter="round" style="padding: 2px 7px; font-size: 11px;">Rondes (14)</button>
        </div>
      </div>

      <div class="gears-grid">
    `;

    const filteredWheels = MOBILE_WHEELS.filter(w => {
      if (this.wheelCategoryFilter === 'round') return w.shape === 'round';
      if (this.wheelCategoryFilter === 'shape') return w.shape !== 'round';
      return true;
    });

    for (const wheel of filteredWheels) {
      const isActive = studioState.mobileGear.id === wheel.id;
      const isShape = wheel.shape !== 'round';
      html += `
        <div class="gear-card ${isActive ? 'active' : ''}" data-wheel-id="${wheel.id}" style="--gear-color: ${wheel.color}">
          <div class="gear-preview-svg">
            ${this.getWheelSVG(wheel)}
          </div>
          <div class="gear-card-title">${wheel.name}</div>
          <div class="gear-card-desc">${isShape ? 'Forme Spéciale' : 'Roue Circulaire'}</div>
          <div class="gear-card-badge" style="${isShape ? 'border-color: var(--accent-rose); color: #f472b6; font-weight: 700;' : ''}">
            ${wheel.teeth} dents • ${wheel.holes.length} trous
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    this.renderHolePreviewCanvas();

    container.querySelectorAll('.wheel-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.wheelCategoryFilter = btn.dataset.filter;
        this.renderSidebarContent();
      });
    });

    container.querySelectorAll('.hole-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.holeIdx, 10);
        studioState.setHole(idx);
        this.renderSidebarContent();
      });
    });

    container.querySelectorAll('.gear-card').forEach(card => {
      card.addEventListener('click', () => {
        const wheel = MOBILE_WHEELS.find(w => w.id === card.dataset.wheelId);
        if (wheel) studioState.setMobileGear(wheel);
      });
    });
  }

  // Silhouette SVG personnalisée selon la forme de la roue mobile
  getWheelSVG(wheel) {
    const col = wheel.color;
    if (wheel.shape === 'triangle') {
      return `
        <svg width="52" height="52" viewBox="0 0 100 100">
          <path d="M50,14 C72,14 88,44 88,68 C88,86 68,86 50,86 C32,86 12,86 12,68 C12,44 28,14 50,14 Z" stroke="${col}" stroke-width="4" fill="${col}28"/>
          <text x="50" y="60" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="bold" font-family="Outfit">${wheel.teeth}</text>
        </svg>
      `;
    }
    if (wheel.shape === 'oval') {
      return `
        <svg width="52" height="52" viewBox="0 0 100 100">
          <ellipse cx="50" cy="50" rx="44" ry="26" stroke="${col}" stroke-width="4" stroke-dasharray="2,2" fill="${col}28"/>
          <text x="50" y="55" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="bold" font-family="Outfit">${wheel.teeth}</text>
        </svg>
      `;
    }
    if (wheel.shape === 'bar') {
      return `
        <svg width="52" height="52" viewBox="0 0 100 100">
          <rect x="12" y="36" width="76" height="28" rx="14" stroke="${col}" stroke-width="4" fill="${col}28"/>
          <text x="50" y="55" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="bold" font-family="Outfit">${wheel.teeth}</text>
        </svg>
      `;
    }
    if (wheel.shape === 'cross') {
      return `
        <svg width="52" height="52" viewBox="0 0 100 100">
          <path d="M38,14 H62 V38 H86 V62 H62 V86 H38 V62 H14 V38 H38 Z" stroke="${col}" stroke-width="3" fill="${col}28"/>
          <text x="50" y="55" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="bold" font-family="Outfit">${wheel.teeth}</text>
        </svg>
      `;
    }
    if (wheel.shape === 'square') {
      return `
        <svg width="52" height="52" viewBox="0 0 100 100">
          <rect x="20" y="20" width="60" height="60" rx="14" stroke="${col}" stroke-width="4" fill="${col}28"/>
          <text x="50" y="55" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="bold" font-family="Outfit">${wheel.teeth}</text>
        </svg>
      `;
    }
    if (wheel.shape === 'heart') {
      return `
        <svg width="52" height="52" viewBox="0 0 100 100">
          <path d="M50,82 C22,62 14,46 14,32 C14,18 24,12 36,12 C44,12 48,16 50,22 C52,16 56,12 64,12 C76,12 86,18 86,32 C86,46 78,62 50,82 Z" stroke="${col}" stroke-width="4" fill="${col}28"/>
          <text x="50" y="48" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="bold" font-family="Outfit">${wheel.teeth}</text>
        </svg>
      `;
    }
    if (wheel.shape === 'star') {
      return `
        <svg width="52" height="52" viewBox="0 0 100 100">
          <polygon points="50,12 62,38 90,38 68,54 76,82 50,64 24,82 32,54 10,38 38,38" stroke="${col}" stroke-width="3" fill="${col}28"/>
          <text x="50" y="56" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold" font-family="Outfit">${wheel.teeth}</text>
        </svg>
      `;
    }
    if (wheel.shape === 'shuttle') {
      return `
        <svg width="52" height="52" viewBox="0 0 100 100">
          <path d="M14,50 Q50,18 86,50 Q50,82 14,50 Z" stroke="${col}" stroke-width="4" fill="${col}28"/>
          <text x="50" y="55" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="bold" font-family="Outfit">${wheel.teeth}</text>
        </svg>
      `;
    }
    return `
      <svg width="52" height="52" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="38" stroke="${col}" stroke-width="4" stroke-dasharray="2,2" fill="${col}28"/>
        <text x="50" y="55" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="bold" font-family="Outfit">${wheel.teeth}</text>
      </svg>
    `;
  }

  // Diagramme interactif du trou sur la forme réelle de la roue active
  renderHolePreviewCanvas() {
    const canvas = document.getElementById('hole-preview-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const wheel = studioState.mobileGear;
    const holes = wheel.holes || [];
    const activeHoleIdx = studioState.holeIndex;

    ctx.save();
    ctx.translate(w / 2, h / 2);

    const r0 = Math.min(w, h) * 0.40;
    ctx.fillStyle = `${wheel.color}22`;
    ctx.strokeStyle = `${wheel.color}aa`;
    ctx.lineWidth = 2;

    // Tracé de la silhouette exacte de la roue
    ctx.beginPath();
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const psi = (i * 2 * Math.PI) / steps;
      const localR = getWheelLocalRadius(wheel, psi, r0);
      const x = localR * Math.cos(psi);
      const y = localR * Math.sin(psi);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${wheel.teeth}`, 0, 0);

    for (let i = 0; i < holes.length; i++) {
      const hole = holes[i];
      const localR = getWheelLocalRadius(wheel, hole.angleOffset || 0, r0);
      const dist = localR * hole.rRatio;
      const angle = hole.angleOffset || 0;
      const x = dist * Math.cos(angle);
      const y = dist * Math.sin(angle);
      const isSel = i === activeHoleIdx;

      ctx.beginPath();
      ctx.arc(x, y, isSel ? 6 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isSel ? '#ffffff' : 'rgba(255, 255, 255, 0.6)';
      ctx.fill();

      if (isSel) {
        ctx.strokeStyle = wheel.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = isSel ? '#38bdf8' : 'rgba(255, 255, 255, 0.7)';
      ctx.font = '700 9px Outfit';
      ctx.fillText(`${hole.number}`, x + 9, y - 5);
    }

    ctx.restore();
  }

  renderPensTab(container) {
    let html = `
      <div class="section-header">
        <span class="section-title">Pointes de Stylet</span>
      </div>

      <div class="pens-grid">
    `;

    for (const style of PEN_STYLES) {
      const isActive = studioState.penStyle.id === style.id;
      html += `
        <div class="pen-card ${isActive ? 'active' : ''}" data-style-id="${style.id}">
          <div class="pen-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${isActive ? 'var(--accent-cyan)' : '#ffffff'}" stroke-width="2">
              <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
            </svg>
          </div>
          <div class="pen-info-text">
            <div class="pen-name">${style.name}</div>
            <div class="pen-desc">${style.subtitle} • ${style.desc}</div>
          </div>
        </div>
      `;
    }

    html += `
      </div>

      <div class="section-header" style="margin-top: 16px;">
        <span class="section-title">Palette d'Encres Deluxe</span>
      </div>

      <div class="color-swatches-grid">
    `;

    for (const col of DELUXE_COLORS) {
      const isActive = studioState.penColor.toLowerCase() === col.hex.toLowerCase();
      html += `
        <button class="color-swatch-btn ${isActive ? 'active' : ''}" data-hex="${col.hex}" style="background-color: ${col.hex}" title="${col.name}"></button>
      `;
    }

    html += `
      </div>

      <div style="display: flex; align-items: center; gap: 10px; margin-top: 12px;">
        <span style="font-size: 12px; color: var(--text-secondary);">Couleur personnalisée :</span>
        <input type="color" id="custom-color-picker" value="${studioState.penColor}" style="cursor: pointer; background: none; border: none; width: 36px; height: 32px;">
      </div>
    `;

    container.innerHTML = html;

    container.querySelectorAll('.pen-card').forEach(card => {
      card.addEventListener('click', () => {
        const style = PEN_STYLES.find(s => s.id === card.dataset.styleId);
        if (style) {
          studioState.setPenStyle(style);
          this.renderSidebarContent();
        }
      });
    });

    container.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        studioState.setPenColor(btn.dataset.hex);
        this.renderSidebarContent();
      });
    });

    const customPicker = container.querySelector('#custom-color-picker');
    if (customPicker) {
      customPicker.addEventListener('input', (e) => {
        studioState.setPenColor(e.target.value);
      });
    }
  }

  renderPresetsModal() {
    const grid = document.getElementById('presets-grid');
    if (!grid) return;

    let html = '';
    for (const preset of PRESETS) {
      html += `
        <div class="preset-card" data-preset-id="${preset.id}">
          <div class="preset-card-header">
            <span class="preset-title">${preset.name}</span>
            <span class="preset-tag">${preset.tag}</span>
          </div>
          <div class="preset-desc">${preset.description}</div>
          <div style="font-size: 11px; color: var(--accent-cyan); font-weight: 600;">
            ${preset.layers.length} calque(s) superposé(s)
          </div>
        </div>
      `;
    }

    grid.innerHTML = html;

    grid.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const p = PRESETS.find(item => item.id === card.dataset.presetId);
        if (p) {
          studioState.loadPreset(p);
          this.closeModal('presets-modal');
        }
      });
    });

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const overlay = e.target.closest('.modal-overlay');
        if (overlay) overlay.classList.remove('open');
      });
    });
  }

  openRosetteModal() {
    const countStr = prompt('Combien de branches de répétition voulez-vous générer pour la Rosette ? (ex: 6, 8, 12, 16)', '8');
    const count = parseInt(countStr, 10);
    if (count && count >= 2 && count <= 32) {
      studioState.replicateRosette(count);
    }
  }

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
  }

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
  }

  updateLayersUI() {
    const list = document.getElementById('layers-list');
    const badge = document.getElementById('layers-count-badge');
    if (!list) return;

    const allCount = studioState.layers.length + (studioState.activeLayer ? 1 : 0);
    if (badge) badge.textContent = `${allCount}`;

    let html = '';

    if (studioState.activeLayer) {
      const al = studioState.activeLayer;
      html += `
        <div class="layer-item-card" style="border-left: 3px solid var(--accent-cyan);">
          <div class="layer-color-dot" style="background-color: ${al.color}"></div>
          <div class="layer-item-title">
            <strong>${al.name}</strong> (En cours)
          </div>
        </div>
      `;
    }

    for (let i = studioState.layers.length - 1; i >= 0; i--) {
      const l = studioState.layers[i];
      html += `
        <div class="layer-item-card">
          <div class="layer-color-dot" style="background-color: ${l.color}"></div>
          <div class="layer-item-title">${l.name}</div>
          <div class="layer-actions">
            <button class="icon-btn btn-toggle-layer-vis" data-id="${l.id}" title="Afficher/Masquer">
              ${l.visible !== false ? '👁️' : '🙈'}
            </button>
            <button class="icon-btn btn-del-layer" data-id="${l.id}" title="Supprimer">
              🗑️
            </button>
          </div>
        </div>
      `;
    }

    list.innerHTML = html;

    list.querySelectorAll('.btn-toggle-layer-vis').forEach(btn => {
      btn.addEventListener('click', () => {
        studioState.toggleLayerVisibility(btn.dataset.id);
      });
    });

    list.querySelectorAll('.btn-del-layer').forEach(btn => {
      btn.addEventListener('click', () => {
        studioState.removeLayer(btn.dataset.id);
      });
    });
  }

  updateMathHUD() {
    if (!studioState.activeLayer) return;
    const stats = studioState.activeLayer.stats;
    if (!stats) return;

    const ratioEl = document.getElementById('stat-ratio');
    const petalsEl = document.getElementById('stat-petals');
    const turnsEl = document.getElementById('stat-turns');
    const teethEl = document.getElementById('stat-teeth');

    if (ratioEl) ratioEl.textContent = `${stats.fixedTeeth} / ${stats.wheelTeeth} (${stats.ratio})`;
    if (petalsEl) petalsEl.textContent = `${stats.petals} branches`;
    if (turnsEl) turnsEl.textContent = `${stats.rotationsAroundRing} tour(s)`;
    if (teethEl) teethEl.textContent = `${stats.totalTeethTraveled} pas`;
  }

  updateAllUI() {
    this.renderTabs();
    this.renderSidebarContent();
    this.updateLayersUI();
    this.updateMathHUD();
    this.updatePlayButton();
  }
}
