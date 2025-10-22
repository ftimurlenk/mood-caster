import React from 'react';
import styles from './Selector.module.css';

// Seçenekleri artırdık
const CATEGORIES = [
  'Good Morning ☀️',
  'Hot Take 🔥',
  'Project Update 🚀',
  'Sharing Work 🎨',
  'Fun Fact 💡',
  'Ask Me Anything ❓',
  'Tech Talk 💻',
  'Life Update ✌️',
];

function CategorySelector({ onSelect }) {
  return (
    <div className={styles.wrapper}>
      <h2>What's the topic?</h2>
      <div className={styles.grid}>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={styles.button}
            onClick={() => onSelect(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
export default CategorySelector;