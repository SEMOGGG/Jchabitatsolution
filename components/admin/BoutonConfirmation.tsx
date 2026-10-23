"use client";

import { useFormStatus } from "react-dom";

export default function BoutonConfirmation({
  children,
  confirmation,
  className = "btn btn-outline btn-sm",
  titre,
}: {
  children: React.ReactNode;
  confirmation: string;
  className?: string;
  titre?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      title={titre}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirmation)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
