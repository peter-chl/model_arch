const models = [
  {
    name: "LLaMA 3",
    org: "Meta",
    params: "8B / 70B / 405B",
    arch: "Dense Transformer (decoder-only)",
    highlights: [
      "GQA (grouped-query attention)",
      "RoPE positional embeddings",
      "SwiGLU FFN activation",
      "RMSNorm pre-normalization",
    ],
  },
  {
    name: "Mistral / Mixtral",
    org: "Mistral AI",
    params: "7B / 8x7B / 8x22B",
    arch: "Sparse MoE Transformer",
    highlights: [
      "Sliding-window attention (Mistral 7B)",
      "Top-2 expert routing (Mixtral)",
      "Shared embedding & output head",
      "RoPE + SwiGLU + RMSNorm",
    ],
  },
  {
    name: "Qwen 2.5",
    org: "Alibaba",
    params: "0.5B – 72B",
    arch: "Dense Transformer (decoder-only)",
    highlights: [
      "GQA with YaRN extended context",
      "SwiGLU FFN",
      "Tied embeddings on smaller variants",
      "RMSNorm pre-normalization",
    ],
  },
  {
    name: "DeepSeek-V3",
    org: "DeepSeek",
    params: "671B (37B active)",
    arch: "MoE Transformer + MLA",
    highlights: [
      "Multi-head Latent Attention (MLA)",
      "DeepSeekMoE with shared experts",
      "Auxiliary-loss-free load balancing",
      "FP8 mixed-precision training",
    ],
  },
  {
    name: "Gemma 2",
    org: "Google",
    params: "2B / 9B / 27B",
    arch: "Dense Transformer (decoder-only)",
    highlights: [
      "Alternating local / global attention",
      "Logit soft-capping",
      "GeGLU FFN activation",
      "Knowledge distillation training",
    ],
  },
  {
    name: "Phi-4",
    org: "Microsoft",
    params: "14B",
    arch: "Dense Transformer (decoder-only)",
    highlights: [
      "Synthetic-data-heavy training mix",
      "Full attention (no GQA)",
      "RoPE + LayerNorm",
      "Pivotal token search for DPO",
    ],
  },
];

function ModelCard({
  model,
}: {
  model: (typeof models)[number];
}) {
  return (
    <div className="group rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent/40">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-sans text-lg font-semibold text-foreground">
            {model.name}
          </h3>
          <p className="text-sm text-muted">{model.org}</p>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-background px-3 py-1 font-mono text-xs text-accent">
          {model.params}
        </span>
      </div>
      <p className="mb-4 font-mono text-sm text-muted">{model.arch}</p>
      <ul className="space-y-1.5">
        {model.highlights.map((h) => (
          <li
            key={h}
            className="flex items-start gap-2 text-sm text-foreground/80"
          >
            <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
            {h}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold tracking-tight text-accent">
              {">"}_
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              model_arch
            </span>
          </div>
          <a
            href="https://github.com/peter-chl/model_arch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Open Weight Model
            <br />
            Architectures
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted">
            A technical reference for open weight AI models. Layer-by-layer
            structures, exact tensor dimensions, parameter count breakdowns,
            annotated code, and training recipes — all in one place.
          </p>
        </div>
      </section>

      {/* What You'll Find */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted">
            What&apos;s covered
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Layer Structure",
                desc: "Full block diagrams with every sub-layer, norm placement, and residual connection.",
              },
              {
                title: "Dimensions",
                desc: "Exact shapes for embeddings, Q/K/V projections, FFN intermediates, and outputs.",
              },
              {
                title: "Parameter Counts",
                desc: "Step-by-step calculations showing where every parameter lives.",
              },
              {
                title: "Training Recipes",
                desc: "Data mixes, learning rate schedules, optimizer configs, and novel techniques.",
              },
            ].map((item) => (
              <div key={item.title} className="space-y-2">
                <h3 className="font-mono text-sm font-semibold text-accent">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model Cards */}
      <section className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted">
            Models
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {models.map((m) => (
              <ModelCard key={m.name} model={m} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted">
            Detailed architecture pages coming soon. Each model will get a
            full breakdown with code and diagrams.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <p className="text-center text-xs text-muted">
            model_arch — open source reference for AI model architectures
          </p>
        </div>
      </footer>
    </div>
  );
}
