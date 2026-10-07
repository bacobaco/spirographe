// Moteur de rendu Canvas 2D centré en (0,0) pour le Spirographe Deluxe

import { getRingLocalRadius, getWheelLocalRadius } from '../math/engine.js';
import { FIXED_GEARS, MOBILE_WHEELS } from '../math/gears.js';

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;

    this.showGears = true;
    this.showGrid = true;
    this.isDraggingWheel = false;

    // Dimensions logiques
    this.width = 800;
    this.height = 800;
    this.center = { x: 400, y: 400 };
    this.zoom = 1.0;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.center = { x: width / 2, y: height / 2 };

    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  // Rendu de la scène centrée en (0, 0)
  renderScene({
    paperTheme,
    layers = [],
    activeLayer = null,
    activeGearState = null,
    showGears = true,
    showGrid = true,
    zoom = 1.0
  }) {
    this.showGears = showGears;
    this.showGrid = showGrid;
    this.zoom = zoom;

    this.clear();

    this.ctx.save();
    // Translation vers le centre du canvas
    this.ctx.translate(this.center.x, this.center.y);
    this.ctx.scale(this.zoom, this.zoom);

    // 1. Fond papier et texture centrés
    this.renderPaper(paperTheme);

    // 2. Grille polaire en filigrane
    if (this.showGrid) {
      this.renderGrid(paperTheme);
    }

    // 3. Dessin des calques validés
    for (const layer of layers) {
      if (layer.visible !== false) {
        this.renderLayerPath(layer);
      }
    }

    // 4. Dessin du calque actif en cours de tracé
    if (activeLayer && activeLayer.visible !== false) {
      this.renderLayerPath(activeLayer);
    }

    // 5. Affichage des roues physiques en acrylique
    if (this.showGears && activeGearState && activeLayer) {
      this.renderAcrylicGears(activeLayer, activeGearState, paperTheme);
    }

    this.ctx.restore();
  }

  // Feuille de dessin centrée
  renderPaper(paperTheme) {
    const ctx = this.ctx;
    const size = Math.min(this.width, this.height) - 30;
    const half = size / 2;

    ctx.save();
    ctx.shadowColor = paperTheme.dark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.18)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;

    ctx.fillStyle = paperTheme.bgColor;
    ctx.beginPath();
    ctx.roundRect(-half, -half, size, size, 14);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = paperTheme.dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Vignette périphérique
    const grad = ctx.createRadialGradient(0, 0, size * 0.35, 0, 0, size * 0.65);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, paperTheme.dark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.04)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(-half, -half, size, size, 14);
    ctx.fill();
  }

  // Grille polaire centrée à (0, 0)
  renderGrid(paperTheme) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = paperTheme.gridColor;
    ctx.lineWidth = 0.8;

    const maxR = (Math.min(this.width, this.height) - 40) / 2;
    for (let r = 40; r <= maxR; r += 40) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let deg = 0; deg < 360; deg += 30) {
      const rad = (deg * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxR * Math.cos(rad), maxR * Math.sin(rad));
      ctx.stroke();
    }

    // Croix repère au centre
    ctx.strokeStyle = paperTheme.dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(12, 0);
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 12);
    ctx.stroke();

    ctx.restore();
  }

  // Rendu de trajectoire
  renderLayerPath(layer) {
    const points = layer.points;
    if (!points || points.length < 2) return;

    const ctx = this.ctx;
    const count = layer.animatedCount !== undefined ? Math.min(layer.animatedCount, points.length) : points.length;
    if (count < 2) return;

    const penStyle = layer.penStyle || 'ballpoint';
    const color = layer.color || '#1d4ed8';
    const lineWidth = layer.lineWidth || 1.5;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (penStyle) {
      case 'fineliner':
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth * 0.8;
        ctx.globalAlpha = 1.0;
        this.drawBasicPath(points, count);
        break;

      case 'felt-tip':
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth * 1.6;
        ctx.globalAlpha = 0.82;
        this.drawBasicPath(points, count);
        break;

      case 'neon-glow':
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth * 2.2;
        ctx.globalAlpha = 0.55;
        this.drawBasicPath(points, count);

        ctx.shadowBlur = 8;
        ctx.lineWidth = lineWidth * 1.4;
        ctx.globalAlpha = 0.85;
        this.drawBasicPath(points, count);

        ctx.shadowBlur = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(0.7, lineWidth * 0.45);
        ctx.globalAlpha = 0.95;
        this.drawBasicPath(points, count);
        break;

      case 'rainbow':
        ctx.lineWidth = lineWidth * 1.2;
        ctx.globalAlpha = 0.95;
        const step = 4;
        for (let i = 0; i < count - 1; i += step) {
          const nextIdx = Math.min(i + step, count - 1);
          const p1 = points[i];
          const hue = Math.round((i / points.length) * 360) % 360;

          ctx.strokeStyle = `hsl(${hue}, 95%, 52%)`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          for (let j = i + 1; j <= nextIdx; j++) {
            ctx.lineTo(points[j].x, points[j].y);
          }
          ctx.stroke();
        }
        break;

      case 'twin-pen':
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = 0.9;
        this.drawOffsetPath(points, count, -2.0);
        this.drawOffsetPath(points, count, 2.0);
        break;

      case 'metallic-gold':
        ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
        ctx.shadowBlur = 6;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth * 1.3;
        ctx.globalAlpha = 0.95;
        this.drawBasicPath(points, count);
        break;

      case 'ballpoint':
      default:
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = 0.92;
        this.drawBasicPath(points, count);
        break;
    }

    ctx.restore();
  }

  drawBasicPath(points, count) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < count; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  drawOffsetPath(points, count, offsetPx) {
    const ctx = this.ctx;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const p = points[i];
      const next = points[Math.min(i + 1, count - 1)];
      const dx = next.x - p.x;
      const dy = next.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      const ox = p.x + nx * offsetPx;
      const oy = p.y + ny * offsetPx;
      if (i === 0) {
        ctx.moveTo(ox, oy);
      } else {
        ctx.lineTo(ox, oy);
      }
    }
    ctx.stroke();
  }

  // Rendu des roues physiques en acrylique
  renderAcrylicGears(layer, state, paperTheme) {
    const fixedGear = FIXED_GEARS.find(g => g.id === layer.fixedGearId) || FIXED_GEARS[0];
    const mobileGear = MOBILE_WHEELS.find(w => w.id === layer.mobileGearId) || MOBILE_WHEELS[0];

    this.renderFixedGearVisual(fixedGear, state, paperTheme);
    this.renderMobileGearVisual(mobileGear, state, paperTheme);
    this.renderPenStylus(state, layer.color);
  }

  renderFixedGearVisual(fixedGear, state, paperTheme) {
    const ctx = this.ctx;
    const baseR = state.ringRadius;

    ctx.save();

    if (fixedGear.category === 'linear') {
      const rackLen = baseR * 2 * Math.PI;
      const rackH = 36;
      ctx.fillStyle = 'rgba(251, 191, 36, 0.18)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-rackLen / 2, -rackH / 2, rackLen, rackH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
      ctx.lineWidth = 1.2;
      const numTeeth = fixedGear.innerTeeth || 150;
      const pitch = rackLen / numTeeth;
      for (let i = 0; i <= numTeeth; i++) {
        const x = -rackLen / 2 + i * pitch;
        ctx.beginPath();
        ctx.moveTo(x, -rackH / 2);
        ctx.lineTo(x, -rackH / 2 - 6);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    const innerR = baseR;
    const outerR = baseR + 36;

    ctx.shadowColor = paperTheme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    ctx.arc(0, 0, outerR, 0, Math.PI * 2, false);
    ctx.arc(0, 0, innerR, 0, Math.PI * 2, true);
    ctx.fillStyle = paperTheme.dark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(56, 189, 248, 0.18)';
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, outerR, 0, Math.PI * 2);
    ctx.stroke();

    // Dents intérieures
    const teethCount = fixedGear.innerTeeth || 96;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 1.5;

    for (let i = 0; i < teethCount; i++) {
      const angle = (i * 2 * Math.PI) / teethCount;
      const rInner = getRingLocalRadius(fixedGear, angle, innerR);
      const x1 = rInner * Math.cos(angle);
      const y1 = rInner * Math.sin(angle);
      const x2 = (rInner + 5) * Math.cos(angle);
      const y2 = (rInner + 5) * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Inscription gravée
    ctx.fillStyle = paperTheme.dark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.35)';
    ctx.font = '600 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${fixedGear.outerTeeth} / ${fixedGear.innerTeeth} DELUXE`, 0, -(innerR + outerR) / 2);

    // Points de fixation Spiro-Putty
    for (let deg of [45, 135, 225, 315]) {
      const rad = (deg * Math.PI) / 180;
      const px = (outerR - 10) * Math.cos(rad);
      const py = (outerR - 10) * Math.sin(rad);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  renderMobileGearVisual(mobileGear, state, paperTheme) {
    const ctx = this.ctx;
    const center = state.wheelCenter;
    const r = state.wheelRadius;
    const angle = state.wheelAngle;
    const color = mobileGear.color || '#ec4899';

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(angle);

    ctx.shadowColor = paperTheme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = this.hexToRgba(color, 0.28);
    ctx.strokeStyle = this.hexToRgba(color, 0.85);
    ctx.lineWidth = 2;

    ctx.beginPath();
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const psi = (i * 2 * Math.PI) / steps;
      const localR = getWheelLocalRadius(mobileGear, psi, r);
      const x = localR * Math.cos(psi);
      const y = localR * Math.sin(psi);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Dents
    const teeth = mobileGear.teeth || 48;
    ctx.strokeStyle = this.hexToRgba(color, 0.95);
    ctx.lineWidth = 1.3;

    for (let i = 0; i < teeth; i++) {
      const psi = (i * 2 * Math.PI) / teeth;
      const localR = getWheelLocalRadius(mobileGear, psi, r);
      const x1 = localR * Math.cos(psi);
      const y1 = localR * Math.sin(psi);
      const x2 = (localR - 4) * Math.cos(psi);
      const y2 = (localR - 4) * Math.sin(psi);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Évidements circulaires
    if (r > 35) {
      ctx.fillStyle = paperTheme.dark ? 'rgba(9, 11, 16, 0.4)' : 'rgba(253, 251, 247, 0.5)';
      ctx.strokeStyle = this.hexToRgba(color, 0.5);
      ctx.lineWidth = 1;
      const cutoutCount = 3;
      for (let i = 0; i < cutoutCount; i++) {
        const cAngle = (i * 2 * Math.PI) / cutoutCount;
        const cx = (r * 0.45) * Math.cos(cAngle);
        const cy = (r * 0.45) * Math.sin(cAngle);
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(5, r * 0.14), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Numéro de la roue
    ctx.fillStyle = paperTheme.dark ? '#ffffff' : '#0f172a';
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${mobileGear.teeth}`, 0, 0);

    // Trous de stylet
    const holes = mobileGear.holes || [];
    const selectedHole = state.selectedHole;

    for (const h of holes) {
      const localR = getWheelLocalRadius(mobileGear, h.angleOffset || 0, r);
      const d = localR * h.rRatio;
      const hx = d * Math.cos(h.angleOffset || 0);
      const hy = d * Math.sin(h.angleOffset || 0);
      const isSelected = selectedHole && selectedHole.number === h.number;

      ctx.beginPath();
      ctx.arc(hx, hy, isSelected ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#ffffff' : (paperTheme.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)');
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(hx, hy, 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (r > 30) {
        ctx.fillStyle = paperTheme.dark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
        ctx.font = '600 8px Outfit, sans-serif';
        ctx.fillText(`${h.number}`, hx + 7, hy - 4);
      }
    }

    ctx.restore();
  }

  renderPenStylus(state, inkColor = '#1d4ed8') {
    const ctx = this.ctx;
    const penPos = state.penPos;

    ctx.save();
    ctx.translate(penPos.x, penPos.y);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-6, -24);
    ctx.lineTo(6, -24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-6, -28, 12, 4);

    ctx.fillStyle = inkColor;
    ctx.fillRect(-6, -44, 12, 16);

    ctx.shadowBlur = 0;
    ctx.fillStyle = inkColor;
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  hexToRgba(hex, alpha = 1) {
    if (!hex) return `rgba(56, 189, 248, ${alpha})`;
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
