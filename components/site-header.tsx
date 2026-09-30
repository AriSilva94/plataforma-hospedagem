"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { logout } from "@/lib/api";
import {
  LuBell,
  LuCalendarDays,
  LuHeart,
  LuHouse,
  LuLogIn,
  LuLogOut,
  LuMenu,
  LuMessageSquare,
  LuUserRound,
  LuX,
} from "react-icons/lu";

const navItems = [
  { label: "Início", href: "/#inicio" },
  { label: "Favoritos" },
  { label: "Reservas" },
  { label: "Mensagens" },
];

const desktopBreakpoint = "(min-width: 768px)";

export function SiteHeader({ user }: { user?: { name: string } }) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string>();
  const router = useRouter();
  const pathname = usePathname();

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

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
      <header className="sticky top-0 z-20 border-b border-(--line) bg-[rgba(3,17,40,.85)] backdrop-blur">
        <div className="grid h-16 grid-cols-[40px_1fr_40px] items-center px-4 md:hidden">
          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileMenuOpen(true)}
            className="flex size-10 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/5"
          >
            <LuMenu aria-hidden="true" size={21} />
          </button>
          <div className="flex justify-center">
            <BrandMark size="md" href="/" />
          </div>
          <span
            role="img"
            aria-label="Notificações indisponíveis"
            className="flex size-10 items-center justify-center justify-self-end rounded-xl text-white/85"
          >
            <LuBell aria-hidden="true" size={19} />
          </span>
        </div>
        <div className="mx-auto hidden h-18 w-full max-w-360 items-center gap-4 px-6 md:flex md:px-10 lg:gap-5.5 lg:px-12">
          <BrandMark size="md" href="/" />
          <div className="flex-1" />
          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-3 text-sm font-semibold text-(--gray) md:flex lg:gap-5.5"
          >
            {navItems.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/meus-imoveis"
              className="hidden rounded-xl border border-[rgba(11,99,227,.4)] bg-[rgba(11,99,227,.14)] px-3 py-2.5 text-[13px] font-semibold text-(--blue-light) transition-colors hover:bg-[rgba(11,99,227,.24)] md:block lg:px-4.5"
            >
              Seja um anfitrião
            </Link>
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  aria-label="Abrir menu do perfil"
                  aria-expanded={profileMenuOpen}
                  aria-controls="profile-menu"
                  onClick={() => setProfileMenuOpen((open) => !open)}
                  className="flex size-10 items-center justify-center rounded-full border border-(--line-strong) bg-(--surface-raised) text-white"
                >
                  <span className="text-sm font-bold">
                    {user.name.slice(0, 1).toUpperCase()}
                  </span>
                </button>
                {profileMenuOpen ? (
                  <div
                    id="profile-menu"
                    role="menu"
                    className="absolute right-0 top-12 w-44 rounded-xl border border-(--line) bg-(--surface) p-1.5 shadow-[0_16px_40px_rgba(0,0,0,.35)]"
                  >
                    <Link
                      role="menuitem"
                      href="/perfil"
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[rgba(11,99,227,.14)]"
                    >
                      <LuUserRound aria-hidden="true" size={16} />
                      Meu perfil
                    </Link>
                    <button
                      role="menuitem"
                      type="button"
                      onClick={() => void endSession()}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-(--danger) transition-colors hover:bg-[rgba(229,98,75,.12)]"
                    >
                      <LuLogOut aria-hidden="true" size={16} />
                      Sair
                    </button>
                    {logoutError ? (
                      <p
                        role="alert"
                        className="px-3 py-2 text-xs leading-snug text-[#ff9b8a]"
                      >
                        {logoutError}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-xl border border-(--line-strong) px-4.5 py-2.5 text-[13px] font-semibold text-white md:block"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        showLogin={!user}
      />
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
          className="fixed bottom-19 right-3 z-30 flex w-44 flex-col gap-1 rounded-xl border border-(--line) bg-(--surface) p-1.5 shadow-[0_16px_40px_rgba(0,0,0,.35)] md:hidden"
        >
          <Link
            role="menuitem"
            href="/perfil"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[rgba(11,99,227,.14)]"
          >
            <LuUserRound aria-hidden="true" size={16} />
            Meu perfil
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => void endSession()}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-(--danger) transition-colors hover:bg-[rgba(229,98,75,.12)]"
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
  onClick,
  className,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  return href ? (
    <a
      href={href}
      onClick={onClick}
      className={`text-white ${className ?? ""}`}
    >
      {label}
    </a>
  ) : (
    <span className={className}>{label}</span>
  );
}

const focusableSelector =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

const mobileNavigationItems = [
  { label: "Início", href: "/#inicio", icon: LuHouse },
  { label: "Favoritos", icon: LuHeart },
  { label: "Reservas", icon: LuCalendarDays },
  { label: "Mensagens", icon: LuMessageSquare },
  { label: "Perfil", href: "/perfil", icon: LuUserRound },
];

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
  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-20 grid h-18 grid-cols-5 border-t border-(--line) bg-[rgba(3,17,40,.96)] px-1 pb-[max(.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur md:hidden"
    >
      {mobileNavigationItems.map(({ label, href, icon: Icon }) => {
        const isProfile = label === "Perfil";
        const visibleLabel = isProfile && !hasUser ? "Entrar" : label;
        const VisibleIcon = isProfile && !hasUser ? LuLogIn : Icon;
        const active =
          href === "/perfil"
            ? pathname === "/perfil"
            : href === "/#inicio" && pathname === "/";
        const className = `flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold ${active ? "text-(--blue-light)" : "text-(--gray)"}`;
        const content = (
          <>
            <Icon aria-hidden="true" size={18} />
            <span className="truncate">{label}</span>
          </>
        );

        if (isProfile && hasUser) {
          return (
            <button
              key={label}
              type="button"
              aria-expanded={profileMenuOpen}
              aria-controls="mobile-profile-menu"
              onClick={onProfileClick}
              className={className}
            >
              {content}
            </button>
          );
        }

        if (isProfile) {
          return (
            <Link key={label} href="/login" className={className}>
              <VisibleIcon aria-hidden="true" size={18} />
              <span className="truncate">{visibleLabel}</span>
            </Link>
          );
        }

        return href ? (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={className}
          >
            {content}
          </Link>
        ) : (
          <span
            key={label}
            aria-disabled="true"
            className={`${className} opacity-70`}
          >
            {content}
          </span>
        );
      })}
    </nav>
  );
}

function MobileMenu({
  open,
  onClose,
  showLogin,
}: {
  open: boolean;
  onClose: () => void;
  showLogin: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    document.body.classList.add("scroll-locked");
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "Tab") trapFocus(event, dialogRef.current);
    };
    const desktop = window.matchMedia(desktopBreakpoint);
    const onBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpointChange);

    return () => {
      document.body.classList.remove("scroll-locked");
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpointChange);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  return (
    <div
      data-open={open}
      inert={!open}
      className="group fixed inset-0 z-40 md:hidden invisible transition-[visibility] delay-300 duration-0 data-[open=true]:visible data-[open=true]:delay-0"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(2,8,20,.6)] opacity-0 backdrop-blur-[2px] transition-opacity duration-300 ease-out group-data-[open=true]:opacity-100"
      />
      <div
        ref={dialogRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="absolute inset-y-0 right-0 flex w-[min(86vw,360px)] translate-x-full flex-col border-l border-(--line-strong) bg-(--surface) shadow-[-24px_0_60px_rgba(0,0,0,.45)] transition-transform duration-450 ease-[cubic-bezier(.22,1,.36,1)] group-data-[open=true]:translate-x-0"
      >
        <div className="flex h-18 shrink-0 items-center justify-between border-b border-(--line) px-6">
          <BrandMark size="md" />
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Fechar menu"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl border border-(--line-strong) text-white transition-colors hover:bg-white/5"
          >
            <LuX aria-hidden="true" size={20} />
          </button>
        </div>
        <nav
          aria-label="Navegação principal"
          className="flex-1 overflow-y-auto px-3 py-4"
        >
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li
                key={item.label}
                className="translate-x-4 border-b border-(--line) opacity-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] last:border-b-0 group-data-[open=true]:translate-x-0 group-data-[open=true]:opacity-100"
              >
                <NavItem
                  {...item}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-4 text-lg font-semibold text-(--gray)"
                />
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 flex-col gap-3 border-t border-(--line) p-6">
          <Link
            href="/meus-imoveis"
            onClick={onClose}
            className="rounded-xl border border-[rgba(11,99,227,.4)] bg-[rgba(11,99,227,.14)] px-4.5 py-3 text-center text-sm font-semibold text-(--blue-light) transition-colors hover:bg-[rgba(11,99,227,.24)]"
          >
            Seja um anfitrião
          </Link>
          {showLogin ? (
            <Link
              href="/login"
              className="rounded-xl bg-(--blue) px-4.5 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-(--blue-light)"
            >
              Entrar
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function trapFocus(event: KeyboardEvent, dialog: HTMLElement | null): void {
  const focusable = dialog?.querySelectorAll<HTMLElement>(focusableSelector);
  if (!focusable?.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const isInside = dialog?.contains(document.activeElement);
  const boundary = event.shiftKey ? first : last;

  if (!isInside || document.activeElement === boundary) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  }
}
