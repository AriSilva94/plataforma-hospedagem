import { PublicHome } from "@/components/public-home";
import { UserHome } from "@/components/user-home";
import { getCurrentUser } from "@/lib/current-user";

export default async function Home() {
  const { user } = await getCurrentUser();

  return user ? <UserHome user={user} /> : <PublicHome />;
}
