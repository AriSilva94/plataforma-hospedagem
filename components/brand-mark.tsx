import Image from "next/image";
import Link from "next/link";
import logoDark from "@/public/assets/img/logo-full-dark.png";
import logoLight from "@/public/assets/img/logo-full.png";

type BrandSize = "sm" | "md" | "lg";

const heights: Record<BrandSize, string> = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
};

export function BrandMark({
  size = "sm",
  href,
}: {
  size?: BrandSize;
  href?: string;
}) {
  const imageClassName = `w-auto ${heights[size]}`;
  const content = (
    <>
      <Image src={logoLight} alt="CliqueQuarto" priority className={`${imageClassName} dark:hidden`} />
      <Image src={logoDark} alt="CliqueQuarto" priority className={`${imageClassName} hidden dark:block`} />
    </>
  );

  return href ? (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {content}
    </Link>
  ) : (
    <span className="inline-flex shrink-0 items-center">{content}</span>
  );
}
