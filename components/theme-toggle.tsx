"use client";

import { useEffect, useId, useRef } from "react";
import { parseTheme, themeCookieName, type Theme } from "@/lib/theme";

const themeCookieMaxAge = 60 * 60 * 24 * 365;
const spriteFrameSize = 160;
const spriteFrameMs = 20;
const sprites = [
  { name: "sun", frames: 154, columns: 14 },
  { name: "moon", frames: 120, columns: 12 },
] as const;

const fade = "transition-opacity duration-[.7s] ease-[ease]";
const fadeShort = "transition-opacity duration-[.49s] ease-[ease]";
const slide = "transition-[translate] duration-[.7s] ease-[cubic-bezier(.65,0,.35,1)]";
const spin = "origin-[18px_28px] [transition:opacity_.49s_ease,rotate_.7s_cubic-bezier(.65,0,.35,1)]";
const night = "opacity-0 dark:opacity-100";
const day = "opacity-100 dark:opacity-0";

function resolveCurrentTheme(): Theme {
  return parseTheme(document.documentElement.dataset.theme) ?? "light";
}

export function ThemeToggle() {
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = sprites.map((sprite) => ({
      ...sprite,
      images: svg.querySelectorAll<SVGImageElement>(`image[data-sprite="${sprite.name}"]`),
    }));
    const start = performance.now();
    let frameRequest = 0;

    const tick = (now: number) => {
      const step = Math.floor((now - start) / spriteFrameMs);
      for (const { frames, columns, images } of targets) {
        const frame = step % frames;
        const x = String(-(frame % columns) * spriteFrameSize);
        const y = String(-Math.floor(frame / columns) * spriteFrameSize);
        images.forEach((image) => {
          image.setAttribute("x", x);
          image.setAttribute("y", y);
        });
      }
      frameRequest = requestAnimationFrame(tick);
    };

    frameRequest = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRequest);
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    const next: Theme = resolveCurrentTheme() === "dark" ? "light" : "dark";
    document.cookie = `${themeCookieName}=${next}; path=/; max-age=${themeCookieMaxAge}; samesite=lax`;

    const applyTheme = () => {
      root.classList.add("theme-switching");
      root.dataset.theme = next;
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
    };

    if (!document.startViewTransition) {
      applyTheme();
      return;
    }
    document.startViewTransition(applyTheme);
  }

  const sunSprite = (
    <image data-sprite="sun" href="/theme-toggle/sun-sprite.png" x="0" y="0" width="2240" height="1760" />
  );
  const moonSprite = (
    <image data-sprite="moon" href="/theme-toggle/moon-sprite.png" x="0" y="0" width="1920" height="1600" />
  );
  const hillsBack = "M33.7 28.8 V25.6 Q35.6 24.3 37.6 25 Q39.6 23.7 41.8 24.6 Q43.6 23.9 45.4 24.9 Q47.8 23.2 50.6 24.5 Q52.6 23.8 54.8 24.8 Q57.2 23.9 59.4 25 Q61.4 24.4 63.5 25.3 V28.8 Z";
  const hillsFront = "M33.7 28.8 V26.8 Q36.4 25.7 39 26.5 Q42 25.4 45 26.4 Q48.4 25.6 51.8 26.6 Q55 25.8 58.4 26.6 Q61 26 63.5 26.8 V28.8 Z";
  const lightPatch = "M33 46 L59.5 46 L67 53.5 L28.5 53.5 Z";

  return (
    <span className="theme-toggle group relative [view-transition-name:theme-toggle] inline-flex items-center align-middle">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Alternar entre tema claro e escuro"
        className="block cursor-pointer rounded-full leading-none shadow-[0_0_0_1px_rgba(3,17,40,.10),0_1px_2px_rgba(3,17,40,.16),0_6px_18px_-4px_rgba(3,17,40,.22)] [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--focus-ring)"
      >
        <svg ref={svgRef} viewBox="0 0 140 56" aria-hidden="true" className="block h-9.5 w-24 overflow-hidden rounded-full">
          <defs>
            <clipPath id={id("pill")}><rect x="0" y="0" width="140" height="56" rx="28" /></clipPath>
            <clipPath id={id("knob")}><circle cx="18" cy="28" r="12.75" /></clipPath>
            <clipPath id={id("win")}><rect x="33.7" y="10.2" width="29.8" height="18.6" /></clipPath>
            <filter id={id("blur")} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation=".9" /></filter>
            <linearGradient id={id("wall")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dbe1ea" /><stop offset=".6" stopColor="#e8ecf1" /><stop offset="1" stopColor="#dfe4eb" /></linearGradient>
            <linearGradient id={id("wall-l")} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c3cbd6" /><stop offset="1" stopColor="#d2d9e2" /></linearGradient>
            <linearGradient id={id("floor")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7f8ea5" /><stop offset="1" stopColor="#9ba8bb" /></linearGradient>
            <linearGradient id={id("sky-d")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6f9ef0" /><stop offset=".75" stopColor="#b9d1ff" /><stop offset="1" stopColor="#e6edf8" /></linearGradient>
            <linearGradient id={id("sky-n")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#031128" /><stop offset=".8" stopColor="#0f1f39" /><stop offset="1" stopColor="#12274a" /></linearGradient>
            <radialGradient id={id("moonglow")}><stop offset="0" stopColor="#8ab4ff" stopOpacity=".45" /><stop offset="1" stopColor="#8ab4ff" stopOpacity="0" /></radialGradient>
            <radialGradient id={id("glow")} cx="72" cy="25" r="34" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#dce7ff" stopOpacity=".95" /><stop offset=".35" stopColor="#8ab4ff" stopOpacity=".4" /><stop offset="1" stopColor="#8ab4ff" stopOpacity="0" /></radialGradient>
            <linearGradient id={id("cone-up")} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#c7dbff" stopOpacity=".7" /><stop offset="1" stopColor="#c7dbff" stopOpacity="0" /></linearGradient>
            <linearGradient id={id("pleat")} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f4f6f8" /><stop offset=".55" stopColor="#e3e8ee" /><stop offset="1" stopColor="#c4ccd7" /></linearGradient>
            <linearGradient id={id("boucle")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c3cbd6" /><stop offset="1" stopColor="#aab4c3" /></linearGradient>
            <linearGradient id={id("pillow")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#dbe1e9" /></linearGradient>
            <linearGradient id={id("sunpatch")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".55" /><stop offset="1" stopColor="#ffffff" stopOpacity=".1" /></linearGradient>
            <linearGradient id={id("moonpatch")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ab4ff" stopOpacity=".22" /><stop offset="1" stopColor="#8ab4ff" stopOpacity=".04" /></linearGradient>
            <linearGradient id={id("inner")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity=".16" /><stop offset=".14" stopColor="#000" stopOpacity="0" /><stop offset=".9" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".08" /></linearGradient>
            <linearGradient id={id("art-sky")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9d1ff" /><stop offset="1" stopColor="#eef3fb" /></linearGradient>
            <linearGradient id={id("art-sea")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a83f0" /><stop offset="1" stopColor="#0f1f39" /></linearGradient>
            <linearGradient id={id("frame")} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1b3358" /><stop offset="1" stopColor="#031128" /></linearGradient>
          </defs>
          <g clipPath={url("pill")}>
            <g clipPath={url("win")}>
              <rect x="33.7" y="10.2" width="29.8" height="18.6" fill={url("sky-d")} />
              <rect x="33.7" y="10.2" width="29.8" height="18.6" fill={url("sky-n")} className={`${fade} ${night}`} />
              <g fill="#fff" className={`${fadeShort} ${night} dark:delay-[.32s]`}>
                <circle cx="36.4" cy="12.6" r=".32" /><circle cx="47" cy="11.8" r=".26" /><circle cx="53.5" cy="14" r=".4" /><circle cx="60.6" cy="12" r=".3" /><circle cx="58" cy="19.4" r=".26" /><circle cx="36" cy="20.5" r=".28" /><circle cx="50.6" cy="20.8" r=".22" /><circle cx="61.6" cy="22.2" r=".3" /><circle cx="45.2" cy="17.6" r=".22" />
              </g>
              <g className={`${fadeShort} ${day}`}>
                <path d="M35.2 21.6 Q35.6 20.2 37.2 20.5 Q37.9 19.1 39.6 19.6 Q40.8 18.9 41.8 20.3 Q43.2 20.2 43.4 21.6 Z" fill="#fff" opacity=".92" />
                <path d="M52.5 24 Q52.9 23 54.1 23.2 Q54.8 22.3 56 22.8 Q57.1 22.6 57.4 24 Z" fill="#fff" opacity=".7" />
              </g>
              <g className={`${slide} delay-[.21s] group-hover:translate-x-[.5px] group-hover:translate-y-[3px] dark:translate-x-[3px] dark:translate-y-[18px] dark:delay-0 dark:group-hover:translate-x-[3px] dark:group-hover:translate-y-[18px]`}>
                <svg x="50.5" y="10.5" width="11" height="11" viewBox="0 0 160 160" overflow="hidden">{sunSprite}</svg>
              </g>
              <g className={`${slide} -translate-x-[3px] translate-y-[18px] dark:translate-0 dark:delay-[.21s] dark:group-hover:translate-x-[-0.5px] dark:group-hover:translate-y-[3px]`}>
                <circle cx="41" cy="16.2" r="8" fill={url("moonglow")} />
                <svg x="36" y="11.2" width="10" height="10" viewBox="0 0 160 160" overflow="hidden">{moonSprite}</svg>
              </g>
              <path d={hillsBack} fill="#a9bedc" />
              <path d={hillsFront} fill="#8ea6cb" />
              <path d={hillsBack} fill="#12274a" className={`${fade} ${night}`} />
              <path d={hillsFront} fill="#0b1a33" className={`${fade} ${night}`} />
              <g fill="#8ab4ff" className={`${fadeShort} ${night} dark:delay-[.32s]`}>
                <rect x="40.2" y="27.4" width=".5" height=".5" /><rect x="47.6" y="27.8" width=".5" height=".5" /><rect x="55.8" y="27.3" width=".5" height=".5" /><rect x="56.6" y="27.3" width=".5" height=".5" />
              </g>
            </g>
            <path d="M18 -2H122V40H18Z M31 9H63V29H31Z" fill={url("wall")} fillRule="evenodd" />
            <path d="M-4 -2 L18 -2 L18 40 L-4 45.9 Z" fill={url("wall-l")} />
            <path d="M122 -2 L144 -2 L144 45.9 L122 40 Z" fill="#cbd2dc" />
            <path d="M0 44.85 L18 40 L122 40 L140 44.85 L140 56 L0 56 Z" fill={url("floor")} />
            <g stroke="#6e7d94" strokeWidth=".3" opacity=".55">
              <line x1="30" y1="40" x2="-15.7" y2="56" /><line x1="38" y1="40" x2="1.4" y2="56" /><line x1="46" y1="40" x2="18.6" y2="56" /><line x1="54" y1="40" x2="35.7" y2="56" /><line x1="62" y1="40" x2="52.9" y2="56" /><line x1="70" y1="40" x2="70" y2="56" /><line x1="78" y1="40" x2="87.1" y2="56" /><line x1="86" y1="40" x2="104.3" y2="56" /><line x1="94" y1="40" x2="121.4" y2="56" /><line x1="102" y1="40" x2="138.6" y2="56" /><line x1="22" y1="40" x2="-32.9" y2="56" />
            </g>
            <rect x="18" y="38.7" width="104" height="1.3" fill="#eef1f5" />
            <path d="M0 43.5 L18 38.7 L18 40 L0 44.85 Z" fill="#d8dee6" />
            <path d="M122 38.7 L140 43.5 L140 44.85 L122 40 Z" fill="#e0e5ec" />
            <rect x="17.6" y="-2" width=".8" height="42" fill="#000" opacity=".05" />
            <path d={lightPatch} fill={url("sunpatch")} className={`${fade} ${day}`} />
            <path d="M29.4 7.4 H64.6 V29 H63 V9 H31 V29 H29.4 Z" fill="#f4f6f8" />
            <rect x="29.4" y="7.4" width="35.2" height=".35" fill="#000" opacity=".06" />
            <path d="M31 9 L63 9 L63.5 10.2 L33.7 10.2 Z" fill="#a6b0bf" />
            <path d="M31 9 L33.7 10.2 L33.7 28.8 L31 29 Z" fill="#bfc7d2" />
            <path d="M63 9 L63.5 10.2 L63.5 28.8 L63 29 Z" fill="#b3bcc9" />
            <path d="M33.7 10.2H63.5V28.8H33.7Z M34.7 11.2H62.5V27.8H34.7Z" fill="#f4f6f8" fillRule="evenodd" />
            <rect x="48.1" y="11.2" width="1" height="16.6" fill="#f4f6f8" />
            <rect x="34.7" y="18" width="27.8" height=".8" fill="#f4f6f8" />
            <rect x="48.85" y="17.6" width=".7" height="1.6" rx=".2" fill="#b2bbc8" />
            <path d="M28.6 29 H65.6 L66.2 30.4 H28 Z" fill="#ffffff" />
            <rect x="28" y="30.4" width="38.2" height="1" fill="#dfe4eb" />
            <rect x="29" y="31.4" width="36.2" height="1.6" fill="#000" opacity=".08" filter={url("blur")} />
            <path d="M36 28.8 L44 10.2 L46.2 10.2 L38.2 28.8 Z" fill="#fff" className={`${fade} opacity-[.14] dark:opacity-[.04]`} />
            <line x1="19.4" y1="5.2" x2="66" y2="5.2" stroke="#b2bbc8" strokeWidth=".8" />
            <circle cx="19.2" cy="5.2" r=".9" fill="#c3cad5" /><circle cx="66.2" cy="5.2" r=".9" fill="#c3cad5" />
            <path d="M20.4 5.6 H22.8 L23.2 38.6 Q21.9 39.2 20.6 38.6 Z" fill={url("pleat")} />
            <path d="M22.8 5.6 H25.2 L25.8 38.8 Q24.4 39.4 23.2 38.8 Z" fill={url("pleat")} />
            <path d="M25.2 5.6 H27.6 L28.4 38.6 Q27 39.2 25.8 38.6 Z" fill={url("pleat")} />
            <path d="M27.6 5.6 H29.6 L30.6 38.4 Q29.5 39 28.4 38.4 Z" fill={url("pleat")} />
            <g fill="#c3cad5"><rect x="21" y="4.6" width="1.2" height="1.4" rx=".5" /><rect x="23.4" y="4.6" width="1.2" height="1.4" rx=".5" /><rect x="25.8" y="4.6" width="1.2" height="1.4" rx=".5" /><rect x="28" y="4.6" width="1.2" height="1.4" rx=".5" /></g>
            <ellipse cx="25.5" cy="39.6" rx="6" ry=".8" fill="#000" opacity=".12" filter={url("blur")} />
            <rect x="88.9" y="10" width="6.6" height="9.4" fill="#031128" opacity=".2" filter={url("blur")} />
            <rect x="97.1" y="10" width="6.6" height="9.4" fill="#031128" opacity=".2" filter={url("blur")} />
            <rect x="88.6" y="9" width="6.6" height="9.4" fill={url("frame")} />
            <rect x="89" y="9.4" width="5.8" height="8.6" fill="#f4f6f8" />
            <rect x="89" y="9.4" width="5.8" height=".25" fill="#000" opacity=".1" />
            <rect x="89.9" y="10.5" width="4" height="5.8" fill={url("art-sky")} />
            <path d="M90.75 13.95 A1.15 1.15 0 0 1 93.05 13.95 Z" fill="#0b63e3" />
            <rect x="89.9" y="13.95" width="4" height="2.35" fill={url("art-sea")} />
            <path d="M90.9 14.5 H92.9 M91.3 15 H92.5 M91.6 15.5 H92.2" stroke="#b9d1ff" strokeWidth=".14" />
            <rect x="89.9" y="10.5" width="4" height="5.8" fill="none" stroke="#031128" strokeOpacity=".15" strokeWidth=".1" />
            <rect x="92.3" y="17.15" width="1.6" height=".14" fill="#b2bbc8" />
            <rect x="96.8" y="9" width="6.6" height="9.4" fill={url("frame")} />
            <rect x="97.2" y="9.4" width="5.8" height="8.6" fill="#f4f6f8" />
            <rect x="97.2" y="9.4" width="5.8" height=".25" fill="#000" opacity=".1" />
            <rect x="98.1" y="10.5" width="4" height="5.8" fill="#eaeef4" />
            <path d="M100.1 16 Q99.7 13.4 100.3 10.9" fill="none" stroke="#0f1f39" strokeWidth=".16" />
            <path d="M100 15.2 Q98.9 14.9 98.6 13.9 Q99.6 14 100 15.2 Z M100.05 13.9 Q101.2 13.6 101.6 12.6 Q100.5 12.7 100.05 13.9 Z M99.95 12.7 Q99 12.3 98.9 11.4 Q99.8 11.6 99.95 12.7 Z M100.2 11.5 Q101 11.1 101.1 10.6 Q100.4 10.7 100.2 11.5 Z" fill="#12274a" />
            <path d="M99.9 14.6 Q101 14.6 101.5 13.9 Q100.6 13.7 99.9 14.6 Z" fill="#3a83f0" opacity=".8" />
            <rect x="98.1" y="10.5" width="4" height="5.8" fill="none" stroke="#031128" strokeOpacity=".15" strokeWidth=".1" />
            <rect x="100.5" y="17.15" width="1.6" height=".14" fill="#b2bbc8" />
            <ellipse cx="72.2" cy="41.2" rx="6.6" ry=".9" fill="#000" opacity=".22" filter={url("blur")} />
            <path d="M67 33.5 H77 L77.56 34.1 H66.76 Z" fill="#1b3358" />
            <rect x="66.76" y="34.1" width="10.8" height="5.7" rx=".3" fill="#12274a" />
            <rect x="67.5" y="34.9" width="9.3" height="2.1" rx=".2" fill="#173055" />
            <rect x="67.5" y="37.3" width="9.3" height="2.1" rx=".2" fill="#173055" />
            <rect x="71.2" y="35.75" width="1.9" height=".45" rx=".2" fill="#c3cad5" />
            <rect x="71.2" y="38.15" width="1.9" height=".45" rx=".2" fill="#c3cad5" />
            <rect x="67.3" y="39.8" width=".7" height="1.3" fill="#031128" /><rect x="76.3" y="39.8" width=".7" height="1.3" fill="#031128" />
            <rect x="74.2" y="32.7" width="2.6" height=".9" rx=".15" fill="#0b63e3" />
            <rect x="74.5" y="31.9" width="2.1" height=".8" rx=".15" fill="#e3e8ee" />
            <ellipse cx="71.4" cy="33.6" rx="1.8" ry=".45" fill="#b2bbc8" />
            <rect x="71.15" y="26.6" width=".5" height="7" fill="#c3cad5" />
            <path d="M68.4 27 L74.4 27 L73.1 22.4 L69.7 22.4 Z" fill="#e9edf3" />
            <path d="M71.4 27 L74.4 27 L73.1 22.4 L71.4 22.4 Z" fill="#000" opacity=".06" />
            <ellipse cx="104" cy="44.6" rx="23" ry="1.4" fill="#000" opacity=".25" filter={url("blur")} />
            <rect x="79" y="23.2" width="34" height="16.8" rx="1" fill="#0f1f39" />
            <rect x="79" y="23.2" width="34" height=".5" rx=".25" fill="#1b3358" />
            <rect x="80.4" y="24.6" width="10" height="9.6" rx="1.4" fill={url("boucle")} />
            <rect x="91" y="24.6" width="10" height="9.6" rx="1.4" fill={url("boucle")} />
            <rect x="101.6" y="24.6" width="10" height="9.6" rx="1.4" fill={url("boucle")} />
            <path d="M80 33.6 H112 L116.2 34.4 H81 Z" fill="#f4f6f8" />
            <path d="M80 36.5 L83.2 39.86 L83.2 42.76 L80 38.7 Z" fill="#0b1a33" />
            <rect x="83.2" y="39.86" width="42.2" height="2.9" fill="#12274a" />
            <rect x="83.2" y="39.86" width="42.2" height=".4" fill="#1b3358" />
            <rect x="84" y="42.76" width="1.1" height="1.7" fill="#031128" /><rect x="123.6" y="42.76" width="1.1" height="1.7" fill="#031128" />
            <ellipse cx="88.6" cy="34" rx="6.6" ry="1" fill="#000" opacity=".16" filter={url("blur")} />
            <ellipse cx="103.4" cy="34" rx="6.6" ry="1" fill="#000" opacity=".16" filter={url("blur")} />
            <path d="M82.2 30.6 Q82 29.4 83.6 29.2 Q88.6 28.6 93.6 29.2 Q95.2 29.4 95 30.6 L95.4 33.4 Q95.4 34.6 93.8 34.6 L83.4 34.6 Q81.8 34.6 81.8 33.4 Z" fill={url("pillow")} />
            <path d="M97 30.6 Q96.8 29.4 98.4 29.2 Q103.4 28.6 108.4 29.2 Q110 29.4 109.8 30.6 L110.2 33.4 Q110.2 34.6 108.6 34.6 L98.2 34.6 Q96.6 34.6 96.6 33.4 Z" fill={url("pillow")} />
            <path d="M90.6 32.2 Q90.6 31 91.8 31 L98.8 31 Q100 31 100 32.2 L100.2 34.4 Q100.2 35.2 99.2 35.2 L91.6 35.2 Q90.6 35.2 90.6 34.4 Z" fill="#1b3358" />
            <path d="M95.3 31.2 V35" stroke="#0f1f39" strokeWidth=".25" />
            <path d="M80.56 33.7 L116.64 33.7 L126.39 35.31 L82.77 35.31 Z" fill="#c3cbd6" />
            <path d="M80.56 33.7 L82.77 35.31 L82.77 41.2 Q81.6 40.6 80.56 39.4 Z" fill="#9ea9b8" />
            <path d="M82.77 35.31 H126.39 V40.6 Q126.39 41.3 125.6 41.3 H83.6 Q82.77 41.3 82.77 40.6 Z" fill="#b2bbc8" />
            <path d="M86 34.4 Q95 33.9 104 34.6 M99 34.2 Q108 34 116 34.9" fill="none" stroke="#a7b1bf" strokeWidth=".3" />
            <path d="M80.27 33.28 L115.37 33.28 L117.49 33.62 L117.49 34.5 Q117.49 34.9 117 34.9 L81.2 34.9 Q80.75 34.9 80.75 34.5 L80.75 33.62 Z" fill="#ffffff" />
            <path d="M80.75 34.5 H117.49" stroke="#d3d9e2" strokeWidth=".25" />
            <path d="M113.4 34.4 L119.4 34.4 L123.6 35.2 L114.6 35.2 Z" fill="#3a83f0" />
            <path d="M114.6 35.2 H123.6 V41.6 Q123.6 42.1 123.1 42.1 H115.1 Q114.6 42.1 114.6 41.6 Z" fill="#0b63e3" />
            <path d="M116.2 35.4 V41.8 M121.8 35.4 V41.8" stroke="#0951bb" strokeWidth=".25" />
            <ellipse cx="12" cy="47" rx="5" ry=".9" fill="#000" opacity=".22" filter={url("blur")} />
            <g stroke="#55704d" strokeWidth=".35" fill="none">
              <path d="M12 41 Q11 34 8.2 28.6" /><path d="M12 41 Q12.6 33 15.6 26.4" /><path d="M12 41 Q12 35 11.4 24.4" /><path d="M12 41 Q14 37 17.4 33.8" /><path d="M12 41 Q9.6 38 6.4 35.4" />
            </g>
            <g fill="#4c6845">
              <path d="M8.2 28.6 C 5.4 28.4 4.6 25.4 6.4 23.6 C 8.6 24.4 9.6 26.6 8.2 28.6 Z" />
              <path d="M15.6 26.4 C 15.4 23.2 17.6 21.6 20.2 22.2 C 19.8 24.8 18 26.6 15.6 26.4 Z" />
              <path d="M17.4 33.8 C 18.4 31.4 21 30.8 22.8 32 C 21.6 34.2 19.4 34.8 17.4 33.8 Z" />
            </g>
            <g fill="#5f7d56">
              <path d="M11.4 24.4 C 9.6 22 10.4 19 12.6 18.2 C 13.8 20.6 13.4 23.2 11.4 24.4 Z" />
              <path d="M6.4 35.4 C 4 35.8 2.4 33.8 3 31.8 C 5.2 31.8 6.8 33.2 6.4 35.4 Z" />
            </g>
            <path d="M8.8 40.6 H15.2 L14.5 46.6 Q14.4 47.1 13.9 47.1 H10.1 Q9.6 47.1 9.5 46.6 Z" fill="#dfe4eb" />
            <path d="M12 40.6 H15.2 L14.5 46.6 Q14.4 47.1 13.9 47.1 H12 Z" fill="#000" opacity=".07" />
            <ellipse cx="12" cy="40.6" rx="3.2" ry=".5" fill="#e3e8ee" />
            <path
              d="M0 0H140V56H0Z M34.7 11.2H48.1V18H34.7Z M49.1 11.2H62.5V18H49.1Z M34.7 18.8H48.1V27.8H34.7Z M49.1 18.8H62.5V27.8H49.1Z"
              fill="#031128"
              fillRule="evenodd"
              className={`${fade} opacity-0 mix-blend-multiply dark:opacity-[.66]`}
            />
            <path d={lightPatch} fill={url("moonpatch")} className={`${fade} ${night} dark:delay-[.21s]`} />
            <g className={`${fadeShort} ${night} dark:delay-[.35s]`}>
              <rect x="0" y="0" width="140" height="56" fill={url("glow")} className="mix-blend-screen" />
              <path d="M69.7 22.4 L73.1 22.4 L76.6 12 L66.2 12 Z" fill={url("cone-up")} className="mix-blend-screen" />
              <path d="M68.4 27 L74.4 27 L73.1 22.4 L69.7 22.4 Z" fill="#f4f6f8" />
              <path d="M71.4 27 L74.4 27 L73.1 22.4 L71.4 22.4 Z" fill="#c7dbff" opacity=".5" />
              <ellipse cx="71.4" cy="27.1" rx="3" ry=".45" fill="#ffffff" />
              <ellipse cx="71.4" cy="22.4" rx="1.7" ry=".3" fill="#ffffff" />
              <ellipse cx="71.6" cy="33.8" rx="5.6" ry=".8" fill="#c7dbff" opacity=".55" filter={url("blur")} />
            </g>
            <rect x="0" y="0" width="140" height="56" fill={url("inner")} />
            <g className={`${slide} group-hover:translate-x-[3.5px] dark:translate-x-[104px] dark:group-hover:translate-x-[100.5px]`}>
              <circle cx="18" cy="29.7" r="13" fill="#031128" opacity=".3" filter={url("blur")} />
              <circle cx="18" cy="28" r="13" fill="#f4f6f8" />
              <circle cx="18" cy="28" r="13" fill="#0f1f39" className={`${fade} ${night}`} />
              <circle cx="18" cy="28" r="12.75" fill="none" stroke="#b2bbc8" strokeOpacity=".4" strokeWidth=".5" />
              <g clipPath={url("knob")}>
                <g className={`${spin} ${day} rotate-0 dark:rotate-90`}>
                  <svg x="1.5" y="11.5" width="33" height="33" viewBox="0 0 160 160" overflow="hidden">{sunSprite}</svg>
                </g>
                <g className={`${spin} ${night} -rotate-90 dark:rotate-0`}>
                  <svg x="2" y="12" width="32" height="32" viewBox="0 0 160 160" overflow="hidden">{moonSprite}</svg>
                </g>
              </g>
            </g>
          </g>
        </svg>
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[calc(100%+10px)] right-0 z-10 whitespace-nowrap rounded-lg border border-[rgba(178,187,200,.26)] bg-[#12274a] px-2.5 py-1.75 text-xs leading-none font-medium text-[#f4f6f8] opacity-0 shadow-[0_6px_18px_rgba(3,17,40,.35)] transition-opacity group-hover:opacity-100 group-has-focus-visible:opacity-100"
      >
        <span className="dark:hidden">Mudar para tema escuro</span>
        <span className="hidden dark:inline">Mudar para tema claro</span>
      </span>
    </span>
  );
}
