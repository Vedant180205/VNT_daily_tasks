import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/Input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="relative w-full sm:max-w-md shrink-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
      <Input 
        type="text" 
        placeholder="Search players..." 
        className="pl-9 w-full"
        value={localValue}
        onChange={handleChange}
      />
    </div>
  );
};
