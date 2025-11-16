import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-farcaster-fid, x-request-id');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mood, category, fid } = req.body;

    console.log('[v0] API called, Farcaster FID:', fid || 'none');
    console.log('[v0] Generating for mood:', mood, 'category:', category);

    if (!mood || !category) {
      return res.status(400).json({ error: 'Mood and category are required' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.error('[v0] Groq API key is missing');
      return res.status(500).json({ error: 'API key not configured' });
    }

    const randomSeed = Math.floor(Math.random() * 10000000);
    const randomPromptVariation = Math.floor(Math.random() * 3);
    
    const promptVariations = [
      `Create a completely unique Farcaster cast about ${category} with a ${mood} mood. Make it creative and different.`,
      `Write an original take on ${category} that captures the feeling of being ${mood}. Be unexpected and authentic.`,
      `Express thoughts about ${category} in a ${mood} way. Make it fresh, unique, and conversational.`
    ];

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a creative Farcaster cast writer for Base Network. Write unique, varied content every time.

Rules:
- NEVER repeat phrases, structures, or patterns
- Use completely different vocabulary and perspectives each time
- Keep under 280 characters
- Include 1-3 emojis naturally
- Be authentic and conversational
- Vary sentence length and structure`
          },
          {
            role: 'user',
            content: promptVariations[randomPromptVariation]
          }
        ],
        temperature: 1.4,
        max_tokens: 150,
        top_p: 0.95,
        frequency_penalty: 1.2,
        presence_penalty: 0.9,
        seed: randomSeed
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('[v0] Groq API error:', errorText);
      
      if (groqResponse.status === 401) {
        return res.status(500).json({ error: 'Invalid API key configuration' });
      }
      
      return res.status(500).json({ error: 'Failed to generate post' });
    }

    const data = await groqResponse.json();
    console.log('[v0] Groq API call successful');

    let generatedText = data.choices?.[0]?.message?.content || '';
    generatedText = generatedText.replace(/\s*\d{10,}\s*$/g, '').trim();
    
    console.log('[v0] Generated post:', generatedText);

    return res.status(200).json({ post: generatedText });
  } catch (error) {
    console.error('[v0] Error in generate API:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate post' 
    });
  }
}
