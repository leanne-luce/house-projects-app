// Client-side compression before upload, per PLAN.md's cost-model mitigation
// for Vercel Blob's 1GB free tier: resize to ~1600px longest edge, re-encode
// as JPEG at ~78% quality. Browser Canvas API only — no added dependency.
// Falls back to the original file if decoding fails for any reason (never
// block an upload on this).

// iPhones default to HEIC, which neither the browser's own canvas decode
// (createImageBitmap below) nor most browsers' <img> rendering understand —
// uploads silently "succeeded" but rendered as a broken image everywhere
// except Safari. heic2any runs a WASM HEIF decoder entirely client-side (no
// server/API involved, so this stays free) to convert to a normal JPEG
// before anything else touches the file.
async function convertHeicToJpeg(file: File): Promise<File> {
  const isHeic = /^image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
  if (!isHeic) return file;
  try {
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    const newName = file.name.replace(/\.\w+$/i, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file; // no worse than today's (broken) behavior
  }
}

export async function compressImage(file: File, maxDim = 1600, quality = 0.78): Promise<File> {
  file = await convertHeicToJpeg(file);
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  let { width, height } = bitmap;
  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) return file;

  const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}
