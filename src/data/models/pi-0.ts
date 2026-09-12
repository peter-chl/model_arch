import type { ModelFamily } from "./types";

export const pi0: ModelFamily = {
  slug: "pi-0",
  name: "π0",
  org: "Physical Intelligence",
  category: "vla",
  releaseDate: "2024-10",
  description:
    "Vision-Language-Action model built on a PaLiGemma backbone (SigLIP ViT + Gemma 2B) with a separate 300M-parameter action expert (Gemma architecture). Uses flow matching to generate continuous action chunks of length H=50, conditioned on language instructions and proprioceptive state. The VLM backbone and action expert process tokens jointly via cross-attention at each transformer layer, allowing bidirectional information flow. Pre-trained on a diverse mix of robot demonstrations across 7 robot platforms and fine-tuned per task. Architecture is MIT-licensed; weights are proprietary.",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2410.24164" },
    { label: "Blog", url: "https://www.physicalintelligence.company/blog/pi0" },
    { label: "GitHub", url: "https://github.com/Physical-Intelligence/openpi" },
  ],
  variants: [
    {
      id: "base",
      name: "π0",
      totalParams: "3.3B",
      vla: {
        vision_encoder: "SigLIP ViT-So400m (400M)",
        vlm_backbone: "PaLiGemma (SigLIP ViT + Gemma 2B)",
        vlm_hidden_size: 2048,
        vlm_num_layers: 18,
        action_head: "Gemma 300M action expert; flow matching over continuous action chunks",
        action_head_type: "flow_matching",
        action_head_hidden_size: 1024,
        action_head_num_layers: 18,
        action_chunk_size: 50,
        proprioception_dim: 18,
        training_data: "~10K hours across 7 robot platforms",
      },
    },
  ],
};
