import { PublicHome } from "@/components/public-home";
import { UserHome } from "@/components/user-home";
import { getCurrentUser } from "@/lib/current-user";
import { publicPropertyPageSchema } from "@/lib/properties";
import { getApiData } from "@/lib/server-api";

export default async function Home() {
  const { user } = await getCurrentUser();

  if (!user) return <PublicHome />;

  const [featured, listing] = await Promise.all([
    getApiData("/properties?featured=true&limit=8", publicPropertyPageSchema),
    getApiData("/properties?limit=12", publicPropertyPageSchema),
  ]);

  return (
    <UserHome
      user={user}
      featured={featured.status === "ok" ? featured.data.items : null}
      listing={listing.status === "ok" ? listing.data : null}
    />
  );
}
