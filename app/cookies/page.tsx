import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Política de Cookies | DOMUS X" };

const cookies = [
  { name: "access_token", purpose: "Mantém você conectado durante a navegação.", duration: "Alguns minutos, renovado automaticamente" },
  { name: "refresh_token", purpose: "Renova a sessão sem pedir login a cada acesso.", duration: "Até 30 dias sem uso, no máximo 90 dias por login" },
  { name: "oauth_google_state e oauth_google_nonce", purpose: "Protegem o login com Google contra fraudes.", duration: "Alguns minutos, apenas durante o login" },
  { name: "theme", purpose: "Lembra se você prefere o tema claro ou escuro.", duration: "1 ano" },
];

export default function CookiesPolicyPage() {
  return (
    <LegalPage title="Política de Cookies" updatedAt="7 de novembro de 2026">
      <section>
        <h2>O que são cookies</h2>
        <p>Cookies são pequenos arquivos guardados pelo navegador. Eles permitem que o site lembre informações entre uma página e outra, como a sua sessão.</p>
      </section>

      <section>
        <h2>Quais cookies usamos</h2>
        <p>A DOMUS X usa apenas cookies necessários. Não usamos cookies de publicidade nem de rastreamento.</p>
        <dl className="mt-4 flex flex-col gap-3">
          {cookies.map((cookie) => (
            <div key={cookie.name} className="rounded-xl border border-(--border) bg-(--surface) p-4 text-sm">
              <dt className="font-mono text-xs font-semibold wrap-break-word text-(--text-primary)">{cookie.name}</dt>
              <dd className="mt-1.5">{cookie.purpose}</dd>
              <dd className="mt-1 text-xs">Duração: {cookie.duration}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2>Como controlar os cookies</h2>
        <p>
          Você pode apagar ou bloquear cookies nas configurações do navegador. Sem os cookies de sessão, não é possível entrar na conta; sem o cookie de tema, o site volta ao tema claro.
        </p>
      </section>

      <section>
        <h2>Mais informações</h2>
        <p>
          Para saber como tratamos seus dados, veja a <Link href="/politica-privacidade">Política de Privacidade</Link>. Dúvidas podem ser enviadas para{" "}
          <a href="mailto:contato@domusx.com.br">contato@domusx.com.br</a>.
        </p>
      </section>
    </LegalPage>
  );
}
