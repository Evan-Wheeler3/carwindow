import * as THREE from 'three';
import { bevelTexture, patchWonder } from './voxel';
import { LIMITS, VOXEL } from './config';

// ---------------------------------------------------------------------------
// Debris: two layers.
//  * CubeSpray – thousands of single voxel cubes (instanced, CPU-integrated,
//    ground-only collision). This is the signature "small blocks" effect.
//  * Chunks    – the big voxel clusters an object breaks into: fake rigid
//    bodies that bounce on the ground plane then shrink-pop away.
// Neither layer affects gameplay, so both can be approximate.
// ---------------------------------------------------------------------------

const G = 30;
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpV = new THREE.Vector3();
const tmpS = new THREE.Vector3();
const tmpC = new THREE.Color();

export interface SprayOpts {
  count: number;
  colors: number[];
  // spawn volume (world units)
  min: THREE.Vector3;
  max: THREE.Vector3;
  dir?: THREE.Vector3; // bias direction
  speed?: number;
  up?: number;
  size?: number;
  floaty?: number; // 0..1, leaves drift
  life?: number;
  glow?: boolean;
}

export class CubeSpray {
  mesh: THREE.InstancedMesh;
  glowMesh: THREE.InstancedMesh;
  private n = LIMITS.cubes;
  private pos = new Float32Array(this.n * 3);
  private vel = new Float32Array(this.n * 3);
  private rot = new Float32Array(this.n * 3);
  private ang = new Float32Array(this.n * 3);
  private size = new Float32Array(this.n);
  private age = new Float32Array(this.n);
  private life = new Float32Array(this.n);
  private drag = new Float32Array(this.n);
  private alive = new Uint8Array(this.n);
  private isGlow = new Uint8Array(this.n);
  private cursor = 0;
  liveCount = 0;

  constructor(scene: THREE.Scene) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ map: bevelTexture, roughness: 0.8 });
    patchWonder(mat);
    this.mesh = new THREE.InstancedMesh(geo, mat, this.n);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = true;
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.glowMesh = new THREE.InstancedMesh(geo, glowMat, 400);
    this.glowMesh.frustumCulled = false;
    for (let i = 0; i < this.n; i++) {
      this.mesh.setColorAt(i, tmpC.setHex(0xffffff));
      this.mesh.setMatrixAt(i, tmpM.makeScale(0, 0, 0));
    }
    for (let i = 0; i < 400; i++) {
      this.glowMesh.setColorAt(i, tmpC.setHex(0xffffff));
      this.glowMesh.setMatrixAt(i, tmpM.makeScale(0, 0, 0));
    }
    scene.add(this.mesh, this.glowMesh);
  }

  emit(o: SprayOpts) {
    const speed = o.speed ?? 5;
    const up = o.up ?? 5;
    const dir = o.dir ?? new THREE.Vector3(1, 0, 0);
    for (let k = 0; k < o.count; k++) {
      // find a free slot (ring buffer: oldest gets recycled first)
      let i = this.cursor;
      this.cursor = (this.cursor + 1) % this.n;
      if (!this.alive[i]) this.liveCount++;
      this.alive[i] = 1;
      this.isGlow[i] = o.glow ? 1 : 0;
      const p = i * 3;
      this.pos[p] = THREE.MathUtils.lerp(o.min.x, o.max.x, Math.random());
      this.pos[p + 1] = THREE.MathUtils.lerp(o.min.y, o.max.y, Math.random());
      this.pos[p + 2] = THREE.MathUtils.lerp(o.min.z, o.max.z, Math.random());
      const s = speed * (0.35 + Math.random() * 0.9);
      this.vel[p] = dir.x * s + (Math.random() - 0.5) * speed * 0.9;
      this.vel[p + 1] = up * (0.4 + Math.random() * 0.9) + dir.y * s;
      this.vel[p + 2] = dir.z * s + (Math.random() - 0.5) * speed * 1.3;
      this.rot[p] = Math.random() * 6;
      this.rot[p + 1] = Math.random() * 6;
      this.rot[p + 2] = Math.random() * 6;
      this.ang[p] = (Math.random() - 0.5) * 18;
      this.ang[p + 1] = (Math.random() - 0.5) * 18;
      this.ang[p + 2] = (Math.random() - 0.5) * 18;
      const base = (o.size ?? VOXEL) * (Math.random() < 0.25 ? 0.55 : Math.random() < 0.12 ? 1.6 : 1);
      this.size[i] = base;
      this.age[i] = 0;
      this.life[i] = (o.life ?? 2.6) * (0.75 + Math.random() * 0.5);
      this.drag[i] = o.floaty ?? 0;
      const col = o.colors[(Math.random() * o.colors.length) | 0];
      tmpC.setHex(col);
      tmpC.offsetHSL(0, 0, (Math.random() - 0.5) * 0.08);
      this.mesh.setColorAt(i, tmpC);
    }
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  update(dt: number) {
    let glowIdx = 0;
    for (let i = 0; i < this.n; i++) {
      if (!this.alive[i]) continue;
      const p = i * 3;
      this.age[i] += dt;
      const fl = this.drag[i];
      this.vel[p + 1] -= G * (1 - fl * 0.8) * dt;
      if (fl > 0) {
        const damp = Math.exp(-fl * 2.2 * dt);
        this.vel[p] *= damp;
        this.vel[p + 2] *= damp;
        this.vel[p + 1] = Math.max(this.vel[p + 1], -3.5);
      }
      this.pos[p] += this.vel[p] * dt;
      this.pos[p + 1] += this.vel[p + 1] * dt;
      this.pos[p + 2] += this.vel[p + 2] * dt;
      const half = this.size[i] * 0.5;
      if (this.pos[p + 1] < half) {
        this.pos[p + 1] = half;
        if (this.vel[p + 1] < -1.5) {
          this.vel[p + 1] *= -0.38;
          this.ang[p] *= 0.6;
          this.ang[p + 1] *= 0.6;
          this.ang[p + 2] *= 0.6;
        } else {
          this.vel[p + 1] = 0;
          // settle flat on the ground: snap rotations to quarter turns
          this.ang[p] *= 0.5;
          this.ang[p + 2] *= 0.5;
          this.rot[p] = THREE.MathUtils.lerp(this.rot[p], Math.round(this.rot[p] / (Math.PI / 2)) * (Math.PI / 2), 0.2);
          this.rot[p + 2] = THREE.MathUtils.lerp(this.rot[p + 2], Math.round(this.rot[p + 2] / (Math.PI / 2)) * (Math.PI / 2), 0.2);
        }
        this.vel[p] *= 0.82;
        this.vel[p + 2] *= 0.82;
      }
      this.rot[p] += this.ang[p] * dt;
      this.rot[p + 1] += this.ang[p + 1] * dt;
      this.rot[p + 2] += this.ang[p + 2] * dt;
      let sc = this.size[i];
      const remain = this.life[i] - this.age[i];
      if (remain < 0.25) sc *= Math.max(0, remain / 0.25);
      if (this.age[i] < 0.06) sc *= 0.5 + this.age[i] / 0.12;
      if (remain <= 0) {
        this.alive[i] = 0;
        this.liveCount--;
        this.mesh.setMatrixAt(i, tmpM.makeScale(0, 0, 0));
        continue;
      }
      tmpE.set(this.rot[p], this.rot[p + 1], this.rot[p + 2]);
      tmpQ.setFromEuler(tmpE);
      tmpV.set(this.pos[p], this.pos[p + 1], this.pos[p + 2]);
      tmpS.setScalar(sc);
      tmpM.compose(tmpV, tmpQ, tmpS);
      if (this.isGlow[i] && glowIdx < 400) {
        this.glowMesh.setMatrixAt(glowIdx, tmpM);
        this.mesh.instanceColor && this.mesh.getColorAt(i, tmpC);
        this.glowMesh.setColorAt(glowIdx, tmpC);
        glowIdx++;
        this.mesh.setMatrixAt(i, tmpM.makeScale(0, 0, 0));
      } else {
        this.mesh.setMatrixAt(i, tmpM);
      }
    }
    for (let j = glowIdx; j < 400; j++) this.glowMesh.setMatrixAt(j, tmpM.makeScale(0, 0, 0));
    this.mesh.instanceMatrix.needsUpdate = true;
    this.glowMesh.instanceMatrix.needsUpdate = true;
    if (this.glowMesh.instanceColor) this.glowMesh.instanceColor.needsUpdate = true;
  }

  clear() {
    for (let i = 0; i < this.n; i++) {
      if (this.alive[i]) this.mesh.setMatrixAt(i, tmpM.makeScale(0, 0, 0));
      this.alive[i] = 0;
    }
    this.liveCount = 0;
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

interface Chunk {
  mesh: THREE.Object3D;
  vel: THREE.Vector3;
  ang: THREE.Vector3;
  age: number;
  life: number;
  corners: THREE.Vector3[];
  baseScale: THREE.Vector3;
  onExpire?: (c: Chunk) => void;
}

/** Big pieces: fake rigid bodies against the ground plane. */
export class ChunkSim {
  chunks: Chunk[] = [];
  constructor(private scene: THREE.Scene) {}

  /** Take ownership of a mesh (already positioned in world space). */
  add(mesh: THREE.Object3D, vel: THREE.Vector3, ang: THREE.Vector3, life = 2.6, onExpire?: (c: Chunk) => void) {
    if (this.chunks.length >= LIMITS.chunks) this.expire(this.chunks[0]);
    // world-space bounding corners in local coordinates
    const bb = new THREE.Box3();
    mesh.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.geometry.computeBoundingBox();
        bb.union(m.geometry.boundingBox!);
      }
    });
    const corners: THREE.Vector3[] = [];
    for (let i = 0; i < 8; i++) {
      corners.push(new THREE.Vector3(i & 1 ? bb.max.x : bb.min.x, i & 2 ? bb.max.y : bb.min.y, i & 4 ? bb.max.z : bb.min.z));
    }
    this.scene.add(mesh);
    this.chunks.push({ mesh, vel, ang, age: 0, life: life * (0.8 + Math.random() * 0.4), corners, baseScale: mesh.scale.clone(), onExpire });
  }

  private expire(c: Chunk) {
    const i = this.chunks.indexOf(c);
    if (i >= 0) this.chunks.splice(i, 1);
    c.mesh.removeFromParent();
    c.onExpire?.(c);
  }

  update(dt: number) {
    for (let k = this.chunks.length - 1; k >= 0; k--) {
      const c = this.chunks[k];
      c.age += dt;
      c.vel.y -= G * dt;
      c.mesh.position.addScaledVector(c.vel, dt);
      tmpQ.setFromEuler(tmpE.set(c.ang.x * dt, c.ang.y * dt, c.ang.z * dt));
      c.mesh.quaternion.premultiply(tmpQ);
      c.mesh.updateMatrixWorld();
      // lowest corner vs ground
      let minY = Infinity;
      for (const corner of c.corners) {
        tmpV.copy(corner).applyMatrix4(c.mesh.matrixWorld);
        if (tmpV.y < minY) minY = tmpV.y;
      }
      if (minY < 0) {
        c.mesh.position.y -= minY;
        if (c.vel.y < -2) {
          c.vel.y *= -0.32;
          c.ang.multiplyScalar(0.55);
          // tip the spin into the direction of travel for a tumbling look
          c.ang.z -= c.vel.x * 0.25;
        } else {
          c.vel.y = 0;
          c.ang.multiplyScalar(0.85);
        }
        c.vel.x *= 0.86;
        c.vel.z *= 0.86;
      }
      const remain = c.life - c.age;
      if (remain < 0.22) c.mesh.scale.copy(c.baseScale).multiplyScalar(Math.max(0.001, remain / 0.22));
      if (remain <= 0) this.expire(c);
    }
  }

  clear() {
    for (const c of [...this.chunks]) this.expire(c);
  }
}
