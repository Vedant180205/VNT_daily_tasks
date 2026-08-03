import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { autocompletePlayer } from '../../api/playerApi';
import type { AutocompleteResult } from '../../api/playerApi';
import { useDebounce } from '../../hooks/useDebounce';
import { cn } from '../../utils/cn';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the input for autocomplete queries (shorter delay = snappier feel)
  const debouncedValue = useDebounce(localValue, 180);

  // Sync external value (e.g., when user clears via URL)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Fetch autocomplete suggestions from Redis
  useEffect(() => {
    if (!debouncedValue || debouncedValue.length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    autocompletePlayer(debouncedValue)
      .then((results) => {
        if (!cancelled) {
          setSuggestions(results);
          setIsOpen(results.length > 0);
          setActiveIndex(-1);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions([]);
          setIsOpen(false);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocalValue(v);
    onChange(v);
  };

  const handleSelect = useCallback((suggestion: AutocompleteResult) => {
    // Capitalize each word since we store lowercase in Redis
    const displayName = suggestion.name
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    setLocalValue(displayName);
    onChange(displayName);
    setIsOpen(false);
    setSuggestions([]);
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full sm:max-w-md shrink-0">
      {/* Search Icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none z-10" />

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Search players..."
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        className="flex h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-white pl-9 pr-9 py-2 text-[15px] text-text ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm"
        autoComplete="off"
      />

      {/* Right-side icon: loader or clear button */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center">
        {isLoading ? (
          <Loader2 className="h-4 w-4 text-muted animate-spin" />
        ) : localValue ? (
          <button
            onClick={handleClear}
            className="text-muted hover:text-text transition-colors"
            tabIndex={-1}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_8px_30px_rgba(15,23,42,0.1)] z-50 overflow-hidden">
          <ul role="listbox" className="py-1 max-h-56 overflow-y-auto">
            {suggestions.map((s, i) => {
              const displayName = s.name
                .split(' ')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');

              // Highlight the matching prefix
              const matchEnd = localValue.length;
              const highlighted = displayName.slice(0, matchEnd);
              const rest = displayName.slice(matchEnd);

              return (
                <li
                  key={s.id}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseDown={() => handleSelect(s)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 cursor-pointer text-[14px] transition-colors select-none',
                    i === activeIndex
                      ? 'bg-primary/8 text-primary'
                      : 'text-text hover:bg-gray-50'
                  )}
                >
                  {/* Avatar placeholder */}
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Search className="w-3 h-3 text-primary/60" />
                  </div>
                  <span>
                    <span className="font-semibold">{highlighted}</span>
                    <span className="text-muted">{rest}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="px-4 py-1.5 border-t border-gray-50 text-[11px] text-muted/60 text-right">
            Powered by Redis ⚡
          </div>
        </div>
      )}
    </div>
  );
};
