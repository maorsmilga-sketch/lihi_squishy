import { EmptyState } from "@/components/EmptyState";
import { VideoCard } from "@/components/VideoCard";
import { getVideos } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const videos = await getVideos();
  const configured = isSupabaseConfigured();

  return (
    <section className="space-y-4">
      <p className="rounded-3xl bg-squishy-blue-soft px-4 py-3 text-center text-sm font-bold leading-6">
        סרטונים שמראים איך משתמשים בסקווישים ומה אפשר לעשות איתם
      </p>

      {!configured ? (
        <EmptyState
          emoji="🎬"
          title="עוד רגע מתחילים"
          text="חברו את סופאבייס כדי שהסרטונים יופיעו כאן."
        />
      ) : videos.length === 0 ? (
        <EmptyState
          emoji="🎥"
          title="עוד אין סרטונים"
          text="בקרוב יופיעו כאן סרטונים כיפיים על הסקווישים."
        />
      ) : (
        videos.map((video, index) => (
          <VideoCard key={video.id} video={video} index={index} />
        ))
      )}
    </section>
  );
}
