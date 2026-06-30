import type { ModelFamily } from "./types";

export const flux1: ModelFamily = {
  slug: "flux-1",
  name: "FLUX.1",
  org: "Black Forest Labs",
  category: "image-gen",
  releaseDate: "2024-08",
  description:
    "12B-parameter image generation model using a Multimodal Diffusion Transformer (MMDiT). Separate double-stream blocks process image and text tokens independently before joining for attention; single-stream blocks then operate on the concatenated sequence. Flow matching with rectified flow replaces DDPM. The VAE applies 8× spatial compression to 16 latent channels; 2×2 token merging halves the sequence further before the DiT — yielding an effective 16× spatial reduction. Two text encoders: CLIP-L for fast semantic alignment, T5-XXL for fine-grained language understanding.",
  links: [
    { label: "GitHub", url: "https://github.com/black-forest-labs/flux" },
  ],
  variants: [
    {
      id: "dev",
      name: "[dev]",
      totalParams: "12B",
      diffusion: {
        architecture: "MMDiT — double stream (19) + single stream (38)",
        conditioning: "text",
        guidance: "Flow Matching (Rectified Flow), guidance-distilled",
        hidden_size: 3072,
        num_layers: 19,
        num_single_layers: 38,
        num_attention_heads: 24,
        attention_head_dim: 128,
        vae_latent_channels: 16,
        vae_spatial_compression: 8,
        text_encoder: "CLIP-L + T5-XXL",
        text_embed_dim: 4096,
        max_resolution: "up to 2048×2048",
      },
    },
    {
      id: "schnell",
      name: "[schnell]",
      totalParams: "12B",
      diffusion: {
        architecture: "MMDiT — double stream (19) + single stream (38)",
        conditioning: "text",
        guidance: "Flow Matching (Rectified Flow), step-distilled (4 steps)",
        hidden_size: 3072,
        num_layers: 19,
        num_single_layers: 38,
        num_attention_heads: 24,
        attention_head_dim: 128,
        vae_latent_channels: 16,
        vae_spatial_compression: 8,
        text_encoder: "CLIP-L + T5-XXL",
        text_embed_dim: 4096,
        max_resolution: "up to 2048×2048",
      },
    },
  ],
};
