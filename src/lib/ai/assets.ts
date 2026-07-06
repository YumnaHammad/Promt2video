import { db } from "../db";
import { isDemoMode } from "../demo-mode";
import type { AssetSource, AssetType } from "@/generated/prisma/client";

export interface FetchedAsset {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  source: AssetSource;
  type: AssetType;
  name: string;
}

export async function fetchAssetsForScene(
  visualPrompt: string,
  type: "image" | "video" = "image",
  count = 3
): Promise<FetchedAsset[]> {
  if (isDemoMode()) {
    return getPlaceholderAssets(visualPrompt, count);
  }

  const results: FetchedAsset[] = [];

  const pexelsResults = await fetchFromPexels(visualPrompt, type, count);
  results.push(...pexelsResults);

  if (results.length < count) {
    const pixabayResults = await fetchFromPixabay(
      visualPrompt,
      type,
      count - results.length
    );
    results.push(...pixabayResults);
  }

  if (results.length < count && type === "image") {
    const unsplashResults = await fetchFromUnsplash(
      visualPrompt,
      count - results.length
    );
    results.push(...unsplashResults);
  }

  if (results.length < count && isDemoMode()) {
    results.push(...getPlaceholderAssets(visualPrompt, count - results.length));
  }

  return results.slice(0, count);
}

function getPlaceholderAssets(query: string, count: number): FetchedAsset[] {
  const seeds = ["tech", "nature", "city", "abstract", "business", "creative"];
  return Array.from({ length: count }, (_, i) => {
    const seed = seeds[i % seeds.length] + encodeURIComponent(query.slice(0, 20));
    return {
      url: `https://picsum.photos/seed/${seed}/1920/1080`,
      thumbnailUrl: `https://picsum.photos/seed/${seed}/400/225`,
      width: 1920,
      height: 1080,
      source: "STOCK" as AssetSource,
      type: "IMAGE" as AssetType,
      name: `placeholder-${seed}`,
    };
  });
}

async function fetchFromPexels(
  query: string,
  type: "image" | "video",
  count: number
): Promise<FetchedAsset[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  const endpoint =
    type === "video"
      ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${count}`
      : `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}`;

  const res = await fetch(endpoint, {
    headers: { Authorization: apiKey },
  });
  if (!res.ok) return [];

  const data = await res.json();

  if (type === "video") {
    return (data.videos ?? []).map(
      (v: {
        video_files: { link: string; width: number; height: number }[];
        image: string;
        id: number;
      }) => {
        const file = v.video_files.find((f) => f.width >= 1280) ?? v.video_files[0];
        return {
          url: file.link,
          thumbnailUrl: v.image,
          width: file.width,
          height: file.height,
          source: "PEXELS" as AssetSource,
          type: "VIDEO" as AssetType,
          name: `pexels-video-${v.id}`,
        };
      }
    );
  }

  return (data.photos ?? []).map(
    (p: {
      src: { large2x: string; medium: string };
      width: number;
      height: number;
      id: number;
      alt: string;
    }) => ({
      url: p.src.large2x,
      thumbnailUrl: p.src.medium,
      width: p.width,
      height: p.height,
      source: "PEXELS" as AssetSource,
      type: "IMAGE" as AssetType,
      name: p.alt || `pexels-${p.id}`,
    })
  );
}

async function fetchFromPixabay(
  query: string,
  type: "image" | "video",
  count: number
): Promise<FetchedAsset[]> {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) return [];

  const endpoint =
    type === "video"
      ? `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${count}`
      : `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${count}&image_type=photo`;

  const res = await fetch(endpoint);
  if (!res.ok) return [];

  const data = await res.json();

  if (type === "video") {
    return (data.hits ?? []).map(
      (v: {
        videos: { large: { url: string; width: number; height: number } };
        picture_id: string;
        tags: string;
      }) => ({
        url: v.videos.large.url,
        thumbnailUrl: `https://i.vimeocdn.com/video/${v.picture_id}_295x166.jpg`,
        width: v.videos.large.width,
        height: v.videos.large.height,
        source: "PIXABAY" as AssetSource,
        type: "VIDEO" as AssetType,
        name: v.tags.split(",")[0]?.trim() ?? "pixabay-video",
      })
    );
  }

  return (data.hits ?? []).map(
    (p: {
      largeImageURL: string;
      previewURL: string;
      imageWidth: number;
      imageHeight: number;
      tags: string;
    }) => ({
      url: p.largeImageURL,
      thumbnailUrl: p.previewURL,
      width: p.imageWidth,
      height: p.imageHeight,
      source: "PIXABAY" as AssetSource,
      type: "IMAGE" as AssetType,
      name: p.tags.split(",")[0]?.trim() ?? "pixabay-image",
    })
  );
}

async function fetchFromUnsplash(
  query: string,
  count: number
): Promise<FetchedAsset[]> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!apiKey) return [];

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}`,
    { headers: { Authorization: `Client-ID ${apiKey}` } }
  );
  if (!res.ok) return [];

  const data = await res.json();
  return (data.results ?? []).map(
    (p: {
      urls: { regular: string; small: string };
      width: number;
      height: number;
      alt_description: string;
    }) => ({
      url: p.urls.regular,
      thumbnailUrl: p.urls.small,
      width: p.width,
      height: p.height,
      source: "UNSPLASH" as AssetSource,
      type: "IMAGE" as AssetType,
      name: p.alt_description ?? "unsplash-image",
    })
  );
}

export async function saveAssetToDb(
  asset: FetchedAsset,
  userId?: string
): Promise<string> {
  const record = await db.asset.create({
    data: {
      name: asset.name,
      type: asset.type,
      source: asset.source,
      url: asset.url,
      thumbnailUrl: asset.thumbnailUrl,
      width: asset.width,
      height: asset.height,
      userId,
    },
  });
  return record.id;
}
