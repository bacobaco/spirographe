// Moteur audio procédural Web Audio API pour les bruits d'engrenage et de stylo

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.lastTickTime = 0;
    this.penNoiseNode = null;
    this.penGainNode = null;
    this.isDrawingSoundActive = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopPenSound();
    }
    return this.isMuted;
  }

  // Clic subtil de dent d'engrenage qui s'engrène
  playGearTick(volume = 0.08) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Éviter de saturer si les pas sont très rapides
    if (now - this.lastTickTime < 0.02) return;
    this.lastTickTime = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      // Légère variation de pitch pour donner un son naturel de roue en acrylique
      const baseFreq = 720 + Math.random() * 160;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.018);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, now);
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Ignorer si audio non autorisé
    }
  }

  // Son tactile lors du changement de roue ou de sélection de trou
  playSelectSnap() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.075);
    } catch {
      // Audio context silently handled
    }
  }

  // Chuchotement doux du stylo qui glisse sur le papier
  startPenSound() {
    if (this.isMuted || this.isDrawingSoundActive) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }

      this.penNoiseNode = this.ctx.createBufferSource();
      this.penNoiseNode.buffer = buffer;
      this.penNoiseNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 1.2;

      this.penGainNode = this.ctx.createGain();
      this.penGainNode.gain.setValueAtTime(0.015, this.ctx.currentTime);

      this.penNoiseNode.connect(filter);
      filter.connect(this.penGainNode);
      this.penGainNode.connect(this.ctx.destination);

      this.penNoiseNode.start();
      this.isDrawingSoundActive = true;
    } catch {
      // Audio fallback
    }
  }

  stopPenSound() {
    if (!this.isDrawingSoundActive) return;
    try {
      if (this.penGainNode && this.ctx) {
        this.penGainNode.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);
      }
      setTimeout(() => {
        if (this.penNoiseNode) {
          this.penNoiseNode.stop();
          this.penNoiseNode.disconnect();
          this.penNoiseNode = null;
        }
        this.isDrawingSoundActive = false;
      }, 60);
    } catch {
      this.isDrawingSoundActive = false;
    }
  }
}

export const sounds = new SoundEngine();
