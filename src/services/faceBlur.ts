/**
 * faceBlur.ts — Edge AI Face Blurring (GDPR Privacy-First)
 *
 * Uses MediaPipe Face Detection to find faces in a captured photo,
 * then applies a Gaussian blur directly on the browser Canvas.
 * NO face data ever leaves the device.
 */

import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

let detector: FaceDetector | null = null;
let initPromise: Promise<FaceDetector> | null = null;

/**
 * Initialize the MediaPipe Face Detector (lazy, singleton).
 * Downloads the model from CDN on first use (~1MB).
 */
async function getDetector(): Promise<FaceDetector> {
  if (detector) return detector;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    detector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      minDetectionConfidence: 0.5,
    });
    return detector;
  })();

  return initPromise;
}

/**
 * Takes a base64 image (or Blob URL), detects faces, blurs them,
 * and returns a new base64 JPEG string (without the data: prefix).
 *
 * @param imageSource - base64 data URL (data:image/jpeg;base64,...) or blob URL
 * @returns { blurredBase64, facesDetected } — blurred image + count of faces found
 */
export async function blurFaces(
  imageSource: string
): Promise<{ blurredBase64: string; facesDetected: number }> {
  const fd = await getDetector();

  // Load image into an HTMLImageElement
  const img = await loadImage(imageSource);

  // Create an offscreen canvas matching the image size
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;

  // Draw the original image
  ctx.drawImage(img, 0, 0);

  // Detect faces
  const result = fd.detect(img);
  const detections = result.detections;

  if (detections.length > 0) {
    // For each detected face, apply pixelated blur
    for (const detection of detections) {
      const bbox = detection.boundingBox;
      if (!bbox) continue;

      // Add 20% padding around the face for better coverage
      const padX = bbox.width * 0.2;
      const padY = bbox.height * 0.2;
      const x = Math.max(0, bbox.originX - padX);
      const y = Math.max(0, bbox.originY - padY);
      const w = Math.min(canvas.width - x, bbox.width + padX * 2);
      const h = Math.min(canvas.height - y, bbox.height + padY * 2);

      // Pixelate the face region (scale down, then scale back up)
      const pixelSize = 12;
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext("2d")!;

      // Draw face region at tiny size
      tempCtx.drawImage(canvas, x, y, w, h, 0, 0, w / pixelSize, h / pixelSize);

      // Disable image smoothing for sharp pixels
      tempCtx.imageSmoothingEnabled = false;

      // Scale it back up → pixelated
      tempCtx.drawImage(tempCanvas, 0, 0, w / pixelSize, h / pixelSize, 0, 0, w, h);

      // Draw the pixelated face back onto the main canvas
      ctx.drawImage(tempCanvas, 0, 0, w, h, x, y, w, h);
    }
  }

  // Export as base64 JPEG
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  const blurredBase64 = dataUrl.split(",")[1]; // Remove "data:image/jpeg;base64,"

  return {
    blurredBase64,
    facesDetected: detections.length,
  };
}

/**
 * Preload the face detection model in the background.
 * Call this early (e.g., when the app loads) so the model is ready
 * when the user takes a photo.
 */
export async function preloadFaceDetector(): Promise<void> {
  try {
    await getDetector();
    console.log("✅ Face detector preloaded");
  } catch (err) {
    console.warn("⚠️ Face detector preload failed (will retry on use):", err);
    // Reset so next call tries again
    detector = null;
    initPromise = null;
  }
}

// --- Helpers ---

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`));
    img.src = src;
  });
}
