import { FC, useState } from "react";

interface SortProps {
    selected: string;
    setSelected: (value: string) => void;
    onChange: (value: string) => void;
}

export const SortingFilter: FC<SortProps> = ({ onChange ,selected,setSelected}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSelect = (value: string) => {
    setSelected(value);
    onChange(value);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm lg:w-[8vw]"
      >
         {selected}
        <svg
          className="ml-2 w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute rounded-xl right-0 mt-1 bg-gray-800 shadow-lg z-10 w-full">
          <button
            onClick={() => handleSelect("Recent")}
            className={`block rounded-t-xl px-4 py-2 text-white text-sm text-left w-full ${selected === "Recent" ? "bg-blue-600" : "hover:bg-gray-700"}`}
          >
            Recent
          </button>
          <button
            onClick={() => handleSelect("Views")}
            className={`block px-4 py-2 text-white text-sm text-left w-full ${selected === "Views" ? "bg-blue-600" : "hover:bg-gray-700"}`}
          >
            Most Views
          </button>
          <button
            onClick={() => handleSelect("Likes")}
            className={`block rounded-b-xl px-4 py-2 text-white text-sm text-left w-full ${selected === "Likes" ? "bg-blue-600" : "hover:bg-gray-700"}`}
          >
            Most Likes
          </button>
        </div>
      )}
    </div>
  );
};