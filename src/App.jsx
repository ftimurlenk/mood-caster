// src/App.jsx
import React, { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import styles from './App.module.css';

import MoodSelector from './components/MoodSelector';
import CategorySelector from './components/CategorySelector';
import GeneratedPost from './components/GeneratedPost';

function App() {
  const [step, setStep] = useState('mood');
  const [mood, setMood] = useState('');
  const [category, setCategory] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('[v0] Initializing SDK in background');
    sdk.actions.ready()
      .then(() => {
        console.log('[v0] SDK ready');
      })
      .catch((err) => {
        console.log('[v0] SDK not available, running in preview mode', err);
      });
  }, []);

  const handleMoodSelect = (selectedMood) => {
    console.log('[v0] Mood selected:', selectedMood);
    setMood(selectedMood);
    setStep('category');
  };

  const handleBackToMood = () => {
    setStep('mood');
  };

  const handleCategorySelect = (selectedCategory) => {
    console.log('[v0] Category selected:', selectedCategory);
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

  const handleRegenerate = () => {
    generatePost(mood, category);
  };

  const generatePost = async (mood, category) => {
    console.log('[v0] Generating post for mood:', mood, 'category:', category);
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer preview-mode-token'
        },
        body: JSON.stringify({ mood, category }),
      });

      console.log('[v0] Response status:', response.status);

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log('[v0] Got text response:', text);
        data = { message: text };
      }
      
      if (!response.ok) {
        const errorText = data.message || JSON.stringify(data);
        console.log('[v0] Error from API:', errorText);
        throw new Error(errorText);
      }

      console.log('[v0] Post generated successfully:', data.post);
      setGeneratedPost(data.post);
    } catch (err) {
      console.log('[v0] Error generating post:', err.message);
      setError(err.message || 'Failed to generate post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCast = async () => {
    if (!generatedPost) return;
    try {
      await sdk.actions.composeCast({
        text: generatedPost,
      });
    } catch (err) {
      console.error('Cast composition failed:', err);
      alert('Preview Mode: In Farcaster, this would open the cast composer.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>MoodCaster</div>
        
        <div className={styles.stepContainer}>
          {step === 'mood' && <MoodSelector onSelect={handleMoodSelect} />}
          
          {step === 'category' && (
            <CategorySelector 
              onSelect={handleCategorySelect} 
              onBack={handleBackToMood} 
            />
          )}
          
          {step === 'post' && (
            <>
              {isLoading && (
                <div className={styles.loading}>
                  <div className={styles.skeletonCard} style={{ height: '180px' }}></div>
                  <div className={styles.skeletonCard} style={{ height: '60px' }}></div>
                </div>
              )}
              {error && <div className={styles.error}>{error}</div>}
              {generatedPost && !isLoading && (
                <GeneratedPost
                  post={generatedPost}
                  mood={mood}
                  category={category}
                  onCast={handleCast}
                  onReset={handleReset}
                  onRegenerate={handleRegenerate}
                />
              )}
            </>
          )}
        </div>
      </div>
      <div className={styles.footer}>MoodCaster App for Base</div>
    </div>
  );
}

export default App;
