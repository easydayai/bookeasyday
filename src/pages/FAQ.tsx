import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function FAQ() {
  const faqs = [
    {
      question: "How does approval work?",
      answer:
        "After you apply and pay the $20 fee, our team reviews your information and documents. We verify your income, check your background, and assess your overall application. If you meet our criteria, you're approved and matched with rental specialists who will help you find properties. The specialists then submit your pre-approved application to landlords who are more likely to accept you based on your profile.",
    },
    {
      question: "How much does it cost?",
      answer:
        "Rent EZ costs just $20 for a one-time application fee. That's it. No hidden fees, no monthly subscriptions. Compare that to traditional applications which cost $50-150 each time you apply. With Rent EZ, you apply once and can be matched with multiple properties.",
    },
    {
      question: "Do you help in all 50 states?",
      answer:
        "Yes! We work with rental specialists and landlords across all 50 states. Our network includes thousands of properties in major cities and towns nationwide. When you apply, just tell us where you want to live, and we'll connect you with specialists in that area.",
    },
    {
      question: "Do I get my money back if I'm not approved?",
      answer:
        "If you don't meet our basic eligibility requirements and we determine we cannot help you, we'll discuss your situation. However, our 30-Day Move-In Money-Back Guarantee applies after you ARE approved—if we can't help you move into a place within 30 days of approval (and you've cooperated with the process), we'll refund your $20. See our Policies page for full details.",
    },
    {
      question: "What documents do I need?",
      answer:
        "You'll need: (1) A valid government-issued ID (driver's license, passport, or state ID), (2) Last 2-3 months of bank statements, (3) Recent pay stubs or proof of income (W-2, tax returns, benefit statements, etc.), and (4) References (typically 2 personal or professional references). Make sure all documents are clear, legible, and up-to-date.",
    },
    {
      question: "What credit score do I need?",
      answer:
        "There's no single minimum credit score requirement because different landlords have different criteria. That said, having a score above 600 definitely helps. If your credit score is lower, don't worry—we work with landlords who consider other factors like income, rental history, and references. Be honest about your credit situation when you apply so we can match you with the right properties.",
    },
    {
      question: "Can you help if I have an eviction?",
      answer:
        "It depends on the circumstances. If you have an old eviction (5+ years ago) or an eviction due to circumstances beyond your control, we may still be able to help. Active or recent serious evictions make it more challenging, but not necessarily impossible. Be upfront about your situation when you apply, and we'll do our best to find landlords willing to work with you.",
    },
    {
      question: "How long does it take to move in?",
      answer:
        "Our guarantee is that we'll help you move in within 30 days after approval, or we'll refund your money. In reality, many of our customers find a place and move in within 2-3 weeks. The timeline depends on factors like availability in your desired area, your budget, and how quickly you respond to matches. The faster you communicate with your specialist, the faster you'll move in!",
    },
    {
      question: "What if I change my mind about where I want to live?",
      answer:
        "We understand plans change! Just contact your rental specialist and let them know your new preferences. As long as you're still actively looking for housing and cooperating with the process, we'll work with you. However, if you decide to stop your housing search entirely or move out of the areas we serve, the money-back guarantee would not apply.",
    },
    {
      question: "How is this different from Zillow or Apartments.com?",
      answer:
        "Great question! Sites like Zillow and Apartments.com are listing platforms where you search and apply on your own. Each application typically costs $50-150. Rent EZ is different—you apply ONCE for $20, and WE connect you with rental specialists who have relationships with landlords. They match you with properties and submit your application, dramatically improving your approval chances and saving you hundreds in wasted application fees.",
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about Rent EZ
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="text-center space-y-6 py-12 mt-12 bg-hero-gradient rounded-lg">
          <h2 className="text-3xl font-bold">Still have questions?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our team is here to help. Contact us or start your application—we'll guide you through
            every step!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/apply">Apply Now – $20</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
