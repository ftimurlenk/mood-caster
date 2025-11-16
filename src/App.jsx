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
  const [farcasterContext, setFarcasterContext] = useState(null);
  const [isInFarcaster, setIsInFarcaster] = useState(false);

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        const originalError = console.error;
        console.error = (...args) => {
          const msg = args[0]?.toString() || '';
          if (!msg.includes('Authorization') && !msg.includes('token')) {
            originalError(...args);
          }
        };

        await sdk.actions.ready();
        
        const context = await sdk.context;
        
        console.error = originalError;
        
        if (context?.user?.fid) {
          setFarcasterContext(context);
          setIsInFarcaster(true);
          console.log('[v0] Farcaster context loaded:', {
            user: context.user.fid,
            location: context.location
          });
        }
      } catch (err) {
        try {
          await sdk.actions.ready();
        } catch (readyErr) {
          // Silently fail in non-Farcaster environments
        }
        setIsInFarcaster(false);
      }
    };

    initializeFarcaster();
  }, []);

  const handleMoodSelect = (selectedMood) => {
    setMood(selectedMood);
    setStep('category');
  };

  const handleBackToMood = () => {
    setStep('mood');
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

  const handleRegenerate = () => {
    generatePost(mood, category);
  };

  const generatePost = async (mood, category) => {
    setIsLoading(true);
    setError('');
    setGeneratedPost('');
    
    console.log('[v0] Generating post for mood:', mood, 'category:', category);
    
    try {
      const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          'Cache-Control': 'no-cache',
          ...(farcasterContext?.user?.fid && {
            'X-Farcaster-FID': farcasterContext.user.fid.toString()
          })
        },
        body: JSON.stringify({ 
          mood, 
          category,
          fid: farcasterContext?.user?.fid 
        }),
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

      console.log('[v0] Post generated successfully');
      setGeneratedPost(data.post);
    } catch (err) {
      console.error('[v0] Error generating post:', err.message);
      setError(err.message || 'Failed to generate post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCast = async () => {
    if (!generatedPost) return;
    
    try {
      if (isInFarcaster && farcasterContext?.user?.fid) {
        await sdk.actions.composeCast({
          text: generatedPost,
          embeds: [{
            url: 'https://mood-caster.vercel.app'
          }]
        });
      } else {
        const encodedText = encodeURIComponent(generatedPost);
        window.open(`https://warpcast.com/~/compose?text=${encodedText}`, '_blank');
      }
    } catch (err) {
      const encodedText = encodeURIComponent(generatedPost);
      window.open(`https://warpcast.com/~/compose?text=${encodedText}`, '_blank');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          MoodCaster
          {isInFarcaster && <span className={styles.baseBadge}>on Base</span>}
        </div>
        
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
      <div className={styles.footer}>
        MoodCaster App for Base
        {farcasterContext?.user?.fid && (
          <span className={styles.fid}> · FID: {farcasterContext.user.fid}</span>
        )}
      </div>
    </div>
  );
}

export default App;
