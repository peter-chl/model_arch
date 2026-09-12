import type { ModelFamily } from "./types";

export const pi05: ModelFamily = {
  slug: "pi-0-5",
  name: "π0.5",
  org: "Physical Intelligence",
  category: "vla",
  releaseDate: "2025-04",
  description:
    "Follow-up to π0 replacing flow-matching with FAST (Frequency-domain Action Sequence Tokenization): action chunks are DCT-compressed into discrete tokens and generated autoregressively by the language model. Adds a chain-of-thought reasoning stage before action generation, enabling the model to plan explicitly in language before acting. Backbone remains PaLiGemma (~3B). Trained on a significantly larger and more diverse dataset than π0, with strong generalization to novel household tasks. Architecture is described in the paper; weights are proprietary.",
  links: [
    { label: "Paper", url: "https://arxiv.org/abs/2504.16054" },
    { label: "Blog", url: "https://www.physicalintelligence.company/blog/pi05" },
    { label: "GitHub", url: "https://github.com/Physical-Intelligence/openpi" },
  ],
  variants: [
    {
      id: "base",
      name: "π0.5",
      totalParams: "~3B",
      vla: {
        vision_encoder: "SigLIP ViT-So400m (400M)",
        vlm_backbone: "PaLiGemma (SigLIP ViT + Gemma 2B)",
        vlm_hidden_size: 2048,
        vlm_num_layers: 18,
        action_head: "FAST tokenization — DCT-compressed action chunks decoded autoregressively; chain-of-thought reasoning pre-action",
        action_head_type: "autoregressive",
        action_chunk_size: 50,
        proprioception_dim: 18,
        training_data: "Large-scale household demonstration dataset (significantly larger than π0)",
      },
    },
  ],
};
