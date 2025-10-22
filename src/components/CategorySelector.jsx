import React from 'react';
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