"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { FormFeedback } from "@/components/form-feedback";
import { FormActions } from "@/components/owner/form-actions";
import { SavedNotice } from "@/components/owner/saved-notice";
import { UnsavedChangesGuard } from "@/components/owner/unsaved-changes-guard";
import { ChoiceGroup, optionsFrom } from "@/components/owner/choice-group";
import { FieldError } from "@/components/owner/field-error";
import { CharacterCount, FieldHint } from "@/components/owner/field-hint";
import { OptionalDetails } from "@/components/owner/optional-details";
import { fieldClassName, labelClassName, primaryButtonClassName } from "@/components/owner/styles";
import {
  propertyGeneralSchema,
  propertyGuidedGeneralSchema,
  type PropertyGeneralInput,
  type PropertyGeneralValues,
} from "@/lib/owner-forms";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import {
  propertyFeatureGroups,
  propertyFeatureLabels,
  propertyTypeLabels,
  type PropertyDetail,
} from "@/lib/properties";
import { setupStepHref } from "@/lib/setup-steps";

function detailsSummary(property?: PropertyDetail): string {
  if (!property) return "Regras da casa, informações úteis e características.";
  const parts = [
    property.houseRules ? "regras da casa" : null,
    property.generalInfo ? "informações úteis" : null,
    property.features.length > 0 ? `${property.features.length} ${property.features.length === 1 ? "característica" : "características"}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? `Preenchido: ${parts.join(", ")}.` : "Regras da casa, informações úteis e características.";
}

export function PropertyGeneralForm({ property, guided }: { property?: PropertyDetail; guided?: { nextHref: string } }) {
  const router = useRouter();
  const isGuided = !property || Boolean(guided);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const { register, handleSubmit, control, getValues, reset, formState } = useForm<PropertyGeneralInput, unknown, PropertyGeneralValues>({
    resolver: zodResolver(isGuided ? propertyGuidedGeneralSchema : propertyGeneralSchema),
    defaultValues: {
      title: property?.title ?? "",
      type: property?.type,
      description: property?.description ?? "",
      houseRules: property?.houseRules ?? "",
      generalInfo: property?.generalInfo ?? "",
      features: property?.features ?? [],
    },
    mode: "onBlur",
  });
  const { errors, isSubmitting, isDirty } = formState;
  const editing = Boolean(property) && !guided;
  const published = Boolean(property) && property?.status !== "DRAFT";
  const description = useWatch({ control, name: "description" });
  const detailsHaveErrors = Boolean(errors.houseRules || errors.generalInfo);

  async function save(values: PropertyGeneralValues) {
    setError(undefined);
    setMessage(undefined);
    try {
      const saved = await sendApiRequest(property ? `/owner/properties/${property.id}` : "/owner/properties", {
        method: property ? "PATCH" : "POST",
        body: JSON.stringify(values),
      });
      if (property) {
        if (guided) {
          router.push(guided.nextHref);
          return;
        }
        setMessage("Informações salvas.");
        reset(getValues());
        router.refresh();
        return;
      }
      const id = typeof saved === "object" && saved !== null && "id" in saved ? String(saved.id) : undefined;
      router.push(id ? setupStepHref(id, "endereco") : "/meus-imoveis");
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(save)} className="flex flex-col gap-6 py-8">
      <div className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <label htmlFor="property-title" className={labelClassName}>Título do anúncio</label>
          <input
            id="property-title"
            {...register("title")}
            placeholder="Ex.: Casa com 4 quartos perto do metrô"
            maxLength={120}
            aria-invalid={errors.title ? "true" : undefined}
            aria-describedby={`property-title-hint${errors.title ? " property-title-error" : ""}`}
            className={fieldClassName}
          />
          <FieldHint id="property-title-hint">É o que o hóspede lê primeiro. Mencione o tipo de imóvel e a região.</FieldHint>
          <FieldError id="property-title-error" message={errors.title?.message} />
        </div>
        <div>
          <label htmlFor="property-type" className={labelClassName}>Tipo do imóvel</label>
          <select
            id="property-type"
            {...register("type")}
            aria-invalid={errors.type ? "true" : undefined}
            aria-describedby={errors.type ? "property-type-error" : undefined}
            className={fieldClassName}
          >
            <option value="">Selecione</option>
            {optionsFrom(propertyTypeLabels).map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <FieldError id="property-type-error" message={errors.type?.message} />
        </div>
      </div>

      <div>
        <label htmlFor="property-description" className={labelClassName}>
          Descrição do imóvel
        </label>
        <textarea
          id="property-description"
          rows={5}
          {...register("description")}
          placeholder="Apresente o imóvel, o ambiente e o que torna a estadia confortável."
          aria-invalid={errors.description ? "true" : undefined}
          aria-describedby={`property-description-hint property-description-count${errors.description ? " property-description-error" : ""}`}
          className={fieldClassName}
        />
        <FieldHint id="property-description-hint">
          {published
            ? "Obrigatória: um imóvel publicado precisa manter a descrição."
            : "Obrigatória para publicar. Fale do ambiente, da vizinhança e do que está incluso."}
        </FieldHint>
        <CharacterCount id="property-description-count" length={description.length} max={5000} />
        <FieldError id="property-description-error" message={errors.description?.message} />
      </div>

      <OptionalDetails
        title="Mais detalhes"
        description={detailsSummary(property)}
        forceOpen={detailsHaveErrors}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="property-rules" className={labelClassName}>Regras da casa</label>
            <textarea
              id="property-rules"
              rows={4}
              {...register("houseRules")}
              placeholder="Ex.: silêncio após 22h, visitas com aviso prévio."
              aria-invalid={errors.houseRules ? "true" : undefined}
              aria-describedby={errors.houseRules ? "property-rules-error" : undefined}
              className={fieldClassName}
            />
            <FieldError id="property-rules-error" message={errors.houseRules?.message} />
          </div>
          <div>
            <label htmlFor="property-info" className={labelClassName}>Informações úteis ao hóspede</label>
            <textarea
              id="property-info"
              rows={4}
              {...register("generalInfo")}
              placeholder="Ex.: check-in a partir das 14h, ponto de ônibus a 5 min."
              aria-invalid={errors.generalInfo ? "true" : undefined}
              aria-describedby={errors.generalInfo ? "property-info-error" : undefined}
              className={fieldClassName}
            />
            <FieldError id="property-info-error" message={errors.generalInfo?.message} />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-xs leading-relaxed text-(--gray)">Marque o que o imóvel oferece. Os hóspedes veem isso no anúncio.</p>
          {propertyFeatureGroups.map((group) => (
            <ChoiceGroup
              key={group.id}
              id={`property-features-${group.id}`}
              legend={group.legend}
              type="checkbox"
              options={group.features.map((feature) => ({ value: feature, label: propertyFeatureLabels[feature] }))}
              registration={register("features")}
            />
          ))}
        </div>
      </OptionalDetails>

      {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
      {message && property ? <SavedNotice message={message} propertyId={property.id} showPublicLink={property.status === "ACTIVE"} /> : null}

      <FormActions>
        <button type="submit" disabled={isSubmitting || (editing && !isDirty)} className={primaryButtonClassName}>
          {isSubmitting ? "Salvando..." : isGuided ? "Salvar e continuar" : "Salvar informações"}
        </button>
        {editing && isDirty ? <span className="text-sm text-(--warning)">Alterações não salvas</span> : null}
      </FormActions>
      {!property ? <p className="text-xs text-(--gray)">Você poderá editar tudo depois. O imóvel só aparece para hóspedes quando for publicado.</p> : null}
      <UnsavedChangesGuard dirty={isDirty && !isSubmitting} />
    </form>
  );
}
