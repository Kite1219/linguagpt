export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

// Oxford Dictionary types
export interface OxfordSense {
  definition: string;
  label?: string;
  synonym?: string;
  examples: string[];
}

export interface OxfordEntry {
  head: string;
  pos?: string; // part of speech
  phon?: string; // phonetic
  extra?: string[];
  senses: OxfordSense[];
  url?: string;
}

export interface OxfordLookupResult {
  success: OxfordEntry[];
  notFound: string[];
}

