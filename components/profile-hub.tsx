"use client";

import { useState, type ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  LuBedDouble,
  LuCircleAlert,
  LuCircleCheck,
  LuClipboardList,
  LuClock,
  LuHeart,
  LuUserRound,
  LuUsers,
} from "react-icons/lu";
import { AvatarUploader } from "@/components/avatar-uploader";
import { FavoritesGrid } from "@/components/favorites-grid";
import type { FavoriteItem } from "@/lib/favorites";
import { OwnerPropertiesGrid } from "@/components/owner/owner-properties-grid";
import { ProfileForm } from "@/components/profile-form";
import type { OwnerRoomsSummary, PropertySummary } from "@/lib/properties";
import type { CurrentUser } from "@/lib/user";

const tabs = [
  { id: "quartos", label: "Meus Quartos", icon: LuBedDouble },
  { id: "favoritos", label: "Favoritos", icon: LuHeart },
  { id: "perfil", label: "Perfil", icon: LuUserRound },
  { id: "coanfitriao", label: "Coanfitrião", icon: LuUsers },
] as const;

type TabId = (typeof tabs)[number]["id"];

const statCards: { key: keyof OwnerRoomsSummary; label: string; icon: IconType; tone: "neutral" | "success" | "warning" | "danger" }[] = [
  { key: "totalRooms", label: "Anúncios", icon: LuClipboardList, tone: "neutral" },
  { key: "availableRooms", label: "Ativos", icon: LuCircleCheck, tone: "success" },
  { key: "pendingVerificationRooms", label: "Em análise", icon: LuClock, tone: "warning" },
  { key: "rejectedVerificationRooms", label: "Atenção", icon: LuCircleAlert, tone: "danger" },
];

const toneClassNames = {
  neutral: "bg-(--surface-raised) text-(--primary-text)",
  success: "bg-(--success-soft) text-(--success)",
  warning: "bg-(--warning-soft) text-(--warning)",
  danger: "bg-(--error-soft) text-(--error)",
} as const;

function formatMemberSince(createdAt: string | null): string | null {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return `Membro desde ${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

export function ProfileHub({
  user: initialUser,
  properties,
  favorites,
  summary,
}: {
  user: CurrentUser;
  properties: PropertySummary[];
  favorites: FavoriteItem[];
  summary: OwnerRoomsSummary;
}) {
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState<TabId>("quartos");
  const showStats = activeTab === "quartos";
  const memberSince = formatMemberSince(user.createdAt);

  return (
    <main className="min-h-[calc(100vh-72px)] px-4 pt-8 pb-28 sm:px-6 md:pt-12 md:pb-16">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center gap-4 sm:gap-5">
          <AvatarUploader name={user.name} avatarUrl={user.avatarUrl} />
          <div className="min-w-0 flex-1">
            <h1 className="wrap-break-word text-2xl font-extrabold tracking-tight text-(--text-primary) sm:text-3xl">
              {user.name}
            </h1>
            <p className="mt-1 wrap-break-word text-sm text-(--text-secondary)">{user.email}</p>
            {memberSince ? <p className="mt-1 text-xs text-(--text-secondary)">{memberSince}</p> : null}
          </div>
        </header>

        <nav aria-label="Seções do perfil" className="mt-8 flex gap-1 overflow-x-auto rounded-2xl border border-(--border) bg-(--surface) p-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-current={active ? "true" : undefined}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                  active ? "bg-(--surface-raised) text-(--text-primary)" : "text-(--text-secondary) hover:text-(--text-primary)"
                }`}
              >
                <Icon aria-hidden="true" size={18} className={active ? "text-(--primary-text)" : undefined} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div
          inert={!showStats}
          className={`grid transition-[grid-template-rows,opacity,translate] duration-300 ease-out motion-reduce:transition-none ${
            showStats ? "grid-rows-[1fr] translate-y-0 opacity-100" : "grid-rows-[0fr] -translate-y-1 opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="grid grid-cols-2 gap-2 pt-4 sm:grid-cols-4">
              {statCards.map(({ key, label, icon: Icon, tone }) => (
                <div key={key} className="flex items-center gap-2.5 rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5">
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${toneClassNames[tone]}`}>
                    <Icon aria-hidden="true" size={16} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-lg leading-tight font-extrabold text-(--text-primary)">{summary[key]}</span>
                    <span className="truncate text-xs font-semibold text-(--text-secondary)">{label}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <TabPanel active={activeTab === "quartos"}>
            <h2 className="text-xl font-bold text-(--text-primary)">Meus quartos</h2>
            <p className="mt-1 text-sm text-(--text-secondary)">Cadastre o imóvel e gerencie os quartos reserváveis dentro dele.</p>
            <OwnerPropertiesGrid properties={properties} />
          </TabPanel>

          <TabPanel active={activeTab === "favoritos"}>
            <h2 className="text-xl font-bold text-(--text-primary)">Favoritos</h2>
            <p className="mt-1 text-sm text-(--text-secondary)">Quartos que você salvou para comparar depois.</p>
            <FavoritesGrid items={favorites} loginReturnPath="/perfil" />
          </TabPanel>

          <TabPanel active={activeTab === "perfil"}>
            <ProfileForm user={user} onUserChange={setUser} />
          </TabPanel>

          <TabPanel active={activeTab === "coanfitriao"}>
            <h2 className="text-xl font-bold text-(--text-primary)">Coanfitrião</h2>
            <p className="mt-1 text-sm text-(--text-secondary)">Convide alguém para ajudar a administrar seus imóveis.</p>
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-(--border) p-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-(--surface-raised) text-(--primary-text)">
                <LuUsers aria-hidden="true" size={24} />
              </span>
              <h3 className="text-lg font-bold text-(--text-primary)">Disponível em breve</h3>
              <p className="max-w-prose text-sm leading-relaxed text-(--text-secondary)">
                Em breve você vai poder convidar um coanfitrião para dividir a gestão dos seus imóveis.
              </p>
            </div>
          </TabPanel>
        </div>
      </div>
    </main>
  );
}

function TabPanel({ active, children }: { active: boolean; children: ReactNode }) {
  if (!active) return null;
  return <section className="animate-panel-in motion-reduce:animate-none">{children}</section>;
}
