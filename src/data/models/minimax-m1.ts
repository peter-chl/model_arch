import type { ModelFamily } from "./types";

export const minimaxM1: ModelFamily = {
  slug: "minimax-m1",
  name: "MiniMax-M1",
  org: "MiniMax",
  releaseDate: "2025-01",
  description:
    "MoE transformer with hybrid Lightning Attention (linear) and softmax attention — softmax placed every 7 lightning blocks. 32 experts with top-2 routing, supporting 1M+ token context.",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2501.08313" },
    { label: "HuggingFace", url: "https://huggingface.co/MiniMaxAI/MiniMax-M1-80k" },
  ],
  variants: [
    {
      id: "456b",
      name: "456B",
      totalParams: "456B",
      activeParams: "45.9B",
      config: {
        vocab_size: 200064,
        hidden_size: 6144,
        num_layers: 80,
        num_attention_heads: 64,
        num_kv_heads: 8,
        head_dim: 128,
        intermediate_size: 9216,
        max_seq_len: 1048576,
        norm: "RMSNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE",
        tie_embeddings: false,
        moe: {
          num_experts: 32,
          shared_experts: 0,
          top_k: 2,
          expert_intermediate_size: 9216,
          first_moe_layer: 0,
        },
        hybrid_attn: {
          softmax_every_n: 8,
        },
      },
    },
  ],
};
