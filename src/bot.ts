import type { Game } from './game';
import { Pole, Vehicle, Barrier, Toppler } from './entities';

// A simple autoplayer used for testing (?autoplay). It slashes what's ahead,
// hops hazards, climbs onto wires and rides cars. It is not meant to be good.
export function makeBot(game: Game) {
  let holdJump = 0;
  let airTap = -1;
  let slashCd = 0;
  let last = 0;
  return () => {
    const now = game.stateT;
    const dt = Math.max(0, Math.min(0.1, now - last));
    last = now;
    slashCd -= dt;
    holdJump -= dt;
    if (game.state !== 'play' && game.state !== 'arrival') return { jump: false, slash: false };
    const h = game.hero;
    let jump = holdJump > 0;
    let slash = false;
    if (airTap >= 0) {
      airTap -= dt;
      if (airTap < 0) {
        jump = false;
        holdJump = 0.25;
        return { jump: false, slash: false };
      }
    }
    for (const e of game.entities) {
      if (!e.alive) continue;
      const d = e.x - h.x;
      if (d < -0.5 || d > 3) continue;
      const b = e.box();
      if (e.breakable && b && d < 1.7 && b.y1 > h.y - 0.3 && b.y0 < h.y + 1.3 && slashCd <= 0) {
        slash = true;
        slashCd = 0.2;
      }
      if ((e instanceof Barrier || e instanceof Vehicle) && b && d < 2.2 && d > 0 && !h.airborne && h.standingOn !== e) {
        jump = true;
        holdJump = 0.2;
      }
      if (e instanceof Toppler && !(e instanceof Pole) && d < 1.6 && slashCd <= 0) {
        slash = true;
        slashCd = 0.2;
      }
    }
    // climb onto wires sometimes
    const span = game.wires.spanAt(h.x + 2);
    if (span && !h.airborne && !h.grinding && Math.random() < 0.02) {
      jump = true;
      holdJump = 0.4;
      airTap = 0.35;
    }
    if (h.airborne && h.vy < 1 && h.airJumps > 0 && game.wires.spanAt(h.x + 1) && h.y < 4.2 && Math.random() < 0.3) {
      return { jump: false, slash } as any;
    }
    return { jump, slash };
  };
}
