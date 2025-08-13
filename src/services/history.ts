import { TranslationResponse } from '../types';

const STORAGE_KEY = 'translator_history_v1';

export interface HistoryItem extends TranslationResponse {
  id: string;
  inputText: string;
  createdAt: number;
}

export const getHistory = (): HistoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const addToHistory = (item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem[] => {
  const current = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const next = [newItem, ...current].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const findCachedTranslation = (
  inputText: string,
  sourceLanguage: string,
  targetLanguage: string
): HistoryItem | undefined => {
  const needle = inputText.trim();
  if (!needle) return undefined;
  const items = getHistory();
  return items.find(
    (i) =>
      i.inputText.trim() === needle &&
      i.sourceLanguage === sourceLanguage &&
      i.targetLanguage === targetLanguage
  );
};


