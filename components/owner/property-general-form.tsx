"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { Combobox, type ComboboxOption } from "@/components/combobox";
import { FormActions, FormStatus } from "@/components/owner/form-actions";
import { UnsavedChangesGuard } from "@/components/owner/unsaved-changes-guard";
import { ChoiceGroup, optionsFrom } from "@/components/owner/choice-group";
import { FieldError } from "@/components/field-error";
import { PropertyTypeTag } from "@/components/property-type-tag";
import { LuCigaretteOff, LuHouse, LuNotebookPen } from "react-icons/lu";
import { CharacterCount, FieldHint } from "@/components/owner/field-hint";
import { FormSection } from "@/components/owner/form-section";
import { HouseServicesFields } from "@/components/owner/house-services-fields";
import { fieldClassName, labelClassName, primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { propertyFeatureIcons } from "@/lib/amenity-icons";
import {
  houseServicesDefaults,
  houseServicesError,
  houseServicesPayload,
  propertyGeneralSchema,
  type PropertyGeneralInput,
  type PropertyGeneralValues,
} from "@/lib/owner-forms";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import {
  propertyFeatureGroups,
  propertyFeatureLabels,
  propertyTypeLabels,
  propertyTypes,
  type PropertyDetail,
} from "@/lib/properties";

export function generalDefaults(property?: PropertyDetail) {
  return {
    title: property?.title ?? "",
    type: property?.type,
    description: property?.description ?? "",
    houseRules: property?.houseRules ?? "",
    generalInfo: property?.generalInfo ?? "",
    features: property?.features ?? [],
    ...houseServicesDefaults(property),
  };
}

const propertyTypeOptions = optionsFrom(propertyTypeLabels);

function renderPropertyTypeOption(option: ComboboxOption) {
  const type = propertyTypes.find((candidate) => candidate === option.value);
  return type ? <PropertyTypeTag compact type={type} /> : option.label;
}

export function PropertyBasicFields({ published }: { published: boolean }) {
  const { register, control, formState } = useFormContext<PropertyGeneralInput>();
  const { errors } = formState;
  const description = useWatch({ control, name: "description" });

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
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
          <label id="property-type-label" htmlFor="property-type" className={labelClassName}>Tipo do imóvel</label>
          <div className="mt-1.5">
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Combobox
                  ref={field.ref}
                  id="property-type"
                  labelId="property-type-label"
                  value={field.value ?? ""}
                  options={propertyTypeOptions}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Selecione"
                  searchLabel="Buscar tipo"
                  emptyMessage="Nenhum tipo encontrado."
                  clearable={false}
                  size="compact"
                  align="end"
                  invalid={Boolean(errors.type)}
                  describedBy={errors.type ? "property-type-error" : undefined}
                  renderOption={renderPropertyTypeOption}
                />
              )}
            />
          </div>
          <FieldError id="property-type-error" message={errors.type?.message} />
        </div>
      </div>

      <div>
        <label htmlFor="property-description" className={labelClassName}>
          Descrição do imóvel
        </label>
        <textarea
          id="property-description"
          rows={4}
          {...register("description")}
          placeholder="Apresente o imóvel, o ambiente e o que torna a estadia confortável."
          aria-invalid={errors.description ? "true" : undefined}
          aria-describedby={`property-description-hint property-description-count${errors.description ? " property-description-error" : ""}`}
          className={fieldClassName}
        />
        <div className="flex items-start justify-between gap-4">
          <FieldHint id="property-description-hint">
            {published
              ? "Obrigatória: um imóvel publicado precisa manter a descrição."
              : "Obrigatória para publicar. Fale do ambiente, da vizinhança e do que está incluso."}
          </FieldHint>
          <CharacterCount id="property-description-count" length={description.length} max={5000} />
        </div>
        <FieldError id="property-description-error" message={errors.description?.message} />
      </div>
    </>
  );
}

export function PropertyDetailsFields() {
  const { register, formState } = useFormContext<PropertyGeneralInput>();
  const { errors } = formState;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="property-rules" className={labelClassName}>Regras da casa</label>
          <textarea
            id="property-rules"
            rows={3}
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
            rows={3}
            {...register("generalInfo")}
            placeholder="Ex.: check-in a partir das 14h, ponto de ônibus a 5 min."
            aria-invalid={errors.generalInfo ? "true" : undefined}
            aria-describedby={errors.generalInfo ? "property-info-error" : undefined}
            className={fieldClassName}
          />
          <FieldError id="property-info-error" message={errors.generalInfo?.message} />
        </div>
      </div>

      {propertyFeatureGroups.map((group) => (
        <ChoiceGroup
          key={group.id}
          id={`property-features-${group.id}`}
          legend={group.legend}
          type="checkbox"
          options={group.features.map((feature) => ({ value: feature, label: propertyFeatureLabels[feature], icon: propertyFeatureIcons[feature] }))}
          registration={register("features")}
        />
      ))}
    </>
  );
}

export function PropertyGeneralForm({ property }: { property: PropertyDetail }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const form = useForm<PropertyGeneralInput, unknown, PropertyGeneralValues>({
    resolver: zodResolver(propertyGeneralSchema),
    defaultValues: generalDefaults(property),
    mode: "onBlur",
  });
  const { register, handleSubmit, control, getValues, reset, formState } = form;
  const { isSubmitting, isDirty } = formState;
  const published = property.status !== "DRAFT";
  const hasCleaner = useWatch({ control, name: "hasCleaner" });

  async function save(values: PropertyGeneralValues) {
    setError(undefined);
    setMessage(undefined);
    const servicesError = houseServicesError(values);
    if (servicesError) {
      setError(servicesError);
      return;
    }
    try {
      await sendApiRequest(`/owner/properties/${property.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...values, ...houseServicesPayload(values) }),
      });
      setMessage("Informações salvas.");
      reset(getValues());
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    }
  }

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={handleSubmit(save)} className="flex flex-col pt-6">
        <FormSection id="property-basic-heading" icon={LuHouse} title="Sobre o imóvel" description="Título, tipo e descrição exibidos no anúncio.">
          <PropertyBasicFields published={published} />
        </FormSection>

        <FormSection
          id="property-details-heading"
          icon={LuNotebookPen}
          tone="champagne"
          title="Regras e características"
          description="Recomendado. Marque o que o imóvel oferece; os hóspedes veem isso no anúncio."
        >
          <PropertyDetailsFields />
        </FormSection>

        <FormSection
          id="property-services-heading"
          icon={LuCigaretteOff}
          tone="champagne"
          title="Faxina e fumantes"
          description="Vale para todos os quartos. Cada quarto pode ter uma regra própria."
        >
          <HouseServicesFields register={register} hasCleaner={hasCleaner} />
        </FormSection>

        <FormActions>
          <button type="submit" disabled={isSubmitting || !isDirty} className={primaryButtonClassName}>
            {isSubmitting ? "Salvando..." : "Salvar informações"}
          </button>
          {isDirty ? (
            <button type="button" disabled={isSubmitting} onClick={() => reset()} className={secondaryButtonClassName}>
              Descartar
            </button>
          ) : null}
          <FormStatus error={error} saved={message} dirty={isDirty} />
        </FormActions>
        <UnsavedChangesGuard dirty={isDirty && !isSubmitting} />
      </form>
    </FormProvider>
  );
}
