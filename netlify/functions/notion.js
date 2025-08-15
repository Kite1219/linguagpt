const { Client } = require('@notionhq/client');

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { action, apiKey, pageId, text } = JSON.parse(event.body);

    if (!apiKey || !pageId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'API key and page ID are required' }),
      };
    }

    // Initialize Notion client
    const notion = new Client({ auth: apiKey });

    // Extract and format page ID
    const extractNotionId = (raw) => {
      if (!raw) return '';
      let input = raw.trim();
      
      // If it's a URL, get the path or the page ID part
      if (input.includes('notion.so/')) {
        const parts = input.split('/');
        input = parts[parts.length - 1];
      }

      // Remove any remaining non-alphanumeric characters except dashes
      input = input.replace(/[^0-9a-fA-F-]/gi, '');
      
      // Try dashed UUID first (standard format)
      const dashedMatch = input.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/i);
      if (dashedMatch) {
        return dashedMatch[0];
      }

      // Try 32 hex characters (undashed format)
      const hex32Match = input.match(/[0-9a-fA-F]{32}/i);
      if (hex32Match) {
        // Format as UUID
        const hex = hex32Match[0];
        return hex.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
      }

      // Fallback: assume it's already formatted
      return input;
    };

    const formattedPageId = extractNotionId(pageId);

    if (action === 'test') {
      // Test connection by retrieving page info
      try {
        await notion.pages.retrieve({ page_id: formattedPageId });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      } catch (error) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: error.message || 'Failed to connect to Notion'
          }),
        };
      }
    } else if (action === 'add') {
      if (!text || !text.trim()) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Text is required' }),
        };
      }

      try {
        // Add text as a new paragraph block (no timestamp, just the word)
        await notion.blocks.children.append({
          block_id: formattedPageId,
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: text.trim(),
                    },
                  },
                ],
              },
            },
          ],
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      } catch (error) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: error.message || 'Failed to add to Notion'
          }),
        };
      }
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid action' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
