declare module "@mediapipe/tasks-vision" {
  export class FilesetResolver {
    static forVisionTasks(wasmPath: string): Promise<any>;
  }

  export interface FaceDetectorOptions {
    baseOptions: {
      modelAssetPath: string;
      delegate?: "GPU" | "CPU";
    };
    runningMode: "IMAGE" | "VIDEO";
    minDetectionConfidence?: number;
  }

  export interface BoundingBox {
    originX: number;
    originY: number;
    width: number;
    height: number;
  }

  export interface Detection {
    boundingBox?: BoundingBox;
    categories: Array<{ score: number; categoryName: string }>;
  }

  export interface FaceDetectorResult {
    detections: Detection[];
  }

  export class FaceDetector {
    static createFromOptions(
      vision: any,
      options: FaceDetectorOptions
    ): Promise<FaceDetector>;
    detect(image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): FaceDetectorResult;
  }
}
