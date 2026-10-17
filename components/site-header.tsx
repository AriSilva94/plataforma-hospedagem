"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { IconType } from "react-icons";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/lib/api";
import {
  LuBell,
  LuGift,
  LuHouse,
  LuLogIn,
  LuLogOut,
  LuPlus,
  LuSearch,
  LuUserRound,
} from "react-icons/lu";

const publicNavItems = [
  { label: "Home", href: "/" },
  { label: "Anúncios", href: "/anuncios" },
  { label: "Contato", href: "/contato" },
  { label: "Sobre", href: "/sobre" },
];

function NotificationsPlaceholder() {
  return (
    <span role="img" aria-label="Notificações indisponíveis" className="flex size-10 items-center justify-center rounded-xl text-(--text-primary)/85">
      <LuBell aria-hidden="true" size={19} />
    </span>
  );
}

export function SiteHeader({ user }: { user?: { name: string; roles: string[] } }) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string>();
  const router = useRouter();
  const pathname = usePathname();

  async function endSession() {
    setLogoutError(undefined);
    if (!(await logout())) {
      setLogoutError("Não foi possível sair agora. Tente novamente.");
      return;
    }
    setProfileMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-(--border) bg-(--background)/85 backdrop-blur-sm">
        <div className="flex h-16 items-center px-4 md:hidden">
          {user ? (
            <>
              <BrandMark size="md" href="/" />
              <div className="flex-1" />
              <ThemeToggle />
              <NotificationsPlaceholder />
            </>
          ) : (
            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center">
              <span />
              <BrandMark size="md" href="/" />
              <div className="flex justify-end">
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>
        <div className="mx-auto hidden h-18 w-full max-w-360 items-center px-6 md:grid md:grid-cols-[auto_1fr_auto] md:gap-6 md:px-10 lg:px-12">
          <BrandMark size="md" href="/" />
          <nav
            aria-label="Navegação principal"
            className="flex items-center justify-center gap-5.5 text-sm font-semibold text-(--text-secondary)"
          >
            {publicNavItems.map((item) => (
              <NavItem key={item.label} {...item} active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)} />
            ))}
          </nav>
          <div className="relative flex items-center justify-end gap-4">
            <ThemeToggle />
            {user ? (
              <>
                <NotificationsPlaceholder />
                <Link
                  href="/perfil"
                  className="rounded-2xl bg-(--primary) px-4.5 py-2.5 text-[13px] font-bold text-(--on-primary) transition-colors hover:bg-(--primary-hover)"
                >
                  Minha conta
                </Link>
                <button
                  type="button"
                  onClick={() => void endSession()}
                  className="flex min-h-11 items-center gap-1.5 text-sm font-semibold text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                >
                  <LuLogOut aria-hidden="true" size={16} />
                  Sair
                </button>
                {logoutError ? (
                  <p
                    role="alert"
                    className="absolute right-0 top-full mt-2 text-xs font-semibold text-(--error)"
                  >
                    {logoutError}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-2xl border border-(--border-strong) px-4.5 py-2.5 text-[13px] font-semibold text-(--text-primary) transition-colors hover:bg-(--primary-soft) md:block"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="hidden rounded-2xl bg-(--primary) px-4.5 py-2.5 text-[13px] font-bold text-(--on-primary) transition-colors hover:bg-(--primary-hover) lg:block"
                >
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <MobileBottomNavigation
        pathname={pathname}
        hasUser={Boolean(user)}
        profileMenuOpen={profileMenuOpen}
        onProfileClick={() => setProfileMenuOpen((open) => !open)}
      />
      {user && profileMenuOpen ? (
        <div
          id="mobile-profile-menu"
          role="menu"
          className="fixed bottom-19 right-3 z-30 flex w-44 flex-col gap-1 rounded-xl border border-(--border) bg-(--surface) p-1.5 shadow-[0_16px_40px_color-mix(in_srgb,var(--shadow)_35%,transparent)] md:hidden"
        >
          <Link
            role="menuitem"
            href="/perfil"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-(--text-primary) transition-colors hover:bg-(--primary-soft)"
          >
            <LuUserRound aria-hidden="true" size={16} />
            Meu perfil
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => void endSession()}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-(--error) transition-colors hover:bg-(--error-soft)"
          >
            <LuLogOut aria-hidden="true" size={16} />
            Sair
          </button>
        </div>
      ) : null}
    </>
  );
}

function NavItem({
  label,
  href,
  active,
  onClick,
  className,
}: {
  label: string;
  href: string;
  active: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-11 items-center transition-colors hover:text-(--primary-text) ${active ? "text-(--primary-text)" : "text-(--text-primary)"} ${className ?? ""}`}
    >
      {label}
    </Link>
  );
}

function MobileBottomNavigation({
  pathname,
  hasUser,
  profileMenuOpen,
  onProfileClick,
}: {
  pathname: string;
  hasUser: boolean;
  profileMenuOpen: boolean;
  onProfileClick: () => void;
}) {
  const inicio = <MobileNavigationItem label="Início" href="/" icon={LuHouse} active={pathname === "/"} />;
  const anuncios = (label: string) => (
    <MobileNavigationItem label={label} href="/anuncios" icon={LuSearch} active={pathname === "/anuncios"} />
  );
  const recompensa = <MobileNavigationItem label="Recompensa" icon={LuGift} active={false} disabled />;

  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-20 grid h-18 grid-cols-5 border-t border-(--border) bg-(--background)/96 px-1 pb-[max(.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-sm md:hidden"
    >
      {hasUser ? (
        <>
          {inicio}
          {anuncios("Buscar")}
        </>
      ) : (
        <>
          {recompensa}
          {inicio}
        </>
      )}

      <div className="relative flex flex-col items-center pt-9 text-xs font-semibold text-(--primary-text)">
        <Link
          href="/meus-imoveis"
          aria-label="Anunciar"
          className="absolute -top-6 flex size-14 items-center justify-center rounded-full border-3 border-(--white) bg-(--primary) text-(--on-primary) shadow-[0_10px_24px_color-mix(in_srgb,var(--shadow)_35%,transparent)] transition-colors hover:bg-(--primary-hover)"
        >
          <LuPlus aria-hidden="true" size={24} />
        </Link>
        <span className="truncate">Anunciar</span>
      </div>

      {hasUser ? (
        <>
          {recompensa}
          <button
            type="button"
            aria-expanded={profileMenuOpen}
            aria-controls="mobile-profile-menu"
            onClick={onProfileClick}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold ${pathname === "/perfil" ? "text-(--primary-text)" : "text-(--text-secondary)"}`}
          >
            <LuUserRound aria-hidden="true" size={18} />
            <span className="truncate">Minha conta</span>
          </button>
        </>
      ) : (
        <>
          {anuncios("Quartos")}
          <MobileNavigationItem label="Entrar" href="/login" icon={LuLogIn} active={false} />
        </>
      )}
    </nav>
  );
}

function MobileNavigationItem({
  label,
  href,
  icon: Icon,
  active,
  disabled,
}: {
  label: string;
  href?: string;
  icon: IconType;
  active: boolean;
  disabled?: boolean;
}) {
  const className = `flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold ${active ? "text-(--primary-text)" : "text-(--text-secondary)"}`;
  const content = (
    <>
      <Icon aria-hidden="true" size={18} />
      <span className="truncate">{label}</span>
    </>
  );

  if (!href || disabled) {
    return (
      <span aria-disabled="true" className={`${className} opacity-70`}>
        {content}
      </span>
    );
  }

  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={className}>
      {content}
    </Link>
  );
}
