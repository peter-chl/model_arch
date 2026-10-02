import type { ModelFamily, VLAConfig } from "./types";

// Every field here is identical across the LIBERO and RoboTwin checkpoints —
// in the repo this is literally one shared configs/model/fastwam.yaml, and the
// only thing a task config overrides is which data config it points at.
const SHARED_BACKBONE: Omit<VLAConfig, "embodiment"> = {
  vision_encoder: "Wan2.2 VAE (frozen) — 48 latent channels",
  vlm_backbone:
    "Wan2.2-TI2V-5B video DiT used as a single-pass world encoder — 3072 hidden, 30 layers, 24 heads × 128, FFN 14336, patch 1×2×2; T5 text encoder (4096-dim, 128-token context) frozen",
  vlm_hidden_size: 3072,
  vlm_num_layers: 30,
  action_head:
    "ActionDiT — 1024 hidden, 30 layers, 24 heads × 128, FFN 4096; initialized by linear interpolation of the Wan2.2 DiT weights down to 1024-dim. Reads the world encoder's features via mixture-of-transformers attention and denoises the action chunk by flow matching",
  action_head_type: "flow_matching",
  action_head_hidden_size: 1024,
  action_head_num_layers: 30,
  action_chunk_size: 32,
  training_data:
    "No embodied pretraining — each checkpoint is trained only on its own benchmark's demonstrations",
};

export const fastwam: ModelFamily = {
  slug: "fastwam",
  name: "Fast-WAM",
  org: "Tsinghua AIR / Tianyuan Yuan et al.",
  category: "wam",
  releaseDate: "2026-03",
  description:
    "World Action Model that keeps video co-training but drops future imagination at inference. Where prior WAMs roll out predicted frames and then read actions off them, Fast-WAM repurposes the pretrained Wan2.2-TI2V-5B video diffusion transformer as a single-pass world encoder: one forward pass over the current observation produces features that an ActionDiT denoises into an action chunk by flow matching. Removing the iterative video rollout cuts latency to ~110 ms on an RTX 4090 (~210 ms on an H20), over 4× faster than imagine-then-execute WAMs. The Optional-IDM variant trains both paths at once, so a single checkpoint can switch between imagining the future first and skipping it — on the full 40-task LIBERO benchmark the two modes score 98.55% and 97.75%, which is the paper's evidence that test-time imagination is largely unnecessary. The same architecture serves both LIBERO (single-arm, 7-DoF) and RoboTwin 2.0 (bimanual, 14-DoF) because every embodiment difference is absorbed either by tiling all camera views into one video canvas or by three thin projection tensors.",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2603.16666" },
    { label: "GitHub", url: "https://github.com/yuantianyuan01/FastWAM" },
    { label: "Blog", url: "https://yuantianyuan01.github.io/FastWAM/" },
    { label: "HuggingFace", url: "https://huggingface.co/yuanty/fastwam" },
  ],
  variants: [
    {
      id: "libero",
      name: "LIBERO",
      totalParams: "5B",
      vla: {
        ...SHARED_BACKBONE,
        action_dim: 7,
        proprioception_dim: 8,
        embodiment: {
          benchmark: "LIBERO (Spatial / Object / Goal / Long — 40 tasks)",
          robot: "Franka Panda, single arm",
          cameras: [
            { name: "image (agentview)", raw: "512 × 512", tile: "224 × 224" },
            { name: "wrist_image", raw: "512 × 512", tile: "224 × 224" },
          ],
          canvas: "224 × 448",
          canvas_w: 448,
          canvas_h: 224,
          tiling: "horizontal — the two views sit side by side",
          action_dim: 7,
          action_layout: "delta EEF pose (6) + absolute gripper (1)",
          state_dim: 8,
          state_layout: "EEF pose (6) + gripper (2)",
          normalization: "min/max",
          adapter_tensors: [
            "proprio_encoder: Linear(8 → 4096)",
            "action_encoder: Linear(7 → 1024)",
            "head: Linear(1024 → 7)",
          ],
          adapter_params: "~52K",
          checkpoint: "libero_uncond_2cam224.pt",
          training: "10 epochs, 8 GPUs, lr 1e-4, batch 16",
        },
      },
    },
    {
      id: "robotwin",
      name: "RoboTwin 2.0",
      totalParams: "5B",
      vla: {
        ...SHARED_BACKBONE,
        action_dim: 14,
        proprioception_dim: 14,
        embodiment: {
          benchmark: "RoboTwin 2.0 (50+ bimanual tasks)",
          robot: "Dual-arm bimanual",
          cameras: [
            { name: "cam_high", raw: "480 × 640", tile: "256 × 320" },
            { name: "cam_left_wrist", raw: "480 × 640", tile: "128 × 160" },
            { name: "cam_right_wrist", raw: "480 × 640", tile: "128 × 160" },
          ],
          canvas: "384 × 320",
          canvas_w: 320,
          canvas_h: 384,
          tiling: "overhead view on top, the two wrist views side by side beneath it",
          action_dim: 14,
          action_layout: "7 joints per arm × 2 arms",
          state_dim: 14,
          state_layout: "7 joints per arm × 2 arms",
          normalization: "z-score",
          adapter_tensors: [
            "proprio_encoder: Linear(14 → 4096)",
            "action_encoder: Linear(14 → 1024)",
            "head: Linear(1024 → 14)",
          ],
          adapter_params: "~91K",
          checkpoint: "robotwin_uncond_3cam_384.pt",
          training:
            "5 epochs, 64 GPUs, lr 1e-4, batch 16; 2.5K clean + 25K randomized demos",
        },
      },
    },
  ],
};
