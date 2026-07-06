export interface FreeVoice {
  id: string;
  label: string;
  gender: "Female" | "Male";
  locale: string;
}

export const DEFAULT_FREE_VOICE = "en-US-JennyNeural";

export const FREE_VOICES: FreeVoice[] = [
  {
    id: "en-US-JennyNeural",
    label: "Jenny",
    gender: "Female",
    locale: "US English",
  },
  {
    id: "en-US-GuyNeural",
    label: "Guy",
    gender: "Male",
    locale: "US English",
  },
  {
    id: "en-US-AriaNeural",
    label: "Aria",
    gender: "Female",
    locale: "US English",
  },
  {
    id: "en-US-DavisNeural",
    label: "Davis",
    gender: "Male",
    locale: "US English",
  },
  {
    id: "en-GB-SoniaNeural",
    label: "Sonia",
    gender: "Female",
    locale: "UK English",
  },
  {
    id: "en-GB-RyanNeural",
    label: "Ryan",
    gender: "Male",
    locale: "UK English",
  },
  {
    id: "en-AU-NatashaNeural",
    label: "Natasha",
    gender: "Female",
    locale: "Australian",
  },
];

export function getVoiceLabel(voiceId: string): string {
  return FREE_VOICES.find((v) => v.id === voiceId)?.label ?? voiceId;
}
