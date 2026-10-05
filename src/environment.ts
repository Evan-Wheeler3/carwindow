import * as THREE from 'three';
import { buildModel, houseModel, treeModel, hillModel, cloudModel, reflectorModel } from './models';
import { patchWonder, bevelTexture } from './voxel';
import { WORLD } from './config';

// ---------------------------------------------------------------------------
// Everything you only look at: sky, ground strips, foreground reflector posts
// (the speed cue), mid-ground houses and trees, far hills and clouds. All of
// it is real 3D, so parallax comes for free as the car moves.
// ---------------------------------------------------------------------------

export type Biome = 'neighborhood' | 'mainroad' | 'highway' | 'arrival';

function tileTexture(colors: string[], cells: number, edge = 0.18, seed = 1): THREE.CanvasTexture {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  const cs = s / cells;
  let r = seed;
  const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      g.fillStyle = colors[Math.floor(rnd() * colors.length)];
      g.fillRect(x * cs, y * cs, cs, cs);
      g.fillStyle = `rgba(255,255,255,${edge * 0.6})`;
      g.fillRect(x * cs, y * cs, cs, 1.5);
      g.fillRect(x * cs, y * cs, 1.5, cs);
      g.fillStyle = `rgba(0,0,0,${edge})`;
      g.fillRect(x * cs, y * cs + cs - 1.5, cs, 1.5);
      g.fillRect(x * cs + cs - 1.5, y * cs, 1.5, cs);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

interface Strip {
  mesh: THREE.Mesh;
  tile: number;
}

const SKY = [
  { top: new THREE.Color(0x98a5b3), hor: new THREE.Color(0xd5d8db), sun: 0.0, light: 1.2, hemi: 0.75 },
  { top: new THREE.Color(0x7fb0de), hor: new THREE.Color(0xe7eef0), sun: 0.35, light: 2.0, hemi: 0.9 },
  { top: new THREE.Color(0x4d93e6), hor: new THREE.Color(0xffe6c0), sun: 0.7, light: 2.5, hemi: 1.0 },
  { top: new THREE.Color(0x3767db), hor: new THREE.Color(0xffc19c), sun: 1.0, light: 2.8, hemi: 1.1 },
];

export class Environment {
  sky: THREE.Mesh;
  skyMat: THREE.ShaderMaterial;
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  fog: THREE.Fog;
  private strips: Strip[] = [];
  private cells = new Map<number, THREE.Object3D[]>();
  private farCells = new Map<number, THREE.Object3D[]>();
  private reflectors: THREE.InstancedMesh;
  private edgeLine: THREE.Mesh;
  biomeAt: (x: number) => Biome = () => 'neighborhood';

  constructor(private scene: THREE.Scene) {
    // sky dome
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: SKY[0].top.clone() },
        hor: { value: SKY[0].hor.clone() },
        sunAmt: { value: 0 },
        sunDir: { value: new THREE.Vector3(0.4, 0.35, -0.85).normalize() },
      },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 top; uniform vec3 hor; uniform float sunAmt; uniform vec3 sunDir; varying vec3 vDir;
        void main(){ float h = clamp(vDir.y*1.6+0.05, 0.0, 1.0); vec3 c = mix(hor, top, pow(h, 0.7));
          float s = max(0.0, dot(normalize(vDir), sunDir)); c += sunAmt * (pow(s, 40.0)*0.6 + pow(s, 6.0)*0.15) * vec3(1.0,0.9,0.7);
          gl_FragColor = vec4(c, 1.0); }`,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(480, 24, 12), this.skyMat);
    this.sky.frustumCulled = false;
    this.sky.renderOrder = -10;
    scene.add(this.sky);

    this.fog = new THREE.Fog(SKY[0].hor.getHex(), 70, 330);
    scene.fog = this.fog;

    this.hemi = new THREE.HemisphereLight(0xdfe9f5, 0x6a7a55, 0.9);
    scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xfff2dc, 2.2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 1024);
    const sc = this.sun.shadow.camera;
    sc.left = -26; sc.right = 26; sc.top = 12; sc.bottom = -12; sc.near = 1; sc.far = 80;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.02;
    scene.add(this.sun, this.sun.target);

    // ground strips (z ranges), each a long plane that follows the car in tile steps
    const mk = (z0: number, z1: number, tex: THREE.Texture, tile: number, y = 0) => {
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1 });
      patchWonder(mat);
      const depth = Math.abs(z1 - z0);
      const geo = new THREE.PlaneGeometry(720, depth);
      geo.rotateX(-Math.PI / 2);
      const uv = geo.getAttribute('uv') as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (720 / tile), uv.getY(i) * (depth / tile));
      const m = new THREE.Mesh(geo, mat);
      m.position.set(0, y, (z0 + z1) / 2);
      m.receiveShadow = true;
      scene.add(m);
      this.strips.push({ mesh: m, tile });
    };
    const asphalt = tileTexture(['#5a5d63', '#55585e', '#5e6167'], 8, 0.08, 3);
    const grass = tileTexture(['#79b85c', '#73b257', '#7fbe62', '#6dab52'], 8, 0.12, 7);
    const path = tileTexture(['#d9d3c6', '#d2ccbf', '#ddd7cb'], 4, 0.25, 11);
    const farGrass = tileTexture(['#82bd61', '#78b45a', '#8cc46a'], 4, 0.06, 13);
    mk(1.5, -4.7, asphalt, 4);
    mk(-4.7, -9.8, grass, 4, 0.0);
    mk(-9.8, -12.4, path, 3, 0.01);
    mk(-12.4, -60, grass, 4, 0.0);
    mk(-60, -400, farGrass, 12, -0.02);

    // painted edge line
    this.edgeLine = new THREE.Mesh(new THREE.PlaneGeometry(720, 0.18).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xf2f2ea, roughness: 0.9 }));
    this.edgeLine.position.set(0, 0.012, -4.45);
    scene.add(this.edgeLine);
    // curb
    const curb = new THREE.Mesh(new THREE.BoxGeometry(720, 0.14, 0.25), new THREE.MeshStandardMaterial({ color: 0xc9c5bb, roughness: 0.9, map: bevelTexture }));
    curb.position.set(0, 0.07, -4.75);
    curb.receiveShadow = true;
    scene.add(curb);
    this.strips.push({ mesh: this.edgeLine, tile: 1 }, { mesh: curb, tile: 1 });

    // foreground reflector posts
    const refl = buildModel('reflector', reflectorModel());
    const rMesh = refl.children[0] as THREE.Mesh;
    this.reflectors = new THREE.InstancedMesh(rMesh.geometry, rMesh.material, 60);
    this.reflectors.frustumCulled = false;
    this.reflectors.castShadow = true;
    scene.add(this.reflectors);
  }

  /** Visual level 0..3, smoothed. */
  setLevel(level: number) {
    const i = Math.min(2, Math.floor(level));
    const t = Math.min(1, level - i);
    const a = SKY[i], b = SKY[i + 1];
    this.skyMat.uniforms.top.value.copy(a.top).lerp(b.top, t);
    this.skyMat.uniforms.hor.value.copy(a.hor).lerp(b.hor, t);
    this.skyMat.uniforms.sunAmt.value = THREE.MathUtils.lerp(a.sun, b.sun, t);
    this.fog.color.copy(this.skyMat.uniforms.hor.value);
    this.sun.intensity = THREE.MathUtils.lerp(a.light, b.light, t);
    this.hemi.intensity = THREE.MathUtils.lerp(a.hemi, b.hemi, t);
  }

  update(carX: number, camWorld: THREE.Vector3) {
    this.sky.position.copy(camWorld);
    for (const s of this.strips) s.mesh.position.x = Math.round(carX / s.tile) * s.tile;
    // sun follows the car; light comes from behind-left so shadows fall toward the camera side slightly
    this.sun.position.set(carX - 10, 30, WORLD.runLineZ + 14);
    this.sun.target.position.set(carX + 2, 0, WORLD.runLineZ);
    this.sun.shadow.camera.updateProjectionMatrix();

    // reflector posts every 8 units
    const m = new THREE.Matrix4();
    const base = Math.floor((carX - 30) / 8) * 8;
    for (let i = 0; i < 60; i++) {
      m.makeTranslation(base + i * 8, 0, -5.6);
      this.reflectors.setMatrixAt(i, m);
    }
    this.reflectors.instanceMatrix.needsUpdate = true;

    this.stream(this.cells, 12, carX - 70, carX + 170, (c) => this.buildCell(c));
    this.stream(this.farCells, 60, carX - 260, carX + 420, (c) => this.buildFarCell(c));
  }

  private stream(map: Map<number, THREE.Object3D[]>, size: number, from: number, to: number, build: (c: number) => THREE.Object3D[]) {
    const c0 = Math.floor(from / size), c1 = Math.floor(to / size);
    for (const [c, objs] of map) {
      if (c < c0 || c > c1) {
        objs.forEach((o) => o.removeFromParent());
        map.delete(c);
      }
    }
    for (let c = c0; c <= c1; c++) if (!map.has(c)) map.set(c, build(c));
  }

  resetCells() {
    for (const objs of this.cells.values()) objs.forEach((o) => o.removeFromParent());
    this.cells.clear();
  }

  private place(g: THREE.Object3D, x: number, z: number, ry = 0, s = 1) {
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    g.scale.setScalar(s);
    this.scene.add(g);
    return g;
  }

  private buildCell(c: number): THREE.Object3D[] {
    const r = hash(c);
    const x = c * 12;
    const biome = this.biomeAt(x);
    const out: THREE.Object3D[] = [];
    if (biome === 'neighborhood' || (biome === 'mainroad' && r(1) < 0.5)) {
      const v = Math.floor(r(2) * 15);
      out.push(this.place(buildModel(`house${v}`, houseModel(v)), x + r(3) * 3, -29 - r(4) * 3));
      if (r(5) < 0.7) {
        const tv = Math.floor(r(6) * 3);
        out.push(this.place(buildModel(`tree${tv}`, treeModel(tv)), x + 6 + r(7) * 2, -20 - r(8) * 3, r(9) * 3));
      }
      if (r(10) < 0.5) out.push(this.place(buildModel('bush', bushModel()), x + r(11) * 10, -16.5 - r(12) * 1.5));
    } else if (biome === 'highway' || biome === 'mainroad') {
      const n = 1 + Math.floor(r(2) * 3);
      for (let i = 0; i < n; i++) {
        const tv = Math.floor(r(3 + i) * 3);
        out.push(this.place(buildModel(`tree${tv}`, treeModel(tv)), x + r(10 + i) * 12, -19 - r(20 + i) * 22, r(30 + i) * 3, 1 + r(40 + i) * 0.5));
      }
      if (r(50) < 0.25) out.push(this.place(buildModel('bush', bushModel()), x + r(51) * 10, -16.5));
    } else {
      // arrival: parking lot lamps / a few trees
      if (r(2) < 0.5) {
        const tv = Math.floor(r(3) * 3);
        out.push(this.place(buildModel(`tree${tv}`, treeModel(tv)), x + r(4) * 8, -19 - r(5) * 3));
      }
    }
    return out;
  }

  private buildFarCell(c: number): THREE.Object3D[] {
    const r = hash(c * 7 + 3);
    const x = c * 60;
    const out: THREE.Object3D[] = [];
    const hv = Math.floor(r(1) * 4);
    out.push(this.place(buildModel(`hill${hv}`, hillModel(hv)), x + r(2) * 30, -130 - r(3) * 60, 0, 1.6 + r(4) * 1.4));
    if (r(5) < 0.8) {
      const cv = Math.floor(r(6) * 6);
      const cl = this.place(buildModel(`cloud${cv}`, cloudModel(cv)), x + r(7) * 40, -170 - r(8) * 60, 0, 3 + r(9) * 2);
      cl.position.y = 26 + r(10) * 22;
      cl.traverse((o) => ((o as THREE.Mesh).castShadow = false));
      out.push(cl);
    }
    return out;
  }
}

function bushModel() {
  return {
    clusters: [
      {
        name: 'bush',
        boxes: [
          { x: -8, y: 0, z: -4, w: 16, h: 7, d: 8, color: 0x4f9a46 },
          { x: -5, y: 7, z: -3, w: 10, h: 4, d: 6, color: 0x5fae52 },
        ],
      },
    ],
  };
}

function hash(seed: number) {
  return (n: number) => {
    let h = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(n + 0x632be5ab, 0xc2b2ae35);
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
    h ^= h >>> 13;
    return ((h >>> 0) % 100000) / 100000;
  };
}
