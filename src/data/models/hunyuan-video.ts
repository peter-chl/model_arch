import type { ModelFamily } from "./types";

export const hunyuanVideo: ModelFamily = {
  slug: "hunyuan-video",
  name: "HunyuanVideo",
  org: "Tencent Hunyuan",
  category: "video-gen",
  releaseDate: "2024-12",
  description:
    "Open-source video generation model using a FLUX-inspired dual-stream (double + single) Transformer architecture applied to 3D video latents. The DiT processes spatial and temporal dimensions together via full 3D attention. A 3D causal VAE compresses video at 4× temporal and 8× spatial — identical compression to Wan-VAE. Text conditioning uses a multimodal LLM (LLaVA-based) for semantic understanding plus CLIP-L for visual alignment.",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2412.03603" },
    { label: "GitHub", url: "https://github.com/Tencent-Hunyuan/HunyuanVideo" },
  ],
  variants: [
    {
      id: "13b",
      name: "13B",
      totalParams: "13B",
      diffusion: {
        architecture: "Full Attention — double stream (20) + single stream (40)",
        conditioning: "text",
        guidance: "Flow Matching",
        hidden_size: 3072,
        num_layers: 20,
        num_single_layers: 40,
        num_attention_heads: 24,
        attention_head_dim: 128,
        patch_size: 2,
        vae_latent_channels: 16,
        vae_spatial_compression: 8,
        vae_temporal_compression: 4,
        text_encoder: "MLLM (LLaVA) + CLIP-L",
        text_embed_dim: 4096,
        max_resolution: "1280×720",
        max_duration: "5s @ 24fps",
        fps: 24,
      },
    },
  ],
};
