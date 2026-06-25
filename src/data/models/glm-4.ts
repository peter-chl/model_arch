import type { ModelFamily } from "./types";

export const glm4: ModelFamily = {
  slug: "glm-4",
  name: "GLM-4",
  org: "Zhipu AI",
  releaseDate: "2025-04",
  description:
    "Dense decoder-only transformer with deep GQA (2 KV heads), SwiGLU activation, and RMSNorm. Pre-trained on 15T tokens including substantial reasoning-type synthetic data.",
  links: [
    { label: "HuggingFace", url: "https://huggingface.co/THUDM/glm-4-32b-0414" },
    { label: "GitHub", url: "https://github.com/THUDM/GLM-4" },
  ],
  variants: [
    {
      id: "32b",
      name: "32B",
      totalParams: "32B",
      config: {
        vocab_size: 151552,
        hidden_size: 6144,
        num_layers: 61,
        num_attention_heads: 48,
        num_kv_heads: 2,
        head_dim: 128,
        intermediate_size: 23040,
        max_seq_len: 131072,
        norm: "RMSNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE",
        tie_embeddings: false,
      },
    },
  ],
};
