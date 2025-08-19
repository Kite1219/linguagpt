import { OxfordEntry, OxfordLookupResult } from '../types';

// const OXFORD_BASE = 'https://www.oxfordlearnersdictionaries.com'; // Used in Netlify function

interface WordInput {
  base: string;
  hint?: string;
}

// Parse input lines and extract words with optional hints
function parseInputLines(input: string): WordInput[] {
  const lines = input.trim().split('\n');
  const words: WordInput[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check for hint pattern: word (n|v|adj|adv)
    const hintMatch = trimmed.match(/^(.+?)\s*\((n|v|adj|adv)\)\s*$/);
    if (hintMatch) {
      words.push({ base: hintMatch[1].trim(), hint: hintMatch[2] });
    } else {
      words.push({ base: trimmed });
    }
  }
  
  return words;
}

// Check if word ends with 's' (for pluralization)
function endsWithS(word: string): boolean {
  return word.endsWith('s');
}

// Simple singularization (basic implementation)
function singularize(word: string): string {
  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('es')) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s')) {
    return word.slice(0, -1);
  }
  return word;
}

// Check if position matches hint
function posMatches(pos: string | undefined, hint: string): boolean {
  if (!pos || !hint) return false;
  
  const posLower = pos.toLowerCase();
  switch (hint) {
    case 'n': return posLower.includes('noun');
    case 'v': return posLower.includes('verb');
    case 'adj': return posLower.includes('adjective');
    case 'adv': return posLower.includes('adverb');
    default: return false;
  }
}

// Extract slug from URL (used in Netlify function)
// function extractSlugFromUrl(url: string): string {
//   const match = url.match(/\/definition\/english\/(.+?)(?:\?|$)/);
//   return match ? match[1] : '';
// }

// Main lookup function
async function lookup(base: string, hint?: string): Promise<OxfordEntry | null> {
  return await fetchOxford(base, hint);
}

// Fetch from Oxford with hint support
async function fetchOxford(word: string, hint?: string): Promise<OxfordEntry | null> {
  if (hint) {
    // Try numbered variants first
    for (let i = 1; i <= 8; i++) {
      const candidate = await fetchPage(`${word}_${i}`);
      if (candidate && posMatches(candidate.pos, hint)) {
        return candidate;
      }
    }
  }
  
  // Try bare entry
  const entry = await fetchPage(word);
  if (entry) return entry;
  
  // Fallback to search
  return await fetchSearch(word);
}

// Fetch page through Netlify function
async function fetchPage(slug: string): Promise<OxfordEntry | null> {
  try {
    const response = await fetch('/.netlify/functions/oxford', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: slug, type: 'page' })
    });
    
    if (!response.ok) return null;
    
    const data: OxfordLookupResult = await response.json();
    return data.success[0] || null;
  } catch (error) {
    console.error('Error fetching Oxford page:', error);
    return null;
  }
}

// Fetch search results through Netlify function
async function fetchSearch(query: string): Promise<OxfordEntry | null> {
  try {
    const response = await fetch('/.netlify/functions/oxford', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: query, type: 'search' })
    });
    
    if (!response.ok) return null;
    
    const data: OxfordLookupResult = await response.json();
    return data.success[0] || null;
  } catch (error) {
    console.error('Error fetching Oxford search:', error);
    return null;
  }
}

// Add delay between requests to be respectful
const requestDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Main run function
export async function lookupWords(input: string): Promise<OxfordLookupResult> {
  const words = parseInputLines(input);
  const success: OxfordEntry[] = [];
  const notFound: string[] = [];
  
  for (const { base, hint } of words) {
    // Add delay between requests
    await requestDelay(1000);
    
    let entry = await lookup(base, hint);
    
    // If not found and word ends with 's', try singular
    if (!entry && endsWithS(base)) {
      entry = await lookup(singularize(base), hint);
    }
    
    if (!entry) {
      notFound.push(base);
    } else {
      success.unshift(entry); // Keep last 50
      if (success.length > 50) {
        success.pop();
      }
    }
  }
  
  // Save to localStorage
  try {
    localStorage.setItem('oxford_success', JSON.stringify(success));
    localStorage.setItem('oxford_notFound', JSON.stringify(notFound));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
  
  return { success, notFound };
}

// Simple function to lookup a single word using Netlify function
export async function lookupSingleWord(word: string): Promise<OxfordEntry | null> {
  try {
    const response = await fetch('/.netlify/functions/oxford', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: word.toLowerCase().trim() })
    });

    if (!response.ok) {
      throw new Error(`Failed to lookup word: ${response.status} ${response.statusText}`);
    }

    const data: OxfordLookupResult = await response.json();
    return data.success[0] || null;
  } catch (error) {
    console.error('Oxford lookup error:', error);
    throw error;
  }
}