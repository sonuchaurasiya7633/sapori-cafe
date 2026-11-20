/**
 * Sapori Cafe - Realtime Web Audio Chime & Repeating Order Alarm Engine
 * Generates a bold, loud, crystal-clear brass service bell chime using HTML5 Web Audio API.
 * 100% offline, zero network dependencies, zero 404 risk.
 */

let audioCtx: AudioContext | null = null;
let alarmIntervalId: any = null;
let alarmTimeoutId: any = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export function isAudioUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  const ctx = getAudioContext();
  return ctx ? ctx.state === 'running' : false;
}

export async function unlockAudio(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx.state === 'running';
  } catch (e) {
    console.warn('Could not unlock AudioContext:', e);
    return false;
  }
}

/**
 * Plays a bold, resonant brass service counter bell melody (Zomato/Swiggy POS / Restaurant Bell)
 * Rich in metallic overtones, punchy transient strike, warm acoustic decay, and loud presence.
 */
export function playOrderChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Professional dynamic compressor for punchy, bold volume without digital clipping
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-8, ctx.currentTime);
    compressor.knee.setValueAtTime(10, ctx.currentTime);
    compressor.ratio.setValueAtTime(8, ctx.currentTime);
    compressor.attack.setValueAtTime(0.002, ctx.currentTime);
    compressor.release.setValueAtTime(0.2, ctx.currentTime);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.75, ctx.currentTime);

    masterGain.connect(compressor);
    compressor.connect(ctx.destination);

    // Bold Brass Bell 3-Stroke Chime: [G5 -> C6 -> E6/C6 Resonant Chord]
    const bellStrikes = [
      // Strike 1: Crisp Initial Brass Bell Strike (G5 - 783.99 Hz)
      {
        time: 0.0,
        fundamental: 783.99,
        overtones: [1567.98, 2351.97, 3292.75],
        dur: 0.55,
        peakGain: 0.65,
      },
      // Strike 2: Higher Punchy Counter Bell Strike (C6 - 1046.50 Hz)
      {
        time: 0.22,
        fundamental: 1046.5,
        overtones: [2093.0, 3139.5, 4186.0],
        dur: 0.65,
        peakGain: 0.75,
      },
      // Strike 3: Heavy Resonant High-Clarity Accent (E6 Chord - 1318.5 Hz + C6 1046.5 Hz)
      {
        time: 0.44,
        fundamental: 1318.51,
        overtones: [1046.5, 2637.02, 3955.5],
        dur: 1.35,
        peakGain: 0.85,
      },
    ];

    bellStrikes.forEach(({ time, fundamental, overtones, dur, peakGain }) => {
      const startTime = ctx.currentTime + time;

      // 1. Fundamental warm acoustic tone (Triangle wave for brass body)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(fundamental, startTime);

      // Sharp acoustic strike (0.003s attack, exponential bell decay)
      oscGain.gain.setValueAtTime(0.001, startTime);
      oscGain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.004);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start(startTime);
      osc.stop(startTime + dur);

      // 2. Metallic Overtones (Sine waves for high-sheen brass ping)
      overtones.forEach((overtoneFreq, idx) => {
        const overtoneOsc = ctx.createOscillator();
        const overtoneGain = ctx.createGain();
        overtoneOsc.type = 'sine';
        overtoneOsc.frequency.setValueAtTime(overtoneFreq, startTime);

        const overtoneVolume = (peakGain * 0.35) / (idx + 1);
        const overtoneDur = dur * 0.75;

        overtoneGain.gain.setValueAtTime(0.001, startTime);
        overtoneGain.gain.exponentialRampToValueAtTime(overtoneVolume, startTime + 0.003);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + overtoneDur);

        overtoneOsc.connect(overtoneGain);
        overtoneGain.connect(masterGain);
        overtoneOsc.start(startTime);
        overtoneOsc.stop(startTime + overtoneDur);
      });
    });
  } catch (err) {
    console.warn('Bold audio bell chime error:', err);
  }
}

/**
 * Starts repeating order alarm every 3.2 seconds.
 * By default autoMuteSec = 0 (rings CONTINUOUSLY until user views order or updates status).
 */
export function startOrderAlarm(autoMuteSec = 0): void {
  stopOrderAlarm(); // Clear any existing alarm

  unlockAudio().then(() => {
    playOrderChime();
  });

  // Repeats every 3.2 seconds
  alarmIntervalId = setInterval(() => {
    playOrderChime();
  }, 3200);

  // If a positive autoMuteSec is explicitly passed, honor it, otherwise keep ringing indefinitely
  if (autoMuteSec > 0) {
    alarmTimeoutId = setTimeout(() => {
      stopOrderAlarm();
    }, autoMuteSec * 1000);
  }
}

export function stopOrderAlarm(): void {
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
  if (alarmTimeoutId) {
    clearTimeout(alarmTimeoutId);
    alarmTimeoutId = null;
  }
}

export function isAlarmRinging(): boolean {
  return alarmIntervalId !== null;
}
