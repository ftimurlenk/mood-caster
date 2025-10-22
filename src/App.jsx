// src/App.jsx
import React, { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import styles from './App.module.css'; // We will create this

import MoodSelector from './components/MoodSelector';
import CategorySelector from './components/CategorySelector';
import GeneratedPost from './components/GeneratedPost';

function App() {
  const [step, setStep] = useState('mood'); // 'mood', 'category', 'post'
  const [mood, setMood] = useState('');
  const [category, setCategory] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Signal Farcaster client that the app is ready [cite: 20]
  useEffect(() => {
    sdk.actions.ready().catch((err) => console.error("SDK Ready Error:", err));
  }, []);

  const handleMoodSelect = (selectedMood) => {
    setMood(selectedMood);
    setStep('category');
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setStep('post');
    // Trigger AI post generation
    generatePost(mood, selectedCategory);
  };

  const handleReset = () => {
    setStep('mood');
    setMood('');
    setCategory('');
    setGeneratedPost('');
    setError('');
  };

  // 2. Generate AI Post (using Groq)
  const generatePost = async (mood, category) => {
    setIsLoading(true);
    setError('');
    try {
      // Use quickAuth.fetch to make an authenticated request to our backend [cite: 498, 706]
      // This automatically gets and includes the JWT token.
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

  // 3. Cast on Farcaster
  const handleCast = async () => {
    if (!generatedPost) return;

    try {
      // Open the native composer [cite: 614]
      await sdk.actions.composeCast({
        text: generatedPost,
        embeds: [window.location.href], // Embed a link back to the app [cite: 620]
      });
    } catch (err) {
      console.error('Cast composition failed:', err);
    }
  };

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