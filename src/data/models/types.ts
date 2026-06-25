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

export interface HybridAttentionConfig {
  softmax_every_n: number;
}

export interface DeltaNetConfig {
  qk_heads: number;
  v_heads: number;
  head_dim: number;
  softmax_every_n: number;
  gated_q_heads: number;
  gated_kv_heads: number;
  gated_head_dim: number;
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
  hybrid_attn?: HybridAttentionConfig;
  deltanet?: DeltaNetConfig;
}

export interface ModelVariant {
  id: string;
  name: string;
  totalParams: string;
  activeParams?: string;
  config: ModelConfig;
}

export interface ModelLink {
  label: string;
  url: string;
}

export interface ModelFamily {
  slug: string;
  name: string;
  org: string;
  description: string;
  links?: ModelLink[];
  variants: ModelVariant[];
}
