"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LuEyeOff, LuMapPin } from "react-icons/lu";
import { FormFeedback } from "@/components/form-feedback";
import { FieldError } from "@/components/owner/field-error";
import { fieldClassName, labelClassName, primaryButtonClassName } from "@/components/owner/styles";
import {
  propertyLocationSchema,
  type PropertyLocationInput,
  type PropertyLocationValues,
} from "@/lib/owner-forms";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { brazilianStates, type PropertyDetail } from "@/lib/properties";

type TextField = Exclude<keyof PropertyLocationInput, "state" | "referencePoints">;

const addressFields: { name: TextField; label: string; autoComplete: string; className: string }[] = [
  { name: "postalCode", label: "CEP", autoComplete: "postal-code", className: "sm:col-span-2" },
  { name: "street", label: "Rua / avenida", autoComplete: "address-line1", className: "sm:col-span-4" },
  { name: "number", label: "Número", autoComplete: "off", className: "sm:col-span-2" },
  { name: "complement", label: "Complemento", autoComplete: "address-line2", className: "sm:col-span-4" },
  { name: "neighborhood", label: "Bairro", autoComplete: "address-level3", className: "sm:col-span-3" },
  { name: "city", label: "Cidade", autoComplete: "address-level2", className: "sm:col-span-2" },
];

export function PropertyLocationForm({ property }: { property: PropertyDetail }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const { register, handleSubmit, formState } = useForm<PropertyLocationInput, unknown, PropertyLocationValues>({
    resolver: zodResolver(propertyLocationSchema),
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
  const { errors, isSubmitting } = formState;

  async function save(values: PropertyLocationValues) {
    setError(undefined);
    setMessage(undefined);
    try {
      await sendApiRequest(`/owner/properties/${property.id}`, { method: "PATCH", body: JSON.stringify(values) });
      setMessage("Localização salva.");
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
              <label htmlFor={`location-${field.name}`} className={labelClassName}>{field.label}</label>
              <input
                id={`location-${field.name}`}
                {...register(field.name)}
                autoComplete={field.autoComplete}
                inputMode={field.name === "postalCode" ? "numeric" : undefined}
                aria-invalid={errors[field.name] ? "true" : undefined}
                aria-describedby={errors[field.name] ? `location-${field.name}-error` : undefined}
                className={fieldClassName}
              />
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
              className={fieldClassName}
            >
              <option value="">--</option>
              {brazilianStates.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
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
          <label htmlFor="location-reference-points" className={labelClassName}>Pontos de referência (um por linha)</label>
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
      {message ? <FormFeedback tone="success">{message}</FormFeedback> : null}

      <div>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClassName}>
          {isSubmitting ? "Salvando..." : "Salvar localização"}
        </button>
      </div>
    </form>
  );
}
