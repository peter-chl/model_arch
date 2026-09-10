import type { ModelFamily } from "./types";

export const deepseekV41Flash: ModelFamily = {
  slug: "deepseek-v4-1",
  name: "DeepSeek-V4.1",
  org: "DeepSeek",
  category: "vlm",
  releaseDate: "2026-09",
  description:
    "Multimodal Mixture-of-Experts using a novel Causal Encoder-Decoder (CED) architecture: a 20-layer causal encoder followed by a 20-layer decoder. Introduces CSA2 (Compressed Sparse Attention 2) with a single 512-dim KV latent per position — shared across all 64 query heads (1024-dim Q compression) — via two-tier sparse attention: a 128-token sliding window plus compressed distant-context latents scored and pruned per query. Adds 196B of Engram conditional memory (a sparse parameter bank accessed via token-based lookup) on top of the 552B transformer backbone. Activates asymmetrically: 8B parameters per token during prefill and 16B during decode. Accepts text and images; outputs text. Trained from scratch on 45T mixed tokens under MIT licence. Expert FFN size and some MLA sub-dimensions are pending confirmation from the full technical report.",
  links: [
    { label: "HuggingFace", url: "https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash" },
    { label: "Blog", url: "https://www.deepseek.com/en/news/deepseek-v4-1-flash/" },
  ],
  variants: [
    {
      id: "flash",
      name: "V4.1-Flash",
      totalParams: "552B",
      activeParams: "8B",
      config: {
        vocab_size: 129280,
        hidden_size: 5120,
        num_layers: 40,
        num_attention_heads: 64,
        num_kv_heads: 0,
        head_dim: 128,
        // expert_intermediate_size below; intermediate_size set to same (all-MoE from layer 0)
        // exact value pending technical report — estimated from V4 family scaling
        intermediate_size: 2560,
        max_seq_len: 1048576,
        norm: "RMSNorm",
        activation: "SwiGLU",
        pos_encoding: "RoPE (partial)",
        tie_embeddings: false,
        mla: {
          kv_lora_rank: 512,
          q_lora_rank: 1024,
          // sub-dims below follow V4-family pattern; pending full tech report
          qk_nope_head_dim: 128,
          qk_rope_head_dim: 64,
          v_head_dim: 128,
        },
        moe: {
          num_experts: 384,
          shared_experts: 1,
          top_k: 6,
          expert_intermediate_size: 2560,
          first_moe_layer: 0,
        },
      },
    },
  ],
};
