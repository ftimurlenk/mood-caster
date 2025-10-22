// /api/generate.js (Example for Vercel Serverless Function)

import { Groq } from 'groq-sdk';
import { Errors, createClient } from '@farcaster/quick-auth';

// 1. Initialize Clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const authClient = createClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 2. Authenticate the Farcaster user [cite: 737]
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing Authorization Token' });
    }
    const token = authorization.split(' ')[1];

    // Verify the JWT [cite: 732]
    // VITE_APP_DOMAIN must be set in your Vercel env variables
    await authClient.verifyJwt({
      token,
      domain: process.env.VITE_APP_DOMAIN,
    }); [cite: 738]
    // 3. Get input from the user
    const { mood, category } = req.body;
    if (!mood || !category) {
      return res.status(400).json({ message: 'Mood and Category are required.' });
    }

    // 4. Generate AI Prompt for Groq
    const systemPrompt = `You are a popular content creator on Farcaster (/farcaster). You write short, engaging, and authentic casts (max 300 characters). You never use hashtags. You sound human and relatable.`;
    
    const userPrompt = `Write a Farcaster cast. My mood is: ${mood}. The topic is: ${category}. Respond *only* with the cast text, nothing else.`;

    // 5. Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      model: 'llama3-8b-8192', // Use a fast model
      temperature: 0.7,
      max_tokens: 100, // Max 300 chars is ~75 tokens
    });

    const post = completion.choices[0]?.message?.content?.trim() || '';

    // 6. Send Response
    res.status(200).json({ post });

  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof Errors.InvalidTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Error generating post.' });
  }
}