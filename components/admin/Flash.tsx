import Icone from "@/components/Icone";

export default function Flash({ message, type }: { message?: string; type?: string }) {
  if (!message) return null;
  const classe = type === "danger" ? "alert-error" : type === "info" ? "alert-info" : "alert-success";
  const icone = type === "danger" ? "alert" : type === "info" ? "info" : "check";
  return (
    <div className={`alert ${classe}`} role="status">
      <Icone nom={icone} />
      <span>{message}</span>
    </div>
  );
}
