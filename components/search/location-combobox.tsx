// REVISIT THIS COMPONENT, USED AI SLOP

"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/general";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandItem,
} from "@/components/ui/command";

import { LOCATIONS as INITIAL_LOCATIONS, LocationItem } from "@/components/common/location-data";

interface LocationComboboxProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
  className?: string;
}
export function LocationCombobox({
  label,
  placeholder,
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
}: LocationComboboxProps) {
  const [open, setOpen] = React.useState(false);

  // mutable list of options
  const [items, setItems] = React.useState<LocationItem[]>(INITIAL_LOCATIONS);

  // track what the user is typing
  const [inputValue, setInputValue] = React.useState("");

  // filter against item list
  const filtered = items.filter((loc) =>
    loc.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  // detect when to offer “creatable”
  const customOption =
    inputValue.trim().length > 0 &&
    !items.some((loc) => loc.label.toLowerCase() === inputValue.toLowerCase());

  // who’s currently selected
  const selected = items.find((loc) => loc.label === value);

  // select an existing item
  function handleSelect(label: string) {
    onChange(label);
    setOpen(false);
    setInputValue("");
  }

  // create a brand-new item (using address = label)
  function handleCreate() {
    const newItem: LocationItem = {
      label: inputValue,
      address: inputValue,
    };
    setItems((prev) => [...prev, newItem]);
    onChange(inputValue);
    setOpen(false);
    setInputValue("");
  }

  return (
    <div className="flex flex-col w-full min-w-[140px]">
      <label className="mb-1 text-sm font-medium leading-none">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-label={ariaLabel}
            className={cn(
              "justify-between w-full text-sm sm:text-base font-medium bg-white hover:bg-gray-50", 
              "border-[#cde3dd] focus:ring-[#cde3dd]", 
              className
            )}
          >
            {selected ? selected.label : placeholder ?? "Select…"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" side="bottom" className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Search or type to create…"
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandEmpty>No match.</CommandEmpty>
            <CommandList>
              {filtered.map((loc) => (
                <CommandItem
                  className="rounded-none"
                  key={loc.label}
                  value={loc.label}
                  onSelect={() => handleSelect(loc.label)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === loc.label ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {loc.label}
                </CommandItem>
              ))}

              {customOption && (
                <CommandItem
                  value={inputValue}
                  onSelect={handleCreate}
                  className="rounded-none"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === inputValue ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Create &quot;{inputValue}&quot;
                </CommandItem>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
