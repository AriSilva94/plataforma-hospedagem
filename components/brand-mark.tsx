import Link from "next/link";

type BrandSize = "sm" | "md" | "lg";

const sizes: Record<BrandSize, { label: string; badge: string }> = {
  sm: { label: "text-sm", badge: "size-7 rounded-lg text-xs" },
  md: { label: "text-base", badge: "size-8 rounded-xl text-sm" },
  lg: { label: "text-xl", badge: "size-8 rounded-xl text-sm" },
};

export function BrandMark({
  size = "sm",
  href,
}: {
  size?: BrandSize;
  href?: string;
}) {
  const style = sizes[size];
  const className = `inline-flex items-center gap-2 font-extrabold text-white ${style.label}`;
  const content = (
    <>
      <span
        className={`flex items-center justify-center bg-(--blue) ${style.badge}`}
      >
        D
      </span>
      DOMUS X
    </>
  );

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <span className={className}>{content}</span>
  );
}
