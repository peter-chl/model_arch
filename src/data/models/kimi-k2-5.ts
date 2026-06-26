import type { ModelFamily } from "./types";

export const kimiK25: ModelFamily = {
  slug: "kimi-k2-5",
  name: "Kimi K2.5",
  org: "Moonshot AI",
  releaseDate: "2026-01",
  description:
    "Native multimodal evolution of Kimi K2 with MoonViT-3D vision encoder and Agent Swarm Mode for coordinating up to 100 parallel sub-agents. Same 1T MoE backbone (MLA + 384 experts) with extended 256K context.",
  links: [
    { label: "HuggingFace", url: "https://huggingface.co/moonshotai/Kimi-K2.5" },
    { label: "GitHub", url: "https://github.com/MoonshotAI/Kimi-K2.5" },
  ],
  variants: [
    {
      id: "1t",
      name: "1T",
      totalParams: "1T",
      activeParams: "32B",
      config: {
        vocab_size: 160000,
        hidden_size: 7168,
        num_layers: 61,
        num_attention_heads: 64,
        num_kv_heads: 0,
        head_dim: 128,
        intermediate_size: 18432,
        max_seq_len: 262144,
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
          num_experts: 384,
          shared_experts: 1,
          top_k: 8,
          expert_intermediate_size: 2048,
          first_moe_layer: 1,
        },
      },
    },
  ],
};
