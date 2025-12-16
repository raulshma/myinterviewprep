"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface NavParticlesProps {
  direction: "top" | "bottom";
}

export function NavParticles({ direction }: NavParticlesProps) {
  // Deterministic particles
  const particles = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: `${((i * 13 + 7) % 80) + 10}%`, // Keep away from extreme edges
      size: ((i * 5) % 4) + 2,
      delay: (i * 0.1) % 0.4,
      duration: 0.6 + ((i * 0.2) % 0.5),
      // Varying opacity for depth
      opacity: 0.4 + ((i * 0.1) % 0.6),
    }));
  }, []);

  const isTop = direction === "top";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl z-0">
      {/* 1. Gradient Curtain / Flow Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"
        initial={{ y: isTop ? "-100%" : "100%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          // Reverse gradient for bottom direction
          transform: isTop ? "none" : "scaleY(-1)",
        }}
      />

      {/* 2. Main "Energy Front" - a brighter line moving through */}
      <motion.div
         className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent blur-sm"
         initial={{ top: isTop ? "0%" : "100%", opacity: 0 }}
         animate={{ top: isTop ? "120%" : "-20%", opacity: [0, 1, 0] }}
         transition={{ duration: 0.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.2 }}
      />

      {/* 3. Sparkle Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          // Using a rhombus/star shape via clip-path or just a glowy circle
          className="absolute bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            boxShadow: "0 0 4px currentColor",
          }}
          initial={{
            top: isTop ? "-10%" : "110%",
            opacity: 0,
            scale: 0,
          }}
          animate={{
            top: isTop ? "120%" : "-20%",
            opacity: [0, p.opacity, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
            repeatDelay: 0.1,
          }}
        />
      ))}
    </div>
  );
}
