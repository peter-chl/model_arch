import type { ModelFamily } from "./types";

export const deepseekV3: ModelFamily = {
  slug: "deepseek-v3",
  name: "DeepSeek-V3",
  org: "DeepSeek",
  category: "llm",
  releaseDate: "2024-12",
  description:
    "MoE transformer with Multi-head Latent Attention (MLA) for KV compression, 256 routed experts with auxiliary-loss-free load balancing, and FP8 training.",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2412.19437" },
    { label: "HuggingFace", url: "https://huggingface.co/deepseek-ai/DeepSeek-V3" },
    { label: "GitHub", url: "https://github.com/deepseek-ai/DeepSeek-V3" },
  ],
  variants: [
    {
      id: "671b",
      name: "671B",
      totalParams: "671B",
      activeParams: "37B",
      config: {
        vocab_size: 129280,
        hidden_size: 7168,
        num_layers: 61,
        num_attention_heads: 128,
        num_kv_heads: 0,
        head_dim: 128,
        intermediate_size: 18432,
        max_seq_len: 163840,
        norm: "RMSNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE (partial)",
        tie_embeddings: false,
        mla: {
          kv_lora_rank: 512,
          q_lora_rank: 1536,
          qk_nope_head_dim: 128,
          qk_rope_head_dim: 64,
          v_head_dim: 128,
        },
        moe: {
          num_experts: 256,
          shared_experts: 1,
          top_k: 8,
          expert_intermediate_size: 2048,
          first_moe_layer: 3,
        },
      },
    },
  ],
};
