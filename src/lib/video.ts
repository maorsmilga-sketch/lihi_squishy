export type EmbeddableVideo =
  | { kind: "youtube"; src: string }
  | { kind: "direct"; src: string };

export function getEmbeddableVideo(url: string): EmbeddableVideo {
  const youtubeId = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  )?.[1];

  if (youtubeId) {
    return {
      kind: "youtube",
      src: `https://www.youtube.com/embed/${youtubeId}`,
    };
  }

  return { kind: "direct", src: url };
}
