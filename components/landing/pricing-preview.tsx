'use client';

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check, Sparkles } from "lucide-react"

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying it out",
    features: ["3 interviews/month", "5 iterations/month", "Basic AI generation", "Community access"],
    cta: "Get Started",
    href: "/onboarding",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For active job seekers",
    features: ["25 interviews/month", "50 iterations/month", "Advanced analogies", "Export to PDF", "Priority support"],
    cta: "Start Free Trial",
    href: "/onboarding?plan=pro",
    featured: true,
  },
  {
    name: "Max",
    price: "$39",
    period: "/month",
    description: "For power users",
    features: ["100 interviews/month", "500 iterations/month", "BYOK option", "API access", "Custom integrations"],
    cta: "Contact Us",
    href: "/onboarding?plan=max",
  },
]

export function PricingPreview() {
  return (
    <section className="py-24 px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 border border-border bg-background px-4 py-2 mb-6 text-sm">
            <span className="text-muted-foreground">Pricing</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-mono text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground">Start free, upgrade when you need more power.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              className={`relative bg-background border p-8 flex flex-col ${
                tier.featured 
                  ? 'border-primary shadow-lg scale-105 z-10' 
                  : 'border-border'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 text-xs font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="font-mono text-foreground mb-1 text-lg">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-mono text-foreground">{tier.price}</span>
                  {tier.period && <span className="text-muted-foreground text-sm">{tier.period}</span>}
                </div>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-5 h-5 bg-secondary flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-foreground" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link href={tier.href}>
                <Button 
                  variant={tier.featured ? "default" : "outline"} 
                  className={`w-full ${!tier.featured ? 'bg-transparent' : ''}`}
                >
                  {tier.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
