import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// ---------------------------------------------------------------------------
// The car interior: the real, smooth, grounded half of the game. It lives in
// its own scene in car-local coordinates (x forward, y up, z = car centre,
// the kid's window on the -z side) and is rendered on top of the world with a
// cleared depth buffer, so the world only ever shows through the window hole.
// ---------------------------------------------------------------------------

export const WINDOW = {
  z: -0.56,
  bottom: 0.45,
  top: 0.88,
  rearBottom: -0.4,
  rearTop: -0.22,
  front: 0.34,
  r: 0.045,
};

export const KID_HEAD = new THREE.Vector3(-0.14, 0.6, 0.03);
export const POV = new THREE.Vector3(-0.1, 0.585, 0.0);

function fabricTexture(base: string, speck: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = base;
  g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = Math.random() < 0.5 ? speck : 'rgba(255,255,255,0.05)';
    g.fillRect(Math.random() * 128, Math.random() * 128, 1, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 4);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function windowShape(expand = 0): THREE.Shape {
  const w = WINDOW;
  const r = w.r + expand;
  const b = w.bottom - expand, t = w.top + expand;
  const rb = w.rearBottom - expand, rt = w.rearTop - expand, f = w.front + expand;
  const s = new THREE.Shape();
  s.moveTo(rb + r, b);
  s.lineTo(f - r, b);
  s.quadraticCurveTo(f, b, f, b + r);
  s.lineTo(f, t - r);
  s.quadraticCurveTo(f, t, f - r, t);
  s.lineTo(rt + r, t);
  // slanted rear (C-pillar) edge
  s.quadraticCurveTo(rt, t, rt - r * 0.3, t - r);
  s.lineTo(rb + r * 0.2, b + r);
  s.quadraticCurveTo(rb, b, rb + r, b);
  return s;
}

/** x of the window's rear edge at height y (car-local), for zone glows. */
export function windowRearXAt(y: number) {
  const t = (y - WINDOW.bottom) / (WINDOW.top - WINDOW.bottom);
  return THREE.MathUtils.lerp(WINDOW.rearBottom, WINDOW.rearTop, THREE.MathUtils.clamp(t, 0, 1));
}

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export interface KidRig {
  root: THREE.Group;
  head: THREE.Group;
  torso: THREE.Group;
  shinL: THREE.Group;
  shinR: THREE.Group;
  armR: THREE.Group;
}

export class Interior {
  scene = new THREE.Scene();
  kid: KidRig;
  povHand: THREE.Group;
  glass: THREE.Mesh;
  glassCanvas: HTMLCanvasElement;
  glassCtx: CanvasRenderingContext2D;
  glassTex: THREE.CanvasTexture;
  rearGlow: THREE.Mesh;
  frontGlow: THREE.Mesh;
  sunPatch: THREE.SpotLight;
  windowLight: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  // glass state
  fog = 0;
  doodle = 0; // 0..1 how much of the hero doodle is drawn
  doodleFade = 1;
  reflection = 0.05;
  doodleAt = { x: 240, y: 230, scale: 0.6 }; // canvas px, set by the game to line up with the roadside
  private lastGlassKey = '';

  constructor() {
    const s = this.scene;
    const plastic = new THREE.MeshStandardMaterial({ color: 0x8e887e, roughness: 0.85 });
    const plasticDark = new THREE.MeshStandardMaterial({ color: 0x55565c, roughness: 0.7 });
    const fabric = new THREE.MeshStandardMaterial({ map: fabricTexture('#5d6676', 'rgba(0,0,0,0.18)'), roughness: 1 });
    const seatFabric = new THREE.MeshStandardMaterial({ map: fabricTexture('#4a5468', 'rgba(0,0,0,0.2)'), roughness: 1 });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x1d1e22, roughness: 0.9 });
    const headliner = new THREE.MeshStandardMaterial({ map: fabricTexture('#cfc9bd', 'rgba(0,0,0,0.06)'), roughness: 1 });
    const carpet = new THREE.MeshStandardMaterial({ map: fabricTexture('#3a3a40', 'rgba(0,0,0,0.3)'), roughness: 1 });

    // door / side wall with the window hole
    const wall = new THREE.Shape();
    wall.moveTo(-1.1, 0.05);
    wall.lineTo(0.95, 0.05);
    wall.lineTo(0.95, 1.06);
    wall.lineTo(-1.1, 1.06);
    wall.lineTo(-1.1, 0.05);
    wall.holes.push(windowShape(0.012));
    const wallGeo = new THREE.ExtrudeGeometry(wall, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, curveSegments: 10 });
    const wallMesh = mesh(wallGeo, plastic, 0, 0, WINDOW.z - 0.035);
    s.add(wallMesh);

    // rubber seal ring
    const seal = windowShape(0.03);
    seal.holes.push(windowShape(-0.002));
    s.add(mesh(new THREE.ExtrudeGeometry(seal, { depth: 0.02, bevelEnabled: false, curveSegments: 10 }), rubber, 0, 0, WINDOW.z + 0.012));

    // lower door fabric panel, armrest, cupholder + juice box, handle, speaker
    s.add(mesh(new RoundedBoxGeometry(1.2, 0.27, 0.03, 3, 0.012), fabric, -0.05, 0.2, WINDOW.z + 0.03));
    s.add(mesh(new RoundedBoxGeometry(0.52, 0.055, 0.1, 4, 0.02), plasticDark, 0.08, 0.37, WINDOW.z + 0.07));
    const cup = mesh(new THREE.CylinderGeometry(0.034, 0.03, 0.03, 20), rubber, 0.26, 0.39, WINDOW.z + 0.075);
    s.add(cup);
    const juice = new THREE.Group();
    juice.add(mesh(new RoundedBoxGeometry(0.045, 0.075, 0.03, 2, 0.006), new THREE.MeshStandardMaterial({ color: 0xf0a43a, roughness: 0.5 }), 0, 0.0375, 0));
    juice.add(mesh(new RoundedBoxGeometry(0.046, 0.03, 0.031, 2, 0.004), new THREE.MeshStandardMaterial({ color: 0x5cb85c, roughness: 0.5 }), 0, 0.045, 0));
    const straw = mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.06, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }), 0.012, 0.09, 0);
    straw.rotation.z = -0.4;
    juice.add(straw);
    juice.position.set(0.26, 0.385, WINDOW.z + 0.075);
    juice.rotation.y = 0.3;
    s.add(juice);
    s.add(mesh(new RoundedBoxGeometry(0.1, 0.03, 0.025, 3, 0.01), new THREE.MeshStandardMaterial({ color: 0xb8bcc2, metalness: 0.6, roughness: 0.3 }), -0.12, 0.43, WINDOW.z + 0.05));
    const spk = mesh(new THREE.CircleGeometry(0.07, 24), new THREE.MeshStandardMaterial({ color: 0x2a2b30, roughness: 1 }), -0.42, 0.17, WINDOW.z + 0.047);
    s.add(spk);

    // B-pillar (front edge of the window) and front seat back
    s.add(mesh(new RoundedBoxGeometry(0.13, 0.75, 0.06, 4, 0.025), plastic, WINDOW.front + 0.075, 0.68, WINDOW.z + 0.04));
    const seatBack = mesh(new RoundedBoxGeometry(0.14, 0.62, 0.5, 6, 0.05), seatFabric, 0.62, 0.55, -0.22);
    seatBack.rotation.z = 0.12;
    s.add(seatBack);
    s.add(mesh(new RoundedBoxGeometry(0.1, 0.16, 0.26, 6, 0.04), seatFabric, 0.6, 0.97, -0.22));

    // headliner, floor, rear bench
    const roof = mesh(new THREE.PlaneGeometry(3, 2), headliner, 0, 1.06, 0);
    roof.rotation.x = Math.PI / 2;
    s.add(roof);
    const floor = mesh(new THREE.PlaneGeometry(3, 2), carpet, 0, 0.06, 0);
    floor.rotation.x = -Math.PI / 2;
    s.add(floor);
    s.add(mesh(new RoundedBoxGeometry(0.62, 0.15, 1.1, 6, 0.05), seatFabric, -0.08, 0.22, 0));
    const bench = mesh(new RoundedBoxGeometry(0.14, 0.62, 1.1, 6, 0.05), seatFabric, -0.42, 0.58, 0);
    bench.rotation.z = -0.1;
    s.add(bench);
    // rear wall behind bench / C-pillar mass
    s.add(mesh(new RoundedBoxGeometry(0.2, 1.0, 1.2, 4, 0.05), plastic, -0.62, 0.55, 0));

    // seatbelt across the kid
    const belt = mesh(new THREE.BoxGeometry(0.035, 1, 0.006), new THREE.MeshStandardMaterial({ color: 0x2a2c33, roughness: 0.8 }), 0, 0, 0);
    const a = new THREE.Vector3(-0.36, 0.86, -0.42);
    const b = new THREE.Vector3(-0.08, 0.26, 0.16);
    belt.position.copy(a).add(b).multiplyScalar(0.5);
    belt.scale.y = a.distanceTo(b);
    belt.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    s.add(belt);

    // glass
    this.glassCanvas = document.createElement('canvas');
    this.glassCanvas.width = 512;
    this.glassCanvas.height = 320;
    this.glassCtx = this.glassCanvas.getContext('2d')!;
    this.glassTex = new THREE.CanvasTexture(this.glassCanvas);
    this.glassTex.colorSpace = THREE.SRGBColorSpace;
    const gGeo = new THREE.ShapeGeometry(windowShape(0.01), 12);
    const uv = gGeo.getAttribute('uv') as THREE.BufferAttribute;
    const pos = gGeo.getAttribute('position') as THREE.BufferAttribute;
    const x0 = WINDOW.rearBottom - 0.02, x1 = WINDOW.front + 0.02, y0 = WINDOW.bottom - 0.02, y1 = WINDOW.top + 0.02;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) - x0) / (x1 - x0), (pos.getY(i) - y0) / (y1 - y0));
    this.glass = mesh(gGeo, new THREE.MeshBasicMaterial({ map: this.glassTex, transparent: true, depthWrite: false }), 0, 0, WINDOW.z + 0.008);
    this.glass.renderOrder = 10;
    s.add(this.glass);

    // zone glows on the pillars (Falling Behind = warm rear glow, Leading = gold front glint)
    const glowGeo = new THREE.PlaneGeometry(0.05, 0.42);
    this.rearGlow = mesh(glowGeo, new THREE.MeshBasicMaterial({ color: 0xff7a3a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), 0, 0.665, WINDOW.z + 0.03);
    this.rearGlow.position.x = -0.33;
    this.rearGlow.rotation.z = -0.36;
    this.frontGlow = mesh(glowGeo, new THREE.MeshBasicMaterial({ color: 0xffd34a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), WINDOW.front + 0.012, 0.665, WINDOW.z + 0.03);
    this.rearGlow.renderOrder = this.frontGlow.renderOrder = 11;
    s.add(this.rearGlow, this.frontGlow);

    // lights
    this.hemi = new THREE.HemisphereLight(0xe6edf5, 0x4d463f, 1.0);
    s.add(this.hemi);
    this.windowLight = new THREE.DirectionalLight(0xfff1dc, 1.4);
    this.windowLight.position.set(0.3, 1.6, -2);
    s.add(this.windowLight);
    this.sunPatch = new THREE.SpotLight(0xffe2b0, 0, 4, 0.35, 0.8);
    this.sunPatch.position.set(0.0, 1.2, -1.2);
    this.sunPatch.target.position.set(0, 0.3, 0.2);
    s.add(this.sunPatch, this.sunPatch.target);
    const fill = new THREE.PointLight(0xffe7d0, 0.6, 3);
    fill.position.set(0.3, 0.9, 0.4);
    s.add(fill);

    this.kid = this.buildKid();
    s.add(this.kid.root);
    this.povHand = this.buildHand();
    this.povHand.visible = false;
    s.add(this.povHand);
    this.redrawGlass(true);
  }

  private buildKid(): KidRig {
    const skin = new THREE.MeshStandardMaterial({ color: 0xf0c49c, roughness: 0.65 });
    const hair = new THREE.MeshStandardMaterial({ color: 0x5b3b25, roughness: 0.8 });
    const hoodie = new THREE.MeshStandardMaterial({ color: 0xf2b54a, roughness: 0.9 });
    const jeans = new THREE.MeshStandardMaterial({ color: 0x4a6a9a, roughness: 0.9 });
    const shoe = new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.6 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x1d1a1a, roughness: 0.4 });
    const root = new THREE.Group();
    root.position.set(-0.24, 0.3, 0.03);

    const torso = new THREE.Group();
    root.add(torso);
    const body = mesh(new THREE.CapsuleGeometry(0.068, 0.12, 6, 14), hoodie, 0, 0.12, 0);
    body.scale.set(0.9, 1, 1.05);
    torso.add(body);
    const hood = mesh(new THREE.SphereGeometry(0.05, 14, 10), hoodie, -0.05, 0.25, 0);
    torso.add(hood);

    const head = new THREE.Group();
    head.position.set(0.1, 0.3, 0);
    torso.add(head);
    head.add(mesh(new THREE.SphereGeometry(0.065, 24, 18), skin, 0, 0, 0));
    const hairM = mesh(new THREE.SphereGeometry(0.069, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, -0.008, 0.008, 0);
    hairM.rotation.z = 0.35;
    head.add(hairM);
    head.add(mesh(new THREE.SphereGeometry(0.03, 10, 8), hair, -0.045, 0.02, 0.0));
    head.add(mesh(new THREE.SphereGeometry(0.012, 10, 8), skin, 0.064, -0.005, 0));
    head.add(mesh(new THREE.SphereGeometry(0.015, 10, 8), skin, -0.005, -0.002, 0.063));
    head.add(mesh(new THREE.SphereGeometry(0.015, 10, 8), skin, -0.005, -0.002, -0.063));
    head.add(mesh(new THREE.SphereGeometry(0.008, 8, 6), dark, 0.052, 0.012, 0.03));
    head.add(mesh(new THREE.SphereGeometry(0.008, 8, 6), dark, 0.052, 0.012, -0.03));

    // legs: thighs forward, shins hanging (they swing when bored)
    const legs: THREE.Group[] = [];
    for (const side of [-1, 1]) {
      const thigh = mesh(new THREE.CapsuleGeometry(0.035, 0.12, 4, 10), jeans, 0.08, 0.0, side * 0.045);
      thigh.rotation.z = Math.PI / 2;
      root.add(thigh);
      const shin = new THREE.Group();
      shin.position.set(0.16, -0.0, side * 0.045);
      shin.add(mesh(new THREE.CapsuleGeometry(0.03, 0.1, 4, 10), jeans, 0, -0.07, 0));
      shin.add(mesh(new RoundedBoxGeometry(0.08, 0.04, 0.05, 3, 0.015), shoe, 0.02, -0.15, 0));
      root.add(shin);
      legs.push(shin);
    }
    const armR = new THREE.Group();
    armR.position.set(0.02, 0.2, 0.08);
    const arm = mesh(new THREE.CapsuleGeometry(0.026, 0.12, 4, 10), hoodie, 0.04, -0.06, 0);
    arm.rotation.z = 0.9;
    armR.add(arm);
    armR.add(mesh(new THREE.SphereGeometry(0.025, 10, 8), skin, 0.1, -0.1, 0));
    torso.add(armR);
    const armL = armR.clone();
    armL.position.z = -0.08;
    torso.add(armL);
    return { root, head, torso, shinL: legs[0], shinR: legs[1], armR };
  }

  private buildHand(): THREE.Group {
    const skin = new THREE.MeshStandardMaterial({ color: 0xf0c49c, roughness: 0.65 });
    const sleeve = new THREE.MeshStandardMaterial({ color: 0xf2b54a, roughness: 0.9 });
    const g = new THREE.Group();
    const palm = mesh(new RoundedBoxGeometry(0.05, 0.06, 0.025, 3, 0.012), skin, 0, -0.05, 0);
    g.add(palm);
    const finger = mesh(new THREE.CapsuleGeometry(0.008, 0.035, 4, 8), skin, 0.0, 0.0, -0.005);
    g.add(finger);
    for (const dx of [-0.016, 0.016]) {
      const f = mesh(new THREE.CapsuleGeometry(0.008, 0.02, 4, 8), skin, dx, -0.02, 0.008);
      f.rotation.x = 1.2;
      g.add(f);
    }
    const arm = mesh(new THREE.CapsuleGeometry(0.03, 0.2, 4, 10), sleeve, 0, -0.2, 0.04);
    arm.rotation.x = 0.3;
    g.add(arm);
    return g;
  }

  /** Repaint the glass canvas (reflection, smudges, tint band, fog, doodle). */
  redrawGlass(force = false) {
    const key = `${this.fog.toFixed(2)}|${this.doodle.toFixed(2)}|${this.doodleFade.toFixed(2)}|${this.reflection.toFixed(2)}`;
    if (!force && key === this.lastGlassKey) return;
    this.lastGlassKey = key;
    const g = this.glassCtx;
    const W = this.glassCanvas.width, H = this.glassCanvas.height;
    g.clearRect(0, 0, W, H);
    // tint band along the top
    const band = g.createLinearGradient(0, 0, 0, H * 0.22);
    band.addColorStop(0, 'rgba(40,70,90,0.35)');
    band.addColorStop(1, 'rgba(40,70,90,0)');
    g.fillStyle = band;
    g.fillRect(0, 0, W, H * 0.22);
    // faint reflection of the kid's face
    const r = this.reflection;
    if (r > 0.001) {
      g.save();
      g.globalAlpha = r;
      const cx = W * 0.42, cy = H * 0.5;
      const face = g.createRadialGradient(cx, cy, 10, cx, cy, 90);
      face.addColorStop(0, 'rgba(255,230,205,0.9)');
      face.addColorStop(1, 'rgba(255,230,205,0)');
      g.fillStyle = face;
      g.beginPath();
      g.ellipse(cx, cy, 70, 85, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(70,45,30,0.8)';
      g.beginPath();
      g.ellipse(cx, cy - 45, 78, 48, 0, Math.PI, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(30,25,25,0.7)';
      g.beginPath();
      g.arc(cx - 22, cy - 2, 5, 0, Math.PI * 2);
      g.arc(cx + 22, cy - 2, 5, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
    // smudges
    g.fillStyle = 'rgba(255,255,255,0.025)';
    for (const [x, y, rr] of [[60, 250, 10], [430, 80, 8]] as const) {
      g.beginPath();
      g.arc(x, y, rr, 0, Math.PI * 2);
      g.fill();
    }
    // star sticker in the corner
    g.save();
    g.translate(W * 0.9, H * 0.86);
    g.rotate(0.2);
    g.fillStyle = 'rgba(255,214,74,0.92)';
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 2 ? 7 : 16;
      g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    g.closePath();
    g.fill();
    g.restore();
    // breath fog: the window clouds up when the kid gets bored (and for drawing)
    if (this.fog > 0.001) {
      const fg = g.createRadialGradient(W * 0.5, H * 0.6, 20, W * 0.5, H * 0.6, W * 0.6);
      fg.addColorStop(0, `rgba(235,240,245,${0.75 * this.fog})`);
      fg.addColorStop(1, `rgba(235,240,245,${0.25 * this.fog})`);
      g.fillStyle = fg;
      g.fillRect(0, 0, W, H);
    }
    // the doodle hero, finger-drawn in the fog
    if (this.doodle > 0 && this.doodleFade > 0) {
      g.save();
      g.globalAlpha = this.doodleFade;
      g.strokeStyle = 'rgba(255,255,255,0.95)';
      g.lineWidth = 5;
      g.lineCap = 'round';
      const p = this.doodle;
      const cx = this.doodleAt.x, base = this.doodleAt.y;
      g.translate(cx, base);
      g.scale(this.doodleAt.scale, this.doodleAt.scale);
      g.translate(-cx, -base);
      const seg = (t0: number, t1: number, fn: (k: number) => void) => {
        if (p <= t0) return;
        fn(Math.min(1, (p - t0) / (t1 - t0)));
      };
      seg(0, 0.25, (k) => { g.beginPath(); g.arc(cx, base - 62, 12, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); g.stroke(); });
      seg(0.25, 0.4, (k) => { g.beginPath(); g.moveTo(cx, base - 50); g.lineTo(cx, base - 50 + 26 * k); g.stroke(); });
      seg(0.4, 0.55, (k) => { g.beginPath(); g.moveTo(cx, base - 24); g.lineTo(cx - 10 * k, base - 24 + 22 * k); g.moveTo(cx, base - 24); g.lineTo(cx + 12 * k, base - 24 + 22 * k); g.stroke(); });
      seg(0.55, 0.7, (k) => { g.beginPath(); g.moveTo(cx - 14 * k, base - 44 + 6 * k); g.lineTo(cx, base - 42); g.lineTo(cx + 16 * k, base - 46 - 8 * k); g.stroke(); });
      seg(0.7, 1.0, (k) => {
        g.strokeStyle = 'rgba(255,120,110,0.95)';
        g.beginPath();
        g.moveTo(cx - 4, base - 52);
        for (let i = 0; i <= 10 * k; i++) g.lineTo(cx - 4 - i * 4, base - 52 + Math.sin(i * 0.9) * 4 + i * 0.5);
        g.stroke();
      });
      g.restore();
    }
    this.glassTex.needsUpdate = true;
  }
}
