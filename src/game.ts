import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { HorizontalTiltShiftShader } from 'three/examples/jsm/shaders/HorizontalTiltShiftShader.js';
import { VerticalTiltShiftShader } from 'three/examples/jsm/shaders/VerticalTiltShiftShader.js';

import { FRAME, WONDER, WORLD } from './config';
import { wonderUniforms } from './voxel';
import { setSwordLook, PAL } from './models';
import { Interior, POV, WINDOW, windowRearXAt } from './interior';
import { Environment } from './environment';
import { CubeSpray, ChunkSim } from './debris';
import {
  Entity, Prop, FenceRun, Toppler, Pole, Barrier, Vehicle, ImaginedPlatform, TrafficLight, Store, WireSystem, WorldCtx, HitKind,
} from './entities';
import { Hero, HeroEnv, Verb } from './hero';
import { ScoreState } from './score';
import { GameAudio } from './audio';
import { UI } from './ui';
import { Input } from './input';
import { buildErrand, zoneAt, TripDef, Item } from './trip';
import { makeBot } from './bot';

type State = 'title' | 'turning' | 'birth' | 'play' | 'arrival' | 'results' | 'bored';
type CarState = 'cruise' | 'brake' | 'stopped';

const RUNZ = WORLD.runLineZ;
const STEP = 1 / 60;

const SIDE_POS = new THREE.Vector3(0.2, 0.67, 0.66);
const SIDE_LOOK = new THREE.Vector3(-0.05, 0.63, -0.56);
const SHOULDER_POS = new THREE.Vector3(0.02, 0.74, 0.32);
const BASE_PITCH = 0.13;

const ease = (t: number) => t * t * (3 - 2 * t);
const sstep = (a: number, b: number, x: number) => ease(THREE.MathUtils.clamp((x - a) / (b - a), 0, 1));

export class Game {
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
  world = new THREE.Scene();
  worldCam: THREE.PerspectiveCamera;
  interiorCam: THREE.PerspectiveCamera;
  carRig = new THREE.Group();
  hTilt: ShaderPass;
  vTilt: ShaderPass;
  interior: Interior;
  env: Environment;
  spray: CubeSpray;
  chunks: ChunkSim;
  wires: WireSystem;
  hero: Hero;
  score = new ScoreState();
  audio = new GameAudio();
  ui = new UI();
  input: Input;
  trip: TripDef = buildErrand();

  state: State = 'title';
  stateT = 0;
  quick = false;
  paused = false;

  // car
  carX = -300;
  carSpeed = 4.5;
  carState: CarState = 'cruise';
  stopTarget = 0;
  waitT = 0;
  stopsDone = new Set<number>();
  arrived = false;

  // trip
  origin = 0;
  entities: Entity[] = [];
  statics: Item[] = [];
  vehicles: Item[] = [];
  nextStatic = 0;
  nextVehicle = 0;
  trafficLight: TrafficLight | null = null;

  // frame geometry (relative to car x, at the run line)
  rearX = -8;
  frontX = 8;

  // camera
  headPos = POV.clone();
  headQuat = new THREE.Quaternion();
  yaw = 0;
  pitch = BASE_PITCH;
  bumpY = 0;
  bumpV = 0;
  nextBump = 3;
  trauma = 0;
  tiltR = 4;

  // wonder visuals
  level = 0;
  waveRadius = 1e4;
  hitstop = 0;
  acc = 0;
  lastVerb = '';
  headsUpCd = 0;
  hintsShown = new Set<string>();
  hintT = 0;
  controlsT = 0;
  trailT = 0;
  arrivalT = 0;
  flourished = false;
  tierSeen = 0;
  private winRect = { x: 0, y: 0, w: 1, h: 1 };
  private heroEnv: HeroEnv;
  private bot = new URLSearchParams(location.search).has('autoplay');
  debug = new URLSearchParams(location.search).has('debug');
  frameTimes: number[] = [];

  constructor(container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    container.appendChild(this.renderer.domElement);

    this.worldCam = new THREE.PerspectiveCamera(52, 1, 0.3, 900);
    this.interiorCam = new THREE.PerspectiveCamera(52, 1, 0.01, 10);
    this.world.add(this.carRig);
    this.carRig.add(this.worldCam);

    this.interior = new Interior();
    this.env = new Environment(this.world);
    this.env.biomeAt = (x) => zoneAt(this.trip, x - this.origin).biome;
    this.spray = new CubeSpray(this.world);
    this.chunks = new ChunkSim(this.world);
    this.wires = new WireSystem(this.world, () => this.poles());
    this.hero = new Hero(this.world);
    this.hero.setVisible(false);
    this.input = new Input(this.renderer.domElement);
    if (this.bot) this.input.bot = makeBot(this);

    const rt = new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType });
    this.composer = new EffectComposer(this.renderer, rt);
    this.composer.addPass(new RenderPass(this.world, this.worldCam));
    this.hTilt = new ShaderPass(HorizontalTiltShiftShader);
    this.vTilt = new ShaderPass(VerticalTiltShiftShader);
    this.composer.addPass(this.hTilt);
    this.composer.addPass(this.vTilt);
    const ip = new RenderPass(this.interior.scene, this.interiorCam);
    ip.clear = false;
    ip.clearDepth = true;
    this.composer.addPass(ip);
    this.composer.addPass(new OutputPass());

    this.score.onTier = (a, b) => this.onTier(a, b);
    this.ui.onMute = () => {
      this.audio.setMuted(!this.audio.muted);
      this.ui.setMuted(this.audio.muted);
    };

    const ctx: WorldCtx = {
      scene: this.world,
      spray: this.spray,
      chunks: this.chunks,
      onBreak: (e, how, pos, size) => this.onBreak(e, how, pos, size),
      onImpact: (pos, s, m) => this.onImpact(pos, s, m),
      onPoleCut: (p) => this.onPoleCut(p),
      entities: () => this.entities,
      wonderLevel: () => this.visualLevel(),
    };
    this.ctx = ctx;
    this.heroEnv = {
      carX: 0, carSpeed: 0, rearX: 0, frontX: 0, entities: this.entities, wires: this.wires,
      interact: (v, p, b) => this.interact(v, p, b),
      bonk: (p, lite) => this.onBonk(p, lite),
      sfx: (n, v) => this.audio.sfx(n, v),
    };

    this.statics = this.trip.items.filter((i) => i.kind !== 'slowCar' && i.kind !== 'fastCar');
    this.vehicles = this.trip.items.filter((i) => i.kind === 'slowCar' || i.kind === 'fastCar');
    this.computeFrame();
    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.setCamera(SIDE_POS, this.lookQuat(SIDE_POS, SIDE_LOOK));
    if (new URLSearchParams(location.search).has('skip')) {
      this.audio.start();
      this.setState('turning');
      this.quick = true;
    }
  }

  ctx: WorldCtx;
  needOrigin = true;

  // ---------------------------------------------------------------------------

  poles(): Pole[] { return this.entities.filter((e): e is Pole => e instanceof Pole); }

  visualLevel() { return this.score.tier; }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    const aspect = w / h;
    // keep the window comfortably framed on tall (phone) screens
    const fov = aspect < 1.2 ? 52 + (1.2 - aspect) * 40 : 52;
    for (const c of [this.worldCam, this.interiorCam]) {
      c.aspect = aspect;
      c.fov = fov;
      c.updateProjectionMatrix();
    }
    this.hTilt.uniforms.h.value = 5 / w;
    this.vTilt.uniforms.v.value = 5 / h;
  }

  /** Where the window edges land on the run line (relative to car x). */
  computeFrame() {
    const cam = POV;
    const k = (RUNZ - cam.z) / (WINDOW.z - cam.z);
    const gy = cam.y + (0.5 - cam.y) / k;
    const rear = windowRearXAt(gy) + 0.025;
    const front = WINDOW.front - 0.025;
    this.rearX = cam.x + (rear - cam.x) * k;
    this.frontX = cam.x + (front - cam.x) * k;
  }

  get W() { return this.frontX - this.rearX; }

  homeRel() { return this.rearX + FRAME.home * this.W; }

  setState(s: State) {
    this.state = s;
    this.stateT = 0;
  }

  lookQuat(pos: THREE.Vector3, target: THREE.Vector3) {
    const m = new THREE.Matrix4().lookAt(pos, target, new THREE.Vector3(0, 1, 0));
    return new THREE.Quaternion().setFromRotationMatrix(m);
  }

  setCamera(pos: THREE.Vector3, q: THREE.Quaternion) {
    this.headPos.copy(pos);
    this.headQuat.copy(q);
  }

  // ---------------------------------------------------------------------------
  // main loop

  frame(dt: number) {
    dt = Math.min(dt, 0.1);
    this.input.poll();
    if (this.input.takePause() && (this.state === 'play')) this.togglePause();
    if (this.paused) {
      this.input.clear();
      this.render();
      return;
    }
    this.stateT += dt;
    wonderUniforms.uTime.value += dt;

    switch (this.state) {
      case 'title': this.updateTitle(dt); break;
      case 'turning': this.updateTurning(dt); break;
      case 'birth': this.updateBirth(dt); break;
      case 'play': this.updatePlay(dt); break;
      case 'arrival': this.updateArrival(dt); break;
      case 'results': this.updateResults(dt); break;
      case 'bored': this.updateBored(dt); break;
    }

    this.updateWonderVisuals(dt);
    this.spray.update(dt);
    this.chunks.update(dt);
    this.wires.update(dt, this.carX + this.rearX - 40);
    this.carRig.position.x = this.carX;
    this.env.update(this.carX, this.worldCam.getWorldPosition(new THREE.Vector3()));
    this.hero.animate(dt, this.carSpeed);
    this.interior.redrawGlass();
    this.audio.tick();
    this.audio.setGrinding(!!this.hero.grinding && this.state === 'play', this.carSpeed);
    this.render();
  }

  skipRender = false;

  render() {
    if (this.skipRender) return;
    this.worldCam.position.copy(this.headPos);
    this.worldCam.quaternion.copy(this.headQuat);
    // camera shake (trauma^2)
    const sh = this.trauma * this.trauma;
    if (sh > 0) {
      const t = performance.now() * 0.05;
      this.worldCam.rotateZ(Math.sin(t * 1.3) * 0.012 * sh);
      this.worldCam.rotateX(Math.sin(t * 1.7 + 1) * 0.01 * sh);
      this.worldCam.position.y += Math.sin(t * 2.1) * 0.004 * sh;
    }
    this.interiorCam.position.copy(this.worldCam.position);
    this.interiorCam.quaternion.copy(this.worldCam.quaternion);
    this.carRig.updateMatrixWorld(true);
    this.hTilt.uniforms.r.value = this.tiltR;
    this.vTilt.uniforms.r.value = this.tiltR;
    this.composer.render();
    this.layoutUI();
  }

  layoutUI() {
    // project the window shape to the screen for HUD placement
    const pts = [
      new THREE.Vector3(WINDOW.rearBottom, WINDOW.bottom, WINDOW.z),
      new THREE.Vector3(WINDOW.front, WINDOW.top, WINDOW.z),
      new THREE.Vector3(WINDOW.rearTop, WINDOW.top, WINDOW.z),
      new THREE.Vector3(WINDOW.front, WINDOW.bottom, WINDOW.z),
    ].map((p) => this.toScreen(p, this.interiorCam));
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const r = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    if (Math.abs(r.x - this.winRect.x) + Math.abs(r.w - this.winRect.w) + Math.abs(r.y - this.winRect.y) > 0.5) {
      this.winRect = r;
      this.ui.layout(r);
    }
  }

  toScreen(p: THREE.Vector3, cam: THREE.Camera) {
    const v = p.clone().project(cam);
    return { x: (v.x * 0.5 + 0.5) * window.innerWidth, y: (-v.y * 0.5 + 0.5) * window.innerHeight, behind: v.z > 1 };
  }

  worldToScreen(p: THREE.Vector3) { return this.toScreen(p, this.worldCam); }

  // ---------------------------------------------------------------------------
  // states

  private kidIdle(t: number, bored = 0) {
    const k = this.interior.kid;
    k.shinL.rotation.z = Math.sin(t * 2.3) * 0.35 * (1 - bored * 0.7) - 0.1;
    k.shinR.rotation.z = Math.sin(t * 2.3 + 1.2) * 0.35 * (1 - bored * 0.7) - 0.1;
    k.torso.rotation.z = -0.05 - bored * 0.18 + Math.sin(t * 0.7) * 0.02;
    k.head.rotation.z = Math.sin(t * 0.5) * 0.04 - 0.05 - bored * 0.2;
  }

  updateTitle(dt: number) {
    this.carSpeed = 4.5;
    this.carX += this.carSpeed * dt;
    if (this.carX > -60) this.carX -= 240;
    this.tiltR = 4;
    this.interior.kid.root.visible = true;
    this.kidIdle(this.stateT);
    this.interior.kid.head.rotation.y = Math.sin(this.stateT * 0.35) * 0.15;
    const sway = new THREE.Vector3(Math.sin(this.stateT * 0.4) * 0.01, Math.sin(this.stateT * 0.6) * 0.005, 0);
    this.setCamera(SIDE_POS.clone().add(sway), this.lookQuat(SIDE_POS.clone().add(sway), SIDE_LOOK));
    const at = this.toScreen(new THREE.Vector3(0.05, 0.72, WINDOW.z), this.interiorCam);
    this.ui.setTitle(true, at);
    this.audio.setState(0, this.carSpeed, 1);
    if (this.input.takeAny() || this.input.takeJump() || this.input.takeSlash()) {
      this.audio.start();
      this.audio.sfx('click');
      this.input.clear();
      this.setState('turning');
      this.quick = false;
    }
  }

  updateTurning(dt: number) {
    const dur = this.quick ? 1.6 : 4.4;
    const t = Math.min(1, this.stateT / dur);
    this.carSpeed = this.quick ? this.carSpeed : 4.5;
    if (!this.quick) {
      this.carX += this.carSpeed * dt;
    } else this.updateCar(dt);
    this.ui.setTitle(false);
    const k = this.interior.kid;
    k.root.visible = true;
    this.kidIdle(this.stateT, 0);
    // eyes first, then the head turns to the window
    k.head.rotation.y = sstep(0.06, 0.32, t) * 1.45;
    k.torso.rotation.x = -sstep(0.2, 0.5, t) * 0.22;
    // rack focus: blur pulls from the kid to the world
    this.tiltR = THREE.MathUtils.lerp(4, this.focusR(), sstep(this.quick ? 0.2 : 0.22, this.quick ? 0.7 : 0.55, t));
    // camera: arc over the shoulder and into the kid's head
    const m = sstep(this.quick ? 0.0 : 0.28, 1, t);
    const a = SIDE_POS, b = SHOULDER_POS, c = POV;
    const pos = new THREE.Vector3()
      .addScaledVector(a, (1 - m) * (1 - m))
      .addScaledVector(b, 2 * m * (1 - m))
      .addScaledVector(c, m * m);
    const q0 = this.lookQuat(SIDE_POS, SIDE_LOOK);
    const q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(BASE_PITCH, 0, 0, 'YXZ'));
    this.setCamera(pos, q0.slerp(q1, m));
    if (m > 0.78) k.root.visible = false;
    this.interior.reflection = 0.035 * sstep(0.8, 1, t);
    this.interior.fog = Math.max(0, this.interior.fog - dt);
    this.audio.setState(0, this.carSpeed, 1);
    if (t >= 1) {
      k.root.visible = false;
      this.setState('birth');
    }
  }

  private spawnHero() {
    const x = this.carX + this.homeRel();
    this.hero.place(x);
    this.hero.setVisible(true);
    this.hero.spawnT = 0;
    this.hero.idleLook = 1;
    this.hero.enabled = false;
    this.spray.emit({
      count: 90,
      colors: [PAL.heroRed, 0xffffff, PAL.gold, 0x4aa3df, 0x7bc96f],
      min: new THREE.Vector3(x - 0.4, 0.1, RUNZ - 0.3),
      max: new THREE.Vector3(x + 0.4, 1.1, RUNZ + 0.3),
      dir: new THREE.Vector3(0, 1, 0.3),
      speed: 4,
      up: 7,
      size: 0.07,
      life: 1.6,
    });
    this.audio.sfx('pop');
  }

  updateBirth(dt: number) {
    const t = this.stateT;
    const popT = this.quick ? 0.25 : 3.1;
    const dur = this.quick ? 1.3 : 4.8;
    if (t <= popT) this.updateCar(dt);
    const it = this.interior;
    const hand = it.povHand;
    if (!this.quick) {
      // breathe on the glass, draw the hero in the fog, and it comes alive
      it.fog = THREE.MathUtils.lerp(it.fog, t < 3.1 ? 0.5 : 0, dt * 3);
      const glassPt = this.glassPointFor(new THREE.Vector3(this.carX + this.homeRel(), 0.45, RUNZ));
      const canvasPt = this.glassToCanvas(glassPt);
      it.doodleAt = { x: canvasPt.x, y: canvasPt.y + 22, scale: 0.85 };
      it.doodle = THREE.MathUtils.clamp((t - 1.0) / 1.6, 0, 1);
      it.doodleFade = t < 3.1 ? 1 : Math.max(0, 1 - (t - 3.1) * 2);
      hand.visible = t > 0.45 && t < 3.3;
      if (hand.visible) {
        const rise = sstep(0.45, 1.0, t) * (1 - sstep(2.7, 3.3, t));
        const draw = THREE.MathUtils.clamp((t - 1.0) / 1.6, 0, 1);
        const wig = new THREE.Vector3(Math.sin(draw * 18) * 0.012, Math.cos(draw * 13) * 0.016 - 0.01 + draw * 0.01, 0);
        hand.position.set(glassPt.x + 0.01, THREE.MathUtils.lerp(0.2, glassPt.y + 0.02, rise), WINDOW.z + 0.035).add(wig.multiplyScalar(rise));
        hand.rotation.set(-0.35, 0.2, 0.15);
      }
      if (t >= 3.1 && !this.hero.rig.root.visible) {
        this.spawnHero();
        this.origin = this.hero.x;
        this.needOrigin = false;
      }
    } else if (t >= 0.25 && !this.hero.rig.root.visible) {
      this.spawnHero();
      if (this.needOrigin) this.origin = this.hero.x;
      this.needOrigin = false;
    }
    // the hero looks up at the window, nods, then starts running
    if (t > popT) {
      const lt = t - popT;
      this.hero.idleLook = 1 - sstep(dur - popT - 0.6, dur - popT, lt);
      this.hero.rig.head.rotation.z = lt > 0.5 && lt < 0.9 ? -Math.sin(((lt - 0.5) / 0.4) * Math.PI) * 0.35 : 0;
      this.stepSim(dt, false);
    }
    this.cameraPlay(dt);
    this.tiltR = this.focusR();
    if (t >= dur) {
      hand.visible = false;
      it.doodle = 0;
      this.hero.enabled = true;
      this.hero.idleLook = 0;
      this.setState('play');
      this.controlsT = this.quick ? 3 : 8;
      if (!this.quick) this.score.reset();
      this.ui.showHud(true);
      this.ui.setScore(this.score.total);
    }
  }

  updatePlay(dt: number) {
    this.stepSim(dt, true);
    this.cameraPlay(dt);
    this.tiltR = this.focusR();
    this.updateHud(dt);
    if (this.score.wonder <= 0) {
      this.goBored();
      return;
    }
    if (this.carX - this.origin > this.trip.end - 45) {
      this.setState('arrival');
      this.arrivalT = 0;
      this.flourished = false;
    }
  }

  updateArrival(dt: number) {
    this.stepSim(dt, this.carSpeed > 0.4);
    this.cameraPlay(dt);
    this.tiltR = this.focusR();
    this.updateHud(dt);
    if (this.arrived) {
      this.arrivalT += dt;
      this.hero.enabled = false;
      this.score.bank();
      if (!this.flourished && this.hero.grounded) {
        this.flourished = true;
        this.hero.vy = 14;
        this.hero.grounded = false;
        this.hero.standingOn = null;
        this.hero.flipT = 0;
        this.audio.sfx('airjump');
        this.audio.sfx('arrive');
        this.ui.hint('We\'re here!', this.worldToScreen(new THREE.Vector3(this.hero.x, 2.6, RUNZ)));
      }
      if (this.arrivalT > 1.0) {
        this.hero.idleLook = Math.min(1, this.hero.idleLook + dt * 2);
        this.hero.waving = true;
      }
      if (this.arrivalT > 4.2) this.showResults();
    }
  }

  updateResults(dt: number) {
    this.stepSim(dt, false);
    this.cameraPlay(dt);
  }

  updateBored(dt: number) {
    const t = Math.min(1, this.stateT / 1.8);
    const k = this.interior.kid;
    if (t > 0.35) k.root.visible = true;
    k.head.rotation.y = 1.45 * (1 - sstep(0.3, 0.9, t));
    k.torso.rotation.x = -0.22 * (1 - t);
    this.kidIdle(this.stateT, sstep(0.4, 1, t));
    this.updateCar(dt);
    this.stepSim(dt, false);
    const m = 1 - sstep(0, 1, t);
    const a = SIDE_POS, b = SHOULDER_POS, c = POV;
    const pos = new THREE.Vector3().addScaledVector(a, (1 - m) * (1 - m)).addScaledVector(b, 2 * m * (1 - m)).addScaledVector(c, m * m);
    const q0 = this.lookQuat(SIDE_POS, SIDE_LOOK);
    const q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(BASE_PITCH, 0, 0, 'YXZ'));
    this.setCamera(pos, q0.slerp(q1, m));
    this.tiltR = THREE.MathUtils.lerp(this.focusR(), 4, sstep(0.2, 0.8, t));
    this.interior.fog = THREE.MathUtils.lerp(this.interior.fog, 0.35, dt * 2);
    this.interior.reflection = 0.1 * m;
    if (this.stateT > 1.9 && !this.ui.root.querySelector('.card.on')) {
      this.ui.card(
        `<h2>The kid got bored…</h2><p>Chain moves together to keep the daydream going.<br/>Falling behind or bonking into things drains Wonder.</p>`,
        [{ label: 'Look outside again', onClick: () => this.retry() }],
      );
    }
  }

  goBored() {
    this.setState('bored');
    this.hero.enabled = false;
    this.score.bank();
    this.ui.showHud(false);
    this.ui.hint('');
    this.audio.sfx('sigh');
  }

  showResults() {
    this.setState('results');
    this.ui.showHud(false);
    this.ui.hint('');
    const s = this.score.total;
    const stars = s >= 30000 ? 3 : s >= 16000 ? 2 : 1;
    const starHtml = [1, 2, 3].map((i) => (i <= stars ? '★' : '<span class="off">★</span>')).join('');
    this.ui.card(
      `<h2>We're here!</h2><p>${this.trip.name} — the hero kept pace all the way to the store.</p>
       <div class="stars">${starHtml}</div><div class="big">${s.toLocaleString()}</div>
       <p>Longest chain: <b>${this.score.bestChain}</b></p>`,
      [{ label: 'Drive again', onClick: () => this.driveAgain() }],
    );
  }

  /** Back to the last landmark after the kid got bored. */
  retry() {
    this.ui.hideCard();
    const progress = this.carX - this.origin;
    let cp = 0;
    for (const c of this.trip.checkpoints) if (c <= progress + 20) cp = c;
    this.resetWorld();
    const heroX = this.origin + cp;
    this.carX = heroX - this.homeRel();
    const zone = zoneAt(this.trip, cp);
    this.carSpeed = zone.speed;
    this.carState = 'cruise';
    for (const s of this.trip.stops) if (s.x < cp + 5) this.stopsDone.add(s.x);
    this.skipItemsBefore(cp - 4);
    this.score.wonder = 70;
    this.score.chain = 0;
    this.score.pending = 0;
    this.quick = true;
    this.hero.setVisible(false);
    this.setState('turning');
  }

  driveAgain() {
    this.ui.hideCard();
    this.resetWorld();
    this.stopsDone.clear();
    this.score.reset();
    this.hero.setVisible(false);
    this.interior.fog = 0;
    this.quick = true;
    this.origin = this.carX + this.homeRel() + 4.5 * 0.3;
    this.carSpeed = zoneAt(this.trip, 0).speed;
    this.carState = 'cruise';
    this.nextStatic = this.nextVehicle = 0;
    this.env.resetCells();
    this.hero.place(this.carX + this.homeRel());
    this.setState('birth');
    this.origin = this.carX + this.homeRel();
  }

  resetWorld() {
    for (const e of this.entities) e.dispose();
    this.entities.length = 0;
    this.spray.clear();
    this.chunks.clear();
    this.wires.clear();
    this.trafficLight = null;
    this.arrived = false;
    this.hero.waving = false;
    this.hero.enabled = true;
    this.hero.idleLook = 0;
    this.statics = this.trip.items.filter((i) => i.kind !== 'slowCar' && i.kind !== 'fastCar');
    this.vehicles = this.trip.items.filter((i) => i.kind === 'slowCar' || i.kind === 'fastCar');
    this.nextStatic = this.nextVehicle = 0;
    this.ui.showHud(false);
    this.ui.hint('');
  }

  skipItemsBefore(x: number) {
    while (this.nextStatic < this.statics.length && this.statics[this.nextStatic].x < x) this.nextStatic++;
    while (this.nextVehicle < this.vehicles.length && this.vehicles[this.nextVehicle].x < x + 10) this.nextVehicle++;
  }

  togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      this.ui.card(`<h2>Paused</h2><p>Jump: Space / ↑ / W (hold for higher, press again in the air)<br/>Slash: J / K / Click</p>`, [
        { label: 'Keep going', onClick: () => this.togglePause() },
      ]);
    } else this.ui.hideCard();
  }

  // ---------------------------------------------------------------------------
  // simulation

  stepSim(dt: number, controls: boolean) {
    const jump = controls ? this.input.takeJump() : (this.input.takeJump(), false);
    const slash = controls ? this.input.takeSlash() : (this.input.takeSlash(), false);
    this.input.takeAny();
    let first = true;
    this.acc += dt;
    while (this.acc >= STEP) {
      this.acc -= STEP;
      if (this.hitstop > 0) {
        this.hitstop -= STEP;
        continue;
      }
      if (this.state === 'play' || this.state === 'arrival' || this.state === 'birth' || this.state === 'results') this.updateCar(STEP);
      this.stream();
      const env = this.heroEnv;
      env.carX = this.carX;
      env.carSpeed = this.carSpeed;
      env.rearX = this.rearX;
      env.frontX = this.frontX;
      env.entities = this.entities;
      this.hero.step(STEP, { jumpPressed: first && jump, jumpHeld: this.input.jumpHeld && controls, slashPressed: first && slash }, env);
      first = false;
      for (const e of this.entities) e.update(STEP);
      if (this.state === 'play') {
        const behind = this.hero.u < FRAME.rearZone && this.carSpeed > 0.5;
        this.score.update(STEP, behind, this.carState === 'stopped');
      }
    }
    this.despawn();
  }

  updateCar(dt: number) {
    if (this.state === 'title') return;
    const tx = this.carX - this.origin;
    const zone = zoneAt(this.trip, tx);
    // next stop (stoplight or the destination)
    let stopX: number | null = null;
    let wait = 0;
    for (const s of this.trip.stops) {
      if (!this.stopsDone.has(s.x) && this.origin + s.x >= this.carX - 0.01) {
        stopX = this.origin + s.x;
        wait = s.wait;
        break;
      }
    }
    const endX = this.origin + this.trip.end;
    if (stopX === null || endX < stopX) {
      stopX = endX;
      wait = Infinity;
    }
    const brakeDecel = 3.2;
    if (this.carState === 'cruise') {
      const target = zone.speed;
      const a = 2.4;
      this.carSpeed += THREE.MathUtils.clamp(target - this.carSpeed, -a * dt, a * dt);
      const d = stopX - this.carX;
      if (d <= (this.carSpeed * this.carSpeed) / (2 * brakeDecel) + 0.05) {
        this.carState = 'brake';
        this.stopTarget = stopX;
        this.waitT = wait;
      }
    }
    if (this.carState === 'brake') {
      const d = Math.max(0.0001, this.stopTarget - this.carX);
      const decel = (this.carSpeed * this.carSpeed) / (2 * d);
      this.carSpeed = Math.max(0, this.carSpeed - decel * dt);
      if (this.carSpeed < 0.08 || d < 0.01) {
        this.carSpeed = 0;
        this.carX = this.stopTarget;
        this.carState = 'stopped';
        this.bumpV -= 0.05; // brake settle
        if (this.waitT === Infinity) this.arrived = true;
      }
    }
    if (this.carState === 'stopped') {
      this.carSpeed = 0;
      this.waitT -= dt;
      if (this.waitT <= 0) {
        this.stopsDone.add(this.stopTarget - this.origin);
        this.carState = 'cruise';
      }
    }
    this.carX += this.carSpeed * dt;
    // traffic light
    if (this.trafficLight) {
      const lx = this.trafficLight.x;
      const d = lx - (this.carX + this.homeRel());
      if (this.carState === 'stopped' && this.waitT !== Infinity) this.trafficLight.set(this.waitT < 0.8 ? 'green' : 'red');
      else if (this.carState === 'brake' && this.waitT !== Infinity) this.trafficLight.set(d > 6 ? 'yellow' : 'red');
      else this.trafficLight.set('green');
    }
  }

  stream() {
    const ahead = this.carX + this.frontX + 34;
    while (this.nextStatic < this.statics.length && this.origin + this.statics[this.nextStatic].x < ahead) {
      this.spawn(this.statics[this.nextStatic++]);
    }
    const trigger = this.carX + this.frontX + 3;
    while (this.nextVehicle < this.vehicles.length && this.origin + this.vehicles[this.nextVehicle].x < trigger) {
      const it = this.vehicles[this.nextVehicle++];
      if (this.carSpeed < 1) continue;
      if (it.kind === 'slowCar') {
        this.entities.push(new Vehicle(this.carX + this.frontX + 3, this.ctx, this.carSpeed * 0.55, it.color ?? 0x4aa3df, false));
      } else {
        this.entities.push(new Vehicle(this.carX + this.rearX - 12, this.ctx, this.carSpeed + 4.2, it.color ?? 0x58c4b8, true));
      }
    }
  }

  spawn(it: Item) {
    const x = this.origin + it.x;
    const c = this.ctx;
    let e: Entity | null = null;
    switch (it.kind) {
      case 'mailbox': e = new Prop('mailbox', x, c); break;
      case 'sign': e = new Prop('sign', x, c, it.variant ?? 0); break;
      case 'tree': e = new Toppler('tree', x, c, it.variant ?? 0); break;
      case 'pole': e = new Pole(x, c, it.line ?? 0); break;
      case 'fence': e = new FenceRun(x, it.n ?? 3, c); break;
      case 'barrier': e = new Barrier(x, c); break;
      case 'platform': e = new ImaginedPlatform(x, it.y ?? 3, it.n ?? 30, c); break;
      case 'trafficLight': e = this.trafficLight = new TrafficLight(x, c); break;
      case 'store': e = new Store(x, c); break;
    }
    if (e) this.entities.push(e);
  }

  despawn() {
    const minX = this.carX + this.rearX - 32;
    const maxX = this.carX + this.frontX + 60;
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];
      const gone = e.despawnX < minX || (e instanceof Vehicle && (e.x > maxX || e.x < minX - 20));
      if (gone) {
        if (e === this.trafficLight) this.trafficLight = null;
        e.dispose();
        this.entities.splice(i, 1);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // events

  interact(verb: Verb, pos: THREE.Vector3, base: number) {
    if (this.state !== 'play' && this.state !== 'arrival') return;
    const leading = this.hero.u > FRAME.leadZone;
    const r = this.score.interact(verb, base, leading);
    this.lastVerb = verb;
    if (r.grew && r.chain > 1) this.audio.sfx('chain', 1 + Math.min(r.chain, 16) * 0.04);
    const sp = this.worldToScreen(pos.clone().setY(pos.y + 1.2));
    if (verb !== 'Grind' || r.grew) this.ui.popup(sp, `+${r.points} ${verb.toUpperCase()}`, leading ? '#ffd34a' : '#fff');
  }

  onBreak(e: Entity, how: HitKind, pos: THREE.Vector3, size: number) {
    this.hitstop = Math.max(this.hitstop, Math.min(0.075, 0.035 + size * 0.02));
    this.trauma = Math.min(1, this.trauma + 0.18 * size);
    const metal = e instanceof Prop && (e as Prop).model.clusters[0].boxes[0].color === PAL.metal;
    this.audio.sfx(metal ? 'break-metal' : 'break-wood', Math.min(1.5, size));
    this.score.breaks++;
    if (how === 'domino') this.interact('Domino', pos, 150);
  }

  onImpact(pos: THREE.Vector3, strength: number, material: 'wood' | 'leaf' | 'metal') {
    const d = Math.abs(pos.x - (this.carX + this.homeRel()));
    this.trauma = Math.min(1, this.trauma + 0.35 * strength * Math.max(0.3, 1 - d / 20));
    this.audio.sfx(material === 'leaf' ? 'leaves' : 'impact', strength);
    if (material === 'leaf') this.audio.sfx('impact', 0.5);
  }

  onPoleCut(p: Pole) {
    this.wires.snap(p, this.poles());
    this.audio.sfx('twang');
    const g = this.hero.grinding;
    if (g && (g[0] === p || g[1] === p)) {
      this.hero.launch();
      this.interact('Launch', new THREE.Vector3(this.hero.x, this.hero.y, RUNZ), 200);
    }
  }

  onBonk(pos: THREE.Vector3, lite: boolean) {
    this.score.bonk(lite);
    this.trauma = Math.min(1, this.trauma + (lite ? 0.15 : 0.4));
    if (!lite) this.audio.sfx('bonk');
    this.ui.popup(this.worldToScreen(pos.clone().setY(pos.y + 1)), lite ? 'oof' : 'BONK!', '#ffb0a0');
  }

  onTier(from: number, to: number) {
    // the imagination wave rolls out from the hero
    wonderUniforms.uFrom.value = wonderUniforms.uTo.value;
    wonderUniforms.uTo.value = to;
    wonderUniforms.uWaveCenter.value.set(this.hero.x, this.hero.y + 0.5, this.hero.z);
    this.waveRadius = 0;
    setSwordLook(this.hero.rig, to);
    if (this.state !== 'play') return;
    this.audio.sfx(to > from ? 'tierUp' : 'tierDown');
    const names = ['Just Looking…', 'PRETEND!', 'ADVENTURE!', 'LEGEND!'];
    if (to > from) {
      this.showHint(names[to], 1.4, true);
      this.spray.emit({
        count: 40 + to * 20,
        colors: to >= 3 ? [0xffffff, 0x9fe8ff, PAL.gold] : [PAL.gold, 0xffffff, PAL.heroRed],
        min: new THREE.Vector3(this.hero.x - 0.5, this.hero.y, RUNZ - 0.5),
        max: new THREE.Vector3(this.hero.x + 0.5, this.hero.y + 1.2, RUNZ + 0.5),
        dir: new THREE.Vector3(0, 1, 0), speed: 4, up: 6, glow: true, life: 1.2, size: 0.06, floaty: 0.6,
      });
      if (to === 2 && this.tierSeen < 2) setTimeout(() => this.showHint('Imagined platforms appeared!', 2.2, true), 1500);
    }
    this.tierSeen = Math.max(this.tierSeen, to);
  }

  showHint(text: string, dur: number, force = false) {
    if (!force && this.hintsShown.has(text)) return;
    this.hintsShown.add(text);
    this.hintT = dur;
    this.ui.hint(text);
  }

  // ---------------------------------------------------------------------------
  // presentation helpers

  focusR() {
    const p = new THREE.Vector3(this.carX + this.homeRel(), 1.4, RUNZ);
    const v = p.project(this.worldCam);
    return v.y * 0.5 + 0.5;
  }

  glassPointFor(world: THREE.Vector3) {
    const cam = POV;
    const local = world.clone();
    local.x -= this.carX;
    const k = (WINDOW.z - cam.z) / (local.z - cam.z);
    return new THREE.Vector3(cam.x + (local.x - cam.x) * k, cam.y + (local.y - cam.y) * k, WINDOW.z);
  }

  glassToCanvas(p: THREE.Vector3) {
    const x0 = WINDOW.rearBottom - 0.02, x1 = WINDOW.front + 0.02, y0 = WINDOW.bottom - 0.02, y1 = WINDOW.top + 0.02;
    return { x: ((p.x - x0) / (x1 - x0)) * 512, y: (1 - (p.y - y0) / (y1 - y0)) * 320 };
  }

  cameraPlay(dt: number) {
    const h = this.hero;
    const lookAhead = Math.max(0, this.carSpeed - 6) * 0.018;
    const tYaw = -(h.u - FRAME.home) * 0.1 - lookAhead;
    const tPitch = BASE_PITCH + THREE.MathUtils.clamp((h.y - 1.2) * 0.022, -0.02, 0.1);
    this.yaw += (tYaw - this.yaw) * Math.min(1, dt * 2.5);
    this.pitch += (tPitch - this.pitch) * Math.min(1, dt * 3);
    // road bumps: a springy jolt every few seconds while moving
    this.nextBump -= dt * (this.carSpeed > 0.5 ? 1 : 0);
    if (this.nextBump <= 0) {
      this.nextBump = 2 + Math.random() * 5;
      this.bumpV += (0.02 + Math.random() * 0.03) * (Math.random() < 0.5 ? 1 : -1);
    }
    // semi-implicit spring in small substeps so slow frames stay stable
    for (let s = 0, n = Math.ceil(dt / (1 / 240)); s < n; s++) {
      const h = dt / n;
      this.bumpV += (-this.bumpY * 220 - this.bumpV * 12) * h;
      this.bumpY += this.bumpV * h;
    }
    const t = performance.now() * 0.001;
    const vib = this.carSpeed > 0.1 ? (Math.sin(t * 37) * 0.6 + Math.sin(t * 23.3) * 0.4) * 0.0007 * Math.min(1.4, this.carSpeed / 7) : 0;
    const pos = POV.clone();
    pos.x += -this.yaw * 0.06;
    pos.y += -(this.pitch - BASE_PITCH) * 0.12 + this.bumpY * 0.05 + vib;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(this.pitch + this.bumpY * 0.3, this.yaw, 0, 'YXZ'));
    this.setCamera(pos, q);
    this.trauma = Math.max(0, this.trauma - dt * 1.6);
  }

  updateWonderVisuals(dt: number) {
    const target = this.score.tier;
    this.level += (target - this.level) * Math.min(1, dt * 1.3);
    if (this.waveRadius < 900) {
      this.waveRadius += dt * 55;
      if (this.waveRadius >= 400) {
        this.waveRadius = 1e4;
        wonderUniforms.uFrom.value = wonderUniforms.uTo.value;
      }
    }
    wonderUniforms.uWaveRadius.value = this.waveRadius;
    this.env.setLevel(this.level);
    const it = this.interior;
    it.windowLight.intensity = 1.1 + this.level * 0.25;
    it.sunPatch.intensity = this.level * 0.8;
    const musicVol = this.state === 'bored' ? 0.5 : this.state === 'results' ? 0.6 : 1;
    const audioLevel = this.state === 'title' || this.state === 'turning' || this.state === 'bored' || (this.state === 'arrival' && this.arrived) || this.state === 'results' ? 0 : this.level;
    this.audio.setState(audioLevel, this.carSpeed, musicVol);
    // tier 3: the hero leaves a glowing trail
    if (this.score.tier >= 3 && this.state === 'play') {
      this.trailT -= dt;
      if (this.trailT <= 0) {
        this.trailT = 0.035;
        const h = this.hero;
        this.spray.emit({
          count: 1, colors: [0xffffff, 0x9fe8ff, 0xffe27a],
          min: new THREE.Vector3(h.x - 0.2, h.y + 0.3, h.z), max: new THREE.Vector3(h.x, h.y + 0.8, h.z + 0.1),
          dir: new THREE.Vector3(-1, 0, 0), speed: 0.5, up: 0.3, glow: true, life: 0.5, size: 0.05, floaty: 1,
        });
      }
    }
  }

  updateHud(dt: number) {
    const h = this.hero;
    const s = this.score;
    this.ui.setScore(s.total + Math.round(s.pending * s.mult));
    const warn = s.tier === 0 && s.wonder < WONDER.warnBelow;
    this.ui.setWonder(s.wonder, s.tier, warn);
    this.interior.fog = THREE.MathUtils.lerp(this.interior.fog, warn ? (1 - s.wonder / WONDER.warnBelow) * 0.5 : 0, dt * 2);
    const leading = h.u > FRAME.leadZone && this.state === 'play';
    this.ui.setLeading(leading);
    const behind = h.u < FRAME.rearZone && this.carSpeed > 0.5;
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.012);
    const rg = this.interior.rearGlow.material as THREE.MeshBasicMaterial;
    rg.opacity += ((behind ? 0.55 + 0.35 * pulse : 0) - rg.opacity) * Math.min(1, dt * 8);
    const fg = this.interior.frontGlow.material as THREE.MeshBasicMaterial;
    fg.opacity += ((leading ? 0.6 : 0) - fg.opacity) * Math.min(1, dt * 6);
    const chainAt = this.worldToScreen(new THREE.Vector3(h.x, h.y + 2.0, h.z));
    this.ui.setChain(s.chainActive ? chainAt : null, s.mult, s.chain, this.lastVerb.toUpperCase());

    // heads-up for fast vehicles approaching from behind
    let best: Vehicle | null = null;
    for (const e of this.entities) {
      if (e instanceof Vehicle && e.fast && e.x + 1.5 < this.carX + this.rearX + 1 && e.x > this.carX + this.rearX - 16) {
        if (!best || e.x > best.x) best = e;
      }
    }
    if (best && this.state === 'play') {
      const edge = this.worldToScreen(new THREE.Vector3(this.carX + this.rearX + 0.3, 0.7, RUNZ));
      const dist = this.carX + this.rearX - (best.x + 1.5);
      const urgency = THREE.MathUtils.clamp(1 - dist / 14, 0, 1);
      this.ui.setHeadsUp({ x: edge.x + 6, y: edge.y }, urgency);
      this.headsUpCd -= dt;
      if (this.headsUpCd <= 0) {
        this.audio.sfx('headsup');
        this.headsUpCd = 0.7 - urgency * 0.4;
      }
      this.showHint('Heads up! Something fast is coming — jump on it!', 2.6);
    } else {
      this.ui.setHeadsUp(null, 0);
      this.headsUpCd = 0;
    }

    // first-time hints, written on the glass near the hero
    const tx = this.carX - this.origin;
    if (this.state === 'play') {
      if (tx < 40) {
        const ahead = this.entities.find((e) => e.breakable && e.x > h.x && e.x - h.x < 7);
        if (ahead) this.showHint('Slash it!', 2);
      }
      const pole = this.entities.find((e) => e instanceof Pole && e.x > h.x - 2 && e.x - h.x < 6);
      if (pole && tx > 100) this.showHint('Jump up onto the wire to grind!  (jump twice)', 2.8);
      const slow = this.entities.find((e) => e instanceof Vehicle && !(e as Vehicle).fast && e.x - h.x < 8 && e.x > h.x);
      if (slow) this.showHint('Hop on cars to ride them!', 2.4);
      if (h.grinding) this.showHint('Slash the pole ahead to snap the wire and launch!', 2.8);
      if (h.u < FRAME.rearZone && this.carSpeed > 0.5) this.showHint('Falling behind! Keep chaining to catch up.', 2.4);
      if (this.carState === 'stopped' && this.waitT !== Infinity) this.showHint('Red light… take a breather.', 2.4);
    }
    if (this.hintT > 0) {
      this.hintT -= dt;
      const at = this.worldToScreen(new THREE.Vector3(h.x + 1.5, Math.max(h.y, 0) + 3.4, RUNZ));
      this.ui.hint(this.hintT > 0 ? (this.ui.root.querySelector('#hint') as HTMLElement).textContent || '' : '', at);
    }
    if (this.controlsT > 0) {
      this.controlsT -= dt;
      const touch = 'ontouchstart' in window;
      this.ui.controls(this.controlsT > 0 ? (touch ? 'Tap right side: JUMP (hold = higher)  ·  Tap left side: SLASH' : 'SPACE / ↑ / W: JUMP (hold = higher, again in the air = double jump)  ·  J / K / CLICK: SLASH') : '');
    }
  }
}
