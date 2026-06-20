import type { Metadata } from "next";
import { ChapterStub } from "@/components/chapter-stub";
import { chapterBySlug } from "@/lib/chapters";

const slug = "attention";

export function generateMetadata(): Metadata {
  return { title: chapterBySlug(slug)?.title };
}

export default function Page() {
  return <ChapterStub slug={slug} />;
}
