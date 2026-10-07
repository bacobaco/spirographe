// Moteur de rendu Canvas 2D haute fidélité avec engrenages physiques invariants et formes spéciales

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
    this.ctx.translate(this.center.x, this.center.y);
    this.ctx.scale(this.zoom, this.zoom);

    // 1. Fond papier d'art
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

    const grad = ctx.createRadialGradient(0, 0, size * 0.35, 0, 0, size * 0.65);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, paperTheme.dark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.04)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(-half, -half, size, size, 14);
    ctx.fill();
  }

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

  // Rendu du plateau fixe : la pièce en plastique conserve EXACTEMENT sa géométrie en hypo et en epi !
  renderFixedGearVisual(fixedGear, state, paperTheme) {
    const ctx = this.ctx;
    const innerR = state.ringInnerRadius;
    const outerR = state.ringOuterRadius;
    const innerTeeth = fixedGear.innerTeeth || 96;
    const outerTeeth = fixedGear.outerTeeth || 144;
    const color = fixedGear.color || '#38bdf8';

    ctx.save();

    // Cas d'un rail ou d'une crémaillère linéaire
    if (fixedGear.category === 'linear') {
      const rackLen = outerTeeth * state.pitch;
      const isWave = fixedGear.shapeType === 'wave';
      const rackBaseY = 30; // Strictement synchronisé avec engine.js
      const rackH = 34;

      ctx.fillStyle = this.hexToRgba(color, 0.22);
      ctx.strokeStyle = this.hexToRgba(color, 0.75);
      ctx.lineWidth = 2;

      ctx.beginPath();
      if (isWave) {
        for (let x = -rackLen / 2; x <= rackLen / 2; x += 5) {
          const y = rackBaseY + 18 * Math.sin(x / 35);
          if (x === -rackLen / 2) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let x = rackLen / 2; x >= -rackLen / 2; x -= 5) {
          const y = rackBaseY + 18 * Math.sin(x / 35) + rackH;
          ctx.lineTo(x, y);
        }
      } else {
        // Le corps du rail est strictement situé à y >= rackBaseY
        ctx.roundRect(-rackLen / 2, rackBaseY, rackLen, rackH, 6);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Dents le long de la ligne de contact
      ctx.strokeStyle = this.hexToRgba(color, 0.85);
      ctx.lineWidth = 1.2;
      const pitch = state.pitch;
      for (let i = 0; i <= outerTeeth; i++) {
        const x = -rackLen / 2 + i * pitch;
        const yTop = isWave ? (rackBaseY + 18 * Math.sin(x / 35)) : rackBaseY;
        ctx.beginPath();
        ctx.moveTo(x, yTop);
        ctx.lineTo(x, yTop - 4);
        ctx.stroke();
      }

      // Gravure sur la règle
      ctx.fillStyle = paperTheme.dark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';
      ctx.font = '600 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${outerTeeth} DENTS • DELUXE RACK`, 0, rackBaseY + rackH / 2);

      ctx.restore();
      return;
    }

    // Anneaux et cadres fermés (circulaires ou formes non rondes)
    ctx.shadowColor = paperTheme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    // Corps de l'anneau : découpe du trou intérieur et tracé de la bordure extérieure
    ctx.beginPath();
    const steps = 120;

    // Contour extérieur (sens horaire)
    for (let i = 0; i <= steps; i++) {
      const theta = (i * 2 * Math.PI) / steps;
      const rOut = getRingLocalRadius(fixedGear, theta, outerR);
      const x = rOut * Math.cos(theta);
      const y = rOut * Math.sin(theta);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    // Découpe intérieure (sens anti-horaire pour créer le trou)
    for (let i = steps; i >= 0; i--) {
      const theta = (i * 2 * Math.PI) / steps;
      const rIn = getRingLocalRadius(fixedGear, theta, innerR);
      const x = rIn * Math.cos(theta);
      const y = rIn * Math.sin(theta);
      ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.fillStyle = paperTheme.dark ? this.hexToRgba(color, 0.14) : this.hexToRgba(color, 0.22);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Bordures extérieure et intérieure
    ctx.strokeStyle = this.hexToRgba(color, 0.5);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dents intérieures (pointant vers l'intérieur pour l'hypotrochoïde)
    ctx.strokeStyle = this.hexToRgba(color, 0.7);
    ctx.lineWidth = 1.3;
    for (let i = 0; i < innerTeeth; i++) {
      const angle = (i * 2 * Math.PI) / innerTeeth;
      const rIn = getRingLocalRadius(fixedGear, angle, innerR);
      const x1 = rIn * Math.cos(angle);
      const y1 = rIn * Math.sin(angle);
      const x2 = (rIn + 4.5) * Math.cos(angle);
      const y2 = (rIn + 4.5) * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Dents extérieures (pointant vers l'extérieur pour l'épitrochoïde)
    for (let i = 0; i < outerTeeth; i++) {
      const angle = (i * 2 * Math.PI) / outerTeeth;
      const rOut = getRingLocalRadius(fixedGear, angle, outerR);
      const x1 = rOut * Math.cos(angle);
      const y1 = rOut * Math.sin(angle);
      const x2 = (rOut - 4.5) * Math.cos(angle);
      const y2 = (rOut - 4.5) * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Inscription gravée sur la couronne en acrylique
    ctx.fillStyle = paperTheme.dark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';
    ctx.font = '600 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${outerTeeth} / ${innerTeeth} DELUXE`, 0, -(innerR + outerR) / 2);

    // Points de fixation Spiro-Putty
    for (let deg of [45, 135, 225, 315]) {
      const rad = (deg * Math.PI) / 180;
      const rP = (innerR + outerR) / 2;
      const px = rP * Math.cos(rad);
      const py = rP * Math.sin(rad);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.65)';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  // Rendu de la roue mobile en acrylique (taille INVARIANTE en hypo et epi)
  renderMobileGearVisual(mobileGear, state, paperTheme) {
    const ctx = this.ctx;
    const center = state.wheelCenter;
    const r0 = state.wheelRadius; // Strictement constant !
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

    // Silhouette exacte de la forme (ronde ou non ronde)
    ctx.beginPath();
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const psi = (i * 2 * Math.PI) / steps;
      const localR = getWheelLocalRadius(mobileGear, psi, r0);
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

    // Dents d'engrenage le long du périmètre
    const teeth = mobileGear.teeth || 48;
    ctx.strokeStyle = this.hexToRgba(color, 0.95);
    ctx.lineWidth = 1.3;

    for (let i = 0; i < teeth; i++) {
      const psi = (i * 2 * Math.PI) / teeth;
      const localR = getWheelLocalRadius(mobileGear, psi, r0);
      const x1 = localR * Math.cos(psi);
      const y1 = localR * Math.sin(psi);
      const x2 = (localR - 4) * Math.cos(psi);
      const y2 = (localR - 4) * Math.sin(psi);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Évidements circulaires ergonomiques
    if (r0 > 30) {
      ctx.fillStyle = paperTheme.dark ? 'rgba(9, 11, 16, 0.4)' : 'rgba(253, 251, 247, 0.5)';
      ctx.strokeStyle = this.hexToRgba(color, 0.5);
      ctx.lineWidth = 1;

      const cutoutCount = mobileGear.shape === 'triangle' ? 3 : (mobileGear.shape === 'square' || mobileGear.shape === 'cross' ? 4 : 3);
      for (let i = 0; i < cutoutCount; i++) {
        const cAngle = (i * 2 * Math.PI) / cutoutCount;
        const cx = (r0 * 0.45) * Math.cos(cAngle);
        const cy = (r0 * 0.45) * Math.sin(cAngle);
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(4.5, r0 * 0.12), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Nombre de dents gravé
    ctx.fillStyle = paperTheme.dark ? '#ffffff' : '#0f172a';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${mobileGear.teeth}`, 0, 0);

    // Trous pour le stylet
    const holes = mobileGear.holes || [];
    const selectedHole = state.selectedHole;

    for (const h of holes) {
      const localR = getWheelLocalRadius(mobileGear, h.angleOffset || 0, r0);
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

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(hx, hy, 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (r0 > 28) {
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
