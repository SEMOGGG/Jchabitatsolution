"use client";

import { useFormStatus } from "react-dom";

export default function BoutonEnvoi({
  children,
  className = "btn btn-primary",
  texteEnvoi = "Enregistrement…",
}: {
  children: React.ReactNode;
  className?: string;
  texteEnvoi?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? texteEnvoi : children}
    </button>
  );
}
