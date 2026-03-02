"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PodcastConfigDialog } from "./podcast-config-dialog";
import { AudioPlayer } from "./audio-player";
import type { PodcastConfig } from "@/lib/types";

type PodcastStatus = "idle" | "configuring" | "generating" | "ready" | "error";

interface AudioOverviewProps {
  onPodcastGenerated?: (audioUrl: string, title: string) => void;
}

export function AudioOverview({ onPodcastGenerated }: AudioOverviewProps) {
  const [status, setStatus] = useState<PodcastStatus>("idle");
  const [configOpen, setConfigOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePodcast = useCallback(
    async (config: PodcastConfig) => {
      setConfigOpen(false);
      setStatus("generating");
      setError(null);

      try {
        // Generate a demo script based on the config
        const script = buildDemoScript(config);

        // Call the Kokoro TTS API for each speaker segment
        const segmentUrls: string[] = [];
        for (const segment of script) {
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: segment.text,
              voice: segment.voiceId,
              speed: 1.0,
            }),
          });

          if (!res.ok) {
            throw new Error(`TTS generation failed: ${res.statusText}`);
          }

          const blob = await res.blob();
          segmentUrls.push(URL.createObjectURL(blob));
        }

        // Play segments sequentially via the first URL; the AudioPlayer
        // handles a single src, so we chain them with ended events.
        // TODO: proper WAV concat with Web Audio API (decode → merge PCM → re-encode)
        const url = await chainAudioSegments(segmentUrls);
        setAudioUrl(url);
        setStatus("ready");
        onPodcastGenerated?.(url, `Podcast — ${config.tone}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Generation failed");
        setStatus("error");
      }
    },
    [onPodcastGenerated]
  );

  const handleCustomize = () => {
    setConfigOpen(true);
  };

  const handleQuickGenerate = () => {
    // Generate with defaults — opens config dialog for now
    setConfigOpen(true);
  };

  return (
    <>
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎙️</span>
            <h3 className="text-sm font-semibold">Audio Overview</h3>
            {status === "generating" && (
              <Badge variant="secondary" className="text-[10px] animate-pulse">
                Generating...
              </Badge>
            )}
            {status === "ready" && (
              <Badge
                variant="secondary"
                className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              >
                Ready
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            Generate a podcast-style audio overview of your sources using Kokoro
            TTS. Customize length, tone, speakers, and focus areas.
          </p>

          {/* Audio player when ready */}
          {status === "ready" && audioUrl && (
            <AudioPlayer
              src={audioUrl}
              title="Audio Overview"
              className="mb-3"
            />
          )}

          {/* Error message */}
          {status === "error" && error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-2 mb-3">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={handleCustomize}
              disabled={status === "generating"}
            >
              Customize
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs"
              onClick={handleQuickGenerate}
              disabled={status === "generating"}
            >
              {status === "generating" ? "Generating..." : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <PodcastConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        onGenerate={generatePodcast}
      />
    </>
  );
}

// Decode WAV blobs to raw PCM, concatenate, and re-encode as a single WAV.
// TODO: proper WAV concat with Web Audio API for production use
async function chainAudioSegments(urls: string[]): Promise<string> {
  if (urls.length === 0) throw new Error("No audio segments to combine");
  if (urls.length === 1) return urls[0];

  const ctx = new AudioContext();
  const buffers: AudioBuffer[] = [];

  for (const url of urls) {
    const response = await fetch(url);
    const arrayBuf = await response.arrayBuffer();
    buffers.push(await ctx.decodeAudioData(arrayBuf));
  }

  // Calculate total length
  const sampleRate = buffers[0].sampleRate;
  const numChannels = buffers[0].numberOfChannels;
  const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);

  // Merge into one buffer
  const merged = ctx.createBuffer(numChannels, totalLength, sampleRate);
  let offset = 0;
  for (const buf of buffers) {
    for (let ch = 0; ch < numChannels; ch++) {
      merged.getChannelData(ch).set(buf.getChannelData(ch), offset);
    }
    offset += buf.length;
  }

  // Encode to WAV
  const wavBlob = audioBufferToWav(merged);
  await ctx.close();

  // Revoke individual segment URLs
  for (const url of urls) URL.revokeObjectURL(url);

  return URL.createObjectURL(wavBlob);
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = buffer.length * blockAlign;
  const headerSize = 44;
  const arrayBuffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(arrayBuffer);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  // fmt chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Interleave channels and write 16-bit PCM samples
  let writeOffset = headerSize;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(writeOffset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      writeOffset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// Build a simple demo script from the podcast config
function buildDemoScript(
  config: PodcastConfig
): { text: string; voiceId: string }[] {
  const segments: { text: string; voiceId: string }[] = [];
  const host = config.speakers[0];
  const cohost = config.speakers[1];

  segments.push({
    text: `Welcome to the podcast! I'm ${host?.name ?? "your host"}, and today we're going to explore the key themes from your research sources.`,
    voiceId: host?.voiceId ?? "af_heart",
  });

  if (cohost) {
    segments.push({
      text: `Thanks for having me! I'm ${cohost.name}, and I'm excited to dig into this material with you. Let's get started.`,
      voiceId: cohost.voiceId,
    });
  }

  if (config.focusArea) {
    segments.push({
      text: `Our main focus today will be on ${config.focusArea}. Let's see what the sources have to say about this.`,
      voiceId: host?.voiceId ?? "af_heart",
    });
  }

  return segments;
}
