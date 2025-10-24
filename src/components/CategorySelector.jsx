import React, { useState } from 'react';
import styles from './Selector.module.css';

const CATEGORIES = [
  'Good Morning ☀️',
  'Good Night 🌙',
  'Building in Web3 🛠️',
  'NFT / Art Talk 🎨',
  'Fun Fact 💡',
  'DeFi Thoughts 💹',
  'Tech Talk 💻',
  'On-Chain Data 📊',
  'Community Call 📣',
];

function CategorySelector({ onSelect, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSelect = (category) => {
    setSelectedCategory(category);
    // Small delay for better UX
    setTimeout(() => {
      onSelect(category);
    }, 150);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerContainer}>
        <button className={styles.backButton} onClick={onBack}>
          ←
        </button>
        <h2>What's the topic?</h2>
      </div>
      <div className={styles.grid}>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={`${styles.button} ${selectedCategory === category ? styles.selected : ''}`}
            onClick={() => handleSelect(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategorySelector;