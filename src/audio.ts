// ---------------------------------------------------------------------------
// All audio is synthesized with WebAudio so the prototype ships as one file.
// Music: one main theme. At Wonder 0 it plays through a tinny "car radio"
// filter; as Wonder rises it leaves the radio and stems join (pad, bass,
// drums, arpeggio). Car ambience ducks as imagination takes over.
// ---------------------------------------------------------------------------

type Note = [number, number, number]; // [eighth index, midi, length in eighths]

const MELODY: Note[][] = [
  [[0, 76, 2], [2, 79, 2], [4, 81, 1], [5, 79, 1], [6, 76, 2]],
  [[0, 72, 2], [2, 74, 1], [3, 76, 3], [6, 74, 2]],
  [[0, 77, 2], [2, 76, 1], [3, 74, 1], [4, 72, 2], [6, 69, 2]],
  [[0, 71, 2], [2, 72, 1], [3, 74, 3], [6, 79, 2]],
  [[0, 84, 2], [2, 83, 1], [3, 81, 1], [4, 79, 2], [6, 76, 2]],
  [[0, 81, 2], [2, 79, 1], [3, 76, 1], [4, 72, 4]],
  [[0, 77, 1], [1, 76, 1], [2, 77, 2], [4, 81, 2], [6, 79, 2]],
  [[0, 79, 2], [2, 74, 2], [4, 76, 1], [5, 74, 1], [6, 72, 2]],
];
const CHORDS = [
  [60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62],
  [60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62],
];
const ROOTS = [36, 33, 41, 43, 36, 33, 41, 43];

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export class GameAudio {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicIn!: GainNode;
  private radioG!: GainNode;
  private cleanG!: GainNode;
  private stems: Record<string, GainNode> = {};
  private sfxBus!: GainNode;
  private roadG!: GainNode;
  private roadF!: BiquadFilterNode;
  private engineO!: OscillatorNode;
  private engineG!: GainNode;
  private windG!: GainNode;
  private grindG!: GainNode;
  private grindO!: OscillatorNode;
  private noise!: AudioBuffer;
  private bpm = 108;
  private nextTime = 0;
  private step = 0; // sixteenth counter
  private level = 0;
  private musicOn = true;
  private musicVol = 1;
  muted = false;

  start() {
    if (this.ctx) {
      this.ctx.resume();
      return;
    }
    const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    this.master.connect(comp).connect(ctx.destination);

    // noise buffer
    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      d[i] = w;
      last = (last + 0.02 * w) / 1.02;
    }

    // music routing: musicIn -> (radio chain | clean) -> master
    this.musicIn = ctx.createGain();
    this.radioG = ctx.createGain();
    this.cleanG = ctx.createGain();
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 550;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2600;
    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 255) * 2 - 1;
      curve[i] = Math.tanh(x * 2.2);
    }
    shaper.curve = curve;
    this.musicIn.connect(hp).connect(lp).connect(shaper).connect(this.radioG).connect(this.master);
    this.musicIn.connect(this.cleanG).connect(this.master);
    for (const s of ['lead', 'pad', 'bass', 'drums', 'arp']) {
      const g = ctx.createGain();
      g.gain.value = s === 'lead' ? 1 : 0;
      g.connect(this.musicIn);
      this.stems[s] = g;
    }
    // radio crackle
    const crackle = ctx.createBufferSource();
    crackle.buffer = this.noise;
    crackle.loop = true;
    const cf = ctx.createBiquadFilter();
    cf.type = 'bandpass';
    cf.frequency.value = 3000;
    const cg = ctx.createGain();
    cg.gain.value = 0.012;
    crackle.connect(cf).connect(cg).connect(this.radioG);
    crackle.start();

    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.9;
    this.sfxBus.connect(this.master);

    // car ambience
    const road = ctx.createBufferSource();
    road.buffer = this.noise;
    road.loop = true;
    this.roadF = ctx.createBiquadFilter();
    this.roadF.type = 'lowpass';
    this.roadF.frequency.value = 300;
    this.roadG = ctx.createGain();
    this.roadG.gain.value = 0.0;
    road.connect(this.roadF).connect(this.roadG).connect(this.master);
    road.start();
    this.engineO = ctx.createOscillator();
    this.engineO.type = 'sawtooth';
    this.engineO.frequency.value = 40;
    const ef = ctx.createBiquadFilter();
    ef.type = 'lowpass';
    ef.frequency.value = 160;
    this.engineG = ctx.createGain();
    this.engineG.gain.value = 0;
    this.engineO.connect(ef).connect(this.engineG).connect(this.master);
    this.engineO.start();
    const wind = ctx.createBufferSource();
    wind.buffer = this.noise;
    wind.loop = true;
    const wf = ctx.createBiquadFilter();
    wf.type = 'bandpass';
    wf.frequency.value = 900;
    wf.Q.value = 0.5;
    this.windG = ctx.createGain();
    this.windG.gain.value = 0;
    wind.connect(wf).connect(this.windG).connect(this.master);
    wind.start();
    // grind buzz
    this.grindO = ctx.createOscillator();
    this.grindO.type = 'sawtooth';
    this.grindO.frequency.value = 95;
    const gf = ctx.createBiquadFilter();
    gf.type = 'bandpass';
    gf.frequency.value = 1400;
    this.grindG = ctx.createGain();
    this.grindG.gain.value = 0;
    this.grindO.connect(gf).connect(this.grindG).connect(this.sfxBus);
    this.grindO.start();

    this.nextTime = ctx.currentTime + 0.1;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.8, this.ctx!.currentTime, 0.05);
  }

  /** level: smoothed Wonder 0..3; speed: car speed; musicVol 0..1 */
  setState(level: number, speed: number, musicVol = 1) {
    if (!this.ctx) return;
    this.level = level;
    this.musicVol = musicVol;
    const t = this.ctx.currentTime;
    const radio = 1 - smooth(0.15, 1.3, level);
    this.radioG.gain.setTargetAtTime(radio * 0.55 * musicVol, t, 0.25);
    this.cleanG.gain.setTargetAtTime((1 - radio) * 0.75 * musicVol, t, 0.25);
    this.stems.pad.gain.setTargetAtTime(smooth(0.5, 1.0, level) * 0.5, t, 0.3);
    this.stems.bass.gain.setTargetAtTime(smooth(0.9, 1.4, level) * 0.9, t, 0.3);
    this.stems.drums.gain.setTargetAtTime(smooth(1.7, 2.2, level) * 0.9, t, 0.3);
    this.stems.arp.gain.setTargetAtTime(smooth(2.7, 3.0, level) * 0.5, t, 0.3);
    const duck = 1 - smooth(0.5, 3, level) * 0.6;
    const sp = Math.max(0, speed);
    this.roadG.gain.setTargetAtTime(Math.min(0.16, 0.02 + sp * 0.016) * duck, t, 0.3);
    this.roadF.frequency.setTargetAtTime(160 + sp * 40, t, 0.3);
    this.engineO.frequency.setTargetAtTime(32 + sp * 5, t, 0.3);
    this.engineG.gain.setTargetAtTime(sp > 0.05 ? 0.035 * duck : 0.012, t, 0.3);
    this.windG.gain.setTargetAtTime(Math.max(0, sp - 6) * 0.012 * duck, t, 0.4);
  }

  setGrinding(on: boolean, speed: number) {
    if (!this.ctx) return;
    this.grindG.gain.setTargetAtTime(on ? 0.05 : 0, this.ctx.currentTime, 0.03);
    this.grindO.frequency.setTargetAtTime(80 + speed * 6, this.ctx.currentTime, 0.1);
  }

  setMusic(on: boolean) { this.musicOn = on; }

  /** Schedule music ahead of time; call every frame. */
  tick() {
    const ctx = this.ctx;
    if (!ctx) return;
    const s16 = 60 / this.bpm / 4;
    while (this.nextTime < ctx.currentTime + 0.12) {
      if (this.musicOn) this.scheduleStep(this.step, this.nextTime);
      this.nextTime += s16;
      this.step++;
    }
  }

  private scheduleStep(step: number, t: number) {
    const bar = Math.floor(step / 16) % 8;
    const s = step % 16;
    const eighth = s / 2;
    const e8 = 60 / this.bpm / 2;
    if (s % 2 === 0) {
      for (const [i, m, l] of MELODY[bar]) if (i === eighth) this.tone('lead', mtof(m), t, l * e8 * 0.92, 'triangle', 0.22);
    }
    if (s === 0) for (const m of CHORDS[bar]) this.tone('pad', mtof(m), t, 16 * (e8 / 2) * 0.98, 'sawtooth', 0.045, 1100);
    if (s === 0 || s === 6 || s === 8 || s === 12) this.tone('bass', mtof(ROOTS[bar] + (s === 6 ? 12 : 0)), t, e8 * 0.9, 'triangle', 0.32);
    if (s === 0 || s === 8 || s === 10) this.kick(t);
    if (s === 4 || s === 12) this.snare(t);
    if (s % 2 === 0) this.hat(t, s % 4 === 2 ? 0.05 : 0.03);
    // arpeggio on sixteenths
    const ch = CHORDS[bar];
    this.tone('arp', mtof(ch[s % 3] + 12 + (s % 6 >= 3 ? 12 : 0)), t, 0.09, 'sine', 0.12);
  }

  private tone(stem: string, f: number, t: number, dur: number, type: OscillatorType, vol: number, lpf?: number) {
    const ctx = this.ctx!;
    if (this.stems[stem].gain.value < 0.001 && stem !== 'lead') return;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.setTargetAtTime(vol * 0.6, t + 0.02, dur * 0.4);
    g.gain.setTargetAtTime(0, t + dur, 0.04);
    let node: AudioNode = o;
    if (lpf) {
      const f2 = ctx.createBiquadFilter();
      f2.type = 'lowpass';
      f2.frequency.value = lpf;
      o.connect(f2);
      node = f2;
      o.detune.value = (Math.random() - 0.5) * 14;
    }
    node.connect(g).connect(this.stems[stem]);
    o.start(t);
    o.stop(t + dur + 0.3);
  }

  private kick(t: number) {
    const ctx = this.ctx!;
    if (this.stems.drums.gain.value < 0.001) return;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g).connect(this.stems.drums);
    o.start(t);
    o.stop(t + 0.25);
  }

  private snare(t: number) {
    if (this.stems.drums.gain.value < 0.001) return;
    this.noiseHit(this.stems.drums, t, 0.14, 'bandpass', 1800, 0.35);
  }

  private hat(t: number, v: number) {
    if (this.stems.drums.gain.value < 0.001) return;
    this.noiseHit(this.stems.drums, t, 0.04, 'highpass', 7000, v * 4);
  }

  private noiseHit(dest: AudioNode, t: number, dur: number, type: BiquadFilterType, freq: number, vol: number, q = 1) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(dest);
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.02);
  }

  private sweep(t: number, f0: number, f1: number, dur: number, type: OscillatorType, vol: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(this.sfxBus);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  /** Toy-block clatter: lots of tiny wooden/plastic clicks. */
  private clatter(t: number, count: number, spread: number, base: number, vol: number) {
    for (let i = 0; i < count; i++) {
      const tt = t + Math.pow(Math.random(), 1.6) * spread;
      this.noiseHit(this.sfxBus, tt, 0.018 + Math.random() * 0.02, 'bandpass', base * (0.7 + Math.random() * 0.9), vol * (1 - (tt - t) / (spread + 0.01)) * (0.5 + Math.random() * 0.5), 6);
    }
  }

  sfx(name: string, v = 1) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime + 0.005;
    switch (name) {
      case 'slash': {
        const src = ctx.createBufferSource();
        src.buffer = this.noise;
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.Q.value = 2;
        f.frequency.setValueAtTime(1200, t);
        f.frequency.exponentialRampToValueAtTime(5200, t + 0.1);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.45, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        src.connect(f).connect(g).connect(this.sfxBus);
        src.start(t, Math.random());
        src.stop(t + 0.16);
        break;
      }
      case 'jump': this.sweep(t, 280, 520, 0.1, 'sine', 0.12); break;
      case 'airjump': this.sweep(t, 420, 980, 0.14, 'sine', 0.12); this.sweep(t + 0.04, 900, 1800, 0.1, 'triangle', 0.05); break;
      case 'land': this.noiseHit(this.sfxBus, t, 0.06, 'lowpass', 500, 0.2); break;
      case 'bounce': this.sweep(t, 220, 620, 0.16, 'triangle', 0.2); break;
      case 'boing': {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(180, t);
        o.frequency.linearRampToValueAtTime(380, t + 0.06);
        o.frequency.linearRampToValueAtTime(240, t + 0.14);
        o.frequency.linearRampToValueAtTime(300, t + 0.22);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.25, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        o.connect(g).connect(this.sfxBus);
        o.start(t);
        o.stop(t + 0.32);
        break;
      }
      case 'break-wood':
        this.noiseHit(this.sfxBus, t, 0.07, 'highpass', 1400, 0.5 * v);
        this.sweep(t, 170, 55, 0.14, 'sine', 0.4 * v);
        this.clatter(t + 0.03, Math.round(10 + 14 * v), 0.5, 1900, 0.35);
        break;
      case 'break-metal':
        this.sweep(t, 1400, 900, 0.3, 'square', 0.06 * v);
        this.noiseHit(this.sfxBus, t, 0.1, 'bandpass', 3200, 0.4 * v, 3);
        this.clatter(t + 0.03, Math.round(10 + 10 * v), 0.45, 2600, 0.3);
        break;
      case 'impact':
        this.sweep(t, 110, 38, 0.35, 'sine', 0.6 * v);
        this.noiseHit(this.sfxBus, t, 0.25, 'lowpass', 700, 0.5 * v);
        this.clatter(t + 0.04, 34, 0.8, 1700, 0.4);
        break;
      case 'leaves':
        this.noiseHit(this.sfxBus, t, 0.5, 'bandpass', 2500, 0.25 * v, 0.6);
        this.clatter(t + 0.02, 16, 0.6, 1600, 0.25);
        break;
      case 'bonk':
        this.sweep(t, 200, 70, 0.2, 'sine', 0.45);
        this.noiseHit(this.sfxBus, t, 0.08, 'lowpass', 400, 0.4);
        break;
      case 'grindStart': this.noiseHit(this.sfxBus, t, 0.15, 'highpass', 4000, 0.3); break;
      case 'twang': {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(150, t);
        o.frequency.exponentialRampToValueAtTime(70, t + 0.5);
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(3000, t);
        f.frequency.exponentialRampToValueAtTime(200, t + 0.5);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        o.connect(f).connect(g).connect(this.sfxBus);
        o.start(t);
        o.stop(t + 0.62);
        this.noiseHit(this.sfxBus, t, 0.2, 'highpass', 5000, 0.25);
        break;
      }
      case 'headsup': this.sweep(t, 620, 640, 0.09, 'square', 0.05); this.sweep(t + 0.11, 880, 900, 0.12, 'square', 0.05); break;
      case 'sparkle':
        [1568, 2093, 2637].forEach((f, i) => this.sweep(t + i * 0.04, f, f * 1.01, 0.18, 'sine', 0.06));
        break;
      case 'tierUp':
        [523, 659, 784, 1047, 1319].forEach((f, i) => this.sweep(t + i * 0.05, f, f, 0.5, 'triangle', 0.08));
        this.noiseHit(this.sfxBus, t, 0.6, 'bandpass', 2000, 0.15, 0.4);
        break;
      case 'tierDown': this.sweep(t, 600, 180, 0.5, 'triangle', 0.12); break;
      case 'chain': this.sweep(t, 880 * v, 1320 * v, 0.08, 'triangle', 0.07); break;
      case 'sigh': {
        const src = ctx.createBufferSource();
        src.buffer = this.noise;
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.setValueAtTime(900, t);
        f.frequency.linearRampToValueAtTime(500, t + 1.2);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.35, t + 0.25);
        g.gain.linearRampToValueAtTime(0, t + 1.3);
        src.connect(f).connect(g).connect(this.sfxBus);
        src.start(t);
        src.stop(t + 1.4);
        break;
      }
      case 'pop':
        this.sweep(t, 300, 1200, 0.12, 'sine', 0.25);
        this.clatter(t + 0.05, 20, 0.5, 2400, 0.3);
        break;
      case 'arrive': [523, 659, 784].forEach((f, i) => this.sweep(t + i * 0.12, f, f, 0.6, 'sine', 0.1)); break;
      case 'click': this.noiseHit(this.sfxBus, t, 0.03, 'highpass', 2000, 0.3); break;
    }
  }
}

function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
