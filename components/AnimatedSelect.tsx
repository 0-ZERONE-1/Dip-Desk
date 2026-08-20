'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

interface Props {
  options: SelectOption[];
  value: string | number;
  onChange: (val: any) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export default function AnimatedSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  className = '',
  id,
  disabled = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`} id={id}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 px-4 py-2.5 bg-white border rounded-2xl text-xs sm:text-sm font-semibold text-gray-700 shadow-2xs hover:border-primary-400 hover:shadow-md hover:shadow-primary-500/5 focus:outline-none transition-all duration-200 ${
          isOpen ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-md' : 'border-surface-200/90'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-shrink-0 text-gray-400"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.7 }}
            className="absolute left-0 right-0 sm:left-auto sm:right-auto sm:min-w-[220px] w-full z-50 bg-white/95 backdrop-blur-xl border border-surface-200/90 rounded-2xl shadow-xl shadow-primary-950/10 overflow-hidden py-1.5 my-1"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar px-1 space-y-0.5">
              {options.map((option) => {
                const isSelected = String(option.value) === String(value);
                return (
                  <motion.button
                    key={String(option.value)}
                    type="button"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 text-left ${
                      isSelected
                        ? 'bg-primary-50 text-primary-700 font-bold'
                        : 'text-gray-600 hover:bg-surface-100/80 hover:text-gray-900'
                    }`}
                  >
                    <span className="truncate flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      >
                        <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
