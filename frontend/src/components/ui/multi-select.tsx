import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { SearchBar } from "./search-bar";

interface MultiSelectDropdownProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  showSearch?: boolean;
  disabled?: boolean;
}

export function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  showSearch = true,
  disabled = false,
}: MultiSelectDropdownProps) {
  const [searchInput, setSearchInput] = useState("");

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [options, searchInput]);

  const toggleValue = (value: string) => {
    const isAll = value === "all";
    const otherValues = options.map((opt) => opt.value).filter((v) => v !== "all");

    if (isAll) {
      // Selecting "All": deselect others and select only "all"
      onChange(["all"]);
    } else {
      let newSelected = selected.filter((v) => v !== "all");

      if (selected.includes(value)) {
        newSelected = newSelected.filter((v) => v !== value);
      } else {
        newSelected = [...newSelected, value];
      }

      // If all individual options are selected and there are at least two such options,
      // replace with just "all". This avoids collapsing to "all" when there's only one
      // real option alongside the special "all" option.
      const allOthersSelected =
        otherValues.length > 1 && otherValues.every((v) => newSelected.includes(v));
      if (allOthersSelected) {
        onChange(["all"]);
      } else {
        onChange(newSelected);
      }
    }
  };

  const selectedLabels = options
    .filter((opt) => selected.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "px-3 justify-between text-muted-foreground bg-transparent hover:text-muted-foreground w-full font-normal text-sm h-8 flex items-center pointer-events-auto",
            disabled && "opacity-70 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          <span
            className={`${selected.length > 0 ? "text-foreground" : "text-muted-foreground"} text-left truncate flex-grow max-w-96`}
          >
            {selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 ${selected.length > 0 ? "" : "opacity-50"} ml-2`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-60 w-[--radix-dropdown-menu-trigger-width] overflow-y-auto"
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
          filteredOptions.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={selected.includes(opt.value)}
              onCheckedChange={() => toggleValue(opt.value)}
              onSelect={(e) => e.preventDefault()} // prevent closing
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <div className="px-4 py-2 text-muted-foreground text-sm">No results</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}