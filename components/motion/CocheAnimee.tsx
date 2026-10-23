"use client";

import { motion } from "motion/react";

export default function CocheAnimee() {
  return (
    <motion.span
      className="merci-icone"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <motion.path d="M5 12l4 4 10-10" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }} />
      </svg>
    </motion.span>
  );
}
