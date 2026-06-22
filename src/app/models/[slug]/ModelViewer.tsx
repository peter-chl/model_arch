"use client";

import { useState } from "react";
import Link from "next/link";
import type { ModelFamily, ModelConfig, MoEConfig, MLAConfig } from "@/data/models";

interface SubLayerInfo {
  name: string;
  dims: string;
  params: number;
}

interface LayerInfo {
  index: number;
  name: string;
  type: "embedding" | "transformer" | "norm" | "head";
  variant?: "dense" | "moe";
  params: number;
  sublayers: SubLayerInfo[];
}

function formatParams(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function calcGQAAttention(c: ModelConfig): SubLayerInfo {
  const { hidden_size: d, num_attention_heads: h, num_kv_heads: kvh, head_dim: dh } = c;
  const q = d * h * dh;
  const k = d * kvh * dh;
  const v = d * kvh * dh;
  const o = h * dh * d;
  const label = kvh < h ? `GQA Attention (${h}h, ${kvh}kv)` : `MHA (${h} heads)`;
  return {
    name: label,
    dims: `Q:[${d}→${h * dh}] K:[${d}→${kvh * dh}] V:[${d}→${kvh * dh}] O:[${h * dh}→${d}]`,
    params: q + k + v + o,
  };
}

function calcMLAAttention(c: ModelConfig, mla: MLAConfig): SubLayerInfo {
  const d = c.hidden_size;
  const h = c.num_attention_heads;
  const kv_a = d * (mla.kv_lora_rank + mla.qk_rope_head_dim);
  const kv_a_norm = mla.kv_lora_rank;
  const kv_b = mla.kv_lora_rank * h * (mla.qk_nope_head_dim + mla.v_head_dim);
  const q_a = d * mla.q_lora_rank;
  const q_a_norm = mla.q_lora_rank;
  const q_b = mla.q_lora_rank * h * (mla.qk_nope_head_dim + mla.qk_rope_head_dim);
  const o = h * mla.v_head_dim * d;
  return {
    name: `MLA (${h}h, KV rank ${mla.kv_lora_rank}, Q rank ${mla.q_lora_rank})`,
    dims: `KV↓:[${d}→${mla.kv_lora_rank}+${mla.qk_rope_head_dim}] KV↑:[${mla.kv_lora_rank}→${h}×${mla.qk_nope_head_dim + mla.v_head_dim}] Q↓:[${d}→${mla.q_lora_rank}] Q↑:[${mla.q_lora_rank}→${h}×${mla.qk_nope_head_dim + mla.qk_rope_head_dim}] O:[${h * mla.v_head_dim}→${d}]`,
    params: kv_a + kv_a_norm + kv_b + q_a + q_a_norm + q_b + o,
  };
}

function calcDenseFFN(c: ModelConfig): SubLayerInfo {
  const d = c.hidden_size;
  const ffn = c.intermediate_size;
  const params = 3 * d * ffn;
  return {
    name: `${c.activation} FFN`,
    dims: `gate:[${d}→${ffn}] up:[${d}→${ffn}] down:[${ffn}→${d}]`,
    params,
  };
}

function calcMoEFFN(c: ModelConfig, moe: MoEConfig): SubLayerInfo {
  const d = c.hidden_size;
  const eff = moe.expert_intermediate_size;
  const perExpert = 3 * d * eff;
  const router = d * moe.num_experts;
  const routed = moe.num_experts * perExpert;
  const shared = moe.shared_experts * perExpert;
  return {
    name: `MoE FFN (${moe.num_experts} experts, top-${moe.top_k}${moe.shared_experts ? `, ${moe.shared_experts} shared` : ""})`,
    dims: `router:[${d}→${moe.num_experts}] per expert: gate/up/down [${d}↔${eff}]${moe.shared_experts ? ` shared: [${d}↔${eff}]` : ""}`,
    params: router + routed + shared,
  };
}

function generateLayers(c: ModelConfig): LayerInfo[] {
  const layers: LayerInfo[] = [];
  let idx = 0;

  layers.push({
    index: idx++,
    name: "Token Embedding",
    type: "embedding",
    params: c.vocab_size * c.hidden_size,
    sublayers: [
      {
        name: "Embedding matrix",
        dims: `[${formatNumber(c.vocab_size)} × ${c.hidden_size}]`,
        params: c.vocab_size * c.hidden_size,
      },
    ],
  });

  for (let i = 0; i < c.num_layers; i++) {
    const isMoE = c.moe && i >= c.moe.first_moe_layer;
    const attn = c.mla ? calcMLAAttention(c, c.mla) : calcGQAAttention(c);
    const ffn = isMoE ? calcMoEFFN(c, c.moe!) : calcDenseFFN(c);
    const normParams = c.hidden_size;

    layers.push({
      index: idx++,
      name: `Layer ${i}`,
      type: "transformer",
      variant: isMoE ? "moe" : "dense",
      params: attn.params + ffn.params + normParams * 2,
      sublayers: [
        { name: `${c.norm} (pre-attn)`, dims: `[${c.hidden_size}]`, params: normParams },
        attn,
        { name: `${c.norm} (pre-FFN)`, dims: `[${c.hidden_size}]`, params: normParams },
        ffn,
      ],
    });
  }

  layers.push({
    index: idx++,
    name: `Final ${c.norm}`,
    type: "norm",
    params: c.hidden_size,
    sublayers: [{ name: c.norm, dims: `[${c.hidden_size}]`, params: c.hidden_size }],
  });

  const headParams = c.tie_embeddings ? 0 : c.vocab_size * c.hidden_size;
  layers.push({
    index: idx++,
    name: "Output Head (lm_head)",
    type: "head",
    params: headParams,
    sublayers: [
      {
        name: c.tie_embeddings ? "Tied with embedding" : "Linear projection",
        dims: `[${c.hidden_size} → ${formatNumber(c.vocab_size)}]`,
        params: headParams,
      },
    ],
  });

  return layers;
}

const TYPE_COLORS: Record<string, string> = {
  embedding: "border-l-violet-500",
  transformer: "border-l-blue-500",
  norm: "border-l-zinc-500",
  head: "border-l-violet-500",
};

const MOE_BORDER = "border-l-amber-500";

function LayerRow({ layer, defaultExpanded }: { layer: LayerInfo; defaultExpanded?: boolean }) {
  const [open, setOpen] = useState(defaultExpanded ?? false);
  const borderColor = layer.variant === "moe" ? MOE_BORDER : TYPE_COLORS[layer.type];

  return (
    <div className={`border-l-2 ${borderColor} bg-surface`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5"
      >
        <span className="shrink-0 font-mono text-xs text-muted w-5">{open ? "▾" : "▸"}</span>
        <span className="flex-1 text-sm font-medium text-foreground">{layer.name}</span>
        {layer.variant === "moe" && (
          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
            MoE
          </span>
        )}
        <span className="font-mono text-xs text-muted">{formatParams(layer.params)}</span>
      </button>
      {open && (
        <div className="border-t border-border bg-background/50 px-4 py-2 space-y-2">
          {layer.sublayers.map((sub, i) => (
            <div key={i} className="flex flex-col gap-0.5 py-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/90">{sub.name}</span>
                <span className="font-mono text-xs text-muted">{formatParams(sub.params)}</span>
              </div>
              <span className="font-mono text-xs text-muted/70 break-all">{sub.dims}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ModelViewer({ model }: { model: ModelFamily }) {
  const [variantIdx, setVariantIdx] = useState(0);
  const variant = model.variants[variantIdx];
  const config = variant.config;
  const layers = generateLayers(config);
  const totalParams = layers.reduce((s, l) => s + l.params, 0);

  const configEntries = [
    ["Vocab size", formatNumber(config.vocab_size)],
    ["Hidden dim", formatNumber(config.hidden_size)],
    ["Layers", config.num_layers.toString()],
    ["Attn heads", config.num_attention_heads.toString()],
    ...(config.num_kv_heads > 0 ? [["KV heads", config.num_kv_heads.toString()]] : []),
    ["Head dim", config.head_dim.toString()],
    ["FFN dim", formatNumber(config.intermediate_size)],
    ["Max seq len", formatNumber(config.max_seq_len)],
    ["Norm", config.norm],
    ["Activation", config.activation],
    ["Pos encoding", config.pos_encoding],
    ["Tie embeddings", config.tie_embeddings ? "Yes" : "No"],
  ];

  if (config.mla) {
    configEntries.push(
      ["KV LoRA rank", config.mla.kv_lora_rank.toString()],
      ["Q LoRA rank", config.mla.q_lora_rank.toString()],
    );
  }
  if (config.moe) {
    configEntries.push(
      ["Experts", `${config.moe.num_experts} routed, ${config.moe.shared_experts} shared`],
      ["Top-k routing", config.moe.top_k.toString()],
      ["Expert FFN dim", formatNumber(config.moe.expert_intermediate_size)],
      ["MoE from layer", config.moe.first_moe_layer.toString()],
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              ← Back
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground">{model.name}</h1>
              <p className="text-xs text-muted">{model.org}</p>
            </div>
          </div>
          {/* Variant toggle */}
          {model.variants.length > 1 && (
            <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
              {model.variants.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setVariantIdx(i)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    i === variantIdx
                      ? "bg-accent text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1">
        {/* Description */}
        <p className="mb-6 text-sm leading-relaxed text-muted max-w-3xl">{model.description}</p>

        {/* Params summary */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <p className="text-xs text-muted">Total Parameters</p>
            <p className="text-xl font-bold font-mono text-foreground">{variant.totalParams}</p>
            <p className="text-[10px] font-mono text-muted/60">
              calculated: {formatParams(totalParams)}
            </p>
          </div>
          {variant.activeParams && (
            <div className="rounded-lg border border-border bg-surface px-4 py-3">
              <p className="text-xs text-muted">Active Parameters</p>
              <p className="text-xl font-bold font-mono text-accent">{variant.activeParams}</p>
            </div>
          )}
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <p className="text-xs text-muted">Architecture Depth</p>
            <p className="text-xl font-bold font-mono text-foreground">
              {config.num_layers} layers
            </p>
          </div>
        </div>

        {/* Config grid */}
        <details className="mb-8 group">
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-widest text-muted hover:text-foreground transition-colors">
            Configuration
          </summary>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {configEntries.map(([label, value]) => (
              <div key={label} className="rounded border border-border bg-surface px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
                <p className="font-mono text-sm text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </details>

        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-0.5 rounded bg-violet-500" /> Embedding / Head
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-0.5 rounded bg-blue-500" /> Transformer (dense)
          </span>
          {config.moe && (
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-0.5 rounded bg-amber-500" /> Transformer (MoE)
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-0.5 rounded bg-zinc-500" /> Norm
          </span>
          <span className="ml-auto text-muted/60">Click any layer to expand</span>
        </div>

        {/* Layer stack */}
        <div className="space-y-px rounded-lg border border-border overflow-hidden">
          {layers.map((layer) => (
            <LayerRow
              key={layer.index}
              layer={layer}
              defaultExpanded={layer.type === "embedding" || layer.type === "head"}
            />
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 flex justify-end">
          <div className="rounded border border-border bg-surface px-4 py-2 text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Sum of all layers
            </p>
            <p className="font-mono text-sm font-bold text-foreground">
              {formatParams(totalParams)} parameters
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <p className="text-center text-xs text-muted">
            model_arch — open source reference for AI model architectures
          </p>
        </div>
      </footer>
    </div>
  );
}
