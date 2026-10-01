import Link from "next/link";
import { LuExternalLink } from "react-icons/lu";
import { AdminFilters, AdminSelect } from "@/components/admin/admin-filters";
import { AdminList, AdminPagination } from "@/components/admin/admin-list";
import { ListedIndicator } from "@/components/admin/listed-indicator";
import { OwnerPage } from "@/components/owner/owner-page";
import { PropertyStatusBadge } from "@/components/owner/property-status-badge";
import { cardClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { PageNotice } from "@/components/page-notice";
import { ADMIN_PAGE_SIZE, adminPropertyPageSchema, formatDate, formatPlace, pageParam, queryString, searchParam } from "@/lib/admin";
import { propertyStatuses, propertyStatusLabels, propertyTypeLabels } from "@/lib/properties";
import { getApiData } from "@/lib/server-api";

export default async function AdminPropertiesPage({ searchParams }: PageProps<"/admin/imoveis">) {
  const params = await searchParams;
  const search = searchParam(params.busca);
  const status = propertyStatuses.find((item) => item === params.situacao);
  const page = pageParam(params.pagina);

  const result = await getApiData(`/admin/properties?${queryString({ q: search, status, page, limit: ADMIN_PAGE_SIZE })}`, adminPropertyPageSchema);

  if (result.status !== "ok") {
    return <PageNotice title="Imóveis" description="Não foi possível carregar os imóveis agora. Tente novamente em alguns instantes." actionLabel="Tentar novamente" actionHref="/admin/imoveis" />;
  }

  const { items, total } = result.data;

  return (
    <OwnerPage title="Imóveis" back={{ href: "/admin", label: "Painel administrativo" }} description="Imóveis cadastrados, proprietários e visibilidade na home.">
      <AdminFilters search={search} placeholder="Imóvel, cidade ou proprietário">
        <AdminSelect name="situacao" label="Situação" value={status ?? ""} options={propertyStatuses.map((item) => ({ value: item, label: propertyStatusLabels[item] }))} />
      </AdminFilters>

      <AdminList total={total} singular="imóvel encontrado" plural="imóveis encontrados" emptyMessage="Nenhum imóvel encontrado com esses filtros.">
        {items.map((property) => (
          <li key={property.id} className={`${cardClassName} flex flex-col gap-4 md:flex-row md:items-center md:justify-between`}>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="wrap-break-word font-bold text-white">{property.title}</h2>
                <PropertyStatusBadge status={property.status} />
              </div>
              <p className="mt-1 text-sm text-(--gray)">{[propertyTypeLabels[property.type], formatPlace(property)].filter(Boolean).join(" · ")}</p>
              <p className="mt-1 break-all text-sm text-(--gray)">
                {property.owner.name} · {property.owner.email}
              </p>
              <p className="mt-2 text-sm text-(--gray)">
                {property.roomCount === 1 ? "1 quarto" : `${property.roomCount} quartos`} · {property.availableRoomCount} {property.availableRoomCount === 1 ? "reservável" : "reserváveis"} · cadastrado em {formatDate(property.createdAt)}
              </p>
              <ListedIndicator listed={property.listed} hiddenLabel="Fora da home: imóvel não publicado, sem quarto reservável ou proprietário inativo" />
            </div>
            {property.listed ? (
              <Link href={`/imoveis/${property.id}`} target="_blank" className={`${secondaryButtonClassName} shrink-0`}>
                Ver anúncio
                <LuExternalLink aria-hidden="true" size={14} />
              </Link>
            ) : null}
          </li>
        ))}
      </AdminList>

      <AdminPagination path="/admin/imoveis" params={{ busca: search, situacao: status }} page={page} total={total} />
    </OwnerPage>
  );
}
