import { PageNotice } from "@/components/page-notice";
import { ProfileHub } from "@/components/profile-hub";
import { SiteHeader } from "@/components/site-header";
import { favoriteListSchema } from "@/lib/favorites";
import { getCurrentUser } from "@/lib/current-user";
import { ownerRoomsSummarySchema, propertySummarySchema } from "@/lib/properties";
import { getApiData } from "@/lib/server-api";
import { z } from "@/lib/zod";

export default async function ProfilePage() {
  const { user, unavailable } = await getCurrentUser();

  if (!user) {
    return (
      <>
        <SiteHeader user={user} />
        {unavailable ? (
          <PageNotice title="Seu perfil" description="Não foi possível carregar seus dados agora. Tente novamente em alguns instantes." actionLabel="Tentar novamente" actionHref="/perfil" />
        ) : (
          <PageNotice title="Seu perfil" description="Entre para acessar seus dados pessoais." actionLabel="Ir para entrar" actionHref="/login" />
        )}
      </>
    );
  }

  const [properties, favorites, summary] = await Promise.all([
    getApiData("/owner/properties", z.array(propertySummarySchema)),
    getApiData("/favorites", favoriteListSchema),
    getApiData("/owner/rooms/summary", ownerRoomsSummarySchema),
  ]);

  return (
    <>
      <SiteHeader user={user} />
      <ProfileHub
        user={user}
        properties={properties.status === "ok" ? properties.data : []}
        favorites={favorites.status === "ok" ? favorites.data.items : []}
        summary={
          summary.status === "ok"
            ? summary.data
            : { totalRooms: 0, availableRooms: 0, pendingVerificationRooms: 0, rejectedVerificationRooms: 0 }
        }
      />
    </>
  );
}
