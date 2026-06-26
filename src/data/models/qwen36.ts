import type { ModelFamily } from "./types";

export const qwen36: ModelFamily = {
  slug: "qwen36",
  name: "Qwen3.6",
  org: "Alibaba",
  releaseDate: "2026-04",
  description:
    "Compact Gated DeltaNet hybrid MoE model with 256 experts and efficient 35B total / 3B active parameter design. Same 3:1 DeltaNet/Gated Attention pattern with 256K context support.",
  links: [
    { label: "HuggingFace", url: "https://huggingface.co/Qwen/Qwen3.6-35B-A3B" },
  ],
  variants: [
    {
      id: "35b-a3b",
      name: "35B-A3B",
      totalParams: "35B",
      activeParams: "3B",
      config: {
        vocab_size: 248320,
        hidden_size: 2048,
        num_layers: 40,
        num_attention_heads: 16,
        num_kv_heads: 0,
        head_dim: 128,
        intermediate_size: 512,
        max_seq_len: 262144,
        norm: "RMSNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE",
        tie_embeddings: false,
        moe: {
          num_experts: 256,
          shared_experts: 1,
          top_k: 8,
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
