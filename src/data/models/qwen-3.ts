import type { ModelFamily } from "./types";

export const qwen3: ModelFamily = {
  slug: "qwen-3",
  name: "Qwen 3",
  org: "Alibaba",
  description:
    "Third-generation Qwen series with dense and MoE variants. Features thinking/non-thinking mode switching, YaRN-extended RoPE, and 128-expert sparse routing in the MoE variant.",
  links: [
    { label: "HuggingFace", url: "https://huggingface.co/Qwen/Qwen3-235B-A22B" },
    { label: "GitHub", url: "https://github.com/QwenLM/Qwen3" },
    { label: "Blog", url: "https://qwenlm.github.io/blog/qwen3/" },
  ],
  variants: [
    {
      id: "32b",
      name: "32B",
      totalParams: "32.8B",
      config: {
        vocab_size: 151936,
        hidden_size: 5120,
        num_layers: 64,
        num_attention_heads: 64,
        num_kv_heads: 8,
        head_dim: 128,
        intermediate_size: 25600,
        max_seq_len: 131072,
        norm: "RMSNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE + YaRN",
        tie_embeddings: false,
      },
    },
    {
      id: "235b-a22b",
      name: "235B-A22B",
      totalParams: "235B",
      activeParams: "22B",
      config: {
        vocab_size: 151936,
        hidden_size: 4096,
        num_layers: 94,
        num_attention_heads: 64,
        num_kv_heads: 4,
        head_dim: 128,
        intermediate_size: 1536,
        max_seq_len: 131072,
        norm: "RMSNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE + YaRN",
        tie_embeddings: false,
        moe: {
          num_experts: 128,
          shared_experts: 0,
          top_k: 8,
          expert_intermediate_size: 1536,
          first_moe_layer: 0,
        },
      },
    },
  ],
};
