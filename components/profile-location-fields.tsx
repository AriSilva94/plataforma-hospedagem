"use client";

import { useEffect, useState } from "react";
import { LuBuilding2, LuMapPinned } from "react-icons/lu";
import { Controller, useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import { Combobox } from "@/components/combobox";
import { FieldError } from "@/components/field-error";
import { sendApiRequest } from "@/lib/api";
import type { ProfileFormValues } from "@/lib/auth-form-schema";
import { brazilianStateOptions } from "@/lib/properties";
import { z } from "@/lib/zod";

const citiesSchema = z.array(z.string());

type CitiesResult = { key: string; cities: string[] | null };

function useCities(state: string) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<CitiesResult>();
  const key = `${state}:${attempt}`;

  useEffect(() => {
    if (!state) return;
    let active = true;
    sendApiRequest(`/locations/states/${state}/cities`, { method: "GET" })
      .then((body) => citiesSchema.parse(body))
      .then(
        (cities) => active && setResult({ key, cities }),
        () => active && setResult({ key, cities: null }),
      );
    return () => {
      active = false;
    };
  }, [state, key]);

  const current = result?.key === key ? result : undefined;
  return {
    cities: current?.cities ?? [],
    loading: Boolean(state) && !current,
    failed: current?.cities === null,
    retry: () => setAttempt((value) => value + 1),
  };
}

export function ProfileLocationFields({
  control,
  setValue,
  disabled,
  labelClassName,
}: {
  control: Control<ProfileFormValues>;
  setValue: UseFormSetValue<ProfileFormValues>;
  disabled: boolean;
  labelClassName: string;
}) {
  const state = useWatch({ control, name: "state" });
  const { cities, loading, failed, retry } = useCities(state);
  const cityOptions = cities.map((city) => ({ value: city, label: city }));
  const cityPlaceholder = !state ? "Selecione o estado primeiro" : loading ? "Carregando cidades..." : "Selecione a cidade";

  return (
    <>
      <div>
        <label id="profile-state-label" htmlFor="profile-state" className={labelClassName}>Estado</label>
        <Controller
          control={control}
          name="state"
          render={({ field, fieldState }) => (
            <>
              <Combobox
                ref={field.ref}
                id="profile-state"
                labelId="profile-state-label"
                value={field.value}
                options={brazilianStateOptions}
                onChange={(value) => {
                  field.onChange(value);
                  setValue("city", "", { shouldDirty: true, shouldValidate: true });
                }}
                onBlur={field.onBlur}
                placeholder="Selecione o estado"
                searchLabel="Buscar estado"
                emptyMessage="Nenhum estado encontrado."
                icon={LuMapPinned}
                disabled={disabled}
                invalid={Boolean(fieldState.error)}
                describedBy={fieldState.error ? "profile-state-error" : undefined}
              />
              <FieldError id="profile-state-error" message={fieldState.error?.message} />
            </>
          )}
        />
      </div>
      <div>
        <label id="profile-city-label" htmlFor="profile-city" className={labelClassName}>Cidade</label>
        <Controller
          control={control}
          name="city"
          render={({ field, fieldState }) => (
            <>
              <Combobox
                ref={field.ref}
                id="profile-city"
                labelId="profile-city-label"
                value={field.value}
                options={cityOptions.length > 0 || !field.value ? cityOptions : [{ value: field.value, label: field.value }]}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={cityPlaceholder}
                searchLabel="Buscar cidade"
                emptyMessage="Nenhuma cidade encontrada."
                icon={LuBuilding2}
                disabled={disabled || !state || loading || failed}
                loading={loading}
                invalid={Boolean(fieldState.error)}
                describedBy={failed ? "profile-city-status" : fieldState.error ? "profile-city-error" : undefined}
              />
              <FieldError id="profile-city-error" message={fieldState.error?.message} />
            </>
          )}
        />
        {failed ? (
          <p id="profile-city-status" role="alert" className="mt-2 text-xs leading-relaxed text-(--gray)">
            Não foi possível carregar as cidades.{" "}
            <button type="button" onClick={retry} className="font-bold text-(--blue-light) underline underline-offset-2 outline-hidden hover:text-(--white) focus-visible:ring-2 focus-visible:ring-(--blue-light)">
              Tentar novamente
            </button>
          </p>
        ) : null}
      </div>
    </>
  );
}
