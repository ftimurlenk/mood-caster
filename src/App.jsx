// src/App.jsx

import React, { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import styles from './App.module.css';

import MoodSelector from './components/MoodSelector';
import CategorySelector from './components/CategorySelector';
import GeneratedPost from './components/GeneratedPost';

// Tarayıcıda açıldığında gösterilecek yedek component
function FallbackComponent() {
  return (
    <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div className={styles.header}>MoodCaster</div>
      <p style={{ textAlign: 'center', fontSize: '18px', color: '#333' }}>
        Please open this app within a Farcaster client (like Warpcast) to use it.
      </p>
    </div>
  );
}

function App() {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [isCheckingContext, setIsCheckingContext] = useState(true);
  
  const [step, setStep] = useState('mood');
  const [mood, setMood] = useState('');
  const [category, setCategory] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- BU BÖLÜM DEĞİŞTİ ---
  useEffect(() => {
    async function initializeApp() {
      try {
        // 1. Her zaman 'ready' demeyi dene.
        // Farcaster hostu içindeyse (preview tool dahil) çalışacak.
        await sdk.actions.ready();
        
        // 2. 'ready' başarılı olduysa, burası bir Mini App ortamıdır.
        setIsMiniApp(true);

      } catch (error) {
        // 3. 'ready' başarısız olursa (hata atarsa), 
        // normal bir tarayıcıdayız demektir.
        console.warn("Farcaster SDK not found. Running in fallback mode.", error);
        setIsMiniApp(false);
      } finally {
        // 4. Ne olursa olsun, kontrol bitti.
        setIsCheckingContext(false);
      }
    }
    
    initializeApp();
  }, []);
  // --- DEĞİŞİKLİK SONU ---

  const handleMoodSelect = (selectedMood) => {
    setMood(selectedMood);
    setStep('category');
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setStep('post');
    generatePost(mood, selectedCategory);
  };

  const handleReset = () => {
    setStep('mood');
    setMood('');
    setCategory('');
    setGeneratedPost('');
    setError('');
  };

  const generatePost = async (mood, category) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await sdk.quickAuth.fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, category }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to generate post.');
      }
      const data = await response.json();
      setGeneratedPost(data.post);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCast = async () => {
    if (!generatedPost) return;
    try {
      await sdk.actions.composeCast({
        text: generatedPost,
        embeds: [window.location.href],
      });
    } catch (err) {
      console.error('Cast composition failed:', err);
    }
  };

  if (isCheckingContext) {
    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!isMiniApp) {
    return <FallbackComponent />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>MoodCaster</div>
      
      {step === 'mood' && <MoodSelector onSelect={handleMoodSelect} />}
      
      {step === 'category' && (
        <CategorySelector onSelect={handleCategorySelect} />
      )}
      
      {step === 'post' && (
        <>
          {isLoading && <div className={styles.loading}>Writing...</div>}
          {error && <div className={styles.error}>{error}</div>}
          {generatedPost && (
            <GeneratedPost
              post={generatedPost}
              onCast={handleCast}
              onReset={handleReset}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;