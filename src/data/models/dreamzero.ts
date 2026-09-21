import type { ModelFamily } from "./types";

export const dreamZero: ModelFamily = {
  slug: "dreamzero",
  name: "DreamZero",
  org: "NVIDIA",
  category: "wam",
  releaseDate: "2026-02",
  description:
    "World Action Model (WAM) built on a pretrained 14B image-to-video diffusion backbone (Wan2.1-I2V-14B-480P). Jointly denoises future video frames and robot actions via flow matching in a single end-to-end model, using video generation as an implicit visual planner that guides motor commands. An autoregressive chunk-wise DiT architecture (H=48 steps at 30Hz) with KV caching allows the model to leverage visual history and replaces predicted frames with ground-truth observations after each execution, eliminating compounding error. System and model optimizations (CFG parallelism, DiT caching, NVFP4 quantization, DreamZero-Flash decoupled noise schedules) achieve a 38× inference speedup, enabling 7Hz real-time closed-loop control on GB200. Outperforms state-of-the-art VLAs by over 2× on zero-shot task generalization. Demonstrates cross-embodiment transfer from human or other-robot video with 10–20 minutes of data. Open-source weights and inference code.",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2602.15922" },
    { label: "GitHub", url: "https://github.com/dreamzero0/dreamzero" },
    { label: "Blog", url: "https://dreamzero0.github.io" },
  ],
  variants: [
    {
      id: "14b",
      name: "DreamZero-14B",
      totalParams: "14B",
      vla: {
        vision_encoder: "Wan2.1-I2V VAE (frozen)",
        vlm_backbone: "Wan2.1-I2V-14B-480P — autoregressive video DiT backbone; frozen text encoder, image encoder, VAE; updated DiT blocks + action encoder/decoder",
        action_head: "Joint video-action flow matching; state encoder + action encoder/decoder; asynchronous closed-loop execution with KV cache; DreamZero-Flash variant uses decoupled Beta(7,1) video noise schedule for single-step inference",
        action_head_type: "flow_matching",
        action_chunk_size: 48,
        training_data: "~500 hours AgiBot G1 teleoperation across 22 environments (homes, restaurants, offices); DROID dataset for Franka variant",
      },
    },
  ],
};
