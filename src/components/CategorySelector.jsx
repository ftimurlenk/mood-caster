import React, { useState } from 'react';
import styles from './Selector.module.css';

const CATEGORIES = [
  // Time-based
  'Good Morning ☀️',
  'Good Night 🌙',
  'Weekend Vibes 🎉',
  
  // Web3 & Crypto
  'Building in Web3 🛠️',
  'DeFi Thoughts 💹',
  'NFT / Art Talk 🎨',
  'On-Chain Data 📊',
  'Meme Coin Talk 🚀',
  'Gaming & Metaverse 🎮',
  'DAO Discussions 🏛️',
  'Crypto News 📰',
  'Token Launch 🪙',
  
  // Tech
  'Tech Talk 💻',
  'Fun Fact 💡',
  
  // General Interest
  'Personal Growth 🌱',
  'Business & Startup 💼',
  'Health & Wellness 🧘',
  'Sports & Fitness ⚽',
  'Music & Entertainment 🎵',
  
  // Social & Engagement
  'Community Call 📣',
  'Hot Take 🔥',
  'Unpopular Opinion 💭',
  'Story Time 📖',
  'Question of the Day ❓',
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
