import type { ModelFamily } from "./types";

export const mimo: ModelFamily = {
  slug: "mimo",
  name: "MiMo",
  org: "Xiaomi",
  releaseDate: "2025-04",
  description:
    "Compact reasoning-optimized dense transformer with deeper architecture (36 layers) and wider hidden dimension than comparable 7B models. Uses GQA, SwiGLU, and RoPE with 256K context.",
  links: [
    { label: "HuggingFace", url: "https://huggingface.co/XiaomiMiMo/MiMo-7B-RL" },
    { label: "GitHub", url: "https://github.com/XiaomiMiMo/MiMo" },
  ],
  variants: [
    {
      id: "7b",
      name: "7B",
      totalParams: "7.6B",
      config: {
        vocab_size: 151936,
        hidden_size: 4096,
        num_layers: 36,
        num_attention_heads: 32,
        num_kv_heads: 8,
        head_dim: 128,
        intermediate_size: 11008,
        max_seq_len: 262144,
        norm: "RMSNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE",
        tie_embeddings: false,
      },
    },
  ],
};
