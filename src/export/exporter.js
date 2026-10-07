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

    ctx.save();
    ctx.strokeStyle = layer.color || '#1d4ed8';
    ctx.lineWidth = layer.lineWidth || 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (layer.penStyle === 'neon-glow') {
      ctx.shadowColor = layer.color;
      ctx.shadowBlur = 14;
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    ctx.restore();
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

    const color = layer.color || '#1d4ed8';
    const lineWidth = layer.lineWidth || 1.5;
    const pts = layer.points;

    let pathD = `M ${(pts[0].x + cx).toFixed(2)} ${(pts[0].y + cy).toFixed(2)}`;
    for (let i = 1; i < pts.length; i++) {
      pathD += ` L ${(pts[i].x + cx).toFixed(2)} ${(pts[i].y + cy).toFixed(2)}`;
    }

    svg += `  <g id="layer-${idx + 1}" stroke="${color}" stroke-width="${lineWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round">\n`;
    svg += `    <path d="${pathD}" />\n`;
    svg += `  </g>\n`;
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
