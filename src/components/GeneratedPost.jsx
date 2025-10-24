import React from 'react';
import styles from './GeneratedPost.module.css';

function GeneratedPost({ post, onCast, onReset, onRegenerate }) {
  return (
    <div className={styles.wrapper}>
      <h2>Your AI Cast</h2>
      <div className={styles.postCard}>
        <textarea
          className={styles.postText}
          value={post}
          readOnly
        />
      </div>
      <div className={styles.buttonGroup}>
        {/* Ana Buton (Cast) */}
        <button
          className={`${styles.button} ${styles.castButton}`}
          onClick={onCast}
        >
          <span className={styles.icon}>📤</span>
          Cast on Farcaster
        </button>

        {/* İkincil Buton Grubu */}
        <div className={styles.secondaryButtonGroup}>
          <button
            className={`${styles.button} ${styles.resetButton}`}
            onClick={onReset}
          >
            <span className={styles.icon}>🔄</span>
            Start Over
          </button>
          {/* YENİ BUTON */}
          <button
            className={`${styles.button} ${styles.resetButton}`}
            onClick={onRegenerate}
          >
            <span className={styles.icon}>🎲</span>
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}

export default GeneratedPost;