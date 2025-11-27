'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function DashboardHero() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8"
    >
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
        {greeting}, Developer.
      </h1>
      <p className="text-lg text-muted-foreground">
        Ready to ace your next interview?
      </p>
    </motion.div>
  );
}
