import { AdminFilters, AdminSelect } from "@/components/admin/admin-filters";
import { AdminList, AdminPagination } from "@/components/admin/admin-list";
import { OwnerPage } from "@/components/owner/owner-page";
import { StatusBadge } from "@/components/owner/status-badge";
import { cardClassName } from "@/components/owner/styles";
import { PageNotice } from "@/components/page-notice";
import { ADMIN_PAGE_SIZE, adminUserPageSchema, formatDate, pageParam, queryString, searchParam, userRoleLabels, userRoles, userStatusLabels, userStatuses } from "@/lib/admin";
import { getApiData } from "@/lib/server-api";

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/usuarios">) {
  const params = await searchParams;
  const search = searchParam(params.busca);
  const role = userRoles.find((item) => item === params.perfil);
  const status = userStatuses.find((item) => item === params.situacao);
  const page = pageParam(params.pagina);

  const result = await getApiData(`/admin/users?${queryString({ q: search, role, status, page, limit: ADMIN_PAGE_SIZE })}`, adminUserPageSchema);

  if (result.status !== "ok") {
    return <PageNotice title="Usuários" description="Não foi possível carregar os usuários agora. Tente novamente em alguns instantes." actionLabel="Tentar novamente" actionHref="/admin/usuarios" />;
  }

  const { items, total } = result.data;

  return (
    <OwnerPage title="Usuários" back={{ href: "/admin", label: "Painel administrativo" }} description="Contas cadastradas, perfis e situação.">
      <AdminFilters search={search} placeholder="Nome ou e-mail">
        <AdminSelect name="perfil" label="Perfil" value={role ?? ""} options={userRoles.map((item) => ({ value: item, label: userRoleLabels[item] }))} />
        <AdminSelect name="situacao" label="Situação" value={status ?? ""} options={userStatuses.map((item) => ({ value: item, label: userStatusLabels[item] }))} />
      </AdminFilters>

      <AdminList total={total} singular="usuário encontrado" plural="usuários encontrados" emptyMessage="Nenhum usuário encontrado com esses filtros.">
        {items.map((user) => (
          <li key={user.id} className={`${cardClassName} flex flex-col gap-3 md:flex-row md:items-center md:justify-between`}>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="wrap-break-word font-bold text-white">{user.name}</h2>
                <StatusBadge tone={user.status === "ACTIVE" ? "success" : "warning"}>{userStatusLabels[user.status]}</StatusBadge>
              </div>
              <p className="mt-1 break-all text-sm text-(--gray)">{user.email}</p>
              <p className="mt-2 text-sm text-(--gray)">
                Desde {formatDate(user.createdAt)}
                {user.roles.includes("OWNER") ? ` · ${user.propertyCount} ${user.propertyCount === 1 ? "imóvel" : "imóveis"}` : ""}
              </p>
            </div>
            <ul className="flex shrink-0 flex-wrap gap-2" aria-label="Perfis">
              {user.roles.length === 0 ? (
                <li>
                  <StatusBadge tone="neutral">Sem perfil</StatusBadge>
                </li>
              ) : (
                user.roles.map((item) => (
                  <li key={item}>
                    <StatusBadge tone="neutral">{userRoleLabels[item]}</StatusBadge>
                  </li>
                ))
              )}
            </ul>
          </li>
        ))}
      </AdminList>

      <AdminPagination path="/admin/usuarios" params={{ busca: search, perfil: role, situacao: status }} page={page} total={total} />
    </OwnerPage>
  );
}
