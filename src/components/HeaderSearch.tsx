
import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderSearchProps {
  onSearch: (query: string) => void;
}

const HeaderSearch = ({ onSearch }: HeaderSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <div className="relative">
      {!isOpen ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="text-business-black hover:text-future-green hover:bg-future-green/10 transition-all duration-300"
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </Button>
      ) : (
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className="w-48 px-4 py-2 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-future-green/50 focus:border-future-green transition-all duration-300"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsOpen(false);
              setQuery("");
            }}
            className="ml-2 text-business-black hover:text-future-green hover:bg-future-green/10 transition-all duration-300"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
};

export default HeaderSearch;
