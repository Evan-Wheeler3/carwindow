# Window Seat (working title)

A voxel destruction platformer played entirely through the backseat window of the family car: you control the imaginary hero every kid pictured running alongside, and the better you play, the more the world outside turns into their imagination.

- [Game Design Document](docs/GAME_DESIGN.md)

## Play the MVP

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # single-file build in dist/index.html
```

**Controls**

| | Keyboard | Mouse | Touch | Gamepad |
|---|---|---|---|---|
| Jump (hold = higher, press again in air = double jump) | Space / ↑ / W | Right-click | Tap right half | A / B |
| Slash | J / K / X | Left-click | Tap left half | X / Y / RB |
| Pause | Esc / P | | | Start |

**What's in this build (MVP, Trip 1: "The Errand")**

- Opening: side view of the kid → turn to the window → camera pushes into their POV → the kid draws the hero in the fogged glass and he pops to life.
- One ~3 minute trip: neighbourhood → stoplight → main road → highway → arrival at the store.
- Hero: auto-run at the car's pace, jump + double jump, slash (air slash hop refreshes the double jump), wire grinding, riding cars, landing on breakables to bounce.
- Chunky voxel destruction: mailboxes, signs, fences (ripple), trees and telephone poles (topple, domino, snap the power lines and launch you if you're grinding).
- Wonder: the single success meter. Chains fill it; the world, sky, hero, sword and music escalate through 4 tiers (Just Looking → Pretend → Adventure → LEGEND). Imagined gold platforms appear at tier 2. If Wonder runs out, the kid gets bored (retry from the last landmark).
- Window zones: LEADING (front, ×1.5 score), Falling Behind (rear pillar glows, slowly drains Wonder). The hero can never be lost.
- Heads-up arrow + sound before fast cars arrive from behind.
- All audio is synthesized: the radio theme leaves the tinny car radio as Wonder rises.

**Debug URL flags:** `?skip` (skip the title), `?autoplay` (simple bot), `?warp=N` (run N sim frames per frame).

## Code map

| File | What |
|---|---|
| `src/game.ts` | State machine, car speed plan, streaming, camera rig, events, HUD wiring |
| `src/hero.ts` | Kinematic hero controller + procedural animation |
| `src/entities.ts` | Breakables, topplers (poles/trees), fences, vehicles, imagined platforms, power-line wires |
| `src/debris.ts` | Cube spray (instanced voxel particles) and chunk sim (fake rigid bodies) |
| `src/voxel.ts`, `src/models.ts` | Voxel box models, bevel texture, Wonder colour-grading shader patch |
| `src/interior.ts` | Car interior, kid, glass (reflection, fog, doodle) |
| `src/environment.ts` | Sky, ground, scenery scatter, lights |
| `src/trip.ts` | Trip 1 layout, speed zones, stops, checkpoints |
| `src/score.ts` | Chain + Wonder |
| `src/audio.ts` | Synth music, ambience, SFX |
| `src/config.ts` | All tuning numbers |

Note: the design doc recommends Godot for the full production; this MVP is built in TypeScript + Three.js so it can be played instantly in a browser and shared as a link.
