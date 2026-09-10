// Build-time OG image generator.
// Renders 1200×630 PNG cards for every model page + one site default.
// Output: public/og/<slug>.png  +  public/og/default.png
//
// Run via: tsx scripts/generate-og.mjs  (tsx handles TS imports)
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { default: satori } = await import("satori");
const { Resvg } = await import("@resvg/resvg-js");

// ── Fonts (from @fontsource packages — no network required) ───────────────────
const fontDir = resolve(__dirname, "../node_modules/@fontsource");
const jbDir = resolve(__dirname, "../node_modules/@fontsource/jetbrains-mono/files");

const fonts = [
  {
    name: "Inter",
    data: readFileSync(`${fontDir}/inter/files/inter-latin-400-normal.woff`).buffer,
    weight: 400,
    style: "normal",
  },
  {
    name: "Inter",
    data: readFileSync(`${fontDir}/inter/files/inter-latin-600-normal.woff`).buffer,
    weight: 600,
    style: "normal",
  },
  {
    name: "JetBrainsMono",
    data: readFileSync(`${jbDir}/jetbrains-mono-latin-700-normal.woff`).buffer,
    weight: 700,
    style: "normal",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function clamp(str, max) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function categoryLabel(cat) {
  switch (cat) {
    case "llm": return "LLM";
    case "vlm": return "Vision LM";
    case "image-gen": return "Image Generation";
    case "video-gen": return "Video Generation";
    default: return cat.toUpperCase();
  }
}

function pickVariant(model) {
  return model.variants[0];
}

function formatContext(maxSeqLen) {
  if (maxSeqLen >= 1000000) return `${Math.round(maxSeqLen / 1000000)}M`;
  if (maxSeqLen >= 1000) return `${Math.round(maxSeqLen / 1024)}K`;
  return String(maxSeqLen);
}

function getStats(model, variant) {
  const c = variant.config;
  const d = variant.diffusion;

  if (d) {
    return [
      { label: "Parameters", value: variant.totalParams, sub: "" },
      { label: "Layers", value: String(d.num_layers), sub: d.architecture.split("—")[0].trim() },
      { label: "Latent Ch.", value: String(d.vae_latent_channels), sub: `${d.vae_spatial_compression}× spatial` },
      { label: "Output", value: d.max_resolution.split("×")[0] + "p", sub: d.max_duration ?? "" },
    ];
  }

  if (c) {
    const paramsSub = variant.activeParams ? `${variant.activeParams} active` : "";
    const layerSub = c.moe ? "all MoE" : "dense";
    const thirdStat = c.moe
      ? { label: "Experts", value: String(c.moe.num_experts), sub: `top-${c.moe.top_k} per token` }
      : { label: "KV Heads", value: String(c.num_kv_heads), sub: "GQA" };
    return [
      { label: "Total Params", value: variant.totalParams, sub: paramsSub },
      { label: "Layers", value: String(c.num_layers), sub: layerSub },
      thirdStat,
      { label: "Context", value: formatContext(c.max_seq_len), sub: "tokens" },
    ];
  }

  return [
    { label: "Parameters", value: variant.totalParams, sub: "" },
    { label: "Variant", value: variant.name, sub: "" },
    { label: "", value: "", sub: "" },
    { label: "", value: "", sub: "" },
  ];
}

// ── Colors ────────────────────────────────────────────────────────────────────
const BG = "#0d1117";
const BLUE = "#58a6ff";
const TEXT = "#e6edf3";
const DIM = "#7d8590";
const BORDER = "#21262d";

// ── Element builders (plain objects, not JSX) ─────────────────────────────────
function statBlock({ label, value, sub }) {
  return {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 28 },
      children: [
        label
          ? {
              type: "div",
              props: {
                style: { fontFamily: "Inter", fontSize: 10, fontWeight: 600, color: "#30363d", letterSpacing: "0.1em", textTransform: "uppercase" },
                children: label,
              },
            }
          : null,
        value
          ? {
              type: "div",
              props: {
                style: { fontFamily: "JetBrainsMono", fontSize: 26, fontWeight: 700, color: TEXT, lineHeight: 1 },
                children: value,
              },
            }
          : null,
        sub
          ? {
              type: "div",
              props: {
                style: { fontFamily: "Inter", fontSize: 10, color: BLUE },
                children: sub,
              },
            }
          : null,
      ].filter(Boolean),
    },
  };
}

function modelCardElement(model, stats) {
  return {
    type: "div",
    props: {
      style: { display: "flex", width: 1200, height: 630, background: BG, position: "relative" },
      children: [
        // Left column
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "56px 56px",
              borderRight: `1px solid ${BORDER}`,
            },
            children: [
              {
                type: "div",
                props: {
                  style: { fontFamily: "JetBrainsMono", fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 28 },
                  children: `model_arch · ${categoryLabel(model.category)}`,
                },
              },
              {
                type: "div",
                props: {
                  style: { fontFamily: "JetBrainsMono", fontSize: 52, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: 16 },
                  children: model.name,
                },
              },
              {
                type: "div",
                props: {
                  style: { fontFamily: "Inter", fontSize: 14, color: DIM, marginBottom: 32 },
                  children: `${model.org} · ${model.releaseDate}`,
                },
              },
              {
                type: "div",
                props: { style: { flex: 1 } },
              },
              {
                type: "div",
                props: {
                  style: { fontFamily: "Inter", fontSize: 13, color: DIM, lineHeight: 1.6 },
                  children: clamp(model.description, 280),
                },
              },
            ],
          },
        },
        // Right column — stats
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              width: 320,
              padding: "64px 48px",
              justifyContent: "center",
            },
            children: stats.map(statBlock),
          },
        },
        // URL watermark
        {
          type: "div",
          props: {
            style: { position: "absolute", bottom: 24, right: 28, fontFamily: "JetBrainsMono", fontSize: 10, color: "#30363d" },
            children: "peter-chl.github.io/model_arch",
          },
        },
      ],
    },
  };
}

function siteDefaultElement(models) {
  const picks = models
    .filter((m) => ["llm", "vlm", "video-gen", "image-gen"].includes(m.category))
    .slice(0, 5);

  return {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column", width: 1200, height: 630, background: BG, padding: "56px 64px", position: "relative" },
      children: [
        {
          type: "div",
          props: {
            style: { fontFamily: "JetBrainsMono", fontSize: 13, fontWeight: 700, color: BLUE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "auto" },
            children: "model_arch",
          },
        },
        {
          type: "div",
          props: {
            style: { fontFamily: "JetBrainsMono", fontSize: 52, fontWeight: 700, color: TEXT, lineHeight: 1.1, letterSpacing: "-0.01em", marginBottom: 20 },
            children: "Open-Weight Model Architectures",
          },
        },
        {
          type: "div",
          props: {
            style: { fontFamily: "Inter", fontSize: 17, color: DIM, marginBottom: 40, lineHeight: 1.5 },
            children: "Layer structures, tensor dimensions, and parameter counts for 35+ open models — in one place.",
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", gap: 12 },
            children: picks.map((m) => {
              const v = m.variants[0];
              return {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    background: "#161b22",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    padding: "12px 18px",
                    gap: 4,
                  },
                  children: [
                    { type: "div", props: { style: { fontFamily: "JetBrainsMono", fontSize: 13, fontWeight: 700, color: TEXT }, children: m.name } },
                    { type: "div", props: { style: { fontFamily: "Inter", fontSize: 11, color: BLUE }, children: m.org } },
                    { type: "div", props: { style: { fontFamily: "Inter", fontSize: 11, color: DIM }, children: v.totalParams + (v.activeParams ? " MoE" : "") } },
                  ],
                },
              };
            }),
          },
        },
        {
          type: "div",
          props: {
            style: { position: "absolute", bottom: 24, right: 28, fontFamily: "JetBrainsMono", fontSize: 10, color: "#30363d" },
            children: "peter-chl.github.io/model_arch",
          },
        },
      ],
    },
  };
}

// ── Render ────────────────────────────────────────────────────────────────────
async function renderPng(element) {
  const svg = await satori(element, { width: 1200, height: 630, fonts });
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  return resvg.render().asPng();
}

function save(outPath, png) {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, png);
  console.log(`  ✓ ${outPath.replace(resolve(__dirname, "..") + "/", "")}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
const outDir = resolve(__dirname, "../public/og");
const { models } = await import("../src/data/models/index.ts");

console.log(`Generating OG images for ${models.length} models…`);

for (const model of models) {
  const variant = pickVariant(model);
  const stats = getStats(model, variant);
  const element = modelCardElement(model, stats);
  const png = await renderPng(element);
  save(`${outDir}/${model.slug}.png`, png);
}

const defaultPng = await renderPng(siteDefaultElement(models));
save(`${outDir}/default.png`, defaultPng);

console.log(`\nDone. ${models.length + 1} images written to public/og/`);
