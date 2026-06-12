/**
 * Shared visual tokens for the R3F hero + ML scenes.
 * Both AIProteinConstruct and DiffusionCubeField import from here so the
 * two visuals read as one design system instead of two parallel demos.
 */
export const scenePalette = {
  // Surface / background tones
  pearl: "#eef0e8",
  ivory: "#fff4de",
  mint: "#eef4ec",
  paper: "#f4f5f3",

  // Saturated accents — sparing use, mainly for emissives and rim light
  teal: "#74d8cf",
  tealDeep: "#2a8f98",
  coral: "#f0a89b",
  coralDeep: "#c97c70",
  violet: "#9a93c2",
  violetDeep: "#6f68a0",

  // Specular ink — text, deep shadows
  ink: "#151719",
} as const;

export const sceneEnv = {
  /** Drei <Environment preset="..."> name — single source of truth so swapping is one line */
  preset: "city" as const,
  /** Intensity of the environment contribution to lighting */
  intensity: 0.55,
} as const;
