import { Game } from './game';

const app = document.getElementById('app')!;
const game = new Game(app);
(window as any).__game = game;

const warp = Math.max(1, Math.min(20, Number(new URLSearchParams(location.search).get('warp')) || 1));
let last = performance.now();
function loop(now: number) {
  const dt = (now - last) / 1000;
  last = now;
  // ?warp=N runs N simulation frames per displayed frame (testing only)
  for (let i = 0; i < warp; i++) {
    game.skipRender = i < warp - 1;
    game.frame(i === 0 ? dt : 0.1);
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
