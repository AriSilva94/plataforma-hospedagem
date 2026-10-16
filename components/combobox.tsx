"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type Ref } from "react";
import type { IconType } from "react-icons";
import { LuCheck, LuChevronDown, LuLoaderCircle, LuSearch } from "react-icons/lu";
import { useFieldPopover } from "@/components/use-field-popover";

export type ComboboxOption = { value: string; label: string; detail?: string };

function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function filterOptions(options: ComboboxOption[], query: string) {
  const term = normalize(query.trim());
  if (!term) return options;
  const startsWith: ComboboxOption[] = [];
  const contains: ComboboxOption[] = [];
  for (const option of options) {
    const label = normalize(option.label);
    const detail = option.detail ? normalize(option.detail) : "";
    if (label.startsWith(term) || detail === term) startsWith.push(option);
    else if (label.includes(term)) contains.push(option);
  }
  return [...startsWith, ...contains];
}

function HighlightedLabel({ label, query }: { label: string; query: string }) {
  const term = normalize(query.trim());
  const start = term ? normalize(label).indexOf(term) : -1;
  if (start < 0 || normalize(label).length !== label.length) return label;

  return (
    <>
      {label.slice(0, start)}
      <mark className="bg-transparent font-bold text-(--blue-soft)">{label.slice(start, start + term.length)}</mark>
      {label.slice(start + term.length)}
    </>
  );
}

export function Combobox({
  id,
  labelId,
  value,
  options,
  onChange,
  onBlur,
  placeholder,
  searchLabel,
  emptyMessage,
  icon: Icon,
  clearable = true,
  size = "default",
  align = "start",
  name,
  disabled = false,
  loading = false,
  invalid = false,
  describedBy,
  ref,
}: {
  id: string;
  labelId: string;
  value: string;
  options: ComboboxOption[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder: string;
  searchLabel: string;
  emptyMessage: string;
  icon?: IconType;
  clearable?: boolean;
  size?: "default" | "compact";
  align?: "start" | "end";
  name?: string;
  disabled?: boolean;
  loading?: boolean;
  invalid?: boolean;
  describedBy?: string;
  ref?: Ref<HTMLButtonElement>;
}) {
  const { anchorRef, isOpen, open, close, rootProps, panelProps } = useFieldPopover<HTMLButtonElement>();
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const filtered = useMemo(() => filterOptions(options, query), [options, query]);
  const selected = options.find((option) => option.value === value);
  const listId = `${id}-listbox`;
  const valueId = `${id}-value`;
  const activeOption = filtered[activeIndex];

  useEffect(() => {
    if (isOpen) searchRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex, filtered]);

  function openList() {
    setQuery("");
    setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
    open();
  }

  function select(nextValue: string) {
    onChange(nextValue);
    close(true);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, Math.max(0, filtered.length - 1)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeOption) select(activeOption.value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
  }

  return (
    <div {...rootProps} className="relative">
      <button
        ref={(node) => {
          anchorRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-labelledby={`${labelId} ${valueId}`}
        aria-describedby={describedBy}
        data-invalid={invalid}
        data-open={isOpen}
        onClick={() => (isOpen ? close() : openList())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !isOpen) {
            event.preventDefault();
            openList();
          }
        }}
        onBlur={onBlur}
        className={`group flex w-full items-center gap-3 rounded-xl border border-(--line-strong) bg-(--navy) text-left text-(--white) ${
          size === "compact" ? "px-3.5 py-2.5 text-base sm:text-sm" : "px-4 py-3"
        } outline-hidden transition-colors hover:border-(--gray) focus-visible:border-(--blue-light) focus-visible:ring-2 focus-visible:ring-(--blue-light) disabled:cursor-not-allowed disabled:border-(--line) disabled:bg-(--surface) disabled:hover:border-(--line) data-[invalid=true]:border-(--danger) data-[invalid=true]:focus-visible:ring-(--danger) data-[open=true]:border-(--blue-light)`}
      >
        {Icon ? (
          <Icon
            aria-hidden="true"
            size={18}
            className="-mr-0.5 shrink-0 text-(--blue-light) transition-colors group-focus-visible:text-(--blue-soft) group-disabled:text-(--gray) group-disabled:opacity-60 group-data-[open=true]:text-(--blue-soft)"
          />
        ) : null}
        <span id={valueId} className={`min-w-0 flex-1 truncate ${selected ? "" : "text-(--gray)"}`}>
          {selected ? selected.label : placeholder}
        </span>
        {selected?.detail ? (
          <span className="shrink-0 rounded-md bg-(--blue-tint) px-1.5 py-0.5 text-[0.6875rem] leading-4 font-bold tracking-wider text-(--blue-soft) ring-1 ring-(--blue-tint-line) ring-inset">
            {selected.detail}
          </span>
        ) : null}
        {loading ? (
          <LuLoaderCircle aria-hidden="true" size={18} className="shrink-0 animate-spin text-(--gray) motion-reduce:animate-none" />
        ) : (
          <LuChevronDown
            aria-hidden="true"
            size={18}
            className="shrink-0 text-(--gray) transition-transform duration-200 ease-out group-data-[open=true]:rotate-180 group-data-[open=true]:text-(--blue-light) motion-reduce:transition-none"
          />
        )}
      </button>

      {name ? <input type="hidden" name={name} value={value} /> : null}

      <div {...panelProps} data-align={align} className="field-popover w-full min-w-56 overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-(--line) px-3.5">
          <LuSearch aria-hidden="true" size={16} className="shrink-0 text-(--gray)" />
          <input
            ref={searchRef}
            type="text"
            role="combobox"
            aria-label={searchLabel}
            aria-expanded={isOpen}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeOption ? `${id}-option-${activeIndex}` : undefined}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            value={query}
            placeholder={searchLabel}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleSearchKeyDown}
            className="w-full bg-transparent py-3 text-base text-(--white) caret-(--blue-light) outline-hidden placeholder:text-(--gray) sm:text-sm"
          />
        </div>
        <ul ref={listRef} id={listId} role="listbox" aria-labelledby={labelId} className="field-scroll max-h-60 overflow-y-auto p-1.5">
          {filtered.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                data-active={index === activeIndex}
                onPointerMove={() => setActiveIndex(index)}
                onClick={() => select(option.value)}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm text-(--white) data-[active=true]:bg-(--white)/8 aria-selected:font-semibold aria-selected:text-(--white) sm:min-h-10"
              >
                <span className="min-w-0 flex-1 truncate">
                  <HighlightedLabel label={option.label} query={query} />
                </span>
                {option.detail ? (
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-[0.6875rem] leading-4 font-bold tracking-wider ring-1 ring-inset ${
                      isSelected ? "bg-(--blue-tint) text-(--blue-soft) ring-(--blue-tint-line)" : "bg-(--white)/5 text-(--gray) ring-(--line)"
                    }`}
                  >
                    {option.detail}
                  </span>
                ) : null}
                <LuCheck aria-hidden="true" size={16} className={`shrink-0 text-(--blue-soft) ${isSelected ? "" : "invisible"}`} />
              </li>
            );
          })}
          {filtered.length === 0 ? (
            <li role="presentation" className="px-3 py-6 text-center text-sm text-(--gray)">
              {emptyMessage}
            </li>
          ) : null}
        </ul>
        {selected && clearable ? (
          <div className="border-t border-(--line) p-1.5">
            <button
              type="button"
              onClick={() => select("")}
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-(--gray) outline-hidden transition-colors hover:bg-(--white)/8 hover:text-(--white) focus-visible:bg-(--white)/8 focus-visible:text-(--white)"
            >
              Limpar seleção
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
