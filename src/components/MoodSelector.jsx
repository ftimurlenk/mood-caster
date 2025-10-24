import React, { useState } from 'react';
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
  const [selectedMood, setSelectedMood] = useState(null);

  const handleSelect = (mood) => {
    setSelectedMood(mood);
    // Small delay for better UX
    setTimeout(() => {
      onSelect(mood);
    }, 150);
  };

  return (
    <div className={styles.wrapper}>
      <h2>How are you feeling?</h2>
      <div className={styles.grid}>
        {MOODS.map((mood) => (
          <button
            key={mood}
            className={`${styles.button} ${selectedMood === mood ? styles.selected : ''}`}
            onClick={() => handleSelect(mood)}
          >
            {mood}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MoodSelector;