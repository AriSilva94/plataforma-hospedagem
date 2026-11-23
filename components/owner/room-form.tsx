"use client";

import { useEffect, useId, useState, type RefObject } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { LuArchive, LuArrowLeft, LuBanknote, LuBath, LuBedDouble, LuCigaretteOff, LuDoorOpen, LuSparkles, LuTrash2, LuUsers } from "react-icons/lu";
import { FormActions, FormStatus } from "@/components/owner/form-actions";
import { UnsavedChangesGuard } from "@/components/owner/unsaved-changes-guard";
import { ChoiceGroup, optionsFrom } from "@/components/owner/choice-group";
import { ConfirmDialog } from "@/components/owner/confirm-dialog";
import { FieldError } from "@/components/field-error";
import { FormSection } from "@/components/owner/form-section";
import { HouseServicesFields } from "@/components/owner/house-services-fields";
import { RoomBedsFields } from "@/components/owner/room-beds-fields";
import { roomAmenityIcons } from "@/lib/amenity-icons";
import {
  dangerButtonClassName,
  fieldClassName,
  labelClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/owner/styles";
import {
  centsToInput,
  houseServicesDefaults,
  houseServicesError,
  houseServicesPayload,
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
  roomDetailSchema,
  type RoomDetail,
} from "@/lib/properties";

const bathroomOptions = optionsFrom(bathroomTypeLabels).map((option) => ({ ...option, icon: option.value === "PRIVATE" ? LuBath : LuUsers }));

export function roomFormValues(room?: RoomDetail): RoomInput {
  return {
    title: room?.title ?? "",
    description: room?.description ?? "",
    price: room ? centsToInput(room.priceCents) : "",
    capacity: room?.capacity ?? 1,
    bathroomType: room?.bathroomType ?? null,
    acceptedAudiences: room?.acceptedAudiences ?? [],
    amenities: room?.amenities ?? [],
    additionalInfo: room?.additionalInfo ?? "",
    beds: room?.beds ?? [],
    ...houseServicesDefaults(room),
  };
}

export function RoomForm({
  propertyId,
  room,
  createdHref,
  backHref,
  inline = false,
  initialValues,
  onSaved,
  onDirtyChange,
  valuesRef,
}: {
  propertyId: string;
  room?: RoomDetail;
  createdHref?: string;
  backHref?: string;
  inline?: boolean;
  initialValues?: Partial<RoomInput>;
  onSaved?: (room: RoomDetail) => void;
  onDirtyChange?: (dirty: boolean) => void;
  valuesRef?: RefObject<(() => RoomInput) | null>;
}) {
  const generatedId = useId();
  const uid = inline ? generatedId : "room";
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const { register, handleSubmit, control, getValues, reset, formState } = useForm<RoomInput, unknown, RoomValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: { ...roomFormValues(room), ...(room ? {} : initialValues) },
    mode: "onBlur",
  });
  const { errors, isSubmitting, isDirty } = formState;
  useEffect(() => {
    if (valuesRef) valuesRef.current = getValues;
  }, [valuesRef, getValues]);
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);
  const hasCleaner = useWatch({ control, name: "hasCleaner" });
  const lastAvailableRoom = room?.property.status === "ACTIVE" && room.status === "AVAILABLE" && room.property.availableRoomCount === 1;

  async function save({ price, ...values }: RoomValues) {
    setError(undefined);
    setMessage(undefined);
    const servicesError = houseServicesError(values);
    if (servicesError) {
      setError(servicesError);
      return;
    }
    const body = JSON.stringify({ ...values, ...houseServicesPayload(values), priceCents: price });
    try {
      if (room) {
        const updated = await sendApiRequest(`/owner/rooms/${room.id}`, { method: "PATCH", body });
        const saved = inline ? roomDetailSchema.parse(updated) : undefined;
        setMessage("Quarto salvo.");
        reset(getValues());
        if (saved) onSaved?.(saved);
        else router.refresh();
        return;
      }
      const created = await sendApiRequest(`/owner/properties/${propertyId}/rooms`, { method: "POST", body });
      if (inline) {
        const saved = roomDetailSchema.parse(created);
        reset(getValues());
        onSaved?.(saved);
        return;
      }
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
    <form noValidate onSubmit={handleSubmit(save)} className="flex flex-col pt-6 [&_[id]]:scroll-mt-32">
      <FormSection id={`${uid}-data-heading`} icon={LuDoorOpen} tone="lavender" title="Sobre o quarto" description="Nome e descrição que o hóspede vê no anúncio.">
        <div>
          <label htmlFor={`${uid}-title`} className={labelClassName}>Nome do quarto</label>
          <input
            id={`${uid}-title`}
            {...register("title")}
            placeholder="Ex.: Suíte master"
            aria-invalid={errors.title ? "true" : undefined}
            aria-describedby={errors.title ? `${uid}-title-error` : undefined}
            className={fieldClassName}
          />
          <FieldError id={`${uid}-title-error`} message={errors.title?.message} />
        </div>
        <div>
          <label htmlFor={`${uid}-description`} className={labelClassName}>Descrição</label>
          <textarea
            id={`${uid}-description`}
            rows={3}
            {...register("description")}
            placeholder="Ex.: luz natural, vista, silêncio, tamanho do quarto."
            aria-invalid={errors.description ? "true" : undefined}
            aria-describedby={errors.description ? `${uid}-description-error` : undefined}
            className={`${fieldClassName} resize-y leading-relaxed`}
          />
          <FieldError id={`${uid}-description-error`} message={errors.description?.message} />
        </div>
      </FormSection>

      <FormSection id={`${uid}-price-heading`} icon={LuBanknote} title="Diária e capacidade" description="Valor base por noite, em reais, e quantas pessoas o quarto recebe (até 20).">
        <div className="grid grid-cols-[minmax(0,1fr)_6.5rem] gap-3 sm:grid-cols-[minmax(0,1fr)_11rem] sm:gap-4">
          <div>
            <label htmlFor={`${uid}-price`} className={labelClassName}>Valor da diária</label>
            <div className="relative mt-1.5">
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-lg font-bold text-(--text-secondary)">
                R$
              </span>
              <input
                id={`${uid}-price`}
                inputMode="decimal"
                placeholder="150,00"
                {...register("price")}
                aria-invalid={errors.price ? "true" : undefined}
                aria-describedby={errors.price ? `${uid}-price-error` : undefined}
                className={`${fieldClassName} mt-0! py-2.5! pr-4! pl-11! text-xl! font-extrabold tracking-tight tabular-nums sm:pr-20! sm:text-2xl!`}
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-4 hidden items-center text-sm text-(--text-secondary) sm:flex">
                / noite
              </span>
            </div>
            <FieldError id={`${uid}-price-error`} message={errors.price?.message} />
          </div>
          <div>
            <label htmlFor={`${uid}-capacity`} className={labelClassName}>Capacidade</label>
            <div className="relative mt-1.5">
              <input
                id={`${uid}-capacity`}
                type="number"
                min={1}
                max={20}
                inputMode="numeric"
                {...register("capacity", { valueAsNumber: true })}
                aria-invalid={errors.capacity ? "true" : undefined}
                aria-describedby={errors.capacity ? `${uid}-capacity-error` : undefined}
                className={`${fieldClassName} mt-0! py-2.5! text-xl! font-extrabold tracking-tight tabular-nums sm:pr-20! sm:text-2xl!`}
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-4 hidden items-center text-sm text-(--text-secondary) sm:flex">
                pessoas
              </span>
            </div>
            <FieldError id={`${uid}-capacity-error`} message={errors.capacity?.message} />
          </div>
        </div>
      </FormSection>

      <FormSection id={`${uid}-beds-heading`} icon={LuBedDouble} tone="lavender" title="Camas" description="Opcional. Ajuda o hóspede a entender como vai dormir.">
        <RoomBedsFields id={`${uid}-beds`} control={control} errors={errors} />
      </FormSection>

      <FormSection id={`${uid}-guests-heading`} icon={LuUsers} tone="lavender" title="Banheiro e público" description="Quem pode se hospedar e como é o banheiro.">
        <ChoiceGroup
          id={`${uid}-bathroom`}
          legend="Banheiro"
          type="radio"
          options={bathroomOptions}
          registration={register("bathroomType")}
          error={errors.bathroomType?.message}
        />
        <ChoiceGroup
          id={`${uid}-audiences`}
          legend="Público aceito"
          description="Marque todos que se aplicam."
          type="checkbox"
          options={optionsFrom(genderIdentityLabels)}
          registration={register("acceptedAudiences")}
          error={errors.acceptedAudiences?.message}
        />
      </FormSection>

      <FormSection
        id={`${uid}-amenities-heading`}
        icon={LuSparkles}
        tone="champagne"
        title="Comodidades e informações"
        description="Recomendado. Ajudam o hóspede a escolher e contam para a completude do anúncio."
      >
        {roomAmenityGroups.map((group) => (
          <ChoiceGroup
            key={group.id}
            id={`${uid}-amenities-${group.id}`}
            legend={group.legend}
            type="checkbox"
            options={group.amenities.map((amenity) => ({ value: amenity, label: roomAmenityLabels[amenity], icon: roomAmenityIcons[amenity] }))}
            registration={register("amenities")}
          />
        ))}
        <div>
          <label htmlFor={`${uid}-additional-info`} className={labelClassName}>Informações adicionais</label>
          <textarea
            id={`${uid}-additional-info`}
            rows={3}
            {...register("additionalInfo")}
            placeholder="Ex.: janela voltada para o jardim, cortina blackout, tomada ao lado da cama."
            aria-invalid={errors.additionalInfo ? "true" : undefined}
            aria-describedby={errors.additionalInfo ? `${uid}-additional-info-error` : undefined}
            className={`${fieldClassName} resize-y leading-relaxed`}
          />
          <FieldError id={`${uid}-additional-info-error`} message={errors.additionalInfo?.message} />
        </div>
      </FormSection>

      <FormSection
        id={`${uid}-services-heading`}
        icon={LuCigaretteOff}
        tone="champagne"
        title="Faxina e fumantes"
        description="Deixe no padrão do imóvel ou defina uma regra própria para este quarto."
      >
        <HouseServicesFields id={`${uid}-services`} register={register} hasCleaner={hasCleaner} inherited={room?.property} />
      </FormSection>

      {room && !inline ? (
        <section
          aria-labelledby={`${uid}-danger-heading`}
          className="flex flex-col gap-1 border-t border-(--border) py-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id={`${uid}-danger-heading`} className="text-[13px] font-bold text-(--text-secondary)">
              Arquivar ou excluir
            </h2>
            <div className="flex shrink-0 gap-1.5">
              {room.status !== "INACTIVE" ? (
                <button type="button" disabled={pending || archiving} onClick={() => setConfirmingArchive(true)} className={`${secondaryButtonClassName} min-h-9 rounded-lg! px-3! py-1.5! text-xs!`}>
                  <LuArchive aria-hidden="true" size={14} />
                  Arquivar
                </button>
              ) : null}
              <button type="button" disabled={pending || archiving} onClick={() => setConfirmingDelete(true)} className={`${dangerButtonClassName} min-h-9 rounded-lg! px-3! py-1.5! text-xs!`}>
                <LuTrash2 aria-hidden="true" size={14} />
                Excluir
              </button>
            </div>
          </div>
          <p className="max-w-[62ch] text-xs leading-relaxed text-pretty text-(--text-secondary)">
            Arquivar tira o quarto do anúncio sem apagar nada, e você pode reativá-lo depois.
            <span className="block">Excluir remove o quarto e as fotos de vez.</span>
          </p>
        </section>
      ) : null}

      <FormActions>
        {backHref ? (
          <Link href={backHref} className={secondaryButtonClassName}>
            <LuArrowLeft aria-hidden="true" size={16} />
            Voltar
          </Link>
        ) : null}
        <button type="submit" disabled={pending || (Boolean(room) && !isDirty)} className={primaryButtonClassName}>
          {isSubmitting ? "Salvando..." : room || inline ? "Salvar quarto" : createdHref ? "Salvar e continuar" : "Criar quarto"}
        </button>
        {room && isDirty ? (
          <button type="button" disabled={pending} onClick={() => reset()} className={secondaryButtonClassName}>
            Descartar
          </button>
        ) : null}
        <FormStatus error={error} saved={message} dirty={Boolean(room) && isDirty} />
      </FormActions>
      {inline ? null : <UnsavedChangesGuard dirty={isDirty && !pending} />}
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
