import { primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";

export function ModalActions({ pending, submitLabel, onCancel }: { pending: boolean; submitLabel: string; onCancel: () => void }) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button type="button" disabled={pending} onClick={onCancel} className={secondaryButtonClassName}>
        Cancelar
      </button>
      <button type="submit" disabled={pending} className={primaryButtonClassName}>
        {pending ? "Salvando..." : submitLabel}
      </button>
    </div>
  );
}
