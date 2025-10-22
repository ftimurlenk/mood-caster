import React from 'react';
import styles from './Selector.module.css';

const CATEGORIES = ['Good Morning ☀️', 'Project Update 🚀', 'Fun Fact 💡', 'Hot Take 🔥'];

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