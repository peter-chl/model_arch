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
  return {
    title: `${model.name} Architecture — model_arch`,
    description: model.description,
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
