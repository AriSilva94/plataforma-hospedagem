import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <AuthForm
      title="Criar conta"
      description="Crie sua conta e escolha depois como deseja usar a plataforma."
      endpoint="/auth/register"
      submitLabel="Criar conta"
      successPath="/perfil"
      fields={[
        {
          name: "name",
          label: "Nome completo",
          type: "text",
          autoComplete: "name",
        },
        {
          name: "email",
          label: "E-mail",
          type: "email",
          autoComplete: "email",
        },
        {
          name: "password",
          label: "Senha",
          type: "password",
          autoComplete: "new-password",
        },
      ]}
      links={[{ href: "/login", label: "Já tenho uma conta" }]}
    />
  );
}
