/**
 * Central HubinBD image optimizer.
 * Converts JPEG, PNG (including transparent PNG), and WebP to compressed WebP.
 * Defaults: max edge 1600px, target 250KB, quality 0.82 down to 0.55.
 * SVG/GIF and other unsupported formats are rejected with a clear error.
 */
export type ImageOptimizationOptions = {
  maxDimension?: number;
  targetBytes?: number;
  initialQuality?: number;
  minQuality?: number;
};

export async function convertToWebP(
  file: File,
  options: ImageOptimizationOptions = {},
): Promise<File> {
  if (!(file instanceof File)) throw new TypeError("convertToWebP expects a File.");

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    throw new Error("JPG, PNG অথবা WebP ছবি আপলোড করুন।");
  }

  const maxDimension = options.maxDimension ?? 1600;
  const targetBytes = options.targetBytes ?? 250 * 1024;
  const initialQuality = options.initialQuality ?? 0.82;
  const minQuality = options.minQuality ?? 0.55;
  const safeBase = (file.name || "image")
    .normalize("NFKC").trim().toLowerCase().replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-")
    .replace(/^-|-$/g, "").replace(/\.(jpe?g|png|webp)$/i, "") || "image";

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("ছবিটি পড়া যায়নি। অন্য ছবি চেষ্টা করুন।"));
    });

    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;
    if (!sourceWidth || !sourceHeight) throw new Error("ছবির মাপ নির্ধারণ করা যায়নি।");

    const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image canvas তৈরি করা যায়নি।");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let best: Blob | null = null;
    for (let quality = initialQuality; quality >= minQuality - 0.001; quality -= 0.07) {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => result ? resolve(result) : reject(new Error("WebP তৈরি করা যায়নি।")),
          "image/webp",
          Math.max(minQuality, quality),
        );
      });
      best = blob;
      if (blob.size <= targetBytes) break;
    }

    if (!best) throw new Error("ছবি অপটিমাইজ করা যায়নি।");
    return new File([best], safeBase + ".webp", {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
