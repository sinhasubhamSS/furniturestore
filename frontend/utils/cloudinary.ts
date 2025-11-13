// utils/cloudinary.ts

/**
 * Safely inject Cloudinary transformation after /upload/
 * and replace any existing transform if already present.
 */
function injectTransform(url: string, transform: string): string {
  if (!url.includes("/upload/")) return url;

  const [prefix, rest] = url.split("/upload/");
  const before = prefix + "/upload/";

  // Split rest part like: ["v17236234", "folder/img.png"]
  const parts = rest.split("/");

  // Check if first section looks like transform: f_auto,q_auto,w_400...
  const first = parts[0];
  const isTransform =
    /^[a-z0-9_,\-]+$/i.test(first) &&
    (first.includes("_") || first.includes(","));

  // Remove existing transform if present
  if (isTransform) {
    parts.shift();
  }

  // Rebuild remaining path
  const newRest = parts.join("/");

  // Final URL
  return `${before}${transform}/${newRest}`;
}

/**
 * Public function for FULL IMAGE thumbnails (no cropping)
 * - Uses c_fit → entire image always visible
 * - Auto compress
 * - Auto format (AVIF/WebP/JPEG)
 * - Ideal for product cards
 */
export const getCloudinaryThumbnail = (url?: string | null): string | null => {
  if (!url) return null;

  try {
    const TRANSFORM = "f_auto,q_auto,w_400,h_300,c_fit";
    return injectTransform(url, TRANSFORM);
  } catch {
    return url;
  }
};
