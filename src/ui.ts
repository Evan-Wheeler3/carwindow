// ---------------------------------------------------------------------------
// DOM overlay. Styled as things on the glass: stickers, crayon marks and
// finger-writing in condensation. Positions are fed in screen pixels by the
// game (it projects the window frame and world points every frame).
// ---------------------------------------------------------------------------

export interface Rect { x: number; y: number; w: number; h: number; }

const css = `
#ui { position: fixed; inset: 0; pointer-events: none; font-family: 'Gochi Hand', 'Comic Sans MS', cursive; color: #fff; user-select: none; -webkit-user-select: none; }
#ui * { box-sizing: border-box; }
.glassText { position: absolute; color: rgba(255,255,255,0.93); text-shadow: 0 0 6px rgba(255,255,255,0.55), 0 2px 0 rgba(0,0,0,0.12); letter-spacing: 0.02em; transform: translate(-50%,-50%); text-align: center; white-space: nowrap; transition: opacity .5s; }
#title { font-size: clamp(42px, 8vw, 110px); line-height: .9; transform: translate(-50%,-50%) rotate(-4deg); }
#title small { display:block; font-size: .28em; margin-top: .5em; opacity: .9; }
#prompt { font-size: clamp(18px, 2.6vw, 30px); animation: pulse 1.6s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
.sticker { position: absolute; background: #fffdf4; color: #2a2a35; border-radius: 12px; padding: 4px 12px 2px; box-shadow: 0 3px 0 rgba(0,0,0,.18), 0 0 0 3px rgba(255,255,255,.65) inset; font-family: 'Fredoka', 'Gochi Hand', sans-serif; font-weight: 600; transform-origin: center; }
#score { font-size: clamp(14px, 1.6vw, 22px); transform: rotate(-3deg); }
#score b { font-size: 1.25em; color: #e0362c; }
#lead { background: #ffd34a; font-size: clamp(13px, 1.4vw, 19px); transform: translate(-50%, 0) rotate(5deg) scale(0); transition: transform .25s cubic-bezier(.3,1.6,.5,1); }
#lead.on { transform: translate(-50%, 0) rotate(5deg) scale(1); }
#wonder { position: absolute; display: flex; align-items: center; gap: 6px; transform: translate(-50%, 0); }
#wonder .bar { position: relative; width: clamp(110px, 16vw, 230px); height: 14px; border-radius: 8px; background: rgba(255,255,255,.28); border: 2px solid rgba(255,255,255,.75); overflow: hidden; }
#wonder .fill { position: absolute; left:0; top:0; bottom:0; width: 0%; border-radius: 6px; background: linear-gradient(90deg,#ffe27a,#ff9e5e); transition: width .15s; }
#wonder .tick { position: absolute; top: -2px; bottom: -2px; width: 2px; background: rgba(255,255,255,.75); }
#wonder .label { font-size: clamp(14px,1.5vw,20px); text-shadow: 0 1px 2px rgba(0,0,0,.35); min-width: 6.5em; }
#wonder .stars { font-size: clamp(16px,1.7vw,22px); letter-spacing: 2px; text-shadow: 0 1px 2px rgba(0,0,0,.35); }
#wonder.warn .fill { background: linear-gradient(90deg,#9fb0c0,#c8d2db); }
#wonder.warn .label { color: #ffe3c7; animation: pulse .8s infinite; }
#chain { position: absolute; transform: translate(-50%,-100%); text-align: center; font-family: 'Fredoka','Gochi Hand',sans-serif; font-weight: 700; color: #fff; text-shadow: 0 2px 0 rgba(0,0,0,.25), 0 0 8px rgba(0,0,0,.2); transition: opacity .2s; }
#chain .mult { font-size: clamp(18px,2.2vw,30px); color: #ffd34a; }
#chain .verb { font-size: clamp(12px,1.2vw,16px); opacity: .95; }
.pop { position: absolute; transform: translate(-50%,-50%); font-family: 'Fredoka','Gochi Hand',sans-serif; font-weight: 700; font-size: clamp(13px,1.3vw,18px); color: #fff; text-shadow: 0 2px 0 rgba(0,0,0,.3); animation: popup 0.9s ease-out forwards; }
@keyframes popup { 0% { opacity: 0; margin-top: 6px; } 15% { opacity: 1; } 100% { opacity: 0; margin-top: -42px; } }
#heads { position: absolute; width: 46px; height: 46px; transform: translate(0,-50%); opacity: 0; }
#heads svg { width: 100%; height: 100%; filter: drop-shadow(0 0 8px rgba(255,180,60,.9)); }
#hint { font-size: clamp(16px, 2vw, 26px); opacity: 0; }
.card { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); background: #fffdf4; color: #2a2a35; border-radius: 22px; padding: 22px 30px 20px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,.35), 0 0 0 6px rgba(255,255,255,.6) inset; pointer-events: none; min-width: min(380px, 86vw); max-width: 92vw; opacity: 0; transition: opacity .4s, transform .4s; }
.card.on { opacity: 1; pointer-events: auto; }
.card h2 { margin: 0 0 4px; font-size: clamp(28px, 4vw, 44px); font-weight: 400; }
.card p { margin: 6px 0; font-family: 'Fredoka',sans-serif; font-size: clamp(14px,1.6vw,18px); color: #555; }
.card .big { font-family: 'Fredoka',sans-serif; font-weight: 700; font-size: clamp(30px, 4.6vw, 52px); color: #e0362c; margin: 4px 0; }
.card .stars { font-size: clamp(34px,5vw,56px); color: #ffc93a; letter-spacing: 6px; text-shadow: 0 3px 0 rgba(0,0,0,.12); }
.card .stars .off { color: #ddd6c4; }
.card button { font-family: 'Gochi Hand',cursive; font-size: clamp(20px,2.4vw,28px); padding: 8px 26px 6px; margin: 12px 6px 0; border-radius: 14px; border: none; background: #e0362c; color: #fff; cursor: pointer; box-shadow: 0 4px 0 #a82219; }
.card button.alt { background: #4a6fa5; box-shadow: 0 4px 0 #2f4c78; }
.card button:active { transform: translateY(3px); box-shadow: 0 1px 0 #a82219; }
#controls { position: absolute; font-family: 'Gochi Hand',cursive; font-size: clamp(13px,1.4vw,18px); color: rgba(255,255,255,.85); text-shadow: 0 1px 3px rgba(0,0,0,.5); transition: opacity .6s; }
#mute { position: absolute; right: 14px; top: 12px; pointer-events: auto; background: rgba(0,0,0,.25); border: none; border-radius: 10px; color: #fff; font-size: 18px; padding: 4px 10px; cursor: pointer; }
`;

export class UI {
  root: HTMLDivElement;
  private el: Record<string, HTMLElement> = {};
  private pops = 0;
  win: Rect = { x: 0, y: 0, w: 1, h: 1 };
  onMute: (() => void) | null = null;

  constructor() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    this.root = document.createElement('div');
    this.root.id = 'ui';
    this.root.innerHTML = `
      <div id="title" class="glassText">Window Seat<small>a backseat daydream</small></div>
      <div id="prompt" class="glassText">click / press any key to look outside</div>
      <div id="score" class="sticker">0</div>
      <div id="lead" class="sticker">LEADING! ×1.5</div>
      <div id="wonder"><span class="stars">☆☆☆</span><div class="bar"><div class="fill"></div><div class="tick" style="left:33.3%"></div><div class="tick" style="left:66.6%"></div></div><span class="label">Just Looking</span></div>
      <div id="chain"><div class="mult"></div><div class="verb"></div></div>
      <div id="heads"><svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="#ffb03a" stroke="#fff" stroke-width="3"/><path d="M14 23 L30 13 L30 33 Z" fill="#fff" transform="rotate(180 23 23)"/></svg></div>
      <div id="hint" class="glassText"></div>
      <div id="controls"></div>
      <div id="card" class="card"></div>
      <button id="mute" title="Mute">🔊</button>
    `;
    document.body.appendChild(this.root);
    for (const id of ['title', 'prompt', 'score', 'lead', 'wonder', 'chain', 'heads', 'hint', 'card', 'controls', 'mute']) {
      this.el[id] = this.root.querySelector('#' + id) as HTMLElement;
    }
    this.el.mute.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onMute?.();
    });
    this.el.mute.addEventListener('mousedown', (e) => e.stopPropagation());
    this.showHud(false);
  }

  setMuted(m: boolean) { this.el.mute.textContent = m ? '🔇' : '🔊'; }

  /** Title text is "written" on the window behind the kid. */
  setTitle(visible: boolean, at?: { x: number; y: number }) {
    this.el.title.style.display = visible ? '' : 'none';
    this.el.prompt.style.display = visible ? '' : 'none';
    if (at) {
      this.el.title.style.left = at.x + 'px';
      this.el.title.style.top = at.y + 'px';
      this.el.prompt.style.left = at.x + 'px';
      this.el.prompt.style.top = window.innerHeight * 0.86 + 'px';
    }
  }

  showHud(v: boolean) {
    for (const id of ['score', 'wonder', 'chain']) this.el[id].style.display = v ? '' : 'none';
    if (!v) {
      this.el.lead.classList.remove('on');
      this.el.heads.style.opacity = '0';
    }
  }

  layout(win: Rect) {
    this.win = win;
    const s = this.el.score;
    s.style.left = win.x + win.w * 0.06 + 'px';
    s.style.top = win.y + win.h * 0.06 + 'px';
    const w = this.el.wonder;
    w.style.left = win.x + win.w * 0.55 + 'px';
    w.style.top = win.y + win.h * 0.045 + 'px';
    const l = this.el.lead;
    l.style.left = win.x + win.w * 0.86 + 'px';
    l.style.top = win.y + win.h * 0.2 + 'px';
    const c = this.el.controls;
    c.style.left = win.x + win.w * 0.04 + 'px';
    c.style.top = win.y + win.h * 0.9 + 'px';
  }

  setScore(total: number) { this.el.score.innerHTML = `SCORE <b>${total.toLocaleString()}</b>`; }

  setWonder(wonder: number, tier: number, warn: boolean) {
    const pct = Math.min(100, (wonder / 300) * 100);
    (this.el.wonder.querySelector('.fill') as HTMLElement).style.width = pct + '%';
    const names = ['Just Looking', 'Pretend', 'Adventure', 'LEGEND'];
    (this.el.wonder.querySelector('.label') as HTMLElement).textContent = warn ? 'getting bored…' : names[tier];
    (this.el.wonder.querySelector('.stars') as HTMLElement).textContent = '★'.repeat(tier) + '☆'.repeat(3 - tier);
    this.el.wonder.classList.toggle('warn', warn);
  }

  setLeading(on: boolean) { this.el.lead.classList.toggle('on', on); }

  setChain(at: { x: number; y: number } | null, mult: number, chain: number, verb: string) {
    const c = this.el.chain;
    if (!at || chain < 2) {
      c.style.opacity = '0';
      return;
    }
    c.style.opacity = '1';
    c.style.left = at.x + 'px';
    c.style.top = at.y + 'px';
    (c.querySelector('.mult') as HTMLElement).textContent = `×${mult}  ${chain} chain`;
    (c.querySelector('.verb') as HTMLElement).textContent = verb;
  }

  popup(at: { x: number; y: number }, text: string, color = '#fff') {
    if (this.pops > 14) return;
    const d = document.createElement('div');
    d.className = 'pop';
    d.textContent = text;
    d.style.left = at.x + 'px';
    d.style.top = at.y + 'px';
    d.style.color = color;
    this.root.appendChild(d);
    this.pops++;
    setTimeout(() => {
      d.remove();
      this.pops--;
    }, 900);
  }

  setHeadsUp(at: { x: number; y: number } | null, urgency: number) {
    const h = this.el.heads;
    if (!at) {
      h.style.opacity = '0';
      return;
    }
    h.style.left = at.x + 'px';
    h.style.top = at.y + 'px';
    const pulse = 0.6 + 0.4 * Math.sin(performance.now() * (0.01 + urgency * 0.03));
    h.style.opacity = String(pulse);
    h.style.transform = `translate(0,-50%) scale(${0.85 + urgency * 0.4})`;
  }

  hint(text: string, at?: { x: number; y: number }) {
    const h = this.el.hint;
    h.textContent = text;
    h.style.opacity = text ? '1' : '0';
    if (at) {
      h.style.left = at.x + 'px';
      h.style.top = at.y + 'px';
    }
  }

  controls(text: string) {
    this.el.controls.textContent = text;
    this.el.controls.style.opacity = text ? '1' : '0';
  }

  card(html: string, buttons: { label: string; alt?: boolean; onClick: () => void }[]) {
    const c = this.el.card;
    c.innerHTML = html;
    for (const b of buttons) {
      const btn = document.createElement('button');
      btn.textContent = b.label;
      if (b.alt) btn.className = 'alt';
      btn.addEventListener('mousedown', (e) => e.stopPropagation());
      btn.addEventListener('touchstart', (e) => e.stopPropagation());
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        b.onClick();
      });
      c.appendChild(btn);
    }
    c.classList.add('on');
    c.style.pointerEvents = 'auto';
  }

  hideCard() {
    this.el.card.classList.remove('on');
    this.el.card.style.pointerEvents = 'none';
  }
}
