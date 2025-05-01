import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Container from "@/components/common/container";

export function FaqSection() {
  const faqs = [
    {
      question: "How does the wallet system work?",
      answer:
        "Simply top up your wallet with $5 to get 50,000 tokens. Use tokens whenever you need to summarize PDFs — no subscriptions, no monthly fees.",
    },
    {
      question: "Do my tokens expire?",
      answer:
        "No, your tokens never expire. Use them at your own pace, whenever you need.",
    },
    {
      question: "Is there a limit on file size?",
      answer:
        "You can upload PDFs up to 20MB in size. For larger documents, we recommend splitting them before uploading.",
    },
    {
      question: "How secure is my uploaded PDF?",
      answer:
        "Your files are safe and you can delete the PDF after upload from dashboard.",
    },
    {
      question: "Can I get a refund if I don't use my tokens?",
      answer:
        "Tokens are non-refundable, but they stay available in your account indefinitely — no rush to use them.",
    },
  ];

  return (
    <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
      <Container>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              FAQ
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Find answers to common questions about our platform and services.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl space-y-4 py-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}
