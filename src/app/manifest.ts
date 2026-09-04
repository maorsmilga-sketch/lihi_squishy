import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "עולם הסקווישים של ליהי וארי",
    short_name: "סקווישים",
    description: "חנות סקווישים כיפית של ליהי וארי",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFEB3B",
    dir: "rtl",
    lang: "he",
    icons: [
      {
        src: "/app-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
