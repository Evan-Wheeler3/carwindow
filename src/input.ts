// Keyboard, mouse, touch and gamepad mapped to three verbs: Jump, Slash, (Any).

export class Input {
  jumpHeld = false;
  slashHeld = false;
  private jumpEdge = false;
  private slashEdge = false;
  private anyEdge = false;
  private pauseEdge = false;
  private padPrev = { a: false, x: false, start: false };
  private touchJumpIds = new Set<number>();
  bot: (() => { jump: boolean; slash: boolean }) | null = null;
  private botPrev = { jump: false, slash: false };

  constructor(target: HTMLElement) {
    const jumpKeys = new Set(['Space', 'ArrowUp', 'KeyW', 'KeyZ']);
    const slashKeys = new Set(['KeyJ', 'KeyK', 'KeyX', 'ArrowRight', 'KeyD', 'ShiftLeft', 'ShiftRight']);
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (jumpKeys.has(e.code)) { this.jumpHeld = true; this.jumpEdge = true; e.preventDefault(); }
      if (slashKeys.has(e.code)) { this.slashHeld = true; this.slashEdge = true; e.preventDefault(); }
      if (e.code === 'Escape' || e.code === 'KeyP') this.pauseEdge = true;
      else this.anyEdge = true;
    });
    window.addEventListener('keyup', (e) => {
      if (jumpKeys.has(e.code)) this.jumpHeld = false;
      if (slashKeys.has(e.code)) this.slashHeld = false;
    });
    target.addEventListener('mousedown', (e) => {
      if (e.button === 0) { this.slashEdge = true; this.slashHeld = true; }
      if (e.button === 2) { this.jumpEdge = true; this.jumpHeld = true; }
      this.anyEdge = true;
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.slashHeld = false;
      if (e.button === 2) this.jumpHeld = false;
    });
    target.addEventListener('contextmenu', (e) => e.preventDefault());
    // touch: right half = jump (hold for height), left half = slash
    target.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        if (t.clientX > window.innerWidth / 2) {
          this.jumpEdge = true;
          this.touchJumpIds.add(t.identifier);
        } else this.slashEdge = true;
      }
      this.jumpHeld = this.touchJumpIds.size > 0;
      this.anyEdge = true;
    }, { passive: false });
    const end = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) this.touchJumpIds.delete(t.identifier);
      this.jumpHeld = this.touchJumpIds.size > 0;
    };
    target.addEventListener('touchend', end);
    target.addEventListener('touchcancel', end);
  }

  /** Poll gamepads and bots; call once per frame before reading edges. */
  poll() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) {
      if (!p) continue;
      const a = !!(p.buttons[0]?.pressed || p.buttons[1]?.pressed);
      const x = !!(p.buttons[2]?.pressed || p.buttons[3]?.pressed || p.buttons[5]?.pressed || p.buttons[7]?.pressed);
      const start = !!p.buttons[9]?.pressed;
      if (a && !this.padPrev.a) { this.jumpEdge = true; this.anyEdge = true; }
      if (x && !this.padPrev.x) { this.slashEdge = true; this.anyEdge = true; }
      if (start && !this.padPrev.start) this.pauseEdge = true;
      this.jumpHeld = this.jumpHeld || a;
      if (!a && this.padPrev.a && this.touchJumpIds.size === 0) this.jumpHeld = false;
      this.padPrev = { a, x, start };
      break;
    }
    if (this.bot) {
      const b = this.bot();
      if (b.jump && !this.botPrev.jump) this.jumpEdge = true;
      if (b.slash && !this.botPrev.slash) this.slashEdge = true;
      this.jumpHeld = b.jump;
      this.botPrev = b;
    }
  }

  takeJump() { const v = this.jumpEdge; this.jumpEdge = false; return v; }
  takeSlash() { const v = this.slashEdge; this.slashEdge = false; return v; }
  takeAny() { const v = this.anyEdge; this.anyEdge = false; return v; }
  takePause() { const v = this.pauseEdge; this.pauseEdge = false; return v; }
  clear() { this.jumpEdge = this.slashEdge = this.anyEdge = this.pauseEdge = false; }
}
