export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Resizes and compresses an image File using HTML Canvas.
 * Outputs a base64 JPEG data URL.
 * Target is ~180KB binary per image (~240KB base64), max 1280x1280.
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<string> {
  const { maxWidth = 1280, maxHeight = 1280, quality = 0.75 } = options;

  return new Promise((resolve, reject) => {
    // If running in a test or non-DOM environment without full Canvas or URL.createObjectURL support
    if (
      typeof document === "undefined" ||
      !document.createElement ||
      typeof URL === "undefined" ||
      typeof URL.createObjectURL !== "function"
    ) {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("Failed to read image file"));
          reader.readAsDataURL(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = objectUrl;
  });
}

/**
 * Calculates approximate total size in bytes of an array of base64 data URLs.
 */
export function calculateBase64PayloadBytes(dataUrls: string[]): number {
  return dataUrls.reduce((total, dataUrl) => {
    if (!dataUrl) return total;
    const base64Data = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    const padding = (base64Data.match(/=*$/) || [""])[0].length;
    return total + Math.max(0, (base64Data.length * 3) / 4 - padding);
  }, 0);
}
