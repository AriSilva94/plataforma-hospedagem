"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { LuLockKeyhole, LuMail } from "react-icons/lu";
import { BrandMark } from "@/components/brand-mark";
import { FormFeedback } from "@/components/form-feedback";
import { apiFetch, getErrorMessage } from "@/lib/api";

type Field = {
  name: string;
  label: string;
  type: "email" | "password" | "text";
  autoComplete?: string;
  defaultValue?: string;
};

type AuthFormProps = {
  title: string;
  description: string;
  endpoint: string;
  fields: Field[];
  submitLabel: string;
  successPath?: string;
  links: { href: string; label: string }[];
};

export function AuthForm({
  title,
  description,
  endpoint,
  fields,
  submitLabel,
  successPath,
  links,
}: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    setIsPending(true);
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const response = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        setError(await getErrorMessage(response));
        return;
      }

      if (successPath) {
        router.push(successPath);
        // O destino é renderizado no servidor a partir dos cookies de sessão,
        // que só existem depois desta resposta.
        router.refresh();
        return;
      }
      setSuccess("Solicitação recebida. Verifique sua caixa de e-mail.");
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setIsPending(false);
    }
  }

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
            <div className="max-w-sm">
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
            <form className="mt-5 space-y-3.5" onSubmit={handleSubmit}>
              {fields.map((field) => {
                const Icon = field.type === "email" ? LuMail : field.type === "password" ? LuLockKeyhole : null;

                return (
                  <label key={field.name} className="block text-sm font-semibold text-[#d5dfed]">
                    {field.label}
                    <span className="auth-input-wrap">
                      {Icon ? <Icon aria-hidden="true" size={17} /> : null}
                      <input
                        required
                        name={field.name}
                        type={field.type}
                        autoComplete={field.autoComplete}
                        defaultValue={field.defaultValue}
                        className="auth-input"
                      />
                    </span>
                  </label>
                );
              })}
              {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
              {success ? <FormFeedback tone="success">{success}</FormFeedback> : null}
              <button disabled={isPending} className="auth-submit" type="submit">
                <span>{isPending ? "Enviando..." : submitLabel}</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>
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
            <p className="auth-reassurance">Seus dados estão seguros com a gente</p>
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
