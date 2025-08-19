// Netlify Function: Oxford Dictionary Lookup
// Handles CORS and scraping for Oxford Dictionary data

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const OXFORD_BASE = 'https://www.oxfordlearnersdictionaries.com';

// Check if position matches hint
function posMatches(pos, hint) {
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

// Extract slug from URL
function extractSlugFromUrl(url) {
  const match = url.match(/\/definition\/english\/(.+?)(?:\?|$)/);
  return match ? match[1] : '';
}

// Scrape Oxford page data with improved selectors
function scrape(html) {
  const cheerio = require('cheerio');
  const $ = cheerio.load(html);
  
  console.log('Starting to scrape HTML...');
  
  // Try multiple selectors for head word
  const headSelectors = [
    '.headword',
    '.webtop-g .headword',
    '.webtop-g h2 .hw',
    '.webtop-g h2',
    '#entryContent h1',
    'h1.headword',
    '.h',
    'h1'
  ];
  
  let head = '';
  for (const selector of headSelectors) {
    const text = $(selector).first().text().trim();
    console.log(`Trying selector ${selector}: "${text}"`);
    if (text && !text.includes('Oxford') && text.length < 50) {
      head = text;
      break;
    }
  }
  
  console.log(`Found head word: "${head}"`);
  
  if (!head) {
    console.log('No head word found, returning null');
    return null;
  }
  
  // Try multiple selectors for part of speech
  const posSelectors = [
    'span.pos',
    '.pos',
    'span[class*="pos"]',
    '.grammar span'
  ];
  
  let pos = '';
  for (const selector of posSelectors) {
    const text = $(selector).first().text().trim();
    if (text) {
      pos = text;
      break;
    }
  }
  
  // Try multiple selectors for phonetic
  const phonSelectors = [
    'span.phon',
    '.phon',
    'span[class*="phon"]',
    '.pronunciation'
  ];
  
  let phon = '';
  for (const selector of phonSelectors) {
    const text = $(selector).first().text().trim();
    if (text) {
      // Clean up phonetic notation - remove slashes, brackets, and extra spaces
      phon = text
        .replace(/^[\/\[\(]+|[\/\]\)]+$/g, '') // Remove leading/trailing delimiters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      break;
    }
  }
  
  // Extract senses with multiple approaches
  const senses = [];
  const senseSelectors = [
    '#entryContent li.sense',
    '.sense',
    'li[class*="sense"]',
    '.definition-item',
    '.def-item'
  ];
  
  let foundSenses = false;
  for (const senseSelector of senseSelectors) {
    const senseElements = $(senseSelector);
    if (senseElements.length > 0) {
      console.log(`Found ${senseElements.length} senses with selector: ${senseSelector}`);
      
      senseElements.each((i, li) => {
        const $li = $(li);
        
        // Try multiple selectors for definition
        const defSelectors = ['span.def', '.def', '.definition', 'span[class*="def"]'];
        let defn = '';
        for (const defSelector of defSelectors) {
          const text = $li.find(defSelector).first().text().trim();
          if (text) {
            defn = text;
            break;
          }
        }
        
        if (!defn) return; // Skip if no definition found
        
        // Try multiple selectors for labels
        const labelSelectors = [
          'span.registerlabel',
          'span.grammar',
          'span.label',
          'span.labels',
          '.label',
          '.grammar'
        ];
        
        let label = '';
        for (const labelSelector of labelSelectors) {
          const text = $li.find(labelSelector).first().text().trim();
          if (text) {
            label = text;
            break;
          }
        }
        
        // Try multiple selectors for synonyms
        const synSelectors = ['span.syn', '.syn', '.synonym'];
        let synonym = '';
        for (const synSelector of synSelectors) {
          const text = $li.find(synSelector).first().text().trim();
          if (text) {
            synonym = text;
            break;
          }
        }
        
        // Try multiple selectors for examples
        const exampleSelectors = ['span.x', '.x', '.example', 'span[class*="example"]'];
        const examples = [];
        for (const exSelector of exampleSelectors) {
          $li.find(exSelector).each((j, ex) => {
            let exampleText = $(ex).text().trim();
            
            // Clean up example text - remove underscores and other formatting
            exampleText = exampleText
              .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
              .replace(/_([^_]+)_/g, '$1') // Remove underscores around words
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim();
              
            if (exampleText && examples.length < 5) { // Limit to 5 examples per sense
              examples.push(exampleText);
            }
          });
          if (examples.length > 0) break; // Use first selector that finds examples
        }
        
        senses.push({
          definition: defn,
          label: label || undefined,
          synonym: synonym || undefined,
          examples
        });
      });
      
      foundSenses = true;
      break; // Use first selector that finds senses
    }
  }
  
  if (!foundSenses || senses.length === 0) {
    console.log('No senses found');
    return null;
  }
  
  console.log(`Found ${senses.length} senses`);
  
  // Extract related words sections from sidebar
  const relatedSections = [];

  const POS_RE = /(noun|verb|adjective|adverb|combining form)\b/i;

  function parseLinks($container) {
    const words = [];
    $container.find('a[href*="/definition/english/"]').each((i, link) => {
      const $link = $(link);
      let text = $link.text().trim();
      const href = $link.attr('href');
      let type = ($link.find('.pos, .type').text().trim() || $link.next('.pos, .type').text().trim() || '').toLowerCase();
      const m = text.match(POS_RE);
      if (m) {
        type = type || m[1].toLowerCase();
        text = text.replace(POS_RE, '').trim();
      }
      const word = text.replace(/\s{2,}/g, ' ').trim();
      if (word && words.length < 12) {
        words.push({
          word,
          type: type || 'word',
          url: href ? (href.startsWith('http') ? href : `${OXFORD_BASE}${href}`) : undefined
        });
      }
    });
    return words;
  }

  function parseSectionByHeading(regex, fallbackTitle) {
    const headings = $('h3, h4').filter((i, el) => regex.test($(el).text().trim().toLowerCase()));
    if (headings.length > 0) {
      const $h = $(headings[0]);
      const title = $h.text().trim() || fallbackTitle;
      const container = $h.closest('section, div');
      const words = parseLinks(container.length ? container : $h.parent());
      if (words.length > 0) relatedSections.push({ title, words });
    }
  }

  // Try explicit headings first (dedupe by title)
  const before = new Set();
  function addSectionOnce(regex, title) {
    const countBefore = relatedSections.length;
    parseSectionByHeading(regex, title);
    if (relatedSections.length > countBefore) {
      before.add((relatedSections[relatedSections.length - 1].title || title).toLowerCase());
    }
  }
  addSectionOnce(/other results/i, 'Other results');
  addSectionOnce(/nearby words/i, 'Nearby words');

  // Fallback: scan right column like aside/sidebar containers
  if (relatedSections.length < 2) {
    const sidebar = $('.sidebar, aside, #rightcolumn, .right-column').first();
    if (sidebar.length) {
      sidebar.find('section, div').each((i, sec) => {
        const $sec = $(sec);
        const title = $sec.find('h3, h4').first().text().trim();
        if (!title) return;
        if (!/other results|nearby words/i.test(title)) return;
        const key = title.toLowerCase();
        if (before.has(key)) return;
        const words = parseLinks($sec);
        if (words.length > 0) {
          relatedSections.push({ title, words });
          before.add(key);
        }
      });
    }
  }
  
  console.log(`Found ${relatedSections.length} related sections`);
  
  return {
    head,
    pos: pos || undefined,
    phon: phon || undefined,
    senses,
    relatedSections: relatedSections.length > 0 ? relatedSections : undefined
  };
}

// Fetch page with better error handling and headers
async function fetchPage(slug) {
  try {
    const url = `${OXFORD_BASE}/definition/english/${slug}`;
    console.log(`Fetching URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      console.log(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const html = await response.text();
    console.log(`HTML length: ${html.length}`);
    
    const data = scrape(html);
    console.log(`Scraped data:`, data ? 'Success' : 'Failed');
    
    if (data) {
      data.url = url;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching Oxford page:', error);
    return null;
  }
}

// Fetch search results with improved parsing
async function fetchSearch(query) {
  try {
    const url = `${OXFORD_BASE}/search/english/?q=${encodeURIComponent(query)}`;
    console.log(`Searching URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    if (!response.ok) {
      console.log(`Search failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const html = await response.text();
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    
    // Check if search page has embedded entry
    const embedded = scrape(html);
    if (embedded) {
      embedded.url = url;
      return embedded;
    }
    
    // Find first result link with multiple selectors
    const resultSelectors = [
      ".result-list a[href*='/definition/english/']",
      "a[href*='/definition/english/']",
      ".search-results a[href*='/definition/']",
      ".results a[href*='/definition/']"
    ];
    
    let link = null;
    for (const selector of resultSelectors) {
      const href = $(selector).first().attr('href');
      if (href) {
        link = { href };
        console.log(`Found result link: ${href}`);
        break;
      }
    }
    
    if (!link) {
      console.log('No result links found');
      return null;
    }
    
    const slug = extractSlugFromUrl(link.href);
    if (!slug) {
      console.log('Could not extract slug from URL');
      return null;
    }
    
    return await fetchPage(slug);
    
  } catch (error) {
    console.error('Error fetching Oxford search:', error);
    return null;
  }
}

// Fetch from Oxford with hint support
async function fetchOxford(word, hint) {
  console.log(`Looking up word: "${word}" with hint: ${hint || 'none'}`);
  
  if (hint) {
    // Try numbered variants first
    for (let i = 1; i <= 8; i++) {
      console.log(`Trying variant: ${word}_${i}`);
      const candidate = await fetchPage(`${word}_${i}`);
      if (candidate && posMatches(candidate.pos, hint)) {
        console.log(`Found matching variant: ${word}_${i}`);
        return candidate;
      }
    }
  }
  
  // Try bare entry
  console.log(`Trying bare entry: ${word}`);
  const entry = await fetchPage(word);
  if (entry) {
    console.log(`Found bare entry: ${word}`);
    return entry;
  }
  
  // Fallback to search
  console.log(`Trying search for: ${word}`);
  const searchResult = await fetchSearch(word);
  if (searchResult) {
    console.log(`Found via search: ${word}`);
  }
  
  return searchResult;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders, body: '' };
    }
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
    }

    const { word, hint } = JSON.parse(event.body || '{}');
    if (!word) {
      return { statusCode: 400, headers: corsHeaders, body: 'Missing required field: word' };
    }

    console.log(`Oxford lookup request: word="${word}", hint="${hint || 'none'}"`);
    
    const result = await fetchOxford(word.toLowerCase().trim(), hint);
    
    console.log(`Lookup result: ${result ? 'SUCCESS' : 'NOT FOUND'}`);
    
    const body = JSON.stringify({
      success: result ? [result] : [],
      notFound: result ? [] : [word]
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      body
    };
  } catch (error) {
    console.error('Netlify oxford function error:', error);
    return { 
      statusCode: 500, 
      headers: corsHeaders, 
      body: JSON.stringify({ 
        error: 'Failed to lookup word',
        details: error.message,
        success: [],
        notFound: [word || 'unknown']
      })
    };
  }
};