import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { FcGoogle } from "react-icons/fc";
import { LuShieldCheck } from "react-icons/lu";
import { SiteHeader } from "@/components/site-header";

type AuthLink = { href: string; label: string };

type AuthShellProps = {
  title: string;
  description: string;
  links: AuthLink[];
  children: ReactNode;
};

export function AuthShell({ title, description, links, children }: AuthShellProps) {
  return (
    <>
      <SiteHeader />
      <main className="auth-shell">
        <section className="auth-frame">
          <section className="auth-scene">
            <Image
              alt=""
              className="auth-room-image"
              data-testid="auth-room-image"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              src="/rooms/room3.png"
            />
            <div className="auth-scene-content">
              <div className="auth-scene-copy max-w-sm">
                <p className="auth-scene-title">Seu próximo lugar começa aqui.</p>
                <p className="mt-4 max-w-72 text-sm leading-6 text-(--text-primary) sm:text-base">
                  Encontre estadias ou cuide dos seus espaços com segurança e discrição.
                </p>
              </div>
            </div>
          </section>
          <section className="auth-panel">
            <div className="auth-card">
              <h1 className="text-3xl tracking-[-0.04em] text-(--text-primary)">
                {title}
              </h1>
              <p className="mt-2 leading-relaxed text-(--text-secondary)">{description}</p>
              {children}
              <div className="auth-divider">ou continue com</div>
              <div className="flex justify-center">
                <a
                  aria-label="Continuar com Google"
                  href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030"}/auth/google`}
                  className="auth-provider"
                >
                  <FcGoogle aria-hidden="true" size={24} />
                </a>
              </div>
              <nav className="mt-5 flex flex-col items-center gap-2 text-center text-sm font-semibold text-(--primary-text)">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} className="auth-link inline-flex min-h-6 items-center">
                    {link.label}
                  </Link>
                ))}
              </nav>
              <p className="auth-reassurance">
                <LuShieldCheck aria-hidden="true" data-testid="auth-reassurance-icon" size={15} />
                <span>Seus dados estão seguros com a gente</span>
              </p>
            </div>
          </section>
        </section>
        <footer className="auth-footer">
          <span>© 2026 DOMUS X. Todos os direitos reservados.</span>
          <span>Seu espaço, do seu jeito.</span>
        </footer>
      </main>
    </>
  );
}

export function InvalidLinkShell({
  description,
  action,
  links,
}: {
  description: string;
  action: AuthLink;
  links: AuthLink[];
}) {
  return (
    <AuthShell title="Link inválido" description={description} links={links}>
      <div className="mt-5">
        <Link href={action.href} className="auth-submit">
          <span>{action.label}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </AuthShell>
  );
}
