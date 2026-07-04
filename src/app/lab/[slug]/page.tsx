import { notFound } from "next/navigation";
import { LabSwitcher } from "@/components/lab/switcher";
import { OPTIONS } from "@/components/lab/registry";

export function generateStaticParams() {
  return OPTIONS.map((o) => ({ slug: o.slug }));
}

export default async function LabOptionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const option = OPTIONS.find((o) => o.slug === slug);
  if (!option) notFound();
  const Hero = option.Component;
  return (
    <main style={{ minHeight: "100svh", background: "#fff" }}>
      <LabSwitcher activeSlug={slug} />
      <Hero />
    </main>
  );
}
