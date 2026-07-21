import type { ModelFamily, PipelineStage } from "./types";

const WAN_VAE = {
  patch_size: 2,
  vae_latent_channels: 16,
  vae_spatial_compression: 8,
  vae_temporal_compression: 4,
};

const WAN21_TEXT_ENCODER = {
  text_encoder: "UMT5-XXL",
  text_embed_dim: 4096,
};

const VAE_ENCODER_STAGE: PipelineStage = {
  name: "3D Causal VAE Encoder",
  role: "frozen",
  dims: "→ [16, T/4, H/8, W/8]",
  note: "4× temporal, 8× spatial compression; frozen during DiT training",
};

const VAE_DECODER_STAGE: PipelineStage = {
  name: "3D Causal VAE Decoder",
  role: "frozen",
  dims: "→ [T, H, W, 3]",
  note: "4× temporal, 8× spatial upsampling; frozen during DiT training",
};

const UT5_STAGE: PipelineStage = {
  name: "UMT5-XXL Text Encoder",
  role: "frozen",
  dims: "→ [S, 4096]",
  note: "UMT5-XXL (~11B params), frozen; supports Chinese + English",
};

function t2vPipelineStages(hidden: number, numBlocks: number, outputNote: string): PipelineStage[] {
  return [
    { name: "Text Prompt", role: "input" },
    UT5_STAGE,
    {
      name: "Text Projection",
      role: "trained",
      dims: `[S, 4096] → [S, ${hidden.toLocaleString()}]`,
      note: "Linear; maps T5 embeddings to DiT hidden dim. Passed as cross-attention context (encoder_hidden_states) into each DiT block — not concatenated with video tokens",
    },
    {
      name: "Gaussian Noise Latent",
      role: "stochastic",
      dims: "[16, T/4, H/8, W/8]",
      note: "Sampled from N(0,I) at t=T; progressively denoised across T→0",
    },
    {
      name: "Patch Embedding",
      role: "trained",
      dims: `→ [N_video, ${hidden.toLocaleString()}]`,
      note: "2×2 spatial patchify in latent space; N_video = T/4 × H/16 × W/16",
    },
    {
      name: "3D RoPE",
      role: "trained",
      dims: "per-axis frequencies for T, H, W",
      note: "Applied inside self-attention only; no learned position parameters",
    },
    {
      name: "Timestep MLP",
      role: "trained",
      dims: `t → [${hidden.toLocaleString()}]`,
      note: "Sinusoidal embedding → Linear → SiLU → Linear; drives AdaLN-Zero in each DiT block",
    },
    {
      name: `DiT × ${numBlocks} (self-attn + text cross-attn)`,
      role: "trained",
      dims: `[N_video, ${hidden.toLocaleString()}]`,
      note: "Each block: (1) self-attention on video tokens with 3D RoPE (attn1), (2) cross-attention where video tokens query text context (attn2), (3) GELU FFN. AdaLN-Zero modulates norms via timestep",
    },
    { name: "Final RMSNorm", role: "trained" },
    {
      name: "Output Projection",
      role: "trained",
      dims: `[N_video, ${hidden.toLocaleString()}] → [16, T/4, H/8, W/8]`,
      note: "Unpatchify; predicts velocity field (flow matching)",
    },
    VAE_DECODER_STAGE,
    { name: "Video Frames", role: "output", dims: outputNote },
  ];
}

function i2vPipelineStages(hidden: number, numBlocks: number, outputNote: string): PipelineStage[] {
  return [
    { name: "Reference Image", role: "input", dims: "[H, W, 3]" },
    { name: "Text Prompt", role: "input" },
    {
      name: "VAE Image Encoder",
      role: "frozen",
      dims: "→ [16, H/8, W/8]",
      note: "Encodes single reference frame to latent; frozen",
    },
    {
      name: "Gaussian Noise Latent",
      role: "stochastic",
      dims: "[16, T/4, H/8, W/8]",
    },
    {
      name: "Tile + Channel Concat",
      role: "merge",
      dims: "→ [32, T/4, H/8, W/8]",
      note: "Image latent tiled across T/4 frames and channel-concatenated with noise latent",
    },
    UT5_STAGE,
    {
      name: "Text Projection",
      role: "trained",
      dims: `[S, 4096] → [S, ${hidden.toLocaleString()}]`,
      note: "Linear; maps T5 embeddings to DiT hidden dim. Passed as cross-attention context into each DiT block",
    },
    {
      name: "Patch Embedding",
      role: "trained",
      dims: `→ [N_video, ${hidden.toLocaleString()}]`,
      note: "2×2 spatial patchify; 32-channel input (2× vs T2V due to channel concat)",
    },
    {
      name: "3D RoPE",
      role: "trained",
      dims: "per-axis frequencies for T, H, W",
      note: "Applied inside self-attention only",
    },
    {
      name: "Timestep MLP",
      role: "trained",
      dims: `t → [${hidden.toLocaleString()}]`,
      note: "Sinusoidal → Linear → SiLU → Linear; drives AdaLN-Zero",
    },
    {
      name: `DiT × ${numBlocks} (self-attn + text cross-attn)`,
      role: "trained",
      dims: `[N_video, ${hidden.toLocaleString()}]`,
      note: "Each block: (1) self-attention on video tokens with 3D RoPE, (2) cross-attention where video tokens query text context, (3) GELU FFN. Image conditioning enters via channel concat at patch embedding, not via attention",
    },
    { name: "Final RMSNorm", role: "trained" },
    {
      name: "Output Projection",
      role: "trained",
      dims: `[N_video, ${hidden.toLocaleString()}] → [16, T/4, H/8, W/8]`,
      note: "Predicts velocity field for 16 denoised channels; image latent channels discarded",
    },
    VAE_DECODER_STAGE,
    { name: "Video Frames", role: "output", dims: outputNote },
  ];
}

export const wan21: ModelFamily = {
  slug: "wan-2-1",
  name: "Wan 2.1",
  org: "Alibaba / Wan-Video",
  category: "video-gen",
  releaseDate: "2025-01",
  description:
    "Open-source video diffusion model family with separate text-to-video (T2V) and image-to-video (I2V) models. Built on a DiT backbone where each block applies self-attention over video tokens (with 3D RoPE) followed by cross-attention to UMT5-XXL text context; both attention operations use QK-Norm (RMS across heads). Uses Wan-VAE, a 3D causal VAE providing 4× temporal and 8× spatial compression (256× total). I2V models condition on a reference image via channel concatenation at the patch embedding stage.",
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
        architecture: "DiT (self-attn + text cross-attn)",
        conditioning: "text",
        guidance: "Flow Matching",
        hidden_size: 1536,
        num_layers: 30,
        num_attention_heads: 12,
        attention_head_dim: 128,
        ffn_size: 8960,
        ffn_activation: "GELU",
        has_cross_attn: true,
        ...WAN_VAE,
        ...WAN21_TEXT_ENCODER,
        max_resolution: "720P (480P / 832×480 recommended)",
        max_duration: "~5s @ 16fps",
        fps: 16,
      },
      pipeline: {
        name: "Text-to-Video",
        stages: t2vPipelineStages(1536, 30, "480P recommended (832×480); 720P capable but less stable"),
      },
    },
    {
      id: "t2v-14b",
      name: "T2V-14B",
      totalParams: "14B",
      diffusion: {
        architecture: "DiT (self-attn + text cross-attn)",
        conditioning: "text",
        guidance: "Flow Matching",
        hidden_size: 5120,
        num_layers: 40,
        num_attention_heads: 40,
        attention_head_dim: 128,
        ffn_size: 13824,
        ffn_activation: "GELU",
        has_cross_attn: true,
        ...WAN_VAE,
        ...WAN21_TEXT_ENCODER,
        max_resolution: "1280×720 (480P and 720P supported)",
        max_duration: "~5s @ 16fps",
        fps: 16,
      },
      pipeline: {
        name: "Text-to-Video",
        stages: t2vPipelineStages(5120, 40, "480P or 720P (1280×720); up to ~5 s @ 16 fps"),
      },
    },
    {
      id: "i2v-14b-480p",
      name: "I2V-14B-480P",
      totalParams: "14B",
      diffusion: {
        architecture: "DiT (self-attn + text cross-attn)",
        conditioning: "text + image",
        guidance: "Flow Matching",
        hidden_size: 5120,
        num_layers: 40,
        num_attention_heads: 40,
        attention_head_dim: 128,
        ffn_size: 13824,
        ffn_activation: "GELU",
        has_cross_attn: true,
        ...WAN_VAE,
        ...WAN21_TEXT_ENCODER,
        max_resolution: "832×480",
        max_duration: "~5s @ 16fps",
        fps: 16,
      },
      pipeline: {
        name: "Image-to-Video",
        stages: i2vPipelineStages(5120, 40, "up to ~5 s @ 16 fps, 832×480"),
      },
    },
    {
      id: "i2v-14b-720p",
      name: "I2V-14B-720P",
      totalParams: "14B",
      diffusion: {
        architecture: "DiT (self-attn + text cross-attn)",
        conditioning: "text + image",
        guidance: "Flow Matching",
        hidden_size: 5120,
        num_layers: 40,
        num_attention_heads: 40,
        attention_head_dim: 128,
        ffn_size: 13824,
        ffn_activation: "GELU",
        has_cross_attn: true,
        ...WAN_VAE,
        ...WAN21_TEXT_ENCODER,
        max_resolution: "1280×720",
        max_duration: "~5s @ 16fps",
        fps: 16,
      },
      pipeline: {
        name: "Image-to-Video",
        stages: i2vPipelineStages(5120, 40, "up to ~5 s @ 16 fps, 1280×720"),
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
        ffn_activation: "GELU",
        has_cross_attn: true,
        num_experts: 2,
        active_experts: 1,
        ...WAN_VAE,
        ...WAN21_TEXT_ENCODER,
        max_resolution: "1280×720",
        max_duration: "5s @ 24fps",
        fps: 24,
      },
      pipeline: {
        name: "Image-to-Video (MoE-DiT)",
        stages: [
          { name: "Reference Image", role: "input", dims: "[H, W, 3]" },
          { name: "Text Prompt", role: "input" },
          {
            name: "VAE Image Encoder",
            role: "frozen",
            dims: "→ [16, H/8, W/8]",
            note: "Single-frame spatial encoding; frozen",
          },
          {
            name: "Gaussian Noise Latent",
            role: "stochastic",
            dims: "[16, T/4, H/8, W/8]",
          },
          {
            name: "Tile + Channel Concat",
            role: "merge",
            dims: "→ [32, T/4, H/8, W/8]",
            note: "Image latent tiled × T/4 frames, channel-concatenated with noise",
          },
          UT5_STAGE,
          {
            name: "Text Projection",
            role: "trained",
            dims: "[S, 4096] → [S, 5120]",
            note: "Maps T5 embeddings to DiT hidden dim; passed as cross-attention context into each block",
          },
          {
            name: "Patch Embedding",
            role: "trained",
            dims: "→ [N_video, 5120]",
            note: "2×2 spatial patchify; 32-channel input",
          },
          {
            name: "3D RoPE",
            role: "trained",
            dims: "per-axis frequencies for T, H, W",
            note: "Applied inside self-attention only",
          },
          {
            name: "Timestep MLP",
            role: "trained",
            dims: "t → [5120]",
            note: "SNR at current timestep also determines which expert activates",
          },
          {
            name: "MoE-DiT × 40 (27B total, 14B active)",
            role: "trained",
            dims: "[N_video, 5120]",
            note: "Each block: self-attention on video tokens with 3D RoPE, cross-attention to text context, MoE GELU FFN. High-SNR timesteps → high-noise expert (layout); low-SNR → low-noise expert (detail)",
          },
          { name: "Final RMSNorm", role: "trained" },
          {
            name: "Output Projection",
            role: "trained",
            dims: "[N_video, 5120] → [16, T/4, H/8, W/8]",
          },
          VAE_DECODER_STAGE,
          { name: "Video Frames", role: "output", dims: "up to 5 s @ 24 fps, 1280×720" },
        ],
      },
    },
  ],
};
