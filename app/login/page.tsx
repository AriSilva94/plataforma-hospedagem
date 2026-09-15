import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <AuthForm
      title="Entrar"
      description="Acesse sua conta para gerenciar seu perfil."
      endpoint="/auth/login"
      submitLabel="Entrar"
      successPath="/perfil"
      fields={[
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
          autoComplete: "current-password",
        },
      ]}
      links={[
        { href: "/recuperar-senha", label: "Esqueci minha senha" },
        { href: "/cadastro", label: "Ainda não tenho conta" },
      ]}
    />
  );
}
