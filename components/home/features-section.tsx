import {
  BarChart,
  Clock,
  Compass,
  Layers,
  Lightbulb,
  Users,
} from "lucide-react";
import Container from "@/components/common/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FeaturesSection() {
  const features = [
    {
      icon: <Layers className="h-6 w-6" />,
      title: "On-Demand Summaries",
      description:
        "Upload and summarize any PDF whenever you need, without hidden costs.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Secure File Handling",
      description:
        "Your documents are processed safely with top-grade security.",
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Insightful Summaries",
      description: "Get clear, concise key points extracted from complex PDFs.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Fast Turnaround",
      description: "Receive high-quality summaries in seconds, not hours.",
    },
    {
      icon: <Compass className="h-6 w-6" />,
      title: "Flexible Wallet System",
      description:
        "Top up once and pay only when you use — no subscriptions needed.",
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "AI-Optimized Summarization",
      description:
        "Smart algorithms ensure the most accurate and relevant outputs.",
    },
  ];

  return (
    <section
      id="features"
      className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
    >
      <Container>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Summarize with Ease
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform gives you powerful, on-demand AI tools to summarize
              PDFs quickly, accurately, and affordably — without subscriptions.
            </p>
          </div>
        </div>
        <div className="mx-auto grid grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader className="flex justify-center">
                <div className="rounded-full border p-3 text-primary w-fit">
                  {feature.icon}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl text-center font-bold">
                  {feature.title}
                </h3>
                <p className="text-center text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
