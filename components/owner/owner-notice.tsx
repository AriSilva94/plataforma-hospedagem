import { PageNotice } from "@/components/page-notice";

export function OwnerDataNotice({ status, retryHref }: { status: "not-found" | "unavailable"; retryHref: string }) {
  return status === "not-found" ? (
    <PageNotice
      title="Não encontrado"
      description="Este cadastro não existe ou não pertence à sua conta."
      actionLabel="Voltar para meus imóveis"
      actionHref="/meus-imoveis"
    />
  ) : (
    <PageNotice
      title="Não foi possível carregar"
      description="Não conseguimos carregar estes dados agora. Tente novamente em alguns instantes."
      actionLabel="Tentar novamente"
      actionHref={retryHref}
    />
  );
}
