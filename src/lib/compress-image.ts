// Client-side compression before upload, per PLAN.md's cost-model mitigation
// for Vercel Blob's 1GB free tier: resize to ~1600px longest edge, re-encode
// as JPEG at ~78% quality. Browser Canvas API only — no added dependency.
// Falls back to the original file if decoding fails for any reason (never
// block an upload on this).

// iPhones default to HEIC, which neither the browser's own canvas decode
// (createImageBitmap below) nor most browsers' <img> rendering understand —
// uploads silently "succeeded" but rendered as a broken image everywhere
// except Safari. libheif-js runs a real libheif build, compiled to WASM,
// entirely client-side (no server/API involved, so this stays free) to
// convert to a normal JPEG before anything else touches the file.
//
// Specifically NOT heic2any (tried first, replaced after troubleshooting a
// real report of still-broken uploads): it bundles an old libheif that
// can't parse the HDR gain-map ("tmap") box iOS 17+ adds to photos by
// default, so it throws on most current iPhone photos and silently fell
// back to uploading the original, still-unrenderable .heic file. libheif-js
// tracks current upstream libheif, which added explicit tmap support.
async function convertHeicToJpeg(file: File): Promise<File> {
  const isHeic = /^image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
  if (!isHeic) return file;
  try {
    const mod = await import("libheif-js/wasm-bundle");
    // The wasm-bundle module's export is an Emscripten module factory
    // result, which itself resolves async — normalize both shapes rather
    // than assume one.
    const maybePromise = mod.default;
    const libheif: LibheifModule =
      "then" in maybePromise ? await (maybePromise as Promise<LibheifModule>) : maybePromise;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const decoder = new libheif.HeifDecoder();
    const images = decoder.decode(bytes);
    if (!images || !images.length) throw new Error("No image found in HEIC file");
    const image = images[0];
    const width = image.get_width();
    const height = image.get_height();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    const imageData = ctx.createImageData(width, height);

    await new Promise<void>((resolve, reject) => {
      image.display(imageData, (displayData: unknown) => {
        if (!displayData) return reject(new Error("HEIF processing error"));
        resolve();
      });
    });
    ctx.putImageData(imageData, 0, 0);

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) throw new Error("Canvas failed to produce a JPEG blob");

    const newName = file.name.replace(/\.\w+$/i, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch (err) {
    console.error("HEIC conversion failed, uploading the original file unconverted", err);
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
