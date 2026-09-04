"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const HOLD_MS = 1500;
const TAP_WINDOW_MS = 2500;
const TAPS_NEEDED = 5;
const MOVE_CANCEL_PX = 40;

const TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/": {
    title: "עולם הסקווישים",
    subtitle: "של ליהי וארי",
  },
  "/videos": {
    title: "סרטונים",
    subtitle: "איך משחקים עם הסקווישים",
  },
  "/about": {
    title: "עלינו",
    subtitle: "הסיפור של ליהי וארי",
  },
  "/admin": {
    title: "ניהול",
    subtitle: "רק לליהי ולארי",
  },
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const holdRef = useRef<HTMLDivElement>(null);
  const [holding, setHolding] = useState(false);
  const current = TITLES[pathname] ?? TITLES["/"];

  useEffect(() => {
    if (pathname === "/admin") return;
    const el = holdRef.current;
    if (!el) return;

    let holdTimer: number | null = null;
    let tapTimer: number | null = null;
    let startX = 0;
    let startY = 0;
    let taps = 0;
    let opened = false;

    function openAdmin() {
      if (opened) return;
      opened = true;
      setHolding(false);
      if (navigator.vibrate) navigator.vibrate(30);
      router.push("/admin");
    }

    function clearHold() {
      if (holdTimer !== null) {
        window.clearTimeout(holdTimer);
        holdTimer = null;
      }
      setHolding(false);
    }

    function startHold(x: number, y: number) {
      startX = x;
      startY = y;
      if (holdTimer !== null) window.clearTimeout(holdTimer);
      setHolding(true);
      holdTimer = window.setTimeout(openAdmin, HOLD_MS);
    }

    function movedTooFar(x: number, y: number) {
      return Math.hypot(x - startX, y - startY) > MOVE_CANCEL_PX;
    }

    function onTouchStart(event: TouchEvent) {
      event.preventDefault();
      const touch = event.changedTouches[0];
      startHold(touch.clientX, touch.clientY);
    }

    function onTouchMove(event: TouchEvent) {
      const touch = event.changedTouches[0];
      if (movedTooFar(touch.clientX, touch.clientY)) clearHold();
    }

    function onTouchEnd() {
      const wasHolding = holdTimer !== null;
      clearHold();
      if (!wasHolding || opened) return;

      taps += 1;
      if (tapTimer !== null) window.clearTimeout(tapTimer);
      if (taps >= TAPS_NEEDED) {
        taps = 0;
        openAdmin();
        return;
      }
      tapTimer = window.setTimeout(() => {
        taps = 0;
      }, TAP_WINDOW_MS);
    }

    function onMouseDown(event: MouseEvent) {
      if (event.button !== 0) return;
      startHold(event.clientX, event.clientY);
    }

    function onMouseUp() {
      const wasHolding = holdTimer !== null;
      clearHold();
      if (!wasHolding || opened) return;
      taps += 1;
      if (tapTimer !== null) window.clearTimeout(tapTimer);
      if (taps >= TAPS_NEEDED) {
        taps = 0;
        openAdmin();
        return;
      }
      tapTimer = window.setTimeout(() => {
        taps = 0;
      }, TAP_WINDOW_MS);
    }

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", clearHold);
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("contextmenu", preventMenu);

    return () => {
      clearHold();
      if (tapTimer !== null) window.clearTimeout(tapTimer);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", clearHold);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("contextmenu", preventMenu);
    };
  }, [pathname, router]);

  return (
    <header
      ref={holdRef}
      className={`secret-hold relative z-10 shrink-0 bg-gradient-to-l from-squishy-pink via-squishy-yellow-soft to-squishy-blue px-4 pb-3 pt-[max(0.8rem,env(safe-area-inset-top))] ${
        holding ? "brightness-95" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <Portrait src="/lihi_pic.jpg" alt="ליהי" ring="ring-squishy-pink" />
        <div className="relative min-w-0 flex-1 select-none py-1 text-center">
          <h1 className="text-xl font-extrabold leading-tight tracking-tight text-ink sm:text-2xl">
            {current.title}
          </h1>
          {current.subtitle ? (
            <p className="mt-0.5 text-sm font-medium text-ink/70">
              {current.subtitle}
            </p>
          ) : null}
        </div>
        <Portrait src="/ari_pic.png" alt="ארי" ring="ring-squishy-blue" />
      </div>
      <span
        className="pointer-events-none absolute inset-x-8 bottom-1 h-1 overflow-hidden rounded-full bg-white/35"
        aria-hidden
      >
        <span
          className={`block h-full origin-center rounded-full bg-ink/50 transition-transform duration-[1500ms] ease-linear ${
            holding ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </span>
    </header>
  );
}

function preventMenu(event: Event) {
  event.preventDefault();
}

function Portrait({
  src,
  alt,
  ring,
}: {
  src: string;
  alt: string;
  ring: string;
}) {
  return (
    <div
      className={`h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white shadow-md ring-2 ring-offset-1 ${ring}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover object-[center_28%]"
      />
    </div>
  );
}
