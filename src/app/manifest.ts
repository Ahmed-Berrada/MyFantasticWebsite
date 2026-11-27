import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ahmed Berrada",
    short_name: "A. Berrada",
    description: "Software engineer: critical systems and performance.",
    start_url: "/",
    display: "browser",
    background_color: "#eceef0",
    theme_color: "#eceef0",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
