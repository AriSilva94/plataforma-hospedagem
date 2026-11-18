import type { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { ChoiceGroup, optionsFrom } from "@/components/owner/choice-group";
import { cleaningFrequencyLabels, cleaningSummary, smokingPolicyLabels, type CleaningFrequency, type SmokingPolicy } from "@/lib/properties";
import type { HouseServicesInput } from "@/lib/owner-forms";

const cleanerOptions = [
  { value: "yes", label: "Com faxineira" },
  { value: "no", label: "Sem faxineira" },
];

export function HouseServicesFields<T extends FieldValues & HouseServicesInput>({
  register,
  hasCleaner,
  inherited,
}: {
  register: UseFormRegister<T>;
  hasCleaner: HouseServicesInput["hasCleaner"];
  inherited?: { hasCleaner: boolean | null; cleaningFrequency: CleaningFrequency | null; smokingPolicy: SmokingPolicy | null };
}) {
  const inheritedCleaning = inherited ? cleaningSummary(inherited.hasCleaner, inherited.cleaningFrequency) : null;
  const inheritedSmoking = inherited?.smokingPolicy ? smokingPolicyLabels[inherited.smokingPolicy] : null;
  const inheritOption = (detail: string | null) => ({ value: "", label: detail ? `Padrão do imóvel: ${detail}` : "Padrão do imóvel" });

  return (
    <div className="flex flex-col gap-4">
      <ChoiceGroup
        id="house-services-cleaner"
        legend="Faxineira"
        type="radio"
        options={inherited ? [inheritOption(inheritedCleaning), ...cleanerOptions] : cleanerOptions}
        registration={register("hasCleaner" as Path<T>)}
      />
      {hasCleaner === "yes" ? (
        <ChoiceGroup
          id="house-services-frequency"
          legend="Frequência da faxina"
          type="radio"
          options={optionsFrom(cleaningFrequencyLabels)}
          registration={register("cleaningFrequency" as Path<T>)}
        />
      ) : null}
      <ChoiceGroup
        id="house-services-smoking"
        legend="Fumantes"
        type="radio"
        options={inherited ? [inheritOption(inheritedSmoking), ...optionsFrom(smokingPolicyLabels)] : optionsFrom(smokingPolicyLabels)}
        registration={register("smokingPolicy" as Path<T>)}
      />
    </div>
  );
}
