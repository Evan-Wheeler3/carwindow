// All gameplay tuning in one place. Units: H = hero height = 1 world unit.
// Values follow docs/GAME_DESIGN.md Appendix B, adapted to this prototype's framing.

export const VOXEL = 1 / 12; // one voxel = 1/12 hero height

export const WORLD = {
  runLineZ: -11, // gameplay plane depth (car centre is z = 0)
  gravityUp: 41.5,
  gravityFallMul: 1.6,
};

export const HERO = {
  jumpVel: 15.8, // ~3.0 H apex
  jumpCutMul: 0.45, // velocity kept when jump released early
  airJumpVel: 12.9, // ~2.0 H
  slashHopVel: 10.8, // ~1.4 H
  coyote: 0.12,
  jumpBuffer: 0.15,
  slashTime: 0.22,
  slashActiveStart: 0.02,
  slashActiveEnd: 0.13,
  slashReach: 1.55,
  slashCooldown: 0.16,
  whiffFloat: 0.15,
  grindAttach: 0.45,
  landAttach: 0.35,
};

export const FRAME = {
  home: 0.45,
  rearZone: 0.2, // below = Falling Behind
  leadZone: 0.65, // above = LEADING
  min: 0.04, // soft wall at the rear pillar
  max: 0.8,
  returnRate: 0.11, // u per second drift towards home
  bonkPush: 0.16,
  grindPush: 0.07, // u per second while grinding
  lungePush: 0.03,
};

export const WONDER = {
  perTier: 100,
  max: 399,
  start: 40,
  perInteraction: 4.5,
  bonk: 12,
  behindDrainPerSec: 4,
  decayPerSec: 1.2, // above tier 1 when no chain is active
  regenTier0: 1.0,
  warnBelow: 25,
};

export const SCORE = {
  chainTimer: 2.0,
  multEvery: 4,
  multMax: 8,
  leadMul: 1.5,
};

export const LIMITS = {
  cubes: 3500,
  chunks: 140,
};
