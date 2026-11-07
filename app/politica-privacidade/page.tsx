import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Política de Privacidade | DOMUS X" };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Política de Privacidade" updatedAt="7 de novembro de 2026">
      <section>
        <h2>1. Quem somos</h2>
        <p>
          A DOMUS X é uma plataforma que conecta proprietários de imóveis com quartos e suítes reserváveis a hóspedes que procuram estadias flexíveis. Esta política explica quais dados
          pessoais tratamos, para quê e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
        </p>
      </section>

      <section>
        <h2>2. Quais dados coletamos</h2>
        <ul>
          <li>Dados da conta: nome, e-mail e senha, guardada apenas em formato criptografado. Quem entra pelo Google compartilha conosco nome e e-mail da conta Google.</li>
          <li>Dados pessoais informados no perfil: telefone, data de nascimento, cidade, estado e foto. São opcionais para hóspedes e obrigatórios para quem anuncia um imóvel.</li>
          <li>Público do hóspede, quando informado: usado apenas para indicar quartos compatíveis, visível somente para o próprio hóspede.</li>
          <li>Dados dos anúncios: endereço do imóvel, fotos, vídeos, descrições e preços cadastrados pelo proprietário.</li>
          <li>Dados técnicos: endereço IP e informações de sessão, usados para segurança e para manter você conectado.</li>
        </ul>
      </section>

      <section>
        <h2>3. Para que usamos seus dados</h2>
        <ul>
          <li>Criar e manter sua conta e permitir o acesso à plataforma.</li>
          <li>Publicar anúncios e exibir quartos na busca.</li>
          <li>Enviar e-mails sobre a sua conta, como confirmação de cadastro e recuperação de senha.</li>
          <li>Proteger a plataforma contra abuso, fraude e acessos indevidos.</li>
        </ul>
      </section>

      <section>
        <h2>4. O que fica público</h2>
        <p>
          Nos anúncios aparecem apenas o nome do anfitrião e a localização aproximada do imóvel (bairro, cidade e estado). Endereço completo, e-mail, telefone e demais dados pessoais nunca
          são exibidos publicamente.
        </p>
      </section>

      <section>
        <h2>5. Com quem compartilhamos</h2>
        <p>Não vendemos seus dados. Eles são compartilhados apenas com fornecedores necessários para o funcionamento da plataforma:</p>
        <ul>
          <li>Google, quando você escolhe entrar com a sua conta Google.</li>
          <li>Cloudflare, para armazenar e entregar fotos e vídeos.</li>
          <li>Resend, para o envio de e-mails.</li>
          <li>Provedores de hospedagem da plataforma e do banco de dados.</li>
        </ul>
      </section>

      <section>
        <h2>6. Por quanto tempo guardamos</h2>
        <p>
          Guardamos seus dados enquanto a sua conta existir. Ao desativar a conta, o acesso é encerrado e os anúncios deixam de aparecer na busca, mas os dados permanecem armazenados.
          Para pedir a exclusão, entre em contato pelo e-mail abaixo.
        </p>
      </section>

      <section>
        <h2>7. Seus direitos</h2>
        <p>
          Você pode consultar e corrigir seus dados a qualquer momento em <Link href="/perfil">Meu perfil</Link>. Para pedir acesso, portabilidade, exclusão ou tirar dúvidas sobre o
          tratamento dos seus dados, escreva para <a href="mailto:contato@domusx.com.br">contato@domusx.com.br</a>.
        </p>
      </section>

      <section>
        <h2>8. Segurança</h2>
        <p>
          Senhas são armazenadas com criptografia, as conexões usam HTTPS e o acesso à conta é protegido por sessões com tempo de expiração. Fotos enviadas têm os metadados, como
          localização GPS, removidos antes de serem guardadas.
        </p>
      </section>

      <section>
        <h2>9. Cookies</h2>
        <p>
          Usamos apenas cookies necessários para o funcionamento da plataforma. Veja os detalhes na <Link href="/cookies">Política de Cookies</Link>.
        </p>
      </section>

      <section>
        <h2>10. Alterações desta política</h2>
        <p>Esta política pode ser atualizada. A data da última atualização fica sempre no topo da página.</p>
      </section>
    </LegalPage>
  );
}
