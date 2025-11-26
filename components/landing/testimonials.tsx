'use client';

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    quote: "The analogy engine is incredible. It explained system design concepts in a way that finally clicked for me.",
    author: "Sarah K.",
    role: "Senior Frontend Engineer",
    company: "Hired at FAANG",
    rating: 5,
  },
  {
    quote: "I prepped for 3 days using SyntaxState and got an offer. The personalized content was exactly what I needed.",
    author: "Marcus T.",
    role: "Full Stack Developer", 
    company: "Hired at Series B Startup",
    rating: 5,
  },
  {
    quote: "The rapid-fire questions helped me practice thinking on my feet. Game changer for behavioral rounds.",
    author: "Priya M.",
    role: "Backend Engineer",
    company: "Hired at Fintech",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-24 px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 border border-border bg-background px-4 py-2 mb-6 text-sm">
            <span className="text-muted-foreground">Success Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-mono text-foreground mb-4">
            Developers love SyntaxState
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join thousands of engineers who've landed their dream jobs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              className="bg-background border border-border p-8 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Quote className="w-8 h-8 text-primary/20 absolute top-6 right-6" />
              
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              <div className="pt-4 border-t border-border">
                <div className="font-mono text-foreground">{testimonial.author}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                <div className="text-sm text-primary mt-1">{testimonial.company}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
