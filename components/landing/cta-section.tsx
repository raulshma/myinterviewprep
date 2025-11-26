'use client';

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Terminal } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="relative bg-card border border-border p-12 md:p-16 text-center overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50" />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 border border-border bg-background px-4 py-2 mb-6 text-sm">
              <Terminal className="w-4 h-4" />
              <span className="text-muted-foreground">Ready to start?</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-mono text-foreground mb-6 max-w-2xl mx-auto">
              Your next interview is waiting
            </h2>
            
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of developers who've transformed their interview prep. 
              Start free, no credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding">
                <Button size="lg" className="group">
                  Start Preparing Free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="bg-transparent">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
