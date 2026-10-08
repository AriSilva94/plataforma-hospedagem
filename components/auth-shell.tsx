import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { FcGoogle } from "react-icons/fc";
import { LuShieldCheck } from "react-icons/lu";
import { BrandMark } from "@/components/brand-mark";

type AuthShellProps = {
  title: string;
  description: string;
  links: { href: string; label: string }[];
  children: ReactNode;
};

export function AuthShell({ title, description, links, children }: AuthShellProps) {
  return (
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
            <BrandMark href="/" size="md" />
            <div className="auth-scene-copy max-w-sm">
              <h1 className="auth-scene-title">Seu próximo lugar começa aqui.</h1>
              <p className="mt-4 max-w-72 text-sm leading-6 text-[#d4deeb] sm:text-base">
                Encontre estadias ou cuide dos seus espaços com segurança e discrição.
              </p>
            </div>
          </div>
        </section>
        <section className="auth-panel">
          <div className="auth-card">
            <div className="auth-emblem" aria-hidden="true">D</div>
            <h2 className="mt-5 font-serif text-3xl tracking-[-0.04em] text-(--white)">
              {title}
            </h2>
            <p className="mt-2 leading-relaxed text-(--gray)">{description}</p>
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
            <nav className="mt-5 flex flex-col items-center gap-2 text-center text-sm font-semibold text-(--blue-light)">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="auth-link">
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
  );
}
