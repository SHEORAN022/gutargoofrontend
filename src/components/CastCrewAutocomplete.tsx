import { useState, useRef, useEffect } from "react";
import { Check, Plus, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCastCrew } from "@/hooks/useCastCrew";
import { Person, PersonRole, roleLabels } from "@/lib/castCrewStore";

interface CastCrewAutocompleteProps {
  role?: PersonRole;
  placeholder?: string;
  onSelect: (person: Person) => void;
  onAddNew?: (name: string) => void;
  selectedIds?: string[];
  className?: string;
}

export function CastCrewAutocomplete({
  role,
  placeholder = "Search or add new...",
  onSelect,
  onAddNew,
  selectedIds = [],
  className,
}: CastCrewAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { searchPeople } = useCastCrew();

  const suggestions = query.length > 0 ? searchPeople(query, role) : [];
  const showAddNew = query.length > 0 && !suggestions.some(p => p.name.toLowerCase() === query.toLowerCase());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalItems = suggestions.length + (showAddNew ? 1 : 0);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex < suggestions.length) {
        handleSelect(suggestions[highlightedIndex]);
      } else if (showAddNew && onAddNew) {
        handleAddNew();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (person: Person) => {
    onSelect(person);
    setQuery("");
    setIsOpen(false);
    setHighlightedIndex(0);
  };

  const handleAddNew = () => {
    if (onAddNew && query.trim()) {
      onAddNew(query.trim());
      setQuery("");
      setIsOpen(false);
      setHighlightedIndex(0);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(0);
        }}
        onFocus={() => query.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-11"
      />

      {isOpen && (suggestions.length > 0 || showAddNew) && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-lg border border-border bg-popover p-1 shadow-lg"
        >
          {suggestions.map((person, index) => {
            const isSelected = selectedIds.includes(person.id);
            return (
              <button
                key={person.id}
                onClick={() => handleSelect(person)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                  highlightedIndex === index && "bg-accent",
                  isSelected && "opacity-50"
                )}
              >
                {person.image ? (
                  <img
                    src={person.image}
                    alt={person.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{person.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {person.roles.map(r => roleLabels[r]).join(", ")}
                  </p>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            );
          })}

          {showAddNew && onAddNew && (
            <button
              onClick={handleAddNew}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                highlightedIndex === suggestions.length && "bg-accent"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Plus className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-primary">Add "{query}"</p>
                <p className="text-xs text-muted-foreground">
                  Create new {role ? roleLabels[role].toLowerCase() : "person"}
                </p>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
