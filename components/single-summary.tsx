"use client";

import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileText,
  Calendar,
  Clock,
  FileDown,
  ChevronDown,
  FileType,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Container from "@/components/common/container";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  downloadSummaryAsPdf,
  downloadSummaryAsText,
} from "@/features/summary/actions/summary-download-action";
type Props = {
  pdf: any;
  readingTime: any;
};

export default function SingleSummary({ pdf, readingTime }: Props) {
  const downloadPdf = async () => {
    const pdfBuffer = await downloadSummaryAsPdf(pdf.id, pdf.title);
    if (!pdfBuffer) return;
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${pdf.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_summary.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadtext = async () => {
    const res = await downloadSummaryAsText(pdf.id, pdf.title);
    if (!res) return;

    const blob = new Blob([res], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${pdf.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_summary.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header Section with Animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg -z-10 blur-sm" />
        <div className="relative z-10 p-6 rounded-lg border border-border/40 bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">
                  {pdf.title}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(pdf.created_at)}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min read</span>
                </div>
              </div>
            </div>
            {/* <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="default" size="sm" asChild className="shadow-sm">
                <Link href={`/api/pdfs/${pdf.id}/download`}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Link>
              </Button>
            </motion.div> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="shadow-sm">
                  <FileDown className="h-4 w-4 mr-2" />
                  Download Summary
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <button
                    onClick={downloadPdf}
                    className="w-full flex items-center cursor-pointer"
                  >
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    <span>Download as PDF</span>
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button
                    onClick={downloadtext}
                    className="w-full flex items-center cursor-pointer"
                  >
                    <FileType className="h-4 w-4 mr-2 text-primary" />
                    <span>Download as Text</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Summary Content with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden border-border/40 shadow-md">
          <div className="bg-muted/50 px-6 py-3 border-b border-border/30">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Summary</h2>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                AI Generated
              </Badge>
            </div>
          </div>
          <CardContent className="p-0">
            <div
              className="p-6 prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-strong:font-semibold"
              dangerouslySetInnerHTML={{ __html: pdf.summary }}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
