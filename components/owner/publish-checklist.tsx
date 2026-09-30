import Link from "next/link";
import { LuArrowRight, LuCircle, LuCircleCheck } from "react-icons/lu";
import { publishRequirements, type PublishRequirement } from "@/lib/properties";
import { requirementLabels, setupStepHref, stepForRequirement } from "@/lib/setup-steps";

export function PublishChecklist({ propertyId, missing }: { propertyId: string; missing: PublishRequirement[] }) {
  const done = publishRequirements.length - missing.length;
  const complete = missing.length === 0;

  return (
    <section aria-labelledby="publish-checklist-heading" className="rounded-2xl border border-(--line-strong) bg-(--surface-raised) p-5 sm:p-6">
      <h2 id="publish-checklist-heading" className="font-bold text-white">
        {complete ? "Tudo pronto para publicar" : "Falta pouco para publicar"}
      </h2>
      <p className="mt-1 text-sm text-(--gray)">
        {done} de {publishRequirements.length} itens concluídos
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {publishRequirements.map((requirement) => {
          const pending = missing.includes(requirement);
          return (
            <li key={requirement}>
              {pending ? (
                <Link
                  href={setupStepHref(propertyId, stepForRequirement(requirement))}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-(--blue-light)"
                >
                  <LuCircle aria-hidden="true" size={18} className="shrink-0 text-(--warning)" />
                  <span className="min-w-0 flex-1">
                    {requirementLabels[requirement]} <span className="sr-only">pendente</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-(--blue-light)">
                    Completar <LuArrowRight aria-hidden="true" size={14} />
                  </span>
                </Link>
              ) : (
                <p className="flex items-center gap-3 px-3 py-2.5 text-sm text-(--gray)">
                  <LuCircleCheck aria-hidden="true" size={18} className="shrink-0 text-(--success)" />
                  <span>
                    {requirementLabels[requirement]} <span className="sr-only">concluído</span>
                  </span>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
