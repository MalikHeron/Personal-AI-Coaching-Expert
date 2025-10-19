import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";

interface SearchableDropdownProps {
  options: string[];
  selected?: string;
  onSelect: (val: string) => void;
  placeholder?: string;
  showSearch?: boolean;
  className?: string;
}

/**
 * A dropdown component with optional search functionality.
 *
 * @remarks
 * This component renders a dropdown menu that allows users to select an option from a list.
 * It supports searching through the options if `showSearch` is enabled.
 *
 * @param options - The list of string options to display in the dropdown.
 * @param selected - The currently selected option.
 * @param onSelect - Callback function invoked when an option is selected.
 * @param placeholder - Placeholder text displayed when no option is selected. Defaults to "Select...".
 * @param showSearch - Whether to display a search input for filtering options. Defaults to `true`.
 * @param className - Additional CSS classes to apply to the root element.
 *
 * @example
 * ```tsx
 * <SearchableDropdown
 *   options={["Option 1", "Option 2", "Option 3"]}
 *   selected={selectedOption}
 *   onSelect={setSelectedOption}
 *   placeholder="Choose an option"
 *   showSearch={true}
 * />
 * ```
 */

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  selected,
  onSelect,
  placeholder = "Select...",
  showSearch = true,
  className = "",
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [internalSelected, setInternalSelected] = useState<string>(selected || "");

  // Keep internal state in sync with controlled selected prop
  React.useEffect(() => {
    if (selected !== undefined) {
      setInternalSelected(selected);
    }
  }, [selected]);

  const filteredOptions = showSearch
    ? options.filter(option =>
      option.toLowerCase().includes(searchInput.toLowerCase())
    )
    : options;

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="px-3 justify-between w-full text-sm font-normal h-8 hover:bg-transparent">
            <span
              className={`${internalSelected ? "text-foreground" : "text-muted-foreground"} text-left truncate`}
            >
              {internalSelected || placeholder}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-60 w-[--radix-dropdown-menu-trigger-width] overflow-y-auto"
          portalled={false}
          onPointerDownOutside={(e) => {
            // Keep dropdown interactions from bubbling up as outside clicks for the dialog
            e.preventDefault();
          }}
        >
          {showSearch && (
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onClear={() => setSearchInput("")}
              className="max-w-full sticky top-0 z-50 bg-background shadow-sm mx-1 mb-1"
            />
          )}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={option === internalSelected}
                onSelect={() => {
                  setInternalSelected(option);
                  onSelect(option);
                }}
                onKeyDown={e => {
                  if ((e.target as HTMLElement).tagName === "INPUT") {
                    e.stopPropagation();
                  }
                }}
              >
                {option}
              </DropdownMenuCheckboxItem>
            ))
          ) : (
            <div className="px-4 py-2 text-muted-foreground text-sm">No results</div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};