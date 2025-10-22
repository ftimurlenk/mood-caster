import React from 'react';
import styles from './Selector.module.css';

// Seçenekleri artırdık
const MOODS = [
  'Happy 😊',
  'Calm 🧘',
  'Excited 🤩',
  'Thoughtful 🤔',
  'Grateful 🙏',
  'Curious 🧐',
  'Energetic ⚡',
  'Focused 💻',
];

function MoodSelector({ onSelect }) {
  return (
    <div className={styles.wrapper}>
      <h2>How are you feeling?</h2>
      <div className={styles.grid}>
        {MOODS.map((mood) => (
          <button
            key={mood}
            className={styles.button}
            onClick={() => onSelect(mood)}
          >
            {mood}
          </button>
        ))}
      </div>
    </div>
  );
}
export default MoodSelector;