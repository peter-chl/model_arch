import type { ModelFamily } from "./types";

export const qwen38max: ModelFamily = {
  slug: "qwen38max",
  name: "Qwen3.8-Max",
  org: "Alibaba",
  category: "llm",
  releaseDate: "2026-08",
  description:
    "Alibaba's largest open-weight model and the first Qwen-Max-class model to be open-sourced. Scales the Qwen3.5 Gated DeltaNet hybrid architecture to 92 layers: 69 linear (Gated DeltaNet) and 23 full softmax attention layers in a 3:1 repeating pattern (softmax_every_n=4). DeltaNet layers use 128 V-heads for higher-capacity recurrent state compared to 64 in Qwen3.5-397B. MoE scales to 512 routed experts (10 active + 1 shared per token). Context: 262K tokens natively, extensible to 1M via YaRN.",
  links: [
    { label: "HuggingFace", url: "https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B" },
    { label: "Blog", url: "https://qwen.ai/blog?id=qwen3.8" },
  ],
  variants: [
    {
      id: "2-4t-a95b",
      name: "2.4T-A95B",
      totalParams: "2.4T",
      activeParams: "95B",
      config: {
        vocab_size: 248320,
        hidden_size: 8192,
        num_layers: 92,
        num_attention_heads: 16,
        num_kv_heads: 0,
        head_dim: 128,
        intermediate_size: 2048,
        max_seq_len: 262144,
        norm: "RMSNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE",
        tie_embeddings: false,
        moe: {
          num_experts: 512,
          shared_experts: 1,
          top_k: 10,
          expert_intermediate_size: 2048,
          first_moe_layer: 0,
        },
        deltanet: {
          qk_heads: 16,
          v_heads: 128,
          head_dim: 128,
          softmax_every_n: 4,
          gated_q_heads: 64,
          gated_kv_heads: 4,
          gated_head_dim: 256,
        },
      },
    },
  ],
};
