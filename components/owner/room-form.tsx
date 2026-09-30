"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormFeedback } from "@/components/form-feedback";
import { ChoiceGroup, optionsFrom } from "@/components/owner/choice-group";
import { FieldError } from "@/components/owner/field-error";
import {
  dangerButtonClassName,
  fieldClassName,
  labelClassName,
  primaryButtonClassName,
} from "@/components/owner/styles";
import {
  centsToInput,
  roomSchema,
  type RoomInput,
  type RoomValues,
} from "@/lib/owner-forms";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import {
  bathroomTypeLabels,
  genderIdentityLabels,
  roomAmenityLabels,
  roomStatusLabels,
  type RoomDetail,
} from "@/lib/properties";

function FormSection({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5 border-t border-(--line) pt-8 first:border-t-0 first:pt-0">
      <div>
        <h2 id={id} className="text-lg font-bold text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-relaxed text-(--gray)">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function RoomForm({ propertyId, room }: { propertyId: string; room?: RoomDetail }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [deleting, setDeleting] = useState(false);
  const { register, handleSubmit, formState } = useForm<RoomInput, unknown, RoomValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      title: room?.title ?? "",
      description: room?.description ?? "",
      price: room ? centsToInput(room.priceCents) : "",
      capacity: room?.capacity ?? 1,
      bathroomType: room?.bathroomType,
      acceptedAudiences: room?.acceptedAudiences ?? [],
      amenities: room?.amenities ?? [],
      additionalInfo: room?.additionalInfo ?? "",
      status: room?.status ?? "AVAILABLE",
    },
    mode: "onBlur",
  });
  const { errors, isSubmitting } = formState;

  async function save({ price, ...values }: RoomValues) {
    setError(undefined);
    setMessage(undefined);
    const body = JSON.stringify({ ...values, priceCents: price });
    try {
      if (room) {
        await sendApiRequest(`/owner/rooms/${room.id}`, { method: "PATCH", body });
        setMessage("Quarto salvo.");
        router.refresh();
        return;
      }
      const created = await sendApiRequest(`/owner/properties/${propertyId}/rooms`, { method: "POST", body });
      const id = typeof created === "object" && created !== null && "id" in created ? String(created.id) : undefined;
      router.push(id ? `/meus-imoveis/${propertyId}/quartos/${id}?secao=fotos` : `/meus-imoveis/${propertyId}`);
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    }
  }

  async function remove() {
    if (!room || !window.confirm("Excluir este quarto e suas fotos?")) return;
    setDeleting(true);
    setError(undefined);
    try {
      await sendApiRequest(`/owner/rooms/${room.id}`, { method: "DELETE" });
      router.push(`/meus-imoveis/${propertyId}`);
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
      setDeleting(false);
    }
  }

  const pending = isSubmitting || deleting;

  return (
    <form noValidate onSubmit={handleSubmit(save)} className="flex flex-col gap-8 py-8">
      <FormSection id="room-data-heading" title="Dados do quarto">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            <label htmlFor="room-title" className={labelClassName}>Nome</label>
            <input
              id="room-title"
              {...register("title")}
              placeholder="Ex.: Suíte master"
              aria-invalid={errors.title ? "true" : undefined}
              aria-describedby={errors.title ? "room-title-error" : undefined}
              className={fieldClassName}
            />
            <FieldError id="room-title-error" message={errors.title?.message} />
          </div>
          <div>
            <label htmlFor="room-capacity" className={labelClassName}>Capacidade (pessoas)</label>
            <input
              id="room-capacity"
              type="number"
              min={1}
              max={20}
              inputMode="numeric"
              {...register("capacity")}
              aria-invalid={errors.capacity ? "true" : undefined}
              aria-describedby={errors.capacity ? "room-capacity-error" : undefined}
              className={fieldClassName}
            />
            <FieldError id="room-capacity-error" message={errors.capacity?.message} />
          </div>
        </div>
        <div>
          <label htmlFor="room-description" className={labelClassName}>Descrição</label>
          <textarea
            id="room-description"
            rows={4}
            {...register("description")}
            aria-invalid={errors.description ? "true" : undefined}
            aria-describedby={errors.description ? "room-description-error" : undefined}
            className={fieldClassName}
          />
          <FieldError id="room-description-error" message={errors.description?.message} />
        </div>
        <ChoiceGroup
          id="room-bathroom"
          legend="Banheiro"
          type="radio"
          options={optionsFrom(bathroomTypeLabels)}
          registration={register("bathroomType")}
          error={errors.bathroomType?.message}
        />
        <ChoiceGroup
          id="room-audiences"
          legend="Público aceito"
          description="Marque todos os públicos que podem se hospedar neste quarto."
          type="checkbox"
          options={optionsFrom(genderIdentityLabels)}
          registration={register("acceptedAudiences")}
          error={errors.acceptedAudiences?.message}
        />
      </FormSection>

      <FormSection id="room-features-heading" title="Características">
        <ChoiceGroup
          id="room-amenities"
          legend="Comodidades do quarto"
          type="checkbox"
          options={optionsFrom(roomAmenityLabels)}
          registration={register("amenities")}
        />
        <div>
          <label htmlFor="room-additional-info" className={labelClassName}>Informações adicionais</label>
          <textarea
            id="room-additional-info"
            rows={3}
            {...register("additionalInfo")}
            aria-invalid={errors.additionalInfo ? "true" : undefined}
            aria-describedby={errors.additionalInfo ? "room-additional-info-error" : undefined}
            className={fieldClassName}
          />
          <FieldError id="room-additional-info-error" message={errors.additionalInfo?.message} />
        </div>
      </FormSection>

      <FormSection id="room-price-heading" title="Preço e status" description="Valor base da diária. Descontos e cobranças ficam para etapas futuras.">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="room-price" className={labelClassName}>Valor da diária (R$)</label>
            <input
              id="room-price"
              inputMode="decimal"
              placeholder="150,00"
              {...register("price")}
              aria-invalid={errors.price ? "true" : undefined}
              aria-describedby={errors.price ? "room-price-error" : undefined}
              className={fieldClassName}
            />
            <FieldError id="room-price-error" message={errors.price?.message} />
          </div>
          <div>
            <label htmlFor="room-status" className={labelClassName}>Status</label>
            <select id="room-status" {...register("status")} className={fieldClassName}>
              {optionsFrom(roomStatusLabels).map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
      {message ? <FormFeedback tone="success">{message}</FormFeedback> : null}

      <div className="flex flex-wrap gap-3 border-t border-(--line) pt-6">
        <button type="submit" disabled={pending} className={primaryButtonClassName}>
          {isSubmitting ? "Salvando..." : room ? "Salvar quarto" : "Criar quarto"}
        </button>
        {room ? (
          <button type="button" disabled={pending} onClick={() => void remove()} className={dangerButtonClassName}>
            Excluir quarto
          </button>
        ) : null}
      </div>
    </form>
  );
}
