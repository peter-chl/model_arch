import type { ModelFamily } from "./types";

export const qwen3Next: ModelFamily = {
  slug: "qwen3-next",
  name: "Qwen3-Next",
  org: "Alibaba",
  releaseDate: "2025-06",
  description:
    "First Qwen model to adopt Gated DeltaNet hybrid attention, combining linear DeltaNet recurrence layers (3/4 of layers) with softmax Gated Attention layers (1/4) in a 3:1 pattern. Uses massive MoE with 512 experts and 10+1 active routing.",
  links: [
    { label: "HuggingFace", url: "https://huggingface.co/Qwen/Qwen3-Next-80B-A3B" },
    { label: "Blog", url: "https://qwenlm.github.io/blog/qwen3-next/" },
  ],
  variants: [
    {
      id: "80b-a3b",
      name: "80B-A3B",
      totalParams: "80B",
      activeParams: "3B",
      config: {
        vocab_size: 151936,
        hidden_size: 2048,
        num_layers: 48,
        num_attention_heads: 16,
        num_kv_heads: 0,
        head_dim: 128,
        intermediate_size: 512,
        max_seq_len: 65536,
        norm: "RMSNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE",
        tie_embeddings: false,
        moe: {
          num_experts: 512,
          shared_experts: 1,
          top_k: 10,
          expert_intermediate_size: 512,
          first_moe_layer: 0,
        },
        deltanet: {
          qk_heads: 16,
          v_heads: 32,
          head_dim: 128,
          softmax_every_n: 4,
          gated_q_heads: 16,
          gated_kv_heads: 2,
          gated_head_dim: 256,
        },
      },
    },
  ],
};
