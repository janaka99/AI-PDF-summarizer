import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Container from "@/components/common/container";

export function CtaSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
      <Container>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Summarize Smarter?
            </h2>
            <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl/relaxed">
              Join users who trust our AI-powered platform to turn long PDFs
              into clear, concise summaries — on demand.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button size="lg" variant="secondary" className="gap-1.5">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
