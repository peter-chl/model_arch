import type { ModelFamily } from "./types";

export const qwen25: ModelFamily = {
  slug: "qwen-25",
  name: "Qwen 2.5",
  org: "Alibaba",
  category: "llm",
  releaseDate: "2024-09",
  description:
    "Dense decoder-only transformer with GQA, YaRN-extended RoPE for long context, and SwiGLU activation.",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2412.15115" },
    { label: "HuggingFace", url: "https://huggingface.co/Qwen/Qwen2.5-72B" },
    { label: "GitHub", url: "https://github.com/QwenLM/Qwen2.5" },
    { label: "Blog", url: "https://qwenlm.github.io/blog/qwen2.5/" },
  ],
  variants: [
    {
      id: "7b",
      name: "7B",
      totalParams: "7.62B",
      config: {
        vocab_size: 152064,
        hidden_size: 3584,
        num_layers: 28,
        num_attention_heads: 28,
        num_kv_heads: 4,
        head_dim: 128,
        intermediate_size: 18944,
        max_seq_len: 131072,
        norm: "RMSNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE + YaRN",
        tie_embeddings: false,
      },
    },
    {
      id: "72b",
      name: "72B",
      totalParams: "72.7B",
      config: {
        vocab_size: 152064,
        hidden_size: 8192,
        num_layers: 80,
        num_attention_heads: 64,
        num_kv_heads: 8,
        head_dim: 128,
        intermediate_size: 29568,
        max_seq_len: 131072,
        norm: "RMSNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE + YaRN",
        tie_embeddings: false,
      },
    },
  ],
};
