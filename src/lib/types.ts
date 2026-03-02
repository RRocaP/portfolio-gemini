// Source types
export type SourceType = "pdf" | "audio" | "image" | "website" | "text" | "note";
export type LiveSourceType = "google_drive" | "gmail" | "google_calendar" | "pubmed" | "slack" | "github" | "web_fetch";

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  selected: boolean;
  addedAt: Date;
  pageCount?: number;
  summary?: string;
  isLive?: boolean;
  liveSourceType?: LiveSourceType;
  liveConnected?: boolean;
}

// Note types
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  sourceIds: string[];  // Sources referenced in this note
  isTemplate?: boolean;
  templateType?: NoteTemplateType;
}

export type NoteTemplateType = "study_guide" | "briefing_doc" | "faq" | "timeline";

// Citation types
export interface Citation {
  id: string;
  sourceId: string;
  sourceName: string;
  passage: string;
  pageOrSection: string;
  isGeneralKnowledge: boolean;
}

// Message types
export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  citations: Citation[];
  timestamp: Date;
}

// Studio output types
export type StudioOutputType =
  | "audio_overview"
  | "study_guide"
  | "briefing_doc"
  | "faq"
  | "timeline"
  | "flashcards"
  | "quiz"
  | "infographic"
  | "slide_deck";

export interface StudioOutput {
  id: string;
  type: StudioOutputType;
  title: string;
  status: "generating" | "preview" | "ready" | "error";
  createdAt: Date;
  content?: string;
  duration?: string;  // For audio
}

// Notebook types
export interface Notebook {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  sources: Source[];
  notes: Note[];
  messages: Message[];
  outputs: StudioOutput[];
  createdAt: Date;
  updatedAt: Date;
}

// Export types
export type ExportFormat = "markdown" | "pdf" | "docx" | "html" | "bibtex";

// Plugin types (marketplace)
export interface Plugin {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  category: PluginCategory;
  installed: boolean;
  rating: number;
  downloads: number;
  icon: string;
}

export type PluginCategory = "source_connector" | "export_format" | "studio_output" | "theme" | "integration";

// Podcast / TTS types
export type PodcastTone = "casual" | "academic" | "storytelling" | "debate";

export interface PodcastSpeaker {
  id: string;
  name: string;
  personality: string;
  voiceId: string; // Kokoro voice ID (e.g., "af_sarah", "am_adam")
}

export interface PodcastConfig {
  length: number; // minutes (1-60)
  language: string; // e.g., "en-us", "en-gb"
  tone: PodcastTone;
  speakers: PodcastSpeaker[];
  focusArea?: string;
  sourceIds: string[];
}

export interface PodcastOutlineSegment {
  id: string;
  title: string;
  speakerId: string;
  estimatedMinutes: number;
  summary: string;
  sourceCoverage: "full" | "partial" | "thin";
}

export interface PodcastOutline {
  segments: PodcastOutlineSegment[];
  totalMinutes: number;
}

export interface KokoroVoice {
  id: string;
  name: string;
  gender: "female" | "male";
  accent: "american" | "british";
}
