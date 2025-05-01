"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/common/container";

export function PricingSection() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      id="pricing"
      className="w-full py-12 md:py-24 lg:py-32 bg-background"
    >
      <Container className="max-w-[1400px]">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors">
              Pricing
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="max-w-[800px] text-muted-foreground text-base md:text-lg">
              Top up your wallet and pay only when you need — no monthly fees,
              no hidden costs.
            </p>
          </div>

          <motion.div
            className="w-full mt-10 px-8 py-12 rounded-2xl bg-gradient-to-b from-background to-secondary/5 border border-secondary/10"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center space-y-8 max-w-4xl mx-auto">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl md:text-7xl font-bold text-primary">
                  $1
                </span>
                <span className="text-muted-foreground text-xl">for</span>
                <span className="text-3xl md:text-4xl font-semibold">
                  6,000 tokens
                </span>
              </div>

              <div className="w-full max-w-3xl h-px bg-border my-2" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full text-base">
                {[
                  "Pay only when you summarize",
                  "Tokens never expire",
                  "Full control over usage",
                  "No monthly fees",
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </div>
                    <span className="text-muted-foreground text-left">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="mt-6 px-8 py-6 text-lg group relative overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span className="relative z-10">Top Up Now</span>
                <motion.div
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-10"
                  animate={{
                    x: isHovered ? 0 : -10,
                    opacity: isHovered ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight size={20} />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-primary/10"
                  initial={{ x: "-100%" }}
                  animate={{ x: isHovered ? "0%" : "-100%" }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </div>
          </motion.div>

          <p className="text-sm text-muted-foreground mt-8">
            Need more tokens?{" "}
            <a
              href="#contact"
              className="text-primary underline-offset-4 hover:underline"
            >
              Contact us
            </a>{" "}
            for custom packages.
          </p>
        </div>
      </Container>
    </section>
  );
}
