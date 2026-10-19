// Moteur d'exportation Haute Définition PNG et Vectoriel SVG (Centré)

export function exportAsPNG({
  canvas,
  paperTheme,
  layers,
  includeBackground = true,
  scale = 2
}) {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width * scale;
  exportCanvas.height = canvas.height * scale;
  const ctx = exportCanvas.getContext('2d');

  if (includeBackground && paperTheme) {
    ctx.fillStyle = paperTheme.bgColor;
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  }

  // Centrage au milieu du canvas d'export
  ctx.save();
  ctx.translate(exportCanvas.width / 2, exportCanvas.height / 2);
  ctx.scale(scale, scale);

  for (const layer of layers) {
    if (layer.visible === false || !layer.points || layer.points.length < 2) continue;
    const pts = layer.points;
    const baseColor = layer.color || '#1d4ed8';
    const lineWidth = layer.lineWidth || 1.5;

    const segments = (layer.colorSegments && layer.colorSegments.length > 0)
      ? layer.colorSegments
      : [{ start: 0, end: pts.length, color: baseColor }];

    for (const seg of segments) {
      const s = Math.min(pts.length, seg.start || 0);
      const e = Math.min(pts.length, seg.end !== undefined ? seg.end : pts.length);
      if (e - s < 1) continue;

      ctx.save();
      ctx.strokeStyle = seg.color || baseColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (layer.penStyle === 'neon-glow') {
        ctx.shadowColor = seg.color || baseColor;
        ctx.shadowBlur = 14;
      }

      ctx.beginPath();
      ctx.moveTo(pts[s].x, pts[s].y);
      for (let i = s + 1; i < e; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();

  const link = document.createElement('a');
  link.download = `spirographe-deluxe-${Date.now()}.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
}

export function exportAsSVG({
  width = 1000,
  height = 1000,
  layers = [],
  paperTheme,
  includeBackground = true
}) {
  const cx = width / 2;
  const cy = height / 2;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;

  if (includeBackground && paperTheme) {
    svg += `  <rect width="100%" height="100%" fill="${paperTheme.bgColor}" />\n`;
  }

  for (let idx = 0; idx < layers.length; idx++) {
    const layer = layers[idx];
    if (layer.visible === false || !layer.points || layer.points.length < 2) continue;

    const baseColor = layer.color || '#1d4ed8';
    const lineWidth = layer.lineWidth || 1.5;
    const pts = layer.points;

    const segments = (layer.colorSegments && layer.colorSegments.length > 0)
      ? layer.colorSegments
      : [{ start: 0, end: pts.length, color: baseColor }];

    for (let sIdx = 0; sIdx < segments.length; sIdx++) {
      const seg = segments[sIdx];
      const s = Math.min(pts.length, seg.start || 0);
      const e = Math.min(pts.length, seg.end !== undefined ? seg.end : pts.length);
      if (e - s < 1) continue;

      let pathD = `M ${(pts[s].x + cx).toFixed(2)} ${(pts[s].y + cy).toFixed(2)}`;
      for (let i = s + 1; i < e; i++) {
        pathD += ` L ${(pts[i].x + cx).toFixed(2)} ${(pts[i].y + cy).toFixed(2)}`;
      }

      svg += `  <g id="layer-${idx + 1}-seg-${sIdx + 1}" stroke="${seg.color || baseColor}" stroke-width="${lineWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round">\n`;
      svg += `    <path d="${pathD}" />\n`;
      svg += `  </g>\n`;
    }
  }

  svg += `</svg>\n`;

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `spirographe-vectoriel-${Date.now()}.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
