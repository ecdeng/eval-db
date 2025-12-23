"use client"

import { useState } from "react"
import { TestTable } from "@/components/dashboard/test-table"
import { FiltersSidebar } from "@/components/dashboard/filters-sidebar"
import { TestForm } from "@/components/dashboard/test-form"
import { BulkImportDialog } from "@/components/dashboard/bulk-import-dialog"
import { BulkEditDialog } from "@/components/dashboard/bulk-edit-dialog"
import { TaxonomyManager } from "@/components/settings/taxonomy-manager"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Download, Settings, Filter } from "lucide-react"
import { useTests, type TestFilters } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { parse } from "json2csv"

export default function Dashboard() {
  const [filters, setFilters] = useState<TestFilters>({})
  const [columnFilters, setColumnFilters] = useState<{
    categoryIds?: string[]
    subCategoryIds?: string[]
    difficulties?: string[]
    toolTags?: string[]
    testSets?: string[]
  }>({})
  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [isTestFormOpen, setIsTestFormOpen] = useState(false)
  const [editingTest, setEditingTest] = useState<string | null>(null)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Merge column filters with sidebar filters
  // Column filters take precedence - if a column filter is set, it overrides the sidebar filter
  // If column filter is empty array, it means "no filter" for that field
  const mergedFilters: TestFilters = {
    ...filters,
    // Only override if column filter has been set (not undefined)
    ...(columnFilters.categoryIds !== undefined && {
      categoryId: columnFilters.categoryIds.length > 0 ? columnFilters.categoryIds : undefined,
    }),
    ...(columnFilters.subCategoryIds !== undefined && {
      subCategoryId: columnFilters.subCategoryIds.length > 0 ? columnFilters.subCategoryIds : undefined,
    }),
    ...(columnFilters.difficulties !== undefined && {
      difficulty: columnFilters.difficulties.length > 0 ? columnFilters.difficulties : undefined,
    }),
    ...(columnFilters.toolTags !== undefined && {
      toolTags: columnFilters.toolTags.length > 0 ? columnFilters.toolTags : undefined,
    }),
    ...(columnFilters.testSets !== undefined && {
      testSets: columnFilters.testSets.length > 0 ? columnFilters.testSets : undefined,
    }),
  }

  const { data, isLoading } = useTests(mergedFilters)
  const { addToast } = useToast()

  const handleExport = () => {
    if (!data?.tests || data.tests.length === 0) {
      addToast({
        title: "No data to export",
        description: "Please apply filters to export tests",
        variant: "default",
      })
      return
    }

    try {
      // Filter tests based on selection: if rows are selected, only export those
      // Otherwise, export all filtered tests
      const testsToExport =
        selectedTests.length > 0
          ? data.tests.filter((test) => selectedTests.includes(test.id))
          : data.tests

      if (testsToExport.length === 0) {
        addToast({
          title: "No data to export",
          description: "No tests selected for export",
          variant: "default",
        })
        return
      }

      // Flatten nested objects for CSV export
      const flattenedTests = testsToExport.map((test) => ({
        id: test.id,
        prompt: test.prompt,
        initialUrl: test.initialUrl,
        golden: test.golden,
        difficulty: test.difficulty,
        category: test.category.name,
        subCategory: test.subCategory.name,
        toolTags: test.toolTags.join(", "),
        testSets: test.testSets.join(", "),
      }))

      const csv = parse(flattenedTests, {
        fields: [
          "id",
          "prompt",
          "initialUrl",
          "golden",
          "difficulty",
          "category",
          "subCategory",
          "toolTags",
          "testSets",
        ],
      })

      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `tests-export-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      addToast({
        title: "Export successful",
        description: `Exported ${testsToExport.length} test(s)${
          selectedTests.length > 0 ? " (selected)" : ""
        }`,
        variant: "default",
      })
    } catch (error) {
      addToast({
        title: "Export failed",
        description: "Failed to export tests",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <FiltersSidebar
        filters={filters}
        onFiltersChange={setFilters}
        selectedCount={selectedTests.length}
        isOpen={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold">evaldb</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSettingsOpen(true)}
                size="sm"
              >
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button variant="outline" onClick={handleExport} size="sm">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsBulkImportOpen(true)}
                size="sm"
              >
                <Upload className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Bulk Import</span>
              </Button>
              {selectedTests.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setIsBulkEditOpen(true)}
                  size="sm"
                >
                  Bulk Edit ({selectedTests.length})
                </Button>
              )}
              <Button onClick={() => setIsTestFormOpen(true)} size="sm">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add New Test</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <TestTable
            tests={data?.tests || []}
            isLoading={isLoading}
            selectedTests={selectedTests}
            onSelectionChange={setSelectedTests}
            onEdit={(test) => {
              setEditingTest(test.id)
              setIsTestFormOpen(true)
            }}
            filters={columnFilters}
            onFiltersChange={setColumnFilters}
          />
        </main>
      </div>

      <TestForm
        open={isTestFormOpen}
        onOpenChange={(open) => {
          setIsTestFormOpen(open)
          if (!open) setEditingTest(null)
        }}
        testId={editingTest}
      />

      <BulkImportDialog
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
      />

      <BulkEditDialog
        open={isBulkEditOpen}
        onOpenChange={setIsBulkEditOpen}
        testIds={selectedTests}
        onSuccess={() => setSelectedTests([])}
      />

      <TaxonomyManager
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  )
}

