// src/App.jsx
import React, { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import styles from './App.module.css';

import MoodSelector from './components/MoodSelector';
import CategorySelector from './components/CategorySelector';
import GeneratedPost from './components/GeneratedPost';

// Hata durumunda (veya normal tarayıcıda) gösterilecek component
function FallbackComponent() {
  return (
    <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div className={styles.header}>MoodCaster</div>
      <p style={{ textAlign: 'center', fontSize: '18px', color: '#333' }}>
        This app is built for Farcaster.<br/><br/>
        Please open it in a Farcaster client like Warpcast to use it.
      </p>
    </div>
  );
}

function App() {
  const [isMiniApp, setIsMiniApp] = useState(false); // Farcaster içinde mi?
  const [isReady, setIsReady] = useState(false); // Hazır mı?

  const [step, setStep] = useState('mood');
  const [mood, setMood] = useState('');
  const [category, setCategory] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Farcaster host'una bağlanmayı denemek için kısa bir gecikme verelim.
    // Bu, 'ready not called' hatasını ve race condition'ı önler.
    const timer = setTimeout(() => {
      sdk.actions.ready()
        .then(() => {
          // Başarılı! Farcaster host'u (Preview veya Client) içindeyiz.
          setIsMiniApp(true);
          setIsReady(true);
        })
        .catch((err) => {
          // Başarısız. Normal bir tarayıcıdayız.
          console.warn("Farcaster SDK failed to initialize.", err);
          setIsMiniApp(false);
          setIsReady(true);
        });
    }, 100); // 100ms gecikme

    return () => clearTimeout(timer); // cleanup
  }, []);

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

  // 1. SDK kontrol edilirken yükleme ekranı göster
  if (!isReady) {
    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  // 2. SDK hazırsa ve Farcaster içinde DEĞİLSEK, uyarı göster
  if (isReady && !isMiniApp) {
    return <FallbackComponent />;
  }

  // 3. SDK hazırsa ve Farcaster içindeysek, uygulamayı göster
  return (
    <div className={styles.container}>
      <div className={styles.header}>MoodCaster</div>
      
      {step === 'mood' && <MoodSelector onSelect={handleMoodSelect} />}
      
      {step === 'category' && (
        <CategorySelector onSelect={handleCategorySelect} />
      )}
      
      {/* "..." SORUNUNU ÇÖZEN EKSİK BLOK BURADA */}
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