"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useCategories, useSubCategories, useToolTags, type TestFilters } from "@/lib/api"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FiltersSidebarProps {
  filters: TestFilters
  onFiltersChange: (filters: TestFilters) => void
  selectedCount: number
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function FiltersSidebar({
  filters,
  onFiltersChange,
  selectedCount,
  isOpen = true,
  onOpenChange,
}: FiltersSidebarProps) {
  const { data: categories } = useCategories()
  const { data: subCategories } = useSubCategories(filters.categoryId)
  const { data: toolTags } = useToolTags()

  const [selectedToolTags, setSelectedToolTags] = useState<string[]>(
    filters.toolTags || []
  )
  const [selectedTestSets, setSelectedTestSets] = useState<string[]>(
    filters.testSets || []
  )

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined })
  }

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({
      ...filters,
      categoryId: categoryId || undefined,
      subCategoryId: undefined, // Reset subcategory when category changes
    })
  }

  const handleSubCategoryChange = (subCategoryId: string) => {
    onFiltersChange({
      ...filters,
      subCategoryId: subCategoryId || undefined,
    })
  }

  const handleDifficultyChange = (difficulty: string) => {
    onFiltersChange({
      ...filters,
      difficulty: difficulty || undefined,
    })
  }

  const handleToolTagToggle = (tag: string) => {
    const newTags = selectedToolTags.includes(tag)
      ? selectedToolTags.filter((t) => t !== tag)
      : [...selectedToolTags, tag]
    setSelectedToolTags(newTags)
    onFiltersChange({
      ...filters,
      toolTags: newTags.length > 0 ? newTags : undefined,
    })
  }

  const clearFilters = () => {
    setSelectedToolTags([])
    setSelectedTestSets([])
    onFiltersChange({})
  }

  // Extract unique test sets from all tests (would need to fetch or pass as prop)
  // For now, we'll use a simple input approach
  const [testSetInput, setTestSetInput] = useState("")

  const handleTestSetAdd = () => {
    if (testSetInput.trim()) {
      const newSets = [...selectedTestSets, testSetInput.trim()]
      setSelectedTestSets(newSets)
      setTestSetInput("")
      onFiltersChange({
        ...filters,
        testSets: newSets.length > 0 ? newSets : undefined,
      })
    }
  }

  const handleTestSetRemove = (set: string) => {
    const newSets = selectedTestSets.filter((s) => s !== set)
    setSelectedTestSets(newSets)
    onFiltersChange({
      ...filters,
      testSets: newSets.length > 0 ? newSets : undefined,
    })
  }

  return (
    <>
      {isOpen && (
        <div className="fixed lg:static inset-y-0 left-0 z-50 w-80 border-r bg-background lg:bg-muted/40 p-4 overflow-y-auto lg:block">
          {onOpenChange && (
            <div className="lg:hidden mb-4 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          {Object.keys(filters).length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="mb-4">
              Clear all
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search prompts or golden answers..."
            value={filters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={filters.categoryId || ""}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sub-Category</Label>
          <Select
            value={filters.subCategoryId || ""}
            onValueChange={handleSubCategoryChange}
            disabled={!filters.categoryId}
          >
            <SelectTrigger>
              <SelectValue placeholder="All sub-categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All sub-categories</SelectItem>
              {subCategories?.map((subCat) => (
                <SelectItem key={subCat.id} value={subCat.id}>
                  {subCat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select
            value={filters.difficulty || ""}
            onValueChange={handleDifficultyChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All difficulties</SelectItem>
              <SelectItem value="simple">Simple</SelectItem>
              <SelectItem value="complex">Complex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tool Tags</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
            {toolTags?.map((tag) => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag}`}
                  checked={selectedToolTags.includes(tag)}
                  onCheckedChange={() => handleToolTagToggle(tag)}
                />
                <Label
                  htmlFor={`tag-${tag}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {tag}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Test Sets</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter test set name..."
              value={testSetInput}
              onChange={(e) => setTestSetInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleTestSetAdd()
                }
              }}
            />
            <Button onClick={handleTestSetAdd} size="sm">
              Add
            </Button>
          </div>
          {selectedTestSets.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTestSets.map((set) => (
                <span
                  key={set}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                >
                  {set}
                  <button
                    onClick={() => handleTestSetRemove(set)}
                    className="hover:text-purple-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedCount} test(s) selected
            </div>
          </div>
        )}
      </div>
    </div>
      )}
      {isOpen && onOpenChange && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}
    </>
  )
}

