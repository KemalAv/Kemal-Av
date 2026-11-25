/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Document edge detection + perspective correction for PDF Extract.
 *
 * Pure TypeScript (no DOM dependency) so it can be unit-tested in Node.
 *
 * Pipeline (detect):
 *   1. Downscale + blur.
 *   2. Build several candidate foreground masks (bright paper, dark paper,
 *      colour-distance from the frame, closed-edge contour).
 *   3. Clean each mask (close -> fill holes -> open) and keep the biggest blobs.
 *   4. Convex hull of each blob -> reduce to the tightest enclosing quadrilateral.
 *   5. Score every candidate (fill ratio, size, angles, opposite-edge ratio,
 *      centering) and keep the best one.
 *
 * Pipeline (warp):
 *   - Real homography (not a bilinear patch) + bilinear resampling.
 *   - Output size from the quad, with a perspective-aware aspect-ratio estimate
 *     (Zhang & He) and snapping to A4 / Letter / ID-card when very close.
 */

export interface Point {
  x: number;
  y: number;
}

export interface RGBA {
  data: Uint8ClampedArray | Uint8Array;
  width: number;
  height: number;
}

export interface DetectResult {
  /** [TL, TR, BR, BL] in source-pixel coordinates */
  corners: Point[];
  /** 0..1 — how much we trust the detection */
  confidence: number;
  /** false when we fell back to an inset rectangle */
  found: boolean;
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const WORK_SIZE = 640;
const MIN_ACCEPT_SCORE = 0.28;

function downscale(img: RGBA, maxDim: number): { w: number; h: number; scale: number; rgb: Float32Array[] } {
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(32, Math.round(img.width * scale));
  const h = Math.max(32, Math.round(img.height * scale));
  const sx = img.width / w;
  const sy = img.height / h;
  const r = new Float32Array(w * h);
  const g = new Float32Array(w * h);
  const b = new Float32Array(w * h);
  const src = img.data;

  for (let y = 0; y < h; y++) {
    const y0 = Math.floor(y * sy);
    const y1 = Math.max(y0 + 1, Math.min(img.height, Math.floor((y + 1) * sy)));
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor(x * sx);
      const x1 = Math.max(x0 + 1, Math.min(img.width, Math.floor((x + 1) * sx)));
      let sr = 0, sg = 0, sb = 0, n = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * img.width + xx) * 4;
          sr += src[i];
          sg += src[i + 1];
          sb += src[i + 2];
          n++;
        }
      }
      const o = y * w + x;
      r[o] = sr / n;
      g[o] = sg / n;
      b[o] = sb / n;
    }
  }
  return { w, h, scale: w / img.width, rgb: [r, g, b] };
}

/** Separable box blur (edge-clamped), run `passes` times — approximates a Gaussian. */
function boxBlur(src: Float32Array, w: number, h: number, radius: number, passes = 2): Float32Array {
  let a = src;
  let b = new Float32Array(src.length);
  const win = radius * 2 + 1;
  for (let p = 0; p < passes; p++) {
    // horizontal
    for (let y = 0; y < h; y++) {
      const row = y * w;
      let acc = 0;
      for (let k = -radius; k <= radius; k++) acc += a[row + Math.min(w - 1, Math.max(0, k))];
      for (let x = 0; x < w; x++) {
        b[row + x] = acc / win;
        acc += a[row + Math.min(w - 1, x + radius + 1)] - a[row + Math.max(0, x - radius)];
      }
    }
    // vertical
    const c = new Float32Array(src.length);
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) acc += b[Math.min(h - 1, Math.max(0, k)) * w + x];
      for (let y = 0; y < h; y++) {
        c[y * w + x] = acc / win;
        acc += b[Math.min(h - 1, y + radius + 1) * w + x] - b[Math.max(0, y - radius) * w + x];
      }
    }
    a = c;
  }
  return a;
}

function otsu(values: Float32Array, maxVal = 255): number {
  const bins = 256;
  const hist = new Float64Array(bins);
  const k = (bins - 1) / maxVal;
  for (let i = 0; i < values.length; i++) {
    hist[Math.max(0, Math.min(bins - 1, Math.round(values[i] * k)))]++;
  }
  const total = values.length;
  let sumAll = 0;
  for (let i = 0; i < bins; i++) sumAll += i * hist[i];
  let sumB = 0, wB = 0, best = -1, thr = bins / 2;
  for (let t = 0; t < bins; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sumAll - sumB) / wF;
    const v = wB * wF * (mB - mF) * (mB - mF);
    if (v > best) {
      best = v;
      thr = t;
    }
  }
  return thr / k;
}

/** Binary dilate (grow=true) / erode (grow=false) with a square window, O(n). */
function morph(mask: Uint8Array, w: number, h: number, r: number, grow: boolean): Uint8Array {
  if (r <= 0) return mask;
  const win = 2 * r + 1;
  const tmp = new Int32Array(w * h);
  const out = new Uint8Array(w * h);
  // horizontal counts (outside the image counts as 0 for dilate and 1 for erode => edge-clamped semantic)
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let acc = 0;
    for (let k = -r; k <= r; k++) acc += mask[row + Math.min(w - 1, Math.max(0, k))];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = acc;
      acc += mask[row + Math.min(w - 1, x + r + 1)] - mask[row + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let k = -r; k <= r; k++) acc += tmp[Math.min(h - 1, Math.max(0, k)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = grow ? (acc > 0 ? 1 : 0) : acc === win * win ? 1 : 0;
      acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
  return out;
}

/** Fill every 0-region that cannot reach the image border. */
function fillHoles(mask: Uint8Array, w: number, h: number): Uint8Array {
  const reach = new Uint8Array(w * h);
  const stack: number[] = [];
  const push = (i: number) => {
    if (!mask[i] && !reach[i]) {
      reach[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w;
    const y = (i - x) / w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < h - 1) push(i + w);
  }
  const out = new Uint8Array(w * h);
  for (let i = 0; i < out.length; i++) out[i] = reach[i] ? 0 : 1;
  return out;
}

interface Blob {
  area: number;
  boundary: Point[];
}

/** 4-connected components; returns the biggest `limit` blobs above `minArea`. */
function findBlobs(mask: Uint8Array, w: number, h: number, minArea: number, limit: number): Blob[] {
  const label = new Int32Array(w * h);
  const blobs: { area: number; id: number }[] = [];
  const stack: number[] = [];
  let next = 0;
  for (let s = 0; s < mask.length; s++) {
    if (!mask[s] || label[s]) continue;
    next++;
    let area = 0;
    label[s] = next;
    stack.push(s);
    while (stack.length) {
      const i = stack.pop()!;
      area++;
      const x = i % w;
      const y = (i - x) / w;
      if (x > 0 && mask[i - 1] && !label[i - 1]) { label[i - 1] = next; stack.push(i - 1); }
      if (x < w - 1 && mask[i + 1] && !label[i + 1]) { label[i + 1] = next; stack.push(i + 1); }
      if (y > 0 && mask[i - w] && !label[i - w]) { label[i - w] = next; stack.push(i - w); }
      if (y < h - 1 && mask[i + w] && !label[i + w]) { label[i + w] = next; stack.push(i + w); }
    }
    if (area >= minArea) blobs.push({ area, id: next });
  }
  blobs.sort((a, b) => b.area - a.area);
  const top = blobs.slice(0, limit);
  if (!top.length) return [];

  const idx = new Map<number, Point[]>();
  top.forEach(b => idx.set(b.id, []));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const id = label[i];
      if (!id) continue;
      const list = idx.get(id);
      if (!list) continue;
      const edge =
        x === 0 || y === 0 || x === w - 1 || y === h - 1 ||
        label[i - 1] !== id || label[i + 1] !== id || label[i - w] !== id || label[i + w] !== id;
      if (edge) list.push({ x, y });
    }
  }
  return top.map(b => ({ area: b.area, boundary: idx.get(b.id)! }));
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

const cross = (o: Point, a: Point, b: Point) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

function convexHull(points: Point[]): Point[] {
  if (points.length < 3) return points.slice();
  const pts = points.slice().sort((a, b) => (a.x - b.x) || (a.y - b.y));
  const lower: Point[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Point[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function signedArea(poly: Point[]): number {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    a += p.x * q.y - q.x * p.y;
  }
  return a / 2;
}

/** Ramer–Douglas–Peucker on a closed polygon (keeps it closed). */
function simplifyClosed(poly: Point[], eps: number): Point[] {
  if (poly.length <= 8) return poly;
  // split at the two points that are furthest apart
  let ia = 0, ib = 0, best = -1;
  for (let i = 0; i < poly.length; i++) {
    for (let j = i + 1; j < poly.length; j++) {
      const d = (poly[i].x - poly[j].x) ** 2 + (poly[i].y - poly[j].y) ** 2;
      if (d > best) { best = d; ia = i; ib = j; }
    }
  }
  const part = (from: number, to: number): Point[] => {
    const out: Point[] = [];
    for (let i = from; i !== to; i = (i + 1) % poly.length) out.push(poly[i]);
    out.push(poly[to]);
    return out;
  };
  const rdp = (pts: Point[]): Point[] => {
    if (pts.length < 3) return pts;
    const a = pts[0], b = pts[pts.length - 1];
    let maxD = -1, mi = 0;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1e-9;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = Math.abs(cross(a, b, pts[i])) / len;
      if (d > maxD) { maxD = d; mi = i; }
    }
    if (maxD <= eps) return [a, b];
    const left = rdp(pts.slice(0, mi + 1));
    const right = rdp(pts.slice(mi));
    return left.slice(0, -1).concat(right);
  };
  const s1 = rdp(part(ia, ib));
  const s2 = rdp(part(ib, ia));
  return s1.slice(0, -1).concat(s2.slice(0, -1));
}

function lineIntersect(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
  const d1x = p2.x - p1.x, d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x, d2y = p4.y - p3.y;
  const den = d1x * d2y - d1y * d2x;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / den;
  return { x: p1.x + t * d1x, y: p1.y + t * d1y };
}

/**
 * Reduce a convex polygon to the tightest enclosing quadrilateral by repeatedly
 * removing the edge whose removal (extending its two neighbours until they meet)
 * adds the least area.
 */
function reduceToQuad(hull: Point[]): Point[] | null {
  let poly = simplifyClosed(hull, 0.6);
  if (poly.length < 4) return null;
  if (signedArea(poly) < 0) poly = poly.slice().reverse();
  // after the flip: interior is on the left of each directed edge => cross(edge, p-v) > 0 inside

  while (poly.length > 4) {
    const n = poly.length;
    let bestI = -1, bestArea = Infinity, bestP: Point | null = null;
    for (let i = 0; i < n; i++) {
      const a = poly[(i - 1 + n) % n];
      const b = poly[i];
      const c = poly[(i + 1) % n];
      const d = poly[(i + 2) % n];
      const p = lineIntersect(a, b, c, d);
      if (!p) continue;
      // the intersection must lie outside the edge b->c
      const side = cross(b, c, p);
      if (side >= 0) continue;
      const added = Math.abs(side) / 2;
      if (added < bestArea) {
        bestArea = added;
        bestI = i;
        bestP = p;
      }
    }
    if (bestI < 0 || !bestP) {
      // fallback: drop the vertex that contributes least area
      let mi = 0, ma = Infinity;
      for (let i = 0; i < n; i++) {
        const t = Math.abs(cross(poly[(i - 1 + n) % n], poly[i], poly[(i + 1) % n]));
        if (t < ma) { ma = t; mi = i; }
      }
      poly = poly.filter((_, i) => i !== mi);
      continue;
    }
    const next: Point[] = [];
    for (let k = 0; k < n; k++) {
      if (k === bestI) next.push(bestP);
      else if (k === (bestI + 1) % n) continue;
      else next.push(poly[k]);
    }
    poly = next;
  }
  return poly.length === 4 ? poly : null;
}

/** Order a convex quad clockwise on screen starting from the top-left-most vertex. */
export function orderCorners(quad: Point[]): Point[] {
  let q = quad.slice();
  // screen coords are y-down: shoelace > 0 means clockwise on screen
  if (signedArea(q) < 0) q = q.reverse();
  let start = 0, minSum = Infinity;
  q.forEach((p, i) => {
    const s = p.x + p.y;
    if (s < minSum) { minSum = s; start = i; }
  });
  return [0, 1, 2, 3].map(i => q[(start + i) % 4]);
}

function angleAt(prev: Point, cur: Point, next: Point): number {
  const ax = prev.x - cur.x, ay = prev.y - cur.y;
  const bx = next.x - cur.x, by = next.y - cur.y;
  const cos = (ax * bx + ay * by) / ((Math.hypot(ax, ay) * Math.hypot(bx, by)) || 1e-9);
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

// ---------------------------------------------------------------------------
// Candidate masks
// ---------------------------------------------------------------------------

function cleanMask(mask: Uint8Array, w: number, h: number): Uint8Array {
  const r = Math.max(1, Math.round(Math.max(w, h) / 220));
  let m = morph(morph(mask, w, h, r, true), w, h, r, false); // close
  m = fillHoles(m, w, h);
  m = morph(morph(m, w, h, r, false), w, h, r, true); // open
  return m;
}

/** Sobel gradient (unnormalised: a ramp of g gray-levels/pixel gives ~8*g). */
function sobel(gray: Float32Array, w: number, h: number) {
  const gx = new Float32Array(w * h);
  const gy = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      gx[i] =
        -gray[i - w - 1] - 2 * gray[i - 1] - gray[i + w - 1] +
        gray[i - w + 1] + 2 * gray[i + 1] + gray[i + w + 1];
      gy[i] =
        -gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1] +
        gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1];
    }
  }
  return { gx, gy };
}

/**
 * How much of the quad outline sits on a real, consistent brightness step?
 * Genuine paper borders show the same inside-vs-outside contrast along all four
 * sides; masks that leaked into background texture have an outline whose contrast
 * flips sign / vanishes, so they score low.
 */
function edgeSupport(quad: Point[], gray: Float32Array, w: number, h: number): number {
  const cx = quad.reduce((s, p) => s + p.x, 0) / 4;
  const cy = quad.reduce((s, p) => s + p.y, 0) / 4;
  const at = (x: number, y: number) => gray[Math.max(0, Math.min(h - 1, Math.round(y))) * w + Math.max(0, Math.min(w - 1, Math.round(x)))];
  const per: number[] = [];
  for (let e = 0; e < 4; e++) {
    const a = quad[e], b = quad[(e + 1) % 4];
    const ex = b.x - a.x, ey = b.y - a.y;
    const len = Math.hypot(ex, ey);
    if (len < 4) { per.push(0); continue; }
    let nx = -ey / len, ny = ex / len;
    if (((a.x + b.x) / 2 - cx) * nx + ((a.y + b.y) / 2 - cy) * ny < 0) { nx = -nx; ny = -ny; }
    const diffs: number[] = [];
    const N = 48;
    for (let k = 0; k < N; k++) {
      const t = 0.05 + (0.9 * k) / (N - 1);
      const bx = a.x + ex * t, by = a.y + ey * t;
      // samples at the frame border are not evidence either way
      if (bx < 8 || by < 8 || bx > w - 9 || by > h - 9) continue;
      let inside = 0, outside = 0;
      for (const d of [3, 5, 7]) {
        inside += at(bx - nx * d, by - ny * d);
        outside += at(bx + nx * d, by + ny * d);
      }
      diffs.push((outside - inside) / 3);
    }
    if (diffs.length < 6) { per.push(0.45); continue; } // edge on the frame border: weak evidence
    const pos = diffs.filter(d => d >= 8).length;
    const neg = diffs.filter(d => d <= -8).length;
    per.push(Math.max(pos, neg) / diffs.length);
  }
  const mean = per.reduce((s, v) => s + v, 0) / 4;
  return 0.5 * mean + 0.5 * Math.min(...per);
}

function buildMasks(
  w: number,
  h: number,
  gray: Float32Array,
  rgbBlur: Float32Array[],
  gx: Float32Array,
  gy: Float32Array,
): Uint8Array[] {
  const n = w * h;
  const masks: Uint8Array[] = [];

  // A / B: global Otsu on luminance (paper brighter, or paper darker, than the background)
  const t = otsu(gray);
  const bright = new Uint8Array(n);
  const dark = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    bright[i] = gray[i] > t ? 1 : 0;
    dark[i] = gray[i] <= t ? 1 : 0;
  }
  masks.push(bright, dark);

  // C: colour distance from the frame (background estimated from a thin border strip)
  const band = Math.max(2, Math.round(Math.min(w, h) * 0.03));
  const samples: number[][] = [[], [], []];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x < band || y < band || x >= w - band || y >= h - band) {
        const i = y * w + x;
        for (let c = 0; c < 3; c++) samples[c].push(rgbBlur[c][i]);
      }
    }
  }
  const bg = samples.map(s => {
    s.sort((a, b) => a - b);
    return s[s.length >> 1];
  });
  const dist = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const dr = rgbBlur[0][i] - bg[0];
    const dg = rgbBlur[1][i] - bg[1];
    const db = rgbBlur[2][i] - bg[2];
    dist[i] = Math.min(255, Math.sqrt(dr * dr + dg * dg + db * db) / 1.732);
  }
  const td = Math.max(12, otsu(dist));
  const far = new Uint8Array(n);
  for (let i = 0; i < n; i++) far[i] = dist[i] > td ? 1 : 0;
  masks.push(far);

  // D: closed contour from Sobel edges (works when paper and table have similar tone)
  const mag = new Float32Array(n);
  for (let i = 0; i < n; i++) mag[i] = Math.hypot(gx[i], gy[i]);
  const sorted = Float32Array.from(mag).sort();
  // Hysteresis thresholds (Canny-style): strong edges seed, weak edges connected to a
  // strong one are kept. This keeps faint paper-vs-table edges (paper in the shade)
  // that sit behind much stronger text edges.
  const strongT = Math.min(60, Math.max(20, sorted[Math.floor(n * 0.9)]));
  const weakT = Math.max(11, strongT * 0.25);
  const edges = new Uint8Array(n);
  const stack: number[] = [];
  for (let i = 0; i < n; i++) {
    if (mag[i] > strongT) {
      edges[i] = 1;
      stack.push(i);
    }
  }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w;
    const y = (i - x) / w;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 1 || ny < 1 || nx >= w - 1 || ny >= h - 1) continue;
        const j = ny * w + nx;
        if (!edges[j] && mag[j] > weakT) {
          edges[j] = 1;
          stack.push(j);
        }
      }
    }
  }
  const dr = Math.max(2, Math.round(Math.max(w, h) / 160));
  const thick = morph(edges, w, h, dr, true);
  const filled = fillHoles(thick, w, h);
  masks.push(morph(filled, w, h, dr, false));

  return masks;
}

// ---------------------------------------------------------------------------
// Sub-pixel refinement at full resolution
// ---------------------------------------------------------------------------

/**
 * The coarse quad comes from a downscaled mask, so it can be a few pixels off.
 * For each edge we search the strongest luminance step perpendicular to it at
 * full resolution, fit a robust line through those points, and re-intersect
 * neighbouring lines to get accurate corners.
 */
function refineQuad(img: RGBA, quad: Point[], searchRadius: number): Point[] {
  const { width: W, height: H, data } = img;
  const lum = (x: number, y: number) => {
    // bilinear sample of luminance
    const cx = Math.max(0, Math.min(W - 1.001, x));
    const cy = Math.max(0, Math.min(H - 1.001, y));
    const x0 = Math.floor(cx), y0 = Math.floor(cy);
    const fx = cx - x0, fy = cy - y0;
    const g = (xx: number, yy: number) => {
      const i = (yy * W + xx) * 4;
      return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    };
    return (
      g(x0, y0) * (1 - fx) * (1 - fy) + g(x0 + 1, y0) * fx * (1 - fy) +
      g(x0, y0 + 1) * (1 - fx) * fy + g(x0 + 1, y0 + 1) * fx * fy
    );
  };

  // centroid, to know which side of each edge is "inside"
  const cxm = quad.reduce((s, p) => s + p.x, 0) / 4;
  const cym = quad.reduce((s, p) => s + p.y, 0) / 4;

  type Line = { px: number; py: number; dx: number; dy: number };
  const lines: (Line | null)[] = [];

  for (let e = 0; e < 4; e++) {
    const a = quad[e], b = quad[(e + 1) % 4];
    const ex = b.x - a.x, ey = b.y - a.y;
    const elen = Math.hypot(ex, ey);
    if (elen < 20) { lines.push(null); continue; }
    const tx = ex / elen, ty = ey / elen;
    let nx = -ty, ny = tx;
    // make the normal point outwards
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    if ((mx - cxm) * nx + (my - cym) * ny < 0) { nx = -nx; ny = -ny; }

    const samples = Math.max(24, Math.min(80, Math.round(elen / 12)));
    const pts: { x: number; y: number; g: number }[] = [];
    for (let s = 0; s < samples; s++) {
      const t = 0.1 + (0.8 * s) / (samples - 1);
      const bx = a.x + ex * t, by = a.y + ey * t;
      let bestG = 0, bestO = 0;
      for (let o = -searchRadius; o <= searchRadius; o += 0.5) {
        // average 3 taps along the tangent to suppress texture noise
        let inside = 0, outside = 0;
        for (let k = -1; k <= 1; k++) {
          const sx = bx + tx * k * 2, sy = by + ty * k * 2;
          inside += lum(sx + nx * (o - 2), sy + ny * (o - 2));
          outside += lum(sx + nx * (o + 2), sy + ny * (o + 2));
        }
        const g = (outside - inside) / 3; // signed outward step
        if (Math.abs(g) > Math.abs(bestG)) { bestG = g; bestO = o; }
      }
      if (Math.abs(bestG) >= 8) pts.push({ x: bx + nx * bestO, y: by + ny * bestO, g: bestG });
    }
    if (pts.length < samples * 0.4) { lines.push(null); continue; }

    // keep the dominant polarity (paper-brighter or paper-darker than the surroundings)
    const pos = pts.filter(p => p.g > 0).length;
    const keep = pts.filter(p => (pos >= pts.length / 2 ? p.g > 0 : p.g < 0));
    if (keep.length < samples * 0.35) { lines.push(null); continue; }

    // robust total-least-squares line fit
    let cur = keep;
    let fit: Line | null = null;
    for (let iter = 0; iter < 4 && cur.length >= 6; iter++) {
      const mxp = cur.reduce((s, p) => s + p.x, 0) / cur.length;
      const myp = cur.reduce((s, p) => s + p.y, 0) / cur.length;
      let sxx = 0, sxy = 0, syy = 0;
      for (const p of cur) {
        sxx += (p.x - mxp) ** 2;
        sxy += (p.x - mxp) * (p.y - myp);
        syy += (p.y - myp) ** 2;
      }
      const ang = 0.5 * Math.atan2(2 * sxy, sxx - syy);
      fit = { px: mxp, py: myp, dx: Math.cos(ang), dy: Math.sin(ang) };
      const resid = keep.map(p => Math.abs((p.x - mxp) * -fit!.dy + (p.y - myp) * fit!.dx));
      const sorted = resid.slice().sort((x, y) => x - y);
      const thr = Math.max(1.2, sorted[Math.floor(sorted.length * 0.6)] * 2.2);
      const next = keep.filter((_, i) => resid[i] <= thr);
      if (next.length === cur.length) break;
      cur = next;
    }
    // reject a fit that wandered far from the coarse edge or turned a lot
    if (fit) {
      const along = fit.dx * tx + fit.dy * ty;
      if (Math.abs(along) < Math.cos((8 * Math.PI) / 180)) fit = null;
      else {
        const off = Math.abs((mx - fit.px) * -fit.dy + (my - fit.py) * fit.dx);
        if (off > searchRadius * 1.1) fit = null;
      }
    }
    lines.push(fit);
  }

  const out: Point[] = [];
  for (let i = 0; i < 4; i++) {
    const l1 = lines[(i + 3) % 4], l2 = lines[i];
    let p: Point | null = null;
    if (l1 && l2) {
      p = lineIntersect(
        { x: l1.px, y: l1.py }, { x: l1.px + l1.dx, y: l1.py + l1.dy },
        { x: l2.px, y: l2.py }, { x: l2.px + l2.dx, y: l2.py + l2.dy },
      );
    }
    // only accept a refined corner that stays close to the coarse one
    if (p && Math.hypot(p.x - quad[i].x, p.y - quad[i].y) <= searchRadius * 2.2) out.push(p);
    else out.push(quad[i]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Public: detect
// ---------------------------------------------------------------------------

function insetRect(w: number, h: number): Point[] {
  return [
    { x: Math.round(w * 0.05), y: Math.round(h * 0.05) },
    { x: Math.round(w * 0.95), y: Math.round(h * 0.05) },
    { x: Math.round(w * 0.95), y: Math.round(h * 0.95) },
    { x: Math.round(w * 0.05), y: Math.round(h * 0.95) },
  ];
}

export function detectDocumentCorners(img: RGBA): DetectResult {
  const fallback: DetectResult = { corners: insetRect(img.width, img.height), confidence: 0, found: false };
  if (!img.width || !img.height) return fallback;

  const { w, h, scale, rgb } = downscale(img, WORK_SIZE);
  const rgbBlur = rgb.map(ch => boxBlur(ch, w, h, 2, 2));
  const gray = new Float32Array(w * h);
  for (let i = 0; i < gray.length; i++) {
    gray[i] = 0.299 * rgbBlur[0][i] + 0.587 * rgbBlur[1][i] + 0.114 * rgbBlur[2][i];
  }

  const imageArea = w * h;
  const { gx, gy } = sobel(gray, w, h);
  const masks = buildMasks(w, h, gray, rgbBlur, gx, gy);

  let best: { quad: Point[]; score: number } | null = null;

  for (const raw of masks) {
    const mask = cleanMask(raw, w, h);
    const blobs = findBlobs(mask, w, h, imageArea * 0.08, 3);
    for (const blob of blobs) {
      const hull = convexHull(blob.boundary);
      const quad = reduceToQuad(hull);
      if (!quad) continue;

      // clamp to the frame (the sheet may be partly cut off)
      const q = quad.map(p => ({
        x: Math.max(0, Math.min(w - 1, p.x)),
        y: Math.max(0, Math.min(h - 1, p.y)),
      }));
      const ordered = orderCorners(q);

      const quadArea = Math.abs(signedArea(ordered));
      const areaFrac = quadArea / imageArea;
      if (areaFrac < 0.1 || areaFrac > 0.97) continue;

      const fill = Math.min(1, blob.area / quadArea);
      if (fill < 0.72) continue;

      let angleDev = 0;
      let angleOk = true;
      for (let i = 0; i < 4; i++) {
        const a = angleAt(ordered[(i + 3) % 4], ordered[i], ordered[(i + 1) % 4]);
        if (a < 50 || a > 130) angleOk = false;
        angleDev = Math.max(angleDev, Math.abs(a - 90));
      }
      if (!angleOk) continue;

      const len = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
      const top = len(ordered[0], ordered[1]);
      const bottom = len(ordered[3], ordered[2]);
      const left = len(ordered[0], ordered[3]);
      const right = len(ordered[1], ordered[2]);
      const rw = Math.min(top, bottom) / Math.max(top, bottom, 1e-9);
      const rh = Math.min(left, right) / Math.max(left, right, 1e-9);
      if (rw < 0.45 || rh < 0.45) continue;

      const cx = ordered.reduce((s, p) => s + p.x, 0) / 4;
      const cy = ordered.reduce((s, p) => s + p.y, 0) / 4;
      const centering = 1 - 0.25 * (Math.hypot(cx - w / 2, cy - h / 2) / Math.hypot(w / 2, h / 2));

      const angleScore = 1 - Math.min(1, angleDev / 60);
      const parallelScore = 0.6 + 0.4 * Math.min(rw, rh);
      const support = edgeSupport(ordered, gray, w, h);
      const score =
        Math.pow(fill, 3) * Math.pow(areaFrac, 0.3) * angleScore * parallelScore * centering * (0.2 + 0.8 * support);
      if (!best || score > best.score) best = { quad: ordered, score };
    }
  }

  if (!best || best.score < MIN_ACCEPT_SCORE) return fallback;

  const coarse = best.quad.map(p => ({
    x: (p.x + 0.5) / scale - 0.5,
    y: (p.y + 0.5) / scale - 0.5,
  }));
  // search radius: ~6 working pixels expressed in full-resolution pixels
  const refined = scale < 1 ? refineQuad(img, coarse, Math.max(4, Math.ceil(6 / scale))) : refineQuad(img, coarse, 6);

  const corners = refined.map(p => ({
    x: Math.max(0, Math.min(img.width - 1, Math.round(p.x))),
    y: Math.max(0, Math.min(img.height - 1, Math.round(p.y))),
  }));
  return { corners, confidence: Math.min(1, best.score / 0.5), found: true };
}

// ---------------------------------------------------------------------------
// Public: output size + warp
// ---------------------------------------------------------------------------

const STANDARD_RATIOS = [1.41421356, 1.29411765, 1.58603]; // A4, US Letter, ID card (85.6x53.98)

/**
 * Estimate the real width/height ratio of a quad seen in perspective
 * (Zhang & He, "Whiteboard scanning and image enhancement"). Falls back to
 * the plain edge-length ratio when the estimate is not well-conditioned.
 */
export function estimateAspectRatio(corners: Point[], imgW: number, imgH: number): number {
  const [tl, tr, br, bl] = corners;
  const len = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
  const naiveW = (len(tl, tr) + len(bl, br)) / 2;
  const naiveH = (len(tl, bl) + len(tr, br)) / 2;
  const naive = naiveW / Math.max(1e-9, naiveH);

  const u0 = imgW / 2, v0 = imgH / 2;
  const m1 = [tl.x, tl.y, 1], m2 = [tr.x, tr.y, 1], m3 = [bl.x, bl.y, 1], m4 = [br.x, br.y, 1];
  const crs = (a: number[], b: number[]) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  const k2 = dot(crs(m1, m4), m3) / dot(crs(m2, m4), m3);
  const k3 = dot(crs(m1, m4), m2) / dot(crs(m3, m4), m2);
  if (!isFinite(k2) || !isFinite(k3)) return naive;

  const n2 = m2.map((v, i) => k2 * v - m1[i]);
  const n3 = m3.map((v, i) => k3 * v - m1[i]);
  const denom = n2[2] * n3[2];
  if (Math.abs(denom) < 1e-6) return naive; // fronto-parallel: no perspective to correct

  const f2 =
    -(1 / denom) *
    (n2[0] * n3[0] - (n2[0] * n3[2] + n2[2] * n3[0]) * u0 + n2[2] * n3[2] * u0 * u0 +
      (n2[1] * n3[1] - (n2[1] * n3[2] + n2[2] * n3[1]) * v0 + n2[2] * n3[2] * v0 * v0));
  if (!isFinite(f2) || f2 <= 0) return naive;
  const f = Math.sqrt(f2);

  const back = (n: number[]) => {
    const x = (n[0] - u0 * n[2]) / f;
    const y = (n[1] - v0 * n[2]) / f;
    return Math.hypot(x, y, n[2]);
  };
  const ratio = back(n2) / back(n3);
  if (!isFinite(ratio) || ratio <= 0) return naive;

  // never trust the estimate to move more than ±40% from the plain measurement
  return Math.max(naive / 1.4, Math.min(naive * 1.4, ratio));
}

export function computeOutputSize(
  corners: Point[],
  imgW: number,
  imgH: number,
  opts: { snapToStandard?: boolean; maxDim?: number } = {},
): { width: number; height: number; ratio: number } {
  const { snapToStandard = true, maxDim = 2800 } = opts;
  const [tl, tr, br, bl] = corners;
  const len = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
  const naiveW = (len(tl, tr) + len(bl, br)) / 2;
  const naiveH = (len(tl, bl) + len(tr, br)) / 2;

  let ratio = estimateAspectRatio(corners, imgW, imgH);

  if (snapToStandard) {
    for (const s of STANDARD_RATIOS) {
      for (const cand of [s, 1 / s]) {
        if (Math.abs(ratio - cand) / cand < 0.04) ratio = cand;
      }
    }
  }

  const area = Math.max(1, naiveW * naiveH);
  let width = Math.sqrt(area * ratio);
  let height = width / ratio;
  const big = Math.max(width, height);
  if (big > maxDim) {
    const k = maxDim / big;
    width *= k;
    height *= k;
  }
  return { width: Math.max(32, Math.round(width)), height: Math.max(32, Math.round(height)), ratio };
}

/** Solve for the 3x3 homography H (h33 = 1) mapping src[i] -> dst[i]. */
function solveHomography(src: Point[], dst: Point[]): number[] | null {
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i];
    const { x: u, y: v } = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }
  const n = 8;
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    if (Math.abs(A[piv][c]) < 1e-12) return null;
    [A[c], A[piv]] = [A[piv], A[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k];
    }
  }
  const h = A.map((row, i) => row[n] / row[i]);
  h.push(1);
  return h;
}

/**
 * Perspective-correct `corners` ([TL,TR,BR,BL]) of `src` into an outW x outH image.
 * Uses the exact inverse homography and bilinear interpolation.
 */
export function warpPerspective(src: RGBA, corners: Point[], outW: number, outH: number): RGBA | null {
  // The detected outline sits on the paper/background transition, so the outermost
  // output pixels would blend in a hint of background. Map the quad corners one pixel
  // *outside* the output so the first/last row & column sample just inside the paper.
  const pad = 1;
  const dstRect: Point[] = [
    { x: -pad, y: -pad },
    { x: outW - 1 + pad, y: -pad },
    { x: outW - 1 + pad, y: outH - 1 + pad },
    { x: -pad, y: outH - 1 + pad },
  ];
  // map OUTPUT pixels -> SOURCE pixels
  const H = solveHomography(dstRect, corners);
  if (!H) return null;

  const out = new Uint8ClampedArray(outW * outH * 4);
  const sd = src.data;
  const sw = src.width, sh = src.height;

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const wgt = H[6] * x + H[7] * y + 1;
      const sx = (H[0] * x + H[1] * y + H[2]) / wgt;
      const sy = (H[3] * x + H[4] * y + H[5]) / wgt;

      const cx = Math.max(0, Math.min(sw - 1, sx));
      const cy = Math.max(0, Math.min(sh - 1, sy));
      const x0 = Math.floor(cx), y0 = Math.floor(cy);
      const x1 = Math.min(sw - 1, x0 + 1), y1 = Math.min(sh - 1, y0 + 1);
      const fx = cx - x0, fy = cy - y0;

      const i00 = (y0 * sw + x0) * 4;
      const i10 = (y0 * sw + x1) * 4;
      const i01 = (y1 * sw + x0) * 4;
      const i11 = (y1 * sw + x1) * 4;
      const o = (y * outW + x) * 4;
      for (let c = 0; c < 3; c++) {
        const top = sd[i00 + c] * (1 - fx) + sd[i10 + c] * fx;
        const bot = sd[i01 + c] * (1 - fx) + sd[i11 + c] * fx;
        out[o + c] = top * (1 - fy) + bot * fy;
      }
      out[o + 3] = 255;
    }
  }
  return { data: out, width: outW, height: outH };
}
