export type {
  MoEConfig,
  MLAConfig,
  HybridAttentionConfig,
  DeltaNetConfig,
  ModelConfig,
  DiffusionConfig,
  ModelVariant,
  ModelLink,
  ModelFamily,
  ModelCategory,
  VisionEncoderConfig,
  PipelineStageRole,
  PipelineStage,
  ModalityPipeline,
} from "./types";

import type { ModelFamily } from "./types";
import { llama3 } from "./llama-3";
import { mixtral } from "./mixtral";
import { qwen25 } from "./qwen-25";
import { deepseekV3 } from "./deepseek-v3";
import { deepseekV4 } from "./deepseek-v4";
import { gemma2 } from "./gemma-2";
import { phi4 } from "./phi-4";
import { llama4 } from "./llama-4";
import { qwen3 } from "./qwen-3";
import { deepseekR1 } from "./deepseek-r1";
import { kimiK2 } from "./kimi-k2";
import { kimiK25 } from "./kimi-k2-5";
import { minimaxM1 } from "./minimax-m1";
import { glm4 } from "./glm-4";
import { glm5 } from "./glm-5";
import { minimaxM3 } from "./minimax-m3";
import { gemma4 } from "./gemma-4";
import { mimo } from "./mimo";
import { qwen3Next } from "./qwen3-next";
import { qwen35 } from "./qwen35";
import { qwen36 } from "./qwen36";
import { internvl25 } from "./internvl-2-5";
import { qwen25vl } from "./qwen25-vl";
import { qwen3vl } from "./qwen3-vl";
import { wan21, wan22 } from "./wan";
import { hunyuanVideo } from "./hunyuan-video";
import { flux1 } from "./flux-1";
import { cogVideoX } from "./cogvideox";

export const models: ModelFamily[] = [
  // 2026
  minimaxM3,
  gemma4,
  deepseekV4,
  qwen36,
  glm5,
  qwen35,
  kimiK25,
  // 2025
  qwen3Next,
  wan22,
  kimiK2,
  minimaxM1,
  llama4,
  qwen3,
  qwen3vl,
  glm4,
  mimo,
  qwen25vl,
  wan21,
  deepseekR1,
  // 2024
  deepseekV3,
  phi4,
  hunyuanVideo,
  cogVideoX,
  qwen25,
  internvl25,
  flux1,
  gemma2,
  llama3,
  // 2023
  mixtral,
];

export function getModelBySlug(slug: string): ModelFamily | undefined {
  return models.find((m) => m.slug === slug);
}
