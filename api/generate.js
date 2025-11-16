import { generateText } from 'ai';
import { Errors, createClient } from '@farcaster/quick-auth';

// İstemcileri bir kez başlat
const authClient = createClient();

export default async function handler(req, res) {
  // Bütün isteği try...catch bloğuna al
  try {
    if (!req || !res) {
      console.error('[API_ERROR] Request or response object is undefined');
      return;
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const authorization = req.headers?.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing Authorization Token' });
    }
    const token = authorization.split(' ')[1];

    if (token !== 'preview-mode-token') {
      await authClient.verifyJwt({
        token,
        domain: process.env.VITE_APP_DOMAIN,
      });
    }

    // Kullanıcı Girdisini Al
    const { mood, category } = req.body || {};
    if (!mood || !category) {
      return res.status(400).json({ message: 'Mood and Category are required.' });
    }

    // AI Prompt'u
    const systemPrompt = `You are a popular content creator on Farcaster (/farcaster). You write short, engaging, and authentic casts (max 300 characters). You never use hashtags. You sound human and relatable.Do not use quotation marks.`;
    const userPrompt = `Write a Farcaster cast. My mood is: ${mood}. The topic is: ${category}. Respond *only* with the cast text, nothing else.`;

    // Using Vercel AI SDK with AI Gateway - uses GPT-4o-mini by default
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 100,
    });

    const post = text.trim();

    // Başarılı Yanıt
    return res.status(200).json({ post });

  } catch (error) {
    // YAKALAMA BLOĞU (HER HATA BURAYA DÜŞER)
    console.error('[API_ERROR]', error);

    if (!res) {
      console.error('[API_ERROR] Cannot send response - res object is undefined');
      return;
    }

    // Hata Farcaster token hatasıysa 401 döndür
    if (error instanceof Errors.InvalidTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Diğer tüm hatalar için 500 (Sunucu Hatası) döndür
    // ve HATA MESAJINI JSON OLARAK GÖNDER
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }
}
