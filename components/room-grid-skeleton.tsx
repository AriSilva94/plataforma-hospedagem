const placeholders = Array.from({ length: 8 }, (_, index) => index);
const blockClassName = "rounded-md bg-(--surface-raised)";

export function RoomGridSkeleton() {
  return (
    <div data-room-skeleton aria-hidden="true" className="col-start-1 row-start-1 min-w-0 self-start">
      <p className="mt-12 text-xl font-bold text-(--text-primary)">Todos os anúncios</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
        {placeholders.map((index) => (
          <li key={index} className={`overflow-hidden rounded-2xl border border-(--border-accent) bg-(--surface) ${index >= 4 ? "max-lg:hidden" : ""}`}>
            <div className="animate-pulse motion-reduce:animate-none">
              <div className="aspect-4/3 bg-(--surface-raised)" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className={`h-5 w-3/5 ${blockClassName}`} />
                  <div className="h-6 w-16 rounded-full bg-(--surface-raised)" />
                </div>
                <div className={`mt-4 h-5 w-2/5 ${blockClassName}`} />
                <div className={`mt-2 h-4 w-3/4 ${blockClassName}`} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
