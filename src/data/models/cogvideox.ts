import type { ModelFamily } from "./types";

export const cogVideoX: ModelFamily = {
  slug: "cogvideox",
  name: "CogVideoX",
  org: "Zhipu AI / THU",
  category: "video-gen",
  releaseDate: "2024-10",
  description:
    "Open-source video generation model using a 3D full-attention DiT with Expert Adaptive LayerNorm (EAdLN) for per-token video-text alignment. A 3D causal VAE compresses videos at 4× temporal and 8× spatial. Text conditioning uses T5-XXL. The transformer jointly attends over text and video tokens without cross-attention layers, similar to CogView3 but extended to 3D. Available in 2B and 5B parameter scales.",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2408.06072" },
    { label: "GitHub", url: "https://github.com/THUDM/CogVideo" },
  ],
  variants: [
    {
      id: "5b",
      name: "5B",
      totalParams: "5B",
      diffusion: {
        architecture: "3D Full Attention DiT (EAdLN)",
        conditioning: "text",
        guidance: "DDPM + CFG",
        hidden_size: 3072,
        num_layers: 42,
        num_attention_heads: 48,
        attention_head_dim: 64,
        patch_size: 2,
        vae_latent_channels: 16,
        vae_spatial_compression: 8,
        vae_temporal_compression: 4,
        text_encoder: "T5-XXL",
        text_embed_dim: 4096,
        max_resolution: "720×480",
        max_duration: "6s @ 8fps",
        fps: 8,
      },
    },
  ],
};
