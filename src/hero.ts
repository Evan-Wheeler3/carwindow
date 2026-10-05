import * as THREE from 'three';
import { HERO, FRAME, WORLD } from './config';
import { buildHero, HeroRig } from './models';
import { Entity, Vehicle, Toppler, Pole, FenceRun, WireSystem, VEHICLE_Z, ImaginedPlatform } from './entities';

export type Verb = 'Slash' | 'Air Slash' | 'Bounce' | 'Grind' | 'Ride' | 'Launch' | 'Domino' | 'Pole Run' | 'Near Miss' | 'Hop';

export interface HeroInput {
  jumpPressed: boolean;
  jumpHeld: boolean;
  slashPressed: boolean;
}

export interface HeroEnv {
  carX: number;
  carSpeed: number;
  rearX: number; // window rear edge at the run line, relative to car x
  frontX: number;
  entities: Entity[];
  wires: WireSystem;
  interact(verb: Verb, pos: THREE.Vector3, base: number): void;
  bonk(pos: THREE.Vector3, lite: boolean): void;
  sfx(name: string, v?: number): void;
}

const tmpV = new THREE.Vector3();

export class Hero {
  rig: HeroRig;
  x = 0;
  y = 0;
  z = WORLD.runLineZ;
  vy = 0;
  pushV = 0; // relative x velocity impulses (lunges, knockback, inherited ride speed)
  grounded = true;
  standingOn: Entity | null = null;
  grinding: [Pole, Pole] | null = null;
  airJumps = 1;
  coyote = 0;
  buffer = 0;
  jumpCut = false;
  slashT = -1;
  slashCd = 0;
  slashHits = new Set<Entity>();
  slashConnected = false;
  whiffUsed = false;
  floatT = 0;
  stumbleT = 0;
  invulnT = 0;
  flipT = -1;
  grindTick = 0;
  runPhase = 0;
  spawnT = 1;
  idleLook = 0; // 0..1 turn to look at the window
  waving = false;
  atWall = false;
  u = FRAME.home;
  private scarfPts: THREE.Vector3[] = [];
  private nearMissCd = 0;
  enabled = true;

  constructor(scene: THREE.Scene) {
    this.rig = buildHero();
    scene.add(this.rig.root);
    this.rig.scarf.forEach((s) => scene.add(s));
    for (let i = 0; i < this.rig.scarf.length; i++) this.scarfPts.push(new THREE.Vector3());
  }

  place(x: number) {
    this.x = x;
    this.y = 0;
    this.vy = 0;
    this.pushV = 0;
    this.grounded = true;
    this.standingOn = null;
    this.grinding = null;
    this.airJumps = 1;
    this.stumbleT = 0;
    this.invulnT = 0;
    this.slashT = -1;
    this.z = WORLD.runLineZ;
    for (const p of this.scarfPts) p.set(x - 0.2, 0.8, this.z);
  }

  get airborne() { return !this.grounded && !this.standingOn && !this.grinding; }

  get riding(): Vehicle | null { return this.standingOn instanceof Vehicle ? this.standingOn : null; }

  launch() {
    this.grinding = null;
    this.standingOn = null;
    this.grounded = false;
    this.vy = 17.5;
    this.airJumps = 1;
    this.flipT = 0;
    this.pushV += 3;
  }

  step(dt: number, inp: HeroInput, env: HeroEnv) {
    const W = env.frontX - env.rearX;
    this.u = (this.x - env.carX - env.rearX) / W;
    this.slashCd -= dt;
    this.coyote -= dt;
    this.buffer -= dt;
    this.stumbleT -= dt;
    this.invulnT -= dt;
    this.floatT -= dt;
    this.nearMissCd -= dt;
    if (!this.enabled) inp = { jumpPressed: false, jumpHeld: false, slashPressed: false };
    if (inp.jumpPressed) this.buffer = HERO.jumpBuffer;

    // ---- horizontal: keep pace with the car ---------------------------------
    const home = FRAME.home;
    let drift = 0;
    if (this.u < home) drift = Math.min((home - this.u) * 2.4, FRAME.returnRate);
    else drift = -Math.min((this.u - home) * 0.9, 0.04);
    let relV = drift * W + this.pushV;
    if (this.grinding) relV += FRAME.grindPush * W;
    if (env.carSpeed < 0.05 && Math.abs(this.u - home) < 0.02) relV = this.pushV;
    this.pushV *= Math.exp(-dt * 3.5);
    const ride = this.riding;
    const prevX = this.x;
    if (ride) this.x += ride.vx * dt + this.pushV * dt;
    else this.x += (env.carSpeed + relV) * dt;
    this.u = (this.x - env.carX - env.rearX) / W;
    this.atWall = false;
    if (this.u < FRAME.min) {
      this.x = env.carX + env.rearX + FRAME.min * W;
      this.atWall = true;
      this.pushV = Math.max(this.pushV, 1.5);
      if (ride) this.hopOff(env, 6);
    } else if (this.u > FRAME.max) {
      this.x = env.carX + env.rearX + FRAME.max * W;
      this.pushV = Math.min(this.pushV, 0);
      if (ride) this.hopOff(env, 8);
    }

    // ---- jumping ---------------------------------------------------------
    const canGroundJump = this.grounded || !!this.standingOn || !!this.grinding || this.coyote > 0;
    if (this.buffer > 0 && this.stumbleT < 0.15) {
      if (canGroundJump) {
        if (ride) this.pushV = ride.vx - env.carSpeed;
        this.vy = HERO.jumpVel;
        this.leaveSurface();
        this.buffer = 0;
        this.jumpCut = false;
        env.sfx('jump');
      } else if (this.airJumps > 0) {
        this.vy = HERO.airJumpVel;
        this.airJumps--;
        this.buffer = 0;
        this.jumpCut = true;
        this.flipT = 0;
        env.sfx('airjump');
      }
    }
    if (!inp.jumpHeld && !this.jumpCut && this.vy > 0 && this.airborne) {
      this.vy *= HERO.jumpCutMul;
      this.jumpCut = true;
    }

    // ---- vertical ----------------------------------------------------------
    const prevY = this.y;
    if (this.grinding) {
      const span = env.wires.spanAt(this.x);
      if (!span) {
        this.grinding = null;
        this.coyote = HERO.coyote;
        this.vy = 2;
      } else {
        this.grinding = span;
        this.y = env.wires.wireY(span[0], span[1], this.x);
        this.grindTick -= dt;
        if (this.grindTick <= 0) {
          this.grindTick = 0.55;
          env.interact('Grind', tmpV.set(this.x, this.y, this.z), 40);
        }
      }
    } else if (this.standingOn) {
      const s = this.standingOn.alive ? this.standingOn.surfaceAt(this.x) : null;
      if (s === null) {
        this.standingOn = null;
        this.coyote = HERO.coyote;
        this.vy = 0;
      } else this.y = s;
    } else if (this.grounded) {
      this.y = 0;
    }
    if (this.airborne) {
      let g = WORLD.gravityUp * (this.vy < 0 ? WORLD.gravityFallMul : 1);
      if (this.floatT > 0) g *= 0.2;
      this.vy -= g * dt;
      this.vy = Math.max(this.vy, -26);
      this.y += this.vy * dt;
      if (this.vy <= 0) this.tryLand(prevY, env);
    }

    // ---- slashing ----------------------------------------------------------
    if (inp.slashPressed && this.slashCd <= 0 && this.stumbleT < 0.1) {
      this.slashT = 0;
      this.slashCd = HERO.slashCooldown;
      this.slashHits.clear();
      this.slashConnected = false;
      env.sfx('slash');
    }
    if (this.slashT >= 0) {
      this.slashT += dt;
      if (this.slashT >= HERO.slashActiveStart && this.slashT <= HERO.slashActiveEnd) this.slashCheck(env);
      if (this.slashT > HERO.slashActiveEnd && !this.slashConnected && this.airborne && !this.whiffUsed) {
        this.whiffUsed = true;
        this.floatT = HERO.whiffFloat;
        this.slashConnected = true; // only once
      }
      if (this.slashT > HERO.slashTime) this.slashT = -1;
    }

    // ---- side collisions ----------------------------------------------------
    this.collide(env);

    // depth: ride on the near lane visually
    const targetZ = ride ? VEHICLE_Z + 0.2 : WORLD.runLineZ;
    this.z += (targetZ - this.z) * Math.min(1, dt * 10);
    this.runPhase += (Math.abs(this.x - prevX) / Math.max(dt, 1e-4) - env.carSpeed + 7) * dt * 1.6;
  }

  private leaveSurface() {
    this.grounded = false;
    this.standingOn = null;
    this.grinding = null;
    this.coyote = 0;
  }

  private hopOff(env: HeroEnv, vy: number) {
    const ride = this.riding;
    if (ride) this.pushV = ride.vx - env.carSpeed;
    this.leaveSurface();
    this.vy = vy;
    this.jumpCut = true;
  }

  private landed() {
    this.vy = 0;
    this.airJumps = 1;
    this.whiffUsed = false;
    this.floatT = 0;
    this.flipT = -1;
  }

  private tryLand(prevY: number, env: HeroEnv) {
    let best = -Infinity;
    let bestKind: 'ground' | 'entity' | 'wire' | 'break' = 'ground';
    let bestEntity: Entity | null = null;
    let bestSpan: [Pole, Pole] | null = null;
    if (this.y <= 0) best = 0;
    for (const e of env.entities) {
      if (!e.alive || Math.abs(e.x - this.x) > 4) continue;
      // landing on top of a breakable smashes it and bounces you
      if (e.breakable) {
        const b = e.box();
        if (b && this.x + 0.2 > b.x0 && this.x - 0.2 < b.x1 && prevY >= b.y1 - 0.15 && this.y <= b.y1 + 0.05 && b.y1 > best) {
          best = b.y1;
          bestKind = 'break';
          bestEntity = e;
        }
      }
      const s = e.surfaceAt(this.x);
      if (s === null) continue;
      const tol = e instanceof Vehicle ? 0.35 : e instanceof Toppler ? 0.6 : 0.12;
      if (prevY >= s - tol && this.y <= s + 0.02 && s > best) {
        best = s;
        bestKind = 'entity';
        bestEntity = e;
      }
    }
    const span = env.wires.spanAt(this.x);
    if (span) {
      const w = env.wires.wireY(span[0], span[1], this.x);
      if (this.y <= w + 0.05 && prevY >= w - HERO.grindAttach && w > best) {
        best = w;
        bestKind = 'wire';
        bestSpan = span;
      }
    }
    if (best === -Infinity) return;
    const pos = tmpV.set(this.x, best, this.z);
    if (bestKind === 'break' && bestEntity) {
      bestEntity.hit('stomp', best, 1);
      this.vy = HERO.slashHopVel * 1.05;
      this.airJumps = 1;
      this.whiffUsed = false;
      env.interact('Bounce', pos, 120);
      env.sfx('bounce');
      return;
    }
    this.y = best;
    this.landed();
    if (bestKind === 'ground') {
      this.grounded = true;
      env.sfx('land');
    } else if (bestKind === 'wire') {
      this.grinding = bestSpan;
      this.grindTick = 0.55;
      env.interact('Grind', pos, 80);
      env.sfx('grindStart');
    } else if (bestEntity) {
      this.standingOn = bestEntity;
      if (bestEntity instanceof Vehicle) {
        bestEntity.squash(0.35);
        this.pushV = 0;
        env.interact('Ride', pos, 100);
        env.sfx('boing');
      } else if (bestEntity instanceof Toppler) {
        env.interact('Pole Run', pos, 150);
        env.sfx('land');
      } else if (bestEntity instanceof ImaginedPlatform) {
        env.interact('Hop', pos, 60);
        env.sfx('sparkle');
      } else env.sfx('land');
    }
  }

  private slashCheck(env: HeroEnv) {
    const x0 = this.x - 0.3, x1 = this.x + HERO.slashReach;
    const y0 = this.y - 0.45, y1 = this.y + 1.4;
    const air = this.airborne;
    for (const e of env.entities) {
      if (!e.alive || !e.breakable || this.slashHits.has(e)) continue;
      const b = e.box();
      if (!b || b.x1 < x0 || b.x0 > x1 || b.y1 < y0 || b.y0 > y1) continue;
      this.slashHits.add(e);
      const ok = e instanceof FenceRun ? e.hit(air ? 'airslash' : 'slash', this.y, 1, this.x + 0.8) : e.hit(air ? 'airslash' : 'slash', this.y + 0.4, 1);
      if (!ok) continue;
      const first = !this.slashConnected;
      this.slashConnected = true;
      env.interact(air ? 'Air Slash' : 'Slash', tmpV.set(e.x, this.y + 0.6, this.z), 100);
      if (first) {
        this.pushV += (FRAME.lungePush * (env.frontX - env.rearX)) / 0.25;
        if (air) {
          this.vy = Math.max(this.vy, HERO.slashHopVel);
          this.airJumps = 1;
          this.whiffUsed = false;
          this.jumpCut = true;
        }
      }
    }
  }

  private collide(env: HeroEnv) {
    const hx0 = this.x - 0.2, hx1 = this.x + 0.2;
    const hy0 = this.y + 0.05, hy1 = this.y + 0.95;
    for (const e of env.entities) {
      if (!e.alive || e === this.standingOn) continue;
      const b = e.box();
      if (!b || b.x1 < hx0 || b.x0 > hx1 || b.y1 < hy0 || b.y0 > hy1) {
        // near miss: skim past a vehicle
        if (b && e instanceof Vehicle && this.nearMissCd <= 0 && this.airborne && hy0 > b.y1 && hy0 < b.y1 + 0.5 && hx1 > b.x0 && hx0 < b.x1) {
          this.nearMissCd = 1.2;
          env.interact('Near Miss', tmpV.set(this.x, this.y, this.z), 60);
        }
        continue;
      }
      // generous step-up: if feet are near the top, just land on it
      const s = e.surfaceAt(this.x);
      if (s !== null && this.y >= s - 0.4 && !e.breakable) {
        this.y = s;
        this.landed();
        this.grounded = false;
        this.grinding = null;
        this.standingOn = e;
        if (e instanceof Vehicle) {
          e.squash(0.3);
          env.interact('Ride', tmpV.set(this.x, this.y, this.z), 100);
          env.sfx('boing');
        }
        continue;
      }
      if (e.breakable) {
        // ran into it without slashing: smash through, stumble a little
        if (e instanceof FenceRun) e.hit('smash', this.y, 1, this.x + 0.3);
        else e.hit('smash', this.y + 0.4, 1);
        if (this.invulnT <= 0) {
          this.pushV -= (FRAME.bonkPush * 0.5 * (env.frontX - env.rearX)) / 0.35;
          this.stumbleT = 0.25;
          this.invulnT = 0.4;
          env.bonk(tmpV.set(this.x, this.y + 0.5, this.z), true);
        }
      } else if (e.hazard && this.invulnT <= 0) {
        this.pushV -= (FRAME.bonkPush * (env.frontX - env.rearX)) / 0.35;
        this.stumbleT = 0.4;
        this.invulnT = 1.0;
        env.bonk(tmpV.set(this.x, this.y + 0.5, this.z), false);
      }
    }
  }

  // ---- presentation ----------------------------------------------------------

  animate(dt: number, carSpeed: number) {
    const r = this.rig;
    r.root.position.set(this.x, this.y, this.z);
    this.spawnT = Math.min(1, this.spawnT + dt * 2.5);
    const pop = this.spawnT < 1 ? Math.sin(this.spawnT * Math.PI * 0.5) * (1 + Math.sin(this.spawnT * Math.PI) * 0.3) : 1;
    r.root.scale.setScalar(Math.max(0.001, pop) * 1.25);

    const moving = carSpeed > 0.3 || Math.abs(this.pushV) > 0.5;
    const ph = this.runPhase * 2.2;
    let legSwing = 0, armSwing = 0, bob = 0, lean = 0, crouch = 0;
    if (this.grinding) {
      crouch = 0.15;
      lean = -0.15;
      r.legL.rotation.z = 0.5;
      r.legR.rotation.z = -0.4;
    } else if (this.airborne) {
      const tuck = this.vy > 0 ? 0.7 : 0.35;
      r.legL.rotation.z = tuck;
      r.legR.rotation.z = tuck * 0.4 - 0.3;
      armSwing = -0.6;
    } else if (this.riding) {
      crouch = 0.12;
      r.legL.rotation.z = 0.35;
      r.legR.rotation.z = -0.25;
      lean = -0.08;
    } else if (moving) {
      legSwing = Math.sin(ph) * 0.95;
      armSwing = -Math.sin(ph) * 0.8;
      bob = Math.abs(Math.cos(ph)) * 0.08;
      lean = -0.18 - (this.atWall || this.u < FRAME.rearZone ? 0.18 : 0);
      r.legL.rotation.z = legSwing;
      r.legR.rotation.z = -legSwing;
    } else {
      r.legL.rotation.z = r.legR.rotation.z = 0;
      bob = Math.sin(performance.now() * 0.004) * 0.015;
    }
    if (this.stumbleT > 0) lean = 0.5 * Math.sin(this.stumbleT * 30);
    r.body.position.y = bob - crouch;
    r.torso.rotation.z = lean;
    r.armL.rotation.z = armSwing;
    // slash swing
    if (this.slashT >= 0) {
      const t = this.slashT / HERO.slashTime;
      const k = t < 0.25 ? t / 0.25 : 1 - (t - 0.25) / 0.75 * 0.6;
      r.armR.rotation.z = THREE.MathUtils.lerp(1.6, -2.0, Math.min(1, t * 3)) * (t < 0.33 ? 1 : 1 - (t - 0.33));
      (r.smear.material as THREE.MeshBasicMaterial).opacity = t < 0.6 ? 0.85 * (1 - t / 0.6) : 0;
      r.smear.rotation.z = -t * 1.2;
      r.smear.scale.setScalar(0.8 + k * 0.3);
    } else {
      r.armR.rotation.z = this.waving ? 2.6 + Math.sin(performance.now() * 0.012) * 0.4 : -armSwing * 0.6 + 0.3;
      (r.smear.material as THREE.MeshBasicMaterial).opacity = 0;
    }
    // air-jump flip, rotating around the middle of the body
    r.body.position.x = 0;
    if (this.flipT >= 0) {
      this.flipT += dt;
      const f = Math.min(1, this.flipT / 0.38);
      const a = -f * Math.PI * 2;
      r.body.rotation.z = a;
      r.body.position.x = 0.5 * Math.sin(a);
      r.body.position.y += 0.5 - 0.5 * Math.cos(a);
      if (f >= 1) this.flipT = -1;
    } else r.body.rotation.z = 0;
    // look at the window (idle moments, birth, arrival)
    const look = this.idleLook;
    r.head.rotation.y = -look * 1.2;
    r.root.rotation.y = -look * 0.5;
    // squash on landing
    const stretch = this.airborne ? THREE.MathUtils.clamp(this.vy * 0.012, -0.12, 0.15) : 0;
    r.body.scale.set(1 - stretch * 0.5, 1 + stretch, 1);

    // scarf
    const anchor = new THREE.Vector3(this.x - 0.08, this.y + r.body.position.y + 0.78, this.z + 0.1);
    this.scarfPts[0].copy(anchor);
    const wind = THREE.MathUtils.clamp((carSpeed + 1) / 7, 0.15, 1.2);
    const t = performance.now() * 0.001;
    for (let i = 1; i < this.scarfPts.length; i++) {
      const p = this.scarfPts[i];
      const prev = this.scarfPts[i - 1];
      const flutter = Math.sin(t * 14 - i * 0.9) * 0.05 * wind;
      tmpV.set(prev.x - 0.15 * wind - (1 - wind) * 0.02, prev.y - 0.02 - (1 - Math.min(1, wind)) * 0.1 + flutter, prev.z);
      p.lerp(tmpV, 1 - Math.exp(-dt * 30));
      // keep segment length
      const d = p.distanceTo(prev);
      if (d > 0.17) p.sub(prev).multiplyScalar(0.17 / d).add(prev);
      const m = r.scarf[i - 1];
      m.position.copy(p);
      m.scale.setScalar(pop * 1.25 * (1 - i * 0.05));
    }
    r.scarf[r.scarf.length - 1].position.copy(this.scarfPts[0]);
    r.scarf[r.scarf.length - 1].scale.setScalar(pop * 1.1);
  }

  setVisible(v: boolean) {
    this.rig.root.visible = v;
    this.rig.scarf.forEach((s) => (s.visible = v));
  }
}
