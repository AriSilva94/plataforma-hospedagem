"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LuArrowLeft } from "react-icons/lu";
import { FormActions, FormStatus } from "@/components/owner/form-actions";
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
  secondaryButtonClassName,
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
  labelOf,
  roomAmenityGroups,
  roomAmenityLabels,
  type RoomDetail,
} from "@/lib/properties";

function FormSection({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 border-t border-(--line) pt-6 first:border-t-0 first:pt-0">
      <div>
        <h2 id={id} className="text-lg font-bold text-white">{title}</h2>
        {description ? <p className="mt-1 max-w-prose text-sm leading-relaxed text-(--gray)">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

const ROOM_DETAILS_HINT = "Comodidades e informações adicionais ajudam o hóspede a escolher e completam o anúncio.";
const SUMMARY_AMENITY_LIMIT = 3;

function roomDetailsSummary(room: RoomDetail): string {
  const amenityNames = room.amenities.map((amenity) => labelOf(roomAmenityLabels, amenity));
  const amenities =
    amenityNames.length > SUMMARY_AMENITY_LIMIT
      ? `${amenityNames.slice(0, SUMMARY_AMENITY_LIMIT).join(", ")} +${amenityNames.length - SUMMARY_AMENITY_LIMIT}`
      : amenityNames.join(", ");
  const parts = [amenities || null, room.additionalInfo ? "informações adicionais" : null].filter(Boolean);
  return parts.length > 0 ? `Preenchido: ${parts.join(" · ")}.` : ROOM_DETAILS_HINT;
}

export function RoomForm({ propertyId, room, createdHref, backHref }: { propertyId: string; room?: RoomDetail; createdHref?: string; backHref?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const { register, handleSubmit, getValues, reset, formState } = useForm<RoomInput, unknown, RoomValues>({
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
    },
    mode: "onBlur",
  });
  const { errors, isSubmitting, isDirty } = formState;
  const lastAvailableRoom = room?.property.status === "ACTIVE" && room.status === "AVAILABLE" && room.property.availableRoomCount === 1;

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

  async function archive() {
    if (!room) return;
    setArchiving(true);
    setError(undefined);
    try {
      await sendApiRequest(`/owner/rooms/${room.id}`, { method: "PATCH", body: JSON.stringify({ status: "INACTIVE" }) });
      setConfirmingArchive(false);
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
      setConfirmingArchive(false);
    } finally {
      setArchiving(false);
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
    <form noValidate onSubmit={handleSubmit(save)} className="flex flex-col gap-6 pt-6 pb-8">
      <FormSection id="room-data-heading" title="Dados do quarto">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
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
          <div>
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
            <FieldHint id="room-price-hint">Valor base por noite.</FieldHint>
            <FieldError id="room-price-error" message={errors.price?.message} />
          </div>
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
      </FormSection>

      <OptionalDetails
        title="Comodidades e informações"
        tag="recomendado"
        description={room ? roomDetailsSummary(room) : ROOM_DETAILS_HINT}
        forceOpen={Boolean(errors.additionalInfo)}
      >
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
        <FormSection
          id="room-danger-heading"
          title="Arquivar ou excluir"
          description="Arquivar tira o quarto do anúncio sem apagar nada, e você pode reativá-lo depois. Excluir remove o quarto e as fotos de vez."
        >
          <div className="flex flex-wrap gap-3">
            {room.status !== "INACTIVE" ? (
              <button type="button" disabled={pending || archiving} onClick={() => setConfirmingArchive(true)} className={secondaryButtonClassName}>
                Arquivar quarto
              </button>
            ) : null}
            <button type="button" disabled={pending || archiving} onClick={() => setConfirmingDelete(true)} className={dangerButtonClassName}>
              Excluir quarto
            </button>
          </div>
        </FormSection>
      ) : null}

      <FormActions>
        {backHref ? (
          <Link href={backHref} className={secondaryButtonClassName}>
            <LuArrowLeft aria-hidden="true" size={16} />
            Voltar
          </Link>
        ) : null}
        <button type="submit" disabled={pending || (Boolean(room) && !isDirty)} className={primaryButtonClassName}>
          {isSubmitting ? "Salvando..." : room ? "Salvar quarto" : createdHref ? "Salvar e continuar" : "Criar quarto"}
        </button>
        {room && isDirty ? (
          <button type="button" disabled={pending} onClick={() => reset()} className={secondaryButtonClassName}>
            Descartar
          </button>
        ) : null}
        <FormStatus error={error} saved={message} dirty={Boolean(room) && isDirty} />
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
      <ConfirmDialog
        open={confirmingArchive}
        title="Arquivar este quarto?"
        description={
          lastAvailableRoom
            ? "Ele é o último quarto reservável: o imóvel deixa de aparecer na busca até você reativar um quarto."
            : "O quarto sai do anúncio e deixa de contar como quarto do imóvel. Você pode reativá-lo depois."
        }
        confirmLabel="Arquivar quarto"
        pendingLabel="Arquivando..."
        tone="primary"
        pending={archiving}
        onConfirm={() => void archive()}
        onCancel={() => setConfirmingArchive(false)}
      />
    </form>
  );
}
