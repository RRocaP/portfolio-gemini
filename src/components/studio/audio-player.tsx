"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

const PLAYBACK_RATES = [0.5, 1, 1.5, 2] as const;
type PlaybackRate = (typeof PLAYBACK_RATES)[number];

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ src, title, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1);

  // Sync event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    // If metadata already loaded (e.g. cached)
    if (audio.readyState >= 1) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  // Apply playback rate
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current;
      const audio = audioRef.current;
      if (!bar || !audio || !isFinite(duration) || duration === 0) return;

      const rect = bar.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = fraction * duration;
      setCurrentTime(fraction * duration);
    },
    [duration]
  );

  const handleProgressDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.buttons !== 1) return;
      handleProgressClick(e);
    },
    [handleProgressClick]
  );

  const handleSpeedCycle = useCallback(() => {
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    setPlaybackRate(PLAYBACK_RATES[nextIndex]);
  }, [playbackRate]);

  const handleDownload = useCallback(() => {
    const a = document.createElement("a");
    a.href = src;
    const filename = title
      ? `${title.replace(/[^a-z0-9_\-\s]/gi, "").trim().replace(/\s+/g, "-")}.mp3`
      : "audio.mp3";
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [src, title]);

  const progressPercent =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-muted/30 px-3 py-2.5 space-y-2",
        className
      )}
    >
      {/* Hidden native audio element */}
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Title */}
      {title && (
        <p className="text-xs font-medium text-foreground truncate leading-none">
          {title}
        </p>
      )}

      {/* Controls row */}
      <div className="flex items-center gap-2">
        {/* Play / Pause */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={togglePlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="shrink-0 text-foreground hover:bg-accent rounded-lg"
        >
          {isPlaying ? (
            /* Pause icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            /* Play icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4"
            >
              <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" />
            </svg>
          )}
        </Button>

        {/* Progress bar + time */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {/* Progress track */}
          <div
            ref={progressRef}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={duration || 100}
            aria-valuenow={currentTime}
            tabIndex={0}
            className="relative h-1.5 w-full cursor-pointer rounded-full bg-border group"
            onClick={handleProgressClick}
            onMouseMove={handleProgressDrag}
            onKeyDown={(e) => {
              const audio = audioRef.current;
              if (!audio) return;
              if (e.key === "ArrowRight") audio.currentTime = Math.min(duration, currentTime + 5);
              if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, currentTime - 5);
            }}
          >
            {/* Filled portion */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-none"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full bg-primary shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPercent}% - 6px)` }}
            />
          </div>

          {/* Time display */}
          <div className="flex justify-between items-center">
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {formatTime(currentTime)}
            </span>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Speed control */}
        <Button
          variant="ghost"
          size="xs"
          onClick={handleSpeedCycle}
          aria-label={`Playback speed: ${playbackRate}x`}
          className="shrink-0 font-mono text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-1.5 h-6 min-w-[2rem]"
        >
          {playbackRate}x
        </Button>

        {/* Download */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDownload}
          aria-label="Download audio"
          className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
