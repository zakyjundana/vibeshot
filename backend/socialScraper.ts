// socialScraper.ts — Cloud Run Social Video Metadata Scraper Extension
// Handles Tool Calling for TikTok & Instagram video reference links

import { serve } from "bun";

const RAPIDAPI_KEY =
  process.env.RAPIDAPI_KEY || "805b02fe9emsh0cb11b0d266e29dp1e3537jsne40fa8fbd009";
const RAPIDAPI_HOST = "social-media-video-downloader.p.rapidapi.com";

export interface VideoMetadata {
  platform: "tiktok" | "instagram" | "unknown";
  url: string;
  id?: string;
  title: string;
  description: string;
  author?: {
    username?: string;
    nickname?: string;
    avatar?: string;
  };
  duration?: number;
  coverUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
}

/**
 * Scraping metadata from TikTok URL using RapidAPI SMVD
 */
export async function scrapeTiktok(url: string): Promise<VideoMetadata> {
  const cleanUrl = url.split("?")[0].trim();
  const endpoint = `https://${RAPIDAPI_HOST}/tiktok/v3/post/details?url=${encodeURIComponent(cleanUrl)}`;

  const res = await fetch(endpoint, {
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`RapidAPI TikTok SMVD Error: Status ${res.status}`);
  }

  const data = await res.json();
  const content = data.contents?.[0] || {};

  return {
    platform: "tiktok",
    url: cleanUrl,
    id: content.id || content.aweme_id,
    title: content.desc || content.description || content.title || "TikTok Video",
    description: content.desc || content.description || "",
    author: {
      username: content.author?.unique_id || content.author?.username,
      nickname: content.author?.nickname,
      avatar: content.author?.avatar_thumb?.url_list?.[0] || content.author?.avatar,
    },
    duration: content.duration ? content.duration / 1000 : undefined,
    coverUrl: content.video?.cover?.url_list?.[0] || content.cover,
    videoUrl: content.video?.play_addr?.url_list?.[0] || content.video_url,
    audioUrl:
      content.music?.play_url?.url_list?.[0] || content.music?.play_url || content.audio_url,
  };
}

/**
 * Scraping metadata from Instagram URL using RapidAPI SMVD
 */
export async function scrapeInstagram(url: string): Promise<VideoMetadata> {
  const cleanUrl = url.split("?")[0].trim();
  const endpoint = `https://${RAPIDAPI_HOST}/instagram/v1/post/details?url=${encodeURIComponent(cleanUrl)}`;

  const res = await fetch(endpoint, {
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`RapidAPI Instagram SMVD Error: Status ${res.status}`);
  }

  const data = await res.json();
  const content = data.contents?.[0] || data || {};

  return {
    platform: "instagram",
    url: cleanUrl,
    id: content.id || content.code,
    title: content.description || content.caption?.text || content.title || "Instagram Post",
    description: content.description || content.caption?.text || "",
    author: {
      username: content.author?.username || content.owner?.username,
      nickname: content.author?.full_name || content.owner?.full_name,
      avatar: content.author?.profile_pic_url || content.owner?.profile_pic_url,
    },
    coverUrl: content.thumbnail || content.display_url,
    videoUrl: content.video_url || content.videos?.[0]?.url,
    audioUrl: content.music_metadata?.music_info?.music?.play_url || content.audio_url,
  };
}

// Bun HTTP Server for Cloud Run deployment
if (import.meta.main) {
  const port = process.env.PORT || 8080;
  console.log(`Starting socialScraper Cloud Run extension on port ${port}...`);

  serve({
    port: Number(port),
    async fetch(req) {
      const url = new URL(req.url);

      // CORS Preflight
      if (req.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (url.pathname === "/scrape" && req.method === "POST") {
        try {
          const body = await req.json();
          const targetUrl = body.url;

          if (!targetUrl || typeof targetUrl !== "string") {
            return new Response(JSON.stringify({ error: "Missing parameter: url" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          let metadata: VideoMetadata;
          if (targetUrl.includes("tiktok.com")) {
            metadata = await scrapeTiktok(targetUrl);
          } else if (targetUrl.includes("instagram.com")) {
            metadata = await scrapeInstagram(targetUrl);
          } else {
            return new Response(
              JSON.stringify({ error: "Unsupported platform url. Must be TikTok or Instagram." }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          return new Response(JSON.stringify(metadata), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (e: any) {
          console.error("Scraping failure:", e);
          return new Response(JSON.stringify({ error: e.message || "Internal server error" }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      }

      // Healthcheck
      if (url.pathname === "/healthz" || url.pathname === "/") {
        return new Response(JSON.stringify({ status: "OK", service: "socialScraper" }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response("Not Found", { status: 404 });
    },
  });
}
