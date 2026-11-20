/**
 * Sapori Cafe - Realtime Web Audio Chime & Repeating Order Alarm Engine
 * Generates an elegant, loud, crystal-clear brass/bell chime using HTML5 Web Audio API.
 * 100% offline, zero network dependencies, zero 404 risk.
 */

let audioCtx: AudioContext | null = null;
let alarmIntervalId: any = null;
let alarmTimeoutId: any = null;

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

    // High clarity dual-bell melody [C5, E5, G5, C6]
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.35 },
      { freq: 659.25, time: 0.12, dur: 0.35 },
      { freq: 783.99, time: 0.24, dur: 0.4 },
      { freq: 1046.5, time: 0.36, dur: 0.9 },
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.35, ctx.currentTime);
    masterGain.connect(ctx.destination);

    notes.forEach(({ freq, time, dur }) => {
      const startTime = ctx.currentTime + time;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Bell envelope (crisp attack, exponential ramp)
      noteGain.gain.setValueAtTime(0.001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.4, startTime + 0.02);
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

/**
 * Starts continuous repeating order alarm (rings every 3.5s like Swiggy/Zomato merchant POS)
 * Automatically auto-mutes after 60 seconds if unattended to prevent infinite ringing.
 */
export function startOrderAlarm(autoMuteSec = 60): void {
  stopOrderAlarm(); // Clear any existing alarm
  playOrderChime();

  alarmIntervalId = setInterval(() => {
    playOrderChime();
  }, 3500);

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
