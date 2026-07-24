import type { ModelFamily } from "./types";

export const deepseekR1: ModelFamily = {
  slug: "deepseek-r1",
  name: "DeepSeek-R1",
  org: "DeepSeek",
  category: "llm",
  releaseDate: "2025-01",
  description:
    "Reasoning-focused MoE model sharing the same architecture as DeepSeek-V3 (MLA + 256 routed experts), trained with cold-start SFT followed by large-scale reinforcement learning for chain-of-thought reasoning.",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2501.12948" },
    { label: "HuggingFace", url: "https://huggingface.co/deepseek-ai/DeepSeek-R1" },
    { label: "GitHub", url: "https://github.com/deepseek-ai/DeepSeek-R1" },
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
        max_seq_len: 131072,
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
