"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { useDeleteTest, type Test } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { format } from "date-fns"
import { Tooltip } from "@/components/ui/tooltip"

interface TestTableProps {
  tests: Test[]
  isLoading: boolean
  selectedTests: string[]
  onSelectionChange: (selected: string[]) => void
  onEdit: (test: Test) => void
}

export function TestTable({
  tests,
  isLoading,
  selectedTests,
  onSelectionChange,
  onEdit,
}: TestTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Test | null
    direction: "asc" | "desc"
  }>({ key: null, direction: "asc" })

  const deleteTest = useDeleteTest()
  const { addToast } = useToast()

  const handleSort = (key: keyof Test) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const sortedTests = [...tests].sort((a, b) => {
    if (!sortConfig.key) return 0
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(tests.map((t) => t.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedTests, id])
    } else {
      onSelectionChange(selectedTests.filter((t) => t !== id))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return
    try {
      await deleteTest.mutateAsync(id)
      addToast({
        title: "Test deleted",
        description: "The test has been successfully deleted",
        variant: "default",
      })
      onSelectionChange(selectedTests.filter((t) => t !== id))
    } catch (error: any) {
      addToast({
        title: "Delete failed",
        description: error.message || "Failed to delete test",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tests...</div>
      </div>
    )
  }

  if (tests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">No tests found</div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  tests.length > 0 && selectedTests.length === tests.length
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("prompt")}
            >
              Prompt
              {sortConfig.key === "prompt" && (
                <span className="ml-2">
                  {sortConfig.direction === "asc" ? "↑" : "↓"}
                </span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("initialUrl")}
            >
              Initial URL
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Sub-Category</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("difficulty")}
            >
              Difficulty
            </TableHead>
            <TableHead>Tool Tags</TableHead>
            <TableHead>Test Sets</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("updatedAt")}
            >
              Updated
            </TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTests.map((test) => (
            <TableRow key={test.id}>
              <TableCell>
                <Checkbox
                  checked={selectedTests.includes(test.id)}
                  onCheckedChange={(checked) =>
                    handleSelectOne(test.id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell className="max-w-md">
                <div className="whitespace-normal break-words">
                  {test.prompt}
                </div>
              </TableCell>
              <TableCell className="max-w-xs">
                <div className="truncate" title={test.initialUrl}>
                  {test.initialUrl}
                </div>
              </TableCell>
              <TableCell>{test.category.name}</TableCell>
              <TableCell>{test.subCategory.name}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    test.difficulty === "simple"
                      ? "bg-green-100 text-green-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {test.difficulty}
                </span>
              </TableCell>
              <TableCell>
                {test.toolTags.length > 2 ? (
                  <Tooltip
                    content={
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold mb-1">All Tool Tags:</div>
                        <div className="flex flex-wrap gap-1">
                          {test.toolTags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-blue-200 text-blue-900 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    }
                  >
                    <div className="flex flex-wrap gap-1">
                      {test.toolTags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="text-xs text-muted-foreground cursor-help">
                        +{test.toolTags.length - 2}
                      </span>
                    </div>
                  </Tooltip>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {test.toolTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {test.testSets.length > 2 ? (
                  <Tooltip
                    content={
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold mb-1">All Test Sets:</div>
                        <div className="flex flex-wrap gap-1">
                          {test.testSets.map((set) => (
                            <span
                              key={set}
                              className="px-2 py-0.5 bg-purple-200 text-purple-900 text-xs rounded"
                            >
                              {set}
                            </span>
                          ))}
                        </div>
                      </div>
                    }
                  >
                    <div className="flex flex-wrap gap-1">
                      {test.testSets.slice(0, 2).map((set) => (
                        <span
                          key={set}
                          className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded"
                        >
                          {set}
                        </span>
                      ))}
                      <span className="text-xs text-muted-foreground cursor-help">
                        +{test.testSets.length - 2}
                      </span>
                    </div>
                  </Tooltip>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {test.testSets.map((set) => (
                      <span
                        key={set}
                        className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded"
                      >
                        {set}
                      </span>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(test.updatedAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(test)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(test.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

