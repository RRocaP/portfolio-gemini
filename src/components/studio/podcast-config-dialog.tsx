"use client";

import { useState } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { PodcastConfig, PodcastTone, PodcastSpeaker, KokoroVoice } from "@/lib/types";

// ---------------------------------------------------------------------------
// Static voice list (hardcoded — cannot fetch at build time)
// ---------------------------------------------------------------------------
const defaultVoices: KokoroVoice[] = [
  { id: "af_heart",   name: "Heart",   gender: "female", accent: "american" },
  { id: "af_sarah",   name: "Sarah",   gender: "female", accent: "american" },
  { id: "af_nova",    name: "Nova",    gender: "female", accent: "american" },
  { id: "af_bella",   name: "Bella",   gender: "female", accent: "american" },
  { id: "am_adam",    name: "Adam",    gender: "male",   accent: "american" },
  { id: "am_michael", name: "Michael", gender: "male",   accent: "american" },
  { id: "am_eric",    name: "Eric",    gender: "male",   accent: "american" },
  { id: "bf_emma",    name: "Emma",    gender: "female", accent: "british"  },
  { id: "bf_lily",    name: "Lily",    gender: "female", accent: "british"  },
  { id: "bm_george",  name: "George",  gender: "male",   accent: "british"  },
  { id: "bm_daniel",  name: "Daniel",  gender: "male",   accent: "british"  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

const toneOptions: { value: PodcastTone; label: string }[] = [
  { value: "casual",      label: "Casual"      },
  { value: "academic",    label: "Academic"    },
  { value: "storytelling",label: "Storytelling"},
  { value: "debate",      label: "Debate"      },
];

const defaultSpeakers: PodcastSpeaker[] = [
  {
    id: makeId(),
    name: "Alex",
    personality: "Curious host who asks great questions",
    voiceId: "af_nova",
  },
  {
    id: makeId(),
    name: "Jordan",
    personality: "Expert co-host with a calm analytical style",
    voiceId: "am_michael",
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface PodcastConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (config: PodcastConfig) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PodcastConfigDialog({
  open,
  onOpenChange,
  onGenerate,
}: PodcastConfigDialogProps) {
  const [length, setLength] = useState(10);
  const [tone, setTone] = useState<PodcastTone>("casual");
  const [speakers, setSpeakers] = useState<PodcastSpeaker[]>(defaultSpeakers);
  const [focusArea, setFocusArea] = useState("");

  // -- Speaker helpers -------------------------------------------------------
  function addSpeaker() {
    if (speakers.length >= 4) return;
    setSpeakers((prev) => [
      ...prev,
      {
        id: makeId(),
        name: "",
        personality: "",
        voiceId: defaultVoices[0].id,
      },
    ]);
  }

  function removeSpeaker(id: string) {
    if (speakers.length <= 1) return;
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSpeaker(id: string, field: keyof PodcastSpeaker, value: string) {
    setSpeakers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  // -- Submit ----------------------------------------------------------------
  function handleGenerate() {
    const config: PodcastConfig = {
      length,
      language: "en-us",
      tone,
      speakers,
      focusArea: focusArea.trim() || undefined,
      sourceIds: [], // caller fills this from selected sources
    };
    onGenerate(config);
  }

  // --------------------------------------------------------------------------
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-sm font-semibold">
            Configure Podcast
          </DialogTitle>
        </DialogHeader>

        <Separator />

        {/* Scrollable body */}
        <div className="overflow-y-auto max-h-[70vh] px-5 py-4 space-y-5">

          {/* ---- Length -------------------------------------------------- */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Length</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {length} min
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={60}
              step={1}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-1.5 accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1 min</span>
              <span>60 min</span>
            </div>
          </section>

          <Separator />

          {/* ---- Tone ---------------------------------------------------- */}
          <section className="space-y-2">
            <span className="text-xs font-medium">Tone</span>
            <div className="flex flex-wrap gap-1.5">
              {toneOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTone(opt.value)}
                  className={[
                    "rounded-full border px-3 py-0.5 text-xs font-medium transition-colors",
                    tone === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <Separator />

          {/* ---- Speakers ------------------------------------------------ */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Speakers</span>
              <span className="text-[10px] text-muted-foreground">
                {speakers.length}/4
              </span>
            </div>

            <div className="space-y-3">
              {speakers.map((speaker, idx) => (
                <div
                  key={speaker.id}
                  className="rounded-md border bg-muted/30 p-3 space-y-2"
                >
                  {/* Speaker header row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                      Speaker {idx + 1}
                    </span>
                    {speakers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpeaker(speaker.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove speaker"
                      >
                        <Trash2Icon className="size-3" />
                      </button>
                    )}
                  </div>

                  {/* Name */}
                  <Input
                    placeholder="Name"
                    value={speaker.name}
                    onChange={(e) =>
                      updateSpeaker(speaker.id, "name", e.target.value)
                    }
                    className="h-7 text-xs px-2"
                  />

                  {/* Personality */}
                  <Input
                    placeholder="Personality (e.g. curious host, analytical expert)"
                    value={speaker.personality}
                    onChange={(e) =>
                      updateSpeaker(speaker.id, "personality", e.target.value)
                    }
                    className="h-7 text-xs px-2"
                  />

                  {/* Voice selector */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground">Voice</span>
                    <select
                      value={speaker.voiceId}
                      onChange={(e) =>
                        updateSpeaker(speaker.id, "voiceId", e.target.value)
                      }
                      className={[
                        "w-full h-7 rounded-md border border-input bg-background px-2 text-xs",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring",
                        "transition-[color,box-shadow]",
                      ].join(" ")}
                    >
                      <optgroup label="American Female">
                        {defaultVoices
                          .filter((v) => v.gender === "female" && v.accent === "american")
                          .map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="American Male">
                        {defaultVoices
                          .filter((v) => v.gender === "male" && v.accent === "american")
                          .map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="British Female">
                        {defaultVoices
                          .filter((v) => v.gender === "female" && v.accent === "british")
                          .map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="British Male">
                        {defaultVoices
                          .filter((v) => v.gender === "male" && v.accent === "british")
                          .map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {speakers.length < 4 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSpeaker}
                className="w-full text-xs h-7 border-dashed"
              >
                <PlusIcon className="size-3" />
                Add Speaker
              </Button>
            )}
          </section>

          <Separator />

          {/* ---- Focus Area ---------------------------------------------- */}
          <section className="space-y-2">
            <div className="space-y-0.5">
              <span className="text-xs font-medium">Focus Area</span>
              <p className="text-[10px] text-muted-foreground">
                Optional — specify what the podcast should emphasize.
              </p>
            </div>
            <Textarea
              placeholder="e.g. Compare the methodologies across the papers and highlight conflicting findings."
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="min-h-[72px] text-xs resize-none"
            />
          </section>
        </div>

        <Separator />

        {/* Footer */}
        <DialogFooter className="px-5 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="text-xs"
            onClick={handleGenerate}
          >
            Generate Outline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
