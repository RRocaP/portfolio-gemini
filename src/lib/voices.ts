import type { KokoroVoice } from "./types";

/**
 * Single source of truth for the Kokoro voice catalogue.
 * Derived from the kokoro-js VOICES map. All components should import from here.
 */
export const KOKORO_VOICES: KokoroVoice[] = [
  // American female (af_*)
  { id: "af_alloy",    name: "Alloy",    gender: "female", accent: "american" },
  { id: "af_aoede",    name: "Aoede",    gender: "female", accent: "american" },
  { id: "af_bella",    name: "Bella",    gender: "female", accent: "american" },
  { id: "af_heart",    name: "Heart",    gender: "female", accent: "american" },
  { id: "af_jessica",  name: "Jessica",  gender: "female", accent: "american" },
  { id: "af_kore",     name: "Kore",     gender: "female", accent: "american" },
  { id: "af_nicole",   name: "Nicole",   gender: "female", accent: "american" },
  { id: "af_nova",     name: "Nova",     gender: "female", accent: "american" },
  { id: "af_river",    name: "River",    gender: "female", accent: "american" },
  { id: "af_sarah",    name: "Sarah",    gender: "female", accent: "american" },
  { id: "af_sky",      name: "Sky",      gender: "female", accent: "american" },
  // American male (am_*)
  { id: "am_adam",     name: "Adam",     gender: "male",   accent: "american" },
  { id: "am_echo",     name: "Echo",     gender: "male",   accent: "american" },
  { id: "am_eric",     name: "Eric",     gender: "male",   accent: "american" },
  { id: "am_fenrir",   name: "Fenrir",   gender: "male",   accent: "american" },
  { id: "am_liam",     name: "Liam",     gender: "male",   accent: "american" },
  { id: "am_michael",  name: "Michael",  gender: "male",   accent: "american" },
  { id: "am_onyx",     name: "Onyx",     gender: "male",   accent: "american" },
  { id: "am_puck",     name: "Puck",     gender: "male",   accent: "american" },
  // British female (bf_*)
  { id: "bf_alice",    name: "Alice",    gender: "female", accent: "british" },
  { id: "bf_emma",     name: "Emma",     gender: "female", accent: "british" },
  { id: "bf_isabella", name: "Isabella", gender: "female", accent: "british" },
  { id: "bf_lily",     name: "Lily",     gender: "female", accent: "british" },
  // British male (bm_*)
  { id: "bm_daniel",   name: "Daniel",   gender: "male",   accent: "british" },
  { id: "bm_fable",    name: "Fable",    gender: "male",   accent: "british" },
  { id: "bm_george",   name: "George",   gender: "male",   accent: "british" },
  { id: "bm_lewis",    name: "Lewis",    gender: "male",   accent: "british" },
];

export const VALID_VOICE_IDS = new Set(KOKORO_VOICES.map((v) => v.id));
