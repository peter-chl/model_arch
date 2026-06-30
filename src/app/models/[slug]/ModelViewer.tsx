"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import katex from "katex";
import "katex/dist/katex.min.css";
import type { ModelFamily, ModelConfig, MoEConfig, MLAConfig, HybridAttentionConfig, DeltaNetConfig, ModelLink, VisionEncoderConfig } from "@/data/models";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ComponentType =
  | "rmsnorm"
  | "layernorm"
  | "gqa"
  | "mha"
  | "mla"
  | "lightning"
  | "deltanet"
  | "gated_attn"
  | "swiglu"
  | "geglu"
  | "moe"
  | "embedding"
  | "lm_head"
  | "tied_head";

interface ParamLine {
  label: string;
  formula: string;
  value: number;
}

interface SubLayerInfo {
  name: string;
  component: ComponentType;
  dims: string;
  params: number;
  paramBreakdown: ParamLine[];
}

interface LayerInfo {
  index: number;
  name: string;
  type: "embedding" | "transformer" | "norm" | "head";
  variant?: "dense" | "moe";
  params: number;
  sublayers: SubLayerInfo[];
}

type FormulaBlock = { type: "latex"; content: string } | { type: "text"; content: string };

// ---------------------------------------------------------------------------
// LaTeX renderer
// ---------------------------------------------------------------------------

function Latex({ math, display = true }: { math: string; display?: boolean }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return math;
    }
  }, [math, display]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function FormulaRenderer({ blocks }: { blocks: FormulaBlock[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((block, i) =>
        block.type === "latex" ? (
          <div key={i} className="overflow-x-auto bg-surface rounded p-3 border border-border">
            <Latex math={block.content} />
          </div>
        ) : (
          <p key={i} className="text-xs leading-relaxed text-muted">
            {block.content}
          </p>
        ),
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Operation descriptions with LaTeX formulas
// ---------------------------------------------------------------------------

const operationDetails: Record<
  ComponentType,
  { title: string; operation: string; formula: FormulaBlock[] }
> = {
  rmsnorm: {
    title: "Root Mean Square Layer Normalization",
    operation:
      "Normalizes activations by their root mean square without centering (no mean subtraction). Simpler and faster than LayerNorm — only one learnable vector (γ) instead of two.",
    formula: [
      {
        type: "latex",
        content: String.raw`\text{RMSNorm}(\mathbf{x}) = \frac{\mathbf{x}}{\sqrt{\frac{1}{d}\sum_{i=1}^{d} x_i^2 + \epsilon}} \cdot \boldsymbol{\gamma}`,
      },
      {
        type: "text",
        content: "γ is a learnable scale vector of size [hidden_size]. No bias term, unlike LayerNorm.",
      },
    ],
  },
  layernorm: {
    title: "Layer Normalization",
    operation:
      "Centers and normalizes activations by subtracting the mean and dividing by standard deviation, then applies a learnable affine transform.",
    formula: [
      {
        type: "latex",
        content: String.raw`\text{LayerNorm}(\mathbf{x}) = \frac{\mathbf{x} - \mu}{\sqrt{\sigma^2 + \epsilon}} \cdot \boldsymbol{\gamma} + \boldsymbol{\beta}`,
      },
      {
        type: "latex",
        content: String.raw`\mu = \frac{1}{d}\sum_{i=1}^{d} x_i, \qquad \sigma^2 = \frac{1}{d}\sum_{i=1}^{d}(x_i - \mu)^2`,
      },
      {
        type: "text",
        content: "γ (scale) and β (bias) are learnable vectors of size [hidden_size].",
      },
    ],
  },
  mha: {
    title: "Multi-Head Attention",
    operation:
      "Standard self-attention with independent Q, K, V projections per head. Each head attends over the full sequence independently, then outputs are concatenated and projected.",
    formula: [
      {
        type: "latex",
        content: String.raw`\begin{aligned}
\mathbf{Q} &= \mathbf{x} \cdot W_Q \quad &\in \mathbb{R}^{B \times S \times (h \cdot d_h)} \\
\mathbf{K} &= \mathbf{x} \cdot W_K \quad &\in \mathbb{R}^{B \times S \times (h \cdot d_h)} \\
\mathbf{V} &= \mathbf{x} \cdot W_V \quad &\in \mathbb{R}^{B \times S \times (h \cdot d_h)}
\end{aligned}`,
      },
      {
        type: "latex",
        content: String.raw`\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_h}}\right) V`,
      },
      {
        type: "latex",
        content: String.raw`\text{Output} = \text{Concat}(\text{head}_1, \dots, \text{head}_h) \cdot W_O`,
      },
    ],
  },
  gqa: {
    title: "Grouped-Query Attention",
    operation:
      "A memory-efficient variant of multi-head attention where multiple query heads share the same key-value head. Reduces KV cache size by a factor of num_heads / num_kv_heads while retaining most of MHA's quality.",
    formula: [
      {
        type: "latex",
        content: String.raw`\begin{aligned}
\mathbf{Q} &= \mathbf{x} \cdot W_Q \quad &\in \mathbb{R}^{B \times S \times (h \cdot d_h)} \\
\mathbf{K} &= \mathbf{x} \cdot W_K \quad &\in \mathbb{R}^{B \times S \times (h_{kv} \cdot d_h)} \\
\mathbf{V} &= \mathbf{x} \cdot W_V \quad &\in \mathbb{R}^{B \times S \times (h_{kv} \cdot d_h)}
\end{aligned}`,
      },
      {
        type: "text",
        content:
          "Each KV head is shared across (h / h_kv) query heads, reducing KV cache by that factor.",
      },
      {
        type: "latex",
        content: String.raw`\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_h}}\right) V`,
      },
      {
        type: "latex",
        content: String.raw`\text{Output} = \text{Concat}(\text{all heads}) \cdot W_O`,
      },
    ],
  },
  lightning: {
    title: "Lightning Attention (Linear)",
    operation:
      "A linear attention variant that replaces the softmax with a kernel-based dot product, achieving O(n) complexity instead of O(n²). Splits computation into intra-block (left product with causal mask) and inter-block (right product with recursive KV accumulation) to avoid slow cumulative sums.",
    formula: [
      { type: "text", content: "Intra-block (within each tile, standard masked attention):" },
      {
        type: "latex",
        content: String.raw`\mathbf{O}_{\text{intra}} = \bigl[(\mathbf{Q}\mathbf{K}^\top) \odot \mathbf{M}\bigr] \mathbf{V}, \qquad M_{ts} = \begin{cases}1 & t \geq s \\ 0 & \text{otherwise}\end{cases}`,
      },
      { type: "text", content: "Inter-block (across tiles, linear recurrence — no softmax):" },
      {
        type: "latex",
        content: String.raw`\mathbf{KV}_t = \mathbf{KV}_{t-1} + \mathbf{k}_t \mathbf{v}_t^\top, \qquad \mathbf{o}_t = \mathbf{q}_t^\top \mathbf{KV}_t`,
      },
      {
        type: "text",
        content: "Combined output gives exact causal linear attention with O(n) memory and compute. Periodic softmax attention layers (every N blocks) recalibrate the representation.",
      },
    ],
  },
  deltanet: {
    title: "Gated DeltaNet (Linear Recurrence)",
    operation:
      "Linear attention with a learned decay gate (β) that selectively forgets past state. Maintains a per-head state matrix S that accumulates key-value outer products, enabling O(n) compute and constant memory per step. Uses separate QK and V head counts for independent control over state capacity and output dimensionality.",
    formula: [
      { type: "text", content: "Per-head state update with gated decay:" },
      {
        type: "latex",
        content: String.raw`\mathbf{S}_t = \beta_t \cdot \mathbf{S}_{t-1} + \mathbf{k}_t \mathbf{v}_t^\top, \qquad \beta_t = \sigma(\mathbf{x} \cdot W_\beta)`,
      },
      { type: "text", content: "Output with element-wise gating:" },
      {
        type: "latex",
        content: String.raw`\mathbf{o}_t = (\mathbf{q}_t^\top \mathbf{S}_t) \odot \text{swish}(\mathbf{g}_t), \qquad \mathbf{g}_t = \mathbf{x} \cdot W_g`,
      },
      {
        type: "text",
        content: "S ∈ ℝ^{d_k × d_v} per head. β provides data-dependent forgetting, unlike fixed decay in prior linear attention variants.",
      },
    ],
  },
  gated_attn: {
    title: "Gated Attention (Softmax)",
    operation:
      "Standard softmax attention enhanced with an output gate. Multiple query heads share key-value heads (GQA-style), and the output is element-wise gated before the output projection. Used periodically alongside DeltaNet layers to recalibrate representations with full quadratic attention.",
    formula: [
      {
        type: "latex",
        content: String.raw`\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_h}}\right) V`,
      },
      { type: "text", content: "Output gating:" },
      {
        type: "latex",
        content: String.raw`\text{Output} = \bigl(\text{Attention} \odot \text{swish}(\mathbf{g})\bigr) \cdot W_O, \qquad \mathbf{g} = \mathbf{x} \cdot W_g`,
      },
      {
        type: "text",
        content: "Each KV head is shared across (q_heads / kv_heads) query heads. The output gate provides learnable suppression of attention outputs.",
      },
    ],
  },
  mla: {
    title: "Multi-head Latent Attention",
    operation:
      "Compresses KV representations into a low-rank latent space to drastically reduce KV cache size. Instead of caching full K and V tensors per head, only the small compressed latent c_kv is cached. RoPE is applied to a separate subset of dimensions.",
    formula: [
      { type: "text", content: "KV compression — project to low-rank latent:" },
      {
        type: "latex",
        content: String.raw`[\mathbf{c}_{kv},\; \mathbf{k}_{rope}] = \mathbf{x} \cdot W_{dkv} \quad \in \mathbb{R}^{d_c + d_{rope}}`,
      },
      { type: "text", content: "KV decompression — recover full keys and values from latent:" },
      {
        type: "latex",
        content: String.raw`[\mathbf{K}_{nope},\; \mathbf{V}] = \text{RMSNorm}(\mathbf{c}_{kv}) \cdot W_{ukv} \quad \in \mathbb{R}^{h \times (d_{nope} + d_v)}`,
      },
      { type: "text", content: "Q compression and decompression:" },
      {
        type: "latex",
        content: String.raw`\begin{aligned}
\mathbf{c}_q &= \mathbf{x} \cdot W_{dq} \quad &\in \mathbb{R}^{d_{qr}} \\
[\mathbf{Q}_{nope},\; \mathbf{Q}_{rope}] &= \text{RMSNorm}(\mathbf{c}_q) \cdot W_{uq} \quad &\in \mathbb{R}^{h \times (d_{nope} + d_{rope})}
\end{aligned}`,
      },
      { type: "text", content: "RoPE applied only to the rope dimensions; keys and queries are concatenated:" },
      {
        type: "latex",
        content: String.raw`\mathbf{K} = [\mathbf{K}_{nope} \;;\; \text{RoPE}(\mathbf{k}_{rope})], \quad \mathbf{Q} = [\mathbf{Q}_{nope} \;;\; \text{RoPE}(\mathbf{Q}_{rope})]`,
      },
      {
        type: "text",
        content:
          "KV cache stores only c_kv (rank d_c) instead of full K and V — reducing cache by ~93%.",
      },
    ],
  },
  swiglu: {
    title: "SwiGLU Feed-Forward Network",
    operation:
      "Gated linear unit with SiLU (Swish) activation. The gate and up projections expand to intermediate_size, element-wise multiply after activation, then the down projection compresses back. Uses 3 weight matrices instead of 2.",
    formula: [
      {
        type: "latex",
        content: String.raw`\begin{aligned}
\text{gate} &= \mathbf{x} \cdot W_{\text{gate}} \quad &\in \mathbb{R}^{d \to d_{ff}} \\
\text{up} &= \mathbf{x} \cdot W_{\text{up}} \quad &\in \mathbb{R}^{d \to d_{ff}} \\
\text{out} &= \bigl(\text{SiLU}(\text{gate}) \odot \text{up}\bigr) \cdot W_{\text{down}} \quad &\in \mathbb{R}^{d_{ff} \to d}
\end{aligned}`,
      },
      {
        type: "latex",
        content: String.raw`\text{SiLU}(x) = x \cdot \sigma(x), \qquad \sigma(x) = \frac{1}{1 + e^{-x}}`,
      },
      {
        type: "text",
        content:
          "⊙ is element-wise (Hadamard) multiplication. Uses 3 weight matrices instead of 2, but intermediate_size is typically ⅔ of what a ReLU FFN would use.",
      },
    ],
  },
  geglu: {
    title: "GeGLU Feed-Forward Network",
    operation:
      "Gated linear unit with GELU activation. Same structure as SwiGLU but uses the GELU activation function instead of SiLU/Swish.",
    formula: [
      {
        type: "latex",
        content: String.raw`\begin{aligned}
\text{gate} &= \mathbf{x} \cdot W_{\text{gate}} \quad &\in \mathbb{R}^{d \to d_{ff}} \\
\text{up} &= \mathbf{x} \cdot W_{\text{up}} \quad &\in \mathbb{R}^{d \to d_{ff}} \\
\text{out} &= \bigl(\text{GELU}(\text{gate}) \odot \text{up}\bigr) \cdot W_{\text{down}} \quad &\in \mathbb{R}^{d_{ff} \to d}
\end{aligned}`,
      },
      {
        type: "latex",
        content: String.raw`\text{GELU}(x) \approx 0.5\,x\left(1 + \tanh\!\left(\sqrt{\tfrac{2}{\pi}}\bigl(x + 0.044715\,x^3\bigr)\right)\right)`,
      },
    ],
  },
  moe: {
    title: "Mixture of Experts Feed-Forward Network",
    operation:
      "Replaces the dense FFN with a collection of small expert FFNs. A learned router selects the top-k experts for each token. Only selected experts activate, keeping per-token compute small despite large total parameters.",
    formula: [
      {
        type: "latex",
        content: String.raw`\text{logits} = \mathbf{x} \cdot W_{\text{router}} \quad \in \mathbb{R}^{d \to n_{\text{experts}}}`,
      },
      {
        type: "latex",
        content: String.raw`\{(w_i, e_i)\}_{i=1}^{k} = \text{TopK}\bigl(\text{softmax}(\text{logits}),\; k\bigr)`,
      },
      {
        type: "latex",
        content: String.raw`\text{output} = \sum_{i=1}^{k} w_i \cdot \text{FFN}_{e_i}(\mathbf{x}) \;+\; \text{FFN}_{\text{shared}}(\mathbf{x})`,
      },
      {
        type: "text",
        content:
          "Each expert is a small SwiGLU FFN. Total params = num_experts × per_expert_params, but active params per token = top_k × per_expert_params. Shared experts (if any) are always active.",
      },
    ],
  },
  embedding: {
    title: "Token Embedding",
    operation:
      "Lookup table mapping discrete token IDs to dense vectors. Each row of the embedding matrix is the learned representation for one token in the vocabulary.",
    formula: [
      {
        type: "latex",
        content: String.raw`\mathbf{e} = W_{\text{emb}}[\text{token\_id}], \qquad W_{\text{emb}} \in \mathbb{R}^{V \times d}`,
      },
      {
        type: "text",
        content: "Each forward pass selects one row per input token. V = vocab_size, d = hidden_size.",
      },
    ],
  },
  lm_head: {
    title: "Language Model Output Head",
    operation:
      "Linear projection from the final hidden state to vocabulary-sized logits for next-token prediction.",
    formula: [
      {
        type: "latex",
        content: String.raw`\text{logits} = \mathbf{h} \cdot W_{\text{lm\_head}}^\top \quad \in \mathbb{R}^{d \to V}`,
      },
      {
        type: "latex",
        content: String.raw`p(\text{token}) = \text{softmax}(\text{logits})`,
      },
    ],
  },
  tied_head: {
    title: "Language Model Output Head (Tied)",
    operation:
      "Same projection as a standard output head, but the weight matrix is shared with the token embedding layer. Saves vocab_size × hidden_size parameters.",
    formula: [
      {
        type: "latex",
        content: String.raw`\text{logits} = \mathbf{h} \cdot W_{\text{emb}}^\top \quad \in \mathbb{R}^{d \to V}`,
      },
      {
        type: "text",
        content: "No additional parameters — reuses the embedding matrix W_emb.",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatParams(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function fmul(a: number, b: number): string {
  return `${formatNumber(a)} × ${formatNumber(b)} = ${formatNumber(a * b)}`;
}

// ---------------------------------------------------------------------------
// Layer generation with param breakdowns
// ---------------------------------------------------------------------------

function calcNorm(c: ModelConfig): SubLayerInfo {
  const d = c.hidden_size;
  const isRMS = c.norm === "RMSNorm";
  const component: ComponentType = isRMS ? "rmsnorm" : "layernorm";
  const params = isRMS ? d : d * 2;
  const breakdown: ParamLine[] = isRMS
    ? [{ label: "γ (scale)", formula: `${formatNumber(d)}`, value: d }]
    : [
        { label: "γ (scale)", formula: `${formatNumber(d)}`, value: d },
        { label: "β (bias)", formula: `${formatNumber(d)}`, value: d },
      ];
  return {
    name: `${c.norm}`,
    component,
    dims: `[${d}]`,
    params,
    paramBreakdown: breakdown,
  };
}

function calcGQAAttention(c: ModelConfig): SubLayerInfo {
  const { hidden_size: d, num_attention_heads: h, num_kv_heads: kvh, head_dim: dh } = c;
  const q = d * h * dh;
  const k = d * kvh * dh;
  const v = d * kvh * dh;
  const o = h * dh * d;
  const isGQA = kvh < h;
  return {
    name: isGQA ? `GQA Attention (${h}h, ${kvh}kv)` : `MHA (${h} heads)`,
    component: isGQA ? "gqa" : "mha",
    dims: `Q:[${d}→${h * dh}] K:[${d}→${kvh * dh}] V:[${d}→${kvh * dh}] O:[${h * dh}→${d}]`,
    params: q + k + v + o,
    paramBreakdown: [
      { label: "W_q", formula: fmul(d, h * dh), value: q },
      { label: "W_k", formula: fmul(d, kvh * dh), value: k },
      { label: "W_v", formula: fmul(d, kvh * dh), value: v },
      { label: "W_o", formula: fmul(h * dh, d), value: o },
    ],
  };
}

function calcLightningAttention(c: ModelConfig): SubLayerInfo {
  const { hidden_size: d, num_attention_heads: h, num_kv_heads: kvh, head_dim: dh } = c;
  const q = d * h * dh;
  const k = d * kvh * dh;
  const v = d * kvh * dh;
  const o = h * dh * d;
  return {
    name: `Lightning Attention (${h}h, ${kvh}kv, linear)`,
    component: "lightning",
    dims: `Q:[${d}→${h * dh}] K:[${d}→${kvh * dh}] V:[${d}→${kvh * dh}] O:[${h * dh}→${d}]`,
    params: q + k + v + o,
    paramBreakdown: [
      { label: "W_q", formula: fmul(d, h * dh), value: q },
      { label: "W_k", formula: fmul(d, kvh * dh), value: k },
      { label: "W_v", formula: fmul(d, kvh * dh), value: v },
      { label: "W_o", formula: fmul(h * dh, d), value: o },
    ],
  };
}

function calcDeltaNetAttention(c: ModelConfig, dn: DeltaNetConfig): SubLayerInfo {
  const d = c.hidden_size;
  const { qk_heads, v_heads, head_dim: dh } = dn;
  const q = d * qk_heads * dh;
  const k = d * qk_heads * dh;
  const v = d * v_heads * dh;
  const g = d * v_heads * dh;
  const beta = d * qk_heads;
  const o = v_heads * dh * d;
  return {
    name: `Gated DeltaNet (${qk_heads} QK, ${v_heads} V, dim ${dh})`,
    component: "deltanet",
    dims: `Q:[${d}→${qk_heads * dh}] K:[${d}→${qk_heads * dh}] V:[${d}→${v_heads * dh}] G:[${d}→${v_heads * dh}] β:[${d}→${qk_heads}] O:[${v_heads * dh}→${d}]`,
    params: q + k + v + g + beta + o,
    paramBreakdown: [
      { label: "W_q", formula: fmul(d, qk_heads * dh), value: q },
      { label: "W_k", formula: fmul(d, qk_heads * dh), value: k },
      { label: "W_v", formula: fmul(d, v_heads * dh), value: v },
      { label: "W_g (output gate)", formula: fmul(d, v_heads * dh), value: g },
      { label: "W_β (decay gate)", formula: fmul(d, qk_heads), value: beta },
      { label: "W_o", formula: fmul(v_heads * dh, d), value: o },
    ],
  };
}

function calcGatedAttention(c: ModelConfig, dn: DeltaNetConfig): SubLayerInfo {
  const d = c.hidden_size;
  const { gated_q_heads: qh, gated_kv_heads: kvh, gated_head_dim: dh } = dn;
  const q = d * qh * dh;
  const k = d * kvh * dh;
  const v = d * kvh * dh;
  const g = d * qh * dh;
  const o = qh * dh * d;
  return {
    name: `Gated Attention (${qh}q, ${kvh}kv, dim ${dh})`,
    component: "gated_attn",
    dims: `Q:[${d}→${qh * dh}] K:[${d}→${kvh * dh}] V:[${d}→${kvh * dh}] G:[${d}→${qh * dh}] O:[${qh * dh}→${d}]`,
    params: q + k + v + g + o,
    paramBreakdown: [
      { label: "W_q", formula: fmul(d, qh * dh), value: q },
      { label: "W_k", formula: fmul(d, kvh * dh), value: k },
      { label: "W_v", formula: fmul(d, kvh * dh), value: v },
      { label: "W_g (output gate)", formula: fmul(d, qh * dh), value: g },
      { label: "W_o", formula: fmul(qh * dh, d), value: o },
    ],
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
    component: "mla",
    dims: `KV↓:[${d}→${mla.kv_lora_rank}+${mla.qk_rope_head_dim}] KV↑:[${mla.kv_lora_rank}→${h}×${mla.qk_nope_head_dim + mla.v_head_dim}] Q↓:[${d}→${mla.q_lora_rank}] Q↑:[${mla.q_lora_rank}→${h}×${mla.qk_nope_head_dim + mla.qk_rope_head_dim}] O:[${h * mla.v_head_dim}→${d}]`,
    params: kv_a + kv_a_norm + kv_b + q_a + q_a_norm + q_b + o,
    paramBreakdown: [
      { label: "W_dkv (KV compress)", formula: fmul(d, mla.kv_lora_rank + mla.qk_rope_head_dim), value: kv_a },
      { label: "KV RMSNorm γ", formula: `${formatNumber(mla.kv_lora_rank)}`, value: kv_a_norm },
      {
        label: "W_ukv (KV decompress)",
        formula: `${formatNumber(mla.kv_lora_rank)} × ${h} × ${mla.qk_nope_head_dim + mla.v_head_dim} = ${formatNumber(kv_b)}`,
        value: kv_b,
      },
      { label: "W_dq (Q compress)", formula: fmul(d, mla.q_lora_rank), value: q_a },
      { label: "Q RMSNorm γ", formula: `${formatNumber(mla.q_lora_rank)}`, value: q_a_norm },
      {
        label: "W_uq (Q decompress)",
        formula: `${formatNumber(mla.q_lora_rank)} × ${h} × ${mla.qk_nope_head_dim + mla.qk_rope_head_dim} = ${formatNumber(q_b)}`,
        value: q_b,
      },
      { label: "W_o (output)", formula: fmul(h * mla.v_head_dim, d), value: o },
    ],
  };
}

function calcDenseFFN(c: ModelConfig): SubLayerInfo {
  const d = c.hidden_size;
  const ffn = c.intermediate_size;
  const gate = d * ffn;
  const up = d * ffn;
  const down = ffn * d;
  const component: ComponentType = c.activation === "GeGLU" ? "geglu" : "swiglu";
  return {
    name: `${c.activation} FFN`,
    component,
    dims: `gate:[${d}→${ffn}] up:[${d}→${ffn}] down:[${ffn}→${d}]`,
    params: gate + up + down,
    paramBreakdown: [
      { label: "W_gate", formula: fmul(d, ffn), value: gate },
      { label: "W_up", formula: fmul(d, ffn), value: up },
      { label: "W_down", formula: fmul(ffn, d), value: down },
    ],
  };
}

function calcMoEFFN(c: ModelConfig, moe: MoEConfig): SubLayerInfo {
  const d = c.hidden_size;
  const eff = moe.expert_intermediate_size;
  const perExpert = 3 * d * eff;
  const router = d * moe.num_experts;
  const routed = moe.num_experts * perExpert;
  const shared = moe.shared_experts * perExpert;

  const breakdown: ParamLine[] = [
    { label: "W_router", formula: fmul(d, moe.num_experts), value: router },
    {
      label: `Per expert (×${moe.num_experts})`,
      formula: `3 × ${fmul(d, eff)} = ${formatNumber(perExpert)} each`,
      value: routed,
    },
  ];
  if (moe.shared_experts > 0) {
    breakdown.push({
      label: `Shared expert (×${moe.shared_experts})`,
      formula: `3 × ${fmul(d, eff)} = ${formatNumber(perExpert)} each`,
      value: shared,
    });
  }
  breakdown.push({
    label: "Active per token",
    formula: `router + ${moe.top_k} experts + ${moe.shared_experts} shared = ${formatNumber(router + moe.top_k * perExpert + shared)}`,
    value: router + moe.top_k * perExpert + shared,
  });

  return {
    name: `MoE FFN (${moe.num_experts} experts, top-${moe.top_k}${moe.shared_experts ? `, ${moe.shared_experts} shared` : ""})`,
    component: "moe",
    dims: `router:[${d}→${moe.num_experts}] per expert: gate/up/down [${d}↔${eff}]${moe.shared_experts ? ` shared: [${d}↔${eff}]` : ""}`,
    params: router + routed + shared,
    paramBreakdown: breakdown,
  };
}

function generateLayers(c: ModelConfig): LayerInfo[] {
  const layers: LayerInfo[] = [];
  let idx = 0;

  const embParams = c.vocab_size * c.hidden_size;
  layers.push({
    index: idx++,
    name: "Token Embedding",
    type: "embedding",
    params: embParams,
    sublayers: [
      {
        name: "Embedding matrix",
        component: "embedding",
        dims: `[${formatNumber(c.vocab_size)} × ${c.hidden_size}]`,
        params: embParams,
        paramBreakdown: [
          { label: "W_emb", formula: fmul(c.vocab_size, c.hidden_size), value: embParams },
        ],
      },
    ],
  });

  const norm = calcNorm(c);

  for (let i = 0; i < c.num_layers; i++) {
    const pastFirst = c.moe && i >= c.moe.first_moe_layer;
    const matchesInterleave = !c.moe?.interleave_step || (i - (c.moe?.first_moe_layer ?? 0)) % c.moe.interleave_step === 0;
    const isMoE = pastFirst && matchesInterleave;
    let attn: SubLayerInfo;
    let attnLabel = "";
    if (c.deltanet) {
      const isGatedAttnLayer = (i + 1) % c.deltanet.softmax_every_n === 0;
      if (isGatedAttnLayer) {
        attn = calcGatedAttention(c, c.deltanet);
        attnLabel = " [gated-attn]";
      } else {
        attn = calcDeltaNetAttention(c, c.deltanet);
        attnLabel = " [deltanet]";
      }
    } else if (c.mla) {
      attn = calcMLAAttention(c, c.mla);
    } else if (c.hybrid_attn) {
      const isSoftmaxLayer = (i + 1) % c.hybrid_attn.softmax_every_n === 0;
      attn = isSoftmaxLayer ? calcGQAAttention(c) : calcLightningAttention(c);
      attnLabel = isSoftmaxLayer ? " [softmax]" : " [lightning]";
    } else {
      attn = calcGQAAttention(c);
    }
    const ffn = isMoE ? calcMoEFFN(c, c.moe!) : calcDenseFFN(c);
    layers.push({
      index: idx++,
      name: `Layer ${i}${attnLabel}`,
      type: "transformer",
      variant: isMoE ? "moe" : "dense",
      params: attn.params + ffn.params + norm.params * 2,
      sublayers: [
        { ...norm, name: `${c.norm} (pre-attn)` },
        attn,
        { ...norm, name: `${c.norm} (pre-FFN)` },
        ffn,
      ],
    });
  }

  layers.push({
    index: idx++,
    name: `Final ${c.norm}`,
    type: "norm",
    params: norm.params,
    sublayers: [norm],
  });

  const headParams = c.tie_embeddings ? 0 : c.vocab_size * c.hidden_size;
  const headComponent: ComponentType = c.tie_embeddings ? "tied_head" : "lm_head";
  layers.push({
    index: idx++,
    name: "Output Head (lm_head)",
    type: "head",
    params: headParams,
    sublayers: [
      {
        name: c.tie_embeddings ? "Tied with embedding" : "Linear projection",
        component: headComponent,
        dims: `[${c.hidden_size} → ${formatNumber(c.vocab_size)}]`,
        params: headParams,
        paramBreakdown: c.tie_embeddings
          ? [{ label: "Shared W_emb", formula: "0 (reused)", value: 0 }]
          : [{ label: "W_lm_head", formula: fmul(c.hidden_size, c.vocab_size), value: headParams }],
      },
    ],
  });

  return layers;
}

// ---------------------------------------------------------------------------
// UI Components
// ---------------------------------------------------------------------------

const TYPE_COLORS: Record<string, string> = {
  embedding: "border-l-violet-500",
  transformer: "border-l-blue-500",
  norm: "border-l-zinc-500",
  head: "border-l-violet-500",
};
const MOE_BORDER = "border-l-amber-500";

function SubLayerRow({ sub }: { sub: SubLayerInfo }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const detail = operationDetails[sub.component];

  return (
    <div className="py-1">
      <button onClick={() => setDetailOpen(!detailOpen)} className="w-full text-left group">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground/90 group-hover:text-accent transition-colors flex items-center gap-1.5">
            {sub.name}
            <span className="text-[10px] text-muted/50 group-hover:text-accent/60">
              {detailOpen ? "▾" : "▸"}
            </span>
          </span>
          <span className="font-mono text-xs text-muted">{formatParams(sub.params)}</span>
        </div>
        <span className="font-mono text-xs text-muted/70 break-all block">{sub.dims}</span>
      </button>

      {detailOpen && detail && (
        <div className="mt-2 mb-1 rounded border border-border bg-background p-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-accent mb-1.5">
              {detail.title}
            </h4>
            <p className="text-xs leading-relaxed text-muted">{detail.operation}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted/70 mb-1.5">
              Formula
            </h4>
            <FormulaRenderer blocks={detail.formula} />
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted/70 mb-1.5">
              Parameter Count
            </h4>
            <div className="space-y-1">
              {sub.paramBreakdown.map((line, i) => (
                <div key={i} className="flex items-baseline justify-between gap-4 text-xs">
                  <span className="text-foreground/80 shrink-0">{line.label}</span>
                  <span className="font-mono text-muted/60 text-right truncate flex-1">
                    {line.formula}
                  </span>
                  <span className="font-mono text-foreground font-medium shrink-0">
                    {formatParams(line.value)}
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-1 mt-1 flex items-baseline justify-between text-xs">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-mono font-bold text-accent">{formatParams(sub.params)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
        <div className="border-t border-border bg-background/50 px-4 py-2 space-y-1">
          {layer.sublayers.map((sub, i) => (
            <SubLayerRow key={i} sub={sub} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vision Encoder Panel
// ---------------------------------------------------------------------------

function VisionEncoderPanel({ ve }: { ve: VisionEncoderConfig }) {
  const entries: [string, string][] = [
    ["Image size", typeof ve.image_size === "number" ? `${ve.image_size} px` : ve.image_size],
    ["Patch size", `${ve.patch_size} px`],
    ["Hidden dim", ve.hidden_size.toString()],
    ["Layers", ve.num_layers.toString()],
    ["Attn heads", ve.num_heads.toString()],
    ["FFN dim", ve.intermediate_size.toLocaleString()],
    ["Image tokens", ve.num_image_tokens.toString()],
  ];
  if (ve.temporal_patch_size) entries.push(["Temporal patch", `${ve.temporal_patch_size} frames`]);
  if (ve.spatial_merge_size) entries.push(["Spatial merge", `${ve.spatial_merge_size}×${ve.spatial_merge_size}`]);
  if (ve.norm) entries.push(["Norm", ve.norm]);
  if (ve.window_attn) entries.push(["Window attn", ve.window_attn]);

  return (
    <div className="mb-6 rounded-lg border border-teal-500/20 bg-teal-500/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-teal-400">
          Vision Encoder
        </span>
        <span className="font-mono text-sm font-semibold text-foreground">{ve.type}</span>
        {ve.total_params && (
          <span className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs text-muted">
            {ve.total_params}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {entries.map(([label, value]) => (
          <div key={label} className="rounded border border-border bg-background/50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
            <p className="font-mono text-sm text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function LinkIcon({ type }: { type: string }) {
  const cls = "w-3.5 h-3.5 shrink-0";
  switch (type) {
    case "Paper":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case "GitHub":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      );
    case "HuggingFace":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm3 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM8 13h8a4 4 0 0 1-8 0z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      );
  }
}

export default function ModelViewer({ model }: { model: ModelFamily }) {
  const [variantIdx, setVariantIdx] = useState(0);
  const variant = model.variants[variantIdx];
  const config = variant.config;
  const layers = generateLayers(config);
  const totalParams = layers.reduce((s, l) => s + l.params, 0);

  const configEntries: string[][] = [
    ["Vocab size", formatNumber(config.vocab_size)],
    ["Hidden dim", formatNumber(config.hidden_size)],
    ["Layers", config.num_layers.toString()],
    ...(config.deltanet ? [] : [["Attn heads", config.num_attention_heads.toString()]]),
    ...(config.deltanet ? [] : config.num_kv_heads > 0 ? [["KV heads", config.num_kv_heads.toString()]] : []),
    ...(config.deltanet ? [] : [["Head dim", config.head_dim.toString()]]),
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
    if (config.moe.interleave_step) {
      configEntries.push(["MoE interleave", `every ${config.moe.interleave_step} layers`]);
    }
  }
  if (config.hybrid_attn) {
    configEntries.push(
      ["Attention", `Lightning + Softmax every ${config.hybrid_attn.softmax_every_n} layers`],
    );
  }
  if (config.deltanet) {
    configEntries.push(
      ["DeltaNet QK heads", config.deltanet.qk_heads.toString()],
      ["DeltaNet V heads", config.deltanet.v_heads.toString()],
      ["DeltaNet head dim", config.deltanet.head_dim.toString()],
      ["Gated Attn Q heads", config.deltanet.gated_q_heads.toString()],
      ["Gated Attn KV heads", config.deltanet.gated_kv_heads.toString()],
      ["Gated Attn head dim", config.deltanet.gated_head_dim.toString()],
      ["Attention", `DeltaNet + Gated Attn every ${config.deltanet.softmax_every_n} layers`],
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted transition-colors hover:text-foreground">
              ← Back
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground">{model.name}</h1>
              <p className="text-xs text-muted">{model.org} · {(() => { const [y, m] = model.releaseDate.split("-"); const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return `${months[parseInt(m,10)-1]} ${y}`; })()}</p>
            </div>
          </div>
          {model.variants.length > 1 && (
            <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
              {model.variants.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setVariantIdx(i)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    i === variantIdx ? "bg-accent text-white" : "text-muted hover:text-foreground"
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
        <p className="mb-4 text-sm leading-relaxed text-muted max-w-3xl">{model.description}</p>

        {model.links && model.links.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {model.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:text-accent hover:border-accent/40"
              >
                <LinkIcon type={link.label} />
                {link.label}
                <span className="text-muted/40">&#8599;</span>
              </a>
            ))}
          </div>
        )}

        {variant.vision_encoder && <VisionEncoderPanel ve={variant.vision_encoder} />}

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <p className="text-xs text-muted">Total Parameters</p>
            <p className="text-xl font-bold font-mono text-foreground">{variant.totalParams}</p>
            <p className="text-[10px] font-mono text-muted/60">
              {variant.vision_encoder ? "LM backbone: " : "calculated: "}{formatParams(totalParams)}
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
            <p className="text-xl font-bold font-mono text-foreground">{config.num_layers} layers</p>
          </div>
        </div>

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

        {variant.vision_encoder && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
            Language Backbone — Layer Breakdown
          </p>
        )}
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
          <span className="ml-auto text-muted/60">Click layer → click sublayer for details</span>
        </div>

        <div className="space-y-px rounded-lg border border-border overflow-hidden">
          {layers.map((layer) => (
            <LayerRow
              key={`${variant.id}-${layer.index}`}
              layer={layer}
              defaultExpanded={layer.type === "embedding" || layer.type === "head"}
            />
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <div className="rounded border border-border bg-surface px-4 py-2 text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted">Sum of all layers</p>
            <p className="font-mono text-sm font-bold text-foreground">{formatParams(totalParams)} parameters</p>
          </div>
        </div>
      </div>

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
