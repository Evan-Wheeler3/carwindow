import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { VOXEL } from './config';

// ---------------------------------------------------------------------------
// Voxel models are built from solid boxes measured in voxels. Each box face gets
// UVs repeated once per voxel, so a single bevel tile texture makes every box
// read as a stack of chunky toy cubes without generating per-voxel geometry.
// ---------------------------------------------------------------------------

export interface VBox {
  // position of the box's min corner and size, all in voxels
  x: number; y: number; z: number;
  w: number; h: number; d: number;
  color: number;
}

export interface VCluster {
  name: string;
  boxes: VBox[];
}

export interface VModel {
  clusters: VCluster[];
}

// Shared Wonder uniforms, patched into every exterior material.
export const wonderUniforms = {
  uFrom: { value: 0 }, // previous visual level (0..3)
  uTo: { value: 0 }, // target visual level (0..3)
  uWaveCenter: { value: new THREE.Vector3() },
  uWaveRadius: { value: 1e4 },
  uTime: { value: 0 },
};

function makeBevelTexture(): THREE.CanvasTexture {
  const s = 32;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  g.fillStyle = '#f2f2f2';
  g.fillRect(0, 0, s, s);
  // soft inner gradient for a slightly domed face
  const grad = g.createRadialGradient(s * 0.4, s * 0.4, 2, s / 2, s / 2, s * 0.75);
  grad.addColorStop(0, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(0,0,0,0.06)');
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  // highlight top/left edges, shade bottom/right edges
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.fillRect(0, 0, s, 2);
  g.fillRect(0, 0, 2, s);
  g.fillStyle = 'rgba(0,0,0,0.28)';
  g.fillRect(0, s - 3, s, 3);
  g.fillRect(s - 3, 0, 3, s);
  g.fillStyle = 'rgba(0,0,0,0.12)';
  g.fillRect(0, s - 1, s, 1);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.anisotropy = 4;
  return t;
}

export const bevelTexture = makeBevelTexture();

/** Patch a material so its colour responds to Wonder (saturation, warmth). */
export function patchWonder(mat: THREE.Material, opts: { hero?: boolean } = {}) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, wonderUniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        {
          vec4 wp = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            wp = instanceMatrix * wp;
          #endif
          vWPos = (modelMatrix * wp).xyz;
        }`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vWPos;
        uniform float uFrom; uniform float uTo; uniform vec3 uWaveCenter; uniform float uWaveRadius;
        vec3 wonderGrade(vec3 c, float lv) {
          float t = clamp(lv / 3.0, 0.0, 1.0);
          float l = dot(c, vec3(0.299, 0.587, 0.114));
          ${opts.hero
            ? `// tier 0 hero is a pale doodle; colour floods in with Wonder
          float sat = 0.45 + smoothstep(0.0, 1.0, lv) * 0.7;
          vec3 pale = mix(vec3(0.95, 0.94, 0.9), vec3(l), 0.35);
          c = mix(pale, c, clamp(sat, 0.0, 1.15));`
            : `float sat = mix(0.32, 1.28, t);
          c = mix(vec3(l), c, sat);
          c *= mix(vec3(0.86, 0.88, 0.92), vec3(1.08, 1.03, 0.96), t);`}
          return c;
        }`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        {
          float dw = distance(vWPos, uWaveCenter);
          float edge = smoothstep(uWaveRadius - 1.5, uWaveRadius, dw);
          float lv = mix(uTo, uFrom, edge);
          diffuseColor.rgb = wonderGrade(diffuseColor.rgb, lv);
          // a thin bright band rides the imagination wave
          float band = (1.0 - smoothstep(0.0, 1.2, abs(dw - uWaveRadius))) * step(uWaveRadius, 900.0);
          diffuseColor.rgb += band * 0.25 * vec3(1.0, 0.85, 0.5) * step(uFrom, uTo);
        }`,
      );
  };
  mat.customProgramCacheKey = () => (opts.hero ? 'wonder-hero' : 'wonder');
}

export const voxelMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  map: bevelTexture,
  roughness: 0.82,
  metalness: 0.0,
});
patchWonder(voxelMaterial);

export const heroMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  map: bevelTexture,
  roughness: 0.7,
});
patchWonder(heroMaterial, { hero: true });

export const glowMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  map: bevelTexture,
  roughness: 0.5,
  emissive: new THREE.Color(0xffd27a),
  emissiveIntensity: 0.55,
  transparent: true,
  opacity: 1,
});

const tmpColor = new THREE.Color();

/** Build one box's geometry with per-voxel UV repeats and a flat vertex colour. */
export function boxGeometry(b: VBox, jitter = 0): THREE.BufferGeometry {
  const w = b.w * VOXEL, h = b.h * VOXEL, d = b.d * VOXEL;
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate((b.x + b.w / 2) * VOXEL, (b.y + b.h / 2) * VOXEL, (b.z + b.d / 2) * VOXEL);
  // BoxGeometry face order: +x, -x, +y, -y, +z, -z (4 verts each)
  const uv = g.getAttribute('uv') as THREE.BufferAttribute;
  const reps: [number, number][] = [
    [b.d, b.h], [b.d, b.h], [b.w, b.d], [b.w, b.d], [b.w, b.h], [b.w, b.h],
  ];
  for (let f = 0; f < 6; f++) {
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      uv.setXY(i, uv.getX(i) * reps[f][0], uv.getY(i) * reps[f][1]);
    }
  }
  tmpColor.setHex(b.color);
  if (jitter) tmpColor.offsetHSL(0, 0, (Math.random() - 0.5) * jitter);
  const n = g.getAttribute('position').count;
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    // subtle per-face shading keeps silhouettes crisp even in flat light
    const face = Math.floor(i / 4);
    const shade = face === 2 ? 1.0 : face === 3 ? 0.7 : face === 4 ? 0.95 : 0.88;
    col[i * 3] = tmpColor.r * shade;
    col[i * 3 + 1] = tmpColor.g * shade;
    col[i * 3 + 2] = tmpColor.b * shade;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

export function clusterGeometry(boxes: VBox[], jitter = 0): THREE.BufferGeometry {
  const geos = boxes.map((b) => boxGeometry(b, jitter));
  const merged = mergeGeometries(geos, false)!;
  geos.forEach((g) => g.dispose());
  return merged;
}

/** Weighted colour list (by volume) used to colour debris cubes. */
export function sprayColors(boxes: VBox[]): number[] {
  const out: number[] = [];
  for (const b of boxes) {
    const vol = b.w * b.h * b.d;
    const n = Math.max(1, Math.min(8, Math.round(Math.sqrt(vol) / 2)));
    for (let i = 0; i < n; i++) out.push(b.color);
  }
  return out;
}

/** Axis-aligned bounds of a set of boxes, in world units. */
export function boxesBounds(boxes: VBox[]): THREE.Box3 {
  const bb = new THREE.Box3();
  for (const b of boxes) {
    bb.expandByPoint(new THREE.Vector3(b.x * VOXEL, b.y * VOXEL, b.z * VOXEL));
    bb.expandByPoint(new THREE.Vector3((b.x + b.w) * VOXEL, (b.y + b.h) * VOXEL, (b.z + b.d) * VOXEL));
  }
  return bb;
}

// Small helper for writing models: box centred on x/z, sitting on y.
export function cbox(cx: number, y: number, cz: number, w: number, h: number, d: number, color: number): VBox {
  return { x: cx - w / 2, y, z: cz - d / 2, w, h, d, color };
}
