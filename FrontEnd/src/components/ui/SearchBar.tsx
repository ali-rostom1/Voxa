import { FC, useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

interface Video {
  id: string;
  title: string;
}

interface User {
  id: string;
  name: string;
}

interface SearchResult {
  type: 'video' | 'user';
  id: string;
  title?: string;
  name?: string;
}

export const SearchBar: FC<{ onSearch?: (query: string) => void }> = ({ onSearch }) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch search results from API
  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
      setIsDropdownOpen(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await apiClient.post(`/api/v1/search`,{
          search: query
        });
        const data = response.data.data;
        
        const searchResults: SearchResult[] = [
          ...(data.videos || []).map((video: Video) => ({
            type: 'video' as const,
            id: video.id,
            title: video.title,
          })),
          ...(data.users || []).map((user: User) => ({
            type: 'user' as const,
            id: user.id,
            name: user.name,
          })),
        ].slice(0,3);
        
        setResults(searchResults);
        setIsDropdownOpen(true);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults([]);
        setIsDropdownOpen(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
    setIsDropdownOpen(false);
  };

  const handleResultClick = (result: SearchResult) => {
    if(result.type === 'video'){
      router.push(`/watch/${result.id}`);
    }else{
      router.push(`/profile/${result.id}`);
    }
    setIsDropdownOpen(false);
    setQuery('');
  };

  return (
    <div className="relative flex-grow max-w-xl mx-4" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="search"
            className="w-full py-2 pl-10 pr-4 text-white bg-gray-800 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search Voxa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 0 && setIsDropdownOpen(true)}
          />
        </div>
      </form>

      {isDropdownOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result) => (
            <div
              key={result.id}
              className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white"
              onClick={() => handleResultClick(result)}
            >
              {result.type === 'video' ? (
                <div>
                  <span className="font-semibold">{result.title}</span>
                  <span className="block text-sm text-gray-400">Video</span>
                </div>
              ) : (
                <div>
                  <span className="font-semibold">{result.name}</span>
                  <span className="block text-sm text-gray-400">User</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};