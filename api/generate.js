// /api/generate.js
import { Groq } from 'groq-sdk';
import { Errors, createClient } from '@farcaster/quick-auth';

// İstemcileri bir kez başlat
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const authClient = createClient();

export default async function handler(req, res) {
  // Bütün isteği try...catch bloğuna al
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 1. API Anahtarını Kontrol Et (En olası hata kaynağı)
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not set in Vercel.');
      throw new Error('AI service is not configured.');
    }

    // 2. Farcaster Kullanıcısını Doğrula
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing Authorization Token' });
    }
    const token = authorization.split(' ')[1];

    await authClient.verifyJwt({
      token,
      domain: process.env.VITE_APP_DOMAIN,
    });

    // 3. Kullanıcı Girdisini Al
    const { mood, category } = req.body;
    if (!mood || !category) {
      return res.status(400).json({ message: 'Mood and Category are required.' });
    }

    // 4. AI Prompt'u
    const systemPrompt = `You are a popular content creator on Farcaster (/farcaster). You write short, engaging, and authentic casts (max 300 characters). You never use hashtags. You sound human and relatable.`;
    const userPrompt = `Write a Farcaster cast. My mood is: ${mood}. The topic is: ${category}. Respond *only* with the cast text, nothing else.`;

    // 5. Groq API Çağrısı
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 100,
    });

    const post = completion.choices[0]?.message?.content?.trim() || '';

    // 6. Başarılı Yanıt
    return res.status(200).json({ post });

  } catch (error) {
    // 7. YAKALAMA BLOĞU (HER HATA BURAYA DÜŞER)
    console.error('[API_ERROR]', error);

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