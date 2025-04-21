import { FC, useState } from 'react';
import { Search } from 'lucide-react';




export const SearchBar: FC<{ onSearch?: (query: string) => void }> = ({ onSearch }) => {
    const [query, setQuery] = useState<string>('');
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onSearch) onSearch(query);
    };
  
    return (
      <form onSubmit={handleSubmit} className="relative flex-grow max-w-xl mx-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="search"
            className="w-full py-2 pl-10 pr-4 text-white bg-gray-800 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search Voxa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </form>
    );
  };