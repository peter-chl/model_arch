export type {
  MoEConfig,
  MLAConfig,
  HybridAttentionConfig,
  DeltaNetConfig,
  ModelConfig,
  ModelVariant,
  ModelLink,
  ModelFamily,
} from "./types";

import type { ModelFamily } from "./types";
import { llama3 } from "./llama-3";
import { mixtral } from "./mixtral";
import { qwen25 } from "./qwen-25";
import { deepseekV3 } from "./deepseek-v3";
import { gemma2 } from "./gemma-2";
import { phi4 } from "./phi-4";
import { llama4 } from "./llama-4";
import { qwen3 } from "./qwen-3";
import { deepseekR1 } from "./deepseek-r1";
import { kimiK2 } from "./kimi-k2";
import { minimaxM1 } from "./minimax-m1";
import { glm4 } from "./glm-4";
import { mimo } from "./mimo";
import { qwen3Next } from "./qwen3-next";
import { qwen35 } from "./qwen35";
import { qwen36 } from "./qwen36";

export const models: ModelFamily[] = [
  kimiK2,
  qwen3Next,
  qwen35,
  qwen36,
  llama4,
  qwen3,
  glm4,
  mimo,
  deepseekR1,
  minimaxM1,
  deepseekV3,
  phi4,
  qwen25,
  gemma2,
  llama3,
  mixtral,
];

export function getModelBySlug(slug: string): ModelFamily | undefined {
  return models.find((m) => m.slug === slug);
}
