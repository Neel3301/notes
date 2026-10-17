import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AppHeader from '../components/layout/AppHeader';
import MenuItem from '../components/ui/MenuItem';

/**
 * MenuScreen component
 * Full-screen navigation overlay.
 * Uses Framer Motion for a smooth fade-and-slide-up transition.
 * Features typographic menu items with right arrow active indicators.
 *
 * All content received via props according to project rules.
 */
export default function MenuScreen({
  header = { left: 'close', logo: '.edsy' },
  items = [],
  activeId,
  onClose,
  onNavigate,
  className = '',
}) {
  const [selectedId, setSelectedId] = useState(
    activeId || items.find((item) => item.active)?.id || 'menu-courses'
  );

  const handleSelect = (item) => {
    setSelectedId(item.id);
    onNavigate?.(item);
  };

  const containerVariants = {
    hidden: { opacity: 0.9, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: 8,
      transition: { duration: 0.15, ease: 'easeIn' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`w-full min-h-screen bg-screen text-text-primary px-5 pt-3 pb-16 flex flex-col justify-between select-none ${className}`}
    >
      {/* Top Header */}
      <AppHeader
        left={header.left || 'close'}
        logo={header.logo || '.edsy'}
        onLeftClick={onClose}
      />

      {/* Menu items list anchored in lower-middle section matching menu.jpg */}
      <div className="w-full flex flex-col gap-1.5 mt-auto pb-12">
        {items.map((item) => (
          <MenuItem
            key={item.id}
            label={item.label}
            active={selectedId === item.id}
            onClick={() => handleSelect(item)}
          />
        ))}
      </div>
    </motion.div>
  );
}
