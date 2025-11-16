import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-farcaster-fid');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mood, category, fid } = req.body;

    console.log('[v0] Generate API called with:', { mood, category, fid });

    if (!mood || !category) {
      console.log('[v0] Missing mood or category');
      return res.status(400).json({ error: 'Mood and category are required' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.error('[v0] Groq API key is missing');
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log('[v0] Calling Groq API...');

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
            content: `You are a creative Farcaster cast generator for Base Network community. Create engaging, authentic posts that reflect the mood and topic. Be creative, use varied language, and make each post unique. Include emojis naturally. Keep it under 280 characters. ${fid ? `User FID: ${fid}` : ''}`
          },
          {
            role: 'user',
            content: `Create a unique Farcaster cast for mood: ${mood} and topic: ${category}. Timestamp: ${Date.now()}`
          }
        ],
        temperature: 1.2,
        max_tokens: 200,
        frequency_penalty: 0.8,
        presence_penalty: 0.6,
        seed: Math.floor(Math.random() * 1000000)
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

    const generatedText = data.choices?.[0]?.message?.content || '';

    return res.status(200).json({ post: generatedText });
  } catch (error) {
    console.error('[v0] Error in generate API:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate post' 
    });
  }
}
