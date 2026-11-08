// Drawing the live views on a canvas (bench/ measured a live SVG's restyle
// and repaint as most of a busy frame; a canvas is redrawn in one go): the
// drawing's own units fitted as an SVG viewBox would be, paths and text in
// them, the chart colours read from the page's CSS, and useLiveCanvas(), which
// redraws at most once a frame, only on screen, and has the fixed parts
// (cached as layers by the view) drawn again on a resize or a theme change.
import { onMounted, onBeforeUnmount } from 'vue';

export const CHART_COLORS = ['--series-1', '--series-2', '--series-3'];

// the page's colours and font, as the canvas's CSS has them
export function readStyle(el) {
  const css = getComputedStyle(el);
  return {
    colors: Object.fromEntries(CHART_COLORS.map((n) => [n, css.getPropertyValue(n).trim()])),
    font: css.fontFamily || 'sans-serif',
  };
}

// a canvas sized to its box at the device's pixels: true when it changed
export function fitPixels(c) {
  const dpr = devicePixelRatio || 1;
  const w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr);
  if (c.width === w && c.height === h) return false;
  c.width = w;
  c.height = h;
  return true;
}

// a view box { x, y, w, h } in a canvas w x h px, fitted and centred (SVG's
// xMidYMid meet): the transform that draws in its units
export function viewFit(view, w, h) {
  const s = Math.min(w / view.w, h / view.h);
  return [s, 0, 0, s, (w - view.w * s) / 2 - view.x * s, (h - view.h * s) / 2 - view.y * s];
}

export function path(g, ps, close = false) {
  g.beginPath();
  ps.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  if (close) g.closePath();
}

// text at its baseline, as SVG's: align left, center or right
export function text(g, style, s, x, y, size, align, fill, bold = false) {
  g.font = `${bold ? 'bold ' : ''}${size}px ${style.font}`;
  g.textAlign = align;
  g.textBaseline = 'alphabetic';
  g.fillStyle = fill;
  g.fillText(s, x, y);
}

// an offscreen canvas as big as c, for a view's fixed parts
export const layerLike = (c) => Object.assign(document.createElement('canvas'), { width: c.width, height: c.height });

// el: a ref to the element holding the view's canvases; draw(fresh): draws
// them, fresh true when the fixed parts must be drawn again (first, resized,
// theme changed). Returns later(): a redraw on the next frame (for new data)
export function useLiveCanvas(el, draw) {
  let frame = 0, seen = true, fresh = true;
  const run = () => {
    frame = 0;
    if (!seen || !el.value) return;
    draw(fresh);
    fresh = false;
  };
  const later = () => { if (!frame) frame = requestAnimationFrame(run); };
  const refresh = () => { fresh = true; later(); };
  let observers = [];
  onMounted(() => {
    const resize = new ResizeObserver(refresh);
    resize.observe(el.value);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) later(); });
    io.observe(el.value);
    // the theme: the header's switch (data-theme on <html>) or the device's own
    const theme = new MutationObserver(refresh);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    const media = matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', refresh);
    observers = [resize, io, theme, { disconnect: () => media.removeEventListener('change', refresh) }];
    later();
  });
  onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
    for (const o of observers) o.disconnect();
  });
  return later;
}
