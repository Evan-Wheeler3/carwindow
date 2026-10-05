import * as THREE from 'three';
import { VModel, VBox, cbox, clusterGeometry, voxelMaterial, heroMaterial, glowMaterial } from './voxel';
import { VOXEL } from './config';

// ---------------------------------------------------------------------------
// Voxel model definitions. Everything is measured in voxels (1/12 hero height),
// built around x = 0 (the object's centre along the road), z = 0 (the run line),
// sitting on y = 0. Clusters are the pieces an object breaks into.
// ---------------------------------------------------------------------------

export const PAL = {
  wood: 0x8a5a32,
  woodDark: 0x6b4426,
  poleWood: 0x7a5230,
  leaf1: 0x4fa84a,
  leaf2: 0x3c8f3f,
  leaf3: 0x72c95c,
  white: 0xf3efe6,
  metal: 0x9aa3ad,
  metalDark: 0x5d646d,
  signGreen: 0x2f8f5b,
  signYellow: 0xf2c230,
  mailBlue: 0x3d6fd6,
  concrete: 0xb5b3aa,
  concreteDark: 0x8f8d86,
  glassGreen: 0x9fd6b0,
  tire: 0x2b2b30,
  window: 0xbfe3f2,
  skin: 0xf1c7a0,
  heroBody: 0x2e5f8a,
  heroHood: 0x24476b,
  heroRed: 0xe0362c,
  heroPants: 0x3a3f4f,
  shoe: 0xf4f1ea,
  cardboard: 0xc9a06a,
  gold: 0xffc94a,
};

export const CAR_COLORS = [0x4aa3df, 0xf2c230, 0x7bc96f, 0xe8e2d0, 0x9b7fd1, 0xf08a4b, 0x58c4b8];

const geoCache = new Map<string, THREE.BufferGeometry[]>();

/** Build (and cache) one mesh per cluster, grouped. */
export function buildModel(key: string, model: VModel, material: THREE.Material = voxelMaterial): THREE.Group {
  let geos = geoCache.get(key);
  if (!geos) {
    geos = model.clusters.map((c) => clusterGeometry(c.boxes));
    geoCache.set(key, geos);
  }
  const g = new THREE.Group();
  geos.forEach((geo, i) => {
    const m = new THREE.Mesh(geo, material);
    m.name = model.clusters[i].name;
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  });
  return g;
}

// --- props -----------------------------------------------------------------

export function mailboxModel(): VModel {
  return {
    clusters: [
      { name: 'post', boxes: [cbox(0, 0, 0, 2, 8, 2, PAL.wood)] },
      {
        name: 'box',
        boxes: [
          cbox(0, 8, 0, 6, 4, 4, PAL.mailBlue),
          cbox(0, 12, 0, 6, 1, 3, PAL.mailBlue),
          cbox(2.5, 10, 2.5, 1, 4, 1, PAL.signYellow),
        ],
      },
    ],
  };
}

export const POLE_SOCKETS = [12, 30, 48]; // cut heights in voxels
export const POLE_WIRE_Y = 61 / 12; // grind wire sits on the top insulator

export function poleModel(): VModel {
  return {
    clusters: [
      { name: 's0', boxes: [cbox(0, 0, 0, 3, 12, 3, PAL.poleWood)] },
      { name: 's1', boxes: [cbox(0, 12, 0, 3, 18, 3, PAL.poleWood)] },
      { name: 's2', boxes: [cbox(0, 30, 0, 3, 18, 3, PAL.woodDark)] },
      {
        name: 's3',
        boxes: [
          cbox(0, 48, 0, 3, 12, 3, PAL.poleWood),
          cbox(0, 52, 0, 2, 2, 14, PAL.woodDark),
          cbox(0, 54, -5, 1, 2, 1, PAL.glassGreen),
          cbox(0, 54, 5, 1, 2, 1, PAL.glassGreen),
          cbox(0, 60, 0, 1, 1, 1, PAL.glassGreen),
        ],
      },
    ],
  };
}

export const TREE_SOCKETS = [8];

export function treeModel(variant: number): VModel {
  const s = variant % 3;
  const top = 26 + s * 4;
  return {
    clusters: [
      { name: 's0', boxes: [cbox(0, 0, 0, 4, 8, 4, PAL.woodDark)] },
      { name: 's1', boxes: [cbox(0, 8, 0, 4, top - 8 + 4, 4, PAL.woodDark)] },
      { name: 'leafA', boxes: [cbox(0, top, 0, 18 + s * 2, 12, 14, PAL.leaf2)] },
      { name: 'leafB', boxes: [cbox(-2, top + 12, 0, 14, 9, 12, PAL.leaf1), cbox(5, top + 6, 3, 8, 8, 10, PAL.leaf3)] },
      { name: 'leafC', boxes: [cbox(1, top + 21, -1, 8, 6, 8, PAL.leaf3)] },
    ],
  };
}

export function signModel(variant: number): VModel {
  if (variant % 2 === 0) {
    return {
      clusters: [
        { name: 'post', boxes: [cbox(0, 0, 0, 2, 24, 2, PAL.metal)] },
        {
          name: 'plate',
          boxes: [cbox(0, 21, 1.5, 16, 5, 1, PAL.signGreen), cbox(0, 22, 2.2, 12, 1, 0.4, PAL.white), cbox(-2, 24, 2.2, 6, 1, 0.4, PAL.white)],
        },
      ],
    };
  }
  return {
    clusters: [
      { name: 'post', boxes: [cbox(0, 0, 0, 2, 17, 2, PAL.metal)] },
      {
        name: 'plate',
        boxes: [
          cbox(0, 15, 1.5, 9, 11, 1, PAL.white),
          cbox(0, 22, 2.2, 7, 1, 0.4, 0x333333),
          cbox(0, 17, 2.2, 3, 3, 0.4, 0x333333),
        ],
      },
    ],
  };
}

export function fenceModel(): VModel {
  // one 12-voxel (1 H) wide segment: two halves
  const half = (side: number): VBox[] => {
    const xs = side < 0 ? [-5, -2] : [1, 4];
    return [
      ...xs.map((x) => cbox(x, 0, 0, 2, 9, 1, PAL.white)),
      cbox(side * 3, 2, -0.8, 6, 1, 0.6, PAL.white),
      cbox(side * 3, 6, -0.8, 6, 1, 0.6, PAL.white),
    ];
  };
  return { clusters: [{ name: 'l', boxes: half(-1) }, { name: 'r', boxes: half(1) }] };
}

export function barrierModel(): VModel {
  return {
    clusters: [
      {
        name: 'body',
        boxes: [cbox(0, 0, 0, 24, 3, 8, PAL.concrete), cbox(0, 3, 0, 24, 4, 5, PAL.concrete), cbox(0, 7, 0, 24, 2, 3, PAL.concreteDark)],
      },
    ],
  };
}

export function carModel(color: number): VModel {
  return {
    clusters: [
      {
        name: 'body',
        boxes: [
          cbox(0, 2, 0, 36, 7, 16, color),
          cbox(-1, 9, 0, 20, 6, 14, color),
          cbox(-1, 10, 7.2, 8, 4, 0.6, PAL.window),
          cbox(-8, 10, 7.2, 4, 4, 0.6, PAL.window),
          cbox(6, 10, 7.2, 5, 4, 0.6, PAL.window),
          cbox(17.8, 5, 5, 0.6, 2, 3, 0xfff6c8),
          cbox(-17.8, 5, 5, 0.6, 2, 3, 0xd94b4b),
          cbox(11, 0, 0, 6, 6, 17, PAL.tire),
          cbox(-11, 0, 0, 6, 6, 17, PAL.tire),
          cbox(11, 2, 8.6, 2, 2, 0.4, PAL.metal),
          cbox(-11, 2, 8.6, 2, 2, 0.4, PAL.metal),
        ],
      },
    ],
  };
}

export function reflectorModel(): VModel {
  return { clusters: [{ name: 'p', boxes: [cbox(0, 0, 0, 2, 9, 2, PAL.white), cbox(0, 9, 0, 2, 2, 2, 0xf08a1c)] }] };
}

export function houseModel(variant: number): VModel {
  const walls = [0xf4d9a6, 0xbfd8e8, 0xf1b9a6, 0xd8e6b8, 0xe9e1f5][variant % 5];
  const roof = [0xb8524a, 0x56607a, 0x7a5a48, 0x4f7a5a][variant % 4];
  const w = 44 + (variant % 3) * 8;
  const boxes: VBox[] = [cbox(0, 0, 0, w, 30, 36, walls)];
  for (let i = 0; i < 6; i++) boxes.push(cbox(0, 30 + i * 3, 0, w + 4 - i * 0, 3, 38 - i * 7, roof));
  boxes.push(cbox(-w / 4, 0, 18.3, 7, 14, 0.6, 0x7a4a2a));
  boxes.push(cbox(w / 6, 14, 18.3, 9, 8, 0.6, PAL.window));
  boxes.push(cbox(-w / 4, 18, 18.3, 6, 6, 0.6, PAL.window));
  return { clusters: [{ name: 'house', boxes }] };
}

export function storeModel(): VModel {
  return {
    clusters: [
      {
        name: 'store',
        boxes: [
          cbox(0, 0, 0, 200, 54, 60, 0xe8e0cf),
          cbox(0, 54, 0, 204, 4, 62, 0xc94f45),
          cbox(0, 40, 30.5, 90, 12, 1, 0x2f8f5b),
          cbox(-30, 43, 31.3, 8, 6, 0.5, PAL.white),
          cbox(-12, 43, 31.3, 8, 6, 0.5, PAL.white),
          cbox(6, 43, 31.3, 8, 6, 0.5, PAL.white),
          cbox(24, 43, 31.3, 8, 6, 0.5, PAL.white),
          cbox(0, 0, 30.5, 40, 26, 1, PAL.window),
          cbox(-60, 6, 30.5, 30, 18, 1, PAL.window),
          cbox(60, 6, 30.5, 30, 18, 1, PAL.window),
        ],
      },
    ],
  };
}

export function trafficLightModel(): VModel {
  return {
    clusters: [
      {
        name: 'pole',
        boxes: [cbox(0, 0, 0, 3, 62, 3, PAL.metalDark), cbox(0, 60, 14, 2, 2, 28, PAL.metalDark), cbox(0, 46, 26, 5, 14, 4, 0x2c2f36)],
      },
    ],
  };
}

export function platformModel(len: number): VModel {
  return {
    clusters: [
      {
        name: 'plat',
        boxes: [cbox(0, 0, 0, len, 2, 8, PAL.gold), cbox(0, 2, 0, len - 2, 1, 6, 0xffe9a8), cbox(0, -2, 0, len - 6, 2, 5, 0xf4a83a)],
      },
    ],
  };
}

export function cloudModel(variant: number): VModel {
  const r = (n: number) => ((variant * 9301 + n * 49297) % 233280) / 233280;
  const boxes: VBox[] = [];
  const n = 4 + Math.floor(r(1) * 3);
  for (let i = 0; i < n; i++) {
    boxes.push(cbox((i - n / 2) * 7 + r(i + 2) * 4, r(i + 7) * 4, r(i + 11) * 4, 9 + r(i + 3) * 8, 5 + r(i + 4) * 6, 8 + r(i + 5) * 6, 0xffffff));
  }
  return { clusters: [{ name: 'cloud', boxes }] };
}

export function hillModel(variant: number): VModel {
  const c = [0x6fb35f, 0x5ea353, 0x84c26a, 0x7aa95c][variant % 4];
  const boxes: VBox[] = [];
  const steps = 5 + (variant % 3);
  for (let i = 0; i < steps; i++) boxes.push(cbox(0, i * 6, 0, 120 - i * 18, 6, 40 - i * 4, c));
  return { clusters: [{ name: 'hill', boxes }] };
}

// --- hero --------------------------------------------------------------------

export interface HeroRig {
  root: THREE.Group; // positioned at the hero's feet
  body: THREE.Group; // squash/stretch + flips
  torso: THREE.Object3D;
  head: THREE.Object3D;
  legL: THREE.Object3D;
  legR: THREE.Object3D;
  armL: THREE.Object3D;
  armR: THREE.Object3D;
  sword: THREE.Mesh;
  swordMat: THREE.MeshStandardMaterial;
  scarf: THREE.Mesh[];
  smear: THREE.Mesh;
}

function part(boxes: VBox[], pivot: [number, number, number], mat: THREE.Material = heroMaterial) {
  const pivotObj = new THREE.Group();
  pivotObj.position.set(pivot[0] * VOXEL, pivot[1] * VOXEL, pivot[2] * VOXEL);
  const geo = clusterGeometry(boxes);
  geo.translate(-pivot[0] * VOXEL, -pivot[1] * VOXEL, -pivot[2] * VOXEL);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  pivotObj.add(m);
  return pivotObj;
}

export function buildHero(): HeroRig {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  // The hero faces +x; the camera sees his right side (+z).
  const legL = part([cbox(0, 1, -1.2, 2, 4, 2, PAL.heroPants), cbox(0.6, 0, -1.2, 3, 1.4, 2.2, PAL.shoe)], [0, 5, -1.2]);
  const legR = part([cbox(0, 1, 1.2, 2, 4, 2, PAL.heroPants), cbox(0.6, 0, 1.2, 3, 1.4, 2.2, PAL.shoe)], [0, 5, 1.2]);
  const torso = part([cbox(0, 5, 0, 4, 4, 4.4, PAL.heroBody), cbox(0, 4.6, 0, 4.2, 1, 4.6, PAL.heroPants)], [0, 5, 0]);
  const head = part(
    [
      cbox(-0.2, 9, 0, 4.4, 4, 4.4, PAL.heroHood),
      cbox(1.6, 9.6, 0, 1.4, 2.6, 3.2, PAL.skin),
      cbox(2.35, 10.9, 0.8, 0.3, 0.9, 0.6, 0x1b1b22),
      cbox(2.35, 10.9, -0.8, 0.3, 0.9, 0.6, 0x1b1b22),
      cbox(2.2, 11.9, 0, 0.6, 0.4, 2.4, PAL.heroHood),
      cbox(-1.2, 13, 0, 1.5, 1, 1.5, PAL.heroHood),
    ],
    [0, 9, 0],
  );
  const armL = part([cbox(0, 5.5, -2.9, 1.6, 3.4, 1.6, PAL.heroBody), cbox(0, 4.4, -2.9, 1.8, 1.4, 1.8, PAL.skin)], [0, 8.6, -2.9]);
  const armR = part([cbox(0, 5.5, 2.9, 1.6, 3.4, 1.6, PAL.heroBody), cbox(0, 4.4, 2.9, 1.8, 1.4, 1.8, PAL.skin)], [0, 8.6, 2.9]);
  const swordMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.6,
    emissive: new THREE.Color(0x9fe8ff),
    emissiveIntensity: 0,
  });
  const swordGeo = clusterGeometry([cbox(0, 0, 0, 1, 10, 1, 0xffffff), cbox(0, -0.5, 0, 3, 0.8, 1.2, PAL.woodDark), cbox(0, -2.2, 0, 0.9, 1.7, 0.9, PAL.woodDark)]);
  const sword = new THREE.Mesh(swordGeo, swordMat);
  sword.castShadow = true;
  sword.position.set(0.1 * VOXEL * 12, 4.6 * VOXEL - 8.6 * VOXEL, 0.4 * VOXEL);
  sword.rotation.z = -1.2;
  armR.add(sword);

  // arrangement
  [legL, legR, torso, armL, armR].forEach((p) => body.add(p));
  torso.add(head);
  head.position.set(0, (9 - 5) * VOXEL, 0);
  // re-parent arms to torso for upper-body motion
  torso.add(armL, armR);
  armL.position.set(0, (8.6 - 5) * VOXEL, -2.9 * VOXEL);
  armR.position.set(0, (8.6 - 5) * VOXEL, 2.9 * VOXEL);

  // scarf: chain of red voxels, simulated in world space by the hero controller
  const scarf: THREE.Mesh[] = [];
  const scarfGeo = clusterGeometry([cbox(0, -0.9, 0, 1.8, 1.8, 1.8, PAL.heroRed)]);
  for (let i = 0; i < 9; i++) {
    const s = new THREE.Mesh(scarfGeo, heroMaterial);
    s.castShadow = true;
    scarf.push(s);
  }

  // slash smear: a flat bright arc
  const smearGeo = new THREE.RingGeometry(0.75, 1.45, 18, 1, -Math.PI * 0.42, Math.PI * 0.9);
  const smear = new THREE.Mesh(
    smearGeo,
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
  );
  smear.position.set(0.35, 0.7, 0.35);
  root.add(smear);

  return { root, body, torso, head, legL, legR, armL, armR, sword, swordMat, scarf, smear };
}

export function setSwordLook(rig: HeroRig, tier: number) {
  const c = tier < 1 ? 0xbcbcbc : tier < 2 ? PAL.cardboard : tier < 3 ? 0xd9c08a : 0xdff7ff;
  rig.swordMat.color.setHex(c);
  rig.swordMat.emissiveIntensity = tier >= 3 ? 1.4 : 0;
}

export { glowMaterial };
