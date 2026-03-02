import { NextRequest, NextResponse } from "next/server";
import { KokoroTTS } from "kokoro-js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VoiceEntry {
  id: string;
  name: string;
  gender: "female" | "male";
  accent: "american" | "british";
}

// ---------------------------------------------------------------------------
// Static voice catalogue
// Derived from the kokoro-js VOICES map; kept here so the GET handler has
// zero dependency on the model being loaded.
// ---------------------------------------------------------------------------

const VOICE_CATALOGUE: VoiceEntry[] = [
  // American female (af_*)
  { id: "af_alloy",    name: "Alloy",    gender: "female", accent: "american" },
  { id: "af_aoede",   name: "Aoede",    gender: "female", accent: "american" },
  { id: "af_bella",   name: "Bella",    gender: "female", accent: "american" },
  { id: "af_heart",   name: "Heart",    gender: "female", accent: "american" },
  { id: "af_jessica", name: "Jessica",  gender: "female", accent: "american" },
  { id: "af_kore",    name: "Kore",     gender: "female", accent: "american" },
  { id: "af_nicole",  name: "Nicole",   gender: "female", accent: "american" },
  { id: "af_nova",    name: "Nova",     gender: "female", accent: "american" },
  { id: "af_river",   name: "River",    gender: "female", accent: "american" },
  { id: "af_sarah",   name: "Sarah",    gender: "female", accent: "american" },
  { id: "af_sky",     name: "Sky",      gender: "female", accent: "american" },
  // American male (am_*)
  { id: "am_adam",    name: "Adam",     gender: "male",   accent: "american" },
  { id: "am_echo",    name: "Echo",     gender: "male",   accent: "american" },
  { id: "am_eric",    name: "Eric",     gender: "male",   accent: "american" },
  { id: "am_fenrir",  name: "Fenrir",   gender: "male",   accent: "american" },
  { id: "am_liam",    name: "Liam",     gender: "male",   accent: "american" },
  { id: "am_michael", name: "Michael",  gender: "male",   accent: "american" },
  { id: "am_onyx",    name: "Onyx",     gender: "male",   accent: "american" },
  { id: "am_puck",    name: "Puck",     gender: "male",   accent: "american" },
  // British female (bf_*)
  { id: "bf_alice",   name: "Alice",    gender: "female", accent: "british" },
  { id: "bf_emma",    name: "Emma",     gender: "female", accent: "british" },
  { id: "bf_isabella",name: "Isabella", gender: "female", accent: "british" },
  { id: "bf_lily",    name: "Lily",     gender: "female", accent: "british" },
  // British male (bm_*)
  { id: "bm_daniel",  name: "Daniel",   gender: "male",   accent: "british" },
  { id: "bm_fable",   name: "Fable",    gender: "male",   accent: "british" },
  { id: "bm_george",  name: "George",   gender: "male",   accent: "british" },
  { id: "bm_lewis",   name: "Lewis",    gender: "male",   accent: "british" },
];

const VALID_VOICE_IDS = new Set(VOICE_CATALOGUE.map((v) => v.id));

// ---------------------------------------------------------------------------
// Lazy singleton – the model is heavy; load it once and reuse across requests.
// ---------------------------------------------------------------------------

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

let ttsInstance: KokoroTTS | null = null;
let loadPromise: Promise<KokoroTTS> | null = null;

async function getTTS(): Promise<KokoroTTS> {
  if (ttsInstance) return ttsInstance;

  // Deduplicate concurrent load requests so the model is only fetched once.
  if (!loadPromise) {
    loadPromise = KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: "q8",
      device: "cpu",
    }).then((instance) => {
      ttsInstance = instance;
      return instance;
    }).catch((err) => {
      // Reset so the next request can retry.
      loadPromise = null;
      throw err;
    });
  }

  return loadPromise;
}

// ---------------------------------------------------------------------------
// CORS helpers
// ---------------------------------------------------------------------------

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function withCors(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// ---------------------------------------------------------------------------
// OPTIONS – preflight
// ---------------------------------------------------------------------------

export async function OPTIONS(): Promise<NextResponse> {
  return withCors(
    new NextResponse(null, { status: 204, headers: CORS_HEADERS })
  );
}

// ---------------------------------------------------------------------------
// GET /api/tts – return available voices
// ---------------------------------------------------------------------------

export async function GET(): Promise<NextResponse> {
  const response = NextResponse.json({ voices: VOICE_CATALOGUE });
  return withCors(response);
}

// ---------------------------------------------------------------------------
// POST /api/tts – synthesise speech and return WAV audio
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // --- Parse & validate request body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withCors(
      NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      )
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return withCors(
      NextResponse.json(
        { error: "Request body must be a JSON object." },
        { status: 400 }
      )
    );
  }

  const { text, voice, speed } = body as Record<string, unknown>;

  // text – required string
  if (typeof text !== "string" || text.trim().length === 0) {
    return withCors(
      NextResponse.json(
        { error: "Field 'text' is required and must be a non-empty string." },
        { status: 400 }
      )
    );
  }

  // voice – optional; must be a known voice id if provided
  const resolvedVoice: string =
    voice === undefined ? "af_heart" : String(voice);

  if (!VALID_VOICE_IDS.has(resolvedVoice)) {
    return withCors(
      NextResponse.json(
        {
          error: `Unknown voice '${resolvedVoice}'. Use GET /api/tts to list available voices.`,
        },
        { status: 400 }
      )
    );
  }

  // speed – optional number, must be positive
  let resolvedSpeed = 1.0;
  if (speed !== undefined) {
    const parsedSpeed = Number(speed);
    if (!Number.isFinite(parsedSpeed) || parsedSpeed <= 0) {
      return withCors(
        NextResponse.json(
          { error: "Field 'speed' must be a positive number." },
          { status: 400 }
        )
      );
    }
    resolvedSpeed = parsedSpeed;
  }

  // --- Load model ---
  let tts: KokoroTTS;
  try {
    tts = await getTTS();
  } catch (err) {
    console.error("[TTS] Failed to load Kokoro model:", err);
    return withCors(
      NextResponse.json(
        { error: "TTS model is unavailable. Please try again later." },
        { status: 503 }
      )
    );
  }

  // --- Generate audio ---
  let wavBuffer: ArrayBuffer;
  try {
    const audio = await tts.generate(text.trim(), {
      // kokoro-js accepts the voice id as a typed key; cast to satisfy TS
      voice: resolvedVoice as Parameters<typeof tts.generate>[1] extends
        { voice?: infer V } ? V : never,
      speed: resolvedSpeed,
    });
    wavBuffer = audio.toWav();
  } catch (err) {
    console.error("[TTS] Audio generation failed:", err);
    return withCors(
      NextResponse.json(
        { error: "Audio generation failed. Please try again." },
        { status: 500 }
      )
    );
  }

  // --- Return WAV response ---
  const wavResponse = new NextResponse(wavBuffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/wav",
      "Content-Length": String(wavBuffer.byteLength),
      "Cache-Control": "no-store",
      ...CORS_HEADERS,
    },
  });

  return wavResponse;
}
