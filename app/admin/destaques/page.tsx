import { AdminFilters, AdminSelect } from "@/components/admin/admin-filters";
import { AdminList, AdminPagination } from "@/components/admin/admin-list";
import { RoomFeaturingActions } from "@/components/admin/room-featuring-actions";
import { AdminRoomCard } from "@/components/admin/admin-room-card";
import { OwnerPage } from "@/components/owner/owner-page";
import { StatusBadge } from "@/components/owner/status-badge";
import { PageNotice } from "@/components/page-notice";
import {
  ADMIN_PAGE_SIZE,
  adminRoomPageSchema,
  featuringStatuses,
  featuringStatusLabels,
  formatDateTime,
  pageParam,
  queryString,
  searchParam,
  type AdminRoom,
  type FeaturingStatus,
} from "@/lib/admin";
import { getApiData } from "@/lib/server-api";

const featuringTones: Record<FeaturingStatus, "success" | "warning" | "neutral"> = {
  ACTIVE: "success",
  SCHEDULED: "warning",
  ENDED: "neutral",
  NONE: "neutral",
};

export default async function AdminFeaturingPage({ searchParams }: PageProps<"/admin/destaques">) {
  const params = await searchParams;
  const search = searchParam(params.busca);
  const status = featuringStatuses.find((item) => item === params.situacao);
  const page = pageParam(params.pagina);

  const result = await getApiData(`/admin/rooms?${queryString({ q: search, featuring: status, page, limit: ADMIN_PAGE_SIZE })}`, adminRoomPageSchema);

  if (result.status !== "ok") {
    return <PageNotice title="Destaques" description="Não foi possível carregar os quartos agora. Tente novamente em alguns instantes." actionLabel="Tentar novamente" actionHref="/admin/destaques" />;
  }

  const { items, total } = result.data;

  return (
    <OwnerPage
      title="Destaques"
      back={{ href: "/admin", label: "Painel administrativo" }}
      description="Defina o período em que cada quarto aparece primeiro na home. Quartos fora da home não aparecem, mesmo destacados."
    >
      <AdminFilters search={search} placeholder="Quarto, imóvel ou cidade">
        <AdminSelect name="situacao" label="Situação" value={status ?? ""} options={featuringStatuses.map((item) => ({ value: item, label: featuringStatusLabels[item] }))} />
      </AdminFilters>

      <AdminList total={total} singular="quarto encontrado" plural="quartos encontrados" emptyMessage="Nenhum quarto encontrado com esses filtros.">
        {items.map((room) => (
          <AdminRoomCard
            key={room.id}
            room={room}
            badges={<StatusBadge tone={featuringTones[room.featuringStatus]}>{featuringStatusLabels[room.featuringStatus]}</StatusBadge>}
            details={<p className="mt-2 text-sm text-(--gray)">{periodText(room)}</p>}
            aside={<RoomFeaturingActions room={room} />}
          />
        ))}
      </AdminList>

      <AdminPagination path="/admin/destaques" params={{ busca: search, situacao: status }} page={page} total={total} />
    </OwnerPage>
  );
}

function periodText({ featuringStatus, featuredFrom, featuredUntil }: AdminRoom): string {
  if (featuringStatus === "NONE" || !featuredFrom || !featuredUntil) return "Nenhum período definido.";
  return `${formatDateTime(featuredFrom)} até ${formatDateTime(featuredUntil)} (horário de Brasília)`;
}
