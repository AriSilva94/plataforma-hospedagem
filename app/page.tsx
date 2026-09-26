import { LandingPage } from "@/components/landing-page";
import { getCurrentUser } from "@/lib/current-user";

export default async function Home() {
  const { user } = await getCurrentUser();

  return <LandingPage user={user} />;
}
