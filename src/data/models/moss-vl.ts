import type { ModelFamily } from "./types";

export const mossVL: ModelFamily = {
  slug: "moss-vl",
  name: "MOSS-VL",
  org: "OpenMOSS",
  category: "vlm",
  releaseDate: "2026-07",
  description:
    "Open-weight video-language model series built on a unified cross-attention architecture that decouples the vision encoder from the language model: visual tokens never enter the autoregressive sequence but are retrieved via dedicated cross-attention layers, reducing latency for real-time streaming. Uses XRoPE (Cross-Attention Rotary Position Embedding) to map text tokens and video patches into a shared 3D (t, h, w) coordinate space for temporal and spatial grounding. Absolute timestamp tokens anchor each frame, enabling reasoning about pacing and motion at variable frame rates. Language backbone is the Qwen series. Ships three checkpoints: Realtime (continuous video streams), Instruct (offline chat), and Base (pre-training).",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2608.15045" },
    { label: "GitHub", url: "https://github.com/OpenMOSS/MOSS-VL" },
    { label: "HuggingFace", url: "https://huggingface.co/collections/OpenMOSS-Team/moss-vl" },
  ],
  variants: [
    {
      id: "11b",
      name: "11B",
      totalParams: "11B",
    },
  ],
};
