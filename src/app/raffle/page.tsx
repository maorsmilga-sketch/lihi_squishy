import { EmptyState } from "@/components/EmptyState";
import { RaffleBoard } from "@/components/RaffleBoard";
import { getRaffleState } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function RafflePage() {
  const configured = isSupabaseConfigured();
  const state = configured
    ? await getRaffleState()
    : {
        raffle: null,
        entries: [],
        entryCount: 0,
        isOpen: false,
        isEnded: false,
      };

  return (
    <section className="space-y-4">
      <p className="rounded-3xl bg-gradient-to-l from-squishy-yellow-soft via-white to-squishy-pink-soft px-4 py-3 text-center text-sm font-bold leading-6">
        נרשמים לפי שם, בסוף הזמן האתר מגריל זוכה לבד
      </p>

      {!configured ? (
        <EmptyState
          emoji="🎁"
          title="עוד רגע מתחילים"
          text="חברו את סופאבייס כדי שההגרלה תופיע כאן."
        />
      ) : !state.raffle ? (
        <EmptyState
          emoji="🎁"
          title="אין הגרלה פתוחה"
          text="כשליהי וארי יעלו סקווישי להגרלה, אפשר יהיה להשתתף כאן."
        />
      ) : (
        <RaffleBoard initial={state} />
      )}
    </section>
  );
}
