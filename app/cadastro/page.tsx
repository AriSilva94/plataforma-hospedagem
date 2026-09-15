import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <AuthForm
      title="Criar conta"
      description="Comece como hóspede ou proprietário. Você poderá adicionar o outro perfil depois."
      endpoint="/auth/register"
      submitLabel="Criar conta"
      successPath="/perfil"
      includeRole
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
