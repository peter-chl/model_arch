"use client";

import { useState } from "react";
import Link from "next/link";
import type { ModelFamily, ModelCategory } from "@/data/models";

function formatReleaseDate(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

function ModelCard({ model }: { model: ModelFamily }) {
  const category = model.category ?? "llm";
  return (
    <Link href={`/models/${model.slug}`}>
      <div className="group rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent/40 h-full">
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h3 className="font-sans text-lg font-semibold text-foreground">
              {model.name}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted">{model.org}</p>
              {category !== "llm" && (
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  category === "vlm"
                    ? "bg-teal-500/10 text-teal-400"
                    : category === "image-gen"
                    ? "bg-purple-500/10 text-purple-400"
                    : "bg-orange-500/10 text-orange-400"
                }`}>
                  {CATEGORY_LABELS[category]}
                </span>
              )}
            </div>
          </div>
          <span className="shrink-0 rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted">
            {formatReleaseDate(model.releaseDate)}
          </span>
        </div>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {model.variants.map((v) => (
            <span key={v.id} className="rounded-full border border-border bg-background px-2.5 py-0.5 font-mono text-xs text-accent">
              {v.name}
            </span>
          ))}
        </div>
        <p className="mb-3 text-sm text-muted line-clamp-2">{model.description}</p>
        {model.links && model.links.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {model.links.map((link) => (
              <span
                key={link.url}
                className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted/70"
              >
                {link.label}
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-accent/70 group-hover:text-accent transition-colors">
          View full architecture →
        </p>
      </div>
    </Link>
  );
}

type Filter = ModelCategory | "all";

const CATEGORY_LABELS: Record<string, string> = {
  llm: "LLM",
  vlm: "VLM",
  "image-gen": "Image Gen",
  "video-gen": "Video Gen",
};

interface ModelGridProps {
  models: ModelFamily[];
}

export default function ModelGrid({ models }: ModelGridProps) {
  const [filter, setFilter] = useState<Filter>("all");

  function countCat(cat: string) {
    return models.filter((m) => (m.category ?? "llm") === cat).length;
  }

  const filtered =
    filter === "all" ? models : models.filter((m) => (m.category ?? "llm") === filter);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: `All (${models.length})` },
    { key: "llm", label: `LLM (${countCat("llm")})` },
    { key: "vlm", label: `VLM (${countCat("vlm")})` },
    { key: "image-gen", label: `Image Gen (${countCat("image-gen")})` },
    { key: "video-gen", label: `Video Gen (${countCat("video-gen")})` },
  ];

  return (
    <section className="flex-1">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Models
          </h2>
          <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === tab.key
                    ? "bg-accent text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <ModelCard key={m.slug} model={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
