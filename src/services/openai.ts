import { TranslationRequest, TranslationResponse } from '../types';

export const translateText = async (request: TranslationRequest): Promise<TranslationResponse> => {
  try {
    const apiBase = process.env.REACT_APP_API_BASE || '';
    const response = await fetch(`${apiBase}/.netlify/functions/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Failed to translate');
    }

    const data = await response.json();
    return data as TranslationResponse;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text. Please try again.');
  }
};
