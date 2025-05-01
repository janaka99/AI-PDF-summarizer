import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Container from "@/components/common/container";
import UploadFile from "@/features/summary/components/upload-file";
import { formatDateSafe } from "@/lib/utils";
import TokenTopUp from "@/components/token-purchase/token-top-up";
import { FileText, Upload, Plus, FileUp } from "lucide-react";
import DashboardActivityCard from "@/components/dashboard-activity-card";
import SinglePdfCard from "@/components/single-pdf-card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Monitor and manage your PDF summaries",
};

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  // Check if user is logged in
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  const totalTokens = await prisma.tokenUsage.findFirst({
    where: {
      userId: user?.id,
    },
  });

  const recentPDFs = await prisma.pdfSummary.findMany({
    where: {
      userId: user?.id,
    },
    include: {
      user: {},
    },
    orderBy: {
      created_at: "desc",
    },
    take: 10,
  });

  // Calculate some stats
  const totalPDFs = recentPDFs.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Container className="py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage your PDF summaries
            </p>
          </div>
        </div>

        {/* First-time user notification */}
        {recentPDFs.length <= 0 && (
          <div className="mb-8 animate-fade-in-up">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <div className="mr-4 bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                      <FileUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                        Welcome to PDF Summarizer!
                      </h3>
                      <p className="text-blue-700 dark:text-blue-400">
                        Upload your first PDF and get{" "}
                        <span className="font-bold">5000 free tokens</span>!
                      </p>
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DashboardActivityCard
                title="Available Tokens"
                description={(totalTokens?.tokens || 0).toLocaleString()}
                iconColor="text-purple-500"
                bgHeaderColor="bg-purple-500/5"
              />
              <DashboardActivityCard
                title="Total PDFs"
                description={`${totalPDFs}`}
                iconColor="text-blue-500"
                bgHeaderColor="bg-blue-500/5"
              />

              <DashboardActivityCard
                title="Recent Activity"
                description={
                  recentPDFs.length > 0
                    ? formatDateSafe(recentPDFs[0].created_at)
                    : "No activity"
                }
                iconColor="text-green-500"
                bgHeaderColor="bg-green-500/5"
              />
            </div>
            {/* Upload Section */}
            <Card className="overflow-hidden border-border/40 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-background to-muted/30">
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-primary" />
                  Upload New PDF
                </CardTitle>
                <CardDescription>
                  Upload a PDF file to generate a summary
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1">
                  <UploadFile />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Token Purchase */}
          <div className="lg:col-span-1">
            <TokenTopUp />
          </div>
        </div>

        {/* Recent PDFs - Card Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Recent PDFs
              </h2>
              <p className="text-muted-foreground mt-1">
                Recently uploaded PDFs and their processing status
              </p>
            </div>
            <Button variant="outline" size="sm" className="shadow-sm">
              <Link href="/dashboard/all">View All</Link>
            </Button>
          </div>

          {recentPDFs.length === 0 ? (
            <Card className="border-dashed border-2 bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No PDFs yet</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Upload your first PDF to get started with summarization
                </p>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload PDF
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 staggered-fade-in">
              {recentPDFs.map((pdf) => (
                <SinglePdfCard
                  key={pdf.id}
                  id={pdf.id}
                  created_at={pdf.created_at}
                  status={pdf.status}
                  title={pdf.title}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
