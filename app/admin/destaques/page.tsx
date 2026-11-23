import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminSelect } from "@/components/admin/admin-select";
import { AdminList, AdminPagination } from "@/components/admin/admin-list";
import { RoomFeaturingActions } from "@/components/admin/room-featuring-actions";
import { RoomStoryActions } from "@/components/admin/room-story-actions";
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
import { storyStatuses } from "@/lib/properties";
import { isStoryExpired, storyStatusLabels } from "@/lib/stories";

const storyTones = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" } as const;

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
  const storyStatus = storyStatuses.find((item) => item === params.story);
  const page = pageParam(params.pagina);

  const result = await getApiData(`/admin/rooms?${queryString({ q: search, featuring: status, storyStatus, page, limit: ADMIN_PAGE_SIZE })}`, adminRoomPageSchema);

  if (result.status !== "ok") {
    return <PageNotice title="Destaques" description="Não foi possível carregar os quartos agora. Tente novamente em alguns instantes." actionLabel="Tentar novamente" actionHref="/admin/destaques" />;
  }

  const { items, total } = result.data;

  return (
    <OwnerPage
      title="Destaques"
      back={{ href: "/admin", label: "Painel administrativo" }}
      description="Defina o período do destaque e analise os stories enviados pelos anunciantes. O story só aparece na home com o story aprovado, o destaque ativo e o quarto elegível."
    >
      <AdminFilters search={search} placeholder="Quarto, imóvel ou cidade">
        <AdminSelect name="situacao" label="Situação" value={status ?? ""} options={featuringStatuses.map((item) => ({ value: item, label: featuringStatusLabels[item] }))} />
        <AdminSelect name="story" label="Story" value={storyStatus ?? ""} options={storyStatuses.map((item) => ({ value: item, label: storyStatusLabels[item] }))} />
      </AdminFilters>

      <AdminList total={total} singular="quarto encontrado" plural="quartos encontrados" emptyMessage="Nenhum quarto encontrado com esses filtros.">
        {items.map((room) => (
          <AdminRoomCard
            key={room.id}
            room={room}
            badges={
              <>
                <StatusBadge tone={featuringTones[room.featuringStatus]}>{featuringStatusLabels[room.featuringStatus]}</StatusBadge>
                {room.storyMedia.length > 0 ? (
                  <StatusBadge tone={room.storyStatus === "APPROVED" && isStoryExpired(room.storyExpiresAt) ? "neutral" : storyTones[room.storyStatus]}>
                    {room.storyStatus === "APPROVED" && isStoryExpired(room.storyExpiresAt) ? "Story: expirado" : `Story: ${storyStatusLabels[room.storyStatus].toLowerCase()}`}
                  </StatusBadge>
                ) : null}
              </>
            }
            details={
              <>
                <p className="mt-2 text-sm text-(--text-secondary)">{periodText(room)}</p>
                {room.storyMedia.length > 0 ? (
                  <div className="mt-3">
                    <RoomStoryActions room={room} expired={isStoryExpired(room.storyExpiresAt)} />
                  </div>
                ) : null}
              </>
            }
            aside={<RoomFeaturingActions room={room} />}
          />
        ))}
      </AdminList>

      <AdminPagination path="/admin/destaques" params={{ busca: search, situacao: status, story: storyStatus }} page={page} total={total} />
    </OwnerPage>
  );
}

function periodText({ featuringStatus, featuredFrom, featuredUntil }: AdminRoom): string {
  if (featuringStatus === "NONE" || !featuredFrom || !featuredUntil) return "Nenhum período definido.";
  return `${formatDateTime(featuredFrom)} até ${formatDateTime(featuredUntil)} (horário de Brasília)`;
}
