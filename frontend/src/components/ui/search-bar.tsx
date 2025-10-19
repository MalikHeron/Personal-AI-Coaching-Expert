import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;         // Outer container
  inputClassName?: string;    // Input field
  searchIconClassName?: string;     // Search icon
  clearIconClassName?: string;     // Clear icon
}

/**
 * SearchBar component renders a styled input field with a search icon and an optional clear (X) button.
 *
 * @param id - An identifier for the component.
 * @param value - The current value of the search input.
 * @param onChange - Callback function called when the input value changes.
 * @param onClear - Callback function called when the clear (X) button is clicked.
 * @param placeholder - Placeholder text for the input field. Defaults to "Search...".
 * @param className - Additional class names for the container div.
 * @param inputClassName - Additional class names for the input element.
 * @param searchIconClassName - Additional class names for the search icon.
 * @param clearIconClassName - Additional class names for the clear icon.
 *
 * @returns A search bar component with an input, search icon, and optional clear button.
 */
export const SearchBar = ({
  id,
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
  inputClassName = "",
  searchIconClassName = "",
  clearIconClassName = "",
}: SearchBarProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Keep internal value in sync if parent value changes (e.g. on clear)
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, 300);
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalValue]);

  return (
    <div id={id} className={cn("relative max-w-sm", className)}>
      <Input
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className={cn("py-1 h-8 pr-8 pl-7", inputClassName)}
      />
      <Search
        className={cn(
          "pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50",
          searchIconClassName
        )}
      />
      {internalValue && (
        <X
          className={cn(
            "absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 cursor-pointer",
            clearIconClassName
          )}
          onClick={onClear}
        />
      )}
    </div>
  );
};
