// ---------------------------------------------------------------------------
// Trip 1: "The Errand". A handcrafted layout (with seeded filler) along the
// road, the car's speed plan, a stoplight breather, checkpoints and arrival.
// All x positions are relative to the trip origin (where the hero appears).
// ---------------------------------------------------------------------------

export type ItemKind =
  | 'mailbox'
  | 'sign'
  | 'tree'
  | 'pole'
  | 'fence'
  | 'barrier'
  | 'platform'
  | 'slowCar'
  | 'fastCar'
  | 'trafficLight'
  | 'store';

export interface Item {
  kind: ItemKind;
  x: number;
  n?: number; // fence segments / platform length
  y?: number; // platform height
  line?: number; // power-line id for poles
  variant?: number;
  color?: number;
}

export interface SpeedZone {
  from: number;
  speed: number;
  biome: 'neighborhood' | 'mainroad' | 'highway' | 'arrival';
}

export interface TripDef {
  name: string;
  zones: SpeedZone[];
  stops: { x: number; wait: number }[];
  checkpoints: number[];
  end: number;
  items: Item[];
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildErrand(): TripDef {
  const zones: SpeedZone[] = [
    { from: -1e9, speed: 4.5, biome: 'neighborhood' },
    { from: 300, speed: 6.2, biome: 'mainroad' },
    { from: 650, speed: 8.2, biome: 'highway' },
    { from: 1010, speed: 5, biome: 'arrival' },
  ];
  const stops = [{ x: 292, wait: 4.5 }];
  const end = 1110;
  const items: Item[] = [];
  const r = rng(1987);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  let line = 0;

  const powerLine = (x0: number, count: number, spacing: number) => {
    line++;
    for (let i = 0; i < count; i++) items.push({ kind: 'pole', x: x0 + i * spacing, line });
    return x0 + (count - 1) * spacing;
  };

  // --- Departure: gentle neighbourhood, teach jump + slash ------------------
  items.push({ kind: 'mailbox', x: 14 });
  items.push({ kind: 'mailbox', x: 26 });
  items.push({ kind: 'fence', x: 38, n: 4 });
  items.push({ kind: 'mailbox', x: 54 });
  items.push({ kind: 'tree', x: 66, variant: 0 });
  items.push({ kind: 'mailbox', x: 76 });
  items.push({ kind: 'fence', x: 86, n: 5 });
  items.push({ kind: 'sign', x: 102, variant: 1 });
  items.push({ kind: 'tree', x: 112, variant: 1 });
  items.push({ kind: 'mailbox', x: 121 });
  // first power line: teach the wire grind (a fence leads up to it)
  const pl1 = powerLine(134, 6, 10);
  items.push({ kind: 'mailbox', x: 139 });
  items.push({ kind: 'fence', x: 146, n: 3 });
  items.push({ kind: 'mailbox', x: 159 });
  items.push({ kind: 'sign', x: 169, variant: 0 });
  items.push({ kind: 'slowCar', x: 175, color: 0xf2c230 });
  for (let x = pl1 + 12; x < 280; ) {
    const k = pick(['mailbox', 'fence', 'tree', 'sign', 'mailbox']);
    if (k === 'fence') {
      const n = 3 + Math.floor(r() * 3);
      items.push({ kind: 'fence', x, n });
      x += n + 6;
    } else {
      items.push({ kind: k as any, x, variant: Math.floor(r() * 3) });
      x += 6.5 + r() * 5;
    }
  }
  items.push({ kind: 'trafficLight', x: 294 });

  // --- Main road: power lines, traffic, imagined platforms -------------------
  let x = 304;
  const pl2 = powerLine(306, 9, 10.5);
  for (x = 309; x < pl2; ) {
    const k = pick(['mailbox', 'sign', 'fence', 'mailbox', 'tree']);
    if (k === 'fence') {
      items.push({ kind: 'fence', x, n: 3 });
      x += 10.5;
    } else {
      items.push({ kind: k as any, x, variant: Math.floor(r() * 3) });
      x += 10.5;
    }
  }
  items.push({ kind: 'slowCar', x: 330, color: 0x4aa3df });
  items.push({ kind: 'fastCar', x: 372, color: 0x7bc96f });
  items.push({ kind: 'platform', x: 410, y: 2.4, n: 30 });
  items.push({ kind: 'platform', x: 416, y: 3.9, n: 30 });
  items.push({ kind: 'platform', x: 422, y: 5.3, n: 36 });
  x = pl2 + 10;
  items.push({ kind: 'tree', x, variant: 2 });
  items.push({ kind: 'tree', x: x + 3.2, variant: 0 });
  items.push({ kind: 'tree', x: x + 6.4, variant: 1 });
  const pl3 = powerLine(x + 14, 10, 10);
  for (x = x + 18; x < pl3 - 2; x += 10) {
    const k = pick(['mailbox', 'sign', 'fence', 'tree', 'barrier']);
    items.push(k === 'fence' ? { kind: 'fence', x: x - 1, n: 3 } : { kind: k as any, x, variant: Math.floor(r() * 3) });
  }
  items.push({ kind: 'slowCar', x: 470, color: 0xe8e2d0 });
  items.push({ kind: 'fastCar', x: 520, color: 0x9b7fd1 });
  items.push({ kind: 'slowCar', x: 560, color: 0xf08a4b });
  items.push({ kind: 'platform', x: 590, y: 2.6, n: 30 });
  items.push({ kind: 'platform', x: 597, y: 4.2, n: 30 });
  x = pl3 + 8;
  items.push({ kind: 'barrier', x });
  items.push({ kind: 'sign', x: x + 9, variant: 0 });

  // --- Highway: faster, longer power lines, more traffic ---------------------
  const pl4 = powerLine(662, 18, 11);
  for (x = 667; x < pl4; x += 11) {
    const k = pick(['barrier', 'sign', 'tree', 'barrier', 'sign', 'fence']);
    items.push(k === 'fence' ? { kind: 'fence', x: x - 1, n: 4 } : { kind: k as any, x, variant: Math.floor(r() * 3) });
  }
  items.push({ kind: 'fastCar', x: 680, color: 0x58c4b8 });
  items.push({ kind: 'slowCar', x: 720, color: 0xf2c230 });
  items.push({ kind: 'fastCar', x: 760, color: 0x4aa3df });
  items.push({ kind: 'platform', x: 790, y: 2.8, n: 30 });
  items.push({ kind: 'platform', x: 798, y: 4.4, n: 30 });
  items.push({ kind: 'platform', x: 806, y: 5.8, n: 42 });
  items.push({ kind: 'slowCar', x: 830, color: 0x7bc96f });
  items.push({ kind: 'fastCar', x: 880, color: 0xf08a4b });
  items.push({ kind: 'slowCar', x: 930, color: 0x9b7fd1 });
  items.push({ kind: 'fastCar', x: 965, color: 0xe8e2d0 });

  // --- Exit ramp and arrival at the store ------------------------------------
  const pl5 = powerLine(pl4 + 14, 6, 10);
  for (x = pl4 + 19; x < pl5; x += 10) items.push({ kind: pick(['mailbox', 'sign', 'tree']) as any, x, variant: Math.floor(r() * 3) });
  items.push({ kind: 'fence', x: pl5 + 8, n: 6 });
  items.push({ kind: 'mailbox', x: pl5 + 20 });
  items.push({ kind: 'store', x: end + 4 });

  items.sort((a, b) => a.x - b.x);
  return {
    name: 'The Errand',
    zones,
    stops,
    checkpoints: [0, 298, 655, 1000],
    end,
    items,
  };
}

export function zoneAt(trip: TripDef, x: number): SpeedZone {
  let z = trip.zones[0];
  for (const zz of trip.zones) if (x >= zz.from) z = zz;
  return z;
}
