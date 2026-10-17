import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { Toaster } from "@/components/toaster";
import { parseTheme, themeCookieName } from "@/lib/theme";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "DOMUS X | Hospedagens com segurança e discrição",
  description: "Encontre estadias e gerencie seus anúncios com segurança.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  const theme = parseTheme((await cookies()).get(themeCookieName)?.value);

  return (
    <html
      lang="pt-BR"
      data-theme={theme}
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
