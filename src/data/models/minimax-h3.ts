import type { ModelFamily } from "./types";

export const minimaxH3: ModelFamily = {
  slug: "minimax-h3",
  name: "MiniMax H3",
  org: "MiniMax",
  category: "video-gen",
  releaseDate: "2026-08",
  description:
    "Omni-modal video generation model that processes text, reference images, reference video, and reference audio in a single unified sequence, jointly predicting video and audio latents. A 50-layer dense transformer with 3D RoPE (time, height, width) handles all modalities. H3-VisualVAE compresses video at 16× spatial and 4× temporal into 24 latent channels; H3-AudioVAE encodes 32 kHz audio to a 40 Hz latent stream. Understanding is anchored by a frozen Qwen3-VL-32B encoder. For 2K output the base model regenerates its own low-resolution latents in-context rather than using a separate super-resolution module. Outputs up to 2K video with native stereo audio, clips up to 15 seconds.",
  links: [
    { label: "HuggingFace", url: "https://huggingface.co/MiniMaxAI/MiniMax-H3" },
    { label: "GitHub", url: "https://github.com/MiniMax-AI/MiniMax-H3" },
    { label: "Blog", url: "https://www.minimax.io/blog/minimax-h3" },
  ],
  variants: [
    {
      id: "33b",
      name: "33B",
      totalParams: "33B",
      diffusion: {
        architecture: "Full Attention — single stream (50)",
        conditioning: "text + image/video/audio",
        guidance: "Rectified Flow",
        hidden_size: 5376,
        num_layers: 50,
        num_attention_heads: 56,
        attention_head_dim: 96,
        vae_latent_channels: 24,
        vae_spatial_compression: 16,
        vae_temporal_compression: 4,
        text_encoder: "Qwen3-VL-32B (frozen)",
        text_embed_dim: 5120,
        max_resolution: "1920×1080",
        max_duration: "15s @ 24fps",
        fps: 24,
      },
    },
  ],
};
