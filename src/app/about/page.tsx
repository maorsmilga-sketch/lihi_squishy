import { EmptyState } from "@/components/EmptyState";
import { getSettings } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSettings();
  const configured = isSupabaseConfigured();
  const aboutText = settings?.about_text?.trim();

  return (
    <section>
      <article className="pop-in rounded-3xl bg-white p-5 shadow-md ring-2 ring-squishy-pink-soft">
        <div className="mb-4 flex justify-center gap-2 text-3xl" aria-hidden>
          <span>💛</span>
          <span>💗</span>
          <span>💙</span>
        </div>
        {!configured ? (
          <EmptyState
            emoji="📝"
            title="עוד רגע מתחילים"
            text="חברו את סופאבייס כדי להציג את הטקסט של עלינו."
          />
        ) : aboutText ? (
          <p className="whitespace-pre-wrap text-base font-medium leading-8 text-ink/90">
            {aboutText}
          </p>
        ) : (
          <EmptyState
            emoji="✨"
            title="עוד אין טקסט"
            text="ליהי וארי יוסיפו כאן בקרוב כמה מילים עלינו."
          />
        )}
      </article>
    </section>
  );
}
