"use client";

import { useRef, useState } from "react";
import { LuCheck, LuEyeOff, LuLoaderCircle } from "react-icons/lu";
import { Combobox } from "@/components/combobox";
import { useCities } from "@/components/profile-location-fields";
import { OptionalTag } from "@/components/owner/field-hint";
import { fieldClassName, labelClassName } from "@/components/owner/styles";
import { StepHeading } from "@/components/owner/wizard-controls";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { brazilianStateOptions, brazilianStates, postalCodeAddressSchema } from "@/lib/properties";

export type WizardAddress = {
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

type Lookup = "idle" | "loading" | "found" | "manual";

export function formatPostalCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function WizardAddressStep({ address, onChange }: { address: WizardAddress; onChange: (changes: Partial<WizardAddress>) => void }) {
  const [lookup, setLookup] = useState<Lookup>(address.street ? "found" : "idle");
  const [lookupMessage, setLookupMessage] = useState<string>();
  const latestPostalCode = useRef(address.postalCode);
  const numberRef = useRef<HTMLInputElement>(null);
  const streetRef = useRef<HTMLInputElement>(null);
  const cities = useCities(address.state);

  async function lookupPostalCode(digits: string) {
    setLookup("loading");
    setLookupMessage(undefined);
    try {
      const found = postalCodeAddressSchema.parse(await sendApiRequest(`/owner/postal-codes/${digits}`, { method: "GET" }));
      if (latestPostalCode.current.replace(/\D/g, "") !== digits) return;
      onChange({
        street: found.street,
        neighborhood: found.neighborhood,
        city: found.city,
        state: brazilianStates.find((item) => item === found.state) ?? "",
      });
      if (found.street) {
        setLookup("found");
        requestAnimationFrame(() => numberRef.current?.focus());
      } else {
        setLookup("manual");
        setLookupMessage("Esse CEP cobre a cidade toda. Complete a rua e o bairro.");
        requestAnimationFrame(() => streetRef.current?.focus());
      }
    } catch (error) {
      if (latestPostalCode.current.replace(/\D/g, "") !== digits) return;
      setLookup("manual");
      setLookupMessage(`${toErrorMessage(error)} Preencha o endereço abaixo.`);
    }
  }

  function changePostalCode(raw: string) {
    const postalCode = formatPostalCode(raw);
    latestPostalCode.current = postalCode;
    onChange({ postalCode });
    const digits = postalCode.replace("-", "");
    if (digits.length === 8) void lookupPostalCode(digits);
    else if (lookup === "loading") setLookup("idle");
  }

  const showDetails = lookup === "found" || lookup === "manual";
  const manual = lookup === "manual";

  return (
    <div className="flex flex-col gap-5">
      <StepHeading title="Qual o CEP do imóvel?" description="Preenchemos o restante do endereço para você." />
      <p className="flex items-center gap-2 text-sm text-(--text-secondary)">
        <LuEyeOff aria-hidden="true" size={16} className="shrink-0 text-(--primary-text)" />
        O endereço completo é privado: no anúncio aparecem só bairro, cidade e UF.
      </p>
      <div className="relative">
        <label htmlFor="wizard-postal-code" className="sr-only">
          CEP
        </label>
        <input
          id="wizard-postal-code"
          data-autofocus
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          value={address.postalCode}
          onChange={(event) => changePostalCode(event.target.value)}
          className="w-full border-0 border-b-2 border-(--border-strong) bg-transparent py-2 text-4xl font-bold tracking-wide text-(--text-primary) outline-none transition-colors placeholder:text-(--border-strong) focus:border-(--primary)"
        />
        {lookup === "loading" ? (
          <span role="status" className="absolute top-1/2 right-0 flex -translate-y-1/2 items-center gap-2 text-sm text-(--text-secondary)">
            <LuLoaderCircle aria-hidden="true" size={18} className="animate-spin motion-reduce:animate-none" />
            Buscando endereço…
          </span>
        ) : null}
      </div>

      {lookup === "found" ? (
        <div className="flex items-start gap-3 rounded-2xl bg-(--primary-soft) px-4 py-4">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-(--primary) text-(--on-primary)">
            <LuCheck aria-hidden="true" size={14} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="font-semibold text-(--text-primary)">{address.street}</span>
            <span className="text-sm text-(--text-secondary)">
              {[address.neighborhood, [address.city, address.state].filter(Boolean).join("/")].filter(Boolean).join(" · ")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLookup("manual")}
            className="shrink-0 text-sm font-semibold text-(--primary-text) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-(--focus-ring)"
          >
            Corrigir
          </button>
        </div>
      ) : null}

      {manual ? (
        <div className="flex flex-col gap-4">
          {lookupMessage ? (
            <p role="alert" className="text-sm text-(--warning)">
              {lookupMessage}
            </p>
          ) : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="wizard-street" className={labelClassName}>
                Rua / avenida
              </label>
              <input
                id="wizard-street"
                ref={streetRef}
                autoComplete="address-line1"
                value={address.street}
                onChange={(event) => onChange({ street: event.target.value })}
                className={fieldClassName}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="wizard-neighborhood" className={labelClassName}>
                Bairro
              </label>
              <input
                id="wizard-neighborhood"
                autoComplete="address-level3"
                value={address.neighborhood}
                onChange={(event) => onChange({ neighborhood: event.target.value })}
                className={fieldClassName}
              />
            </div>
            <div>
              <label id="wizard-state-label" htmlFor="wizard-state" className={labelClassName}>
                UF
              </label>
              <div className="mt-1.5">
                <Combobox
                  id="wizard-state"
                  labelId="wizard-state-label"
                  value={address.state}
                  options={brazilianStateOptions}
                  onChange={(state) => onChange({ state, city: "" })}
                  placeholder="Selecione"
                  searchLabel="Buscar estado"
                  emptyMessage="Nenhum estado encontrado."
                  size="compact"
                />
              </div>
            </div>
            <div>
              <label id="wizard-city-label" htmlFor="wizard-city" className={labelClassName}>
                Cidade
              </label>
              <div className="mt-1.5">
                <Combobox
                  id="wizard-city"
                  labelId="wizard-city-label"
                  value={address.city}
                  options={
                    cities.cities.length > 0 || !address.city
                      ? cities.cities.map((city) => ({ value: city, label: city }))
                      : [{ value: address.city, label: address.city }]
                  }
                  onChange={(city) => onChange({ city })}
                  placeholder={!address.state ? "Selecione a UF" : cities.loading ? "Carregando..." : "Selecione"}
                  searchLabel="Buscar cidade"
                  emptyMessage="Nenhuma cidade encontrada."
                  size="compact"
                  align="end"
                  disabled={!address.state || cities.loading || cities.failed}
                  loading={cities.loading}
                  virtualized
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showDetails ? (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4">
          <div>
            <label htmlFor="wizard-number" className={labelClassName}>
              Número
            </label>
            <input
              id="wizard-number"
              ref={numberRef}
              inputMode="numeric"
              autoComplete="off"
              value={address.number}
              onChange={(event) => onChange({ number: event.target.value })}
              className={fieldClassName}
            />
          </div>
          <div>
            <label htmlFor="wizard-complement" className={labelClassName}>
              Complemento
              <OptionalTag />
            </label>
            <input
              id="wizard-complement"
              autoComplete="address-line2"
              placeholder="Casa 2, bloco B…"
              value={address.complement}
              onChange={(event) => onChange({ complement: event.target.value })}
              className={fieldClassName}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
