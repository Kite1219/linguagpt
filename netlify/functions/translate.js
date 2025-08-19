// Netlify Function: Translate via OpenAI
// Requires env var: OPENAI_API_KEY

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const KNOWN_LANGS = [
  { code: 'en', names: ['english', 'en', 'en-us', 'en-gb'] },
  { code: 'vi', names: ['vietnamese', 'vi'] },
  { code: 'es', names: ['spanish', 'es'] },
  { code: 'fr', names: ['french', 'fr'] },
  { code: 'de', names: ['german', 'de'] },
  { code: 'ja', names: ['japanese', 'ja'] },
  { code: 'ko', names: ['korean', 'ko'] },
  { code: 'zh', names: ['chinese', 'zh', 'zh-cn', 'zh-tw'] }
  // keep list short; purpose is only to check for English specifically
];

function normalizeDetectionLabel(text) {
  const t = (text || '').toString().trim().toLowerCase();
  const en = KNOWN_LANGS.find(x => x.code === 'en');
  if (en && en.names.some(n => t.includes(n))) return { code: 'en', name: 'English' };
  const hit = KNOWN_LANGS.find(x => x.names.some(n => t.includes(n)));
  return hit ? { code: hit.code, name: capitalize(hit.names[0]) } : { code: 'unknown', name: 'Unknown' };
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders, body: '' };
    }
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers: corsHeaders, body: 'OPENAI_API_KEY is not set' };
    }

    const { text, sourceLanguage, targetLanguage } = JSON.parse(event.body || '{}');
    if (!text || !targetLanguage) {
      return { statusCode: 400, headers: corsHeaders, body: 'Missing required fields: text, targetLanguage' };
    }

    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey });

    // Optional detection when auto-detect is requested
    let detected = null;
    const isAuto = !sourceLanguage || /auto|detect/i.test(sourceLanguage);
    if (isAuto) {
      const detectPrompt = `What language is the following text written in? Answer with just the language name in English (e.g., English, Vietnamese, Spanish) and nothing else.\n\nText:\n${text.slice(0, 400)}`;
      const detect = await openai.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages: [
          { role: 'system', content: 'Detect the language of the user text.' },
          { role: 'user', content: detectPrompt }
        ],
        max_tokens: 10,
        temperature: 0
      });
      const label = detect.choices?.[0]?.message?.content?.trim() || '';
      const normalized = normalizeDetectionLabel(label);
      detected = normalized;
    }

    const prompt = `Translate the following text from ${sourceLanguage || (detected?.name || 'auto-detected language')} to ${targetLanguage}.\n\nRequirements:\n- Preserve ALL original line breaks and spacing exactly where possible.\n- Do not collapse multiple newlines into one.\n- Return ONLY the translated text with the same paragraph and line structure.\n- If the input looks like code or contains indentation, keep the same indentation and line structure.\n\nText to translate:\n${text}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: 'You are a professional translator. Translate accurately, preserve tone and meaning, and strictly preserve whitespace (line breaks and spacing). Return only the translated text.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.1
    });

    const translatedText = completion.choices?.[0]?.message?.content?.trim() || '';

    // Normalize source language label in the response
    const requestedSource = (sourceLanguage || '').toString();
    const normalizedSource = requestedSource.trim().length === 0
      ? 'Auto-detect'
      : (/auto|detect/i.test(requestedSource) ? 'Auto-detect' : requestedSource);

    const body = JSON.stringify({
      translatedText,
      sourceLanguage: normalizedSource,
      targetLanguage,
      detectedLanguageCode: detected?.code,
      detectedLanguageName: detected?.name
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      body
    };
  } catch (error) {
    console.error('Netlify translate function error:', error);
    return { statusCode: 500, headers: corsHeaders, body: 'Failed to translate text' };
  }
};


