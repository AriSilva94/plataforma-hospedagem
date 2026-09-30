"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LuEyeOff, LuMapPin } from "react-icons/lu";
import { FormFeedback } from "@/components/form-feedback";
import { FormActions } from "@/components/owner/form-actions";
import { SavedNotice } from "@/components/owner/saved-notice";
import { UnsavedChangesGuard } from "@/components/owner/unsaved-changes-guard";
import { FieldError } from "@/components/owner/field-error";
import { OptionalTag } from "@/components/owner/field-hint";
import { fieldClassName, labelClassName, primaryButtonClassName } from "@/components/owner/styles";
import {
  propertyGuidedLocationSchema,
  propertyLocationSchema,
  type PropertyLocationInput,
  type PropertyLocationValues,
} from "@/lib/owner-forms";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { brazilianStates, postalCodeAddressSchema, type PropertyDetail } from "@/lib/properties";

type TextField = Exclude<keyof PropertyLocationInput, "state" | "referencePoints">;

const addressFields: { name: TextField; label: string; placeholder: string; autoComplete: string; className: string }[] = [
  { name: "postalCode", label: "CEP", placeholder: "00000-000", autoComplete: "postal-code", className: "sm:col-span-2" },
  { name: "street", label: "Rua / avenida", placeholder: "Ex.: Rua das Flores", autoComplete: "address-line1", className: "sm:col-span-4" },
  { name: "number", label: "Número", placeholder: "Ex.: 120", autoComplete: "off", className: "sm:col-span-2" },
  { name: "complement", label: "Complemento", placeholder: "Ex.: casa dos fundos, bloco B", autoComplete: "address-line2", className: "sm:col-span-4" },
  { name: "neighborhood", label: "Bairro", placeholder: "Ex.: Centro", autoComplete: "address-level3", className: "sm:col-span-3" },
  { name: "city", label: "Cidade", placeholder: "Ex.: São Paulo", autoComplete: "address-level2", className: "sm:col-span-2" },
];

export function PropertyLocationForm({ property, guided }: { property: PropertyDetail; guided?: { nextHref: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [postalCodeStatus, setPostalCodeStatus] = useState<{ tone: "info" | "error"; text: string }>();
  const { register, handleSubmit, setValue, getValues, reset, setFocus, formState } = useForm<PropertyLocationInput, unknown, PropertyLocationValues>({
    resolver: zodResolver(guided ? propertyGuidedLocationSchema : propertyLocationSchema),
    defaultValues: {
      postalCode: property.postalCode ?? "",
      street: property.street ?? "",
      number: property.number ?? "",
      complement: property.complement ?? "",
      neighborhood: property.neighborhood ?? "",
      city: property.city ?? "",
      state: brazilianStates.find((state) => state === property.state) ?? "",
      referencePoints: property.referencePoints.join("\n"),
    },
    mode: "onBlur",
  });
  const { errors, isSubmitting, isDirty } = formState;

  function isOutdated(digits: string) {
    return getValues("postalCode").replace(/\D/g, "") !== digits;
  }

  async function lookupPostalCode(digits: string) {
    setPostalCodeStatus({ tone: "info", text: "Buscando endereço..." });
    try {
      const address = postalCodeAddressSchema.parse(await sendApiRequest(`/owner/postal-codes/${digits}`, { method: "GET" }));
      if (isOutdated(digits)) return;
      const fields = { street: address.street, neighborhood: address.neighborhood, city: address.city } as const;
      for (const [name, value] of Object.entries(fields) as [keyof typeof fields, string][]) {
        if (value) setValue(name, value, { shouldValidate: true, shouldDirty: true });
      }
      const state = brazilianStates.find((item) => item === address.state);
      if (state) setValue("state", state, { shouldValidate: true, shouldDirty: true });
      setPostalCodeStatus(undefined);
      setFocus(address.street ? "number" : "street");
    } catch (lookupError) {
      if (!isOutdated(digits)) setPostalCodeStatus({ tone: "error", text: toErrorMessage(lookupError) });
    }
  }

  function handlePostalCodeChange(rawValue: string) {
    const digits = rawValue.replace(/\D/g, "").slice(0, 8);
    setValue("postalCode", digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits);
    if (digits.length === 8) {
      void lookupPostalCode(digits);
      return;
    }
    setPostalCodeStatus(undefined);
  }

  async function save(values: PropertyLocationValues) {
    setError(undefined);
    setMessage(undefined);
    try {
      await sendApiRequest(`/owner/properties/${property.id}`, { method: "PATCH", body: JSON.stringify(values) });
      if (guided) {
        router.push(guided.nextHref);
        return;
      }
      setMessage("Localização salva.");
      reset(getValues());
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(save)} className="flex flex-col gap-8 py-8">
      <section aria-labelledby="private-address-heading">
        <div className="flex items-start gap-3">
          <LuEyeOff aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-(--blue-light)" />
          <div>
            <h2 id="private-address-heading" className="text-lg font-bold text-white">Endereço completo</h2>
            <p className="mt-1 text-sm leading-relaxed text-(--gray)">
              Informação privada. Não é exibida no anúncio público.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-6">
          {addressFields.map((field) => (
            <div key={field.name} className={field.className}>
              <label htmlFor={`location-${field.name}`} className={labelClassName}>
                {field.label}
                {field.name === "complement" ? <OptionalTag /> : null}
              </label>
              <input
                id={`location-${field.name}`}
                {...register(field.name, field.name === "postalCode" ? { onChange: (event) => handlePostalCodeChange(event.target.value) } : undefined)}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                inputMode={field.name === "postalCode" || field.name === "number" ? "numeric" : undefined}
                aria-invalid={errors[field.name] ? "true" : undefined}
                aria-describedby={errors[field.name] ? `location-${field.name}-error` : undefined}
                className={fieldClassName}
              />
              {field.name === "postalCode" && postalCodeStatus ? (
                <p
                  role={postalCodeStatus.tone === "error" ? "alert" : "status"}
                  className={`mt-2 text-xs leading-relaxed ${postalCodeStatus.tone === "error" ? "text-(--warning)" : "text-(--gray)"}`}
                >
                  {postalCodeStatus.text}
                </p>
              ) : null}
              <FieldError id={`location-${field.name}-error`} message={errors[field.name]?.message} />
            </div>
          ))}
          <div className="sm:col-span-1">
            <label htmlFor="location-state" className={labelClassName}>UF</label>
            <select
              id="location-state"
              {...register("state")}
              autoComplete="address-level1"
              aria-invalid={errors.state ? "true" : undefined}
              aria-describedby={errors.state ? "location-state-error" : undefined}
              className={fieldClassName}
            >
              <option value="">--</option>
              {brazilianStates.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <FieldError id="location-state-error" message={errors.state?.message} />
          </div>
        </div>
      </section>

      <section aria-labelledby="public-location-heading" className="border-t border-(--line) pt-8">
        <div className="flex items-start gap-3">
          <LuMapPin aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-(--blue-light)" />
          <div>
            <h2 id="public-location-heading" className="text-lg font-bold text-white">Localização aproximada</h2>
            <p className="mt-1 text-sm leading-relaxed text-(--gray)">
              No anúncio público aparecerão apenas bairro, cidade, UF e os pontos de referência abaixo.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <label htmlFor="location-reference-points" className={labelClassName}>
            Pontos de referência (um por linha)<OptionalTag />
          </label>
          <textarea
            id="location-reference-points"
            rows={4}
            {...register("referencePoints")}
            placeholder={"Ex.: 5 min do metrô Central\nPróximo à Universidade"}
            aria-invalid={errors.referencePoints ? "true" : undefined}
            aria-describedby={errors.referencePoints ? "location-reference-points-error" : undefined}
            className={fieldClassName}
          />
          <FieldError id="location-reference-points-error" message={errors.referencePoints?.message} />
        </div>
      </section>

      {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
      {message ? <SavedNotice message={message} propertyId={property.id} showPublicLink={property.status === "ACTIVE"} /> : null}

      <FormActions>
        <button type="submit" disabled={isSubmitting || (!guided && !isDirty)} className={primaryButtonClassName}>
          {isSubmitting ? "Salvando..." : guided ? "Salvar e continuar" : "Salvar localização"}
        </button>
        {!guided && isDirty ? <span className="text-sm text-(--warning)">Alterações não salvas</span> : null}
      </FormActions>
      <UnsavedChangesGuard dirty={isDirty && !isSubmitting} />
    </form>
  );
}
