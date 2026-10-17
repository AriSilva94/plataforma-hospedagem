"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Combobox } from "@/components/combobox";
import Link from "next/link";
import { LuArrowLeft, LuEyeOff, LuLoaderCircle, LuMapPin } from "react-icons/lu";
import { FormActions, FormStatus } from "@/components/owner/form-actions";
import { UnsavedChangesGuard } from "@/components/owner/unsaved-changes-guard";
import { FieldError } from "@/components/field-error";
import { OptionalTag } from "@/components/owner/field-hint";
import { fieldClassName, labelClassName, primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import {
  propertyGuidedLocationSchema,
  propertyLocationSchema,
  type PropertyLocationInput,
  type PropertyLocationValues,
} from "@/lib/owner-forms";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { brazilianStateOptions, brazilianStates, postalCodeAddressSchema, type PropertyDetail } from "@/lib/properties";

type TextField = Exclude<keyof PropertyLocationInput, "state" | "referencePoints">;

const addressFields: { name: TextField; label: string; placeholder: string; autoComplete: string; className: string }[] = [
  { name: "postalCode", label: "CEP", placeholder: "00000-000", autoComplete: "postal-code", className: "col-span-3" },
  { name: "street", label: "Rua / avenida", placeholder: "Ex.: Rua das Flores", autoComplete: "address-line1", className: "col-span-6 sm:col-span-7" },
  { name: "number", label: "Número", placeholder: "Ex.: 120", autoComplete: "off", className: "col-span-2" },
  { name: "complement", label: "Complemento", placeholder: "Ex.: casa dos fundos, bloco B", autoComplete: "address-line2", className: "col-span-4 sm:col-span-3" },
  { name: "neighborhood", label: "Bairro", placeholder: "Ex.: Centro", autoComplete: "address-level3", className: "col-span-6 sm:col-span-3" },
  { name: "city", label: "Cidade", placeholder: "Ex.: São Paulo", autoComplete: "address-level2", className: "col-span-3" },
];

function formatPostalCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function PropertyLocationForm({ property, guided }: { property: PropertyDetail; guided?: { nextHref: string; previousHref?: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [isLookingUpPostalCode, setIsLookingUpPostalCode] = useState(false);
  const [postalCodeError, setPostalCodeError] = useState<string>();
  const { register, control, handleSubmit, setValue, getValues, reset, setFocus, formState } = useForm<PropertyLocationInput, unknown, PropertyLocationValues>({
    resolver: zodResolver(guided ? propertyGuidedLocationSchema : propertyLocationSchema),
    defaultValues: {
      postalCode: formatPostalCode(property.postalCode ?? ""),
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
    setPostalCodeError(undefined);
    setIsLookingUpPostalCode(true);
    try {
      const address = postalCodeAddressSchema.parse(await sendApiRequest(`/owner/postal-codes/${digits}`, { method: "GET" }));
      if (isOutdated(digits)) return;
      const fields = { street: address.street, neighborhood: address.neighborhood, city: address.city } as const;
      for (const [name, value] of Object.entries(fields) as [keyof typeof fields, string][]) {
        if (value) setValue(name, value, { shouldValidate: true, shouldDirty: true });
      }
      const state = brazilianStates.find((item) => item === address.state);
      if (state) setValue("state", state, { shouldValidate: true, shouldDirty: true });
      flushSync(() => setIsLookingUpPostalCode(false));
      setFocus(address.street ? "number" : "street");
    } catch (lookupError) {
      if (isOutdated(digits)) return;
      setIsLookingUpPostalCode(false);
      setPostalCodeError(toErrorMessage(lookupError));
    }
  }

  function handlePostalCodeChange(rawValue: string) {
    const formatted = formatPostalCode(rawValue);
    const digits = formatted.replace("-", "");
    setValue("postalCode", formatted);
    if (digits.length === 8) {
      void lookupPostalCode(digits);
      return;
    }
    setIsLookingUpPostalCode(false);
    setPostalCodeError(undefined);
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
    <form noValidate onSubmit={handleSubmit(save)} className="flex flex-col gap-6 py-6">
      <section aria-labelledby="private-address-heading">
        <div className="flex items-start gap-3">
          <LuEyeOff aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-(--primary-text)" />
          <div>
            <h2 id="private-address-heading" className="text-lg font-bold text-(--text-primary)">Endereço completo</h2>
            <p className="mt-1 text-sm leading-relaxed text-(--text-secondary)">
              Informação privada. Não é exibida no anúncio público.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-6 gap-4 sm:grid-cols-12">
          {addressFields.map((field) => (
            <div key={field.name} className={field.className}>
              <label htmlFor={`location-${field.name}`} className={labelClassName}>
                {field.label}
                {field.name === "complement" ? <OptionalTag /> : null}
              </label>
              <div className="relative">
                <input
                  id={`location-${field.name}`}
                  {...register(field.name, field.name === "postalCode" ? { onChange: (event) => handlePostalCodeChange(event.target.value) } : undefined)}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  inputMode={field.name === "postalCode" || field.name === "number" ? "numeric" : undefined}
                  disabled={field.name !== "postalCode" && isLookingUpPostalCode}
                  aria-invalid={errors[field.name] ? "true" : undefined}
                  aria-describedby={errors[field.name] ? `location-${field.name}-error` : undefined}
                  className={field.name === "postalCode" ? `${fieldClassName} pr-10` : fieldClassName}
                />
                {field.name === "postalCode" && isLookingUpPostalCode ? (
                  <span role="status" className="pointer-events-none absolute top-1.5 right-3 bottom-0 flex items-center text-(--primary-text)">
                    <LuLoaderCircle aria-hidden="true" size={18} className="animate-spin motion-reduce:animate-none" />
                    <span className="sr-only">Buscando endereço...</span>
                  </span>
                ) : null}
              </div>
              {field.name === "postalCode" && postalCodeError ? (
                <p role="alert" className="mt-2 text-xs leading-relaxed text-(--warning)">
                  {postalCodeError}
                </p>
              ) : null}
              <FieldError id={`location-${field.name}-error`} message={errors[field.name]?.message} />
            </div>
          ))}
          <div className="col-span-3">
            <label id="location-state-label" htmlFor="location-state" className={labelClassName}>UF</label>
            <div className="mt-1.5">
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <Combobox
                    ref={field.ref}
                    id="location-state"
                    labelId="location-state-label"
                    value={field.value}
                    options={brazilianStateOptions}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Selecione"
                    searchLabel="Buscar estado"
                    emptyMessage="Nenhum estado encontrado."
                    size="compact"
                    align="end"
                    disabled={isLookingUpPostalCode}
                    invalid={Boolean(errors.state)}
                    describedBy={errors.state ? "location-state-error" : undefined}
                  />
                )}
              />
            </div>
            <FieldError id="location-state-error" message={errors.state?.message} />
          </div>
        </div>
      </section>

      <section aria-labelledby="public-location-heading" className="border-t border-(--border) pt-6">
        <div className="flex items-start gap-3">
          <LuMapPin aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-(--primary-text)" />
          <div>
            <h2 id="public-location-heading" className="text-lg font-bold text-(--text-primary)">Localização aproximada</h2>
            <p className="mt-1 text-sm leading-relaxed text-(--text-secondary)">
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
            rows={3}
            {...register("referencePoints")}
            placeholder={"Ex.: 5 min do metrô Central\nPróximo à Universidade"}
            aria-invalid={errors.referencePoints ? "true" : undefined}
            aria-describedby={errors.referencePoints ? "location-reference-points-error" : undefined}
            className={fieldClassName}
          />
          <FieldError id="location-reference-points-error" message={errors.referencePoints?.message} />
        </div>
      </section>

      <FormActions>
        {guided?.previousHref ? (
          <Link href={guided.previousHref} className={secondaryButtonClassName}>
            <LuArrowLeft aria-hidden="true" size={16} />
            Voltar
          </Link>
        ) : null}
        <button type="submit" disabled={isSubmitting || (!guided && !isDirty)} className={primaryButtonClassName}>
          {isSubmitting ? "Salvando..." : guided ? "Salvar e continuar" : "Salvar localização"}
        </button>
        {!guided && isDirty ? (
          <button type="button" disabled={isSubmitting} onClick={() => reset()} className={secondaryButtonClassName}>
            Descartar
          </button>
        ) : null}
        <FormStatus error={error} saved={message} dirty={!guided && isDirty} />
      </FormActions>
      <UnsavedChangesGuard dirty={isDirty && !isSubmitting} />
    </form>
  );
}
