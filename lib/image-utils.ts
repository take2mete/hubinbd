/**
 * Shared browser-side image optimizer for every HubinBD upload flow.
 *
 * Transparent PNGs stay PNG (logos need their alpha channel).
 * JPEG and opaque PNG files are encoded as WebP at quality 0.85.
 * Already-WebP and unsupported formats are returned unchanged.
 */
export async function convertToWebP(file: File): Promise<File> {
  if (!(file instanceof File)) {
    throw new TypeError("convertToWebP expects a File.");
  }

  const originalName = file.name || "image";
  const normalizedName = originalName
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "image";

  if (file.type === "image/webp") {
    const webpName = normalizedName.replace(/\\.(jpe?g|png|webp)$/i, ".webp");
    return new File([file], webpName.endsWith(".webp") ? webpName : `${webpName}.webp`, {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  }

  if (file.type !== "image/jpeg" && file.type !== "image/png") {
    return new File([file], normalizedName, {
      type: file.type || "application/octet-stream",
      lastModified: file.lastModified,
    });
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("ছবিটি পড়া যায়নি। অন্য ছবি চেষ্টা করুন।"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Image canvas তৈরি করা যায়নি।");
    context.drawImage(image, 0, 0);

    // PNG alpha is checked pixel-by-pixel; opaque PNGs can safely become WebP.
    if (file.type === "image/png") {
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      let hasTransparency = false;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) {
          hasTransparency = true;
          break;
        }
      }
      if (hasTransparency) {
        return new File([file], normalizedName.replace(/\\.(jpe?g|png)$/i, ".png"), {
          type: "image/png",
          lastModified: file.lastModified,
        });
      }
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error("WebP তৈরি করা যায়নি।")),
        "image/webp",
        0.85,
      );
    });

    const webpName = normalizedName.replace(/\\.(jpe?g|png|webp)$/i, ".webp");
    return new File([blob], webpName.endsWith(".webp") ? webpName : `${webpName}.webp`, {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
