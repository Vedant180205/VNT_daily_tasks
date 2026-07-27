import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, Sun } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const TopNavbar: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchValue, setSearchValue] = useState(initialSearch);

  // Sync with URL if it changes externally
  useEffect(() => {
    setSearchValue(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('search', val);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
    <header className="h-[72px] bg-background flex items-center justify-between px-8 border-b border-border sticky top-0 z-40">
      <div className="flex items-center gap-6 flex-1">
        <button className="text-muted hover:text-text transition-colors">
          <Menu size={24} strokeWidth={1.5} />
        </button>
        
        {/* Search Bar matching design */}
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <Search size={18} strokeWidth={2} />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search players..."
            className="w-full bg-white border border-border text-text text-sm rounded-xl pl-10 pr-12 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
              ⌘ K
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-muted hover:text-text transition-colors">
          <Bell size={20} strokeWidth={1.5} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
        </button>
        
        <button className="text-muted hover:text-text transition-colors">
          <Sun size={20} strokeWidth={1.5} />
        </button>
        
        <div className="flex items-center gap-2 pl-4 border-l border-border cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
            A
          </div>
          <span className="text-sm font-semibold text-text hidden sm:block">Admin</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted hidden sm:block">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </header>
  );
};
