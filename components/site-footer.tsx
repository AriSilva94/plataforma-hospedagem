import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="mb-18 border-t border-(--border) md:mb-0">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-1.5 px-6 py-4 text-xs sm:text-sm md:gap-3 md:py-8 text-(--text-secondary) sm:flex-row sm:items-center sm:justify-between md:px-10 lg:px-12">
        <BrandMark size="sm" />
        <p>© 2026 DOMUS X. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
