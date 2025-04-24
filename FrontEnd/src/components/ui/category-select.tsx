import { useState } from 'react';
import { Category } from '@/types';


export const CategorySelect = ({ 
    categories, 
    selectedCategoryId, 
    onCategorySelect 
  }: {
    categories: Category[];
    selectedCategoryId: number | null;
    onCategorySelect: (id: number) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
    
    return (
      <div className="mb-4">
        <label htmlFor="category" className="block mb-1 text-sm font-medium text-gray-700">
          Category
        </label>
        <div className="relative">
          <button
            type="button"
            className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center justify-between">
              <span className={selectedCategory ? "text-gray-800" : "text-gray-500"}>
                {selectedCategory?.title || "Select category"}
              </span>
              <svg 
                className={`w-5 h-5 text-gray-400`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-md">
              <ul className="py-1 max-h-25 overflow-auto">
                {categories.map(category => (
                  <li 
                    key={category.id}
                    className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                      selectedCategoryId === category.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                    }`}
                    onClick={() => {
                      onCategorySelect(category.id);
                      setIsOpen(false);
                    }}
                  >
                    {category.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };