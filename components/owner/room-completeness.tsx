import Link from "next/link";
import { LuArrowRight, LuCircleCheck } from "react-icons/lu";
import { CompletenessMeter } from "@/components/owner/completeness-meter";
import { cardClassName } from "@/components/owner/styles";
import { completenessHint } from "@/lib/completeness";
import type { CompletenessCriterion } from "@/lib/properties";

export function RoomCompleteness({ propertyId, roomId, score, missing }: { propertyId: string; roomId: string; score: number; missing: CompletenessCriterion[] }) {
  return (
    <section aria-labelledby="completeness-heading" className={`${cardClassName} mt-6`}>
      <h2 id="completeness-heading" className="sr-only">
        Completude do anúncio
      </h2>
      <CompletenessMeter score={score} />
      {missing.length === 0 ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-(--gray)">
          <LuCircleCheck aria-hidden="true" size={18} className="shrink-0 text-(--success)" />
          Todas as informações do anúncio foram preenchidas.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-(--gray)">Anúncios mais completos ajudam o hóspede a decidir. Você ainda pode:</p>
          <ul className="mt-2 flex flex-col gap-1">
            {missing.map((criterion) => {
              const hint = completenessHint(criterion, propertyId, roomId);
              return (
                <li key={criterion}>
                  <Link
                    href={hint.href}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-(--blue-light)"
                  >
                    {hint.label}
                    <LuArrowRight aria-hidden="true" size={14} className="shrink-0 text-(--blue-light)" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
