import type { ModelFamily } from "./types";

export const qwen35: ModelFamily = {
  slug: "qwen35",
  name: "Qwen3.5",
  org: "Alibaba",
  releaseDate: "2025-06",
  description:
    "Scaled-up Gated DeltaNet hybrid architecture with 60 layers, 512 experts, and 64 V heads for higher-capacity state representation. Extends vocabulary to 248K tokens and supports 256K context.",
  links: [
    { label: "HuggingFace", url: "https://huggingface.co/Qwen/Qwen3.5-397B-A17B" },
  ],
  variants: [
    {
      id: "397b-a17b",
      name: "397B-A17B",
      totalParams: "397B",
      activeParams: "17B",
      config: {
        vocab_size: 248320,
        hidden_size: 4096,
        num_layers: 60,
        num_attention_heads: 16,
        num_kv_heads: 0,
        head_dim: 128,
        intermediate_size: 1024,
        max_seq_len: 262144,
        norm: "RMSNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE",
        tie_embeddings: false,
        moe: {
          num_experts: 512,
          shared_experts: 1,
          top_k: 10,
          expert_intermediate_size: 1024,
          first_moe_layer: 0,
        },
        deltanet: {
          qk_heads: 16,
          v_heads: 64,
          head_dim: 128,
          softmax_every_n: 4,
          gated_q_heads: 32,
          gated_kv_heads: 2,
          gated_head_dim: 256,
        },
      },
    },
  ],
};
