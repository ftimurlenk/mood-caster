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

    const randomSeed = Math.floor(Math.random() * 1000000);
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
            content: `You are a creative Farcaster cast writer for the Base Network community. Your goal is to create unique, engaging posts that feel authentic and human. 

Rules:
- Each cast must be completely different and original
- Match the mood and topic naturally
- Use varied vocabulary, sentence structures, and perspectives
- Include emojis naturally (1-3 max)
- Keep under 280 characters
- Never repeat phrases or patterns
- Be conversational and authentic
${fid ? `\nUser is a Base community member (FID: ${fid})` : ''}`
          },
          {
            role: 'user',
            content: `Write a completely unique and original Farcaster cast.
Mood: ${mood}
Topic: ${category}

Make it fresh, creative, and different from anything you've written before. Vary your style, tone, and approach.`
          }
        ],
        temperature: 1.3,
        max_tokens: 150,
        top_p: 0.95,
        frequency_penalty: 1.0,
        presence_penalty: 0.8,
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

    return res.status(200).json({ post: generatedText });
  } catch (error) {
    console.error('[v0] Error in generate API:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate post' 
    });
  }
}
