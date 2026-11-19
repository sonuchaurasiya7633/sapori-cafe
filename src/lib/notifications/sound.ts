/**
 * Sapori Café & Eatery - Realtime Web Audio Chime Generator
 * Generates an elegant, crystal-clear brass/bell chime using the HTML5 Web Audio API.
 * 100% offline, zero network dependencies, zero 404 risk.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playOrderChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Melody: High bell chime [C5, E5, G5, C6]
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.35 },
      { freq: 659.25, time: 0.12, dur: 0.35 },
      { freq: 783.99, time: 0.24, dur: 0.4 },
      { freq: 1046.5, time: 0.36, dur: 0.8 },
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.28, ctx.currentTime);
    masterGain.connect(ctx.destination);

    notes.forEach(({ freq, time, dur }) => {
      const startTime = ctx.currentTime + time;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      // Sine + slight triangle harmonic for metallic bell timbre
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Bell envelope (instant attack, exponential decay)
      noteGain.gain.setValueAtTime(0.001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}
