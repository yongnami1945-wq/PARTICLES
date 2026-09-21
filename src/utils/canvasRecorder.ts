// Canvas Animation Video Recorder using MediaRecorder API
// Supports High-Quality 60FPS / 30FPS WebM (VP9/VP8) and MP4 container formats

export interface VideoRecorderOptions {
  fps?: 30 | 60;
  duration?: number; // Target duration in seconds (0 = manual continuous)
  format?: 'webm' | 'mp4' | 'auto';
  bitrate?: number; // in bps, e.g. 16_000_000 (16 Mbps)
  includeAudio?: boolean;
}

export interface VideoRecordingResult {
  blob: Blob;
  url: string;
  filename: string;
  duration: number; // in seconds
  fileSizeBytes: number;
  mimeType: string;
  resolution: { width: number; height: number };
  fps: number;
}

export interface VideoRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  targetDuration: number;
  currentBytes: number;
  mimeType: string;
  error: string | null;
}

export class CanvasVideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private startTime: number = 0;
  private timerInterval: number | null = null;
  private stream: MediaStream | null = null;
  private currentOptions: Required<VideoRecorderOptions> = {
    fps: 60,
    duration: 10,
    format: 'auto',
    bitrate: 16_000_000,
    includeAudio: false,
  };

  private onProgressCb?: (state: VideoRecorderState) => void;
  private onCompleteCb?: (result: VideoRecordingResult) => void;
  private onErrorCb?: (error: Error) => void;

  public static getSupportedMimeTypes(): { mimeType: string; label: string; format: 'webm' | 'mp4' }[] {
    const candidateTypes: { mimeType: string; label: string; format: 'webm' | 'mp4' }[] = [
      { mimeType: 'video/webm;codecs=vp9,opus', label: 'WebM (VP9 / Opus - 최상의 화질)', format: 'webm' },
      { mimeType: 'video/webm;codecs=vp9', label: 'WebM (VP9 고화질)', format: 'webm' },
      { mimeType: 'video/webm;codecs=vp8,opus', label: 'WebM (VP8 / Opus 호환성)', format: 'webm' },
      { mimeType: 'video/webm;codecs=vp8', label: 'WebM (VP8 표준)', format: 'webm' },
      { mimeType: 'video/webm', label: 'WebM (기본)', format: 'webm' },
      { mimeType: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', label: 'MP4 (H.264 / AAC)', format: 'mp4' },
      { mimeType: 'video/mp4;codecs=avc1', label: 'MP4 (H.264)', format: 'mp4' },
      { mimeType: 'video/mp4', label: 'MP4 (기본)', format: 'mp4' },
    ];

    if (typeof MediaRecorder === 'undefined') {
      return [];
    }

    return candidateTypes.filter(t => {
      try {
        return MediaRecorder.isTypeSupported(t.mimeType);
      } catch {
        return false;
      }
    });
  }

  public static getOptimalMimeType(preferredFormat: 'webm' | 'mp4' | 'auto' = 'auto'): string {
    const supported = CanvasVideoRecorder.getSupportedMimeTypes();
    if (supported.length === 0) return 'video/webm';

    if (preferredFormat === 'mp4') {
      const mp4 = supported.find(t => t.format === 'mp4');
      if (mp4) return mp4.mimeType;
    } else if (preferredFormat === 'webm') {
      const webm = supported.find(t => t.format === 'webm');
      if (webm) return webm.mimeType;
    }

    // Default: Return the top quality supported codec (VP9 WebM or H.264 MP4)
    return supported[0].mimeType;
  }

  public isRecording(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === 'recording';
  }

  public async start(
    canvas: HTMLCanvasElement,
    options: VideoRecorderOptions = {},
    callbacks?: {
      onProgress?: (state: VideoRecorderState) => void;
      onComplete?: (result: VideoRecordingResult) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<boolean> {
    if (this.isRecording()) {
      console.warn('CanvasVideoRecorder: Already recording.');
      return false;
    }

    this.onProgressCb = callbacks?.onProgress;
    this.onCompleteCb = callbacks?.onComplete;
    this.onErrorCb = callbacks?.onError;

    this.currentOptions = {
      fps: options.fps ?? 60,
      duration: options.duration ?? 10,
      format: options.format ?? 'auto',
      bitrate: options.bitrate ?? 16_000_000,
      includeAudio: options.includeAudio ?? false,
    };

    try {
      this.recordedChunks = [];
      const selectedMimeType = CanvasVideoRecorder.getOptimalMimeType(this.currentOptions.format);

      // Capture video stream from Three.js canvas at desired FPS
      const fps = this.currentOptions.fps;
      this.stream = (canvas as any).captureStream ? (canvas as any).captureStream(fps) : null;

      if (!this.stream) {
        throw new Error('HTMLCanvasElement.captureStream() is not supported in this browser environment.');
      }

      const recorderOptions: MediaRecorderOptions = {
        mimeType: selectedMimeType,
        videoBitsPerSecond: this.currentOptions.bitrate,
      };

      this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions);

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
          this.updateProgress();
        }
      };

      this.mediaRecorder.onstop = () => {
        this.finishRecording(canvas.width, canvas.height, selectedMimeType);
      };

      this.mediaRecorder.onerror = (event: any) => {
        const err = new Error(event.error?.message || 'MediaRecorder recording error occurred.');
        if (this.onErrorCb) this.onErrorCb(err);
        this.cleanup();
      };

      // Collect data in small slices every 200ms for continuous buffering
      this.mediaRecorder.start(200);
      this.startTime = performance.now();

      // Start tick timer for elapsed duration tracking
      this.timerInterval = window.setInterval(() => {
        this.updateProgress();
        const elapsed = (performance.now() - this.startTime) / 1000;
        if (this.currentOptions.duration > 0 && elapsed >= this.currentOptions.duration) {
          this.stop();
        }
      }, 100);

      this.updateProgress();
      return true;
    } catch (err: any) {
      console.error('Failed to start MediaRecorder:', err);
      if (this.onErrorCb) this.onErrorCb(err instanceof Error ? err : new Error(String(err)));
      this.cleanup();
      return false;
    }
  }

  public stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (err) {
        console.error('Error stopping MediaRecorder:', err);
      }
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.updateProgress();
    }
  }

  public resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.updateProgress();
    }
  }

  public cancel(): void {
    this.cleanup();
    this.recordedChunks = [];
    if (this.onProgressCb) {
      this.onProgressCb({
        isRecording: false,
        isPaused: false,
        elapsedSeconds: 0,
        targetDuration: 0,
        currentBytes: 0,
        mimeType: '',
        error: null,
      });
    }
  }

  private updateProgress(): void {
    if (!this.onProgressCb || !this.isRecording()) return;

    const elapsed = (performance.now() - this.startTime) / 1000;
    const totalBytes = this.recordedChunks.reduce((acc, chunk) => acc + chunk.size, 0);

    this.onProgressCb({
      isRecording: this.isRecording(),
      isPaused: this.mediaRecorder?.state === 'paused',
      elapsedSeconds: Math.max(0, elapsed),
      targetDuration: this.currentOptions.duration,
      currentBytes: totalBytes,
      mimeType: this.mediaRecorder?.mimeType || '',
      error: null,
    });
  }

  private finishRecording(width: number, height: number, mimeType: string): void {
    const elapsed = Math.max(0.1, (performance.now() - this.startTime) / 1000);
    this.cleanup();

    if (this.recordedChunks.length === 0) {
      if (this.onErrorCb) {
        this.onErrorCb(new Error('No video data chunks captured during recording.'));
      }
      return;
    }

    const blob = new Blob(this.recordedChunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    // Determine extension
    const isMp4 = mimeType.includes('mp4');
    const ext = isMp4 ? 'mp4' : 'webm';
    
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const filename = `particle_morph_${width}x${height}_${this.currentOptions.fps}fps_${dateStr}_${timeStr}.${ext}`;

    const result: VideoRecordingResult = {
      blob,
      url,
      filename,
      duration: elapsed,
      fileSizeBytes: blob.size,
      mimeType,
      resolution: { width, height },
      fps: this.currentOptions.fps,
    };

    if (this.onCompleteCb) {
      this.onCompleteCb(result);
    }
  }

  private cleanup(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
  }

  public static downloadResult(result: VideoRecordingResult): void {
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
