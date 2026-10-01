"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { FormFeedback } from "@/components/form-feedback";
import { FormActions } from "@/components/owner/form-actions";
import { SavedNotice } from "@/components/owner/saved-notice";
import { UnsavedChangesGuard } from "@/components/owner/unsaved-changes-guard";
import { ChoiceGroup, optionsFrom } from "@/components/owner/choice-group";
import { ConfirmDialog } from "@/components/owner/confirm-dialog";
import { FieldError } from "@/components/owner/field-error";
import { FieldHint } from "@/components/owner/field-hint";
import { OptionalDetails } from "@/components/owner/optional-details";
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
  roomAmenityGroups,
  roomAmenityLabels,
  roomStatusHints,
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

function roomDetailsSummary(room: RoomDetail): string {
  const parts = [
    room.description ? "descrição" : null,
    room.amenities.length > 0 ? `${room.amenities.length} ${room.amenities.length === 1 ? "comodidade" : "comodidades"}` : null,
    room.additionalInfo ? "informações adicionais" : null,
  ].filter(Boolean);
  return parts.length > 0 ? `Preenchido: ${parts.join(", ")}.` : "Descrição, comodidades e informações adicionais ajudam o hóspede a escolher.";
}

export function RoomForm({ propertyId, room, createdHref }: { propertyId: string; room?: RoomDetail; createdHref?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { register, handleSubmit, control, getValues, reset, formState } = useForm<RoomInput, unknown, RoomValues>({
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
  const { errors, isSubmitting, isDirty } = formState;
  const status = useWatch({ control, name: "status" });

  async function save({ price, ...values }: RoomValues) {
    setError(undefined);
    setMessage(undefined);
    const body = JSON.stringify({ ...values, priceCents: price });
    try {
      if (room) {
        await sendApiRequest(`/owner/rooms/${room.id}`, { method: "PATCH", body });
        setMessage("Quarto salvo.");
        reset(getValues());
        router.refresh();
        return;
      }
      const created = await sendApiRequest(`/owner/properties/${propertyId}/rooms`, { method: "POST", body });
      const id = typeof created === "object" && created !== null && "id" in created ? String(created.id) : undefined;
      router.push(createdHref ?? (id ? `/meus-imoveis/${propertyId}/quartos/${id}?secao=fotos` : `/meus-imoveis/${propertyId}`));
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    }
  }

  async function remove() {
    if (!room) return;
    setDeleting(true);
    setError(undefined);
    try {
      await sendApiRequest(`/owner/rooms/${room.id}`, { method: "DELETE" });
      router.push(`/meus-imoveis/${propertyId}`);
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  const pending = isSubmitting || deleting;

  return (
    <form noValidate onSubmit={handleSubmit(save)} className="flex flex-col gap-8 py-8">
      <FormSection id="room-data-heading" title="Dados do quarto">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            <label htmlFor="room-title" className={labelClassName}>Nome do quarto</label>
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
        <div className="sm:max-w-xs">
          <label htmlFor="room-price" className={labelClassName}>Valor da diária (R$)</label>
          <input
            id="room-price"
            inputMode="decimal"
            placeholder="150,00"
            {...register("price")}
            aria-invalid={errors.price ? "true" : undefined}
            aria-describedby={`room-price-hint${errors.price ? " room-price-error" : ""}`}
            className={fieldClassName}
          />
          <FieldHint id="room-price-hint">Valor base da diária. Descontos e cobranças ficam para etapas futuras.</FieldHint>
          <FieldError id="room-price-error" message={errors.price?.message} />
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

      <OptionalDetails
        title="Detalhes do quarto"
        description={room ? roomDetailsSummary(room) : "Descrição, comodidades e informações adicionais ajudam o hóspede a escolher."}
        forceOpen={Boolean(errors.description || errors.additionalInfo)}
      >
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
        {roomAmenityGroups.map((group) => (
          <ChoiceGroup
            key={group.id}
            id={`room-amenities-${group.id}`}
            legend={group.legend}
            type="checkbox"
            options={group.amenities.map((amenity) => ({ value: amenity, label: roomAmenityLabels[amenity] }))}
            registration={register("amenities")}
          />
        ))}
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
      </OptionalDetails>

      {room ? (
        <FormSection id="room-status-heading" title="Disponibilidade">
          <div className="sm:max-w-xs">
            <label htmlFor="room-status" className={labelClassName}>Situação do quarto</label>
            <select id="room-status" {...register("status")} aria-describedby="room-status-hint" className={fieldClassName}>
              {optionsFrom(roomStatusLabels).map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <FieldHint id="room-status-hint">{roomStatusHints[status]}</FieldHint>
          </div>
        </FormSection>
      ) : null}

      {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
      {message ? <SavedNotice message={message} propertyId={propertyId} /> : null}

      <FormActions>
        <button type="submit" disabled={pending || (Boolean(room) && !isDirty)} className={primaryButtonClassName}>
          {isSubmitting ? "Salvando..." : room ? "Salvar quarto" : createdHref ? "Salvar e continuar" : "Criar quarto"}
        </button>
        {room && isDirty ? <span className="text-sm text-(--warning)">Alterações não salvas</span> : null}
        {room ? (
          <button type="button" disabled={pending} onClick={() => setConfirmingDelete(true)} className={dangerButtonClassName}>
            Excluir quarto
          </button>
        ) : null}
      </FormActions>
      <UnsavedChangesGuard dirty={isDirty && !pending} />
      <ConfirmDialog
        open={confirmingDelete}
        title="Excluir este quarto?"
        description="O quarto e todas as suas fotos serão removidos. Essa ação não pode ser desfeita."
        confirmLabel="Excluir quarto"
        pendingLabel="Excluindo..."
        pending={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setConfirmingDelete(false)}
      />
    </form>
  );
}
