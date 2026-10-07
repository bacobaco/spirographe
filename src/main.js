// Point d'entrée de l'application Spirographe Deluxe Studio

import './style.css';
import { SpiroStudioApp } from './ui/app.js';

window.addEventListener('DOMContentLoaded', () => {
  const app = new SpiroStudioApp();
  window.__spiroStudio = app;

  // Support des paramètres d'URL pour le partage et la prévisualisation instantanée
  const params = new URLSearchParams(window.location.search);
  const presetId = params.get('preset');
  if (presetId) {
    const { PRESETS } = import('./presets/presets.js').then(({ PRESETS }) => {
      const p = PRESETS.find(item => item.id === presetId);
      if (p) {
        import('./state/state.js').then(({ studioState }) => {
          studioState.loadPreset(p);
          if (params.get('instant') === 'true') {
            studioState.instantDraw();
          }
        });
      }
    });
  } else if (params.get('instant') === 'true') {
    import('./state/state.js').then(({ studioState }) => {
      studioState.instantDraw();
    });
  }
});
