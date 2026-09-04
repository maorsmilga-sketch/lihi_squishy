"use client";

import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

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
  const holdTimer = useRef<number | null>(null);
  const current = TITLES[pathname] ?? TITLES["/"];

  function startSecretHold() {
    if (pathname === "/admin") return;
    stopSecretHold();
    holdTimer.current = window.setTimeout(() => {
      router.push("/admin");
    }, 2000);
  }

  function stopSecretHold() {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  return (
    <header className="relative z-10 shrink-0 bg-gradient-to-l from-squishy-pink via-squishy-yellow-soft to-squishy-blue px-4 pb-3 pt-[max(0.8rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-3">
        <Portrait src="/lihi_pic.jpg" alt="ליהי" ring="ring-squishy-pink" />
        <div
          className="min-w-0 flex-1 select-none text-center touch-manipulation"
          onPointerDown={startSecretHold}
          onPointerUp={stopSecretHold}
          onPointerLeave={stopSecretHold}
          onPointerCancel={stopSecretHold}
          onContextMenu={(event) => event.preventDefault()}
        >
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
    </header>
  );
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
