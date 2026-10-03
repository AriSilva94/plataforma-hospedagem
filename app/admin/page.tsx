import Link from "next/link";
import type { IconType } from "react-icons";
import { LuArrowRight, LuGauge, LuHouse, LuStar, LuUsers } from "react-icons/lu";
import { OwnerPage } from "@/components/owner/owner-page";
import { StatusBadge } from "@/components/owner/status-badge";
import { PageNotice } from "@/components/page-notice";
import { adminOverviewSchema } from "@/lib/admin";
import { getApiData } from "@/lib/server-api";

export default async function AdminDashboardPage() {
  const result = await getApiData("/admin/overview", adminOverviewSchema);

  if (result.status !== "ok") {
    return <PageNotice title="Painel administrativo" description="Não foi possível carregar os indicadores agora. Tente novamente em alguns instantes." actionLabel="Tentar novamente" actionHref="/admin" />;
  }

  const { users, properties, rooms, featuring } = result.data;

  return (
    <OwnerPage title="Painel administrativo" badge={<StatusBadge tone="neutral">Administração</StatusBadge>} description="Visão geral da plataforma. Escolha uma área para ver os detalhes.">
      <ul className="mt-8 grid gap-5 sm:grid-cols-2">
        <DashboardCard
          href="/admin/usuarios"
          icon={LuUsers}
          title="Usuários"
          value={users.total}
          valueLabel={users.total === 1 ? "conta cadastrada" : "contas cadastradas"}
          details={[
            `${users.guests} ${users.guests === 1 ? "hóspede" : "hóspedes"} · ${users.owners} ${users.owners === 1 ? "proprietário" : "proprietários"} · ${users.admins} ${users.admins === 1 ? "admin" : "admins"}`,
            `${users.newLast7Days} ${users.newLast7Days === 1 ? "nova conta" : "novas contas"} nos últimos 7 dias`,
            `${users.inactive} ${users.inactive === 1 ? "conta inativa" : "contas inativas"}`,
          ]}
          cta="Ver usuários"
        />
        <DashboardCard
          href="/admin/imoveis"
          icon={LuHouse}
          title="Imóveis"
          value={properties.total}
          valueLabel={properties.total === 1 ? "imóvel cadastrado" : "imóveis cadastrados"}
          details={[
            `${properties.active} ${properties.active === 1 ? "publicado" : "publicados"} · ${properties.unavailable} ${properties.unavailable === 1 ? "pausado" : "pausados"} · ${properties.draft} em rascunho`,
            `${properties.listed} ${properties.listed === 1 ? "visível" : "visíveis"} na home`,
            `${rooms.total} ${rooms.total === 1 ? "quarto cadastrado" : "quartos cadastrados"}, ${rooms.listed} na home`,
          ]}
          cta="Ver imóveis"
        />
        <DashboardCard
          href="/admin/destaques"
          icon={LuStar}
          title="Destaques"
          value={featuring.active}
          valueLabel={featuring.active === 1 ? "quarto em destaque agora" : "quartos em destaque agora"}
          details={[`${featuring.scheduled} ${featuring.scheduled === 1 ? "destaque agendado" : "destaques agendados"}`, "Destaques só aparecem para quartos visíveis na home"]}
          cta="Gerenciar destaques"
        />
        <DashboardCard
          href="/admin/quartos"
          icon={LuGauge}
          title="Qualidade dos anúncios"
          value={rooms.averageListedCompleteness === null ? "—" : `${rooms.averageListedCompleteness}%`}
          valueLabel="completude média dos quartos na home"
          details={[
            `${rooms.lowCompletenessListed} ${rooms.lowCompletenessListed === 1 ? "quarto" : "quartos"} na home abaixo de ${rooms.lowCompletenessThreshold}%`,
            `${rooms.unavailable} ${rooms.unavailable === 1 ? "quarto pausado" : "quartos pausados"} · ${rooms.inactive} ${rooms.inactive === 1 ? "arquivado" : "arquivados"}`,
          ]}
          cta="Ver quartos"
        />
      </ul>
    </OwnerPage>
  );
}

function DashboardCard({
  href,
  icon: Icon,
  title,
  value,
  valueLabel,
  details,
  cta,
}: {
  href: string;
  icon: IconType;
  title: string;
  value: number | string;
  valueLabel: string;
  details: string[];
  cta: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex h-full flex-col rounded-2xl border border-(--line-strong) bg-(--surface) p-6 transition-colors hover:border-(--blue-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light)"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[rgba(11,99,227,.14)] text-(--blue-light)">
            <Icon aria-hidden="true" size={20} />
          </span>
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
        <p className="mt-5">
          <span className="text-4xl font-extrabold tracking-tight text-white">{value}</span>
          <span className="mt-1 block text-sm text-(--gray)">{valueLabel}</span>
        </p>
        <ul className="mt-4 flex flex-col gap-1.5 border-t border-(--line) pt-4 text-sm text-(--gray)">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-(--blue-light)">
          {cta}
          <LuArrowRight aria-hidden="true" size={15} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </li>
  );
}
