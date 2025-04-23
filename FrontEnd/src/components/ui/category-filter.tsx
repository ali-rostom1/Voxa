import { FC, useState } from "react";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export const CategoryFilter: FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const allCategories = ["All", ...categories.filter(cat => cat !== "All")];
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Desktop horizontal filter */}
      <div className="hidden md:flex items-center bg-gray-800 rounded-full p-1">
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeCategory === category
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Mobile dropdown */}
      <div className="md:hidden relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between min-w-32 w-full px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700"
        >
          <span>{activeCategory}</span>
          <svg
            className={`w-4 h-4 ml-2 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isExpanded && (
          <div className="absolute z-10 mt-1 w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  onCategoryChange(category);
                  setIsExpanded(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  activeCategory === category
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};