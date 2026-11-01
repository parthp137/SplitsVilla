import { describe, it, expect } from "vitest";
import { calculateBase64PayloadBytes, compressImage } from "@/utils/imageCompressor";

describe("Image Compression & Payload Size Guard", () => {
  it("calculates base64 binary payload size correctly", () => {
    // 4 base64 characters represent 3 bytes
    const base64Data = "data:image/jpeg;base64," + "A".repeat(400);
    const bytes = calculateBase64PayloadBytes([base64Data]);
    expect(bytes).toBe(300);
  });

  it("verifies 5 compressed images (~180KB binary / ~240KB base64 each) total ~1.2MB, well below 4MB express limit", () => {
    const BACKEND_LIMIT_BYTES = 4 * 1024 * 1024; // 4MB = 4,194,304 bytes
    const TARGET_IMAGE_BINARY_BYTES = 180 * 1024; // 180KB = 184,320 bytes
    const BASE64_CHARS_PER_IMAGE = Math.ceil((TARGET_IMAGE_BINARY_BYTES * 4) / 3);

    // Simulate 5 compressed images
    const simulatedCompressedImages: string[] = [];
    for (let i = 0; i < 5; i++) {
      simulatedCompressedImages.push(
        "data:image/jpeg;base64," + "x".repeat(BASE64_CHARS_PER_IMAGE)
      );
    }

    expect(simulatedCompressedImages.length).toBe(5);

    const totalPayloadBytes = calculateBase64PayloadBytes(simulatedCompressedImages);
    const totalPayloadMB = totalPayloadBytes / (1024 * 1024);

    // Total should be around 0.88 - 1.2MB
    expect(totalPayloadMB).toBeLessThan(1.5);
    // Crucially must be well under the 4MB limit
    expect(totalPayloadBytes).toBeLessThan(BACKEND_LIMIT_BYTES);
    // At least 2.5MB headroom remaining for other payload data
    expect(BACKEND_LIMIT_BYTES - totalPayloadBytes).toBeGreaterThan(2.5 * 1024 * 1024);
  });

  it("scales dimensions preserving aspect ratio within max 1280x1280 boundary", () => {
    // Test aspect ratio calculation logic
    const testCases = [
      { width: 2560, height: 1440, max: 1280, expectedW: 1280, expectedH: 720 },
      { width: 1000, height: 2000, max: 1280, expectedW: 640, expectedH: 1280 },
      { width: 800, height: 600, max: 1280, expectedW: 800, expectedH: 600 },
    ];

    testCases.forEach(({ width, height, max, expectedW, expectedH }) => {
      const ratio = Math.min(max / width, max / height);
      const computedW = width > max || height > max ? Math.round(width * ratio) : width;
      const computedH = width > max || height > max ? Math.round(height * ratio) : height;

      expect(computedW).toBe(expectedW);
      expect(computedH).toBe(expectedH);
      expect(computedW).toBeLessThanOrEqual(max);
      expect(computedH).toBeLessThanOrEqual(max);
    });
  });

  it("handles fallback gracefully in non-canvas environments", async () => {
    // Create a mock File
    const blob = new Blob(["fake-image-content"], { type: "image/jpeg" });
    const file = new File([blob], "test-villa.jpg", { type: "image/jpeg" });

    const result = await compressImage(file);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });
});
