/** Quiet, static star field behind both views. Seeded so it never shimmers on resize. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mountStarfield(host: HTMLElement) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  host.append(canvas);
  const draw = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = host.clientWidth;
    const h = host.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const rnd = mulberry32(20260928);
    // faint nebula washes
    const wash = (x: number, y: number, r: number, c: string) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, c);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    };
    wash(w * 0.18, h * 0.22, Math.max(w, h) * 0.5, 'rgba(70,90,190,0.13)');
    wash(w * 0.82, h * 0.78, Math.max(w, h) * 0.55, 'rgba(110,60,170,0.10)');
    wash(w * 0.55, h * 0.1, Math.max(w, h) * 0.4, 'rgba(40,130,160,0.08)');
    const count = Math.floor((w * h) / 2600);
    for (let i = 0; i < count; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const big = rnd() > 0.965;
      const r = big ? 1.1 + rnd() * 0.7 : 0.25 + rnd() * 0.6;
      const a = big ? 0.85 : 0.2 + rnd() * 0.5;
      const tint = rnd();
      ctx.fillStyle = tint > 0.8 ? `rgba(180,205,255,${a})` : tint > 0.6 ? `rgba(255,230,190,${a})` : `rgba(235,240,255,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      if (big) {
        ctx.strokeStyle = `rgba(200,220,255,${a * 0.35})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x - r * 4, y);
        ctx.lineTo(x + r * 4, y);
        ctx.moveTo(x, y - r * 4);
        ctx.lineTo(x, y + r * 4);
        ctx.stroke();
      }
    }
  };
  draw();
  let timer = 0;
  new ResizeObserver(() => {
    clearTimeout(timer);
    timer = window.setTimeout(draw, 120);
  }).observe(host);
}
