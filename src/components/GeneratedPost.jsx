import React from 'react';
import styles from './GeneratedPost.module.css';

function GeneratedPost({ post, onCast, onReset, onRegenerate }) {
  return (
    <div className={styles.wrapper}>
      <h2>Your AI Cast:</h2>
      <textarea
        className={styles.postText}
        value={post}
        readOnly
      />
      <div className={styles.buttonGroup}>
  {/* Ana Buton (Cast) */}
  <button
    className={`${styles.button} ${styles.castButton}`}
    onClick={onCast}
  >
    Cast on Farcaster
  </button>

  {/* İkincil Buton Grubu */}
  <div className={styles.secondaryButtonGroup}>
    <button
      className={`${styles.button} ${styles.resetButton}`}
      onClick={onReset}
    >
      Start Over
    </button>
    {/* YENİ BUTON */}
    <button
      className={`${styles.button} ${styles.resetButton}`} // 'Start Over' ile aynı stili kullanacak
      onClick={onRegenerate}
    >
      Regenerate 🎲
    </button>
  </div>
</div>
    </div>
  );
}

export default GeneratedPost;