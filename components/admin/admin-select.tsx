"use client";

import { useState } from "react";
import { Combobox, type ComboboxOption } from "@/components/combobox";
import { labelClassName } from "@/components/owner/styles";

export function AdminSelect({ name, label, value, options }: { name: string; label: string; value: string; options: ComboboxOption[] }) {
  const [selected, setSelected] = useState(value);

  return (
    <div className="md:w-52">
      <label id={`${name}-label`} htmlFor={name} className={labelClassName}>
        {label}
      </label>
      <div className="mt-1.5">
        <Combobox
          id={name}
          name={name}
          labelId={`${name}-label`}
          value={selected}
          options={options}
          onChange={setSelected}
          placeholder="Todos"
          searchLabel={`Buscar em ${label.toLowerCase()}`}
          emptyMessage="Nenhuma opção encontrada."
          size="compact"
        />
      </div>
    </div>
  );
}
