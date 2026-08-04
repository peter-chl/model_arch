import type { ModelFamily } from "./types";

export const qwen38max: ModelFamily = {
  slug: "qwen38max",
  name: "Qwen3.8-Max",
  org: "Alibaba",
  category: "vlm",
  releaseDate: "2026-08",
  description:
    "Alibaba's largest open-weight model to date and the first Qwen-Max-class model to be open-sourced. Built on the Qwen3.5 Gated DeltaNet hybrid architecture (3:1 linear-to-softmax attention ratio), scaled to 2.4T total parameters with 95B active per token. The first Qwen model above 1T parameters to support multiple modalities: processes text, images, and video jointly. Extends context to 1M tokens. Announced at WAIC Shanghai on July 19, 2026; API released August 3, 2026; open weights to follow.",
  links: [
    { label: "Blog", url: "https://qwen.ai/blog?id=qwen3.8" },
  ],
  variants: [
    {
      id: "2-4t-a95b",
      name: "2.4T-A95B",
      totalParams: "2.4T",
      activeParams: "95B",
    },
  ],
};
