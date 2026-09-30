import Link from "next/link";
import { LuCheck } from "react-icons/lu";
import type { PublishRequirement } from "@/lib/properties";
import { setupStepHref, setupSteps, type SetupStepId } from "@/lib/setup-steps";

export function SetupSteps({
  current,
  propertyId,
  missing,
}: {
  current: SetupStepId;
  propertyId?: string;
  missing: PublishRequirement[];
}) {
  const currentIndex = setupSteps.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Etapas do cadastro" className="mt-6">
      <p className="text-sm font-semibold text-(--blue-light)">
        Passo {currentIndex + 1} de {setupSteps.length} · {setupSteps[currentIndex].label}
      </p>
      <ol className="mt-3 grid grid-cols-5 gap-2">
        {setupSteps.map((step) => {
          const active = step.id === current;
          const done = propertyId !== undefined && step.requirement !== undefined && !missing.includes(step.requirement);
          const content = (
            <>
              <span
                aria-hidden="true"
                className={`block h-1.5 rounded-full ${done ? "bg-(--success)" : active ? "bg-(--blue)" : "bg-(--line-strong)"}`}
              />
              <span
                className={`mt-2 hidden items-center gap-1.5 text-xs font-semibold sm:flex ${active ? "text-white" : "text-(--gray)"}`}
              >
                {done ? <LuCheck aria-hidden="true" size={13} className="shrink-0 text-(--success)" /> : null}
                {step.label}
              </span>
              {done ? <span className="sr-only">Concluído</span> : null}
            </>
          );

          return (
            <li key={step.id}>
              {propertyId ? (
                <Link
                  href={setupStepHref(propertyId, step.id)}
                  aria-current={active ? "step" : undefined}
                  aria-label={step.label}
                  className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--blue-light)"
                >
                  {content}
                </Link>
              ) : (
                <div aria-current={active ? "step" : undefined} aria-label={step.label}>
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
