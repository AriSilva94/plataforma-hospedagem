import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <AuthForm
      title="Criar conta"
      description="Crie sua conta e escolha depois como deseja usar a plataforma."
      endpoint="/auth/register"
      submitLabel="Criar conta"
      sentConfirmation={{
        title: "Confira seu e-mail",
        description:
          "Enviamos um link de confirmação para o e-mail informado. Abra o link para ativar sua conta; ele vale por 24 horas. Se não chegar em alguns minutos, veja a caixa de spam.",
      }}
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
          hint: "Use pelo menos 12 caracteres.",
        },
      ]}
      links={[{ href: "/login", label: "Já tenho uma conta" }]}
    />
  );
}
