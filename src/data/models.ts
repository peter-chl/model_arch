export interface MoEConfig {
  num_experts: number;
  shared_experts: number;
  top_k: number;
  expert_intermediate_size: number;
  first_moe_layer: number;
  interleave_step?: number;
}

export interface MLAConfig {
  kv_lora_rank: number;
  q_lora_rank: number;
  qk_nope_head_dim: number;
  qk_rope_head_dim: number;
  v_head_dim: number;
}

export interface ModelConfig {
  vocab_size: number;
  hidden_size: number;
  num_layers: number;
  num_attention_heads: number;
  num_kv_heads: number;
  head_dim: number;
  intermediate_size: number;
  max_seq_len: number;
  norm: string;
  activation: string;
  pos_encoding: string;
  tie_embeddings: boolean;
  moe?: MoEConfig;
  mla?: MLAConfig;
}

export interface ModelVariant {
  id: string;
  name: string;
  totalParams: string;
  activeParams?: string;
  config: ModelConfig;
}

export interface ModelFamily {
  slug: string;
  name: string;
  org: string;
  description: string;
  variants: ModelVariant[];
}

export const models: ModelFamily[] = [
  {
    slug: "llama-3",
    name: "LLaMA 3",
    org: "Meta",
    description:
      "Dense decoder-only transformer with GQA, RoPE, SwiGLU, and RMSNorm pre-normalization.",
    variants: [
      {
        id: "8b",
        name: "8B",
        totalParams: "8.03B",
        config: {
          vocab_size: 128256,
          hidden_size: 4096,
          num_layers: 32,
          num_attention_heads: 32,
          num_kv_heads: 8,
          head_dim: 128,
          intermediate_size: 14336,
          max_seq_len: 8192,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE",
          tie_embeddings: false,
        },
      },
      {
        id: "70b",
        name: "70B",
        totalParams: "70.6B",
        config: {
          vocab_size: 128256,
          hidden_size: 8192,
          num_layers: 80,
          num_attention_heads: 64,
          num_kv_heads: 8,
          head_dim: 128,
          intermediate_size: 28672,
          max_seq_len: 8192,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE",
          tie_embeddings: false,
        },
      },
      {
        id: "405b",
        name: "405B",
        totalParams: "405B",
        config: {
          vocab_size: 128256,
          hidden_size: 16384,
          num_layers: 126,
          num_attention_heads: 128,
          num_kv_heads: 8,
          head_dim: 128,
          intermediate_size: 53248,
          max_seq_len: 8192,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE",
          tie_embeddings: false,
        },
      },
    ],
  },
  {
    slug: "mixtral",
    name: "Mistral / Mixtral",
    org: "Mistral AI",
    description:
      "Sparse MoE transformer with top-2 expert routing, sliding-window attention (Mistral 7B), and shared GQA design.",
    variants: [
      {
        id: "7b",
        name: "Mistral 7B",
        totalParams: "7.24B",
        config: {
          vocab_size: 32000,
          hidden_size: 4096,
          num_layers: 32,
          num_attention_heads: 32,
          num_kv_heads: 8,
          head_dim: 128,
          intermediate_size: 14336,
          max_seq_len: 32768,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE",
          tie_embeddings: false,
        },
      },
      {
        id: "8x7b",
        name: "Mixtral 8×7B",
        totalParams: "46.7B",
        activeParams: "12.9B",
        config: {
          vocab_size: 32000,
          hidden_size: 4096,
          num_layers: 32,
          num_attention_heads: 32,
          num_kv_heads: 8,
          head_dim: 128,
          intermediate_size: 14336,
          max_seq_len: 32768,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE",
          tie_embeddings: false,
          moe: {
            num_experts: 8,
            shared_experts: 0,
            top_k: 2,
            expert_intermediate_size: 14336,
            first_moe_layer: 0,
          },
        },
      },
      {
        id: "8x22b",
        name: "Mixtral 8×22B",
        totalParams: "140.6B",
        activeParams: "39.1B",
        config: {
          vocab_size: 32768,
          hidden_size: 6144,
          num_layers: 56,
          num_attention_heads: 48,
          num_kv_heads: 8,
          head_dim: 128,
          intermediate_size: 16384,
          max_seq_len: 65536,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE",
          tie_embeddings: false,
          moe: {
            num_experts: 8,
            shared_experts: 0,
            top_k: 2,
            expert_intermediate_size: 16384,
            first_moe_layer: 0,
          },
        },
      },
    ],
  },
  {
    slug: "qwen-25",
    name: "Qwen 2.5",
    org: "Alibaba",
    description:
      "Dense decoder-only transformer with GQA, YaRN-extended RoPE for long context, and SwiGLU activation.",
    variants: [
      {
        id: "7b",
        name: "7B",
        totalParams: "7.62B",
        config: {
          vocab_size: 152064,
          hidden_size: 3584,
          num_layers: 28,
          num_attention_heads: 28,
          num_kv_heads: 4,
          head_dim: 128,
          intermediate_size: 18944,
          max_seq_len: 131072,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE + YaRN",
          tie_embeddings: false,
        },
      },
      {
        id: "72b",
        name: "72B",
        totalParams: "72.7B",
        config: {
          vocab_size: 152064,
          hidden_size: 8192,
          num_layers: 80,
          num_attention_heads: 64,
          num_kv_heads: 8,
          head_dim: 128,
          intermediate_size: 29568,
          max_seq_len: 131072,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE + YaRN",
          tie_embeddings: false,
        },
      },
    ],
  },
  {
    slug: "deepseek-v3",
    name: "DeepSeek-V3",
    org: "DeepSeek",
    description:
      "MoE transformer with Multi-head Latent Attention (MLA) for KV compression, 256 routed experts with auxiliary-loss-free load balancing, and FP8 training.",
    variants: [
      {
        id: "671b",
        name: "671B",
        totalParams: "671B",
        activeParams: "37B",
        config: {
          vocab_size: 129280,
          hidden_size: 7168,
          num_layers: 61,
          num_attention_heads: 128,
          num_kv_heads: 0,
          head_dim: 128,
          intermediate_size: 18432,
          max_seq_len: 163840,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE (partial)",
          tie_embeddings: false,
          mla: {
            kv_lora_rank: 512,
            q_lora_rank: 1536,
            qk_nope_head_dim: 128,
            qk_rope_head_dim: 64,
            v_head_dim: 128,
          },
          moe: {
            num_experts: 256,
            shared_experts: 1,
            top_k: 8,
            expert_intermediate_size: 2048,
            first_moe_layer: 3,
          },
        },
      },
    ],
  },
  {
    slug: "gemma-2",
    name: "Gemma 2",
    org: "Google",
    description:
      "Dense decoder-only transformer with alternating local/global attention, logit soft-capping, GeGLU activation, and knowledge distillation training.",
    variants: [
      {
        id: "9b",
        name: "9B",
        totalParams: "9.24B",
        config: {
          vocab_size: 256000,
          hidden_size: 3584,
          num_layers: 42,
          num_attention_heads: 16,
          num_kv_heads: 8,
          head_dim: 256,
          intermediate_size: 14336,
          max_seq_len: 8192,
          norm: "RMSNorm",
          activation: "GeGLU",
          pos_encoding: "RoPE",
          tie_embeddings: true,
        },
      },
      {
        id: "27b",
        name: "27B",
        totalParams: "27.2B",
        config: {
          vocab_size: 256000,
          hidden_size: 4608,
          num_layers: 46,
          num_attention_heads: 32,
          num_kv_heads: 16,
          head_dim: 128,
          intermediate_size: 36864,
          max_seq_len: 8192,
          norm: "RMSNorm",
          activation: "GeGLU",
          pos_encoding: "RoPE",
          tie_embeddings: true,
        },
      },
    ],
  },
  {
    slug: "phi-4",
    name: "Phi-4",
    org: "Microsoft",
    description:
      "Dense decoder-only transformer trained on a synthetic-data-heavy mix with pivotal token search for DPO alignment.",
    variants: [
      {
        id: "14b",
        name: "14B",
        totalParams: "14.0B",
        config: {
          vocab_size: 100352,
          hidden_size: 5120,
          num_layers: 40,
          num_attention_heads: 40,
          num_kv_heads: 10,
          head_dim: 128,
          intermediate_size: 17920,
          max_seq_len: 16384,
          norm: "LayerNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE",
          tie_embeddings: false,
        },
      },
    ],
  },
  {
    slug: "llama-4",
    name: "LLaMA 4",
    org: "Meta",
    description:
      "Meta's first MoE architecture with natively multimodal early fusion. Scout uses full MoE across all layers; Maverick alternates dense and MoE layers with 128 experts.",
    variants: [
      {
        id: "scout",
        name: "Scout",
        totalParams: "109B",
        activeParams: "17B",
        config: {
          vocab_size: 202048,
          hidden_size: 5120,
          num_layers: 48,
          num_attention_heads: 40,
          num_kv_heads: 8,
          head_dim: 128,
          intermediate_size: 16384,
          max_seq_len: 10485760,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE",
          tie_embeddings: false,
          moe: {
            num_experts: 16,
            shared_experts: 0,
            top_k: 1,
            expert_intermediate_size: 8192,
            first_moe_layer: 0,
          },
        },
      },
      {
        id: "maverick",
        name: "Maverick",
        totalParams: "400B",
        activeParams: "17B",
        config: {
          vocab_size: 202048,
          hidden_size: 5120,
          num_layers: 48,
          num_attention_heads: 40,
          num_kv_heads: 8,
          head_dim: 128,
          intermediate_size: 16384,
          max_seq_len: 1048576,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE",
          tie_embeddings: false,
          moe: {
            num_experts: 128,
            shared_experts: 0,
            top_k: 1,
            expert_intermediate_size: 8192,
            first_moe_layer: 0,
            interleave_step: 2,
          },
        },
      },
    ],
  },
  {
    slug: "qwen-3",
    name: "Qwen 3",
    org: "Alibaba",
    description:
      "Third-generation Qwen series with dense and MoE variants. Features thinking/non-thinking mode switching, YaRN-extended RoPE, and 128-expert sparse routing in the MoE variant.",
    variants: [
      {
        id: "32b",
        name: "32B",
        totalParams: "32.8B",
        config: {
          vocab_size: 151936,
          hidden_size: 5120,
          num_layers: 64,
          num_attention_heads: 64,
          num_kv_heads: 8,
          head_dim: 128,
          intermediate_size: 25600,
          max_seq_len: 131072,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE + YaRN",
          tie_embeddings: false,
        },
      },
      {
        id: "235b-a22b",
        name: "235B-A22B",
        totalParams: "235B",
        activeParams: "22B",
        config: {
          vocab_size: 151936,
          hidden_size: 4096,
          num_layers: 94,
          num_attention_heads: 64,
          num_kv_heads: 4,
          head_dim: 128,
          intermediate_size: 1536,
          max_seq_len: 131072,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE + YaRN",
          tie_embeddings: false,
          moe: {
            num_experts: 128,
            shared_experts: 0,
            top_k: 8,
            expert_intermediate_size: 1536,
            first_moe_layer: 0,
          },
        },
      },
    ],
  },
  {
    slug: "deepseek-r1",
    name: "DeepSeek-R1",
    org: "DeepSeek",
    description:
      "Reasoning-focused MoE model sharing the same architecture as DeepSeek-V3 (MLA + 256 routed experts), trained with large-scale reinforcement learning for chain-of-thought reasoning without supervised fine-tuning.",
    variants: [
      {
        id: "671b",
        name: "671B",
        totalParams: "671B",
        activeParams: "37B",
        config: {
          vocab_size: 129280,
          hidden_size: 7168,
          num_layers: 61,
          num_attention_heads: 128,
          num_kv_heads: 0,
          head_dim: 128,
          intermediate_size: 18432,
          max_seq_len: 131072,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE (partial)",
          tie_embeddings: false,
          mla: {
            kv_lora_rank: 512,
            q_lora_rank: 1536,
            qk_nope_head_dim: 128,
            qk_rope_head_dim: 64,
            v_head_dim: 128,
          },
          moe: {
            num_experts: 256,
            shared_experts: 1,
            top_k: 8,
            expert_intermediate_size: 2048,
            first_moe_layer: 3,
          },
        },
      },
    ],
  },
  {
    slug: "kimi-k2",
    name: "Kimi K2",
    org: "Moonshot AI",
    description:
      "Trillion-parameter MoE model with Multi-head Latent Attention (MLA) and 384 routed experts. Extends DeepSeek-V3 architecture with QK-Clip and MuonClip optimizer for stable training.",
    variants: [
      {
        id: "1t",
        name: "1T",
        totalParams: "1T",
        activeParams: "32B",
        config: {
          vocab_size: 160000,
          hidden_size: 7168,
          num_layers: 61,
          num_attention_heads: 64,
          num_kv_heads: 0,
          head_dim: 128,
          intermediate_size: 18432,
          max_seq_len: 131072,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE (partial)",
          tie_embeddings: false,
          mla: {
            kv_lora_rank: 512,
            q_lora_rank: 1536,
            qk_nope_head_dim: 128,
            qk_rope_head_dim: 64,
            v_head_dim: 128,
          },
          moe: {
            num_experts: 384,
            shared_experts: 1,
            top_k: 8,
            expert_intermediate_size: 2048,
            first_moe_layer: 1,
          },
        },
      },
    ],
  },
  {
    slug: "minimax-m1",
    name: "MiniMax-M1",
    org: "MiniMax",
    description:
      "MoE transformer with hybrid Lightning Attention (linear) and softmax attention — softmax placed every 7 lightning blocks. 32 experts with top-2 routing, supporting 1M+ token context.",
    variants: [
      {
        id: "456b",
        name: "456B",
        totalParams: "456B",
        activeParams: "45.9B",
        config: {
          vocab_size: 200064,
          hidden_size: 6144,
          num_layers: 80,
          num_attention_heads: 64,
          num_kv_heads: 8,
          head_dim: 128,
          intermediate_size: 9216,
          max_seq_len: 1048576,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE",
          tie_embeddings: false,
          moe: {
            num_experts: 32,
            shared_experts: 0,
            top_k: 2,
            expert_intermediate_size: 9216,
            first_moe_layer: 0,
          },
        },
      },
    ],
  },
  {
    slug: "glm-4",
    name: "GLM-4",
    org: "Zhipu AI",
    description:
      "Dense decoder-only transformer with deep GQA (2 KV heads), SwiGLU activation, and RMSNorm. Pre-trained on 15T tokens including substantial reasoning-type synthetic data.",
    variants: [
      {
        id: "32b",
        name: "32B",
        totalParams: "32B",
        config: {
          vocab_size: 151552,
          hidden_size: 6144,
          num_layers: 61,
          num_attention_heads: 48,
          num_kv_heads: 2,
          head_dim: 128,
          intermediate_size: 23040,
          max_seq_len: 131072,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE",
          tie_embeddings: false,
        },
      },
    ],
  },
  {
    slug: "mimo",
    name: "MiMo",
    org: "Xiaomi",
    description:
      "Compact reasoning-optimized dense transformer with deeper architecture (36 layers) and wider hidden dimension than comparable 7B models. Uses GQA, SwiGLU, and RoPE with 256K context.",
    variants: [
      {
        id: "7b",
        name: "7B",
        totalParams: "7.6B",
        config: {
          vocab_size: 151936,
          hidden_size: 4096,
          num_layers: 36,
          num_attention_heads: 32,
          num_kv_heads: 8,
          head_dim: 128,
          intermediate_size: 11008,
          max_seq_len: 262144,
          norm: "RMSNorm",
          activation: "SwiGLU",
          pos_encoding: "RoPE",
          tie_embeddings: false,
        },
      },
    ],
  },
];

export function getModelBySlug(slug: string): ModelFamily | undefined {
  return models.find((m) => m.slug === slug);
}
