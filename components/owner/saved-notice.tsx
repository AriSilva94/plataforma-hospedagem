import Link from "next/link";
import { FormFeedback } from "@/components/form-feedback";
import { secondaryButtonClassName } from "@/components/owner/styles";

export function SavedNotice({
  message,
  propertyId,
  showPublicLink = false,
}: {
  message: string;
  propertyId: string;
  showPublicLink?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <FormFeedback tone="success">{message}</FormFeedback>
      <div className="flex flex-wrap gap-3">
        <Link href={`/meus-imoveis/${propertyId}`} className={secondaryButtonClassName}>
          Voltar ao imóvel
        </Link>
        {showPublicLink ? (
          <Link href={`/imoveis/${propertyId}?previa=1`} target="_blank" className={secondaryButtonClassName}>
            Ver como o hóspede vê
          </Link>
        ) : null}
      </div>
    </div>
  );
}
