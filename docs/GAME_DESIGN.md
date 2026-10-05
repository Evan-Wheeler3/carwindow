# WINDOW SEAT
### Game Design Document — v0.1 (pre-production)

> *Every kid who ever rode in a backseat had a little guy running alongside the car.*
> *This is the game where you finally get to control him.*

Working title: **WINDOW SEAT** (alternates: *Keep Pace*, *Backseat Hero*, *Out the Window*).

---

## How to read this document

Part I is the important part. It's where I work out **what makes this game itself**: the handful of design decisions that turn "kid imagines a runner" into a game with its own mechanics, look, and emotional shape. Everything in Part II (the 28 requested sections) comes from those decisions. If a feature in Part II doesn't serve Part I, it should be cut.

---

# PART I — FINDING THE IDENTITY

## The 10-second clip

This is the clip that has to make someone say *"I used to do exactly that"*:

> A soft, slightly dim car interior. A minivan door panel, a seatbelt strap across the bottom corner, a juice box in the cupholder. Through the glass is a bright, sharply lit **toy-diorama world** going by. A tiny hero in a long red scarf sprints along the roadside, matching the car's speed. He jumps a mailbox and slashes a telephone pole. The top half topples **in chunky blocky pieces**, lands across a fence and flattens it, and he runs up the falling pole, onto the power line, and grinds it with sparks. Faintly reflected in the glass, the kid's face is grinning. The tinny song on the car radio swells into a full orchestral version of itself.

Nobody needs that clip explained. The rest of this document is about making sure the game stays fun **after** the recognition wears off.

## The five design discoveries

These are the core ideas. Each one turns part of the nostalgic premise into a mechanic, so the nostalgia does real work instead of sitting on top as decoration.

### Discovery 1 — The window is the screen, and *where the hero is in the glass* is your health.

In real life the imaginary runner only exists while you can see him through the window. If he falls behind, he slides back past the rear pillar and he's gone. **That's the fail state.** There's no health bar. The hero's horizontal position in the window frame *is* how well you're doing:

- Clean play, chains, and hitching rides on faster vehicles push him **forward** in the frame.
- Bonks and stumbles knock him **backward** toward the rear pillar.
- If he passes behind the rear pillar (the C-pillar) he's **lost**.

This produces a risk/reward dial **straight out of the geometry**. Obstacles come in from the front edge of the window. A hero near the front edge is "leading the car" and scores a multiplier, **but has less time to react**. A hero near the rear edge has lots of time to see what's coming, **but is one bonk away from being lost**. Nobody had to design that tension; it comes from the framing.

### Discovery 2 — Parallax is the difficulty curve.

Out a real side window, near things whip past and far things crawl. The game uses this directly:

- The **gameplay plane** (the "Run Line") sits at **mid-distance**, so obstacles move past slowly enough to read and react to.
- The **foreground layer** (guardrail posts, near-lane cars, reflector poles) blurs past fast. It carries the *sensation* of speed without carrying the *difficulty*.
- The **background** (fields, skyline, mountains, landmarks) creeps along. It carries the feeling of a long drive and lets you **see landmarks coming a minute ahead**, exactly like spotting the water tower from the highway.

This lets the car go "highway fast" without the game becoming unreadable, and the solution is physically correct rather than a cheat.

### Discovery 3 — The better you play, the more imaginary the world becomes.

The arc REAL WORLD → IMAGINED HERO → IMPOSSIBLE HEROICS → FULL CHILDHOOD FANTASY isn't only a campaign arc. **It happens inside every trip, and it's driven by performance.** A meter called **Wonder** fills as you chain moves, and it steps the world up through four tiers:

| Tier | Name | What the world looks like |
|---|---|---|
| 0 | **Just Looking** | Muted, overcast, ordinary. The hero is a pale doodle-figure. The radio is tinny. |
| 1 | **Pretend** | Color warms up. The hero gets a cardboard sword. Kid mouth-sound effects. |
| 2 | **Adventure** | Saturated, dramatic sky, drums come in. *Imagined platforms* appear and open high routes. |
| 3 | **Legend** | Full fantasy. Trucks become armored beasts and clouds become whales. Orchestral music. The sword glows. |

**Failure runs the other way.** Losing the hero drops you one tier, and reality seeps back in. Losing him at Tier 0 means **the kid gets bored**: they sigh, slump back, and look away from the window. *That* is game over, and it's the most on-theme fail state the game could have.

Escalating imagination becomes a reward you can see and hear, not a cutscene.

### Discovery 4 — Kid Logic: the imaginary hero seems to affect the real world.

Every kid believed they made the traffic light turn green. The game takes that seriously:

- At a red light, clear the **Stoplight Challenge** and the light turns green. (It would have anyway. Don't tell the kid.)
- Do the arm-pump gesture at a semi and **the trucker honks**.
- Slash the "DETOUR" sign and Dad mutters "huh, guess we'll take the scenic route." That opens a **secret branch** of the trip.
- Stay airborne through the whole tunnel and the kid **holds their breath** the entire way.

These moments drive the secrets, the bonus content, and the hardest "I did that too" recognition hits.

### Discovery 5 — The car interior is the trophy shelf and the storyteller.

The window frame is on screen 100% of the time, so it's the most-seen asset in the game. Use it for two things:

- **Progression lives in the frame.** Collectibles show up *inside the car*: stickers on the glass, a keychain on the backpack, a toy in the cupholder, a crayon drawing taped to the seat back. Your progress is visible in every screenshot.
- **Story lives in the frame.** There's no dialogue and no cutscenes. What's in the car tells you what this drive is about: grocery bags, beach towels, a new baby seat, and eventually moving boxes stacked against the window. (Think *Unpacking*: storytelling through objects.)

## What this game is / is not

| It IS | It is NOT |
|---|---|
| A **handcrafted** run-and-destroy platformer made of short "trips" (3–5 min) | An endless runner (one optional mode, not the core) |
| Played **entirely through one window** | A driving game |
| A single gameplay plane, side-on | A 3-lane "swipe left/right" runner |
| Toy-like, chunky, physical destruction | A physics sandbox |
| Wordless, warm, quietly emotional | A story game with dialogue |
| Immediately readable: **3 buttons** | An RPG with stats and skill trees |

---

# PART II — THE DESIGN

## 1. Core Game Pillars

1. **The Window Is The World.** Everything is seen through the backseat window. The car interior is always on screen. No exceptions, including menus. Every feature has to work inside this frame.
2. **Keep Pace.** The hero runs *alongside the car*. The car's speed is the game's tempo, and staying in the window is staying alive.
3. **Everything Is An Obstacle Course.** Ordinary roadside objects become platforms, rails, trampolines, and things to smash. Interaction comes before decoration.
4. **Toys Break Beautifully.** Destruction is chunky, readable, and physically funny, and it follows *toy physics*, not realism.
5. **Imagination Is Earned.** The world gets more fantastical *because you're playing well*. Reality is the fail state.

Tiebreaker rule: if a feature conflicts with Pillar 1, cut the feature.

## 2. One-Sentence Pitch

**Window Seat is a physics-destruction platformer played entirely through the backseat window of the family car: you control the imaginary hero every kid pictured running alongside, and the better you play, the more the world outside turns into their imagination.**

## 3. Expanded Pitch

You're eight years old, and the drive to the store is taking forever.

You press your forehead to the window, and out there a little hero in a red scarf starts running beside the car. He vaults mailboxes, cuts telephone poles in half, runs up the falling pole onto the power lines, grinds them in a shower of sparks, drops onto the roof of a passing semi, and rides it past the car.

*Window Seat* is a game of short, handcrafted car trips over one formative year of a kid's life: errands, school pickups, the highway to Grandma's, a rainy night drive, a summer vacation, and finally moving day. Each trip is a 3–5 minute run-and-destroy platforming course along a road that's half real and half imagined, framed the whole time by the backseat window.

The controls are three buttons: **Jump**, **Slash**, **Down**. The depth is in **chaining**: slash into a hop, a hop onto a wire, a wire into a pole-snap, a snap into a launch, a launch onto a truck. Every object reacts physically, falls on other objects, and becomes a platform for the next move. Play well and the world transforms around you: color floods in, the radio song swells into an orchestral theme, trucks become dragons, and secret imagined routes open in the sky. Play badly and reality creeps back in. The hero slips behind the window pillar, and the kid, bored, looks away.

There's no dialogue. The story is told by what's inside the car, and it ends somewhere every player has been, from the other side of it.

**Platforms:** PC/Steam (lead), Steam Deck, Nintendo Switch-class hardware. Mobile possible later; the controls are designed to allow it.
**Price point:** $15–20 premium. No F2P, no energy systems.
**Audience:** 25–45-year-olds who were that kid, plus families and kids (E/PEGI 7). Streamer-friendly, clip-friendly.
**Comparables:** *Sayonara Wild Hearts* (music-driven flow + emotion), *Alto's Odyssey* (mood, one-button grace), *Rayman Origins* runner levels (feel), *Neon White* (route mastery), *Katamari Damacy* (escalating absurdity), *Unpacking* (wordless storytelling through objects).

## 4. Target Player Experience

**First 30 seconds:** recognition. *"Oh. Oh no. I did this."*
**First 5 minutes:** delight. Things break, the hero is unreasonably cool, the world lights up.
**First hour:** mastery begins. *"Wait, if I slash the pole while I'm on the wire, it launches me?"* Players start planning routes.
**Hours 2–6 (campaign):** variety and escalation. New road types, new verbs, set pieces (racing the train, the car wash, the storm), and a quiet story through the interior.
**After the credits:** mastery and collection. Gold stickers, perfect chains, secret detours, plate collection, Long Drive endless mode, daily routes, backseat co-op.

**Emotional curve of every trip:**

```
 boredom → curiosity → freedom → peak imagination → arrival (gentle return to reality)
   grey      hero appears   flowing chains   Tier 3 / set piece     engine off, silence
```

Arrival is the signature beat: the car pulls in, the music folds back into the tinny radio, the engine ticks as it cools, the hero gives a little wave and fades. **You don't want the trip to end.** The game deliberately flips "are we there yet?"

## 5. Visual Style Specification

### Decision: not voxels. **"Block-Built Toy Diorama."**

I took voxels seriously and rejected them as the primary style:

- **Pure voxel grids read as Minecraft or Crossy Road** within a second. The screenshot identity is gone.
- **Uniform grids flatten silhouettes.** A telephone pole made of 1-unit cubes looks like every other voxel pole.
- **Voxel destruction (Teardown-style) is expensive**, and breaking into identical cubes looks generic.

Alternatives considered:

| Style | Verdict |
|---|---|
| Pure voxel | Rejected. Derivative look, costly destruction. |
| Hand-drawn 2D | Charming and kid-like, but loses physical 3D destruction and the parallax-through-glass effect. |
| Papercraft / cardboard | Very "kid-made," but tearing is less satisfying than breaking. **Kept as a cosmetic world skin and as the Tier-1 hero's sword.** |
| Claymation | Beautiful, but production cost is out of scope. |
| **Block-built toy diorama** | **Chosen.** |

**What "block-built" means:** every object outside the window is *assembled from a small number of chunky, beveled pieces* (4–20 per object), like a wooden toy set or chunky building blocks. The pieces are irregular (wedges, octagonal cylinders, rounded blobs, beveled slabs), not a uniform grid.

Why it wins:

1. **Destruction is built in.** Breaking an object means *releasing the pieces it's already made of*, plus a few pre-split variants. It's cheap, readable, and art-directable.
2. **Strong silhouettes.** Pieces are shaped for each object, so a pole reads as a pole.
3. **Toy materiality.** Bevels catch light, and soft AO between pieces says "physical object you could pick up."
4. **One palette texture runs the whole world.** That makes Wonder tier transitions nearly free (see §19).

### The core contrast: inside vs outside

| | **Inside the car (REAL)** | **Outside the window (IMAGINED)** |
|---|---|---|
| Geometry | Smooth, curved, believable proportions | Chunky, beveled, exaggerated |
| Materials | Fabric, scuffed plastic, vinyl, rubber seals, real-ish textures | Flat-ish painted toy surfaces, vertex color + palette |
| Lighting | Soft, warm, low-contrast, slightly dim | Bright, crisp, high-contrast key light |
| Focus | Slightly soft (camera is focused *out*) | Sharp at the Run Line, **tilt-shift blur** top/bottom |
| Scale | 1:1 human | Miniature-diorama scale cue |

**Tilt-shift is the signature filter.** A vertical gradient blur above and below the Run Line makes the outside world look like a tabletop model, *a toy world the kid is playing with*. It's cheap (no real DOF needed) and it makes the game recognizable from one screenshot.

### Density and scale rules

- **Hero height = 1 H** (≈ 1.6 m in-engine). Everything is measured in H.
- **Smallest debris chunk ≥ 1/6 H.** Nothing breaks into dust-sized pieces, so everything stays chunky.
- **Max 20 pieces per breakable** (most have 4–10).
- **Props are slightly over-scaled toward the hero**: mailboxes at 0.8 H, poles at 6 H, trees at 4–7 H. The hero should look heroic, not tiny.

### Character design

**The Hero ("the Runner").** About 2.5 heads tall, big hands and feet, a hood or cap, and an **enormous red scarf** that trails behind. The scarf is a speed indicator and the silhouette signature, the way Mario's cap or Journey's cloak works. He holds a stick or cardboard-tube sword that grows more real with Wonder. His face is two dots and a determined brow. He's readable at 10% screen height, and **red is reserved for the hero** in every palette.

He evolves with Wonder:
- Tier 0: pale paper-white with a crayon outline. A doodle.
- Tier 1: colored in, cardboard sword.
- Tier 2: full color, wooden sword, scarf grows longer.
- Tier 3: sword glows, light trail, scarf like a banner.

**The Kid.** About 8 years old, in a hoodie, deliberately ambiguous so players project onto them. Mostly seen in the opening, as a faint reflection in the glass, and as hands entering the frame (pressing the glass, drawing in condensation, waving). Animation is grounded and observational: swinging feet, picking at the seatbelt, slumping.

### Animation style

- **The hero animates "on twos"** (12–15 fps stepped poses with smear frames), while the world and car are smooth at 60 fps. The hero looks *drawn by imagination* and pops against the world (the *Spider-Verse* technique). Test this early; fall back to smooth with heavy squash/stretch if it hurts game feel.
- **World objects follow toy physics:** slightly floaty arcs, exaggerated bounces, fast wobble-settle on impact.
- **The kid and interior** are smooth and naturalistic.

### Lighting, color, time of day

- **One key directional light** (the sun) outside, plus a sky/ambient gradient. No realtime GI. AO is baked into vertex colors per kit piece.
- **Color progression has two axes:**
  - *Per trip (story/time of day):* morning errand in pale yellows, highway noon in bright blues and greens, Grandma's at golden hour in amber and rose, night drive in navy with sodium-orange, the dream in impossible pastels.
  - *Per Wonder tier (performance):* a desaturated, flat palette at Tier 0, rising to saturated, rim-lit, and bloom-touched at Tier 3.
- **Turns** rotate the sun relative to the car, so **light patches and shadows sweep across the interior**. That's a powerful "we're really driving" cue.
- **Shadows:** one stable shadow cascade around the Run Line. Debris uses blob shadows. **The hero always gets a crisp blob shadow** for landing readability.
- **Fog:** distance and height fog in the palette's sky color, so the background breaks into soft, layered color planes.

### Distant scenery

- 3–4 **parallax silhouette layers** (low-poly cards) beyond about 150 m, plus a subtly **curved horizon** shader that bends the far world downward, like a small planet or rolling diorama.
- **Landmarks** (water tower, stadium, mountain, city skyline, Grandma's church steeple) are big far billboards that drift slowly. They're visible for 30–90 s before you reach them, which builds anticipation the way real drives do.

### Weather

- **Rain:** drops on the *glass* (shader), whose streak angle follows car speed, plus puddle splashes outside and wet sheen on the palette. Wipers are audible but not visible (side window).
- **Snow:** soft flakes, white-dusted kit pieces, condensation on the glass that the kid draws in.
- **Night:** reflections in the glass get stronger, headlight sweeps, streetlight pools on the Run Line, and the hero's scarf glows faintly.
- **Fog bank:** a set piece where visibility drops and you rely on audio telegraphs.

### The glass layer

The window is a real surface with **reflections**, **smudges**, a **tint band** along the top, **raindrops**, and **condensation**. The kid's face reflection is faint and **gets stronger in tunnels and at night**. That's the moment you see their expression react to what you just did. The glass is part of the game's identity, not a filter.

### Destruction FX language

- Wood splinters into chunky planks plus a few small splinter particles.
- Metal (signs, poles' hardware) clanks, bends one joint, then pops off. Bright sparks.
- Foliage bursts into 3–5 canopy blobs plus a big leaf burst (GPU particles).
- Glass shatters into flat triangular shards with glints.
- Stone and concrete break into heavy chunks with a dust puff (chunky cube-ish dust particles).
- Hay or paper puffs into a cloud of confetti-like pieces.
- Water (hydrant) shoots up a geyser column, which doubles as a bounce pad.

## 6. Camera Specification

### Decision: **2.5D side-scroller rendered in full 3D, camera locked to the car, framed by a real 3D interior.**

| Option | Verdict |
|---|---|
| True 3D third-person | Breaks Pillar 1. The car disappears and you get "another runner." |
| Fixed-lane 3D (Subway Surfers) | Wrong axis. The kid looks *sideways*, not forward. |
| Pure 2D side-scroller | Loses parallax depth, interior framing, and 3D destruction. |
| **2.5D: one gameplay plane, full 3D world** | **Chosen.** It matches the real geometry of looking out a side window, keeps platforming readable, and lets 3D debris fly toward and away from the camera. |

### Layering (from the camera outward)

```
 [KID HEAD CAMERA]
     │  0.3–0.6 m   INTERIOR: door panel, seal, seatbelt, cupholder, pillars  (real 3D, soft focus)
     │  0.6 m       GLASS: reflection, smudges, rain, condensation               (shader layer)
     │  2–8 m       FOREGROUND: guardrail, reflector posts, near-lane cars      (fast blur, no gameplay)
     │  ~25 m       RUN LINE: hero + all interactables                        (sharp, gameplay plane)
     │  40–150 m    MIDGROUND: fields, houses, trees                           (slow parallax, scatter)
     ▼  150 m+      BACKGROUND: silhouette layers, landmarks, sky                 (very slow / static)
```

### Framing math (starting values, tune in prototype)

- At the Run Line, the window shows **about 16 H wide**. The hero should be **about 10–12% of screen height**.
- The hero's **home position** is u = 0.4 (u is normalized across the window, 0 = rear pillar, 1 = front pillar).
- **Lead time** (time from an obstacle entering at the front edge to reaching the hero) = (1 − u) × 16 H ÷ scroll speed. At town speed (8 H/s) and u = 0.4, that's **1.2 s**. Target: ≥ 0.9 s at the hardest speeds.
- **Highway look-ahead:** at high speeds the camera yaws 8–15° forward, *as if the kid is leaning to look ahead*. That buys about 3 H of lead and reads naturally as body language.

### The Kid Head Rig (gameplay camera)

The camera is the kid's head, a physical thing in a physical car:

- **Position** is constrained to a box about 25 cm wide inside the car. **Rotation** is limited to yaw ±20°, pitch ±12°.
- It **follows the hero softly**. When the hero is very high, the kid leans down and looks up, and the window frame shifts in parallax to show more sky. When the hero is near the front, the kid leans forward.
- **Car motion feeds the camera:** constant low-amplitude road vibration, bump impulses (expansion joints, potholes), braking pitch, acceleration push-back, and slight roll on turns. *All of it is scalable and can be turned off in Accessibility.*
- **The interior is real geometry rendered with the scene**, not a 2D overlay. Even a tiny head movement creates parallax between the window frame and the outside world, and that sells the illusion of a real window more than anything else.

### Keeping the illusion that the hero is outside a moving vehicle

1. The hero's world-space velocity really is the car's velocity plus a small relative offset. The world physically moves past and the car physically moves forward (see §19). Debris **stays behind** in world space and drifts out the rear of the window, which is correct and very convincing.
2. **The glass is always present.** The hero is always seen *through* a reflection layer, even a faint one.
3. **The car occludes.** The C-pillar and B-pillar block the view. The hero can disappear behind a pillar, and that's *meaningful* (lost).
4. **Car events affect the view:** bumps jolt it, lane changes zoom the Run Line in or out ±10%, tunnels darken the interior, overpasses flick shadows across the kid's lap.
5. **Shared lighting:** the outside sun spills into the interior (light patches), and streetlights sweep across the door panel at night.

### Offscreen handling

If the hero jumps above the window's top edge, show a **little shadow arrow on the headliner trim**, and the head rig tilts up. Top-edge occlusion is capped at about 0.6 s per jump through level design.

### Accessibility camera options

- **Window Zoom:** shrinks the interior frame so the window takes up more of the screen.
- **Steady Cam:** removes vibration, bumps, and roll.
- **Ultrawide:** shows more interior on the sides, never more gameplay width (for fairness).

## 7. Core Movement System

### Ruthless verb selection

| Candidate | Verdict | Reason |
|---|---|---|
| Run | **Auto.** | Matched to the car. The pace is the car's. |
| Jump + one air jump | **Keep.** | Core. The air jump is the "refreshable resource." |
| Slash | **Keep.** | Core. It's both the attack *and* the air-mobility tool. |
| Stomp (Down in air) | **Keep.** | Breaks things below, triggers bounces. |
| Slide (Down on ground) | **Keep.** | Sliding under semi-trailers and signs is a perfect kid fantasy. |
| Grind wires/rails | **Keep (automatic).** | The single most iconic image of the premise. |
| Ride vehicles | **Keep (automatic).** | Makes the car/traffic theme mechanical. |
| Bounce | **Keep (automatic).** | Cars, cows, awnings, hydrant geysers. |
| Dash | **Merged into Slash.** | An air slash *lunges* forward. One button, two meanings. |
| Vault | **Cut.** | Jump covers it. An auto-vault animation can play when jump timing is close. |
| Wall jump / wall run | **Cut.** | The roadside has almost no walls. It would need bespoke geometry. |
| Climb | **Cut.** | Slow, and it breaks flow. Running up falling poles replaces it. |
| Horizontal speed control | **Cut.** | Frame position is *earned*, not steered (see Discovery 1). |

### Controls (3 inputs + 1 combo)

| Input | Controller | Keyboard | Touch (future) |
|---|---|---|---|
| **Jump** (hold = higher) | A | Space | Tap right half |
| **Slash** | X | J / Left-click | Tap left half |
| **Down** (Slide / Stomp) | B or ↓ | S / ↓ | Swipe down |
| **GIANT** (when available) | Jump + Slash together | Space + J | Two-finger tap |

### Movement spec (starting values)

**Units:** H = hero height. Times in seconds. Simulation at a fixed 60 Hz.

- **Jump:** full-hold apex 3.0 H in 0.38 s, minimum tap 1.2 H. Gravity on the way down × 1.6. **Coyote time 0.10 s, jump buffer 0.12 s.**
- **Air jump:** 1 charge, 2.0 H. **It refreshes on any successful interaction** (slash hit, stomp, bounce, grind, ride). *This is the engine of chaining.*
- **Slash (ground):** 0.22 s total, active frames 3–7, reach 1.5 H in a forward arc. It's an upper-body layer, so running never stops.
- **Slash (air):**
  - **On hit:** "Slash-Hop." A hop of +1.4 H, the air jump is restored, and a small forward lunge (+0.03 u frame position).
  - **On whiff:** a 0.15 s float (reduced gravity), **once per airtime**. It feels generous but can't be abused.
- **Stomp:** fall speed × 3. On impact, breakables break, bouncers launch (3.5 H), and plain ground gives a small dust ring with 0.1 s landing lag (a mild penalty for using it on nothing).
- **Slide:** 0.5 s at 0.45 H tall. It **smashes low fragile objects** (fence rails, cones) automatically. **Jump out of a slide** = a long, low jump (2.2 H high, faster forward lunge).
- **Grind:** auto-attaches when you descend onto a grindable spline within a 0.35 H vertical window. While grinding, frame position climbs (+0.06 u/s), sparks fly, and the chain refreshes every 0.5 s. Jumping off is a full jump with the air jump restored.
- **Ride:** landing on a vehicle roof makes it your moving platform, and you inherit its relative velocity. A truck faster than your car carries you *forward* in the frame. A slow tractor drifts you back. Jump off any time.
- **Bounce:** landing on or stomping a bouncer (car roof with Down, awning, cow, geyser) launches you 3.5–4.5 H. Bouncers squash and stretch like toys.
- **Hitstop:** 3–5 frames global freeze on breaks, scaled by object mass. **It's non-negotiable for feel.**

### Frame position (the "health" system)

- u ∈ [0, 1] across the window. **Home = 0.40. Front cap = 0.78.** At the cap, the kid leans forward, but the hero can't leave the front edge.
- **Bonk** (hitting a solid hazard, a vehicle's side, or running into a breakable *without* slashing it): −0.15 u, the chain breaks, and a stumble animation plays.
- **Pit / water / ditch:** the hero tumbles and pops back up at ground level (kid logic: he's fine). −0.20 u.
- **Recovery:** grinds, faster rides, slash-lunges, and long chains push u forward. On flat ground with no events, u drifts slowly toward home (0.03 u/s).
- **"Out Front" bonus:** above u = 0.60, score × 1.5. *Remember, this also means less reaction time.*
- **Lost:** at u < 0.02 the hero slips behind the C-pillar.
  1. Brief slow-mo. The kid's head turns to look back through the rear glass.
  2. Wonder drops one tier and the world visibly de-saturates.
  3. The hero comes sprinting back in from the left ("I'll catch up!") at u = 0.30 after about 2 s.
  4. **If lost at Tier 0, the kid gets bored:** they sigh, slump, and look away, and the camera pulls back to the side-view framing. *Trip Over.* Restart from the last landmark checkpoint.

### Readability rules for the player

1. **Wood and thin things break.** (Slash them or run through them painfully.)
2. **Wheels and round, soft things bounce.**
3. **Lines (wires, rails, ropes, gutters) are grindable.**
4. **Grey concrete and stone hurt.** (Only Giant mode or falling objects break them.)
5. **Red is the hero. Gold is a collectible. Glowing outlines are imagined platforms.**

Teach each rule in the first three trips through layout alone. No tutorial text beyond button glyphs on the glass.

## 8. Combat / Destruction System

### Philosophy: toy destruction, choreographed but *physical-feeling*

Destruction is **mostly authored and partly simulated**. It's tuned for satisfaction, not accuracy.

### Destruction classes

| Class | Examples | Behavior | Gameplay role |
|---|---|---|---|
| **A. Pop** | Cones, mailboxes, small signs, trash cans, crates, glass bus-stop panels | Instantly releases 3–8 pieces with an impulse along the slash vector. | Chain fodder, timing practice. |
| **B. Topple** | Telephone poles, trees, streetlights, billboards, road-sign gantries | The cut snaps to the nearest of 2–3 authored **cut sockets**. The top section becomes a **scripted hinged fall** (kinematic, gravity-eased), then breaks into pieces on impact. | **Falling objects are temporary platforms and ramps**, and they **hit other things** (domino). |
| **C. Run / Structure** | Fence runs, guardrail ribbons, scaffolding, power lines, hay bale stacks | Breaks propagate along a run (fence segments go in a quick ripple). Wires become verlet ropes and whip. | Combo multipliers, launches. |
| **D. Set piece** | Water tower, gas station canopy, crane, billboard collapse, car wash brushes | Authored animation sequences plus physics debris bursts. | Climaxes, bosses. |
| **Toy reactors** (non-breakable) | Cars, trucks, buses, cows, shopping carts | Procedural squash, wobble, and bounce. Dents on hard hits. **Never destroyed.** | Platforms, bouncers, rides. |

**Vehicles are never destroyed.** There are people inside. In the kid's mind cars are *toys* that squash and spring back, and that's both funnier and tonally correct. (At Tier 3 the giant semi becomes an imagined armored beast. You slash its *armor plates*, which are imaginary, not the truck.)

### The "Domino" system

Falling Class-B objects run a cheap **swept-capsule check** during their fall. Anything breakable they cross gets broken with an impulse in the fall direction. That gives you:

- A pole falls onto the next pole. **Chain reaction.**
- A tree falls onto a fence. **Ripple.**
- A billboard falls flat. **Ramp.**
- A pole falls onto a car. **The car squashes and bounces it, and the bounce launches the pole's top chunk.**

Every object broken by another object scores as a **Domino** (its own verb in the chain, see §12). Players will start deliberately setting up chain reactions. *This is the "ridiculous environmental interaction" pillar.*

### The satisfaction recipe (every break gets all of these)

1. **Anticipation:** a slash smear frame on the hero.
2. **Hitstop:** 3–5 frames.
3. **Impact flash:** the struck piece flashes white for 1 frame.
4. **Layered SFX:** crack transient + material body + (Tier 0–1) the kid's whispered mouth-sound.
5. **Directional chunk burst** along the slash vector, with randomized spin.
6. **Secondary motion:** the remaining stump wobbles, wires sway, nearby objects jiggle.
7. **Particles:** dust puff, material particles (splinters, leaves, sparks).
8. **Camera micro-shake** (≤ 2 px equivalent) plus controller rumble.
9. **Score pop** in world space, chunky numbers.
10. **Linger and pop-out:** chunks rest for 2–4 s, then **shrink-pop to zero** (a toy-like disappearance, no fading).

### Imagined enemies

Enemies are **sparse and clearly imaginary**. They only appear at Wonder Tier 2+, so *the real world never has enemies*. Kid's imagination monsters:

- **Grumbles:** grey static-blob critters (*bits of boredom*) that try to slow the hero. One slash pops them.
- **Puddle Snappers:** imaginary crocodiles in rain puddles.
- **Wind Socks:** kite-like flyers you slash-hop off (aerial chain fodder).

Six enemy types max in the full game. They exist to add aerial chain targets and imaginative flavor, **not** to make this a combat game.

## 9. Environmental Interaction System

### Component model

Every interactable is a combination of a few components. Designers compose behavior and never write per-object code.

| Component | Effect |
|---|---|
| `Breakable(class, pieces, hp=1)` | Breaks on slash/stomp/domino/giant. |
| `Toppler(cut_sockets, fall_dir)` | Scripted hinged fall, becomes a temporary platform, sweeps domino. |
| `Solid` | Platform you can stand on. |
| `Hazard` | Bonks on side contact. |
| `Bouncer(power)` | Launch on landing/stomp. |
| `Grindable(spline)` | Rail behavior. |
| `Rideable(velocity_profile)` | Moving platform with relative velocity. |
| `Launcher(vector)` | One-shot launch (snapping wire whip, geyser, seesaw plank). |
| `Collectible(type)` | Treasure / plate / sticker. |
| `KidLogicTrigger(event)` | Fires a real-world event (light change, honk, detour). |
| `Imagined(min_tier)` | Only exists at or above a Wonder tier. |

### Signature interactions (by trip introduction)

- **Mailbox:** pops; the lid flaps off.
- **Picket fence:** slide-smash ripple.
- **Trash can:** the lid flies off like a frisbee and can be **slash-hopped** off mid-air.
- **Fire hydrant:** slashing it makes a **geyser**, a bounce pad for 4 s.
- **Telephone pole + wires:** cut the pole while you're on the wire and the wire **snaps and whips you upward** (a Launcher).
- **Billboard:** cut the legs and it falls flat into a **ramp**.
- **Shopping carts** (parking lot): stomp one and it rolls and **becomes a rideable**.
- **Cows:** bounce (cow is fine, "moo"). **Counting cows** collectible bonus.
- **Hay bales:** stomp and they roll, flattening fences.
- **Semi-trailers:** slide under, or ride the roof. The trucker-honk Kid Logic trigger.
- **Overhead highway sign gantries:** grindable *and* topple-able.
- **Train:** a moving platform set piece. Jump between cars.
- **Construction scaffolding:** a Class-C collapse sequence.
- **Car wash brushes:** spinning hazards and bouncers (boss).

### Kid Logic triggers (the secret layer)

| Trigger | Real-world effect | Reward |
|---|---|---|
| Clear the Stoplight Challenge | The light turns green | Bonus + "I did that" sticker |
| Arm-pump gesture (Slash while riding a semi) | Trucker honks | Wonder burst |
| Stay airborne through a whole tunnel | The kid holds their breath (cheeks puff in reflection) | Big bonus |
| Slash the DETOUR sign | Dad takes the "scenic route" | **Secret branch segment** |
| Spot and stomp the **Yellow Car** | Sibling: "YELLOW CAR!" | Collectible |
| Lift feet over railroad tracks (be airborne at the crossing) | Small sparkle | Superstition collectible |

## 10. Road-Trip / Stage Structure

### Trips, not levels

Each stage is **a Trip**: a handcrafted 3–5 minute drive with a real-life reason, a destination, a time of day, an interior state, and one **new mechanic**.

### Anatomy of a trip

```
DEPARTURE  →  MAIN ROAD  →  LANDMARK SET PIECE  →  BREATHER  →  FINAL STRETCH  →  ARRIVAL
 slow, teach    core mechanic   (checkpoint)         stoplight /     peak speed &      car parks,
 Wonder 0→1     density rises                        parking lot     density, Tier 3   music folds
                                                     challenge                         back to radio
```

- **Checkpoints = landmarks** ("the big water tower," "the bridge").
- **Car speed is authored** per trip on a timeline: stops, slow zones, merges, highway stretches. The world's tempo is the car's tempo.

### Campaign: "One Year of Rides" (full game, 12 trips + epilogue)

| # | Season | Trip | New mechanic / feature | Set piece / boss |
|---|---|---|---|---|
| 1 | Spring | **The Errand** (neighborhood) | Run, Jump, Slash | First hero appearance |
| 2 | Spring | **Grocery Run** | Stoplight Challenge, Stomp, shopping carts | **The Car Wash** (brush monsters) |
| 3 | Spring | **School Pickup** | **Wires & grinding**, poles | Power line canyon |
| 4 | Summer | **Country Road** | Slide, cows, hay bales, ditches | **Race the Train** |
| 5 | Summer | **The Interstate** | **Riding vehicles**, speed, gantries | **The Semi-Dragon** |
| 6 | Summer | **Beach Vacation** | Wind gusts, sand, boardwalk rails | The Long Bridge (floor is lava) |
| 7 | Fall | **Rainy Drive** | Glass rain, puddles, lightning-felled trees | The Storm |
| 8 | Fall | **Construction Zone** | Scaffolding collapses, cranes, heavy domino | **The Crane** |
| 9 | Fall | **Grandma's House** (long drive, golden hour) | Mixed mastery, mountain switchbacks, tunnels | The Mountain Tunnel (hold breath) |
| 10 | Winter | **Snow Day / Holiday Drive** | Ice slide physics, snowmen, condensation drawing | The Snowplow |
| 11 | Winter | **Moving Day** (car full of boxes, city to city) | Everything, at highway scale | The Moving Truck convoy |
| 12 | Winter | **The Night Drive → The Dream** | The kid falls asleep. **Tier 4**: the car flies. | **The Grey** (boredom/sleep incarnate) |
| E | — | **Years Later** | Epilogue (see §15) | Credits run |

**The Wonder cap rises with the campaign:** Trips 1–2 cap at Tier 1, 3–5 at Tier 2, 6+ reach Tier 3, and the Dream unlocks Tier 4. This keeps the macro arc (real → full fantasy) intact even though Wonder is also driven by performance.

### Bonus content

- **Bonus rounds** (short, 30–60 s, inside trips):
  - *Stoplight Challenge*: the world is frozen, so smash everything in the arena before green.
  - *Floor Is Lava*: bridges and tunnels where touching the ground ends the bonus.
  - *Passing Lane*: a truck convoy where the only floor is roofs.
  - *Drive-Thru / Gas Station*: a stationary arena while the parent is busy.
- **Secret routes:**
  - **Vertical routes:** a high route (wires, rooftops, imagined platforms) and a low route (ground, slides), Sonic-style, all in one plane.
  - **Wonder-gated routes:** imagined platforms appear only at Tier 2+.
  - **Kid Logic detours:** branching segments with treasures.
- **Secret trips:** *Wrong Turn* (unlocked by finding every detour) and *The Drive-In* (night, movie-monster themed).

### Cut / rejected

- **Free stage select from a world map with branching roads.** The campaign is a year and linear is fine. A *paper road map* trip-select comes after the campaign is finished.
- **Daytime/weather as random modifiers on every trip.** Each trip's weather is authored. Randomness belongs to Long Drive only.

## 11. Progression

**There's no XP, no skill tree, and no stat upgrades.** Progression has four layers, all of them visible:

1. **New verbs, introduced by the campaign:** one per trip in the first five trips, then new *interactions*. The kid "thinks up" new moves. In the opening of the trip, the kid's hand draws the new move in the window condensation, a diegetic tutorial card.
2. **Wonder cap:** the world can get more fantastical as the campaign goes on.
3. **Collections** (displayed in the car):
   - **Treasures:** 3 hidden per trip, childhood objects (a bouncy ball, a slap bracelet, a toy dinosaur, a trading card, a glow star). They appear in the car interior.
   - **The License Plate Game:** 50 plates on passing vehicles, each ridden or stomped to "collect." There's a plate booklet in the menu.
   - **Stickers:** trip ranks (bronze/silver/gold stars) applied to the window frame.
4. **Cosmetics** (unlocked through stickers, treasures, plates):
   - **Hero drawings:** skins framed as kid drawings (knight, ninja, astronaut, dinosaur-costume, cardboard robot).
   - **Swords:** stick, cardboard tube, foam sword, umbrella, glow-sword, baguette.
   - **Scarf trails.**
   - **Mouth-sound packs** (sound effects performed by the kid).
   - **Radio stations:** unlock music tracks and arrangements.
   - **Window stickers / interior decorations.**
   - **World skin:** "Cardboard World."

**Imaginary power:** one, **GIANT**. When the Wonder gauge is full at Tier 3, Jump + Slash makes the hero **grow to 4× size for 8 seconds**. Everything breaks on contact, including concrete, the kid presses their face to the glass, and the music hits its peak. It's the spectacle reward, the trailer shot, and a tactical resource (save it for the set piece).

## 12. Scoring / Mastery

### Chain (moment-to-moment)

- Every **interaction** adds +1 to the chain and refreshes a **1.5 s chain timer**. Plain running doesn't refresh it.
- **Variety rule:** *the same move twice in a row doesn't grow the chain* (it still scores 50%). This is the one rule that creates flow without a Tony Hawk-level rulebook.
- **Verbs:** Slash, Air-Slash, Stomp, Slide-Smash, Grind, Ride, Bounce, Launch, Domino, Near-Miss, Collect.
- **Multiplier** = 1 + ⌊chain ÷ 4⌋, capped at ×8.
- The chain **ends** on a bonk, a pit, or a timeout. Ending it **banks** points × multiplier, and the banked points fill **Wonder**.
- **Near-miss:** passing within 0.3 H of a hazard or vehicle without contact.
- **Domino:** objects broken by other objects. *Players who set up chain reactions get rewarded for being clever.*

### The target flow sequence (from the brief, now fully supported)

> Jump → **slash sign** (Slash) → **slash-hop onto car** (Bounce) → **launch to wire** → **grind** (Grind) → **slash pole ahead** (Air-Slash, the wire snaps → Launch) → pole **falls onto fence** (Domino) → **land on falling pole, run down it** → **drop onto a passing truck** (Ride) → continue.
>
> = 8 distinct verbs, ×3 multiplier and rising, frame position pushed to "Out Front."

### Trip scoring and ranks

- **Score:** banked chains × Out-Front bonus + distance completion + collectibles.
- **Stars:** 1/2/3 stickers by score threshold. A **gold rim** for 3 stars + never lost + all 3 trip objectives.
- **Trip objectives** (3 per trip, authored): e.g., "Make the light turn green," "Ride a semi for 5 seconds," "Domino 5 poles in one fall."

### Long-term mastery

- Per-trip **global leaderboards** (and friends).
- **Long Drive (endless):** a procedural highway from the segment library, escalating speed, a **daily seed**. The run ends when the kid gets bored.
- **Replay last chain:** one button saves the last 15 s as a clip. **This is a growth feature.** The game's marketing *is* players' clips.

## 13. Audio Direction

### The core trick: the radio song becomes the soundtrack

Music **starts diegetic**: a song playing on the car radio, band-limited, mono, slightly crackly, under road noise. **As Wonder rises, the music leaves the radio**:

| Tier | Music state |
|---|---|
| 0 | Tinny car-radio mix, low in the mix, a DJ or ads occasionally. |
| 1 | The EQ opens, it goes stereo, a light kid-hummed melody layer. |
| 2 | Drums and bass stems, full-range, energetic. |
| 3 | Full orchestral/synth arrangement of **the same melody**. Road noise ducks. |
| Giant | A choir or brass hit, peak layer. |
| Lost / tier drop | A filter sweep *back into the radio*. |
| Arrival | Folds back to the radio. Engine off. Silence. |

**Each trip's radio song is an arrangement of the main theme** in the parent's music taste for that drive (oldies, country, 2000s pop, smooth jazz at Grandma's). There's one main theme and many arrangements, which is cost-efficient for a small team, and the theme becomes iconic.

**Rhythmic cues:** the turn signal tick is quantized to the music tempo, and the rain wipers act as percussion in the Rainy Drive.

### Car layer (always present, ducked by Wonder)

Road hum (it changes with surface: asphalt, concrete seams, gravel, bridge deck), tire thumps on expansion joints, engine note that follows the speed curve, wind noise (rises at highway speed), turn signal, seatbelt creak, the A/C fan, rain on the roof, the tunnel's roar and pressure change.

### Family layer

Sparse, warm, **mostly muffled**. The kid isn't listening, so adult speech is filtered behind the kid's focus. It's clearer at stoplights and arrivals. A small set of short lines ("Almost there," "Who wants fries?", "Look, a horse!"), a sibling's "YELLOW CAR!", a baby fussing mid-campaign, a dog panting. Keep localization light: it's mostly wordless murmurs and a few short barks.

### Hero / world SFX

- **Footsteps:** light and quick, differing by surface (grass, gravel, metal roof, wire hum).
- **Slashes:** whoosh plus material impact. **Mouth sounds:** at Tier 0–1, each action is doubled by the kid's whispered mouth-sound effects ("shhhing!", "pkew!", "brrrrrrr" while grinding). By Tier 3 they've been replaced by full cinematic SFX. *Imagination literally upgrades the sound effects.* It's cheap to record, very funny, and very recognizable.
- **Materials:**
  - Wood: a dry toy-block *clack* plus a real wood crack underneath.
  - Metal: a bright *clang* and ring-out.
  - Glass: a crisp tinkle.
  - Foliage: a whumpf plus leaf rustle.
  - Concrete: a deep thud plus grit.
- **Electrical:** a wire grind buzz with pitch tied to speed, a snapping-wire *TWANG* plus crackle on the whip, sparks.
- **Toy reactors:** cars *boing* (spring) with a soft rubber squish. Cows *moo*.
- **Ambience by trip:** birds and lawnmowers in the neighborhood, crickets and wind in the country, gulls at the beach, city traffic, a mountain wind howl.

### Middleware

Godot 4's built-in `AudioStreamInteractive` / `AudioStreamSynchronized` cover the stem/tier system for the MVP. Evaluate FMOD (via the GDExtension integration) for the vertical slice if the adaptive layering needs more control.

## 14. Opening Sequence

**This is the first impression and the trailer's cold open. It has to be perfect.**

### Shot-by-shot

**0. Black.** Audio only: car door thunk, seatbelt click, engine turnover, a parent, muffled: *"Okay, quick stop at the store."* The car pulls away and road hum fades in.

**1. The side view (title screen).** Fade in. The camera sits **inside the car**, across the back seat, looking at the kid **in profile**. Behind the kid is their window, and the world outside is **out of focus**: bright, colorful smears going by. The kid is bored: feet swinging, chin on hand, fiddling with the seatbelt. **The title is written in the window condensation** behind their head, as if a finger drew it. A slow idle loop. Radio song (tinny) plays.

**2. Player interaction.** A small glyph prompt: *Press to look outside.* (Any button, or a tap/click.)

**3. The turn.** On press:
- The kid's **eyes move first**, a flicker of curiosity, and then the head turns toward the window. Their body follows, scooting closer.
- **Rack focus:** the depth of field pulls off the kid and onto the outside world. The blur resolves into the crisp toy-diorama world. *This is the first time the player sees the art style clearly.*

**4. The camera move.** A smooth **arc and push**, about 4 s: the camera swings around **behind the kid's head**, over their shoulder (we see their hair and ear, the window filling up), and then **pushes into the head position**. The kid's body leaves the frame as the camera takes its place.

**5. The POV handoff.** As the camera settles into the Kid Head Rig, **the kid's reflection fades up in the glass**, so the player sees the face they now are. The window frame, door panel, seatbelt, and cupholder land into their framing positions. *Tier 0: the world outside is muted and ordinary.* It's just a street.

**6. The birth of the hero.** The kid breathes on the glass, which fogs a little patch. **A finger enters the frame and draws a small stick figure with a scarf** in the condensation. The drawing lines up with the roadside. With a soft *pop* and a burst of color, **the doodle becomes the hero**, standing on the roadside, pale doodle-white (Tier 0).

The hero **looks up at the window. Eye contact.** A small nod. He turns and starts running, keeping pace. The radio song gains one warm layer.

**7. Control.** A Jump glyph appears in condensation on the glass. A mailbox approaches. *Play begins.*

### Rules

- The first viewing is unskippable (≈ 25 s total). After that it's skippable from step 2.
- **Every later trip** uses a *short* version (≈ 6 s): side view of the kid's new situation (what's in the car tells the story) → turn → push into POV → the hero vaults in from the roadside.

## 15. Ending Concept

### Evaluating "the child falls asleep"

| Option | Assessment |
|---|---|
| **A. The kid falls asleep, and the world dissolves.** | Lovely *once*, but passive, a bit sad, and predictable as a *finale*. **Used, but as the gateway to the Dream (Trip 12), not as the ending.** Falling asleep is where imagination becomes the *dream*. That's the climax, not the goodbye. |
| B. Arrival at a destination | It's the per-trip ending already. Not big enough for the finale. |
| C. The hero says goodbye forever | A Bing Bong cliché. Manipulative. **Rejected.** |
| D. The kid grows out of it (looks at a phone) | Cynical, and it lectures the player. **Rejected.** |
| **E. Moving Day → the Dream → Arrival → Years Later** | **Chosen.** |

### The chosen ending

**Trip 11 — Moving Day.** The interior is packed with boxes, so the window is partly blocked: a smaller frame. You can't see the old neighborhood any more. The hero runs alongside through the whole move, the one constant.

**Trip 12 — The Night Drive → The Dream.** The long drive to the new city at night. The kid's reflection blinks slowly and the camera droops. The world **dissolves upward into the Dream** (Tier 4): the car lifts off the road, the Run Line becomes clouds, rooftops, the moon. **The Grey**, boredom and sleep made into a creature, is the final encounter. You can't "kill" it. You **outrun it until dawn**. Sunrise breaks through the window. The kid wakes in the new town. The hero is still there, running beside the car down unfamiliar streets. *Arrival: a new house.* The kid unbuckles.

**Epilogue — Years Later.** Fade in on **the same side-view composition as the title screen**, but it's a newer car, and a different child is in the backseat, bored and swinging their feet.

The player presses the button. The camera turns, but this time **it goes to the driver's seat**. **We're the adult now**, stopped at a red light. A glance in the rearview mirror: their child staring out the window. A glance out the *driver's* window:

**the old hero is running alongside the car.** Older, scarf a bit frayed, unmistakable. He looks up. Nods. Then a **new, tiny, differently designed hero** (the child's own invention) appears beside him. The old hero gestures *go on* and peels away. The light turns green.

**Credits are a playable run** as the child's new hero, with **credits names on breakable road signs**. Short, joyful, no fail state.

*Why this is stronger:* it lands the exact line from the pitch, *"I used to do exactly that,"* and turns it around: *someone is doing it now, in your backseat.* The target audience is now the parent, and it tells them, without a single word, that the imagination didn't die. It got passed on.

## 16. MVP Specification

**Goal: prove the fantasy in one trip.**
*"Sit in the backseat → look out the window → control the imagined hero → run beside the car → jump/slash/destroy things → feel like a kid imagining an adventure."*

**Timebox: 6–8 weeks** (solo + AI-assisted), after a 2-week feel prototype.

### In scope

- **One trip** (≈ 3 min): neighborhood → arterial road → short highway stretch → arrival.
- **Opening sequence** (simplified): side view → press → turn → push into POV → hero appears (pop, not drawing).
- **Kid Head Rig** camera with a real 3D interior frame (greybox-plus) and glass with a basic reflection plus smudge.
- **Hero:** auto-run, Jump + air jump, Slash (ground/air, slash-hop), **wire grind**.
- **Frame position system:** bonks, lost-behind-C-pillar, return, "kid gets bored" fail, landmark checkpoints.
- **Destructibles:** mailbox (Pop), picket fence (Run), road sign (Pop), **telephone pole (Topple + domino + wire snap)**, tree (Topple).
- **One vehicle type** (car): rideable plus bouncer.
- **Car speed timeline** with one **stoplight** (no challenge yet: the world just pauses).
- **Chain + variety rule + multiplier.**
- **Wonder: 2 tiers** (0 and 2), palette swap plus one music stem plus the hero color change.
- **ChunkSim** debris (fake rigid bodies) plus hitstop, shake, particles.
- **Audio:** road hum, one radio track in 2 stems with the radio filter, about 15 core SFX.
- **UI:** start, pause, retry, end-of-trip score. Nothing else.

### Out of scope (explicitly)

Stomp, slide, Giant, enemies, collectibles, cosmetics, multiple trips, set pieces, Kid Logic, saving beyond the high score, settings beyond volume, controller remapping.

### Success criteria (go/no-go)

1. **The clip test:** show a 10-second capture to 10 people who haven't seen it. ≥ 7 should say some version of *"I used to do that."*
2. **The replay test:** ≥ 50% of playtesters voluntarily replay the trip to beat their score.
3. **The feel test:** jump and slash feel good in a blind test *without* the window frame (as a plain side-scroller). If the core doesn't hold up there, the frame can't save it.
4. **Readability:** players can tell breakable from hazard after one minute, without being told.
5. **Performance:** locked 60 fps on Steam Deck.

## 17. Vertical Slice Specification

**Goal: final-quality proof. It's the trailer, the Steam page, the publisher pitch, and the Next Fest demo.**
**Timebox: about 4 months after MVP.**

### Content

- **Three trips at final quality:**
  1. *The Errand* (onboarding, full drawing-the-hero opening).
  2. *The Interstate* (speed, riding vehicles, **Semi-Dragon** encounter, tunnel "hold your breath").
  3. *Country Road* (**Race the Train** set piece, cows, hay, slide).
- **Full move set:** Jump, Air Jump, Slash, Slash-Hop, Stomp, Slide, Grind, Ride, Bounce, **Giant**.
- **Wonder Tiers 0–3** with the full transformation wave shader and 4-stem music.
- **About 15 destructible types**, 4 vehicle types, 2 imagined enemies.
- **Kid Logic:** Stoplight Challenge, trucker honk, one Detour secret branch.
- **Interior storytelling** for the 3 trips, with treasures appearing in the car.
- **Final art direction**: final hero, kid, minivan interior, glass, tilt-shift, palette system.
- **Ranks, objectives, stickers.** A replay-clip button.
- **Polish:** full juice recipe, mouth-sounds, hitstop tuning, accessibility (Steady Cam, Window Zoom, Sunday Driver assist).
- **Platforms:** PC + Steam Deck verified-quality, full controller support.

### Exit criteria

- A **trailer can be cut from real gameplay** with no faked shots.
- A Steam page goes live. Wishlist velocity is the market test.
- Next Fest demo: median session ≥ 20 min, and at least one clip per 100 players is shared or uploaded.

## 18. Full Game Specification

> **About "Early Access":** the campaign is a short emotional arc, so I recommend **against Early Access** for it. Released in pieces, the ending loses its impact. Use a **free demo** (the vertical slice) plus **Long Drive** for community testing instead. If cash flow requires EA, ship the *Expanded* tier below as EA with the campaign ending withheld.

### Expanded (demo / optional EA, about 6 months after the slice)

- 6 trips (adds Grocery Run + Car Wash, School Pickup, Rainy Drive).
- **Long Drive** endless mode with a daily seed and leaderboards.
- The License Plate Game, the cosmetic set (≈ 20 items), the paper road map trip-select.

### Full version (1.0)

- **12 trips + Dream + Epilogue**: the full "One Year of Rides" campaign, with 7 set pieces/bosses.
- **Wonder Tiers 0–4** (Tier 4 is Dream-only).
- **≈ 35 destructible types**, 8 vehicle types, 6 imagined enemies.
- **Backseat Co-op** (local, 2P): a sibling sits in the other seat, and two heroes share the same window. Combos can chain *between* players. *It's the "my sister had her own guy" feature and a strong couch/streaming hook.* Ship it at 1.0 if it's on track, otherwise as a free post-launch update.
- **Long Drive**, daily routes, global and friends leaderboards.
- **Cosmetics:** ≈ 40 (hero drawings, swords, trails, mouth-sound packs, radio stations, stickers, Cardboard World skin).
- **Photo mode** (it's a window, so naturally it's "press your face to the glass").
- **Secret trips:** *Wrong Turn* and *The Drive-In*.
- **Accessibility:** full remapping, Steady Cam, Window Zoom, Sunday Driver (car drives 20% slower), No-Lose (the hero is never lost), colorblind-safe shape coding, subtitles for the few lines.
- **Platforms:** Steam (PC/Deck) at launch, Switch-class port shortly after. Mobile is evaluated post-launch (the controls already fit).

## 19. Technical Architecture

### Key architectural decisions

1. **The car moves through a static world. The world doesn't scroll past a static car.**
   The car rig (camera + interior) and the hero move forward along +X at real speed. The world is static in physics space. This makes debris, domino falls, and physics *naturally correct*: chunks are left behind and drift out the back of the window. **A floating origin** rebases everything every 1,000 units to keep floats precise.

2. **The gameplay plane is a straight line. Curves are faked.**
   The Run Line is always straight along X, with height following an authored profile (hills, bridges). **Turns are a presentation layer**: sun and sky rotation, interior light sweeps, distant layer drift, slight camera roll. Gameplay is never warped by curves.

3. **The hero is a custom kinematic controller, not a physics body.**
   It's deterministic at a fixed 60 Hz, constrained to the plane (Z locked), with swept collision (high speeds would tunnel otherwise).

4. **Two-tier physics.**
   - **ChunkSim (custom, the clever bit):** most debris pieces are **fake rigid bodies**: position, velocity, orientation, and angular velocity, colliding **only with the analytic ground profile** (and a few authored planes), with restitution, friction, and a sleep threshold. No chunk-chunk collision. They're rendered through **MultiMesh** instancing by kit piece. That means *500+ live chunks for close to zero cost* and it looks 90% as good as real rigid bodies, because players can't tell at this speed.
   - **Real physics (Jolt) only for "hero pieces":** rolling hay bales, rolled shopping carts, the occasional big chunk that must interact. Capped at ≈ 30 active bodies.
   - **Scripted:** topples (eased hinge rotation + swept capsule), vehicle reactions (spring-damper squash on a transform, not a sim), set pieces (animation).
   - **Verlet:** wires and ropes (8–12 points each, only after snapping; before that they're analytic catenary curves).

5. **Data-driven trips assembled from segments.**
   A Trip is a **timeline resource**: a car speed curve, a segment list, events (stoplights, lane changes, tunnels, dialogue barks, set pieces), time-of-day, weather, interior preset, and Wonder cap. **Segments** are authored scenes about 40 H long, placed by the **SegmentStreamer** ahead of the car and freed behind it.

6. **Palette-driven world shading.**
   All exterior kit pieces use **vertex colors as palette indices** into one shared palette texture. **Wonder tiers and trips = palette textures**, and transitions are a world-space **"imagination wave"** (a radius from the hero in a global shader uniform that blends palette A→B). Tier props (dragon armor on the semi, whale clouds) are toggled **attachment meshes**. The whole transformation system is shader uniforms plus a visibility toggle.

7. **Layered rendering.**
   The interior and exterior render in one scene with **separate light layers/masks** (the interior gets a soft fill plus a moving "sun patch" light cookie, the exterior gets the hard key). The glass is a transparent quad with reflection (a pre-rendered kid face reflection texture driven by head pose, *not* real planar reflection), smudge, rain, and condensation maps. Tilt-shift is a post-process vertical gradient blur masked by Run Line screen height.

### Module layout (Godot project)

```
/game
  /core        GameState, TripDirector (timeline), Checkpoints, SaveSystem, Settings
  /car         CarRig, KidHeadCamera, InteriorFX (light sweeps, bumps), GlassFX, KidAnimator
  /hero        HeroController (state machine), HeroInput (buffering), HeroAnim, HeroFX
  /frame       FramePosition (u, lost/return logic, Out-Front bonus)
  /world       SegmentStreamer, Segment, ParallaxLayers, LandmarkBillboards, PaletteSystem, FloatingOrigin
  /interact    Breakable, Toppler, Solid, Hazard, Bouncer, Grindable, Rideable, Launcher,
               Collectible, KidLogicTrigger, Imagined
  /fx          ChunkSim (+ MultiMesh renderers), DebrisPool, Hitstop, CameraShake, ParticleLibrary, Rumble
  /score       ChainSystem, WonderSystem, Ranks, Objectives
  /audio       AudioDirector (stems, radio filter, ducking), CarAmbience, SfxBank, MouthSounds
  /ui          TitleSideView, PauseNotebook, PaperMapSelect, EndOfTrip, GlassHUD
/data
  /trips       *.tres  (TripDefinition: speed curve, segments, events, palette, interior preset)
  /segments    *.tscn  (authored segment scenes, tagged with difficulty/speed band/verbs)
  /palettes    *.png   (per trip × per tier)
  /kit         kit piece meshes + pre-split variants
/tools
  SegmentValidator     (headless: reachability via simulated jump arcs at each speed band)
  BotPlayer            (scripted/greedy auto-player for regression + balancing)
  TripPreviewer        (scrub a trip timeline in editor)
  KitAssembler         (build props + break recipes from kit pieces)
```

### Event bus

Systems talk through a small signal bus (`object_broken`, `chain_banked`, `wonder_tier_changed`, `hero_lost`, `car_event`, …). Audio, FX, score, and UI all subscribe, so nothing hard-references them. This keeps systems AI-editable in isolation.

### Determinism and replays

Hero, frame position, chain, and Wonder are deterministic from (trip seed + input log), because debris doesn't affect gameplay. That gives **cheap input-log replays** for the "replay last chain" clip and for **leaderboard validation**.

## 20. Recommended Engine

**Godot 4 (current stable 4.x), with the built-in Jolt physics, the Forward+ renderer on PC, and the Mobile renderer for Switch-class hardware.**

Why:
- **Text-based scenes and resources** (`.tscn`/`.tres`) mean AI tools can read, write, and diff levels, data, and scenes directly. This is the deciding factor for a one-person AI-assisted team.
- The game's rendering needs are modest and stylized: no GI, one light, custom shaders, MultiMesh. Godot handles them well.
- No licensing fees, fast iteration, a small footprint, good Steam Deck performance.
- GDScript for gameplay and tools, plus C# or a GDExtension (C++) **only** if ChunkSim needs it (start in GDScript, profile, and port the hot loop if needed).

**Trade-offs, acknowledged:**
- Console porting goes through third-party partners (e.g., W4 Games). Budget for it and contact them early, during the vertical slice.
- If console-first or a publisher deal requires it, **Unity 6 (URP)** is the fallback. Every design decision in this document carries over unchanged.
- **Not Unreal:** overkill for this art style, heavier iteration, and worse for AI-driven text-file workflows.
- **Not Three.js/web** for the product. It's fine for a throwaway *feel* prototype if that's faster for you, but don't build the real game on it.

## 21. Recommended Asset Strategy

1. **The Kit is the art pipeline.** Build **≈ 40 beveled kit primitives** in Blender (beveled boxes, wedges, octagonal cylinders, rounded blobs, slabs, planks), each with **1–2 pre-split variants**. Every exterior prop is **assembled** from kit pieces, either in Blender (Geometry Nodes) or in-engine (KitAssembler). Break recipes are generated automatically from the assembly.
2. **No textures outside.** Vertex color palette indices plus one palette texture. Baked vertex AO. That's tiny memory, instant recoloring, and a consistent look.
3. **Interior = the hero asset.** One minivan rear-seat interior at the highest quality in the game (it's on screen 100% of the time), made modular so per-trip **dressing** swaps (bags, boxes, towels, baby seat) are simple prop placements. The epilogue car is a re-dressed variant.
4. **Characters:** the hero (simple rig, ≈ 20 bones, hand-keyed stepped animation, ≈ 25 clips) and the kid (≈ 12 clips: bored idle variants, turn, lean, breathe-on-glass, draw, wave, sleepy, wake, unbuckle). These two should be **commissioned from a skilled animator or animated by hand.** Feel lives here.
5. **Audio:** commission a composer for **one main theme + arrangements** (radio versions + 4-stem fantasy versions per trip). Record the mouth sounds and kid barks with a child voice actor (with proper consent and guardian contracts) or an adult who can do convincing kid mouth-SFX. SFX come from libraries plus custom toy-block foley (actual wooden blocks, plastic toys).
6. **Generative AI art in shipped assets:** **No.** It's inconsistent with a tight kit-based style, has legal ambiguity, and draws audience backlash in exactly this game's nostalgic, handmade market. Use it for *mood exploration and reference boards only*.

## 22. Procedural vs Handcrafted Content Strategy

| Content | Approach |
|---|---|
| Campaign trips | **Handcrafted** sequences of **handcrafted segments**. Each trip is a designed experience with authored pacing. |
| Segments | Handcrafted scenes, tagged (`speed_band`, `verbs`, `difficulty`, `height_profile`), with **light variant randomization** (which prop variant, ±small offsets) for freshness on replay. |
| Set pieces | Fully handcrafted and scripted. |
| Midground/background scenery | **Procedural scatter** (houses, trees, fields, fence lines) driven by a per-trip biome ruleset. No gameplay impact. |
| Long Drive mode | **Procedural assembly** of the same segment library with difficulty and speed curves, Spelunky-style. **Never procedural geometry for gameplay.** |
| Destruction | **Authored recipes** (cut sockets, piece sets) + **procedural variation** (random impulse spread, spin, piece variant choice). Reads as procedural, behaves predictably. |

The rule: **handcraft anything the player interacts with. Generate anything they only look at.**

## 23. Performance Considerations

**Targets:** 60 fps locked on Steam Deck at native resolution, 60 fps (dynamic res) on Switch-class hardware, 120+ fps on mid-range PCs.

- **Draw calls:** MultiMesh per kit piece type for repeated props (fence posts, trees, poles) and for ChunkSim debris. Merge static segment geometry at load.
- **Streaming:** only ≈ 3 segments ahead and 1 behind are live. Segments are pooled and re-used in Long Drive.
- **Debris budgets:** ChunkSim ≤ 600 live chunks (oldest pop out first). Jolt bodies ≤ 30. GPU particles cap per system.
- **Physics queries:** the hero uses a few shape casts per frame. Topples use one swept capsule per falling object per frame. Nothing else queries.
- **Shadows:** one cascade, tight bounds around the Run Line. Blob shadows for debris and vehicles in the midground.
- **Glass:** a pre-rendered reflection texture driven by head pose. No real-time planar reflection or SSR.
- **Tilt-shift:** a two-pass separable blur at half resolution, masked. Cheap.
- **Interior:** baked lighting plus a single animated light cookie for sun sweeps. Low-res shadow for the interior only.
- **Parallax background:** cards and impostors, no real geometry past 150 m.
- **Audio:** stems are streamed. SFX use voice-limiting per material category (max 4 wood cracks simultaneously).
- **Floating origin:** every 1,000 units, with careful handling of in-flight debris and ropes (they're all child nodes of a "world root" that gets offset).

## 24. AI-Assisted Development Strategy

**Treat AI as a fast junior engineer with perfect recall of docs and no taste.** You own the feel, taste, and art. AI owns the volume.

### What AI tools should do

- **Gameplay code in small modules** with clear interfaces (one system per file, signal-bus decoupled). Each module gets a short spec in `/docs/systems/<system>.md` that the AI reads before editing.
- **Tools:** SegmentValidator, BotPlayer, KitAssembler, TripPreviewer, palette tooling, editor plugins.
- **Shaders:** palette wave, glass, tilt-shift, curved horizon, rain-on-glass. AI drafts them, you art-direct.
- **Data authoring:** generate segment *candidates* as `.tscn` text from verb and difficulty specs, then **validate with the bot** and **curate by hand**. AI proposes, you pick.
- **Tests:** headless deterministic tests for hero physics (jump heights, coyote time), chain rules, frame position math, and **trip reachability**.
- **Telemetry and balancing:** scripts that read playtest logs (where players get lost, which chains they find) and produce heatmaps.

### Practices that make AI effective here

1. **Keep this design doc and a `TUNING.md` in the repo.** All magic numbers go in Resources (`HeroTuning.tres`), never hard-coded, so AI changes are data diffs.
2. **One system per prompt.** Ask for focused changes with tests, not "build the game."
3. **Deterministic sim + input-log replays**, so AI-made changes can be regression-tested automatically against recorded runs.
4. **Feel is human-only.** AI can implement a coyote-time parameter. *You* decide it's 0.10 s by playing.
5. **Commit small, review everything.** AI-written physics code especially needs a human read-through.

### What AI should NOT do

Final character animation, final music, final hero/kid/interior art, the opening sequence's timing, or any feel tuning.

## 25. Major Technical Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Hero feel at speed** (tunneling, landing jank on moving vehicles) | Core | Custom kinematic controller, swept collision, fixed timestep, moving-platform velocity inheritance tested in isolation in Phase 0. |
| **Frame position math in a moving reference frame** | Core | Compute u from camera-projected hero X every frame (truth = what the player sees), not from accumulated deltas. |
| **Debris spikes** (domino chains → 1,000 chunks) | Frame drops | ChunkSim budget with oldest-first pop-out. Fewer pieces at distance. Profile the worst-case domino segment. |
| **Floating-point drift** on long drives | Jitter | Floating origin, plus tests that run Long Drive for 2 hours headless. |
| **Interior/exterior lighting mismatch** (one scene, two "worlds") | Visual | Light layers/masks from day one. Separate post stack via compositor if needed. |
| **Glass readability** (reflections and rain obscuring gameplay) | Readability | Glass effects are strictly masked away from the Run Line band. Intensity caps. |
| **Motion sickness** (camera bumps, head bob, parallax) | Accessibility | Steady Cam option, conservative defaults, never roll more than 2°, playtest with sensitive players. |
| **Switch-class performance** | Port | Mobile renderer from early on in a test build. Kit + palette approach is inherently cheap. |
| **Godot console porting dependency** | Business | Engage a porting partner during the vertical slice. Unity fallback is documented. |
| **Stepped (on-twos) hero animation hurting game feel** | Feel | Prototype both. Gameplay hitboxes and timings stay continuous, and only the *visual* pose is stepped. |

## 26. Major Design Risks

| Risk | Mitigation |
|---|---|
| **The nostalgia wears off and it's "just a runner."** | Chain/variety/domino depth, route mastery, set pieces every trip, Wonder-gated routes, short trips (no slog), and Long Drive for score chasers. Test the MVP **without** the window frame (§16, criterion 3). |
| **Auto-run feels passive.** | Three verbs with dense decisions, earned frame position, Out-Front risk/reward, and multiple vertical routes. Every 2–3 seconds there must be a decision. |
| **The window frame shrinks the playable area too much.** | Large minivan window, Window Zoom option, the head rig's lean for extra view, and a cap on interior frame thickness at the sides. |
| **Lead time too short at highway speed.** | Parallax distance, look-ahead yaw, audio and visual telegraphs (headlight glare on the pillar, honks), and segment validation by speed band. |
| **Readability of breakable vs hazard vs platform.** | Five readability rules (§7), material language, consistent color coding, and teaching by layout in Trips 1–3. |
| **Tone: violence toward the real world** (slashing cars with families). | Vehicles are never destroyed, only toy-bounced. Enemies are explicitly imaginary. Slashing targets are objects. Cows bounce, they don't break. |
| **Sentimentality** (the ending feeling manipulative). | Keep it wordless and short. No "goodbye" for the hero. The epilogue is a gift, not a tearjerker. Test it with the target audience and cut anything that explains itself. |
| **Too many systems for a 3-button game.** | Every addition must feed the chain or the frame position. If it doesn't, it's cut. |
| **"Kid gets bored" fail is too punishing.** | Landmark checkpoints, short trips, generous return at u = 0.30, Sunday Driver and No-Lose assists. |

## 27. What Should NOT Be Built

- **A driving game.** The player never steers the car.
- **An open world**, or free-roam on foot.
- **A 3-lane runner.** One plane, period.
- **Destroying vehicles** with people in them, or any injury, including to cows.
- **XP, levels, stats, skill trees, crafting, currency shops.**
- **Runtime procedural fracture** (Voronoi, CSG). Everything is pre-split kit pieces.
- **Full rigid-body simulation for all debris.** ChunkSim covers it.
- **Wall-run, climb, grappling hook, guns, magic spells, a second imaginary power.**
- **Horizontal speed control.**
- **Dialogue trees, voiced story, cutscenes longer than 30 seconds.**
- **Online multiplayer.** Local co-op only.
- **F2P monetization, energy systems, ads, loot boxes, battle passes.**
- **A level editor** (not before 1.0. Maybe never).
- **Multiple car models as a progression system.** The family has one car. That's the point.
- **Real licensed music or car brands.**
- **Free camera, a third-person mode, or a "see the hero from outside the car" mode.** (Exception: the photo mode is still *inside* the car.)

## 28. Development Roadmap

**Assumption:** one developer + AI tools, with contracted animator, composer, and (later) a porting partner. Total ≈ 20–24 months to 1.0.

### Phase 0 — Feel Prototype (2 weeks)
- A greybox plane, the hero controller, jump/slash/air jump/slash-hop, a scrolling world, wires.
- Frame position and lost logic.
- **Gate:** is jumping and slashing fun *with no art and no frame*? If not, iterate up to 2 more weeks. If it's still not fun, rethink the verb set before going further.

### Phase 1 — MVP (6–8 weeks)
- Everything in §16. Interior greybox-plus, Kid Head Rig, glass, opening (simple), ChunkSim, topples, domino, one trip, 2 Wonder tiers, basic audio.
- **Gate:** the §16 success criteria (clip test, replay test, readability, 60 fps).

### Phase 2 — Vertical Slice (≈ 4 months)
- Months 1–2: final art direction locked (kit library, palette system, hero/kid/interior final), Wonder 0–3, full move set.
- Month 3: Trips 2–3, Train and Semi-Dragon set pieces, Kid Logic, music stems.
- Month 4: polish, accessibility, juice pass, performance on Deck.
- **Gate:** trailer from real gameplay. Steam page live. Publisher pitches (optional).

### Phase 3 — Demo & Market Test (≈ 2 months, overlapping)
- Next Fest demo (the vertical slice), Long Drive prototype, replay-clip sharing.
- Collect telemetry: where players get lost, chain lengths, session length.
- **Gate:** wishlists and demo metrics justify full production scope. If they're weak, ship a smaller 6-trip version.

### Phase 4 — Production (≈ 9–10 months)
- Trips 4–12 at about 3–4 weeks each (segments, set piece, interior dressing, music arrangement).
- Collections, cosmetics, paper map, plate game, objectives.
- Backseat co-op (decide at the month-5 checkpoint: 1.0 or post-launch).
- The Dream and the Epilogue (budget extra time; these carry the emotional payoff).
- Port test builds every month on Switch-class settings.

### Phase 5 — Polish & Launch (≈ 3 months)
- Content lock → balancing via telemetry and BotPlayer → localization (UI + few barks) → certification prep with the porting partner.
- Launch on Steam (PC/Deck). Console port 1–3 months after.

### Post-launch
- Free update: co-op (if deferred), new Long Drive biomes, community daily routes.
- Possible paid DLC: *"Summer Camp"* (a new trip pack with a bus instead of the car).

---

## Appendix A — The Design in One Page

- **You are** the imaginary runner beside the family car, seen only through the backseat window.
- **You press** Jump, Slash, Down.
- **You chain** slashes, hops, grinds, rides, bounces, and domino falls, and the same move twice doesn't count.
- **You stay** in the window: play well and you lead the car, play badly and you slip behind the pillar.
- **You transform** the world: chains fill Wonder, and Wonder turns reality into fantasy, the radio into an orchestra, trucks into dragons.
- **You fail** when the kid gets bored.
- **You progress** through a year of car rides, told by what's inside the car.
- **You finish** as the parent, watching your kid watch their own hero.

## Appendix B — Starting Tuning Table

| Parameter | Value |
|---|---|
| Hero height (H) | 1.6 m |
| Visible window width at Run Line | 16 H |
| Scroll speeds (residential / town / highway / dream) | 6 / 8 / 11 / 14 H/s |
| Home frame position u | 0.40 |
| Front cap u | 0.78 |
| Out-Front threshold u | 0.60 (×1.5 score) |
| Lost threshold u | 0.02 |
| Return position u | 0.30 |
| Bonk / pit penalty | −0.15 / −0.20 u |
| Drift to home | 0.03 u/s |
| Jump (full / min) | 3.0 H / 1.2 H, apex 0.38 s |
| Fall gravity multiplier | 1.6 |
| Air jump | 2.0 H, 1 charge, refreshed by any interaction |
| Coyote / buffer | 0.10 s / 0.12 s |
| Slash | 0.22 s, active f3–f7, reach 1.5 H |
| Slash-hop | +1.4 H, +0.03 u |
| Air whiff float | 0.15 s, once per airtime |
| Stomp | ×3 fall; bounce 3.5 H |
| Slide | 0.5 s, 0.45 H tall; slide-jump 2.2 H |
| Grind attach window | 0.35 H; +0.06 u/s |
| Chain timer | 1.5 s |
| Multiplier | 1 + ⌊chain/4⌋, max ×8 |
| Hitstop | 3–5 frames by mass |
| Giant | 4× scale, 8 s |
| ChunkSim budget | 600 chunks, 2–4 s linger, shrink-pop |
| Jolt body budget | 30 |
