import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileIcon,
  Loader2,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { formatDateSafe } from "@/lib/utils";

// Helper function to get status badge
function getStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "completed":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
        </Badge>
      );
    case "processing":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing
        </Badge>
      );
    case "failed":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          <AlertCircle className="w-3 h-3 mr-1" /> Failed
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      );
    default:
      return <Badge variant="outline">{status || "Unknown"}</Badge>;
  }
}

// Helper function to get a color based on file extension
function getFileColor(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase() || "";
  const colors = {
    pdf: "text-red-500",
    doc: "text-blue-500",
    docx: "text-blue-500",
    txt: "text-gray-500",
    default: "text-primary",
  };

  return colors[extension as keyof typeof colors] || colors.default;
}

type Props = {
  id: string;
  title: string;
  created_at: any;
  status: string;
};

export default function SinglePdfCard({
  id,
  title,
  created_at,
  status,
}: Props) {
  return (
    <Card
      key={id}
      className="overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-all duration-200 group card-hover-effect"
    >
      <div className="h-2 bg-gradient-to-r from-primary/80 to-primary/40"></div>
      <div className=" bg-gradient-to-r group card-hover-effect">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-2">
              <div
                className={`p-2 rounded-md bg-primary/10 ${getFileColor(
                  title
                )}`}
              >
                <FileIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-medium truncate max-w-[180px]">
                  {title}
                </CardTitle>

                <CardDescription className="text-xs mt-1">
                  {formatDateSafe(created_at)}
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/pdf/${id}`} className="cursor-pointer">
                    <Eye className="h-4 w-4 mr-2" /> View Summary
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/api/pdfs/${id}/download`}
                    className="cursor-pointer"
                  >
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </Link>
                </DropdownMenuItem>
                {status?.toLowerCase() === "processing" && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/api/pdfs/${id}/process`}
                      className="cursor-pointer"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> Process Again
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pb-3 flex justify-end items-center">
          <div>{getStatusBadge(status || "")}</div>
        </CardContent>
        <CardFooter className="pt-0 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full shadow-sm"
            asChild
          >
            <Link href={`/pdf/${id}`}>
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View Summary
            </Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
