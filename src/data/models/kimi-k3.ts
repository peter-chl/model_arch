import type { ModelFamily } from "./types";

export const kimiK3: ModelFamily = {
  slug: "kimi-k3",
  name: "Kimi K3",
  org: "Moonshot AI",
  category: "vlm",
  releaseDate: "2026-07",
  description:
    "2.8T MoE model with three architectural advances over K2. Kimi Delta Attention (KDA): extends Gated DeltaNet with finer-grained gating; interleaved with Gated MLA in a 3:1 ratio (three KDA linear-attention layers per one full Gated MLA layer), reducing KV-cache by ~75% for long contexts. Block Attention Residuals (Block AttnRes): each block attends over earlier block-level hidden states, allowing selective depth-wise retrieval of earlier representations (~25% training efficiency gain at <2% extra compute). Stable LatentMoE: 896 routed experts, top-16 active per token, with quantile-based routing that removes the auxiliary loss hyperparameter. Additional changes: SiTU (Sigmoid Tanh Unit) activation, Per-Head Muon optimizer, and MXFP4 weights / MXFP8 activations throughout. Context: 1M tokens. Native multimodal (visual) understanding.",
  links: [
    { label: "Blog", url: "https://www.kimi.com/blog/kimi-k3" },
    { label: "KDA Paper", url: "https://arxiv.org/abs/2510.26692" },
    { label: "AttnRes Paper", url: "https://arxiv.org/abs/2603.15031" },
  ],
  variants: [
    {
      id: "2-8t",
      name: "2.8T",
      totalParams: "2.8T",
      // config omitted — hidden_size, num_layers, num_attention_heads, expert sizes
      // not yet published; open weights and technical report expected July 27 2026
    },
  ],
};
