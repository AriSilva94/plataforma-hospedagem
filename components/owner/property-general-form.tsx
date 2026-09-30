"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormFeedback } from "@/components/form-feedback";
import { ChoiceGroup, optionsFrom } from "@/components/owner/choice-group";
import { FieldError } from "@/components/owner/field-error";
import { fieldClassName, labelClassName, primaryButtonClassName } from "@/components/owner/styles";
import {
  propertyGeneralSchema,
  type PropertyGeneralInput,
  type PropertyGeneralValues,
} from "@/lib/owner-forms";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { propertyFeatureLabels, propertyTypeLabels, type PropertyDetail } from "@/lib/properties";

export function PropertyGeneralForm({ property }: { property?: PropertyDetail }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const { register, handleSubmit, formState } = useForm<PropertyGeneralInput, unknown, PropertyGeneralValues>({
    resolver: zodResolver(propertyGeneralSchema),
    defaultValues: {
      title: property?.title ?? "",
      type: property?.type,
      description: property?.description ?? "",
      houseRules: property?.houseRules ?? "",
      generalInfo: property?.generalInfo ?? "",
      features: property?.features ?? [],
      featured: property?.featured ?? false,
    },
    mode: "onBlur",
  });
  const { errors, isSubmitting } = formState;

  async function save(values: PropertyGeneralValues) {
    setError(undefined);
    setMessage(undefined);
    try {
      const saved = await sendApiRequest(property ? `/owner/properties/${property.id}` : "/owner/properties", {
        method: property ? "PATCH" : "POST",
        body: JSON.stringify(values),
      });
      if (property) {
        setMessage("Informações gerais salvas.");
        router.refresh();
        return;
      }
      const id = typeof saved === "object" && saved !== null && "id" in saved ? String(saved.id) : undefined;
      router.push(id ? `/meus-imoveis/${id}/editar?secao=localizacao` : "/meus-imoveis");
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
            placeholder="Ex.: Casa ampla na Asa Norte"
            aria-invalid={errors.title ? "true" : undefined}
            aria-describedby={errors.title ? "property-title-error" : undefined}
            className={fieldClassName}
          />
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
        <label htmlFor="property-description" className={labelClassName}>Descrição</label>
        <textarea
          id="property-description"
          rows={5}
          {...register("description")}
          placeholder="Apresente o imóvel, o ambiente e o que torna a estadia confortável."
          aria-invalid={errors.description ? "true" : undefined}
          aria-describedby={errors.description ? "property-description-error" : undefined}
          className={fieldClassName}
        />
        <FieldError id="property-description-error" message={errors.description?.message} />
      </div>

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
          <label htmlFor="property-info" className={labelClassName}>Informações gerais</label>
          <textarea
            id="property-info"
            rows={4}
            {...register("generalInfo")}
            placeholder="Ex.: transporte próximo, comércio no entorno, horários de entrada."
            aria-invalid={errors.generalInfo ? "true" : undefined}
            aria-describedby={errors.generalInfo ? "property-info-error" : undefined}
            className={fieldClassName}
          />
          <FieldError id="property-info-error" message={errors.generalInfo?.message} />
        </div>
      </div>

      <ChoiceGroup
        id="property-features"
        legend="Características do imóvel"
        type="checkbox"
        options={optionsFrom(propertyFeatureLabels)}
        registration={register("features")}
      />

      <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-(--line-strong) bg-(--surface) p-5 has-focus-visible:ring-2 has-focus-visible:ring-(--blue-light)">
        <span>
          <span className="block font-bold text-white">Destacar na home</span>
          <span className="mt-1 block text-sm leading-relaxed text-(--gray)">
            Exibe o imóvel em &quot;Locais em destaque&quot; quando estiver ativo e com quarto disponível.
          </span>
        </span>
        <input type="checkbox" role="switch" {...register("featured")} className="peer sr-only" />
        <span
          aria-hidden="true"
          className="relative mt-1 h-6 w-11 shrink-0 rounded-full bg-(--surface-raised) ring-1 ring-(--line-strong) transition-colors peer-checked:bg-(--blue) after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
        />
      </label>

      {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
      {message ? <FormFeedback tone="success">{message}</FormFeedback> : null}

      <div>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClassName}>
          {isSubmitting ? "Salvando..." : property ? "Salvar informações" : "Criar rascunho"}
        </button>
      </div>
    </form>
  );
}
