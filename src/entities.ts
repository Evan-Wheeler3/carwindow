import * as THREE from 'three';
import { VModel, sprayColors, boxesBounds } from './voxel';
import {
  buildModel, mailboxModel, signModel, treeModel, poleModel, fenceModel, barrierModel, carModel, platformModel,
  trafficLightModel, storeModel, POLE_SOCKETS, TREE_SOCKETS, POLE_WIRE_Y, PAL, glowMaterial,
} from './models';
import { CubeSpray, ChunkSim } from './debris';
import { VOXEL, WORLD } from './config';

export type HitKind = 'slash' | 'airslash' | 'smash' | 'stomp' | 'domino';

export interface Box {
  x0: number; x1: number; y0: number; y1: number;
}

export interface WorldCtx {
  scene: THREE.Scene;
  spray: CubeSpray;
  chunks: ChunkSim;
  onBreak(e: Entity, how: HitKind, pos: THREE.Vector3, size: number): void;
  onImpact(pos: THREE.Vector3, strength: number, material: 'wood' | 'leaf' | 'metal'): void;
  onPoleCut(pole: Pole): void;
  entities(): Entity[];
  wonderLevel(): number;
}

const Z = WORLD.runLineZ;
const tmpV = new THREE.Vector3();

export abstract class Entity {
  alive = true;
  group = new THREE.Group();
  breakable = false;
  hazard = false;
  solidTop = false; // has a standable surface
  despawnX: number;
  constructor(public x: number, protected ctx: WorldCtx) {
    this.group.position.set(x, 0, Z);
    ctx.scene.add(this.group);
    this.despawnX = x;
  }
  /** Side-collision box (null = no collision). */
  box(): Box | null { return null; }
  /** Standable surface height at world x, or null. */
  surfaceAt(_x: number): number | null { return null; }
  /** Height of the standing object (for domino checks). */
  topY(): number { return 0; }
  hit(_how: HitKind, _y: number, _dir: number): boolean { return false; }
  update(_dt: number) {}
  dispose() {
    this.alive = false;
    this.group.removeFromParent();
  }
}

/** Throw a model's cluster meshes into the chunk sim and fire cube sprays. */
function shatter(
  ctx: WorldCtx,
  meshes: THREE.Object3D[],
  colors: number[][],
  dir: number,
  power: number,
  sprayPer: number,
  floatyLeaves = false,
) {
  meshes.forEach((m, i) => {
    m.updateMatrixWorld();
    const bb = new THREE.Box3().setFromObject(m);
    ctx.scene.attach(m);
    const vel = new THREE.Vector3(dir * power * (0.5 + Math.random() * 0.7), 2 + Math.random() * power * 0.6, (Math.random() - 0.4) * power * 0.5);
    const ang = new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6, -dir * (3 + Math.random() * 7));
    const isLeaf = colors[i].some((c) => c === PAL.leaf1 || c === PAL.leaf2 || c === PAL.leaf3);
    ctx.chunks.add(m, vel, ang, isLeaf ? 0.9 : 2.4);
    const size = bb.getSize(tmpV);
    const n = Math.round(sprayPer * Math.min(3, 0.4 + (size.x * size.y * size.z) * 6));
    ctx.spray.emit({
      count: Math.max(6, n),
      colors: colors[i],
      min: bb.min.clone(),
      max: bb.max.clone(),
      dir: new THREE.Vector3(dir, 0.15, 0),
      speed: power,
      up: 5,
      floaty: isLeaf && floatyLeaves ? 0.9 : 0,
      life: isLeaf ? 3.0 : 2.6,
    });
  });
}

// --- Pop props: mailbox, sign --------------------------------------------

export class Prop extends Entity {
  model: VModel;
  height: number;
  half: number;
  constructor(kind: 'mailbox' | 'sign', x: number, ctx: WorldCtx, variant = 0) {
    super(x, ctx);
    this.model = kind === 'mailbox' ? mailboxModel() : signModel(variant);
    this.group.add(buildModel(`${kind}${variant % 2}`, this.model));
    const bb = boxesBounds(this.model.clusters.flatMap((c) => c.boxes));
    this.height = bb.max.y;
    this.half = Math.max(0.18, (bb.max.x - bb.min.x) / 2);
    this.breakable = true;
  }
  box(): Box { return { x0: this.x - this.half, x1: this.x + this.half, y0: 0, y1: this.height }; }
  topY() { return this.height; }
  hit(how: HitKind, _y: number, dir: number) {
    if (!this.breakable) return false;
    this.breakable = false;
    const meshes = [...this.group.children[0].children];
    shatter(this.ctx, meshes, this.model.clusters.map((c) => sprayColors(c.boxes)), dir, how === 'domino' ? 4 : 7, 26);
    this.ctx.onBreak(this, how, new THREE.Vector3(this.x, this.height * 0.6, Z), 1);
    return true;
  }
}

// --- Fence run: ripples apart ------------------------------------------------

export class FenceRun extends Entity {
  segs: THREE.Group[] = [];
  pending: { i: number; t: number }[] = [];
  private colors: number[][];
  private dir = 1;
  constructor(x: number, public n: number, ctx: WorldCtx) {
    super(x, ctx);
    const model = fenceModel();
    this.colors = model.clusters.map((c) => sprayColors(c.boxes));
    for (let i = 0; i < n; i++) {
      const s = buildModel('fence', model);
      s.position.x = i * 1.0;
      this.group.add(s);
      this.segs.push(s);
    }
    this.breakable = true;
    this.despawnX = x + n;
  }
  box(): Box { return { x0: this.x - 0.5, x1: this.x + this.n - 0.5, y0: 0, y1: 0.75 }; }
  topY() { return 0.75; }
  hit(how: HitKind, _y: number, dir: number, hitX?: number) {
    if (!this.breakable) return false;
    this.breakable = false;
    this.dir = dir;
    const hi = THREE.MathUtils.clamp(Math.round((hitX ?? this.x) - this.x), 0, this.n - 1);
    for (let i = 0; i < this.n; i++) this.pending.push({ i, t: Math.abs(i - hi) * 0.055 });
    this.ctx.onBreak(this, how, new THREE.Vector3(this.x + hi, 0.5, Z), 0.6 + this.n * 0.15);
    return true;
  }
  update(dt: number) {
    for (let k = this.pending.length - 1; k >= 0; k--) {
      const p = this.pending[k];
      p.t -= dt;
      if (p.t <= 0) {
        this.pending.splice(k, 1);
        const seg = this.segs[p.i];
        shatter(this.ctx, [...seg.children[0].children], this.colors, this.dir, 6, 14);
      }
    }
  }
}

// --- Topplers: poles and trees ---------------------------------------------

export class Toppler extends Entity {
  model: VModel;
  meshes: THREE.Mesh[];
  colors: number[][];
  sockets: number[];
  state: 'standing' | 'falling' | 'down' = 'standing';
  fall = new THREE.Group();
  theta = 0;
  omega = 0;
  socketY = 0;
  length = 0;
  height: number;
  halfW: number;
  isTree: boolean;
  hitSet = new Set<Entity>();
  constructor(kind: 'pole' | 'tree', x: number, ctx: WorldCtx, variant = 0) {
    super(x, ctx);
    this.isTree = kind === 'tree';
    this.model = kind === 'pole' ? poleModel() : treeModel(variant);
    const g = buildModel(kind === 'pole' ? 'pole' : `tree${variant % 3}`, this.model);
    this.group.add(g);
    this.meshes = [...g.children] as THREE.Mesh[];
    this.colors = this.model.clusters.map((c) => sprayColors(c.boxes));
    this.sockets = kind === 'pole' ? POLE_SOCKETS : TREE_SOCKETS;
    const bb = boxesBounds(this.model.clusters.flatMap((c) => c.boxes));
    this.height = kind === 'pole' ? 5.0 : bb.max.y;
    this.halfW = kind === 'pole' ? 0.16 : 0.2;
    this.breakable = true;
    this.group.add(this.fall);
  }
  box(): Box | null {
    if (this.state !== 'standing') return null;
    const top = this.isTree ? (this.model.clusters[1].boxes[0].y + this.model.clusters[1].boxes[0].h) * VOXEL : this.height;
    return { x0: this.x - this.halfW, x1: this.x + this.halfW, y0: 0, y1: top };
  }
  topY() { return this.state === 'standing' ? this.height : 0; }
  hit(how: HitKind, y: number, dir: number) {
    if (this.state !== 'standing') return false;
    // cut at the highest socket below the strike point
    let si = 0;
    for (let i = 0; i < this.sockets.length; i++) if (this.sockets[i] * VOXEL <= y + 0.3) si = i;
    this.socketY = this.sockets[si] * VOXEL;
    this.state = 'falling';
    this.breakable = false;
    const falling = this.meshes.slice(si + 1);
    this.fall.position.set(0, this.socketY, 0);
    for (const m of falling) {
      this.fall.add(m);
      m.position.y = -this.socketY;
    }
    this.length = this.height - this.socketY;
    this.theta = 0.08;
    this.omega = how === 'domino' ? 2.2 : 1.5;
    this.fallDir = dir;
    // a burst of cubes along the cut line sells the slice
    this.ctx.spray.emit({
      count: 30,
      colors: this.colors[si],
      min: new THREE.Vector3(this.x - 0.15, this.socketY - 0.05, Z - 0.15),
      max: new THREE.Vector3(this.x + 0.15, this.socketY + 0.05, Z + 0.15),
      dir: new THREE.Vector3(dir, 0.3, 0),
      speed: 6,
      up: 4,
    });
    this.ctx.onBreak(this, how, new THREE.Vector3(this.x, this.socketY, Z), 1.3);
    if (!this.isTree) this.ctx.onPoleCut(this as unknown as Pole);
    return true;
  }
  fallDir = 1;
  private tipX() { return this.x + this.fallDir * Math.sin(this.theta) * this.length; }
  private pivotY() { return this.socketY * Math.max(0, 1 - this.theta / (Math.PI / 2)); }
  surfaceAt(x: number): number | null {
    if (this.state !== 'falling' || this.theta < 0.25 || this.theta > 1.4) return null;
    const d = (x - this.x) * this.fallDir;
    if (d < 0.1 || d > Math.sin(this.theta) * this.length) return null;
    return this.pivotY() + d / Math.tan(this.theta) + 0.15;
  }
  update(dt: number) {
    if (this.state !== 'falling') return;
    const g = 30;
    this.omega += ((3 * g) / (2 * Math.max(1.5, this.length))) * Math.sin(this.theta) * dt;
    this.theta += this.omega * dt;
    this.fall.position.y = this.pivotY();
    this.fall.rotation.z = -this.fallDir * Math.min(this.theta, Math.PI / 2);
    // domino sweep: knock over anything the falling top passes through
    const tip = this.tipX();
    for (const e of this.ctx.entities()) {
      if (e === this || !e.alive || this.hitSet.has(e)) continue;
      const d = (e.x - this.x) * this.fallDir;
      const reach = (tip - this.x) * this.fallDir;
      if (d < 0.35 || d > reach) continue;
      const lineY = this.pivotY() + d / Math.tan(Math.max(0.05, this.theta));
      if (e.breakable && e.topY() > lineY) {
        this.hitSet.add(e);
        if (e instanceof FenceRun) e.hit('domino', lineY, this.fallDir, this.x + this.fallDir * reach);
        else e.hit('domino', Math.max(0.2, lineY - 0.5), this.fallDir);
      } else if (e instanceof Vehicle && e.topY() > lineY) {
        this.hitSet.add(e);
        e.squash(0.5);
      }
    }
    if (this.theta >= Math.PI / 2) {
      this.state = 'down';
      // land: shatter everything that fell
      this.fall.updateMatrixWorld();
      const meshes = [...this.fall.children];
      const cols = meshes.map((m) => this.colors[this.meshes.indexOf(m as THREE.Mesh)]);
      shatter(this.ctx, meshes, cols, this.fallDir, 4.5, 26, true);
      this.ctx.onImpact(new THREE.Vector3(this.x + this.fallDir * this.length * 0.6, 0.2, Z), 1, this.isTree ? 'leaf' : 'wood');
    }
  }
}

export class Pole extends Toppler {
  constructor(x: number, ctx: WorldCtx, public line: number) {
    super('pole', x, ctx);
  }
  get wireIntact() { return this.state === 'standing'; }
}

// --- Concrete barrier: hazard you hop over or stand on -----------------------

export class Barrier extends Entity {
  constructor(x: number, ctx: WorldCtx) {
    super(x, ctx);
    this.group.add(buildModel('barrier', barrierModel()));
    this.hazard = true;
    this.solidTop = true;
  }
  box(): Box { return { x0: this.x - 1.0, x1: this.x + 1.0, y0: 0, y1: 0.72 }; }
  surfaceAt(x: number) { return Math.abs(x - this.x) <= 1.05 ? 0.75 : null; }
  topY() { return 0.75; }
}

// --- Vehicles: toy reactors, rideable ----------------------------------------

export const VEHICLE_Z = -9.4;

export class Vehicle extends Entity {
  sq = 0;
  sqV = 0;
  body: THREE.Group;
  constructor(x: number, ctx: WorldCtx, public vx: number, color: number, public fast: boolean) {
    super(x, ctx);
    this.group.position.z = VEHICLE_Z;
    this.body = buildModel(`car${color}`, carModel(color));
    this.group.add(this.body);
    this.hazard = true;
    this.solidTop = true;
  }
  box(): Box { return { x0: this.x - 1.45, x1: this.x + 1.45, y0: 0, y1: 1.0 }; }
  surfaceAt(x: number) {
    const d = x - this.x;
    if (d < -1.55 || d > 1.55) return null;
    return d > -1.0 && d < 0.75 ? 1.25 : 0.78;
  }
  topY() { return 1.25; }
  squash(a: number) { this.sqV -= a * 6; }
  update(dt: number) {
    this.x += this.vx * dt;
    this.group.position.x = this.x;
    this.despawnX = this.x;
    // springy toy suspension
    this.sqV += (-this.sq * 160 - this.sqV * 9) * dt;
    this.sq += this.sqV * dt;
    this.body.scale.set(1 - this.sq * 0.4, 1 + this.sq, 1 - this.sq * 0.2);
    this.body.position.y = Math.sin(performance.now() * 0.02 + this.x) * 0.012;
  }
}

// --- Imagined platforms (exist at Wonder tier 2+) ----------------------------

export class ImaginedPlatform extends Entity {
  len: number;
  mesh: THREE.Group;
  shown = 0;
  constructor(x: number, public y: number, lenVox: number, ctx: WorldCtx) {
    super(x, ctx);
    this.len = lenVox * VOXEL;
    this.mesh = buildModel(`plat${lenVox}`, platformModel(lenVox), glowMaterial);
    this.mesh.position.y = y;
    this.group.position.z = Z - 0.4;
    this.group.add(this.mesh);
    this.mesh.visible = false;
    this.solidTop = true;
    this.despawnX = x + this.len;
  }
  get active() { return this.ctx.wonderLevel() >= 1.95; }
  surfaceAt(x: number) {
    if (!this.active) return null;
    return Math.abs(x - this.x) <= this.len / 2 + 0.1 ? this.y + 3 * VOXEL : null;
  }
  update(dt: number) {
    const target = this.active ? 1 : 0;
    const prev = this.shown;
    this.shown = THREE.MathUtils.clamp(this.shown + (target - this.shown) * Math.min(1, dt * 6), 0, 1);
    this.mesh.visible = this.shown > 0.02;
    this.mesh.scale.setScalar(0.4 + 0.6 * this.shown);
    this.mesh.position.y = this.y + Math.sin(performance.now() * 0.002 + this.x) * 0.06;
    if (prev < 0.1 && this.shown >= 0.1) {
      this.ctx.spray.emit({
        count: 18, colors: [PAL.gold, 0xffffff, 0xffe9a8],
        min: new THREE.Vector3(this.x - this.len / 2, this.y, Z - 0.6), max: new THREE.Vector3(this.x + this.len / 2, this.y + 0.3, Z - 0.2),
        speed: 1.5, up: 2, floaty: 1, glow: true, life: 1.2, size: VOXEL * 0.7,
      });
    }
  }
}

// --- Decoration: traffic light, store ---------------------------------------

export class TrafficLight extends Entity {
  lamps: THREE.MeshBasicMaterial[] = [];
  constructor(x: number, ctx: WorldCtx) {
    super(x, ctx);
    this.group.position.z = Z - 2.2;
    this.group.add(buildModel('tlight', trafficLightModel()));
    const cols = [0xff4a3a, 0xffc93a, 0x4ae06a];
    cols.forEach((c, i) => {
      const mat = new THREE.MeshBasicMaterial({ color: c });
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(3 * VOXEL, 3 * VOXEL, 0.5 * VOXEL), mat);
      lamp.position.set(0, (57 - i * 4) * VOXEL - 0.1, 28.1 * VOXEL);
      this.group.add(lamp);
      this.lamps.push(mat);
    });
    this.set('green');
  }
  set(state: 'red' | 'yellow' | 'green') {
    const on = { red: 0, yellow: 1, green: 2 }[state];
    const cols = [0xff4a3a, 0xffc93a, 0x4ae06a];
    this.lamps.forEach((m, i) => m.color.setHex(i === on ? cols[i] : 0x2a2a2a));
  }
}

export class Store extends Entity {
  constructor(x: number, ctx: WorldCtx) {
    super(x, ctx);
    this.group.position.z = -34;
    this.group.add(buildModel('store', storeModel()));
    this.despawnX = x + 20;
  }
}

// --- Power lines -----------------------------------------------------------

interface Rope {
  pts: THREE.Vector3[];
  prev: THREE.Vector3[];
  pinned: number; // index of the pinned point
  segLen: number;
}

export class WireSystem {
  mesh: THREE.InstancedMesh;
  private ropes: Rope[] = [];
  private segs = 0;
  private tmpM = new THREE.Matrix4();
  private tmpQ = new THREE.Quaternion();
  private up = new THREE.Vector3(0, 1, 0);
  readonly sag = 0.38;

  constructor(scene: THREE.Scene, private poles: () => Pole[]) {
    const geo = new THREE.BoxGeometry(0.055, 1, 0.055);
    geo.translate(0, 0.5, 0);
    this.mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: 0x2b2a2e, roughness: 0.6 }), 1600);
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }

  /** Consecutive pole pairs in the same line with both tops intact. */
  spans(): [Pole, Pole][] {
    const ps = this.poles().filter((p) => p.alive).sort((a, b) => a.x - b.x);
    const out: [Pole, Pole][] = [];
    for (let i = 0; i < ps.length - 1; i++) {
      const a = ps[i], b = ps[i + 1];
      if (a.line === b.line && a.wireIntact && b.wireIntact && b.x - a.x < 16) out.push([a, b]);
    }
    return out;
  }

  wireY(a: Pole, b: Pole, x: number, y0 = POLE_WIRE_Y) {
    const t = (x - a.x) / (b.x - a.x);
    return y0 - this.sag * 4 * t * (1 - t);
  }

  /** The grind wire under world x, if any. */
  spanAt(x: number): [Pole, Pole] | null {
    for (const s of this.spans()) if (x >= s[0].x - 0.05 && x <= s[1].x + 0.05) return s;
    return null;
  }

  /** A pole lost its top: its spans become whipping ropes. */
  snap(p: Pole, allPoles: Pole[]) {
    const ps = allPoles.filter((q) => q.alive && q.line === p.line).sort((a, b) => a.x - b.x);
    const i = ps.indexOf(p);
    for (const other of [ps[i - 1], ps[i + 1]]) {
      if (!other || !other.wireIntact || Math.abs(other.x - p.x) > 16) continue;
      for (const [y0, z] of [[POLE_WIRE_Y, 0], [4.55, -0.42]] as const) {
        const n = 10;
        const pts: THREE.Vector3[] = [];
        for (let k = 0; k <= n; k++) {
          const t = k / n;
          const x = THREE.MathUtils.lerp(other.x, p.x, t);
          const a = other.x < p.x ? other : p, b = other.x < p.x ? p : other;
          pts.push(new THREE.Vector3(x, this.wireY(a, b, x, y0), WORLD.runLineZ + z));
        }
        // the free end gets a kick so it whips
        const kick = new THREE.Vector3(0, 0.25, 0);
        const prev = pts.map((q, k) => q.clone().sub(kick.clone().multiplyScalar(k / n)));
        this.ropes.push({ pts, prev, pinned: 0, segLen: Math.abs(p.x - other.x) / n * 0.98 });
      }
    }
  }

  clear() { this.ropes = []; }

  update(dt: number, minX: number) {
    this.segs = 0;
    for (const [a, b] of this.spans()) {
      for (const [y0, z] of [[POLE_WIRE_Y, 0], [4.55, -0.42]] as const) {
        const n = 10;
        let px = a.x, py = this.wireY(a, b, a.x, y0);
        for (let k = 1; k <= n; k++) {
          const x = THREE.MathUtils.lerp(a.x, b.x, k / n);
          const y = this.wireY(a, b, x, y0);
          this.seg(px, py, WORLD.runLineZ + z, x, y, WORLD.runLineZ + z);
          px = x; py = y;
        }
      }
    }
    // verlet ropes
    const g = -24 * dt * dt;
    this.ropes = this.ropes.filter((r) => r.pts[0].x > minX);
    for (const r of this.ropes) {
      for (let k = 0; k < r.pts.length; k++) {
        if (k === r.pinned) continue;
        const p = r.pts[k], q = r.prev[k];
        const vx = (p.x - q.x) * 0.985, vy = (p.y - q.y) * 0.985, vz = (p.z - q.z) * 0.985;
        q.copy(p);
        p.x += vx; p.y += vy + g; p.z += vz;
        if (p.y < 0.03) { p.y = 0.03; q.y = p.y; q.x = p.x - vx * 0.5; }
      }
      for (let it = 0; it < 6; it++) {
        for (let k = 0; k < r.pts.length - 1; k++) {
          const p = r.pts[k], q = r.pts[k + 1];
          tmpV.subVectors(q, p);
          const d = tmpV.length() || 1e-4;
          const diff = (d - r.segLen) / d;
          const wp = k === r.pinned ? 0 : 0.5, wq = k + 1 === r.pinned ? 0 : 0.5;
          const s = wp + wq || 1;
          p.addScaledVector(tmpV, (diff * wp) / s);
          q.addScaledVector(tmpV, (-diff * wq) / s);
        }
      }
      for (let k = 0; k < r.pts.length - 1; k++) this.seg(r.pts[k].x, r.pts[k].y, r.pts[k].z, r.pts[k + 1].x, r.pts[k + 1].y, r.pts[k + 1].z);
    }
    this.mesh.count = this.segs;
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  private seg(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
    if (this.segs >= 1600) return;
    tmpV.set(x1 - x0, y1 - y0, z1 - z0);
    const len = tmpV.length();
    this.tmpQ.setFromUnitVectors(this.up, tmpV.normalize());
    this.tmpM.compose(new THREE.Vector3(x0, y0, z0), this.tmpQ, new THREE.Vector3(1, len, 1));
    this.mesh.setMatrixAt(this.segs++, this.tmpM);
  }
}
