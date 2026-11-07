"use client";

import Image from "next/image";
import { useState } from "react";
import { LuPlay } from "react-icons/lu";

const videoSrc = "/videos/apresentacao.mp4";
const posterSrc = "/videos/apresentacao-poster.jpg";

type PlayerState = "idle" | "playing" | "error";

export function HomeVideoBanner() {
  const [state, setState] = useState<PlayerState>("idle");

  return (
    <section
      aria-labelledby="hero-titulo"
      className="relative isolate min-h-48 flex-1 overflow-hidden rounded-[1.75rem] bg-(--black) shadow-[0_1px_2px_color-mix(in_srgb,var(--shadow)_14%,transparent),0_24px_48px_-24px_color-mix(in_srgb,var(--shadow)_45%,transparent)] ring-1 ring-(--border) after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] after:ring-1 after:ring-(--white)/10 after:ring-inset md:max-h-152 md:min-h-56 xl:min-h-72"
    >
      {state === "playing" ? (
        <video
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          controls
          playsInline
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          onContextMenu={(event) => event.preventDefault()}
          onError={() => setState("error")}
          aria-label="Vídeo de apresentação da DOMUS X"
          className="absolute inset-0 size-full object-cover object-[center_70%]"
        />
      ) : (
        <>
          <Image src={posterSrc} alt="" fill priority sizes="(min-width: 1440px) 1340px, 100vw" className="-z-10 object-cover object-[center_70%]" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-(--black)/85 via-(--black)/50 to-(--black)/15 md:bg-linear-to-r md:from-(--black)/85 md:from-0% md:via-(--black)/60 md:via-40% md:to-transparent md:to-80%" />

          <div className="absolute inset-0 flex max-w-2xl md:right-auto flex-col justify-end gap-3 p-5 md:gap-4 md:p-10 lg:justify-center xl:p-14">
            <h1 id="hero-titulo" className="text-balance text-[1.625rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-(--white) sm:text-4xl xl:text-5xl">
              Encontre o quarto livre sem precisar perguntar.
            </h1>
            <p className="hidden max-w-lg text-pretty sm:block text-sm leading-relaxed text-(--white)/85 md:text-base">
              Quartos e suítes reserváveis de forma independente. Veja o que está disponível, reserve, pague e renove a diária em um só lugar.
            </p>
            {state === "error" ? (
              <p role="alert" className="text-sm font-semibold text-(--white)">
                O vídeo não está disponível agora. Tente novamente mais tarde.
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setState("playing")}
            aria-label="Assistir ao vídeo de apresentação"
            className="group absolute right-4 top-4 flex size-14 items-center justify-center rounded-full bg-(--black)/30 text-(--white) shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--black)_55%,transparent)] ring-1 ring-(--white)/50 backdrop-blur-md transition-[background-color,transform] duration-300 ease-out hover:scale-105 hover:bg-(--primary) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--white) motion-reduce:transition-none motion-reduce:hover:scale-100 md:right-6 md:top-6 md:size-22 lg:right-[14%] lg:top-1/2 lg:-translate-y-1/2"
          >
            <LuPlay aria-hidden="true" className="ml-1 size-6 fill-current md:size-9" />
          </button>
        </>
      )}
    </section>
  );
}
