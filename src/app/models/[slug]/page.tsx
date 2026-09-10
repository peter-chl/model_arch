import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { models, getModelBySlug } from "@/data/models";
import ModelViewer from "./ModelViewer";

export function generateStaticParams() {
  return models.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const model = getModelBySlug(slug);
  if (!model) return { title: "Not Found" };
  const title = `${model.name} Architecture`;
  const ogImage = `/og/${slug}.png`;
  return {
    title,
    description: model.description,
    openGraph: {
      title,
      description: model.description,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: model.description,
      images: [ogImage],
    },
  };
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = getModelBySlug(slug);
  if (!model) notFound();
  return <ModelViewer model={model} />;
}
