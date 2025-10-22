import React from 'react';
import styles from './GeneratedPost.module.css';

function GeneratedPost({ post, onCast, onReset }) {
  return (
    <div className={styles.wrapper}>
      <h2>Your AI Cast:</h2>
      <textarea
        className={styles.postText}
        value={post}
        readOnly
      />
      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${styles.resetButton}`}
          onClick={onReset}
        >
          Start Over
        </button>
        <button
          className={`${styles.button} ${styles.castButton}`}
          onClick={onCast}
        >
          Cast on Farcaster
        </button>
      </div>
    </div>
  );
}

export default GeneratedPost;