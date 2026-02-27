import type { Metadata } from "next";
import useCaseData from "@/data/cases.json";
import type { UseCase } from "@/lib/types";
import CaseDetailPage from "./CaseDetail";

const allCases = useCaseData.useCases as UseCase[];

function stripBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, "$1");
}

export function generateStaticParams() {
  return allCases.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const useCase = allCases.find((c) => c.id === id);
  if (!useCase) {
    return { title: "Not Found — MateClaw" };
  }
  const title = stripBold(useCase.title);
  return {
    title: `${title} — MateClaw Use Cases`,
    description: useCase.description.slice(0, 160),
    openGraph: {
      title: `${title} — MateClaw Use Cases`,
      description: useCase.description.slice(0, 160),
      siteName: "MateClaw",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CaseDetailPage id={id} />;
}
