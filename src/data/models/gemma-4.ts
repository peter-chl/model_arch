import type { ModelFamily, VisionEncoderConfig } from "./types";

const GEMMA4_VISION_ENCODER: VisionEncoderConfig = {
  type: "Gemma 4 ViT",
  image_size: "dynamic (max 10,240 patches)",
  patch_size: 16,
  hidden_size: 768,
  num_layers: 16,
  num_heads: 12,
  intermediate_size: 3072,
  num_image_tokens: "dynamic (pooled: 9 patches → 1 token)",
};

export const gemma4: ModelFamily = {
  slug: "gemma-4",
  name: "Gemma 4",
  org: "Google",
  category: "vlm",
  releaseDate: "2026-04",
  description:
    "Natively multimodal family sharing a 16-layer ViT (hidden=768, patch_size=16, 3×3 pooling) and a 12-layer audio encoder (hidden=1,024) across all variants. Text backbone uses alternating sliding-window and global attention (every 6th layer is global), proportional RoPE (θ=10K for sliding, θ=1M for global), GeGLU activation, and RMSNorm. Sliding-window head_dim=256; global-attention head_dim=512. Per-Layer Embeddings (PLE) in E2B, E4B, and 26B-A4B add per-layer learned offsets, reducing effective active parameters below total size. The 26B-A4B variant adds MoE routing. Vocabulary: 262,144 tokens.",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2607.02770" },
    { label: "HuggingFace", url: "https://huggingface.co/google/gemma-4-e2b-it" },
  ],
  variants: [
    {
      id: "e2b",
      name: "E2B",
      totalParams: "5.1B",
      activeParams: "~2.3B",
      vision_encoder: GEMMA4_VISION_ENCODER,
      config: {
        vocab_size: 262144,
        hidden_size: 2304,
        num_layers: 35,
        num_attention_heads: 8,
        num_kv_heads: 4,
        head_dim: 256,
        intermediate_size: 9216,
        max_seq_len: 131072,
        norm: "RMSNorm",
        activation: "GeGLU",
        pos_encoding: "RoPE (proportional: θ=10K sliding / θ=1M global)",
        tie_embeddings: true,
      },
    },
    {
      id: "e4b",
      name: "E4B",
      totalParams: "~8B",
      activeParams: "~4.5B",
      vision_encoder: GEMMA4_VISION_ENCODER,
    },
    {
      id: "12b",
      name: "12B",
      totalParams: "~12B",
      vision_encoder: GEMMA4_VISION_ENCODER,
    },
    {
      id: "26b-a4b",
      name: "26B-A4B",
      totalParams: "25.2B",
      activeParams: "~3.8B",
      vision_encoder: GEMMA4_VISION_ENCODER,
    },
    {
      id: "31b",
      name: "31B",
      totalParams: "~31B",
      vision_encoder: GEMMA4_VISION_ENCODER,
    },
  ],
};
