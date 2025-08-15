const SOURCE_KEY = 'translator_pref_source_lang_v1';
const TARGET_KEY = 'translator_pref_target_lang_v1';
const NOTION_API_KEY = 'translator_notion_api_key_v1';
const NOTION_PAGE_ID = 'translator_notion_page_id_v1';
const NOTION_ENABLED_KEY = 'translator_notion_enabled_v1';

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

// Notion preferences
export const getNotionApiKey = (): string | null => {
  try {
    return localStorage.getItem(NOTION_API_KEY);
  } catch {
    return null;
  }
};

export const setNotionApiKey = (apiKey: string): void => {
  try {
    if (apiKey) {
      localStorage.setItem(NOTION_API_KEY, apiKey);
    } else {
      localStorage.removeItem(NOTION_API_KEY);
    }
  } catch {
    // no-op
  }
};

export const getNotionPageId = (): string | null => {
  try {
    return localStorage.getItem(NOTION_PAGE_ID);
  } catch {
    return null;
  }
};

export const setNotionPageId = (pageId: string): void => {
  try {
    if (pageId) {
      localStorage.setItem(NOTION_PAGE_ID, pageId);
    } else {
      localStorage.removeItem(NOTION_PAGE_ID);
    }
  } catch {
    // no-op
  }
};

export const getNotionEnabled = (): boolean => {
  try {
    return localStorage.getItem(NOTION_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setNotionEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(NOTION_ENABLED_KEY, enabled.toString());
  } catch {
    // no-op
  }
};

