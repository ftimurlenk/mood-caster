// src/App.jsx
import React, { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import styles from './App.module.css';

import MoodSelector from './components/MoodSelector';
import CategorySelector from './components/CategorySelector';
import GeneratedPost from './components/GeneratedPost';

function App() {
  // Uygulama mantığı state'leri
  const [step, setStep] = useState('mood');
  const [mood, setMood] = useState('');
  const [category, setCategory] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- YALNIZCA BU useEffect KULLANILACAK ---
  useEffect(() => {
    // Farcaster ortamında (preview tool veya client) olduğumuzu varsayarak
    // doğrudan ready() çağırıyoruz.
    sdk.actions.ready().catch((err) => {
      // Normal tarayıcıda bu hata görünecektir, bu normaldir.
      console.warn("Failed to call sdk.actions.ready(). Are you in a Farcaster client?", err);
    });
  }, []);
  // --- DEĞİŞİKLİK SONU ---

  // --- Diğer fonksiyonlar (değişiklik yok) ---
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

  // --- RENDER KISMI (Fallback'ler kaldırıldı) ---
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