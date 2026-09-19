import { useState } from 'react';
import type { SpotWithLocation } from '../api/types';
import { searchSpots, type SearchResult } from '../lib/search';

interface SearchBoxProps {
  spots: SpotWithLocation[];
  onSelect: (result: SearchResult) => void;
}

export function SearchBox({ spots, onSelect }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = searchSpots(spots, query);

  function select(result: SearchResult) {
    onSelect(result);
    setQuery(result.label);
    setOpen(false);
  }

  return (
    <div className="search-box">
      <input
        type="search"
        className="search-box__input"
        placeholder="Buscar spot o zona…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) select(results[0]);
          if (e.key === 'Escape') setOpen(false);
        }}
      />
      {open && results.length > 0 && (
        <ul className="search-box__results">
          {results.map((result) => (
            <li key={`${result.type}-${result.key}`}>
              <button
                type="button"
                className="search-box__result"
                onMouseDown={(e) => e.preventDefault()} // fire before the input's onBlur closes the list
                onClick={() => select(result)}
              >
                <span className="search-box__result-icon">{result.type === 'spot' ? '📍' : '🗺️'}</span>
                <span className="search-box__result-text">
                  <span className="search-box__result-label">{result.label}</span>
                  <span className="search-box__result-sublabel">{result.sublabel}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
