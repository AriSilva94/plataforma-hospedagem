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
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-7 shadow-sm sm:p-9">
        <Link href="/" className="text-sm font-semibold text-emerald-700">
          Plataforma de Hospedagem
        </Link>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-stone-900">
          {title}
        </h1>
        <p className="mt-2 text-stone-600">{description}</p>
        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <label
              key={field.name}
              className="block text-sm font-medium text-stone-800"
            >
              {field.label}
              <input
                required
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                defaultValue={field.defaultValue}
                className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          ))}
          {includeRole ? (
            <label className="block text-sm font-medium text-stone-800">
              Quero começar como
              <select
                name="role"
                className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2.5"
              >
                <option value="GUEST">Hóspede</option>
                <option value="OWNER">Proprietário</option>
              </select>
            </label>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          ) : null}
          {success ? (
            <p
              role="status"
              className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              {success}
            </p>
          ) : null}
          <button
            disabled={isPending}
            className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
          >
            {isPending ? "Enviando..." : submitLabel}
          </button>
        </form>
        <nav className="mt-6 flex flex-col gap-2 text-sm text-emerald-700">
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
