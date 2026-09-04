"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "חנות", icon: StoreIcon },
  { href: "/videos", label: "סרטונים", icon: VideoIcon },
  { href: "/about", label: "עלינו", icon: HeartIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="absolute inset-x-0 bottom-0 z-20 border-t border-pink-100 bg-white/95 px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] backdrop-blur-md"
      aria-label="ניווט ראשי"
    >
      <ul className="grid grid-cols-3 gap-1">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-bold transition active:scale-95 ${
                  active
                    ? "bg-squishy-yellow text-ink shadow-sm"
                    : "text-ink/55 hover:bg-squishy-pink-soft"
                }`}
              >
                <Icon active={active} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function StoreIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9Z"
        fill={active ? "#F48FB1" : "#81D4FA"}
      />
      <path
        d="M3 7.5 5.2 4h13.6L21 7.5H3Z"
        fill={active ? "#FFEB3B" : "#F48FB1"}
      />
    </svg>
  );
}

function VideoIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="6"
        width="14"
        height="12"
        rx="3"
        fill={active ? "#81D4FA" : "#F48FB1"}
      />
      <path d="M17 10.2 21 8v8l-4-2.2V10.2Z" fill={active ? "#F48FB1" : "#81D4FA"} />
    </svg>
  );
}

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.4-7-9.2C5 8 6.8 6.4 9 6.4c1.3 0 2.4.6 3 1.6.6-1 1.7-1.6 3-1.6 2.2 0 4 1.6 4 4.4C19 15.6 12 20 12 20Z"
        fill={active ? "#F48FB1" : "#81D4FA"}
      />
    </svg>
  );
}
