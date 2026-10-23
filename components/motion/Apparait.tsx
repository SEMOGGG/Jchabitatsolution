"use client";

import { motion, type Variants } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

export const varianteMontee: Variants = {
  cache: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function Apparait({
  children,
  className,
  delai = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delai?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const Composant = motion[as];
  return (
    <Composant
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE, delay: delai }}
    >
      {children}
    </Composant>
  );
}

export function Cascade({
  children,
  className,
  intervalle = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  intervalle?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="cache"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ cache: {}, visible: { transition: { staggerChildren: intervalle } } }}
    >
      {children}
    </motion.div>
  );
}

export function ElementCascade({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={varianteMontee}>
      {children}
    </motion.div>
  );
}
