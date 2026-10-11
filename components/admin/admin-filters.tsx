import type { ReactNode } from "react";
import { LuSearch } from "react-icons/lu";
import { cardClassName, fieldClassName, labelClassName, primaryButtonClassName } from "@/components/owner/styles";

export function AdminFilters({ search, placeholder, children }: { search: string; placeholder: string; children?: ReactNode }) {
  return (
    <form method="get" className={`${cardClassName} mt-6 flex flex-col gap-4 md:flex-row md:items-end`}>
      <div className="md:flex-1">
        <label htmlFor="busca" className={labelClassName}>
          Buscar
        </label>
        <input id="busca" name="busca" type="search" defaultValue={search} placeholder={placeholder} maxLength={100} className={fieldClassName} />
      </div>
      {children}
      <button type="submit" className={primaryButtonClassName}>
        <LuSearch aria-hidden="true" size={16} />
        Filtrar
      </button>
    </form>
  );
}
