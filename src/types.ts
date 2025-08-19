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
  detectedLanguageCode?: string; // present when source was auto-detected
  detectedLanguageName?: string; // present when source was auto-detected
}

// Oxford Dictionary types
export interface OxfordSense {
  definition: string;
  label?: string;
  synonym?: string;
  examples: string[];
}

export interface RelatedWord {
  word: string;
  type: string; // e.g., "verb", "noun", "adjective"
  url?: string;
}

export interface OxfordRelatedSection {
  title: string; // e.g., "Other results", "Nearby words"
  words: RelatedWord[];
}

export interface OxfordEntry {
  head: string;
  pos?: string; // part of speech
  phon?: string; // phonetic
  extra?: string[];
  senses: OxfordSense[];
  url?: string;
  relatedSections?: OxfordRelatedSection[]; // Related words from sidebar
}

export interface OxfordLookupResult {
  success: OxfordEntry[];
  notFound: string[];
}

