import Link from "next/link";
import { LuCodeXml } from "react-icons/lu";
import { BrandMark } from "@/components/brand-mark";

const linkClassName =
  "whitespace-nowrap transition-colors hover:text-(--primary-text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)";
const underlineClassName = "underline underline-offset-2";

export function SiteFooter() {
  return (
    <footer className="mb-24 border-t border-(--border) md:mb-0">
      <div className="mx-auto grid w-full max-w-360 gap-2 px-6 py-3.5 text-xs text-(--text-secondary) sm:text-sm md:grid-cols-[1fr_auto] md:items-center md:gap-x-8 md:px-10 md:py-5 lg:px-12 xl:grid-cols-[auto_1fr_auto] xl:py-8">
        <div className="flex items-center justify-center gap-6 md:col-start-1 md:row-start-1 md:justify-start">
          <div className="hidden shrink-0 md:block">
            <BrandMark size="sm" />
          </div>
          <nav aria-label="Informações legais" className="flex gap-4">
            <Link href="/politica-privacidade" className={`${linkClassName} ${underlineClassName}`}>
              Política de Privacidade
            </Link>
            <Link href="/cookies" className={`${linkClassName} ${underlineClassName}`}>
              Cookies
            </Link>
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 md:contents">
          <p className="whitespace-nowrap md:col-span-2 md:row-start-2 xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:text-center">
            © 2026 DOMUS X<span className="hidden sm:inline">. Todos os direitos reservados.</span>
          </p>
          <a
            href="https://arisilva.tech/pt-br"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex w-fit items-center gap-1.5 md:col-start-2 md:row-start-1 md:justify-self-end xl:col-start-3 ${linkClassName}`}
          >
            <LuCodeXml aria-hidden="true" size={14} />
            <span>
              Desenvolvido por <span className={underlineClassName}>AriSilva.tech</span>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
