import { cookies } from "next/headers";
import { LandingPage } from "@/components/landing-page";

type User = { name: string };

export default async function Home() {
  const cookieStore = await cookies();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/users/me`, {
    cache: "no-store",
    headers: { Cookie: cookieStore.toString() },
  });
  const user = response.ok ? (await response.json()) as User : undefined;

  return <LandingPage user={user} />;
}
