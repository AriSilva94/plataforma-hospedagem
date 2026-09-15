import { AuthForm } from "@/components/auth-form";

export default function ForgotPasswordPage() {
  return (
    <AuthForm
      title="Recuperar senha"
      description="Enviaremos instruções caso exista uma conta para o e-mail informado."
      endpoint="/auth/forgot-password"
      submitLabel="Enviar instruções"
      fields={[
        {
          name: "email",
          label: "E-mail",
          type: "email",
          autoComplete: "email",
        },
      ]}
      links={[{ href: "/login", label: "Voltar para entrar" }]}
    />
  );
}
