import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Container from "@/components/common/container";
import SingleSummary from "@/components/single-summary";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ConciseAI",
  description: "Consise AI - Summarize your PDFs in seconds",
};

export default async function PDFDetailPage({
  params,
}: {
  params: Promise<{ pdf_id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const { pdf_id } = await params;

  if (!pdf_id) {
    notFound();
  }

  try {
    const pdf = await prisma.pdfSummary.findFirst({
      where: {
        id: pdf_id,
        user: {
          clerkUserId: userId,
        },
      },
    });

    if (!pdf) {
      return notFound();
    }

    // Calculate reading time (rough estimate)
    const wordCount = pdf.summary.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
      <Container className="py-12 max-w-5xl">
        <SingleSummary pdf={pdf} readingTime={readingTime} />
      </Container>
    );
  } catch (error) {
    return notFound();
  }
}
