'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn, categoryIcon } from '@/lib/utils';
import Fuse from 'fuse.js';

interface SearchResult {
  _id: string;
  title: string;
  category: string;
  subject: { name: string; slug: string; semesterNumber: number };
  department: { name: string; slug: string };
}

export default function NavbarSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allResources, setAllResources] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load search index on focus/interaction
  const loadSearchIndex = useCallback(() => {
    if (allResources.length === 0 && !loading) {
      setLoading(true);
      fetch('/api/resources/search-index')
        .then((r) => r.json())
        .then((data) => {
          setAllResources(data.resources || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [allResources.length, loading]);

  const handleFocus = () => {
    setIsOpen(true);
    loadSearchIndex();
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        loadSearchIndex();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDownGlobal);
    return () => document.removeEventListener('keydown', handleKeyDownGlobal);
  }, [loadSearchIndex]);

  // Perform fuzzy search as query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (allResources.length > 0) {
      const fuse = new Fuse(allResources, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'subject.name', weight: 1.5 },
          { name: 'category', weight: 1 },
          { name: 'department.name', weight: 0.8 },
        ],
        threshold: 0.4,        // looser match (0 = exact, 1 = match anything)
        distance: 200,          // search further into the string
        minMatchCharLength: 2,  // skip single-char queries
        useExtendedSearch: false,
        includeScore: true,
        ignoreLocation: true,   // match anywhere in the string, not just start
      });
      const fuseResults = fuse.search(query).slice(0, 8);
      setResults(fuseResults.map((r) => r.item));
      setSelected(0);
    }
  }, [query, allResources]);

  const navigateToResource = useCallback(
    (resource: SearchResult) => {
      const { department, subject, _id, category } = resource as any;
      if (category === 'Subject') {
        router.push(`/${department.slug}/semester-${subject.semesterNumber}/${subject.slug}`);
      } else {
        router.push(
          `/${department.slug}/semester-${subject.semesterNumber}/${subject.slug}?resource=${_id}`
        );
      }
      setIsOpen(false);
      setQuery('');
      inputRef.current?.blur();
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      if (results[selected]) {
        e.preventDefault();
        navigateToResource(results[selected]);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-64 md:w-72 lg:w-80">
      {/* Search Input Box */}
      <div
        className={cn(
          'flex items-center gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border transition-all duration-200 bg-surface-50',
          isOpen
            ? 'bg-white border-primary-500 ring-2 ring-primary-500/20 shadow-sm'
            : 'border-surface-200 hover:border-surface-300 hover:bg-surface-100/70'
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 text-primary-500 animate-spin flex-shrink-0" />
        ) : (
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}

        <input
          ref={inputRef}
          type="text"
          id="global-search-input"
          placeholder="Search resources..."
          value={query}
          onFocus={handleFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full text-xs sm:text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="text-gray-400 hover:text-gray-600 p-0.5"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-3 top-16 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:inset-x-auto sm:mt-2 w-auto sm:w-[400px] md:w-[440px] max-w-full bg-white rounded-2xl shadow-2xl border border-surface-200 z-50 overflow-hidden"
          >
            {/* Header / Status Bar */}
            <div className="px-4 py-2.5 bg-surface-50 border-b border-surface-100 flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium text-gray-700">
                {query ? 'Search Suggestions' : 'Quick Search'}
              </span>
              <span>{results.length > 0 ? `${results.length} found` : ''}</span>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {query && results.length === 0 && !loading && (
                <div className="py-8 px-4 text-center">
                  <p className="text-gray-600 text-sm font-medium">No results found for &quot;{query}&quot;</p>
                  <p className="text-gray-400 text-xs mt-1">Try searching for subject names, books, or note topics</p>
                </div>
              )}

              {results.map((result, i) => (
                <button
                  key={result._id}
                  onClick={() => navigateToResource(result)}
                  onMouseEnter={() => setSelected(i)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-surface-100/60 last:border-0',
                    i === selected ? 'bg-primary-50/80' : 'hover:bg-surface-50'
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-base flex-shrink-0 mt-0.5 shadow-sm">
                    {categoryIcon(result.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{result.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {result.department.name} · Sem {result.subject.semesterNumber} · {result.subject.name}
                    </p>
                  </div>
                  <span className="badge-primary text-[10px] uppercase font-bold flex-shrink-0 self-center">
                    {result.category}
                  </span>
                </button>
              ))}

              {!query && !loading && (
                <div className="py-6 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-2">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Type to search resources</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Find notes, books, lab manuals, and question papers instantly
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
