const SOURCE_KEY = 'translator_pref_source_lang_v1';
const TARGET_KEY = 'translator_pref_target_lang_v1';

export const getPreferredSourceLanguageCode = (): string | null => {
  try {
    const code = localStorage.getItem(SOURCE_KEY);
    return code || null;
  } catch {
    return null;
  }
};

export const setPreferredSourceLanguageCode = (code: string): void => {
  try {
    if (code) {
      localStorage.setItem(SOURCE_KEY, code);
    }
  } catch {
    // no-op
  }
};

export const getPreferredTargetLanguageCode = (): string | null => {
  try {
    const code = localStorage.getItem(TARGET_KEY);
    return code || null;
  } catch {
    return null;
  }
};

export const setPreferredTargetLanguageCode = (code: string): void => {
  try {
    if (code) {
      localStorage.setItem(TARGET_KEY, code);
    }
  } catch {
    // no-op
  }
};


