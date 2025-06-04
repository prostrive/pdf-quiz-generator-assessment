import { UploadProgress, UploadState } from "@/types";
import { useState, useCallback, useRef } from "react";

const initialProgress: UploadProgress = {
  phase: "idle",
  progress: 0,
  message: "Ready to upload"
};

const initialState: UploadState = {
  file: null,
  progress: initialProgress,
  error: null,
  startTime: null,
  bytesUploaded: 0
};

export function useUploadProgress() {
  const [uploadState, setUploadState] = useState<UploadState>(initialState);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const updateProgress = useCallback((updates: Partial<UploadProgress>) => {
    setUploadState(prev => ({
      ...prev,
      progress: { ...prev.progress, ...updates }
    }));
  }, []);

  const calculateUploadMetrics = useCallback((bytesUploaded: number, totalBytes: number) => {
    if (!startTimeRef.current) return {};

    const elapsed = (Date.now() - startTimeRef.current) / 1000; // seconds
    const uploadSpeed = elapsed > 0 ? bytesUploaded / elapsed : 0;
    const remainingBytes = totalBytes - bytesUploaded;
    const timeRemaining = uploadSpeed > 0 ? remainingBytes / uploadSpeed : undefined;

    return { uploadSpeed, timeRemaining };
  }, []);

  const startUpload = useCallback((file: File) => {
    startTimeRef.current = Date.now();
    setUploadState({
      file,
      progress: {
        phase: "uploading",
        progress: 0,
        message: "Starting upload..."
      },
      error: null,
      startTime: startTimeRef.current,
      bytesUploaded: 0
    });
  }, []);

  const simulateUpload = useCallback(
    (file: File, onComplete: () => void) => {
      startUpload(file);

      let progress = 0;
      const totalSize = file.size;

      progressIntervalRef.current = setInterval(() => {
        progress += Math.random() * 5 + 1; // Random progress between 1-6%

        if (progress >= 100) {
          progress = 100;
          clearInterval(progressIntervalRef.current!);
          progressIntervalRef.current = null;

          setUploadState(prev => ({
            ...prev,
            progress: {
              phase: "complete",
              progress: 100,
              message: "Upload complete"
            },
            bytesUploaded: totalSize
          }));

          onComplete();
        } else {
          const bytesUploaded = (progress / 100) * totalSize;
          const metrics = calculateUploadMetrics(bytesUploaded, totalSize);

          setUploadState(prev => ({
            ...prev,
            progress: {
              phase: "uploading",
              progress: Math.floor(progress),
              message: `Uploading... ${Math.floor(progress)}%`,
              ...metrics
            },
            bytesUploaded
          }));
        }
      }, 100 + Math.random() * 200); // Random interval between 100-300ms
    },
    [startUpload, calculateUploadMetrics]
  );

  const simulateProcessing = useCallback(
    (phases: Array<{ name: string; duration: number }>) => {
      updateProgress({
        phase: "processing",
        progress: 0,
        message: "Starting processing..."
      });

      let currentPhaseIndex = 0;
      let phaseProgress = 0;
      const totalPhases = phases.length;

      progressIntervalRef.current = setInterval(() => {
        const currentPhase = phases[currentPhaseIndex];
        phaseProgress += 100 / currentPhase.duration;

        if (phaseProgress >= 100) {
          currentPhaseIndex++;
          phaseProgress = 0;

          if (currentPhaseIndex >= totalPhases) {
            clearInterval(progressIntervalRef.current!);
            progressIntervalRef.current = null;

            updateProgress({
              phase: "complete",
              progress: 100,
              message: "Processing complete"
            });

            return;
          }
        }

        const overallProgress = (currentPhaseIndex * 100 + phaseProgress) / totalPhases;
        const currentPhaseName = phases[currentPhaseIndex]?.name || "Processing";

        updateProgress({
          phase: "processing",
          progress: Math.floor(overallProgress),
          message: `${currentPhaseName}... ${Math.floor(phaseProgress)}%`
        });
      }, 50);
    },
    [updateProgress]
  );

  const setError = useCallback((error: string) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setUploadState(prev => ({
      ...prev,
      progress: {
        phase: "error",
        progress: prev.progress.progress,
        message: "Upload failed"
      },
      error
    }));
  }, []);

  const reset = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    startTimeRef.current = null;
    setUploadState(initialState);
  }, []);

  const formatTimeRemaining = useCallback((seconds?: number) => {
    if (!seconds || seconds === Infinity) return undefined;

    if (seconds < 60) return `${Math.ceil(seconds)}s remaining`;

    if (seconds < 3600) {
      const minutes = Math.ceil(seconds / 60);

      return `${minutes}m remaining`;
    }

    const hours = Math.ceil(seconds / 3600);

    return `${hours}h remaining`;
  }, []);

  const formatUploadSpeed = useCallback((bytesPerSecond?: number) => {
    if (!bytesPerSecond) return undefined;

    if (bytesPerSecond < 1024) return `${Math.floor(bytesPerSecond)} B/s`;

    if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;

    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  }, []);

  return {
    uploadState,
    startUpload,
    simulateUpload,
    simulateProcessing,
    setError,
    reset,
    updateProgress,
    formatTimeRemaining,
    formatUploadSpeed
  };
}
