"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { LuArrowLeft, LuArrowRight, LuBath, LuBedDouble, LuCalendarDays, LuCamera, LuCheck, LuCircleAlert, LuDoorOpen, LuEye, LuEyeOff, LuMapPin, LuNotebookPen, LuPlay, LuShowerHead, LuSofa, LuUser, LuUsers } from "react-icons/lu";
import { propertyTypeIcons } from "@/components/property-type-tag";
import { bedTypeIcons, roomAmenityIcons, sharedAreaTypeIcons } from "@/lib/amenity-icons";
import { ConfirmDialog } from "@/components/owner/confirm-dialog";
import { MediaGallery } from "@/components/owner/media-gallery";
import { fieldClassName, primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { formatPostalCode, WizardAddressStep, type WizardAddress } from "@/components/owner/wizard-address-step";
import { ChoiceOption, Counter, PhotoProgress, PhotoRow, StepHeading, shortcutKeys } from "@/components/owner/wizard-controls";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { centsToInput, propertyGeneralSchema, propertyGuidedGeneralSchema, propertyGuidedLocationSchema, roomSchema } from "@/lib/owner-forms";
import {
  bathroomTypeLabels,
  bathroomTypes,
  bedCapacity,
  bedTypeLabels,
  bedTypes,
  formatCents,
  genderIdentities,
  genderIdentityLabels,
  labelOf,
  propertyDetailSchema,
  propertyTypeLabels,
  propertyTypes,
  roomAmenities,
  roomAmenityLabels,
  roomDetailSchema,
  sharedAreaTypeLabels,
  sharedAreaTypes,
  type BathroomType,
  type BedType,
  type GenderIdentity,
  type Media,
  type PropertyDetail,
  type PropertyType,
  type RoomDetail,
  type SharedAreaType,
  MediaKind,
} from "@/lib/properties";
import { maxRoomCount, requirementLabels, roomStepKinds, setupStepHref, stepKey, type SetupStep } from "@/lib/setup-steps";

type Area = {
  id?: string;
  type: SharedAreaType;
  label: string | null;
  description: string | null;
  media: Media[];
};

type RoomDraft = {
  id?: string;
  title: string;
  beds: Record<BedType, number>;
  capacity: number;
  capacityEdited: boolean;
  bathroomType: BathroomType | null;
  acceptedAudiences: GenderIdentity[];
  amenities: string[];
  price: string;
  media: Media[];
};

type ReturnTo = "property" | number | null;

const choiceAreaTypes = sharedAreaTypes.filter((type) => type !== "OTHER");
const maxSharedBathrooms = 20;
const welcomeStages = [
  {
    title: "Endereço e imóvel",
    short: "Imóvel",
    detail: "CEP, tipo, nome, descrição e fotos do imóvel.",
    icon: LuMapPin,
    tone: "bg-(--primary) text-(--on-primary)",
  },
  {
    title: "Áreas compartilhadas",
    short: "Áreas comuns",
    detail: "Cômodos de uso comum, fotos de cada um e banheiros.",
    icon: LuSofa,
    tone: "bg-(--champagne-soft) text-(--champagne)",
  },
  {
    title: "Quartos",
    short: "Quartos",
    detail: "Camas, banheiro, público, comodidades, diária e fotos de cada quarto.",
    icon: LuBedDouble,
    tone: "bg-(--lavender-soft) text-(--lavender)",
  },
];
const maxCapacity = 20;

const emptyBeds = (): Record<BedType, number> => ({
  SINGLE: 0,
  DOUBLE: 0,
  QUEEN: 0,
  KING: 0,
  BUNK: 0,
  SOFA_BED: 0,
});

function suggestedCapacity(beds: Record<BedType, number>): number {
  return Math.min(
    bedTypes.reduce((total, type) => total + beds[type] * bedCapacity[type], 0),
    maxCapacity,
  );
}

function bedCount(beds: Record<BedType, number>): number {
  return bedTypes.reduce((total, type) => total + beds[type], 0);
}

function bedsText(beds: Record<BedType, number>): string {
  return (
    bedTypes
      .filter((type) => beds[type] > 0)
      .map((type) => `${beds[type]} ${bedTypeLabels[type].toLowerCase()}`)
      .join(", ") || "Sem camas"
  );
}

function mediaText(media: Media[]): string {
  const videos = media.filter((item) => item.type === MediaKind.VIDEO).length;
  const photos = media.length - videos;
  const parts = [photos ? `${photos} ${photos > 1 ? "fotos" : "foto"}` : "", videos ? `${videos} ${videos > 1 ? "vídeos" : "vídeo"}` : ""].filter(Boolean);
  return parts.join(" · ") || "Sem fotos";
}

function newRoom(index: number): RoomDraft {
  return {
    title: `Quarto ${index + 1}`,
    beds: emptyBeds(),
    capacity: 1,
    capacityEdited: false,
    bathroomType: null,
    acceptedAudiences: [],
    amenities: [],
    price: "",
    media: [],
  };
}

function roomFromDetail(room: RoomDetail): RoomDraft {
  const beds = emptyBeds();
  for (const bed of room.beds) beds[bed.type] = bed.quantity;
  return {
    id: room.id,
    title: room.title,
    beds,
    capacity: room.capacity,
    capacityEdited: room.capacity !== suggestedCapacity(beds),
    bathroomType: room.bathroomType,
    acceptedAudiences: room.acceptedAudiences,
    amenities: room.amenities,
    price: centsToInput(room.priceCents),
    media: room.media,
  };
}

function addressFrom(property?: PropertyDetail): WizardAddress {
  return {
    postalCode: formatPostalCode(property?.postalCode ?? ""),
    street: property?.street ?? "",
    number: property?.number ?? "",
    complement: property?.complement ?? "",
    neighborhood: property?.neighborhood ?? "",
    city: property?.city ?? "",
    state: property?.state ?? "",
  };
}

function areasFrom(property?: PropertyDetail): Area[] {
  return property?.sharedAreas ?? [];
}

function buildSteps(hasAreas: boolean, hasBathrooms: boolean, roomCount: number): SetupStep[] {
  const steps: SetupStep[] = [{ kind: "inicio" }, { kind: "endereco" }, { kind: "tipo" }, { kind: "nome" }, { kind: "descricao" }, { kind: "fotos" }, { kind: "areas" }];
  if (hasAreas) steps.push({ kind: "fotos-areas" });
  steps.push({ kind: "banheiros" });
  if (hasBathrooms) steps.push({ kind: "fotos-banheiros" });
  steps.push({ kind: "quartos" });
  for (let room = 0; room < roomCount; room += 1) for (const kind of roomStepKinds) steps.push({ kind, room });
  steps.push({ kind: "revisao" }, { kind: "concluido" });
  return steps;
}

function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }): string {
  return result.success ? "" : (result.error?.issues[0]?.message ?? "Confira os dados.");
}

export function PropertyWizard({
  property: initialProperty,
  rooms: initialRooms = [],
  initialStep,
  initialRoomCount,
}: {
  property?: PropertyDetail;
  rooms?: RoomDetail[];
  initialStep?: SetupStep;
  initialRoomCount?: number;
}) {
  const [property, setProperty] = useState(initialProperty);
  const [address, setAddress] = useState(() => addressFrom(initialProperty));
  const [type, setType] = useState<PropertyType | null>(initialProperty?.type ?? null);
  const [title, setTitle] = useState(initialProperty?.title ?? "");
  const [description, setDescription] = useState(initialProperty?.description ?? "");
  const [propertyMedia, setPropertyMedia] = useState<Media[]>(initialProperty?.media ?? []);
  const [areas, setAreas] = useState<Area[]>(() => areasFrom(initialProperty));
  const [otherAreas] = useState<Area[]>(() => areasFrom(initialProperty).filter((area) => area.type === "OTHER"));
  const [sharedBathrooms, setSharedBathrooms] = useState(initialProperty?.sharedBathroomCount ?? 1);
  const [rooms, setRooms] = useState<RoomDraft[]>(() => {
    const count = Math.max(initialRoomCount ?? 0, initialRooms.length, 1);
    return Array.from({ length: count }, (_, index) => (initialRooms[index] ? roomFromDetail(initialRooms[index]) : newRoom(index)));
  });
  const [stepIndex, setStepIndex] = useState(() => {
    const steps = buildSteps(areasFrom(initialProperty).length > 0, (initialProperty?.sharedBathrooms.length ?? 0) > 0, rooms.length);
    const index = initialStep ? steps.findIndex((step) => stepKey(step) === stepKey(initialStep)) : -1;
    return index >= 0 ? index : 0;
  });
  const [returnTo, setReturnTo] = useState<ReturnTo>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [removingRoom, setRemovingRoom] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const steps = buildSteps(areas.length > 0, (property?.sharedBathrooms.length ?? 0) > 0, rooms.length);
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const key = stepKey(step);
  const room = step.room === undefined ? undefined : rooms[step.room];
  const reviewIndex = steps.findIndex((item) => item.kind === "revisao");
  const isRoomStep = step.room !== undefined;
  const isEdge = step.kind === "inicio" || step.kind === "concluido";

  const enterStep = useEffectEvent(() => {
    if (property && step.kind !== "concluido") window.history.replaceState(null, "", setupStepHref(property.id, step, rooms.length));
    const target = contentRef.current?.querySelector<HTMLElement>("[data-autofocus]") ?? contentRef.current?.querySelector<HTMLElement>("[data-step-heading]");
    target?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  });

  useEffect(() => {
    enterStep();
  }, [key]);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => root.style.setProperty("--site-header-height", `${header.offsetHeight}px`));
    observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--site-header-height");
    };
  }, []);

  function goTo(index: number) {
    setError("");
    setCopied(false);
    setStepIndex(Math.max(0, Math.min(index, steps.length - 1)));
  }

  function goToStep(target: SetupStep, nextReturnTo: ReturnTo) {
    setReturnTo(nextReturnTo);
    goTo(steps.findIndex((item) => stepKey(item) === stepKey(target)));
  }

  function updateRoom(index: number, changes: Partial<RoomDraft>) {
    setError("");
    setRooms((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...changes } : item)));
  }

  function updateBeds(index: number, bed: BedType, quantity: number) {
    setError("");
    setRooms((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const beds = { ...item.beds, [bed]: quantity };
        return {
          ...item,
          beds,
          capacity: item.capacityEdited ? item.capacity : Math.max(suggestedCapacity(beds), 1),
        };
      }),
    );
  }

  function addressPayload() {
    return {
      postalCode: address.postalCode.replace(/\D/g, ""),
      street: address.street.trim(),
      number: address.number.trim(),
      complement: address.complement.trim() || null,
      neighborhood: address.neighborhood.trim(),
      city: address.city,
      state: address.state,
    };
  }

  async function patchProperty(body: Record<string, unknown>) {
    if (!property) return;
    const updated = propertyDetailSchema.parse(
      await sendApiRequest(`/owner/properties/${property.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    );
    setProperty(updated);
  }

  function roomPayload(draft: RoomDraft, priceCents: number) {
    return {
      title: draft.title.trim(),
      priceCents,
      capacity: draft.capacity,
      bathroomType: draft.bathroomType,
      acceptedAudiences: draft.acceptedAudiences,
      amenities: draft.amenities,
      beds: bedTypes.filter((bed) => draft.beds[bed] > 0).map((bed) => ({ type: bed, quantity: draft.beds[bed] })),
    };
  }

  async function saveRoom(index: number, create: boolean) {
    if (!property) return;
    const draft = rooms[index];
    const price = roomSchema.shape.price.safeParse(draft.price);
    if (!draft.id && !create) return;
    if (!price.success) return;
    const body = JSON.stringify(roomPayload(draft, price.data));
    const saved = roomDetailSchema.parse(
      draft.id
        ? await sendApiRequest(`/owner/rooms/${draft.id}`, {
            method: "PATCH",
            body,
          })
        : await sendApiRequest(`/owner/properties/${property.id}/rooms`, {
            method: "POST",
            body,
          }),
    );
    updateRoom(index, { id: saved.id, media: saved.media });
    const refreshed = propertyDetailSchema.parse(
      await sendApiRequest(`/owner/properties/${property.id}`, {
        method: "GET",
      }),
    );
    setProperty(refreshed);
  }

  function validate(): string {
    switch (step.kind) {
      case "endereco":
        if (address.postalCode.replace(/\D/g, "").length !== 8) return "Informe um CEP com 8 dígitos.";
        return firstError(
          propertyGuidedLocationSchema.safeParse({
            ...address,
            referencePoints: "",
          }),
        );
      case "tipo":
        return type ? "" : "Escolha uma opção.";
      case "nome":
        return isRoomStep ? firstError(roomSchema.shape.title.safeParse(room?.title ?? "")) : firstError(propertyGeneralSchema.shape.title.safeParse(title));
      case "descricao":
        return firstError(propertyGuidedGeneralSchema.shape.description.safeParse(description));
      case "camas":
        if (!room || bedCount(room.beds) === 0) return "Adicione pelo menos uma cama.";
        return room.capacity >= 1 && room.capacity <= maxCapacity ? "" : "A capacidade deve ficar entre 1 e 20 pessoas.";
      case "banheiro":
        return room?.bathroomType ? "" : "Escolha uma opção.";
      case "publico":
        return room && room.acceptedAudiences.length > 0 ? "" : "Selecione ao menos um público.";
      case "diaria":
        return firstError(roomSchema.shape.price.safeParse(room?.price ?? ""));
      default:
        return "";
    }
  }

  async function persist() {
    switch (step.kind) {
      case "endereco":
        await patchProperty(addressPayload());
        return;
      case "tipo":
        await patchProperty({ type });
        return;
      case "nome":
        if (step.room !== undefined) {
          await saveRoom(step.room, false);
        } else if (property) {
          await patchProperty({ title: title.trim() });
        } else {
          const created = propertyDetailSchema.parse(
            await sendApiRequest("/owner/properties", {
              method: "POST",
              body: JSON.stringify({
                title: title.trim(),
                type,
                ...addressPayload(),
              }),
            }),
          );
          setProperty(created);
        }
        return;
      case "descricao":
        await patchProperty({ description: description.trim() });
        return;
      case "areas": {
        if (!property) return;
        const updated = propertyDetailSchema.parse(
          await sendApiRequest(`/owner/properties/${property.id}/shared-areas`, {
            method: "PUT",
            body: JSON.stringify({
              areas: areas.map(({ id, type: areaType, label, description: areaDescription }) => ({
                id,
                type: areaType,
                label,
                description: areaDescription,
              })),
            }),
          }),
        );
        setProperty(updated);
        setAreas(updated.sharedAreas);
        return;
      }
      case "banheiros":
        await patchProperty({ sharedBathroomCount: sharedBathrooms });
        return;
      case "camas":
      case "banheiro":
      case "publico":
      case "comodidades":
        if (step.room !== undefined) await saveRoom(step.room, false);
        return;
      case "diaria":
        if (step.room !== undefined) await saveRoom(step.room, true);
        return;
      case "revisao":
        if (!property) return;
        await sendApiRequest(`/owner/properties/${property.id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "ACTIVE" }),
        });
        return;
    }
  }

  function targetAfter(): number {
    if (step.kind === "quartos") {
      const pending = rooms.findIndex((item) => !item.id);
      if (returnTo !== null) return pending >= 0 ? steps.findIndex((item) => item.kind === "nome" && item.room === pending) : reviewIndex;
      return stepIndex + 1;
    }
    if (returnTo === "property") return (step.kind === "areas" && areas.length > 0) || (step.kind === "banheiros" && sharedBathrooms > 0) ? stepIndex + 1 : reviewIndex;
    if (typeof returnTo === "number") return step.room === returnTo && step.kind !== "fotos" ? stepIndex + 1 : reviewIndex;
    return stepIndex + 1;
  }

  async function next() {
    if (saving || step.kind === "concluido") return;
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setSaving(true);
    try {
      await persist();
      const target = targetAfter();
      if (target === reviewIndex) setReturnTo(null);
      goTo(target);
    } catch (saveError) {
      setError(toErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  function back() {
    goTo(stepIndex - 1);
  }

  function pickAndAdvance(apply: () => void) {
    apply();
    setAutoAdvance((count) => count + 1);
  }

  const advance = useEffectEvent(() => void next());
  useEffect(() => {
    if (autoAdvance === 0) return;
    const timer = window.setTimeout(advance, 250);
    return () => window.clearTimeout(timer);
  }, [autoAdvance]);

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  function toggleArea(areaType: SharedAreaType) {
    setError("");
    setAreas((current) =>
      current.some((area) => area.type === areaType) ? current.filter((area) => area.type !== areaType) : [...current, { type: areaType, label: null, description: null, media: [] }],
    );
  }

  function toggleOtherArea(other: Area) {
    setAreas((current) => (current.some((area) => area.id === other.id) ? current.filter((area) => area.id !== other.id) : [...current, other]));
  }

  function changeRoomCount(count: number) {
    const target = Math.max(1, Math.min(maxRoomCount, count));
    if (target < rooms.length && rooms[rooms.length - 1].id) {
      setRemovingRoom(true);
      return;
    }
    setError("");
    setRooms((current) => (target < current.length ? current.slice(0, target) : [...current, ...Array.from({ length: target - current.length }, (_, index) => newRoom(current.length + index))]));
  }

  async function removeLastRoom() {
    const last = rooms[rooms.length - 1];
    if (!last?.id || !property) return;
    setSaving(true);
    try {
      await sendApiRequest(`/owner/rooms/${last.id}`, { method: "DELETE" });
      setRooms((current) => current.slice(0, -1));
      setProperty(
        propertyDetailSchema.parse(
          await sendApiRequest(`/owner/properties/${property.id}`, {
            method: "GET",
          }),
        ),
      );
    } catch (removeError) {
      setError(toErrorMessage(removeError));
    } finally {
      setSaving(false);
      setRemovingRoom(false);
    }
  }

  const shortcutActions = (): (() => void)[] => {
    switch (step.kind) {
      case "tipo":
        return propertyTypes.map((option) => () => pickAndAdvance(() => setType(option)));
      case "areas":
        return [...choiceAreaTypes.map((option) => () => toggleArea(option)), ...otherAreas.map((other) => () => toggleOtherArea(other))];
      case "banheiro":
        return step.room === undefined ? [] : bathroomTypes.map((option) => () => pickAndAdvance(() => updateRoom(step.room, { bathroomType: option })));
      case "publico":
        return step.room === undefined || !room
          ? []
          : genderIdentities.map(
              (option) => () =>
                updateRoom(step.room, {
                  acceptedAudiences: toggle(room.acceptedAudiences, option),
                }),
            );
      case "comodidades":
        return step.room === undefined || !room
          ? []
          : roomAmenities.map(
              (option) => () =>
                updateRoom(step.room, {
                  amenities: toggle(room.amenities, option),
                }),
            );
      default:
        return [];
    }
  };

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (removingRoom || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    const tag = target?.tagName ?? "";
    if (target?.closest("[role=dialog], [role=listbox], [role=combobox]")) return;
    if (event.key === "Enter" && !event.shiftKey) {
      if (tag === "TEXTAREA" || tag === "BUTTON" || tag === "A" || step.kind === "concluido") return;
      event.preventDefault();
      void next();
      return;
    }
    if (tag === "INPUT" || tag === "TEXTAREA" || event.key.length !== 1) return;
    const action = shortcutActions()[shortcutKeys.indexOf(event.key.toUpperCase())];
    if (action) {
      event.preventDefault();
      action();
    }
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKeyDown(event);
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, []);

  const roomLabel = room?.title.trim() || (step.room !== undefined ? `Quarto ${step.room + 1}` : "");
  const currentMedia = step.kind === "fotos" ? (room ? room.media : propertyMedia) : step.kind === "fotos-areas"
          ? areas.flatMap((area) => area.media)
          : step.kind === "fotos-banheiros"
            ? (property?.sharedBathrooms ?? []).flatMap((bathroom) => bathroom.media)
            : null;
  const nextLabel = (() => {
    if (step.kind === "inicio") return "Começar";
    if (step.kind === "revisao") return "Publicar imóvel";
    if (returnTo !== null && targetAfter() === reviewIndex) return "Salvar e voltar à revisão";
    if (currentMedia && currentMedia.length === 0) return "Pular por enquanto";
    if (step.kind === "fotos" && step.room !== undefined) return step.room < rooms.length - 1 ? `Ir para o Quarto ${step.room + 2}` : "Revisar";
    if (step.kind === "diaria") return "Salvar quarto";
    if (step.kind === "quartos") return `Cadastrar ${rooms.length} ${rooms.length > 1 ? "quartos" : "quarto"}`;
    return "Continuar";
  })();
  const stageIndex = isRoomStep || step.kind === "quartos" ? 2 : step.kind === "areas" || step.kind === "fotos-areas" || step.kind === "banheiros" || step.kind === "fotos-banheiros" ? 1 : isEdge || step.kind === "revisao" ? null : 0;
  const stage = stageIndex === null ? null : welcomeStages[stageIndex];
  const sectionLabel = isEdge ? "" : isRoomStep ? `Quarto ${(step.room ?? 0) + 1} de ${rooms.length}` : step.kind === "revisao" ? "Revisão" : stageIndex === 0 ? "Imóvel" : (stage?.title ?? "");
  const progress = Math.round((Math.min(stepIndex, steps.length - 2) / (steps.length - 2)) * 100);
  const addressLine = address.street
    ? `${address.street}${address.number ? `, ${address.number}` : ""}${address.complement ? ` – ${address.complement}` : ""} · ${address.city}/${address.state}`
    : "Endereço pendente";
  const totalCapacity = rooms.reduce((total, item) => total + (item.id ? item.capacity : 0), 0);
  const savedAreas = areas.filter((area): area is Area & { id: string } => Boolean(area.id));
  const missing = property?.missingRequirements ?? [];
  const canBack = stepIndex > 0 && step.kind !== "concluido";
  const showPanel = !isEdge && step.kind !== "revisao";

  function priceText(draft: RoomDraft): string {
    const price = roomSchema.shape.price.safeParse(draft.price);
    return price.success ? formatCents(price.data) : "—";
  }

  function renderStep() {
    switch (step.kind) {
      case "inicio":
        return (
          <div className="flex flex-1 flex-col justify-between gap-6 sm:justify-start sm:gap-8 max-lg:[@container(max-height:30rem)]:gap-4 lg:grid lg:flex-none lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-x-24">
            <div className="flex flex-col gap-3 sm:gap-5 lg:gap-6">
              <h1
                tabIndex={-1}
                data-step-heading
                className="text-3xl leading-[1.05] font-extrabold tracking-tight text-balance text-(--text-primary) outline-none sm:text-5xl xl:text-6xl max-lg:[@container(max-height:30rem)]:text-[1.75rem]"
              >
                Vamos colocar seu imóvel no ar.
              </h1>
              <p className="max-w-[44ch] text-base leading-relaxed text-pretty text-(--text-secondary) sm:text-lg max-lg:[@container(max-height:30rem)]:text-sm max-lg:[@container(max-height:23rem)]:hidden [@container(max-height:17rem)]:hidden">
                Primeiro o endereço e as áreas comuns. Depois, cada quarto, um de cada vez. Leva cerca de 5 minutos.
              </p>
              <ul className="flex flex-col gap-2.5 text-sm text-(--text-primary) max-lg:[@container(max-height:42rem)]:hidden lg:[@container(max-height:26rem)]:hidden lg:mt-2">
                <li className="flex items-start gap-2.5">
                  <LuDoorOpen aria-hidden="true" size={18} className="mt-px shrink-0 text-(--primary-text)" />
                  <span>Cada quarto vira um anúncio próprio, com diária, fotos e disponibilidade.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <LuCamera aria-hidden="true" size={18} className="mt-px shrink-0 text-(--primary-text)" />
                  <span>Tenha à mão o CEP do imóvel e fotos dos ambientes.</span>
                </li>
              </ul>
              <p className="hidden items-center gap-1.5 text-sm font-semibold text-(--text-secondary) [@container(max-height:17rem)]:flex">
                {welcomeStages.map((stage, index) => (
                  <span key={stage.title} className="flex items-center gap-1.5">
                    {index > 0 ? <LuArrowRight aria-hidden="true" size={14} /> : null}
                    {stage.short}
                  </span>
                ))}
              </p>
              <div className="hidden items-center gap-4 lg:mt-4 lg:flex">
                <button type="button" onClick={() => void next()} className={`${primaryButtonClassName} h-13 px-8`}>
                  Começar
                  <LuArrowRight aria-hidden="true" size={18} />
                </button>
                <span className="flex items-center gap-1.5 text-xs text-(--text-secondary)">
                  ou pressione
                  <kbd className="rounded-md border border-(--border-strong) bg-(--surface) px-1.5 py-0.5 font-sans text-[0.6875rem] font-bold text-(--text-primary) shadow-[0_1px_0_var(--border)]">
                    Enter
                  </kbd>
                </span>
              </div>
            </div>
            <ol aria-label="Etapas do cadastro" className="flex flex-col [@container(max-height:17rem)]:hidden lg:pt-3">
              {welcomeStages.map((stage, index) => {
                const Icon = stage.icon;
                const last = index === welcomeStages.length - 1;
                return (
                  <li
                    key={stage.title}
                    className={`relative flex items-start gap-4 ${last ? "" : "pb-5 sm:pb-7 lg:pb-9 max-lg:[@container(max-height:30rem)]:pb-3"}`}
                  >
                    {last ? null : <span aria-hidden="true" className="absolute top-11 bottom-1 left-5 w-px bg-(--border) sm:top-12 sm:left-5.5" />}
                    <span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-full sm:size-11 ${stage.tone}`}>
                      <Icon size={20} />
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5 pt-1.5 sm:gap-1 sm:pt-2">
                      <span className="flex items-baseline gap-2 max-lg:[@container(max-height:26rem)]:hidden">
                        <span className="text-xs font-semibold text-(--text-secondary) tabular-nums">Etapa {index + 1}</span>
                        {index === 0 ? <span className="text-xs font-bold text-(--primary-text)">· você começa aqui</span> : null}
                      </span>
                      <span className="text-base font-bold text-(--text-primary) sm:text-lg">{stage.title}</span>
                      <span className="text-sm leading-snug text-(--text-secondary) sm:leading-relaxed max-lg:[@container(max-height:34rem)]:hidden lg:[@container(max-height:22rem)]:hidden">
                        {stage.detail}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="sm:mt-2 lg:hidden">
              <button type="button" onClick={() => void next()} className={`${primaryButtonClassName} h-13 w-full sm:w-auto sm:px-8`}>
                Começar
                <LuArrowRight aria-hidden="true" size={18} />
              </button>
            </div>
          </div>
        );
      case "endereco":
        return (
          <WizardAddressStep
            address={address}
            onChange={(changes) => {
              setError("");
              setAddress((current) => ({ ...current, ...changes }));
            }}
          />
        );
      case "tipo":
        return (
          <div className="flex flex-col gap-4 sm:gap-5">
            <StepHeading title="Que tipo de hospedagem é?" />
            <div role="radiogroup" aria-label="Tipo do imóvel" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {propertyTypes.map((option, index) => (
                <ChoiceOption key={option} icon={propertyTypeIcons[option]} shortcut={shortcutKeys[index]} selected={type === option} onSelect={() => pickAndAdvance(() => setType(option))}>
                  {propertyTypeLabels[option]}
                </ChoiceOption>
              ))}
            </div>
          </div>
        );
      case "nome":
        if (step.room !== undefined && room) {
          const previous = step.room > 0 ? rooms[step.room - 1] : undefined;
          const roomIndex = step.room;
          return (
            <div className="flex flex-col gap-4 sm:gap-5">
              <StepHeading title="Como se chama este quarto?" description="Ex.: Suíte Master, Quarto Azul, Quarto do Jardim." />
              <label htmlFor="wizard-room-title" className="sr-only">
                Nome do quarto
              </label>
              <input
                id="wizard-room-title"
                data-autofocus
                value={room.title}
                onChange={(event) => updateRoom(roomIndex, { title: event.target.value })}
                onFocus={(event) => event.target.select()}
                className="w-full border-0 border-b-2 border-(--border-strong) bg-transparent py-2 text-3xl font-bold text-(--text-primary) outline-none transition-colors focus:border-(--primary)"
              />
              {previous ? (
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-(--border-strong) px-4 py-3.5">
                  <span className="min-w-52 flex-1 text-sm text-(--text-secondary)">É parecido com o {previous.title}? Copie camas, capacidade, banheiro, público, comodidades e diária.</span>
                  <button
                    type="button"
                    className={secondaryButtonClassName}
                    onClick={() => {
                      updateRoom(roomIndex, {
                        beds: { ...previous.beds },
                        capacity: previous.capacity,
                        capacityEdited: previous.capacityEdited,
                        bathroomType: previous.bathroomType,
                        acceptedAudiences: [...previous.acceptedAudiences],
                        amenities: [...previous.amenities],
                        price: previous.price,
                      });
                      setCopied(true);
                    }}
                  >
                    {copied ? (
                      <>
                        <LuCheck aria-hidden="true" size={16} /> Copiado
                      </>
                    ) : (
                      `Copiar do ${previous.title}`
                    )}
                  </button>
                </div>
              ) : null}
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-4 sm:gap-5">
            <StepHeading title="Como os hóspedes vão encontrar seu imóvel?" description="Um nome curto que descreva o lugar." />
            <label htmlFor="wizard-title" className="sr-only">
              Nome do imóvel
            </label>
            <input
              id="wizard-title"
              data-autofocus
              placeholder="Ex.: Casa da Serra com vista"
              value={title}
              onChange={(event) => {
                setError("");
                setTitle(event.target.value);
              }}
              className="w-full border-0 border-b-2 border-(--border-strong) bg-transparent py-2 text-3xl font-bold text-(--text-primary) outline-none transition-colors placeholder:text-(--border-strong) focus:border-(--primary)"
            />
          </div>
        );
      case "descricao":
        return (
          <div className="flex flex-col gap-4 sm:gap-5">
            <StepHeading title={`Conte como é o ${title.trim() || "imóvel"}.`} description="Ambiente, vizinhança, o que torna a estadia especial. Aparece no anúncio." />
            <label htmlFor="wizard-description" className="sr-only">
              Descrição do imóvel
            </label>
            <textarea
              id="wizard-description"
              data-autofocus
              rows={7}
              maxLength={5000}
              value={description}
              onChange={(event) => {
                setError("");
                setDescription(event.target.value);
              }}
              className={`${fieldClassName} resize-y leading-relaxed`}
            />
          </div>
        );
      case "fotos":
        if (step.room !== undefined && room?.id) {
          const roomIndex = step.room;
          return (
            <div className="flex flex-col gap-4 sm:gap-5">
              <StepHeading title={`Fotos e vídeos do ${roomLabel}`} description="Cama, vista da janela, banheiro. A primeira vira a capa do quarto." />
              <MediaGallery
                compact
                key={room.id}
                label={`Fotos do ${roomLabel}`}
                basePath={`/owner/rooms/${room.id}`}
                initialMedia={room.media}
                allowVideo
                maxImages={20}
                maxVideos={3}
                onChange={(media) => updateRoom(roomIndex, { media })}
              />
            </div>
          );
        }
        return property ? (
          <div className="flex flex-col gap-4 sm:gap-5">
            <StepHeading title={`Mostre o ${title.trim() || "imóvel"} por fora e por inteiro.`} description="Fachada, vista, entrada, um vídeo de tour. A primeira mídia vira a capa do anúncio." />
            <MediaGallery
              compact
              label="Fotos do imóvel"
              basePath={`/owner/properties/${property.id}`}
              initialMedia={propertyMedia}
              allowVideo
              maxImages={30}
              maxVideos={3}
              onChange={setPropertyMedia}
            />
          </div>
        ) : null;
      case "areas":
        return (
          <div className="flex flex-col gap-4 sm:gap-5">
            <StepHeading title="Quais cômodos os hóspedes compartilham?" description="Selecione todos que se aplicam. Esses espaços valem para todos os quartos." />
            <div role="group" aria-label="Áreas compartilhadas" className="flex flex-wrap gap-2 lg:grid lg:grid-cols-3 lg:gap-2.5">
              {choiceAreaTypes.map((option, index) => (
                <ChoiceOption
                  key={option}
                  multiple
                  chip
                  icon={sharedAreaTypeIcons[option]}
                  shortcut={shortcutKeys[index]}
                  selected={areas.some((area) => area.type === option)}
                  onSelect={() => toggleArea(option)}
                >
                  {sharedAreaTypeLabels[option]}
                </ChoiceOption>
              ))}
              {otherAreas.map((other, index) => (
                <ChoiceOption
                  key={other.id}
                  multiple
                  chip
                  icon={sharedAreaTypeIcons.OTHER}
                  shortcut={shortcutKeys[choiceAreaTypes.length + index]}
                  selected={areas.some((area) => area.id === other.id)}
                  onSelect={() => toggleOtherArea(other)}
                >
                  {other.label ?? sharedAreaTypeLabels.OTHER}
                </ChoiceOption>
              ))}
            </div>
          </div>
        );
      case "fotos-areas":
        return property ? (
          <div className="flex flex-col gap-4 sm:gap-5">
            <StepHeading title="Adicione uma foto de cada área." description="Opcional, mas anúncios com fotos de todos os espaços recebem mais reservas." />
            <PhotoProgress done={savedAreas.filter((area) => area.media.length > 0).length} total={savedAreas.length} noun={savedAreas.length === 1 ? "área" : "áreas"} />
            <ul className="flex flex-col">
              {savedAreas.map((area) => {
                const name = area.label ?? sharedAreaTypeLabels[area.type];
                return (
                  <PhotoRow key={area.id} icon={sharedAreaTypeIcons[area.type]} name={name}>
                    <MediaGallery
                      compact
                      label={`Fotos da área ${name}`}
                      basePath={`/owner/properties/${property.id}/shared-areas/${area.id}`}
                      initialMedia={area.media}
                      allowVideo={false}
                      maxImages={1}
                      onChange={(media) => setAreas((current) => current.map((item) => (item.id === area.id ? { ...item, media } : item)))}
                    />
                  </PhotoRow>
                );
              })}
            </ul>
          </div>
        ) : null;
      case "banheiros":
        return (
          <div className="flex flex-col gap-4 sm:gap-5">
            <StepHeading title="Quantos banheiros ficam nas áreas comuns?" description="Não conte os banheiros que ficam dentro dos quartos." />
            <Counter label="Banheiros nas áreas comuns" value={sharedBathrooms} min={0} max={maxSharedBathrooms} onChange={setSharedBathrooms} />
          </div>
        );
      case "fotos-banheiros":
        return property ? (
          <div className="flex flex-col gap-4 sm:gap-5">
            <StepHeading title="Adicione uma foto de cada banheiro." description="Opcional. Mostra ao hóspede como são os banheiros das áreas comuns." />
            <PhotoProgress
              done={property.sharedBathrooms.filter((bathroom) => bathroom.media.length > 0).length}
              total={property.sharedBathrooms.length}
              noun={property.sharedBathrooms.length === 1 ? "banheiro" : "banheiros"}
            />
            <ul className="flex flex-col">
              {property.sharedBathrooms.map((bathroom, index) => (
                <PhotoRow key={bathroom.id} icon={LuShowerHead} name={`Banheiro ${index + 1}`}>
                  <MediaGallery
                    compact
                    label={`Foto do banheiro ${index + 1}`}
                    basePath={`/owner/properties/${property.id}/shared-bathrooms/${bathroom.id}`}
                    initialMedia={bathroom.media}
                    allowVideo={false}
                    maxImages={1}
                    onChange={(media) =>
                      setProperty((current) =>
                        current ? { ...current, sharedBathrooms: current.sharedBathrooms.map((item) => (item.id === bathroom.id ? { ...item, media } : item)) } : current,
                      )
                    }
                  />
                </PhotoRow>
              ))}
            </ul>
          </div>
        ) : null;
      case "quartos":
        return (
          <div className="flex flex-col gap-4 sm:gap-5">
            <StepHeading title="Quantos quartos você vai disponibilizar?" description="Na sequência você cadastra cada um deles." />
            <Counter label="Quantidade de quartos" value={rooms.length} min={1} max={maxRoomCount} onChange={changeRoomCount} />
            <ul className="flex flex-wrap gap-2">
              {rooms.map((item, index) => (
                <li key={item.id ?? index} className="flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-1.5 text-sm font-semibold text-(--text-primary)">
                  {item.id ? <LuCheck aria-hidden="true" size={14} className="text-(--primary-text)" /> : <span aria-hidden="true" className="size-2 rounded-sm bg-(--primary)" />}
                  {item.title}
                  {item.id ? <span className="sr-only">(salvo)</span> : null}
                </li>
              ))}
            </ul>
          </div>
        );
      case "camas":
        if (step.room === undefined || !room) return null;
        {
          const roomIndex = step.room;
          const suggestion = suggestedCapacity(room.beds);
          return (
            <div className="flex flex-col gap-4 sm:gap-5">
              <StepHeading title={`Quais camas tem no ${roomLabel}?`} />
              <ul className="grid grid-cols-2 gap-x-4 border-t border-(--border) sm:grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
                {bedTypes.map((bed) => {
                  const BedIcon = bedTypeIcons[bed];
                  return (
                    <li key={bed} className="flex flex-col gap-1.5 border-b border-(--border) py-2 sm:flex-row sm:items-center sm:gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                        <BedIcon aria-hidden="true" size={18} className={`shrink-0 ${room.beds[bed] > 0 ? "text-(--lavender)" : "text-(--text-secondary)"}`} />
                        <div className="flex min-w-0 flex-col">
                          <span className="font-semibold text-(--text-primary)">{bedTypeLabels[bed]}</span>
                          <span className="text-xs text-(--text-secondary) max-sm:hidden">{bedCapacity[bed] > 1 ? `${bedCapacity[bed]} pessoas` : "1 pessoa"}</span>
                        </div>
                      </div>
                      <Counter size="compact" label={`Camas ${bedTypeLabels[bed]}`} value={room.beds[bed]} min={0} max={10} onChange={(quantity) => updateBeds(roomIndex, bed, quantity)} />
                    </li>
                  );
                })}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-(--lavender-soft) px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <LuUsers aria-hidden="true" size={20} className="shrink-0 text-(--lavender)" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-(--text-primary)">Capacidade do quarto</span>
                    <span className="text-sm text-(--text-secondary)">
                      {suggestion > 0 ? `Pelas camas, até ${suggestion} ${suggestion > 1 ? "hóspedes" : "hóspede"}` : "Adicione camas para sugerir a capacidade"}
                    </span>
                  </div>
                </div>
                <Counter size="compact" label="Capacidade" value={room.capacity} min={1} max={maxCapacity} onChange={(capacity) => updateRoom(roomIndex, { capacity, capacityEdited: true })} />
              </div>
            </div>
          );
        }
      case "banheiro":
        if (step.room === undefined || !room) return null;
        {
          const roomIndex = step.room;
          return (
            <div className="flex flex-col gap-4 sm:gap-5">
              <StepHeading title={`O ${roomLabel} tem banheiro próprio?`} />
              <div role="radiogroup" aria-label="Banheiro do quarto" className="flex flex-col gap-3">
                {bathroomTypes.map((option, index) => (
                  <ChoiceOption
                    key={option}
                    icon={option === "PRIVATE" ? LuBath : LuUsers}
                    shortcut={shortcutKeys[index]}
                    selected={room.bathroomType === option}
                    hint={option === "PRIVATE" ? "Banheiro exclusivo, dentro do quarto" : "Usa os banheiros das áreas comuns"}
                    onSelect={() => pickAndAdvance(() => updateRoom(roomIndex, { bathroomType: option }))}
                  >
                    {bathroomTypeLabels[option]}
                  </ChoiceOption>
                ))}
              </div>
            </div>
          );
        }
      case "publico":
        if (step.room === undefined || !room) return null;
        {
          const roomIndex = step.room;
          return (
            <div className="flex flex-col gap-4 sm:gap-5">
              <StepHeading title={`Quem pode se hospedar no ${roomLabel}?`} description="Selecione todos os públicos aceitos." />
              <div role="group" aria-label="Público aceito" className="flex flex-wrap gap-2 lg:grid lg:grid-cols-2 lg:gap-2.5">
                {genderIdentities.map((option, index) => (
                  <ChoiceOption
                    key={option}
                    multiple
                    chip
                    icon={LuUser}
                    shortcut={shortcutKeys[index]}
                    selected={room.acceptedAudiences.includes(option)}
                    onSelect={() =>
                      updateRoom(roomIndex, {
                        acceptedAudiences: toggle(room.acceptedAudiences, option),
                      })
                    }
                  >
                    {genderIdentityLabels[option]}
                  </ChoiceOption>
                ))}
              </div>
            </div>
          );
        }
      case "comodidades":
        if (step.room === undefined || !room) return null;
        {
          const roomIndex = step.room;
          return (
            <div className="flex flex-col gap-4 sm:gap-5">
              <StepHeading title={`O que tem dentro do ${roomLabel}?`} description="Selecione todos que se aplicam." />
              <div role="group" aria-label="Comodidades do quarto" className="flex flex-wrap gap-2 lg:grid lg:grid-cols-3 lg:gap-2.5">
                {roomAmenities.map((option, index) => (
                  <ChoiceOption
                    key={option}
                    multiple
                    chip
                    icon={roomAmenityIcons[option]}
                    shortcut={shortcutKeys[index]}
                    selected={room.amenities.includes(option)}
                    onSelect={() =>
                      updateRoom(roomIndex, {
                        amenities: toggle(room.amenities, option),
                      })
                    }
                  >
                    {roomAmenityLabels[option]}
                  </ChoiceOption>
                ))}
              </div>
            </div>
          );
        }
      case "diaria":
        if (step.room === undefined || !room) return null;
        {
          const roomIndex = step.room;
          return (
            <div className="flex flex-col gap-4 sm:gap-5">
              <StepHeading title={`Qual o valor da diária do ${roomLabel}?`} description="Valor por noite. Você pode ajustar depois." />
              <div className="flex items-baseline gap-3 border-b-2 border-(--border-strong) py-2 transition-colors focus-within:border-(--primary)">
                <span aria-hidden="true" className="text-3xl font-bold text-(--text-secondary)">
                  R$
                </span>
                <label htmlFor="wizard-price" className="sr-only">
                  Valor da diária em reais
                </label>
                <input
                  id="wizard-price"
                  data-autofocus
                  inputMode="decimal"
                  placeholder="0,00"
                  value={room.price}
                  onChange={(event) =>
                    updateRoom(roomIndex, {
                      price: event.target.value.replace(/[^\d.,]/g, ""),
                    })
                  }
                  className="min-w-0 flex-1 border-0 bg-transparent text-4xl font-extrabold text-(--text-primary) tabular-nums outline-none placeholder:text-(--border-strong)"
                />
                <span className="text-sm text-(--text-secondary)">/ noite</span>
              </div>
            </div>
          );
        }
      case "revisao":
        return (
          <div className="flex flex-col gap-4 sm:gap-5">
            <StepHeading title="Confira antes de publicar" />
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-8">
              <dl className="divide-y divide-(--border) overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
                {(
                  [
                    ["Endereço", addressLine, { kind: "endereco" }],
                    ["Tipo", type ? propertyTypeLabels[type] : "—", { kind: "tipo" }],
                    ["Nome", title || "—", { kind: "nome" }],
                    ["Descrição", description || "—", { kind: "descricao" }],
                    ["Fotos e vídeos do imóvel", mediaText(propertyMedia), { kind: "fotos" }],
                    [
                      "Áreas compartilhadas",
                      areas.length > 0 ? areas.map((area) => `${area.label ?? sharedAreaTypeLabels[area.type]} (${mediaText(area.media).toLowerCase()})`).join(", ") : "Nenhuma",
                      { kind: "areas" },
                    ],
                    [
                      "Banheiros nas áreas comuns",
                      sharedBathrooms > 0 ? `${sharedBathrooms} (${mediaText((property?.sharedBathrooms ?? []).flatMap((bathroom) => bathroom.media)).toLowerCase()})` : "0",
                      { kind: "banheiros" },
                    ],
                    ["Quantidade de quartos", String(rooms.length), { kind: "quartos" }],
                  ] satisfies [string, string, SetupStep][]
                ).map(([label, value, target]) => (
                  <div key={label} className="flex items-start gap-3 px-4 py-3">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <dt className="text-xs font-semibold text-(--text-secondary)">{label}</dt>
                      <dd className="line-clamp-3 text-sm leading-relaxed wrap-break-word text-(--text-primary)">{value}</dd>
                    </div>
                    <button
                      type="button"
                      aria-label={`Editar ${label.toLowerCase()}`}
                      onClick={() => goToStep(target, "property")}
                      className="shrink-0 py-1 text-sm font-semibold text-(--primary-text) underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-(--focus-ring)"
                    >
                      Editar
                    </button>
                  </div>
                ))}
              </dl>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h2 className="text-xl font-extrabold text-(--text-primary)">
                    {rooms.length} {rooms.length > 1 ? "quartos" : "quarto"}
                  </h2>
                  <span className="text-sm text-(--text-secondary)">até {totalCapacity} hóspedes no total</span>
                </div>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {rooms.map((item, index) => {
                    const cover = item.media[0];
                    return (
                      <li key={item.id ?? index} className="flex flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
                        {cover ? (
                          <div className="relative aspect-16/10 bg-(--surface-raised)">
                            {cover.type === MediaKind.IMAGE ? (
                              <Image src={cover.url} alt="" fill sizes="(min-width: 640px) 320px, 100vw" className="object-cover" />
                            ) : (
                              <video src={cover.url} muted playsInline preload="metadata" className="size-full object-cover" />
                            )}
                          </div>
                        ) : null}
                        <div className="flex flex-col gap-1.5 p-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-bold text-(--text-secondary) tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                            <span className="flex-1 font-bold wrap-break-word text-(--text-primary)">{item.title}</span>
                            <button
                              type="button"
                              aria-label={`Editar ${item.title}`}
                              onClick={() => goToStep({ kind: "nome", room: index }, index)}
                              className="shrink-0 text-sm font-semibold text-(--primary-text) underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-(--focus-ring)"
                            >
                              Editar
                            </button>
                          </div>
                          {item.id ? (
                            <>
                              <span className="text-sm text-(--text-secondary)">
                                {bedsText(item.beds)} · {item.capacity} hósp.
                              </span>
                              <span className="text-sm text-(--text-secondary)">Banheiro {item.bathroomType ? bathroomTypeLabels[item.bathroomType].toLowerCase() : "—"}</span>
                              <span className="text-sm text-(--text-secondary)">{item.acceptedAudiences.map((audience) => genderIdentityLabels[audience]).join(", ")}</span>
                              <span className="text-xs text-(--text-secondary)">{item.amenities.map((amenity) => labelOf(roomAmenityLabels, amenity)).join(", ") || "Sem comodidades extras"}</span>
                              <span className="text-xs text-(--text-secondary)">{mediaText(item.media)}</span>
                              <span className="mt-1 text-lg font-extrabold text-(--text-primary) tabular-nums">{priceText(item)} / noite</span>
                            </>
                          ) : (
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-(--warning)">
                              <LuCircleAlert aria-hidden="true" size={16} /> Não salvo ainda
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            {missing.length > 0 ? (
              <div role="status" className="flex flex-col gap-2 rounded-2xl border border-(--warning)/40 bg-(--warning-soft) px-4 py-3.5">
                <span className="text-sm font-bold text-(--text-primary)">Para publicar, falta:</span>
                <ul className="list-inside list-disc text-sm text-(--text-primary)">
                  {missing.map((requirement) => (
                    <li key={requirement}>{requirementLabels[requirement]}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="flex items-center gap-2 text-sm text-(--text-secondary)">
              <LuEyeOff aria-hidden="true" size={16} className="shrink-0" />
              Regras da casa, comodidades do imóvel e pontos de referência podem ser completados depois, na edição.
            </p>
          </div>
        );
      case "concluido": {
        const cover = propertyMedia.find((item) => item.type === MediaKind.IMAGE) ?? propertyMedia[0];
        const savedRooms = rooms.filter((item) => item.id);
        const nextSteps = property
          ? [
              {
                icon: LuNotebookPen,
                tone: "bg-(--primary-soft) text-(--primary-text)",
                title: "Complete regras e comodidades",
                detail: "Regras da casa, características e pontos de referência deixam o anúncio completo.",
                href: `/meus-imoveis/${property.id}/editar?secao=geral`,
              },
              {
                icon: LuCalendarDays,
                tone: "bg-(--lavender-soft) text-(--lavender)",
                title: "Ajuste a disponibilidade dos quartos",
                detail: "Bloqueie datas e dias da semana em que cada quarto não recebe hóspedes.",
                href: `/meus-imoveis/${property.id}`,
              },
              {
                icon: LuEye,
                tone: "bg-(--champagne-soft) text-(--champagne)",
                title: "Veja como o hóspede vê",
                detail: "Abra a prévia da página pública do imóvel.",
                href: `/imoveis/${property.id}?previa=1`,
              },
            ]
          : [];
        return (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-x-16">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-(--success-soft) text-(--success)">
                  <LuCheck size={24} strokeWidth={2.5} />
                </span>
                <StepHeading title="Tudo certo, seu imóvel foi publicado." description="Os quartos disponíveis já podem ser encontrados e reservados pelos hóspedes." />
              </div>
              {nextSteps.length > 0 ? (
                <section aria-labelledby="next-steps-heading" className="flex flex-col gap-1">
                  <h2 id="next-steps-heading" className="text-sm font-bold text-(--text-primary)">
                    Próximos passos
                  </h2>
                  <ul className="flex flex-col">
                    {nextSteps.map((item) => (
                      <li key={item.title} className="border-b border-(--border) last:border-b-0">
                        <Link
                          href={item.href}
                          className="group flex items-center gap-3.5 rounded-xl py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                        >
                          <span aria-hidden="true" className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${item.tone}`}>
                            <item.icon size={18} />
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="text-sm font-semibold text-(--text-primary) group-hover:text-(--primary-text)">{item.title}</span>
                            <span className="text-xs leading-relaxed text-(--text-secondary)">{item.detail}</span>
                          </span>
                          <LuArrowRight aria-hidden="true" size={16} className="shrink-0 text-(--text-secondary) transition-transform group-hover:translate-x-0.5 group-hover:text-(--primary-text)" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              <div className="flex flex-wrap gap-3">
                {property ? (
                  <Link href={`/meus-imoveis/${property.id}`} className={primaryButtonClassName}>
                    Ver painel do imóvel
                    <LuArrowRight aria-hidden="true" size={16} />
                  </Link>
                ) : null}
                <Link href="/meus-imoveis/novo" className={secondaryButtonClassName}>
                  Cadastrar outro imóvel
                </Link>
              </div>
            </div>

            <article aria-label="Resumo do anúncio" className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
              <div className="relative aspect-video bg-(--surface-raised)">
                {cover?.type === MediaKind.IMAGE ? (
                  <Image src={cover.url} alt="" fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
                ) : cover ? (
                  <video src={cover.url} muted playsInline preload="metadata" className="size-full object-cover" />
                ) : (
                  <span aria-hidden="true" className="flex size-full items-center justify-center text-(--text-secondary)">
                    <LuCamera size={28} />
                  </span>
                )}
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-(--success-soft) px-2.5 py-1 text-xs font-bold text-(--success)">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-(--success)" />
                  Publicado
                </span>
              </div>
              <div className="flex flex-col gap-1 px-5 pt-4">
                <h2 className="text-lg leading-snug font-extrabold tracking-tight text-balance text-(--text-primary)">{title.trim()}</h2>
                <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-(--text-secondary)">
                  {type ? <span>{propertyTypeLabels[type]}</span> : null}
                  {type ? <span aria-hidden="true">·</span> : null}
                  <LuMapPin aria-hidden="true" size={14} className="shrink-0" />
                  {address.city}/{address.state}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 pt-3 pb-4 text-sm text-(--text-secondary)">
                <span className="inline-flex items-center gap-1.5">
                  <LuDoorOpen aria-hidden="true" size={15} className="text-(--lavender)" />
                  <strong className="font-bold text-(--text-primary) tabular-nums">{savedRooms.length}</strong> {savedRooms.length === 1 ? "quarto" : "quartos"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <LuUsers aria-hidden="true" size={15} className="text-(--lavender)" />
                  até <strong className="font-bold text-(--text-primary) tabular-nums">{totalCapacity}</strong> hóspedes
                </span>
                {areas.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <LuSofa aria-hidden="true" size={15} className="text-(--champagne)" />
                    <strong className="font-bold text-(--text-primary) tabular-nums">{areas.length}</strong> {areas.length === 1 ? "área" : "áreas"}
                  </span>
                ) : null}
              </div>
              <ul className="divide-y divide-(--border) border-t border-(--border)">
                {savedRooms.map((item) => {
                  const roomCover = item.media.find((media) => media.type === MediaKind.IMAGE);
                  return (
                    <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                      <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-(--lavender-soft) text-(--lavender)">
                        {roomCover ? (
                          <Image src={roomCover.url} alt="" fill sizes="40px" className="object-cover" />
                        ) : (
                          <LuBedDouble aria-hidden="true" size={18} className="absolute inset-0 m-auto" />
                        )}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-semibold text-(--text-primary)">{item.title}</span>
                        <span className="text-xs text-(--text-secondary)">
                          {item.capacity} {item.capacity === 1 ? "hóspede" : "hóspedes"}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-(--text-primary) tabular-nums">
                        {priceText(item)}
                        <span className="font-normal text-(--text-secondary)"> /noite</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </article>
          </div>
        );
      }
    }
  }

  const disableNext = saving || (step.kind === "revisao" && missing.length > 0);

  return (
    <div className="flex h-[calc(100svh-var(--site-header-height,4.0625rem))] flex-col md:h-[calc(100svh-var(--site-header-height,4.5625rem))]">
      <div className="shrink-0 bg-(--background)">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href={property ? `/meus-imoveis/${property.id}` : "/meus-imoveis"}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-(--text-secondary) transition-colors hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-(--focus-ring)"
          >
            <LuArrowLeft aria-hidden="true" size={16} />
            {property ? "Salvar e sair" : "Meus imóveis"}
          </Link>
          {stage ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
              <span aria-hidden="true" className={`flex size-6 items-center justify-center rounded-full ${stage.tone}`}>
                <stage.icon size={13} />
              </span>
              {sectionLabel}
              {isRoomStep ? (
                <span aria-hidden="true" className="ml-1 flex gap-1">
                  {rooms.map((item, index) => (
                    <span
                      key={item.id ?? index}
                      className={`h-1.5 rounded-full transition-all ${index === step.room ? "w-4 bg-(--lavender)" : index < (step.room ?? 0) ? "w-1.5 bg-(--lavender)/45" : "w-1.5 bg-(--border-strong)"}`}
                    />
                  ))}
                </span>
              ) : null}
            </span>
          ) : (
            <span className="text-sm font-semibold text-(--text-secondary)">{sectionLabel}</span>
          )}
        </div>
        {step.kind === "inicio" ? (
          <div aria-hidden="true" className="h-1 border-b border-(--border)" />
        ) : (
          <progress
            aria-label="Progresso do cadastro"
            value={progress}
            max={100}
            className="block h-1 w-full appearance-none bg-(--border) [&::-moz-progress-bar]:bg-(--primary) [&::-webkit-progress-bar]:bg-(--border) [&::-webkit-progress-value]:bg-(--primary) [&::-webkit-progress-value]:transition-all"
          />
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        <main
          className={`flex min-h-0 min-w-0 flex-1 justify-center px-4 sm:px-6 lg:items-center lg:px-14 ${
            step.kind === "inicio" ? "overflow-y-auto pt-5 pb-[6.75rem] [container-type:size] sm:pt-10 md:items-center md:pb-10 lg:py-12" : "pt-3 pb-[6.75rem] sm:pt-8 md:pb-10 lg:py-6"
          }`}
        >
          <div
            className={
              step.kind === "inicio" ? "flex w-full max-w-6xl flex-col lg:block" : `flex max-h-full min-h-0 w-full flex-col max-lg:h-full ${step.kind === "revisao" || step.kind === "concluido" ? "max-w-5xl" : "max-w-2xl"}`
            }
          >
            <div
              key={key}
              ref={contentRef}
              className={
                step.kind === "inicio" ? "flex flex-1 flex-col motion-safe:animate-panel-in lg:block" : "-mx-1 min-h-0 flex-1 overflow-y-auto px-1 py-1 motion-safe:animate-panel-in lg:flex-initial"
              }
            >
              {renderStep()}
            </div>

            {error ? (
              <p role="alert" className="mt-3 inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-(--error-soft) px-3 py-2 text-sm font-semibold text-(--error)">
                <LuCircleAlert aria-hidden="true" size={16} />
                {error}
              </p>
            ) : null}

            {!isEdge ? (
              <div className="mt-4 flex shrink-0 items-center gap-2.5 lg:mt-6 lg:gap-4">
                {canBack ? (
                  <button type="button" aria-label="Voltar" onClick={back} className={`${secondaryButtonClassName} size-13 shrink-0 px-0 lg:hidden`}>
                    <LuArrowLeft aria-hidden="true" size={20} />
                  </button>
                ) : null}
                <button type="button" onClick={() => void next()} disabled={disableNext} className={`${primaryButtonClassName} h-13 flex-1 lg:flex-none lg:px-7`}>
                  {saving ? "Salvando..." : nextLabel}
                  {saving ? null : <LuArrowRight aria-hidden="true" size={18} />}
                </button>
                <span className="hidden items-center gap-1.5 text-xs text-(--text-secondary) lg:flex">
                  ou pressione
                  <kbd className="rounded-md border border-(--border-strong) bg-(--surface) px-1.5 py-0.5 font-sans text-[0.6875rem] font-bold text-(--text-primary) shadow-[0_1px_0_var(--border)]">
                    Enter
                  </kbd>
                </span>
                <span className="hidden flex-1 lg:block" />
                {canBack ? (
                  <button
                    type="button"
                    onClick={back}
                    className="hidden min-h-11 items-center gap-1.5 text-sm font-semibold text-(--text-secondary) transition-colors hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-(--focus-ring) lg:inline-flex"
                  >
                    <LuArrowLeft aria-hidden="true" size={16} />
                    Voltar
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </main>

        {showPanel ? (
          <aside aria-label="Resumo do anúncio" className="hidden w-90 shrink-0 flex-col gap-5 overflow-y-auto border-l border-(--border) bg-(--surface) px-7 py-8 xl:flex">
            <span className="text-xs font-bold tracking-widest text-(--text-secondary) uppercase">Seu anúncio</span>
            {propertyMedia[0] ? (
              <div className="relative aspect-16/10 overflow-hidden rounded-xl bg-(--surface-raised)">
                {propertyMedia[0].type === MediaKind.IMAGE ? (
                  <Image src={propertyMedia[0].url} alt="" fill sizes="304px" className="object-cover" />
                ) : (
                  <>
                    <video src={propertyMedia[0].url} muted playsInline preload="metadata" className="size-full object-cover" />
                    <LuPlay aria-hidden="true" size={18} className="absolute bottom-2 left-2 text-(--white)" />
                  </>
                )}
              </div>
            ) : null}
            <div className="flex flex-col gap-1">
              <span className={`text-xl leading-tight font-extrabold wrap-break-word ${title ? "text-(--text-primary)" : "text-(--text-secondary)"}`}>{title || "Nome do imóvel"}</span>
              <span className="text-sm text-(--text-primary)">{type ? propertyTypeLabels[type] : "Tipo pendente"}</span>
              <span className="text-sm text-(--text-secondary)">{addressLine}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-(--text-secondary)">
                Áreas compartilhadas · {sharedBathrooms} {sharedBathrooms === 1 ? "banheiro" : "banheiros"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {areas.length > 0 ? (
                  areas.map((area, index) => (
                    <span key={area.id ?? `${area.type}-${index}`} className="rounded-full bg-(--background) px-2.5 py-1 text-xs text-(--text-primary)">
                      {area.label ?? sharedAreaTypeLabels[area.type]}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-(--text-secondary)">Nenhuma ainda</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-(--text-secondary)">Quartos</span>
              {rooms.map((item, index) => {
                const current = step.room === index;
                const reachable = Boolean(property) && (Boolean(item.id) || current);
                return (
                  <button
                    key={item.id ?? index}
                    type="button"
                    disabled={!reachable || current}
                    aria-current={current ? "step" : undefined}
                    onClick={() => goToStep({ kind: "nome", room: index }, null)}
                    className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-(--focus-ring) enabled:hover:border-(--primary-border) ${
                      current ? "border-(--primary) bg-(--background)" : "border-transparent"
                    }`}
                  >
                    <span
                      className={`flex size-5.5 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold ${
                        item.id ? "bg-(--primary) text-(--on-primary)" : current ? "bg-(--text-primary) text-(--background)" : "bg-(--border) text-(--text-secondary)"
                      }`}
                    >
                      {item.id ? <LuCheck aria-hidden="true" size={12} /> : index + 1}
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm font-semibold wrap-break-word text-(--text-primary)">{item.title || `Quarto ${index + 1}`}</span>
                      <span className="text-xs leading-snug text-(--text-secondary)">
                        {current ? "Preenchendo agora" : item.id ? `${bedsText(item.beds)} · ${item.capacity} hósp. · ${priceText(item)} · ${mediaText(item.media)}` : "Pendente"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        ) : null}
      </div>

      <ConfirmDialog
        open={removingRoom}
        title={`Excluir ${rooms[rooms.length - 1]?.title ?? "quarto"}?`}
        description="Esse quarto já foi salvo. Ao diminuir a quantidade, ele e as fotos dele serão excluídos."
        confirmLabel="Excluir quarto"
        pending={saving}
        onConfirm={() => void removeLastRoom()}
        onCancel={() => setRemovingRoom(false)}
      />
    </div>
  );
}
