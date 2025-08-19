// Netlify Function: Translate via OpenAI
// Requires env var: OPENAI_API_KEY

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

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

    const prompt = `Translate the following text from ${sourceLanguage || 'auto-detected language'} to ${targetLanguage}.

Requirements:
- Preserve ALL original line breaks and spacing exactly where possible.
- Do not collapse multiple newlines into one.
- Return ONLY the translated text with the same paragraph and line structure.
- If the input looks like code or contains indentation, keep the same indentation and line structure.

Text to translate:
${text}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional translator. Translate accurately, preserve tone and meaning, and strictly preserve whitespace (line breaks and spacing). Return only the translated text.'
        },
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
      targetLanguage
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


