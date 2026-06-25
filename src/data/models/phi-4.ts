import type { ModelFamily } from "./types";

export const phi4: ModelFamily = {
  slug: "phi-4",
  name: "Phi-4",
  org: "Microsoft",
  releaseDate: "2024-12",
  description:
    "Dense decoder-only transformer trained on a synthetic-data-heavy mix with pivotal token search for DPO alignment.",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2412.08905" },
    { label: "HuggingFace", url: "https://huggingface.co/microsoft/phi-4" },
  ],
  variants: [
    {
      id: "14b",
      name: "14B",
      totalParams: "14.0B",
      config: {
        vocab_size: 100352,
        hidden_size: 5120,
        num_layers: 40,
        num_attention_heads: 40,
        num_kv_heads: 10,
        head_dim: 128,
        intermediate_size: 17920,
        max_seq_len: 16384,
        norm: "LayerNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE",
        tie_embeddings: false,
      },
    },
  ],
};
