'use client';

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Eye, Copy, ArrowRight } from "lucide-react"
import Link from "next/link"

const communityPreps = [
  {
    role: "Senior Frontend Engineer",
    company: "Tech Startup",
    topics: ["React", "System Design", "TypeScript"],
    views: 1240,
    daysAgo: 2,
  },
  {
    role: "Backend Developer",
    company: "Enterprise",
    topics: ["Node.js", "PostgreSQL", "Microservices"],
    views: 890,
    daysAgo: 5,
  },
  {
    role: "Full Stack Engineer",
    company: "Fintech",
    topics: ["Next.js", "GraphQL", "AWS"],
    views: 2100,
    daysAgo: 1,
  },
  {
    role: "DevOps Engineer",
    company: "SaaS Company",
    topics: ["Kubernetes", "CI/CD", "Terraform"],
    views: 650,
    daysAgo: 7,
  },
]

export function CommunityFeed() {
  return (
    <section id="community" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <div className="inline-flex items-center gap-2 border border-border bg-secondary/50 px-4 py-2 mb-6 text-sm">
              <span className="text-muted-foreground">Community</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-mono text-foreground mb-4">
              Community Preps
            </h2>
            <p className="text-muted-foreground max-w-xl">
              See what others are preparing for. Clone and customize for your own interviews.
            </p>
          </div>
          <Link href="/community">
            <Button variant="outline" className="bg-transparent group">
              View All
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {communityPreps.map((prep, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-mono text-foreground mb-1 group-hover:text-primary transition-colors">
                        {prep.role}
                      </h3>
                      <p className="text-sm text-muted-foreground">{prep.company}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {prep.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {prep.daysAgo}d ago
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {prep.topics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="font-mono text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
                    >
                      <Copy className="w-3 h-3 mr-2" />
                      Clone Prep
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
