import { SCORE, WONDER } from './config';
import type { Verb } from './hero';

// ---------------------------------------------------------------------------
// Chain + Wonder. Wonder is the single success meter: chains fill it, bonks
// and falling behind drain it, and if it empties at tier 0 the kid gets bored.
// ---------------------------------------------------------------------------

export interface InteractResult {
  points: number;
  grew: boolean;
  chain: number;
  mult: number;
}

export class ScoreState {
  total = 0;
  pending = 0;
  chain = 0;
  timer = 0;
  lastVerb: Verb | '' = '';
  wonder = WONDER.start;
  bestChain = 0;
  breaks = 0;
  onTier: ((from: number, to: number) => void) | null = null;
  onBank: ((points: number, chain: number) => void) | null = null;

  get mult() {
    return Math.min(SCORE.multMax, 1 + Math.floor(this.chain / SCORE.multEvery));
  }

  get tier() {
    return Math.max(0, Math.min(3, Math.floor(this.wonder / WONDER.perTier)));
  }

  get chainActive() {
    return this.timer > 0 && this.chain > 0;
  }

  interact(verb: Verb, base: number, leading: boolean): InteractResult {
    const grew = verb !== this.lastVerb;
    if (grew) this.chain++;
    this.lastVerb = verb;
    this.timer = SCORE.chainTimer;
    const pts = Math.round(base * (grew ? 1 : 0.5) * (leading ? SCORE.leadMul : 1));
    this.pending += pts;
    this.bestChain = Math.max(this.bestChain, this.chain);
    this.addWonder(WONDER.perInteraction * (grew ? 1 : 0.5) * (1 + 0.12 * (this.mult - 1)));
    return { points: pts * this.mult, grew, chain: this.chain, mult: this.mult };
  }

  bank() {
    if (this.pending > 0) {
      const pts = Math.round(this.pending * this.mult);
      this.total += pts;
      this.onBank?.(pts, this.chain);
      // a bigger chain gives a little extra Wonder when it lands
      this.addWonder(Math.min(25, this.chain * 1.2));
    }
    this.pending = 0;
    this.chain = 0;
    this.lastVerb = '';
    this.timer = 0;
  }

  bonk(lite: boolean) {
    this.bank();
    this.addWonder(-(lite ? WONDER.bonk * 0.45 : WONDER.bonk));
  }

  addWonder(d: number) {
    const before = this.tier;
    this.wonder = Math.max(0, Math.min(WONDER.max, this.wonder + d));
    const after = this.tier;
    if (after !== before) this.onTier?.(before, after);
  }

  update(dt: number, behind: boolean, paused: boolean) {
    if (paused) return;
    if (this.timer > 0) {
      this.timer -= dt;
      if (this.timer <= 0) this.bank();
    }
    if (behind) this.addWonder(-WONDER.behindDrainPerSec * dt);
    else if (!this.chainActive && this.wonder > WONDER.perTier) this.addWonder(-WONDER.decayPerSec * dt);
    else if (!this.chainActive && this.wonder < 60) this.addWonder(WONDER.regenTier0 * dt);
  }

  reset() {
    this.total = 0;
    this.pending = 0;
    this.chain = 0;
    this.timer = 0;
    this.lastVerb = '';
    this.wonder = WONDER.start;
    this.bestChain = 0;
    this.breaks = 0;
  }
}
