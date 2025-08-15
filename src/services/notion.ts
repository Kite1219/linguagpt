import { getNotionApiKey, getNotionPageId } from './preferences';

export interface NotionEntry {
  text: string;
  timestamp: string;
}

export interface NotionConfig {
  apiKey: string;
  pageId: string;
}

// Call the Notion serverless function
const callNotionFunction = async (action: string, apiKey: string, pageId: string, text?: string) => {
  const response = await fetch('/.netlify/functions/notion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      apiKey,
      pageId,
      text,
    }),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Request failed');
  }
  
  return result;
};

// Add text to a Notion page by appending a new block
export const addToNotion = async (text: string): Promise<void> => {
  const apiKey = getNotionApiKey();
  const pageId = getNotionPageId();

  if (!apiKey || !pageId) {
    throw new Error('Notion API key and page ID are required');
  }

  if (!text.trim()) {
    throw new Error('Text cannot be empty');
  }

  try {
    await callNotionFunction('add', apiKey, pageId, text.trim());
  } catch (error) {
    console.error('Error adding to Notion:', error);
    throw error;
  }
};

// Test Notion connection
export const testNotionConnection = async (apiKey: string, pageId: string): Promise<boolean> => {
  try {
    const result = await callNotionFunction('test', apiKey, pageId);
    return result.success;
  } catch (error) {
    console.error('Error testing Notion connection:', error);
    return false;
  }
};
