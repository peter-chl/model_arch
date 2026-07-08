import type { ModelFamily, VisionEncoderConfig } from "./types";

const MINIMAX_M3_VISION_ENCODER: VisionEncoderConfig = {
  type: "MiniMax M3 ViT",
  image_size: "dynamic",
  patch_size: 14,
  hidden_size: 1280,
  num_layers: 32,
  num_heads: 16,
  intermediate_size: 5120,
  spatial_merge_size: 2,
  temporal_patch_size: 2,
  num_image_tokens: "dynamic (4 patches → 1 token)",
};

export const minimaxM3: ModelFamily = {
  slug: "minimax-m3",
  name: "MiniMax-M3",
  org: "MiniMax",
  category: "vlm",
  releaseDate: "2026-06",
  description:
    "MoE transformer with MiniMax Sparse Attention (MSA): a block-sparse pattern that selects 16 blocks × 128 tokens (2,048 attended tokens per query), replacing the hybrid Lightning attention of M1. All 60 layers use MoE routing with 128 routed experts + 1 shared expert, top-4 selection per token. Partial RoPE applied to 64 of 128 head dimensions. Natively multimodal with image and video input via a 32-layer ViT (hidden=1,280, patch_size=14) with 2×2 spatial merge. Context: 512K tokens.",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2606.13392" },
  ],
  variants: [
    {
      id: "456b-a23b",
      name: "456B-A23B",
      totalParams: "~456B",
      activeParams: "~23B",
      vision_encoder: MINIMAX_M3_VISION_ENCODER,
      config: {
        vocab_size: 200064,
        hidden_size: 6144,
        num_layers: 60,
        num_attention_heads: 64,
        num_kv_heads: 4,
        head_dim: 128,
        intermediate_size: 3072,
        max_seq_len: 524288,
        norm: "RMSNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE (partial, rotary_dim=64)",
        tie_embeddings: false,
        moe: {
          num_experts: 128,
          shared_experts: 1,
          top_k: 4,
          expert_intermediate_size: 3072,
          first_moe_layer: 0,
        },
      },
    },
  ],
};
