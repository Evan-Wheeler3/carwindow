# WINDOW SEAT
### Game Design Document — v0.2 (pre-production)

> *Every kid who ever rode in a backseat had a little guy running alongside the car.*
> *This is the game where you finally get to control him.*

Working title: **WINDOW SEAT** (alternates: *Keep Pace*, *Backseat Hero*, *Out the Window*).

**What changed since v0.1:**
- **Wonder is now the one success/fail meter.** Frame position (where the hero is in the window) is now generous, clearly shown, and only *feeds* Wonder. It can't end a run on its own.
- **No hero is ever "lost."** The rear pillar is a soft wall, not a death line.
- **Heads-Up warnings** come before anything fast. The default difficulty is generous.
- **"Kid Logic" (hero actions causing real-world events) has been removed entirely.**
- **The interior storytelling has been toned down.** It's light set-dressing and a small trophy spot, not a narrative device.
- **The visual style is now chunky voxels.** Destruction throws out sprays of small voxel cubes.
- **The ending is reaching the destination.** The dream, Moving Day, and the "years later" epilogue have been removed.

---

## How to read this document

Part I covers the few decisions that make this game itself. Part II is the 28 requested sections. If a feature in Part II doesn't serve Part I, it gets cut.

---

# PART I — THE IDENTITY

## The 10-second clip

> A soft, slightly dim car interior: a minivan door panel, a seatbelt strap across the bottom corner, a juice box in the cupholder. Through the glass, a bright **chunky-voxel diorama world** slides by. A tiny voxel hero in a long red scarf sprints along the roadside, keeping pace with the car. He jumps a mailbox and slashes a telephone pole, which **bursts into a spray of little cubes** as the top half topples onto a fence and flattens it. He runs up the falling pole, onto the power line, and grinds it in a shower of sparks. In the glass you can faintly see the kid's reflection, grinning. The tinny song on the radio swells into a full version of itself as the world floods with color.

Nobody needs that clip explained. The rest of this document is about keeping the game fun once the recognition has worn off.

## The four core ideas

### 1. The window is the screen. Keep pace with the car.

The hero only exists in the window. The car's speed sets the tempo of the whole game, and the hero runs alongside it. **Where the hero is in the window is always shown and always forgiving:**

- **Clean play pushes him forward.** Out in front of the car he gets a **score bonus**, shown by a gold glint on the scarf and a "LEADING!" sticker on the glass.
- **Bonks push him backward**, toward the rear of the window. The rear pillar glows warm, and the hero visibly strains to catch up.
- **He can never be lost.** The rear pillar is a soft wall. If he's pinned against it, he automatically sprints back toward the middle. The only cost is a slow trickle of Wonder while he's in the "Falling Behind" zone.

Frame position is **feedback and score, never game over.** It's easy to read and hard to fail.

### 2. Wonder: the better you play, the more imaginary the world becomes.

This is **the one meter that decides success.** Chaining moves fills it, and as it fills the world steps up through four tiers:

| Tier | Name | What the world looks like |
|---|---|---|
| 0 | **Just Looking** | Muted, overcast, ordinary. The hero is a pale, plain voxel figure. The radio is tinny. |
| 1 | **Pretend** | Color warms up. The hero gets a cardboard sword. The kid's mouth-sound effects kick in. |
| 2 | **Adventure** | Saturated, dramatic sky, drums. *Imagined voxel platforms* appear and open high routes. |
| 3 | **Legend** | Full fantasy. Trucks grow armor plates, clouds become whales. Full music. The sword glows. |

Bonks and falling behind drain Wonder, and the world visibly slides back toward ordinary. **If Wonder empties completely at Tier 0, the kid gets bored**: they sigh, slump, and look away from the window. *That* is the only fail state. It's generous by design: there's a clear warning first (the glass starts to fog and the kid's reflection yawns), Wonder trickles back up on its own at Tier 0, and checkpoints are frequent.

Escalating imagination becomes a reward you can see and hear, and *losing* it is the threat.

### 3. Everything outside breaks into chunky voxels.

The outside world is built from **chunky voxels**: toy-like, colorful, a miniature diorama. When something breaks, it splits into a few **big voxel chunks** plus a **spray of small cubes** that bounce, tumble, and scatter along the road. Destruction is the game's main pleasure and its visual signature.

### 4. Real inside, imagined outside.

The car interior is soft, smooth, and believable. The world outside is chunky, saturated, and exaggerated. That contrast, seen *through glass* with a faint reflection of the kid's face, is what makes it read as "a kid imagining this" and not "a runner game with a frame."

## What this game is / is not

| It IS | It is NOT |
|---|---|
| A **handcrafted** run-and-destroy platformer of short "trips" (3–5 min) | An endless runner (one optional mode, not the core) |
| Played **entirely through one window** | A driving game |
| A single gameplay plane, side-on | A 3-lane "swipe left/right" runner |
| Generous by default, deep for score-chasers | A punishing precision game |
| Toy-like voxel destruction | A physics sandbox |
| Immediately readable: **3 buttons** | An RPG with stats and skill trees |

---

# PART II — THE DESIGN

## 1. Core Game Pillars

1. **The Window Is The World.** Everything is seen through the backseat window. The car interior is always on screen.
2. **Keep Pace.** The hero runs *alongside the car*. The car's speed is the game's tempo.
3. **Everything Is An Obstacle Course.** Ordinary roadside objects become platforms, rails, trampolines, and things to smash.
4. **Toys Break Beautifully.** Chunky voxel destruction with satisfying cube sprays. Toy physics, not realism.
5. **Imagination Is Earned.** The world gets more fantastical *because you're playing well*. Boredom is the fail state.

Tiebreaker: if a feature conflicts with Pillar 1, cut the feature.

## 2. One-Sentence Pitch

**Window Seat is a voxel destruction platformer played entirely through the backseat window of the family car: you control the imaginary hero every kid pictured running alongside, and the better you play, the more the world outside turns into their imagination.**

## 3. Expanded Pitch

You're eight years old, and the drive is taking forever.

You press your forehead to the window, and out there a little hero in a red scarf starts running beside the car. He vaults mailboxes, slashes telephone poles into showers of cubes, runs up the falling pole onto the power lines, grinds them in sparks, drops onto the roof of a passing semi, and rides it ahead of the car.

*Window Seat* is a game of short, handcrafted car trips: errands, school pickups, country roads, rainy drives, the interstate, the drive to Grandma's, and finally the big summer trip. Each trip is a 3–5 minute run-and-destroy platforming course along a road that's half real and half imagined, framed the whole time by the backseat window. Each one ends the way every car ride ends: **you arrive.**

The controls are three buttons: **Jump**, **Slash**, **Down**. The depth is in **chaining**: slash into a hop, a hop onto a wire, a wire into a pole-snap, a snap into a launch, a launch onto a truck. Every voxel object reacts physically, falls on other objects, and becomes a platform for the next move. Play well and the world transforms: color floods in, the radio song swells into a full soundtrack, trucks grow dragon armor, and secret imagined routes open in the sky. Play badly and reality creeps back in until, eventually, the kid gets bored and looks away.

**Platforms:** PC/Steam (lead), Steam Deck, Switch-class hardware. Mobile possible later; the controls are designed to allow it.
**Price:** $15–20 premium. No F2P.
**Audience:** 25–45-year-olds who were that kid, plus families and kids (E/PEGI 7). Streamer- and clip-friendly.
**Comparables:** *Sayonara Wild Hearts* (music-driven flow), *Alto's Odyssey* (mood, accessible grace), *Rayman Origins* runner levels (feel), *Katamari Damacy* (escalating absurdity), *Crossy Road* / *Teardown* (voxel charm and voxel destruction, at opposite ends of the scale).

## 4. Target Player Experience

**First 30 seconds:** recognition. *"Oh. I did this."*
**First 5 minutes:** delight. Things burst into cubes, the hero is unreasonably cool, the world lights up.
**First hour:** mastery begins. *"Wait, if I slash the pole while I'm on the wire, it launches me?"*
**Campaign (≈ 3–5 hours):** variety and escalation. New road types, new moves, a set piece in each trip (racing the train, the car wash, the storm).
**After the credits:** score-chasing, 3-star ranks, perfect chains, collectibles, Long Drive endless mode, backseat co-op.

**Difficulty philosophy:** *anyone can reach the destination; experts chase the score.* The default is generous: frequent checkpoints, no instant failure, warnings before fast objects. Depth comes from chains, routes, and ranks, not from punishment.

**Emotional curve of every trip:**

```
 boredom → curiosity → freedom → peak imagination → ARRIVAL
   grey      hero appears   flowing chains   Tier 3 / set piece   car parks, music settles, engine off
```

## 5. Visual Style Specification

### Decision: **chunky voxels, staged as a modern toy diorama.**

Everything outside the window is voxel. The interior is not. The risk with voxels is looking like Minecraft or a generic asset-store game, so here is how this style avoids that:

1. **No world grid.** Voxels are used for *objects* (poles, trees, cars, signs, houses), not for terrain you dig into. Models are placed freely along the road, rotated, and scaled as whole objects. The world reads as a diorama of voxel toys, not a block world.
2. **No pixel textures.** Every voxel is one flat color from a curated palette. There's no grass-block texturing.
3. **Modern lighting.** Soft ambient occlusion in the crevices between voxels, a subtle **bevel/edge-highlight shader** on each cube face so blocks read as physical toy cubes, a warm key light, bloom on glowing things, and **tilt-shift blur** for the miniature look.
4. **Silhouette-first modeling.** Each model is shaped to read at a glance from the side. That's the only angle that matters.
5. **Strict palette discipline.** One 256-color palette per trip and Wonder tier. Red is reserved for the hero.

### Voxel density (the "chunky" rule)

- **1 voxel = 1/12 of hero height (H).** With H ≈ 1.6 m in-engine, a voxel is ≈ 13 cm.
- **The hero is ≈ 12 voxels tall** (plus scarf). That's chunky, readable, and toy-like. The face uses 2–4 voxels: eyes and a brow.
- **Everything shares the same voxel scale.** Mixed resolutions break the toy illusion. The only exception is distant scenery, which can use 2× voxels.
- **Typical sizes:** mailbox 10 voxels tall, telephone pole 72, trees 48–84, car 14 tall × 36 long, semi 40 × 160.

### The core contrast: inside vs outside

| | **Inside the car (REAL)** | **Outside the window (IMAGINED)** |
|---|---|---|
| Geometry | Smooth, curved, believable | Chunky voxels |
| Materials | Fabric, scuffed plastic, vinyl, rubber seals | Flat palette colors with edge-bevel shading |
| Lighting | Soft, warm, slightly dim | Bright, crisp, high-contrast |
| Focus | Slightly soft (the kid is focused *out*) | Sharp at the gameplay plane, **tilt-shift blur** top and bottom |
| Scale | 1:1 human | Miniature diorama |

### Character design

**The Hero ("the Runner").** A chunky voxel figure about 12 voxels tall, with big hands and feet, a hood, and an **enormous red scarf** that trails behind as a chain of voxel segments with physics. The scarf is the speed indicator and the silhouette signature. He carries a stick or cardboard sword that gets more real with Wonder:

- Tier 0: pale and plain.
- Tier 1: colored in, cardboard sword.
- Tier 2: full color, wooden sword, longer scarf.
- Tier 3: glowing sword, trail, scarf like a banner.

**The Kid.** About 8 years old, in a hoodie, ambiguous so players can project. Mostly seen in the opening, as a faint reflection in the glass, and as hands entering the frame. Built in the smooth interior style, not voxels: the kid is *real*.

### Animation

- **The hero animates snappily**, with strong key poses and squash/stretch done by scaling the voxel model. Consider animating "on twos" (stepped poses) to make him feel imagined. Prototype that and keep it only if it doesn't hurt feel. Gameplay timing stays continuous either way.
- **World objects follow toy physics:** slightly floaty arcs, exaggerated bounces, a quick wobble-settle on impact.
- **The kid and interior** are smooth and naturalistic.

### Lighting, color, time of day

- One key directional light (the sun) outside, plus a sky/ambient gradient. No realtime GI. Voxel AO is baked per model.
- **Two color axes:**
  - *Per trip:* morning errand in pale yellows, highway noon in bright blues and greens, Grandma's at golden hour in amber, night drive in navy with sodium-orange.
  - *Per Wonder tier:* desaturated and flat at Tier 0, saturated, rim-lit, and blooming at Tier 3.
- **Turns** rotate the sun relative to the car, so light patches sweep across the interior.
- **Shadows:** one stable shadow cascade around the gameplay plane. Debris cubes use cheap blob or no shadows. **The hero always has a crisp blob shadow** for landing readability.
- **Fog:** distance fog in the sky color, so the background breaks into soft layered planes.

### Distant scenery

- 3–4 **parallax layers** of low-detail voxel silhouettes (2× voxel size), plus a subtly **curved horizon** shader that makes the world feel like a rolling diorama.
- **Landmarks** (water tower, stadium, mountains, city skyline) sit far off and drift slowly, visible well before you reach them.

### Weather

- **Rain:** drops on the *glass* streaking with car speed, splashes of tiny blue cubes outside, a wet sheen on the palette.
- **Snow:** drifting white cubes, snow-capped voxel models, condensation on the glass.
- **Night:** stronger reflections in the glass, headlight sweeps, streetlight pools, a faint glow on the hero's scarf.

### The glass layer

The window is a real surface: faint **reflection** of the kid (stronger in tunnels and at night), **smudges**, a **tint band** at the top, **raindrops**, and **condensation**. Glass effects are always masked away from the gameplay band so they never hurt readability.

### Destruction look (see §8 for systems)

- **Big chunks:** the object splits into 2–6 large voxel clusters that tumble and bounce.
- **Cube spray:** dozens to hundreds of **single small cubes** (1 voxel, some half-size) burst from the break in the object's own colors. They bounce on the road, tumble, roll to a stop, then **shrink-pop** away.
- **Material flavor:** wood sprays brown cubes plus plank clusters, foliage bursts into green cubes that float a bit like leaves, metal throws grey cubes plus bright spark cubes, glass throws translucent cubes with glints, a hydrant shoots a geyser of blue cubes.

## 6. Camera Specification

### Decision: **2.5D side-on gameplay in a full 3D voxel world, with the camera locked to the car and framed by a real 3D interior.**

| Option | Verdict |
|---|---|
| True 3D third-person | Breaks Pillar 1. The car disappears. |
| Fixed-lane 3D (Subway Surfers) | Wrong axis. The kid looks *sideways*. |
| Pure 2D side-scroller | Loses depth, interior framing, and 3D cube sprays. |
| **2.5D: one gameplay plane, full 3D world** | **Chosen.** It matches looking out a side window, keeps platforming readable, and lets voxel debris fly toward and away from the camera. |

### Layering (from the camera outward)

```
 [KID HEAD CAMERA]
     │  INTERIOR: door panel, seal, seatbelt, cupholder, pillars   (real 3D, soft focus)
     │  GLASS: reflection, smudges, rain, condensation              (shader layer)
     │  FOREGROUND: guardrail, reflector posts                       (whips past fast, decoration only)
     │  RUN LINE: hero + everything you interact with              (sharp, the gameplay plane)
     │  MIDGROUND: fields, houses, trees                             (slow parallax)
     ▼  BACKGROUND: silhouettes, landmarks, sky                      (very slow)
```

**In plain terms:** near things whip past fast and far things move slowly, like out any real car window. The hero runs a bit away from the car, where things move past at a comfortable, playable speed. The fast-moving guardrails up close give the *feeling* of speed without making the game harder.

### Framing

- At the gameplay plane, the window shows **about 16 hero-heights wide**. The hero is **about 10–12% of screen height**.
- **Every obstacle is visible for at least 1.2 seconds before you reach it** at default difficulty. Segments are validated against this automatically.
- **At highway speed the camera turns slightly forward**, as if the kid is leaning to look ahead, so you see more of what's coming.

### Heads-Up warnings (anything fast)

Anything that moves faster than the scenery (a vehicle overtaking from behind, a fast oncoming truck, a falling tree from off-screen, a set-piece hazard) gets a **1.5-second Heads-Up**:

- A **chunky glowing arrow icon** on the window edge it will come from, which pulses faster as it gets closer.
- A **distinct audio cue** (an engine rising, a horn tap, a creak).
- Its headlights or shadow appear on the pillar before it does.

Fast vehicles are usually *opportunities* (jump on and ride), not just threats.

### The Kid Head Rig (gameplay camera)

The camera is the kid's head inside a real car:

- It moves within a small box (≈ 25 cm) and rotates a little (yaw ±20°, pitch ±12°).
- It **follows the hero softly**. When the hero jumps high, the kid leans to look up, and the window frame shifts in parallax to show more sky.
- **Car motion:** gentle road vibration, bumps, braking lean, slight roll on turns. *All of it can be scaled down or switched off (Steady Cam).*
- **The interior is real geometry**, so even tiny head movements create parallax between the frame and the world. That sells the window illusion.

### Keeping the illusion that the hero is outside a moving car

1. The car and hero really move forward through a static world, so debris **stays behind** and drifts out the back of the window. That's physically correct and very convincing.
2. The glass is always present, so the hero is always seen *through* a faint reflection.
3. The pillars occlude. The hero can briefly pass behind one.
4. Car events affect the view: bumps jolt it, tunnels darken the interior, overpasses flick shadows across the kid's lap.
5. Outside light spills into the interior.

### Off-screen and accessibility

- If the hero jumps above the window top, a **shadow arrow on the headliner** shows where he is, and the camera tilts up.
- **Window Zoom** (a thinner interior frame), **Steady Cam** (no shake/bumps), and **Ultrawide** (shows more interior, never more gameplay width).

## 7. Core Movement System

### Verb selection

| Candidate | Verdict | Reason |
|---|---|---|
| Run | **Auto.** | Matched to the car. |
| Jump + one air jump | **Keep.** | The air jump is the refreshable resource. |
| Slash | **Keep.** | Attack *and* air-mobility tool. |
| Stomp (Down in air) | **Keep.** | Breaks things below, triggers bounces. |
| Slide (Down on ground) | **Keep.** | Sliding under semi-trailers is a perfect kid fantasy. |
| Grind wires/rails | **Keep (automatic).** | The most iconic image of the premise. |
| Ride vehicles | **Keep (automatic).** | Makes traffic mechanical. |
| Bounce | **Keep (automatic).** | Cars, cows, awnings, geysers. |
| Dash | **Merged into Slash.** | An air slash lunges forward. |
| Vault | **Cut.** | Jump covers it. |
| Wall jump / climb | **Cut.** | No walls on the roadside, and climbing breaks flow. |
| Horizontal speed control | **Cut.** | Frame position is earned, not steered. |

### Controls

| Input | Controller | Keyboard | Touch (future) |
|---|---|---|---|
| **Jump** (hold = higher) | A | Space | Tap right half |
| **Slash** | X | J / Left-click | Tap left half |
| **Down** (Slide / Stomp) | B or ↓ | S / ↓ | Swipe down |
| **GIANT** (when available) | Jump + Slash | Space + J | Two-finger tap |

### Movement spec (starting values; H = hero height; fixed 60 Hz)

- **Jump:** full-hold apex 3.0 H in 0.38 s, minimum tap 1.2 H, fall gravity × 1.6. **Coyote time 0.12 s, jump buffer 0.15 s** (generous).
- **Air jump:** 1 charge, 2.0 H. **It refreshes on any successful interaction.** *This is the engine of chaining.*
- **Slash (ground):** 0.22 s, reach 1.5 H, generous hitbox. Upper-body only, so running never stops.
- **Slash (air):**
  - **On hit:** "Slash-Hop." +1.4 H hop, air jump restored, small forward push in the frame.
  - **On whiff:** a brief float (0.15 s, once per airtime).
- **Stomp:** fast fall. It breaks what's below, bounces off bouncers (3.5 H), and a stomp on plain ground makes a dust ring.
- **Slide:** 0.5 s, low profile, smashes low fragile things automatically. **Jump out of a slide** = a long, low jump.
- **Grind:** auto-attaches when landing on a wire or rail (a generous 0.4 H window). It pushes you forward in the frame, throws sparks, and keeps the chain alive. Jumping off is a full jump with the air jump restored.
- **Ride:** landing on a vehicle roof carries you with it. Faster vehicles move you forward in the frame.
- **Bounce:** landing or stomping on bouncers launches you 3.5–4.5 H.
- **Hitstop:** 3–5 frames on breaks. Essential for feel.

### Frame position (obvious and generous)

The window is split into three clearly shown zones:

| Zone | Where | What it shows | Effect |
|---|---|---|---|
| **LEADING** | Front 35% of the window | Gold glint on the scarf, "LEADING!" sticker on the glass | **Score × 1.5** |
| **Pacing** | Middle | Normal | Nothing. The default and safe zone. |
| **Falling Behind** | Rear 20% | Rear pillar glows warm, hero visibly strains | **Wonder drains slowly** (≈ 4%/s) |

- **Bonk** (hitting a solid hazard, a vehicle's side, or running into a breakable without slashing): a stumble and a modest push back. The chain breaks and Wonder takes a small hit.
- **Pits, ditches, and water:** the hero tumbles and pops right back up (he's fine), with a push back and a small Wonder hit.
- **Recovery is fast and automatic:** on any normal ground the hero drifts back to the middle within about 3 seconds. Grinds, rides, and chains push him forward faster.
- **The rear pillar is a soft wall.** The hero can never be lost behind it. If he's pinned there, he sprints back out automatically.

### Readability rules

1. **Wood and thin things break.**
2. **Wheels and round, soft things bounce.**
3. **Lines (wires, rails, gutters) are grindable.**
4. **Grey concrete and stone hurt.** (Only Giant or falling objects break them.)
5. **Red = hero. Gold = collectible. Glowing outline = imagined platform. Pulsing arrow = something fast is coming.**

These are taught by layout in the first three trips, with only button glyphs drawn on the glass.

## 8. Combat / Destruction System

### Philosophy: toy destruction, choreographed but *physical-feeling*

Destruction is mostly authored and partly simulated. Two visual layers make it work: **big voxel chunks** for weight and **small cube sprays** for spectacle.

### Destruction classes

| Class | Examples | Behavior | Gameplay role |
|---|---|---|---|
| **A. Pop** | Cones, mailboxes, small signs, trash cans, crates, bus-stop glass | Splits into 2–4 chunks plus a 40–80 cube spray along the slash direction. | Chain fodder. |
| **B. Topple** | Telephone poles, trees, streetlights, billboards, sign gantries | The cut happens at the nearest authored **cut socket**, and a cube spray fires along the cut line so it looks *sliced through the voxels*. The top tips over in a **scripted fall**, then shatters on impact into chunks plus a 100–200 cube spray. | **Falling objects are temporary platforms and ramps**, and they **knock other things over** (domino). |
| **C. Run / Structure** | Fence runs, guardrails, scaffolding, power lines, hay stacks | Breaks ripple along the run. Wires snap and whip. | Combo multipliers, launches. |
| **D. Set piece** | Water tower, gas station canopy, crane, car wash brushes | Authored sequences plus huge cube bursts (500+). | Climaxes. |
| **Toy reactors** (never break) | Cars, trucks, buses, cows, shopping carts | Squash, wobble, and bounce like toys. | Platforms, bouncers, rides. |

**Vehicles are never destroyed.** There are people inside. In the kid's mind cars are springy toys. At Tier 3 the big semi grows imaginary voxel *armor plates*, and those are what you slash off (in cube sprays).

### Domino

A falling Topple object checks what it sweeps through as it falls. Anything breakable in its path breaks. So a pole falls onto the next pole for a **chain reaction**, a tree flattens a fence into a **ripple**, a billboard falls flat into a **ramp**, and a pole lands on a car, which **bounces it**. Each object broken by another object scores a **Domino**. Setting these up deliberately is part of mastery.

### The satisfaction recipe (every break)

1. A slash smear on the hero.
2. **Hitstop**, 3–5 frames.
3. A 1-frame white flash on the struck voxels.
4. Layered SFX: crack + material + (at low Wonder) the kid's whispered mouth-sound.
5. **Directional chunk burst** along the slash direction.
6. **Cube spray**: small cubes in the object's colors, bouncing and tumbling on the road.
7. Secondary motion: stumps wobble, wires sway.
8. Camera micro-shake plus rumble.
9. A world-space score pop in chunky voxel numbers.
10. Chunks and cubes rest 2–4 s, then **shrink-pop** away.

### Imagined enemies (sparse)

They only appear at Wonder Tier 2+, so *the real world never has enemies*.

- **Grumbles:** grey static-cube blobs ("bits of boredom") that pop into grey cubes.
- **Puddle Snappers:** imaginary crocodiles in puddles.
- **Wind Socks:** kite flyers you slash-hop off.

Six types max in the full game. They're aerial chain targets and flavor, **not** a combat system.

## 9. Environmental Interaction System

### Component model

Designers combine components. There's no per-object code.

| Component | Effect |
|---|---|
| `Breakable(class, chunks, cube_count)` | Breaks on slash/stomp/domino/giant. |
| `Toppler(cut_sockets, fall_dir)` | Scripted fall, temporary platform, domino sweep. |
| `Solid` | Platform. |
| `Hazard` | Bonks on side contact. |
| `Bouncer(power)` | Launch on landing/stomp. |
| `Grindable(spline)` | Rail. |
| `Rideable(velocity_profile)` | Moving platform. |
| `Launcher(vector)` | One-shot launch (snapping wire, geyser). |
| `HeadsUp(lead_time)` | Edge arrow + audio warning for fast things. |
| `Collectible(type)` | Treasure / sticker. |
| `Imagined(min_tier)` | Only exists at or above a Wonder tier. |

### Signature interactions

- **Mailbox:** pops; the lid flies.
- **Picket fence:** a slide-smash ripple.
- **Trash can:** the lid flies like a frisbee and you can slash-hop off it mid-air.
- **Fire hydrant:** slashing it makes a geyser of blue cubes that works as a bounce pad.
- **Telephone pole + wires:** cutting the pole while you're on the wire snaps it and whips you upward.
- **Billboard:** cut the legs and it falls flat into a ramp.
- **Shopping carts:** stomp one and it rolls, and you can ride it.
- **Cows:** bounce ("moo"). The cow is fine.
- **Hay bales:** stomp them and they roll, flattening fences.
- **Semi-trailers:** slide under or ride on top.
- **Highway sign gantries:** grindable and topple-able.
- **Train:** a moving platform set piece.
- **Scaffolding:** a collapse sequence.
- **Car wash brushes:** spinning hazards and bouncers.

## 10. Road-Trip / Stage Structure

### Trips, not levels

Each stage is a **Trip**: a handcrafted 3–5 minute drive with a destination, a time of day, and one **new mechanic or interaction**. **Every trip ends by arriving.**

### Anatomy of a trip

```
DEPARTURE  →  MAIN ROAD  →  LANDMARK SET PIECE  →  BREATHER  →  FINAL STRETCH  →  ARRIVAL
 slow, teach    core mechanic   (checkpoint)         stoplight /     peak speed,       car parks,
 Wonder 0→1     density rises                        parking lot     Tier 3            music settles
```

- **Checkpoints** at every landmark (roughly every 45–60 s).
- **Car speed is authored** per trip: stops, slow zones, merges, highway stretches.
- **Stoplights are breathers.** The world pauses, the hero idles, and you catch your breath.

### Campaign (12 trips, short errands building to the big trip)

| # | Trip | New mechanic / feature | Set piece |
|---|---|---|---|
| 1 | **The Errand** (neighborhood) | Run, Jump, Slash | The hero's first appearance |
| 2 | **Grocery Run** | Stomp, shopping carts, parking lot | **The Car Wash** (brush monsters) |
| 3 | **School Pickup** | **Wires & grinding** | Power line canyon |
| 4 | **Country Road** | Slide, cows, hay bales | **Race the Train** |
| 5 | **Rainy Drive** | Rain on glass, puddles, falling trees | **The Storm** |
| 6 | **Construction Zone** | Scaffolding, heavy domino | **The Crane** |
| 7 | **City Traffic** | Buses, billboards, stop-and-go | The Overpass Run |
| 8 | **The Interstate** | **Riding vehicles**, speed, gantries | **The Semi-Dragon** |
| 9 | **Mountain Pass** | Tunnels, switchbacks, rockfalls | The Rockslide |
| 10 | **Night Drive** | Streetlights, glowing hero, fog | The Fog Bank |
| 11 | **Grandma's House** (golden hour) | Mastery mix | The Long Hill |
| 12 | **The Big Trip** (summer vacation) | Everything, the longest drive | The Long Bridge → **arriving at the beach** |

**The Wonder cap rises through the campaign:** Trips 1–2 cap at Tier 1, 3–5 at Tier 2, and 6+ reach Tier 3. Early trips stay grounded and later trips get more fantastical.

### Bonus content

- **Bonus sections inside trips:**
  - *Passing Lane*: a truck convoy where the only floor is roofs.
  - *Floor Is Lava*: bridges where the ground is water, so you stay on rails and vehicles.
  - *Parking Lot*: a stationary smash arena while the parent runs inside.
- **Secret routes:**
  - **Vertical routes:** a high route (wires, rooftops) and a low route (ground, slides), all in one plane.
  - **Wonder-gated routes:** imagined platforms appear at Tier 2+ and lead to treasures.

## 11. Progression

**No XP, no skill trees, no stats.** There are four simple layers:

1. **New moves**, introduced by the campaign (one per trip in the first five trips, new interactions after that).
2. **Wonder cap**, which rises through the campaign.
3. **Collections:**
   - **Treasures:** 3 hidden per trip, mostly on Wonder-gated or high routes (bouncy ball, toy dinosaur, glow star…).
   - **Stickers:** trip ranks (1–3 stars).
4. **Cosmetics**, unlocked with stars and treasures:
   - **Hero outfits** (knight, ninja, astronaut, dinosaur costume, cardboard robot).
   - **Swords** (stick, cardboard tube, foam sword, umbrella, glow sword).
   - **Scarf trails.**
   - **Mouth-sound packs.**
   - **Radio stations** (music arrangements).
   - **Voxel palettes** for the world.

**In the car, kept light:** earned stickers go on the window frame, and *your most recent treasure* sits in the cupholder. That's all. Each trip's interior has a couple of props that fit the errand (grocery bags, an umbrella, a beach bag). They're set-dressing, not story.

**Imaginary power: GIANT.** When Wonder is full at Tier 3, press Jump + Slash and the hero **grows to 4× size for 8 seconds**. Everything breaks on contact, including concrete, in enormous cube sprays, and the music peaks. It's the spectacle reward, the trailer shot, and something to save for set pieces.

## 12. Scoring / Mastery

### Chain

- Every **interaction** adds +1 to the chain and refreshes a **2.0 s** chain timer. Plain running doesn't refresh it.
- **Variety rule:** *the same move twice in a row doesn't grow the chain* (it still scores).
- **Verbs:** Slash, Air-Slash, Stomp, Slide-Smash, Grind, Ride, Bounce, Launch, Domino, Near-Miss, Collect.
- **Multiplier** = 1 + ⌊chain ÷ 4⌋, capped at ×8.
- A bonk or timeout **banks** the chain, and banked points fill **Wonder**.
- **LEADING zone:** score × 1.5 while the hero is out in front.

### The target flow sequence

> Jump → **slash sign** → **slash-hop onto car** (Bounce) → **launch to wire** → **grind** → **slash the pole ahead** (wire snaps → Launch) → pole **falls onto fence** (Domino) → **run down the falling pole** → **drop onto a passing truck** (Ride) → keep going.

### Ranks and long-term mastery

- **1–3 stars** per trip by score. **Gold rim** for 3 stars plus all 3 trip objectives (e.g., "Ride a semi for 5 seconds," "Domino 5 poles in one fall").
- Per-trip **leaderboards**.
- **Long Drive** (endless): procedural highway from the segment library, rising speed, a **daily seed**. It ends when the kid gets bored.
- **Replay last chain:** saves the last 15 s as a clip. The game's marketing is players' clips.

## 13. Audio Direction

### The core trick: the radio song becomes the soundtrack

Music **starts on the car radio** (tinny, mono, under road noise) and **leaves the radio as Wonder rises**:

| Tier | Music |
|---|---|
| 0 | Tinny car-radio mix, quiet. |
| 1 | The EQ opens, it goes stereo, a hummed melody layer. |
| 2 | Drums and bass, full-range. |
| 3 | Full arrangement of **the same melody**. Road noise ducks. |
| Giant | Peak layer. |
| Wonder drop | A filter sweep back toward the radio. |
| Arrival | Settles back to the radio. Engine off. Quiet. |

Each trip's radio song is an arrangement of **one main theme** in a different style. That's cost-efficient, and the theme becomes iconic.

### Car layer (always present, ducked by Wonder)

Road hum (asphalt, concrete seams, gravel, bridge deck), tire thumps, an engine following the speed curve, wind at highway speed, the turn signal (tick synced to the music tempo), rain on the roof, the tunnel roar.

### Family layer

Sparse and muffled. The kid isn't really listening. A few short lines ("Almost there," "Who wants fries?") that are clearer at stoplights and arrivals. Very little to localize.

### Hero / world SFX

- **Footsteps** by surface (grass, gravel, metal roof, a buzzing wire).
- **Mouth sounds:** at Tier 0–1, the kid's whispered effects double each action ("shhhing!", "pkew!", "brrrrr" while grinding). By Tier 3 they've become full cinematic SFX. *Imagination upgrades the sound effects.*
- **Voxel destruction:** a satisfying **plastic/wood toy-block clatter** for the cube spray (many tiny clicks with randomized pitch, voice-limited) layered on a material crack: wood crack, metal clang, glass tinkle, foliage whumpf, concrete thud.
- **Electrical:** wire grind buzz, a *TWANG* plus crackle on a snap.
- **Toy reactors:** cars go *boing*, cows *moo*.
- **Heads-Up cue:** a short, distinct rising tone plus the actual sound of the incoming object.
- **Ambience by trip:** lawnmowers, crickets, gulls, city traffic, mountain wind.

### Middleware

Godot 4's built-in interactive and synchronized audio streams for the MVP. Evaluate FMOD for the vertical slice if needed.

## 14. Opening Sequence

**0. Black.** Car door thunk, seatbelt click, engine start. A parent, muffled: *"Okay, quick stop at the store."* Road hum fades in.

**1. Side view (title screen).** The camera is inside the car, across the back seat, looking at the kid **in profile**. Behind them is the window, and the world outside is **out of focus**: colorful blurry blocks going by. The kid is bored: feet swinging, chin on hand. **The title is drawn in the window condensation.** Tinny radio.

**2. Prompt.** *Press to look outside.*

**3. The turn.** The kid's **eyes move first**, then the head turns to the window, and they scoot closer. **Rack focus** pulls from the kid to the outside, and the blur resolves into the crisp voxel world. *That's the first clear look at the art style.*

**4. The camera move.** A smooth ≈ 4 s **arc and push** over the kid's shoulder and into their head position.

**5. The POV handoff.** The kid's **reflection fades up in the glass**. The frame settles into place: door panel, seatbelt, cupholder. Tier 0: the world is muted and ordinary.

**6. The birth of the hero.** The kid breathes on the glass. **A finger draws a little stick figure with a scarf** in the fog, lined up with the roadside. With a soft *pop* and a burst of cubes, **the doodle becomes the voxel hero**, standing on the roadside. He **looks up at the window**, nods, and starts running alongside.

**7. Control.** A Jump glyph appears drawn on the glass. A mailbox approaches. *Play begins.*

**Rules:** the first viewing runs ≈ 25 s and can be skipped from step 2 after that. **Later trips** use a ≈ 6 s version: side view → turn → push in → the hero vaults in from the roadside.

## 15. Ending Concept: Reaching the Destination

**Every trip ends with arrival.** That's both the per-trip ending and the game's ending.

### Per-trip arrival (≈ 10 s, then the score screen)

1. A parent: *"Here we are."* The car slows and the speed curve eases to zero.
2. The world eases back down from the current Wonder tier. Color settles, and the music folds back into the radio.
3. The hero does a **final flourish** at the destination (a flip off the store sign, a landing pose by the school gate), turns to the window, and **waves**.
4. The car parks. Engine off. The engine ticks as it cools. Quiet.
5. The seatbelt clicks open and the kid's hand leaves the glass. **Score card**, drawn as stickers on the window.

### The final arrival (Trip 12, The Big Trip)

The longest drive of the game builds to the biggest set piece, **the Long Bridge**, at peak Wonder. Then the road crests a hill, and **the ocean fills the window.** The car rolls into the beach parking lot. Through the window the hero runs down the sand to the water's edge, turns, and waves at the kid, bigger and brighter than ever. The kid's door slides open, there's sunlight and gulls, and **the credits roll over the beach view**. The music plays its final full arrangement of the theme, *without* the radio filter for the first time.

After the credits: *"Where to next?"* → trip select, Long Drive, and ranks.

The ending is simple and happy: **you got there.**

## 16. MVP Specification

**Goal:** prove the fantasy in one trip. *Sit in the backseat → look out the window → control the imagined hero → run beside the car → jump/slash/destroy voxel things → feel like a kid imagining an adventure.*

**Timebox:** 6–8 weeks (solo + AI), after a 2-week feel prototype.

### In scope

- **One trip** (≈ 3 min): neighborhood → main road → short highway → **arrival**.
- **Opening** (simplified): side view → press → turn → push into POV → hero pops in.
- **Kid Head Rig** with a 3D interior frame (greybox-plus) and basic glass reflection.
- **Hero:** auto-run, Jump + air jump, Slash (ground/air, slash-hop), **wire grind**.
- **Frame zones** (Leading / Pacing / Falling Behind) with clear visuals.
- **Wonder:** Tiers 0 and 2, palette swap plus one music stem plus hero color. The "kid gets bored" fail with its warning. Checkpoints.
- **Heads-Up** warning for one fast vehicle type.
- **Voxel destructibles:** mailbox, fence, sign, **telephone pole (topple + domino + wire snap)**, tree. Chunks plus cube sprays.
- **One vehicle** (car): ride and bounce.
- **Car speed timeline** with one stoplight breather.
- **Chain** with the variety rule and multiplier.
- **Audio:** road hum, one radio track in 2 stems, ≈ 15 SFX including the cube-clatter.
- **UI:** start, pause, retry, end score.

### Out of scope

Stomp, slide, Giant, enemies, collectibles, cosmetics, multiple trips, set pieces, settings beyond volume.

### Success criteria

1. **Clip test:** ≥ 7 of 10 people say some version of *"I used to do that"* from a 10-second capture.
2. **Fun test:** ≥ 50% voluntarily replay the trip to raise their score.
3. **Accessibility test:** non-gamers reach the destination on their first or second try.
4. **Feel test:** jump and slash feel good even without the window frame.
5. **Destruction test:** breaking a telephone pole makes playtesters laugh or say "whoa."
6. **Performance:** locked 60 fps on Steam Deck with heavy cube sprays.

## 17. Vertical Slice Specification

**Goal:** final-quality proof for the trailer, the Steam page, and the demo. **≈ 4 months after MVP.**

- **Three trips at final quality:** *The Errand*, *Country Road* (Race the Train), *The Interstate* (the Semi-Dragon).
- **Full move set,** including Stomp, Slide, Ride, Bounce, and **Giant**.
- **Wonder Tiers 0–3** with the transformation wave and 4-stem music.
- **≈ 15 destructible types,** 4 vehicle types, 2 imagined enemies.
- **Heads-Up** for every fast object.
- **Final art:** voxel kit, palettes, hero, kid, minivan interior, glass, tilt-shift.
- **Ranks, objectives, stickers,** replay clip.
- **Polish:** juice pass, mouth sounds, accessibility (Steady Cam, Window Zoom, Sunday Driver).
- **PC + Steam Deck,** full controller support.

**Exit criteria:** a trailer cut from real gameplay, a Steam page live, Next Fest demo median session ≥ 20 min.

## 18. Full Game Specification

> **About Early Access:** not recommended for the campaign. Use a free demo (the vertical slice) plus **Long Drive** for community testing. If EA is financially necessary, ship the Expanded tier as EA.

### Expanded (demo / optional EA, ≈ 6 months after the slice)

- 6 trips.
- Long Drive with a daily seed and leaderboards.
- ≈ 20 cosmetics.
- Trip select drawn as a **paper road map**.

### Full version (1.0)

- **12 trips**, ending with The Big Trip's arrival at the beach.
- **Wonder Tiers 0–3**, plus Giant.
- **≈ 35 destructible types,** 8 vehicle types, 6 imagined enemies, 8 set pieces.
- **Backseat Co-op** (local 2P): a sibling sits in the other seat, two heroes share the window, and chains can link between players. Ship it at 1.0 if it's on track, otherwise as a free update.
- **Long Drive,** daily routes, leaderboards.
- **≈ 40 cosmetics.**
- **Photo mode** (from inside the car).
- **Accessibility:** remapping, Steady Cam, Window Zoom, **Sunday Driver** (car drives 20% slower), **No Boredom** (Wonder can't empty), colorblind-safe shape coding, subtitles.
- **Platforms:** Steam (PC/Deck) at launch, Switch-class port after. Mobile evaluated later.

## 19. Technical Architecture

### Key decisions

1. **The car moves through a static world.** The car rig (camera + interior) and the hero move forward along +X. The world stays still. Debris and physics are naturally correct, and cubes get left behind. A **floating origin** rebases every 1,000 units.

2. **The gameplay plane is straight. Curves are faked.** Height follows an authored profile (hills, bridges). Turns are presentation only: sun rotation, interior light sweeps, background drift, slight roll.

3. **The hero is a custom kinematic controller.** Deterministic at 60 Hz, plane-locked, with swept collision.

4. **Voxel content pipeline.**
   - Models are authored in **MagicaVoxel** (`.vox`).
   - A custom **VoxPipeline** tool (offline, AI-writable) converts them:
     - **Greedy-meshed** render mesh, with the palette index stored per vertex.
     - **Break clusters**, authored as separate layers or groups in MagicaVoxel and exported as separate chunk meshes.
     - **Cut sockets** (for Topple objects) from marker voxels.
     - A **cube-spray color list** (a weighted sample of the model's voxel colors).
     - Simple collision boxes.
   - Everything lands in Godot as ready-to-use scenes and resources.

5. **Three-tier physics.**
   - **Cube spray: GPU particles.** Each small cube is a particle instance with a box mesh, colored from the object's spray list, with gravity, spin, and **collision against a heightfield** of the road (Godot's GPU particle heightfield collision). Thousands of cubes for very little CPU.
   - **Big chunks: ChunkSim.** A lightweight custom "fake rigid body" sim: position, velocity, rotation, and spin, colliding only with the analytic ground profile, with bounce, friction, and sleep. No chunk-to-chunk collision. Rendered with MultiMesh. Hundreds of chunks cheaply.
   - **Real physics (Jolt): only a few "hero pieces"** that must interact (rolling hay bales, shopping carts). Capped at ≈ 30.
   - **Scripted:** topples (eased hinge fall plus swept capsule for domino), vehicle squash/bounce (spring-damper on transforms), set pieces.
   - **Verlet:** snapped wires (8–12 points). Intact wires are curves.

6. **Palette-driven shading.** Voxel models use palette indices, so **Wonder tiers and trips are just palette textures**. Transitions are a world-space **"imagination wave"** from the hero that blends palette A into palette B. Tier-only props (truck armor, cloud whales, imagined platforms) are toggled meshes. The voxel bevel/edge highlight is in the same shader.

7. **Rendering layers.** The interior and exterior share a scene but use separate light layers. The glass is a shader quad with a pre-rendered kid reflection driven by head pose. Tilt-shift is a masked half-res blur.

8. **Heads-Up system.** Every `HeadsUp` object registers its predicted arrival time at the hero's position. A HeadsUpDirector shows the edge arrow and plays the cue 1.5 s ahead.

### Module layout (Godot project)

```
/game
  /core        GameState, TripDirector (timeline), Checkpoints, SaveSystem, Settings
  /car         CarRig, KidHeadCamera, InteriorFX, GlassFX, KidAnimator
  /hero        HeroController (state machine), HeroInput (buffering), HeroAnim, HeroFX
  /frame       FrameZones (position, zones, catch-up, Leading bonus)
  /world       SegmentStreamer, Segment, ParallaxLayers, Landmarks, PaletteSystem, FloatingOrigin
  /interact    Breakable, Toppler, Solid, Hazard, Bouncer, Grindable, Rideable, Launcher,
               HeadsUp, Collectible, Imagined
  /fx          CubeSpray (GPU particles), ChunkSim (+ MultiMesh), Hitstop, CameraShake, Rumble
  /score       ChainSystem, WonderSystem, Ranks, Objectives
  /audio       AudioDirector (stems, radio filter), CarAmbience, SfxBank, MouthSounds
  /ui          TitleSideView, Pause, PaperMapSelect, EndOfTrip, GlassHUD, HeadsUpArrows
/data
  /trips       *.tres  (speed curve, segments, events, palette, interior props, Wonder cap)
  /segments    *.tscn  (authored segments tagged by speed band / verbs / difficulty)
  /palettes    *.png   (per trip × per tier)
  /vox         source .vox models
/tools
  VoxPipeline          (.vox → meshes, clusters, sockets, spray colors)
  SegmentValidator     (reachability + minimum 1.2 s visibility checks)
  BotPlayer            (auto-player for regression/balancing)
  TripPreviewer
```

**Event bus:** systems communicate through signals (`object_broken`, `chain_banked`, `wonder_changed`, `heads_up`, `car_event`, …). Audio, FX, score, and UI subscribe, so each system can be edited in isolation.

**Determinism:** hero, frame position, chain, and Wonder are deterministic from (trip + input log), because debris doesn't affect gameplay. That gives cheap replays, clips, and leaderboard validation.

## 20. Recommended Engine

**Godot 4 (current 4.x), with built-in Jolt physics, Forward+ on PC, and the Mobile renderer for Switch-class hardware.**

- **Text-based scenes and resources**, so AI tools can read and write levels, data, and scenes directly. This is the deciding factor.
- Good GPU particles with **heightfield collision**, which is perfect for cube sprays.
- MultiMesh for chunks and repeated voxel props.
- No licensing fees, fast iteration, good Steam Deck performance.
- GDScript for gameplay and tools. Port hot loops (ChunkSim) to C# or GDExtension only if profiling says so.

**Trade-offs:** console ports go through a partner (e.g., W4 Games), so contact them during the vertical slice. **Unity 6 (URP)** is the fallback if console-first; the design carries over unchanged. Not Unreal (overkill, a worse fit for AI text workflows).

## 21. Recommended Asset Strategy

1. **Voxel models in MagicaVoxel.** It's free, fast, and voxel art is approachable for a solo dev. Build a **library of reusable voxel parts** (pole segments, crossbars, canopy blobs, wheels, sign plates) and assemble variants from them.
2. **Author break clusters in the model** (separate layers), and the pipeline handles the rest.
3. **No textures outside.** Palette only. Tiny memory, instant recoloring for trips and Wonder tiers.
4. **The interior is the hero asset.** One minivan rear-seat interior (smooth, non-voxel) at the highest quality in the game, since it's on screen 100% of the time. Per-trip props are a few simple swaps.
5. **Characters:**
   - Voxel hero, rigged by body part (voxel parts parented to bones, which is easy to animate), ≈ 25 clips.
   - Smooth-modeled kid, ≈ 10 clips.
   - Animation is hand-keyed by you or a contractor. Feel lives here.
6. **Audio:** commission one main theme plus arrangements (radio versions and 4-stem versions). Record mouth sounds with appropriate consent (or an adult who can convincingly do them). Record **custom toy-block foley** (real wooden and plastic blocks) for the cube clatter, since it's the most-heard sound in the game.
7. **Generative AI art in shipped assets: no.** Use it for reference and mood only. Voxel art is very achievable by hand, and this audience values handmade.

## 22. Procedural vs Handcrafted Content Strategy

| Content | Approach |
|---|---|
| Campaign trips | **Handcrafted** sequences of handcrafted segments |
| Segments | Handcrafted, tagged, with small variant randomization for replay |
| Set pieces | Fully handcrafted and scripted |
| Background scenery | **Procedural scatter** of voxel props by biome rules |
| Long Drive | Procedural assembly of the same segment library, Spelunky-style |
| Destruction | Authored clusters and sockets plus procedural variation (impulse spread, spin, spray amounts) |

The rule: **handcraft anything the player interacts with. Generate anything they only look at.**

## 23. Performance Considerations

**Targets:** 60 fps locked on Steam Deck, 60 fps (dynamic res) on Switch-class hardware, 120+ fps on mid-range PC.

- **Voxel meshes:** greedy meshing keeps triangle counts low. Merge static segment geometry at load. MultiMesh for repeated props.
- **Cube spray budget:** ≈ 4,000 live GPU cubes on Deck (≈ 1,500 on Switch-class), with oldest shrink-popped first. Half the spray count in the distance, and scale counts by platform.
- **ChunkSim:** ≤ 300 live chunks. **Jolt:** ≤ 30 bodies.
- **Heightfield collision** for particles covers only the area around the gameplay plane and moves with the car.
- **Streaming:** ≈ 3 segments ahead, 1 behind, pooled.
- **Shadows:** one tight cascade. No shadows for spray cubes.
- **Glass:** pre-rendered reflection, no real-time reflections.
- **Tilt-shift:** half-res separable blur.
- **Interior:** baked lighting plus one animated light cookie.
- **Audio:** voice-limit the cube clatter (it's lots of tiny sounds, so use pooled one-shots with a max concurrency).

## 24. AI-Assisted Development Strategy

**AI is a fast junior engineer with perfect documentation recall and no taste.** You own feel, art, and music. AI owns volume.

### What AI should do

- **Gameplay code** in small, decoupled modules, each with a short spec in `/docs/systems/`.
- **Tools:** VoxPipeline, SegmentValidator, BotPlayer, TripPreviewer.
- **Shaders:** palette wave, voxel edge bevel, glass, tilt-shift, curved horizon. AI drafts them and you art-direct.
- **Segment candidates** as `.tscn` text from specs, **validated by the bot**, **curated by you**.
- **Tests:** headless deterministic tests for jump heights, chain rules, frame zones, Wonder math, and trip reachability.
- **Telemetry scripts** for playtests (where Wonder drops, where players bonk).

### Practices

1. Keep this doc and a `TUNING.md` in the repo. All numbers go in resources, never hard-coded.
2. One system per prompt, with tests.
3. Deterministic sim plus input-log replays for automated regression.
4. **Feel is human-only.**
5. Small commits, everything reviewed.

### What AI should NOT do

Final animation, final music, final hero/kid/interior art, opening sequence timing, or feel tuning.

## 25. Major Technical Risks

| Risk | Mitigation |
|---|---|
| **Hero feel at speed** (tunneling, landing on moving vehicles) | Custom kinematic controller, swept collision, fixed timestep, prototyped first. |
| **Cube spray cost on low-end hardware** | GPU particles with heightfield collision, per-platform budgets, oldest-first pop-out, worst-case domino stress test. |
| **Voxel look reading as generic/Minecraft** | Edge-bevel shader, no terrain grid, curated palettes, tilt-shift, interior contrast. Run screenshot tests early. |
| **VoxPipeline complexity** | Keep it simple: layers → clusters, marker voxels → sockets. Build it during MVP. |
| **Floating-point drift** | Floating origin, plus a 2-hour headless Long Drive test. |
| **Interior/exterior lighting mismatch** | Separate light layers from day one. |
| **Glass hurting readability** | Effects masked away from the gameplay band. |
| **Motion sickness** | Steady Cam, conservative defaults, roll ≤ 2°. |
| **Console porting with Godot** | Engage a partner early. Unity fallback documented. |

## 26. Major Design Risks

| Risk | Mitigation |
|---|---|
| **The nostalgia wears off and it's "just a runner."** | Chains, variety rule, domino, set pieces in every trip, Wonder-gated routes, short trips, Long Drive. |
| **Auto-run feels passive.** | Dense decisions every 2–3 s, high and low routes, LEADING bonus. |
| **Too easy means boring for experts.** | Generous to *finish*, demanding to *3-star*. Leaderboards and Long Drive for depth. |
| **Window frame shrinks the playable area.** | Large minivan window, Window Zoom, lean-to-look. |
| **Fast objects feel unfair.** | Heads-Up on everything fast, 1.2 s minimum visibility validated automatically. |
| **Readability (breakable vs hazard).** | Five readability rules, consistent palette coding, teaching through layout. |
| **Tone: violence toward real people.** | Vehicles never break, enemies are imaginary, cows bounce. |
| **Cube spray visual noise hiding hazards.** | Spray cubes are cosmetic, fall *away* from the hero's path, and shrink fast. Hazards keep a strong outline. |

## 27. What Should NOT Be Built

- A driving game. The player never steers.
- An open world, or free-roam on foot.
- A 3-lane runner. One plane only.
- **Kid Logic / real-world cause-and-effect gimmicks.** The hero doesn't change traffic lights or make trucks honk.
- **A narrative arc** told through the interior. The interior is set-dressing.
- Destroying vehicles, or harming people or animals.
- XP, stats, skill trees, crafting, currencies.
- **A voxel terrain grid or diggable/editable world.** Voxels are for objects.
- Runtime voxel fracture simulation (Teardown-style). Breaks use authored clusters plus particles.
- Full rigid bodies for all debris.
- Wall-run, climb, grappling, guns, spells, a second power.
- Horizontal speed control.
- Dialogue, voiced story, long cutscenes.
- Online multiplayer (local co-op only).
- F2P monetization, energy systems, ads, loot boxes.
- A level editor (before 1.0).
- Licensed music or car brands.
- A camera outside the car.

## 28. Development Roadmap

**Assumption:** one developer + AI tools, with a contracted animator, composer, and porting partner. ≈ 18–22 months to 1.0.

### Phase 0 — Feel Prototype (2 weeks)
- Greybox plane, hero controller, jump/slash/air jump/slash-hop, scrolling world, wires, frame zones.
- A quick cube-spray test on a voxel pole.
- **Gate:** is it fun with no art and no frame? If not, iterate up to 2 more weeks before moving on.

### Phase 1 — MVP (6–8 weeks)
- Everything in §16: VoxPipeline v1, interior, Kid Head Rig, glass, opening, ChunkSim, GPU cube spray, topple/domino, one trip, Wonder 0/2, Heads-Up, arrival.
- **Gate:** the §16 success criteria.

### Phase 2 — Vertical Slice (≈ 4 months)
- Months 1–2: lock the art direction (voxel library, palettes, edge shader, hero, kid, interior), Wonder 0–3, full move set.
- Month 3: Country Road and Interstate, Train and Semi-Dragon set pieces, music stems.
- Month 4: polish, accessibility, juice, Deck performance.
- **Gate:** trailer from real gameplay, Steam page live.

### Phase 3 — Demo & Market Test (≈ 2 months, overlapping)
- Next Fest demo, Long Drive prototype, clip sharing, telemetry.
- **Gate:** wishlists and demo metrics justify full scope. Otherwise ship a smaller 6-trip version.

### Phase 4 — Production (≈ 8–9 months)
- Trips 4–12 at ≈ 3 weeks each (segments, set piece, palette, music arrangement).
- Cosmetics, paper map, objectives, co-op decision at month 4.
- The Big Trip and its beach arrival get extra polish time.
- Monthly Switch-class test builds.

### Phase 5 — Polish & Launch (≈ 3 months)
- Content lock, balancing via telemetry and the bot, localization, certification prep.
- Launch on Steam (PC/Deck). Console port 1–3 months after.

### Post-launch
- Free update: co-op (if deferred), new Long Drive biomes, daily routes.
- Possible DLC trip pack.

---

## Appendix A — The Design in One Page

- **You are** the imaginary runner beside the family car, seen only through the backseat window.
- **You press** Jump, Slash, Down.
- **You chain** slashes, hops, grinds, rides, bounces, and domino falls, and the same move twice doesn't count.
- **You keep pace**: lead the car for bonus points, and if you fall behind he catches back up.
- **You transform** the world: chains fill Wonder, and Wonder turns reality into fantasy and the radio into a soundtrack.
- **You smash** chunky voxel objects into sprays of tumbling cubes.
- **You fail** only if Wonder runs out and the kid gets bored.
- **You arrive.** Every trip ends at its destination, and the last one ends at the beach.

## Appendix B — Starting Tuning Table

| Parameter | Value |
|---|---|
| Hero height (H) | 1.6 m |
| Voxel size | 1/12 H (≈ 13 cm) |
| Hero height in voxels | ≈ 12 |
| Visible window width at gameplay plane | 16 H |
| Scroll speeds (residential / town / highway) | 6 / 8 / 11 H/s |
| Minimum obstacle visibility | 1.2 s |
| Heads-Up lead time | 1.5 s |
| Zones: Falling Behind / Pacing / Leading | rear 20% / middle / front 35% |
| Leading bonus | × 1.5 score |
| Falling Behind Wonder drain | ≈ 4% per second |
| Return-to-middle time | ≈ 3 s |
| Jump (full / min) | 3.0 H / 1.2 H, apex 0.38 s |
| Fall gravity multiplier | 1.6 |
| Air jump | 2.0 H, 1 charge, refreshed by any interaction |
| Coyote / buffer | 0.12 s / 0.15 s |
| Slash | 0.22 s, reach 1.5 H |
| Slash-hop | +1.4 H |
| Stomp bounce | 3.5 H |
| Slide | 0.5 s, 0.45 H tall |
| Grind attach window | 0.4 H |
| Chain timer | 2.0 s |
| Multiplier | 1 + ⌊chain/4⌋, max × 8 |
| Hitstop | 3–5 frames |
| Giant | 4× scale, 8 s |
| Cube spray (pop / topple / set piece) | 40–80 / 100–200 / 500+ |
| Live cube budget (Deck / Switch-class) | ≈ 4,000 / ≈ 1,500 |
| ChunkSim / Jolt budgets | 300 / 30 |
