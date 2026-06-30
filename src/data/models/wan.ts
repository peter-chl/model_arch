import type { ModelFamily } from "./types";

const WAN_VAE = {
  vae_latent_channels: 16,
  vae_spatial_compression: 8,
  vae_temporal_compression: 4,
};

const WAN21_TEXT_ENCODER = {
  text_encoder: "uT5-XXL",
  text_embed_dim: 4096,
};

export const wan21: ModelFamily = {
  slug: "wan-2-1",
  name: "Wan 2.1",
  org: "Alibaba / Wan-Video",
  category: "video-gen",
  releaseDate: "2025-01",
  description:
    "Open-source video diffusion model family with separate text-to-video (T2V) and image-to-video (I2V) models. Built on a full-attention DiT backbone with Wan-VAE, a 3D causal VAE providing 4× temporal and 8× spatial compression (256× total). Uses uT5-XXL for multilingual text conditioning. I2V models additionally accept a reference image encoded into the latent sequence.",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2503.20314" },
    { label: "GitHub", url: "https://github.com/Wan-Video/Wan2.1" },
  ],
  variants: [
    {
      id: "t2v-1-3b",
      name: "T2V-1.3B",
      totalParams: "1.3B",
      diffusion: {
        architecture: "DiT (full attention)",
        conditioning: "text",
        guidance: "Flow Matching",
        hidden_size: 1536,
        num_layers: 30,
        num_attention_heads: 12,
        attention_head_dim: 128,
        ffn_size: 8960,
        ...WAN_VAE,
        ...WAN21_TEXT_ENCODER,
        max_resolution: "832×480",
        max_duration: "~4s @ 16fps",
        fps: 16,
      },
    },
    {
      id: "t2v-14b",
      name: "T2V-14B",
      totalParams: "14B",
      diffusion: {
        architecture: "DiT (full attention)",
        conditioning: "text",
        guidance: "Flow Matching",
        hidden_size: 5120,
        num_layers: 40,
        num_attention_heads: 40,
        attention_head_dim: 128,
        ffn_size: 13824,
        ...WAN_VAE,
        ...WAN21_TEXT_ENCODER,
        max_resolution: "1280×720",
        max_duration: "~5s @ 24fps",
        fps: 24,
      },
    },
    {
      id: "i2v-14b-480p",
      name: "I2V-14B-480P",
      totalParams: "14B",
      diffusion: {
        architecture: "DiT (full attention)",
        conditioning: "text + image",
        guidance: "Flow Matching",
        hidden_size: 5120,
        num_layers: 40,
        num_attention_heads: 40,
        attention_head_dim: 128,
        ffn_size: 13824,
        ...WAN_VAE,
        ...WAN21_TEXT_ENCODER,
        max_resolution: "832×480",
        max_duration: "~5s @ 24fps",
        fps: 24,
      },
    },
    {
      id: "i2v-14b-720p",
      name: "I2V-14B-720P",
      totalParams: "14B",
      diffusion: {
        architecture: "DiT (full attention)",
        conditioning: "text + image",
        guidance: "Flow Matching",
        hidden_size: 5120,
        num_layers: 40,
        num_attention_heads: 40,
        attention_head_dim: 128,
        ffn_size: 13824,
        ...WAN_VAE,
        ...WAN21_TEXT_ENCODER,
        max_resolution: "1280×720",
        max_duration: "~5s @ 24fps",
        fps: 24,
      },
    },
  ],
};

export const wan22: ModelFamily = {
  slug: "wan-2-2",
  name: "Wan 2.2",
  org: "Alibaba / Wan-Video",
  category: "video-gen",
  releaseDate: "2025-07",
  description:
    "MoE-based video diffusion model extending Wan 2.1's 14B DiT. Replaces the single denoising network with two expert models: a high-noise expert (early denoising steps, overall layout) and a low-noise expert (late steps, texture and detail). Expert routing is determined by signal-to-noise ratio at each diffusion timestep. Total 27B parameters, 14B active per step — keeping per-step FLOPs equal to a dense 14B model.",
  links: [
    { label: "GitHub", url: "https://github.com/Wan-Video/Wan2.2" },
  ],
  variants: [
    {
      id: "a14b",
      name: "A14B (MoE)",
      totalParams: "27B",
      activeParams: "14B",
      diffusion: {
        architecture: "MoE-DiT (timestep-routed experts)",
        conditioning: "text + image",
        guidance: "Flow Matching",
        hidden_size: 5120,
        num_layers: 40,
        num_attention_heads: 40,
        attention_head_dim: 128,
        ffn_size: 13824,
        num_experts: 2,
        active_experts: 1,
        ...WAN_VAE,
        ...WAN21_TEXT_ENCODER,
        max_resolution: "1280×720",
        max_duration: "5s @ 24fps",
        fps: 24,
      },
    },
  ],
};
