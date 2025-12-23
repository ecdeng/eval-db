"use client"

import * as React from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ColumnFilterOption {
  value: string
  label: string
}

interface ColumnFilterProps {
  label: string
  options: ColumnFilterOption[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  className?: string
}

export function ColumnFilter({
  label,
  options,
  selectedValues,
  onSelectionChange,
  className,
}: ColumnFilterProps) {
  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value]
    onSelectionChange(newValues)
  }

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(options.map((opt) => opt.value))
    }
  }

  const hasActiveFilters = selectedValues.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-2 lg:px-3",
            hasActiveFilters && "bg-accent",
            className
          )}
        >
          <Filter className="h-4 w-4" />
          {hasActiveFilters && (
            <span className="ml-1 text-xs">({selectedValues.length})</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 max-h-[300px] overflow-y-auto">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={selectedValues.length === options.length}
          onCheckedChange={handleSelectAll}
        >
          Select All
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

