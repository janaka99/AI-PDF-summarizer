import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart3 } from "lucide-react";

type Props = {
  iconColor: string;
  title: string;
  description: string;
  bgHeaderColor: string;
};

export default function DashboardActivityCard({
  description,
  title,
  iconColor,
  bgHeaderColor,
}: Props) {
  return (
    <Card className="overflow-hidden border-border/40 shadow-sm hover:shadow transition-shadow duration-200">
      <CardHeader className={`py-2  ${bgHeaderColor}`}>
        <CardTitle className="text-sm  font-medium flex items-center">
          <BarChart3 className={`h-4 w-4 mr-2 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-3xl font-bold">{description}</div>
      </CardContent>
    </Card>
  );
}
