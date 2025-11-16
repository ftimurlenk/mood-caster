import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Missing Authorization Token' },
        { status: 401 }
      );
    }

    const token = authorization.split(' ')[1];
    const isPreviewMode = token === 'preview-mode-token';
    
    console.log('[v0] API called, preview mode:', isPreviewMode);
    console.log('[v0] Groq API Key exists:', !!process.env.GROQ_API_KEY);

    const body = await req.json();
    const { mood, category } = body;

    if (!mood || !category) {
      return NextResponse.json(
        { message: 'Mood and Category are required.' },
        { status: 400 }
      );
    }

    console.log('[v0] Generating for mood:', mood, 'category:', category);
    
    const randomSeed = Math.floor(Math.random() * 1000000);
    
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a creative content creator on Farcaster. Write unique, diverse, and authentic casts (max 300 characters). NEVER repeat phrases or patterns. Each cast must be completely different. Be creative, vary your style, perspective, and topics. Never use hashtags. Sound natural and human.',
          },
          {
            role: 'user',
            content: `Write a unique Farcaster cast about ${category} with a ${mood} mood. Make it completely different from typical posts. Vary your approach: use questions, observations, stories, humor, or insights. Seed: ${randomSeed}. Only respond with the cast text.`,
          },
        ],
        temperature: 1.2, // Increased from 0.7 to 1.2 for more creativity
        max_tokens: 100,
        top_p: 0.95,
        frequency_penalty: 1.5, // Added to discourage repetition
        presence_penalty: 1.2, // Added to encourage new topics
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('[v0] Groq API error:', errorText);
      throw new Error(`Groq API error: ${errorText}`);
    }

    const groqData = await groqResponse.json();
    console.log('[v0] Groq API call successful');
    
    const post = groqData.choices[0]?.message?.content?.trim() || '';
    console.log('[v0] Generated post:', post);

    return NextResponse.json({ post }, { status: 200 });

  } catch (error: any) {
    console.error('[v0] API error details:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
