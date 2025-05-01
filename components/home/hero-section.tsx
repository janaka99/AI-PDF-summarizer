import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Container from "@/components/common/container";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Summarize PDFs Instantly with AI Power
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Top up your wallet and pay only when you need — no costly
                subscriptions. Get accurate, lightning-fast PDF summaries with
                our AI-driven platform.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="gap-1.5">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div className="text-muted-foreground">
                Trusted by{" "}
                <span className="font-medium text-foreground">2,000+</span>{" "}
                companies
              </div>
            </div>
          </div>
          <div className="mx-auto flex w-full items-center justify-center">
            <div className="rounded-lg border bg-background p-2 shadow-lg">
              <Image
                src="/dashboard.png"
                width={1000}
                height={5000}
                className="w-full aspect-video"
                alt=""
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
