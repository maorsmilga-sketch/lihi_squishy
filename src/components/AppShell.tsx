"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { CartButton } from "@/components/cart/CartButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { Header } from "@/components/Header";
import { ShareButton } from "@/components/ShareButton";
import { VisitTracker } from "@/components/VisitTracker";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin";

  return (
    <CartProvider>
      <div className="min-h-dvh bg-gradient-to-b from-squishy-blue via-squishy-blue-soft to-squishy-pink-soft">
        <div className="relative mx-auto flex h-dvh max-h-dvh w-full max-w-md flex-col overflow-hidden bg-squishy-white shadow-[0_0_40px_rgba(244,143,177,0.35)] sm:my-5 sm:h-[calc(100dvh-2.5rem)] sm:max-h-[calc(100dvh-2.5rem)] sm:min-h-[calc(100dvh-2.5rem)] sm:rounded-[2.4rem] sm:border-8 sm:border-white">
          <div className="blob -left-10 -top-8 h-32 w-32 bg-squishy-yellow/70" />
          <div className="blob -right-8 top-16 h-24 w-24 bg-squishy-pink/50" />
          <div className="blob bottom-24 -left-6 h-20 w-20 bg-squishy-blue/60" />
          <Header />
          <main className="app-scroll relative z-10 flex-1 overflow-y-auto px-4 pb-28 pt-3">
            {children}
          </main>
          {isAdmin ? null : (
            <>
              <VisitTracker />
              <CartButton />
              <ShareButton />
            </>
          )}
          <BottomNav />
          <CartDrawer />
        </div>
      </div>
    </CartProvider>
  );
}
