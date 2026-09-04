import { getEmbeddableVideo } from "@/lib/video";
import type { Video } from "@/lib/types";

export function VideoCard({ video, index }: { video: Video; index: number }) {
  const embed = getEmbeddableVideo(video.video_url);

  return (
    <article
      className="pop-in overflow-hidden rounded-3xl bg-white shadow-md ring-2 ring-squishy-blue-soft"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="aspect-video bg-squishy-blue-soft">
        {embed.kind === "youtube" ? (
          <iframe
            src={embed.src}
            title={video.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={embed.src}
            controls
            playsInline
            className="h-full w-full object-cover"
            title={video.title}
          />
        )}
      </div>
      <div className="bg-gradient-to-l from-squishy-pink-soft to-squishy-yellow-soft px-4 py-3">
        <h2 className="text-base font-extrabold leading-6">{video.title}</h2>
      </div>
    </article>
  );
}
