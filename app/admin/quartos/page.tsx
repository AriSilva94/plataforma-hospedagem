import Link from "next/link";
import { LuExternalLink } from "react-icons/lu";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminSelect } from "@/components/admin/admin-select";
import { AdminList, AdminPagination } from "@/components/admin/admin-list";
import { CompletenessMeter } from "@/components/owner/completeness-meter";
import { AdminRoomCard } from "@/components/admin/admin-room-card";
import { RoomVerificationActions } from "@/components/admin/room-verification-actions";
import { OwnerPage } from "@/components/owner/owner-page";
import { RoomStatusBadge } from "@/components/owner/property-status-badge";
import { StatusBadge } from "@/components/owner/status-badge";
import { secondaryButtonClassName } from "@/components/owner/styles";
import { PageNotice } from "@/components/page-notice";
import { ADMIN_PAGE_SIZE, adminRoomPageSchema, featuringStatusLabels, pageParam, queryString, searchParam } from "@/lib/admin";
import { getApiData } from "@/lib/server-api";

const listedOptions = [
  { value: "sim", label: "Visíveis na home", api: "true" },
  { value: "nao", label: "Fora da home", api: "false" },
] as const;

const verificationOptions = [
  { value: "pendente", label: "Em análise", api: "PENDING" },
  { value: "verificado", label: "Verificados", api: "VERIFIED" },
  { value: "rejeitado", label: "Rejeitados", api: "REJECTED" },
] as const;

export default async function AdminRoomsPage({ searchParams }: PageProps<"/admin/quartos">) {
  const params = await searchParams;
  const search = searchParam(params.busca);
  const listed = listedOptions.find((option) => option.value === params.home);
  const verification = verificationOptions.find((option) => option.value === params.verificado);
  const page = pageParam(params.pagina);

  const result = await getApiData(
    `/admin/rooms?${queryString({ q: search, listed: listed?.api, verificationStatus: verification?.api, sort: "completeness", page, limit: ADMIN_PAGE_SIZE })}`,
    adminRoomPageSchema,
  );

  if (result.status !== "ok") {
    return <PageNotice title="Quartos" description="Não foi possível carregar os quartos agora. Tente novamente em alguns instantes." actionLabel="Tentar novamente" actionHref="/admin/quartos" />;
  }

  const { items, total } = result.data;

  return (
    <OwnerPage title="Qualidade dos anúncios" back={{ href: "/admin", label: "Painel administrativo" }} description="Quartos ordenados do menos completo para o mais completo. A completude é calculada pelo backend a partir do cadastro do quarto e do imóvel.">
      <AdminFilters search={search} placeholder="Quarto, imóvel ou cidade">
        <AdminSelect name="home" label="Home" value={listed?.value ?? ""} options={listedOptions.map(({ value, label }) => ({ value, label }))} />
        <AdminSelect name="verificado" label="Verificação" value={verification?.value ?? ""} options={verificationOptions.map(({ value, label }) => ({ value, label }))} />
      </AdminFilters>

      <AdminList total={total} singular="quarto encontrado" plural="quartos encontrados" emptyMessage="Nenhum quarto encontrado com esses filtros.">
        {items.map((room) => (
          <AdminRoomCard
            key={room.id}
            room={room}
            badges={
              <>
                <RoomStatusBadge status={room.status} />
                {room.featuringStatus === "ACTIVE" ? <StatusBadge tone="success">{featuringStatusLabels.ACTIVE}</StatusBadge> : null}
                {room.verificationStatus === "VERIFIED" ? <StatusBadge tone="success">Verificado</StatusBadge> : null}
                {room.verificationStatus === "PENDING" ? <StatusBadge tone="warning">Em análise</StatusBadge> : null}
                {room.verificationStatus === "REJECTED" ? <StatusBadge tone="danger">Rejeitado</StatusBadge> : null}
              </>
            }
            aside={
              <div className="flex w-full flex-col gap-3 md:w-64">
                <CompletenessMeter score={room.completenessScore} label="Completude" />
                <RoomVerificationActions room={room} />
                {room.listed ? (
                  <Link href={`/imoveis/${room.property.id}/quartos/${room.id}`} target="_blank" className={secondaryButtonClassName}>
                    Ver anúncio
                    <LuExternalLink aria-hidden="true" size={14} />
                  </Link>
                ) : null}
              </div>
            }
          />
        ))}
      </AdminList>

      <AdminPagination path="/admin/quartos" params={{ busca: search, home: listed?.value, verificado: verification?.value }} page={page} total={total} />
    </OwnerPage>
  );
}
