// Gestionnaire d'état réactif et d'historique du Spirographe Deluxe

import { FIXED_GEARS, MOBILE_WHEELS, PEN_STYLES, DELUXE_COLORS, PAPER_THEMES } from '../math/gears.js';
import { generateFullTrajectory, TOOTH_PITCH } from '../math/engine.js';
import { sounds } from '../audio/sound.js';

export class StudioState {
  constructor() {
    this.fixedGear = FIXED_GEARS[0];
    this.mobileGear = MOBILE_WHEELS.find(w => w.id === 'wheel-52') || MOBILE_WHEELS[7];
    this.mode = 'hypo'; // 'hypo' | 'epi' | 'rack'
    this.holeIndex = 0; // Trou 1 par défaut
    this.penStyle = PEN_STYLES[0];
    this.penColor = DELUXE_COLORS[0].hex;
    this.lineWidth = 1.5;
    this.paperTheme = PAPER_THEMES[0];

    this.layers = [];
    this.activeLayer = null;

    this.isPlaying = false;
    this.speed = 1.5;
    this.progress = 0;
    this.showGears = true;
    this.showGrid = true;
    this.isMuted = false;
    this.zoom = 1.0;

    this.phaseOffsetDeg = 0;

    this.historyStack = [];
    this.redoStack = [];

    this.listeners = new Set();

    this.initDefaultSession();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, data) {
    for (const listener of this.listeners) {
      listener(event, data, this);
    }
  }

  initDefaultSession() {
    this.createNewActiveLayer();
  }

  createNewActiveLayer(opts = {}) {
    const fixedGear = opts.fixedGear || this.fixedGear;
    const mobileGear = opts.mobileGear || this.mobileGear;
    const mode = opts.mode || this.mode;
    const holeIndex = opts.holeIndex !== undefined ? opts.holeIndex : this.holeIndex;
    const penStyle = opts.penStyle || this.penStyle;
    const color = opts.color || this.penColor;
    const lineWidth = opts.lineWidth || this.lineWidth;
    const phaseOffsetDeg = opts.phaseOffsetDeg !== undefined ? opts.phaseOffsetDeg : this.phaseOffsetDeg;

    const holes = mobileGear.holes || [];
    const hole = holes[Math.min(holeIndex, holes.length - 1)] || holes[0];

    const phaseOffsetRad = (phaseOffsetDeg * Math.PI) / 180;

    const fullTraj = generateFullTrajectory({
      fixedGear,
      mobileGear,
      holeIndex,
      hole,
      mode,
      phaseOffset: phaseOffsetRad,
      unitScale: TOOTH_PITCH
    });

    const layerId = `layer-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const layerName = `Tracé ${this.layers.length + 1} (${mobileGear.name} / ${fixedGear.name.split(' ')[0]})`;

    this.activeLayer = {
      id: layerId,
      name: layerName,
      fixedGearId: fixedGear.id,
      mobileGearId: mobileGear.id,
      mode,
      holeNumber: hole.number,
      holeIndex,
      penStyle: penStyle.id,
      color,
      lineWidth,
      phaseOffsetDeg,
      points: fullTraj.points,
      stats: fullTraj.stats,
      maxTheta: fullTraj.maxTheta,
      animatedCount: 0,
      visible: true
    };

    this.progress = 0;
    this.isPlaying = false;
    this.notify('activeLayerChanged', this.activeLayer);
  }

  commitActiveLayer() {
    if (!this.activeLayer) return;

    this.activeLayer.animatedCount = this.activeLayer.points.length;
    this.saveSnapshot();

    this.layers.push({ ...this.activeLayer });
    sounds.playSelectSnap();

    const nextColor = this.getNextSuggestedColor(this.activeLayer.color);
    this.penColor = nextColor;

    this.createNewActiveLayer({
      color: nextColor
    });

    this.notify('layersUpdated', this.layers);
  }

  getNextSuggestedColor(currentColor) {
    const classicColors = DELUXE_COLORS.map(c => c.hex);
    const idx = classicColors.indexOf(currentColor);
    if (idx !== -1 && idx + 1 < classicColors.length) {
      return classicColors[idx + 1];
    }
    return classicColors[1];
  }

  replicateRosette(count = 8, angleStepDeg = null) {
    if (!this.activeLayer) return;
    this.saveSnapshot();

    const baseLayer = this.activeLayer;
    const step = angleStepDeg !== null ? angleStepDeg : 360 / count;

    for (let i = 1; i < count; i++) {
      const offsetDeg = (baseLayer.phaseOffsetDeg + i * step) % 360;
      const offsetRad = (offsetDeg * Math.PI) / 180;

      const fixedGear = FIXED_GEARS.find(g => g.id === baseLayer.fixedGearId) || this.fixedGear;
      const mobileGear = MOBILE_WHEELS.find(w => w.id === baseLayer.mobileGearId) || this.mobileGear;

      const traj = generateFullTrajectory({
        fixedGear,
        mobileGear,
        holeIndex: baseLayer.holeIndex,
        mode: baseLayer.mode,
        phaseOffset: offsetRad,
        unitScale: TOOTH_PITCH
      });

      this.layers.push({
        id: `layer-${Date.now()}-${i}`,
        name: `Rosette ${i + 1}/${count}`,
        fixedGearId: baseLayer.fixedGearId,
        mobileGearId: baseLayer.mobileGearId,
        mode: baseLayer.mode,
        holeNumber: baseLayer.holeNumber,
        holeIndex: baseLayer.holeIndex,
        penStyle: baseLayer.penStyle,
        color: baseLayer.color,
        lineWidth: baseLayer.lineWidth,
        phaseOffsetDeg: offsetDeg,
        points: traj.points,
        stats: traj.stats,
        maxTheta: traj.maxTheta,
        animatedCount: traj.points.length,
        visible: true
      });
    }

    sounds.playSelectSnap();
    this.commitActiveLayer();
    this.notify('layersUpdated', this.layers);
  }

  setFixedGear(gear) {
    if (this.fixedGear.id === gear.id) return;
    this.fixedGear = gear;
    sounds.playSelectSnap();
    this.createNewActiveLayer();
    this.notify('gearChanged', { type: 'fixed', gear });
  }

  setMobileGear(wheel) {
    if (this.mobileGear.id === wheel.id) return;
    this.mobileGear = wheel;
    this.holeIndex = 0;
    sounds.playSelectSnap();
    this.createNewActiveLayer();
    this.notify('gearChanged', { type: 'mobile', wheel });
  }

  setRollingMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    sounds.playSelectSnap();
    this.createNewActiveLayer();
    this.notify('modeChanged', mode);
  }

  setHole(holeIndex) {
    if (this.holeIndex === holeIndex) return;
    this.holeIndex = holeIndex;
    sounds.playSelectSnap();
    this.createNewActiveLayer();
    this.notify('holeChanged', holeIndex);
  }

  setPenStyle(penStyle) {
    this.penStyle = penStyle;
    if (this.activeLayer) {
      this.activeLayer.penStyle = penStyle.id;
      this.activeLayer.lineWidth = penStyle.width;
      this.notify('layerStyleChanged', this.activeLayer);
    }
  }

  setPenColor(colorHex) {
    this.penColor = colorHex;
    if (this.activeLayer) {
      this.activeLayer.color = colorHex;
      this.notify('layerStyleChanged', this.activeLayer);
    }
  }

  setPaperTheme(theme) {
    this.paperTheme = theme;
    sounds.playSelectSnap();
    this.notify('paperThemeChanged', theme);
  }

  setPhaseOffset(deg) {
    this.phaseOffsetDeg = deg;
    this.createNewActiveLayer();
  }

  instantDraw() {
    if (!this.activeLayer) return;
    this.progress = 1.0;
    this.activeLayer.animatedCount = this.activeLayer.points.length;
    this.isPlaying = false;
    sounds.playSelectSnap();
    this.notify('drawCompleted', this.activeLayer);
  }

  clearAll() {
    this.saveSnapshot();
    this.layers = [];
    this.createNewActiveLayer();
    sounds.playSelectSnap();
    this.notify('layersCleared');
  }

  loadPreset(preset) {
    this.saveSnapshot();
    this.layers = [];

    const theme = PAPER_THEMES.find(p => p.id === preset.paperId) || PAPER_THEMES[0];
    this.paperTheme = theme;

    for (let i = 0; i < preset.layers.length; i++) {
      const cfg = preset.layers[i];
      const fixedGear = FIXED_GEARS.find(g => g.id === cfg.fixedGearId) || FIXED_GEARS[0];
      const mobileGear = MOBILE_WHEELS.find(w => w.id === cfg.mobileGearId) || MOBILE_WHEELS[0];
      const hole = mobileGear.holes[Math.min(cfg.holeNumber - 1, mobileGear.holes.length - 1)] || mobileGear.holes[0];

      const phaseRad = (cfg.phaseOffsetDeg * Math.PI) / 180;
      const fullTraj = generateFullTrajectory({
        fixedGear,
        mobileGear,
        holeIndex: cfg.holeNumber - 1,
        hole,
        mode: cfg.mode,
        phaseOffset: phaseRad,
        unitScale: TOOTH_PITCH
      });

      this.layers.push({
        id: `preset-${preset.id}-${i}`,
        name: `${preset.name} (Couche ${i + 1})`,
        fixedGearId: cfg.fixedGearId,
        mobileGearId: cfg.mobileGearId,
        mode: cfg.mode,
        holeNumber: cfg.holeNumber,
        holeIndex: cfg.holeNumber - 1,
        penStyle: cfg.penStyleId,
        color: cfg.color,
        lineWidth: cfg.lineWidth || 1.5,
        phaseOffsetDeg: cfg.phaseOffsetDeg,
        points: fullTraj.points,
        stats: fullTraj.stats,
        maxTheta: fullTraj.maxTheta,
        animatedCount: fullTraj.points.length,
        visible: true
      });
    }

    const lastLayer = preset.layers[preset.layers.length - 1];
    this.fixedGear = FIXED_GEARS.find(g => g.id === lastLayer.fixedGearId) || this.fixedGear;
    this.mobileGear = MOBILE_WHEELS.find(w => w.id === lastLayer.mobileGearId) || this.mobileGear;
    this.mode = lastLayer.mode;
    this.holeIndex = Math.max(0, lastLayer.holeNumber - 1);
    this.penColor = lastLayer.color;

    this.createNewActiveLayer({
      phaseOffsetDeg: (lastLayer.phaseOffsetDeg + 15) % 360
    });

    sounds.playSelectSnap();
    this.notify('presetLoaded', preset);
  }

  saveSnapshot() {
    this.historyStack.push({
      layers: JSON.parse(JSON.stringify(this.layers))
    });
    if (this.historyStack.length > 25) {
      this.historyStack.shift();
    }
    this.redoStack = [];
  }

  undo() {
    if (this.historyStack.length === 0) return;
    this.redoStack.push({
      layers: JSON.parse(JSON.stringify(this.layers))
    });
    const snapshot = this.historyStack.pop();
    this.layers = snapshot.layers;
    sounds.playSelectSnap();
    this.notify('layersUpdated', this.layers);
  }

  redo() {
    if (this.redoStack.length === 0) return;
    this.historyStack.push({
      layers: JSON.parse(JSON.stringify(this.layers))
    });
    const snapshot = this.redoStack.pop();
    this.layers = snapshot.layers;
    sounds.playSelectSnap();
    this.notify('layersUpdated', this.layers);
  }

  removeLayer(id) {
    this.saveSnapshot();
    this.layers = this.layers.filter(l => l.id !== id);
    sounds.playSelectSnap();
    this.notify('layersUpdated', this.layers);
  }

  toggleLayerVisibility(id) {
    const l = this.layers.find(item => item.id === id);
    if (l) {
      l.visible = !l.visible;
      this.notify('layersUpdated', this.layers);
    }
  }
}

export const studioState = new StudioState();
