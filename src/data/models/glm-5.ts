import type { ModelFamily } from "./types";

export const glm5: ModelFamily = {
  slug: "glm-5",
  name: "GLM-5",
  org: "Zhipu AI",
  releaseDate: "2026-02",
  description:
    "Large-scale MoE model with Multi-head Latent Attention (MLA), DeepSeek Sparse Attention (DSA) with IndexShare, and 256 routed experts. Trained on 28.5T tokens on Huawei Ascend chips, focused on agentic coding and long-horizon planning.",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2602.15763" },
    { label: "HuggingFace", url: "https://huggingface.co/zai-org/GLM-5" },
    { label: "GitHub", url: "https://github.com/THUDM/GLM-5" },
  ],
  variants: [
    {
      id: "744b",
      name: "744B",
      totalParams: "744B",
      activeParams: "40B",
      config: {
        vocab_size: 154880,
        hidden_size: 6144,
        num_layers: 78,
        num_attention_heads: 64,
        num_kv_heads: 0,
        head_dim: 192,
        intermediate_size: 12288,
        max_seq_len: 1048576,
        norm: "RMSNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE (partial)",
        tie_embeddings: false,
        mla: {
          kv_lora_rank: 512,
          q_lora_rank: 2048,
          qk_nope_head_dim: 192,
          qk_rope_head_dim: 64,
          v_head_dim: 256,
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
