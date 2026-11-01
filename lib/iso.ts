/**
 * EverydayNaira isometric art generator.
 *
 * Every cover, hub banner and social image on the site is drawn by this file,
 * so the whole site shares one visual language without stock photos.
 * Each topic has its own composition ("motif"); the post slug seeds small
 * variations so no two covers are identical.
 */
import type { Motif } from "./topics";

type Material = "paper" | "ink" | "lime" | "stone";
type Box = {
  x: number; y: number; z?: number;
  w: number; d: number; h: number;
  m: Material;
  ghost?: boolean;
  label?: string;
};

const PALETTE: Record<Material, { top: string; left: string; right: string }> = {
  paper: { top: "#FFFFFF", left: "#EAE8E1", right: "#D5D2C8" },
  stone: { top: "#E4E2DA", left: "#CFCCC2", right: "#B9B6AB" },
  ink: { top: "#33404A", left: "#222C33", right: "#161E24" },
  lime: { top: "#E2F56A", left: "#D3EC45", right: "#AFC92E" },
};
const STROKE = "#1A2329";

const C = Math.cos(Math.PI / 6);
const proj = (x: number, y: number, z: number): [number, number] => [(x - y) * C, (x + y) * 0.5 - z];

function rng(seedStr: string) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function motifBoxes(motif: Motif | "hero", seed: string): Box[] {
  const r = rng(seed);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const j = (n: number, amt = 0.35) => n + (r() - 0.5) * amt;

  switch (motif) {
    case "budgeting": {
      // Budget splits from the guides (50/30/20, 70/15/15, 60/20/20, 75/10/15), one block per share
      const split = pick([[50, 30, 20], [70, 15, 15], [60, 20, 20], [75, 10, 15]]);
      const accent = Math.floor(r() * 3);
      const gap = j(1.75, 0.2);
      return [
        ...split.map((v, i): Box => ({ x: i * gap, y: 0, w: 1.4, d: 1.4, h: 0.5 + v * 0.055, m: i === accent ? "lime" : i === (accent + 1) % 3 ? "ink" : "paper", label: String(v) })),
        { x: gap * pick([1, 2]), y: 1.9, w: 1.4, d: 1.4, h: j(1.1, 0.5), m: "paper", ghost: true },
      ];
    }
    case "savings": {
      // A staircase that keeps rising, with the next step drawn as a dashed goal
      const n = 3 + Math.floor(r() * 3);
      const alongX = r() > 0.5;
      const step = j(0.85, 0.3);
      const at = (i: number) => (alongX ? { x: -i * 1.3, y: 0, w: 1.15, d: 1.6 } : { x: 0, y: -i * 1.3, w: 1.6, d: 1.15 });
      const inkAt = Math.floor(r() * (n - 1));
      const out: Box[] = [];
      for (let i = 0; i < n; i++) out.push({ ...at(i), h: 0.7 + i * step + r() * 0.2, m: i === n - 1 ? "lime" : i === inkAt ? "ink" : "paper" });
      out.push({ ...at(n), h: out[n - 1].h + step, m: "paper", ghost: true });
      return out;
    }
    case "banking": {
      // A vault block beside stacks of naira notes
      const out: Box[] = [{ x: 0, y: 0, w: 2.2, d: 2.2, h: 2.6, m: "ink" }];
      const stacks = [
        { x: 2.6, y: 0.1, n: 4 + Math.floor(r() * 3) },
        { x: 2.6, y: 1.35, n: 2 + Math.floor(r() * 3) },
        { x: 3.85, y: 0.6, n: 3 + Math.floor(r() * 3) },
      ];
      stacks.forEach((s, si) => {
        for (let k = 0; k < s.n; k++)
          out.push({ x: s.x, y: s.y, z: k * 0.34, w: 1.05, d: 0.95, h: 0.26, m: si === 0 && k === s.n - 1 ? "lime" : k % 2 ? "stone" : "paper" });
      });
      return out;
    }
    case "debt": {
      // Blocks being paid down: solid remainder, dashed outline of what's gone
      const n = 3 + Math.floor(r() * 3);
      const top = j(4.2, 0.8);
      const out: Box[] = [];
      const limeAt = r() > 0.5 ? n - 1 : Math.floor(r() * n);
      for (let i = 0; i < n; i++) {
        const h = top - i * (top - 1.2) / Math.max(1, n - 1);
        const rem = Math.max(0.3, h * (0.35 + r() * 0.5));
        out.push({ x: i * 1.35, y: 0, w: 1.15, d: 1.4, h: rem, m: i === limeAt ? "lime" : i === 0 ? "ink" : "paper" });
        out.push({ x: i * 1.35, y: 0, z: rem, w: 1.15, d: 1.4, h: h - rem, m: "paper", ghost: true });
      }
      return out;
    }
    case "income": {
      // Uneven bars: money that arrives in different amounts each month
      const n = 6;
      const accent = Math.floor(r() * n);
      return Array.from({ length: n }, (_, i): Box => ({
        x: i * 0.95, y: (i % 2) * 0.25, w: 0.75, d: 1.3,
        h: 0.6 + r() * 3,
        m: i === accent ? "lime" : i === (accent + 3) % n ? "ink" : "paper",
      }));
    }
    case "money-safety": {
      // A lime block protected by walls and a dashed safety perimeter
      const wall = j(0.9, 0.5);
      const core: Box = { x: 1.05, y: 1.05, w: 1.5, d: 1.5, h: j(2.2, 0.8), m: "lime" };
      const back = pick<Material>(["ink", "stone"]);
      const front: Material = back === "ink" ? "paper" : "ink";
      return [
        { x: 0, y: 0, w: 3.6, d: 0.45, h: wall, m: back },
        { x: 0, y: 0.45, w: 0.45, d: 3.15, h: wall, m: back },
        core,
        { x: 3.15, y: 0.45, w: 0.45, d: 3.15, h: wall, m: front },
        { x: 0.45, y: 3.15, w: 2.7, d: 0.45, h: wall * pick([1, 0.5]), m: front },
        { x: 0.75, y: 0.75, w: 2.1, d: 2.1, h: core.h + 0.8, m: "paper", ghost: true },
      ];
    }
    case "hero":
    default: {
      // Six topics, one block each — matches the numbered index on the home page
      return [
        { x: 0, y: 0, w: 1.8, d: 1.8, h: 2.6, m: "ink", label: "01" },
        { x: 3.0, y: -2.4, w: 1.4, d: 1.4, h: 1.9, m: "paper", label: "02" },
        { x: 3.3, y: 0.7, w: 1.6, d: 1.6, h: 3.5, m: "lime", label: "03" },
        { x: -0.6, y: 2.2, w: 1.5, d: 1.5, h: 2.0, m: "paper", label: "04" },
        { x: 1.3, y: 1.9, w: 1.7, d: 1.7, h: 2.8, m: "paper", label: "05" },
        { x: 2.3, y: 3.9, w: 1.5, d: 1.5, h: 1.2, m: "paper", ghost: true, label: "06" },
      ];
    }
  }
}

const pts = (a: [number, number][]) => a.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

function drawBox(b: Box, unit: number) {
  const z0 = b.z ?? 0;
  const P = (x: number, y: number, z: number) => proj(x, y, z).map((v) => v * unit) as [number, number];
  const { x, y, w, d, h } = b;
  const top = [P(x, y, z0 + h), P(x + w, y, z0 + h), P(x + w, y + d, z0 + h), P(x, y + d, z0 + h)];
  const right = [P(x + w, y, z0), P(x + w, y + d, z0), P(x + w, y + d, z0 + h), P(x + w, y, z0 + h)];
  const left = [P(x, y + d, z0), P(x + w, y + d, z0), P(x + w, y + d, z0 + h), P(x, y + d, z0 + h)];
  const sw = 1.1;
  if (b.ghost) {
    const dash = `stroke="${STROKE}" stroke-width="${sw}" stroke-dasharray="4 4" fill="none" stroke-linejoin="round"`;
    // Draw all 12 edges dashed, including hidden ones, like an architect's outline
    const bt = [P(x, y, z0), P(x + w, y, z0), P(x + w, y + d, z0), P(x, y + d, z0)];
    const lines = [0, 1, 2, 3].map((i) => `<line x1="${bt[i][0].toFixed(2)}" y1="${bt[i][1].toFixed(2)}" x2="${top[i][0].toFixed(2)}" y2="${top[i][1].toFixed(2)}" ${dash}/>`).join("");
    return `<g><polygon points="${pts(top)}" fill="${PALETTE.lime.top}" fill-opacity="0.18" ${dash.replace('fill="none"', "")}/><polygon points="${pts(bt)}" ${dash}/>${lines}</g>`;
  }
  const c = PALETTE[b.m];
  const s = `stroke="${STROKE}" stroke-width="${sw}" stroke-linejoin="round"`;
  let label = "";
  if (b.label) {
    const [cx, cy] = P(x + w / 2, y + d / 2, z0 + h);
    const fill = b.m === "ink" ? PALETTE.lime.left : STROKE;
    label = `<text transform="matrix(${C.toFixed(3)} 0.5 ${(-C).toFixed(3)} 0.5 ${cx.toFixed(2)} ${cy.toFixed(2)})" font-family="ui-monospace, 'Geist Mono', monospace" font-size="${(unit * 0.32).toFixed(1)}" font-weight="600" fill="${fill}" text-anchor="middle" dominant-baseline="central">${b.label}</text>`;
  }
  return `<g><polygon points="${pts(left)}" fill="${c.left}" ${s}/><polygon points="${pts(right)}" fill="${c.right}" ${s}/><polygon points="${pts(top)}" fill="${c.top}" ${s}/>${label}</g>`;
}

export type IsoOptions = {
  motif: Motif | "hero";
  seed?: string;
  /** Output aspect: width / height */
  aspect?: number;
  background?: string | null;
  grid?: boolean;
  padding?: number;
};

export function isoSvg({ motif, seed = motif, aspect = 16 / 10, background = "#F3F2ED", grid = true, padding = 0.16 }: IsoOptions) {
  const unit = 60;
  const boxes = motifBoxes(motif, seed).sort((a, b) => a.x + a.w / 2 + a.y + a.d / 2 + (a.z ?? 0) * 0.01 - (b.x + b.w / 2 + b.y + b.d / 2 + (b.z ?? 0) * 0.01));

  // bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const b of boxes) {
    const z0 = b.z ?? 0;
    for (const [px, py, pz] of [[b.x, b.y, z0], [b.x + b.w, b.y, z0], [b.x, b.y + b.d, z0], [b.x + b.w, b.y + b.d, z0], [b.x, b.y, z0 + b.h], [b.x + b.w, b.y, z0 + b.h], [b.x, b.y + b.d, z0 + b.h], [b.x + b.w, b.y + b.d, z0 + b.h]]) {
      const [X, Y] = proj(px, py, pz).map((v) => v * unit);
      minX = Math.min(minX, X); maxX = Math.max(maxX, X); minY = Math.min(minY, Y); maxY = Math.max(maxY, Y);
    }
  }
  const cw = maxX - minX, ch = maxY - minY;
  let W = cw / (1 - padding * 2), H = ch / (1 - padding * 2);
  if (W / H > aspect) H = W / aspect; else W = H * aspect;
  const ox = minX - (W - cw) / 2, oy = minY - (H - ch) / 2;

  // dotted floor footprint under the whole group
  let fx0 = Infinity, fy0 = Infinity, fx1 = -Infinity, fy1 = -Infinity;
  for (const b of boxes) { fx0 = Math.min(fx0, b.x); fy0 = Math.min(fy0, b.y); fx1 = Math.max(fx1, b.x + b.w); fy1 = Math.max(fy1, b.y + b.d); }
  const m = 0.45;
  const floor = [proj(fx0 - m, fy0 - m, 0), proj(fx1 + m, fy0 - m, 0), proj(fx1 + m, fy1 + m, 0), proj(fx0 - m, fy1 + m, 0)].map(([a, b2]) => [a * unit, b2 * unit] as [number, number]);

  const gridLines = grid
    ? (() => {
        const step = H / 8;
        let g = "";
        for (let gx = ox - (ox % step); gx < ox + W; gx += step) g += `<line x1="${gx.toFixed(1)}" y1="${oy}" x2="${gx.toFixed(1)}" y2="${oy + H}"/>`;
        for (let gy = oy - (oy % step); gy < oy + H; gy += step) g += `<line x1="${ox}" y1="${gy.toFixed(1)}" x2="${ox + W}" y2="${gy.toFixed(1)}"/>`;
        return `<g stroke="#1A2329" stroke-opacity="0.05" stroke-width="1">${g}</g>`;
      })()
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ox.toFixed(1)} ${oy.toFixed(1)} ${W.toFixed(1)} ${H.toFixed(1)}" preserveAspectRatio="xMidYMid meet" role="img" aria-hidden="true">${
    background ? `<rect x="${ox}" y="${oy}" width="${W}" height="${H}" fill="${background}"/>` : ""
  }${gridLines}<polygon points="${pts(floor)}" fill="none" stroke="${STROKE}" stroke-opacity="0.35" stroke-width="1" stroke-dasharray="1.5 4"/>${boxes.map((b) => drawBox(b, unit)).join("")}</svg>`;
}

export const isoDataUri = (o: IsoOptions) => `data:image/svg+xml;base64,${Buffer.from(isoSvg(o)).toString("base64")}`;
