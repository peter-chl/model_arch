import Link from "next/link";
import { models } from "@/data/models";

function ModelCard({ model }: { model: (typeof models)[number] }) {
  const variantNames = model.variants.map((v) => v.name).join(" / ");
  return (
    <Link href={`/models/${model.slug}`}>
      <div className="group rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent/40 h-full">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-sans text-lg font-semibold text-foreground">
              {model.name}
            </h3>
            <p className="text-sm text-muted">{model.org}</p>
          </div>
          <span className="shrink-0 rounded-full border border-border bg-background px-3 py-1 font-mono text-xs text-accent">
            {variantNames}
          </span>
        </div>
        <p className="mb-4 text-sm text-muted line-clamp-2">{model.description}</p>
        <p className="text-xs text-accent/70 group-hover:text-accent transition-colors">
          View full architecture →
        </p>
      </div>
    </Link>
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
                <p className="text-sm leading-relaxed text-muted">{item.desc}</p>
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
              <ModelCard key={m.slug} model={m} />
            ))}
          </div>
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
