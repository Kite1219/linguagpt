import { TranslationResponse } from '../types';

const INPUT_KEY = 'translator_draft_input_v1';
const OUTPUT_KEY = 'translator_draft_output_v1';

export const getDraftInput = (): string => {
  try {
    const raw = localStorage.getItem(INPUT_KEY);
    return typeof raw === 'string' ? raw : '';
  } catch {
    return '';
  }
};

export const setDraftInput = (value: string): void => {
  try {
    if (value && value.trim().length > 0) {
      localStorage.setItem(INPUT_KEY, value);
    } else {
      localStorage.removeItem(INPUT_KEY);
    }
  } catch {
    // no-op
  }
};

export const clearDraftInput = (): void => {
  try {
    localStorage.removeItem(INPUT_KEY);
  } catch {
    // no-op
  }
};

export const getDraftTranslation = (): TranslationResponse | null => {
  try {
    const raw = localStorage.getItem(OUTPUT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TranslationResponse | null;
    if (
      parsed &&
      typeof parsed.translatedText === 'string' &&
      typeof parsed.sourceLanguage === 'string' &&
      typeof parsed.targetLanguage === 'string'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const setDraftTranslation = (value: TranslationResponse | null): void => {
  try {
    if (value) {
      localStorage.setItem(OUTPUT_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(OUTPUT_KEY);
    }
  } catch {
    // no-op
  }
};

export const clearDraftTranslation = (): void => {
  try {
    localStorage.removeItem(OUTPUT_KEY);
  } catch {
    // no-op
  }
};


