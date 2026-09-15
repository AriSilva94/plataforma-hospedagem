"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
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
  includeRole?: boolean;
};

export function AuthForm({
  title,
  description,
  endpoint,
  fields,
  submitLabel,
  successPath,
  links,
  includeRole = false,
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_72%_10%,#0b2a5e,transparent_55%)]" />
      <section className="relative w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-[0_24px_60px_rgba(0,0,0,.35)] sm:p-9">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-extrabold text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--blue)] text-xs">D</span>
          DOMUS X
        </Link>
        <h1 className="mt-7 text-3xl font-extrabold tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-2 leading-relaxed text-[var(--gray)]">{description}</p>
        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <label
              key={field.name}
              className="block text-sm font-semibold text-[var(--gray)]"
            >
              {field.label}
              <input
                required
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                defaultValue={field.defaultValue}
                className="mt-1.5 w-full rounded-xl border border-[var(--line-strong)] bg-[var(--navy)] px-3.5 py-3 text-white outline-none transition placeholder:text-[var(--gray)] focus:border-[var(--blue-light)] focus:ring-2 focus:ring-[rgba(11,99,227,.25)]"
              />
            </label>
          ))}
          {includeRole ? (
            <label className="block text-sm font-semibold text-[var(--gray)]">
              Quero começar como
              <select
                name="role"
                className="mt-1.5 w-full rounded-xl border border-[var(--line-strong)] bg-[var(--navy)] px-3.5 py-3 text-white outline-none focus:border-[var(--blue-light)]"
              >
                <option value="GUEST">Hóspede</option>
                <option value="OWNER">Proprietário</option>
              </select>
            </label>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-[rgba(229,98,75,.35)] bg-[rgba(229,98,75,.12)] p-3 text-sm text-[#ff9b8a]"
            >
              {error}
            </p>
          ) : null}
          {success ? (
            <p
              role="status"
              className="rounded-xl border border-[rgba(47,191,135,.35)] bg-[rgba(47,191,135,.12)] p-3 text-sm text-[#7be0b6]"
            >
              {success}
            </p>
          ) : null}
          <button
            disabled={isPending}
            className="w-full rounded-xl bg-[var(--blue)] px-4 py-3.5 font-bold text-white transition hover:bg-[var(--blue-light)] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
          >
            {isPending ? "Enviando..." : submitLabel}
          </button>
        </form>
        <nav className="mt-6 flex flex-col gap-2 text-sm font-semibold text-[var(--blue-light)]">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
