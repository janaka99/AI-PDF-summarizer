import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import Container from "@/components/common/container";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "SaaSly has completely transformed how our team works together. The interface is intuitive and the features are exactly what we needed.",
      author: "Sarah Johnson",
      role: "Product Manager at TechCorp",
      rating: 5,
    },
    {
      quote:
        "We've tried many collaboration tools, but SaaSly stands out with its powerful features and ease of use. It's been a game-changer for our remote team.",
      author: "Michael Chen",
      role: "CTO at StartupX",
      rating: 5,
    },
    {
      quote:
        "The analytics and reporting features have given us insights we never had before. Our productivity has increased by 35% since implementing SaaSly.",
      author: "Emily Rodriguez",
      role: "Operations Director at GrowthCo",
      rating: 4,
    },
  ];

  return (
    <section
      id="testimonials"
      className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
    >
      <Container>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Loved by Businesses Worldwide
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Don't just take our word for it. Here's what our customers have to
              say.
            </p>
          </div>
        </div>
        <div className="mx-auto grid grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? "text-primary fill-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                </div>
                <p className="mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
