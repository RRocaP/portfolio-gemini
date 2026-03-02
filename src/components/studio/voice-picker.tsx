"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { KokoroVoice } from "@/lib/types";
import { KOKORO_VOICES } from "@/lib/voices";

interface VoicePickerProps {
  value: string;
  onSelect: (voiceId: string) => void;
  className?: string;
}

type PreviewState = "idle" | "loading" | "playing" | "error";

function FemaleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-3", className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <line x1="12" y1="12" x2="12" y2="20" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

function MaleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-3", className)}
      aria-hidden="true"
    >
      <circle cx="10" cy="14" r="4" />
      <line x1="13.5" y1="10.5" x2="20" y2="4" />
      <polyline points="16 4 20 4 20 8" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-3", className)}
      aria-hidden="true"
    >
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-3", className)}
      aria-hidden="true"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={cn("size-3 animate-spin", className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

interface VoiceRowProps {
  voice: KokoroVoice;
  isSelected: boolean;
  onSelect: (voiceId: string) => void;
}

function VoiceRow({ voice, isSelected, onSelect }: VoiceRowProps) {
  const [previewState, setPreviewState] = React.useState<PreviewState>("idle");
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const stopPreview = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setPreviewState("idle");
  }, []);

  // Clean up audio when component unmounts
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const handlePreview = React.useCallback(async () => {
    if (previewState === "loading") return;

    if (previewState === "playing") {
      stopPreview();
      return;
    }

    setPreviewState("loading");

    try {
      const sampleText = `Hello, I'm ${voice.name}. Here's a preview of my voice.`;

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sampleText, voice: voice.id }),
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener("ended", () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        setPreviewState("idle");
      });

      audio.addEventListener("error", () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        setPreviewState("error");
        setTimeout(() => setPreviewState("idle"), 2000);
      });

      await audio.play();
      setPreviewState("playing");
    } catch {
      setPreviewState("error");
      setTimeout(() => setPreviewState("idle"), 2000);
    }
  }, [voice.id, voice.name, previewState, stopPreview]);

  return (
    <div className="flex items-center gap-1.5">
      {/* Voice selection pill */}
      <button
        type="button"
        onClick={() => onSelect(voice.id)}
        className={cn(
          "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        aria-pressed={isSelected}
        aria-label={`Select ${voice.name} voice`}
      >
        {voice.gender === "female" ? (
          <FemaleIcon
            className={isSelected ? "text-primary-foreground" : "text-muted-foreground"}
          />
        ) : (
          <MaleIcon
            className={isSelected ? "text-primary-foreground" : "text-muted-foreground"}
          />
        )}
        {voice.name}
      </button>

      {/* Preview button */}
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={handlePreview}
        disabled={previewState === "loading"}
        aria-label={
          previewState === "playing"
            ? `Stop preview of ${voice.name}`
            : `Preview ${voice.name} voice`
        }
        className={cn(
          "shrink-0",
          previewState === "error" && "text-destructive"
        )}
        title={
          previewState === "error"
            ? "Preview failed"
            : previewState === "playing"
            ? "Stop preview"
            : "Preview voice"
        }
      >
        {previewState === "loading" ? (
          <SpinnerIcon />
        ) : previewState === "playing" ? (
          <StopIcon />
        ) : (
          <PlayIcon />
        )}
      </Button>
    </div>
  );
}

interface VoiceSectionProps {
  title: string;
  accent: "american" | "british";
  voices: KokoroVoice[];
  selectedVoiceId: string;
  onSelect: (voiceId: string) => void;
}

function VoiceSection({
  title,
  accent,
  voices,
  selectedVoiceId,
  onSelect,
}: VoiceSectionProps) {
  const femaleVoices = voices.filter(
    (v) => v.accent === accent && v.gender === "female"
  );
  const maleVoices = voices.filter(
    (v) => v.accent === accent && v.gender === "male"
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-foreground">{title}</span>
        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
          {femaleVoices.length + maleVoices.length}
        </Badge>
      </div>

      {femaleVoices.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground pl-0.5">Female</p>
          <div className="flex flex-wrap gap-1.5">
            {femaleVoices.map((voice) => (
              <VoiceRow
                key={voice.id}
                voice={voice}
                isSelected={selectedVoiceId === voice.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}

      {maleVoices.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground pl-0.5">Male</p>
          <div className="flex flex-wrap gap-1.5">
            {maleVoices.map((voice) => (
              <VoiceRow
                key={voice.id}
                voice={voice}
                isSelected={selectedVoiceId === voice.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function VoicePicker({ value, onSelect, className }: VoicePickerProps) {
  const selectedVoice = KOKORO_VOICES.find((v) => v.id === value);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected voice summary */}
      {selectedVoice && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Selected:</span>
          <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 gap-1">
            {selectedVoice.gender === "female" ? (
              <FemaleIcon />
            ) : (
              <MaleIcon />
            )}
            {selectedVoice.name}
          </Badge>
          <span className="capitalize">{selectedVoice.accent}</span>
        </div>
      )}

      <ScrollArea className="h-[260px] rounded-md border bg-background p-3">
        <div className="space-y-4">
          <VoiceSection
            title="American English"
            accent="american"
            voices={KOKORO_VOICES}
            selectedVoiceId={value}
            onSelect={onSelect}
          />
          <div className="border-t" />
          <VoiceSection
            title="British English"
            accent="british"
            voices={KOKORO_VOICES}
            selectedVoiceId={value}
            onSelect={onSelect}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
