"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useBulkImport, useCategories, useSubCategories } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import Papa from "papaparse"

interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BulkImportDialog({ open, onOpenChange }: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<Array<{ row: number; missingFields: string[] }>>([])
  const bulkImport = useBulkImport()
  const { data: categories } = useCategories()
  const { addToast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setPreview([])
    setErrors([])
    setValidationErrors([])

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setErrors(results.errors.map((e) => e.message))
          return
        }
        setPreview(results.data.slice(0, 5)) // Preview first 5 rows
      },
    })
  }

  const handleImport = async () => {
    if (!file) return

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          if (results.errors.length > 0) {
            addToast({
              title: "Import failed",
              description: `CSV parsing errors: ${results.errors.map((e) => e.message).join(", ")}`,
              variant: "destructive",
            })
            return
          }

          // Map CSV columns to our data structure
          const tests = results.data.map((row: any) => {
            // Find category and subcategory by name (optional)
            const category = row.category || row.Category
              ? categories?.find(
                  (c) => c.name === row.category || c.name === row.Category
                )
              : null
            const subCategory = category && (row.subCategory || row["Sub-Category"])
              ? category.subCategories.find(
                  (sc) => sc.name === row.subCategory || sc.name === row["Sub-Category"]
                )
              : null

            return {
              id: row.id || undefined,
              prompt: row.prompt || row.Prompt || "",
              initialUrl: row.initialUrl || row["Initial URL"] || row.initial_url || "",
              golden: row.golden || row.Golden || "",
              difficulty: (row.difficulty || row.Difficulty || "simple").toLowerCase(),
              categoryId: category?.id || "",
              subCategoryId: subCategory?.id || "",
              toolTags: (row.toolTags || row["Tool Tags"] || row.tool_tags || "")
                .split(",")
                .map((t: string) => t.trim())
                .filter((t: string) => t.length > 0),
              testSets: (row.testSets || row["Test Sets"] || row.test_sets || "")
                .split(",")
                .map((t: string) => t.trim())
                .filter((t: string) => t.length > 0),
            }
          })

          // Validate only prompt is required
          const invalidTests = tests
            .map((t: any, index: number) => {
              if (!t.prompt || t.prompt.trim() === "") {
                return { row: index + 1, missingFields: ["prompt"], test: t }
              }
              return null
            })
            .filter((item: any) => item !== null)

          if (invalidTests.length > 0) {
            setValidationErrors(invalidTests.map((item: any) => ({
              row: item.row,
              missingFields: item.missingFields,
            })))
            
            addToast({
              title: "Validation failed",
              description: `${invalidTests.length} test(s) are missing required fields. See details below.`,
              variant: "destructive",
              duration: 5000,
            })
            return
          }
          
          // Clear validation errors if validation passes
          setValidationErrors([])

          try {
            const result = await bulkImport.mutateAsync(tests)
            addToast({
              title: "Import successful",
              description: `Imported ${result.count || tests.length} test(s)`,
              variant: "default",
            })
            onOpenChange(false)
            setFile(null)
            setPreview([])
            setValidationErrors([])
          } catch (error: any) {
            const errorMessage = error.message || error.response?.data?.error || "Failed to import tests"
            const errorDetails = error.response?.data?.details
            console.error("Import error:", error)
            
            addToast({
              title: "Import failed",
              description: errorMessage,
              variant: "destructive",
              duration: 10000,
            })
            
            // Also show error in the dialog if there are details
            if (errorDetails) {
              setErrors([errorMessage, errorDetails])
            }
          }
        },
      })
    } catch (error: any) {
      addToast({
        title: "Import failed",
        description: error.message || "Failed to process file",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Tests</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple tests. If a test has an ID, it will be updated; otherwise, a new test will be created.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            <p className="text-sm text-muted-foreground">
              Expected columns: id (optional), prompt, initialUrl, golden, difficulty, category, subCategory, toolTags (comma-separated), testSets (comma-separated)
            </p>
          </div>

          {errors.length > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm font-semibold text-destructive mb-2">CSV Parsing Errors:</p>
              <ul className="text-sm text-destructive list-disc list-inside">
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm font-semibold text-destructive mb-2">
                Validation Errors ({validationErrors.length} test(s) with missing fields):
              </p>
              <div className="max-h-48 overflow-y-auto">
                <ul className="text-sm text-destructive space-y-1">
                  {validationErrors.map((error, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-medium">Row {error.row}:</span>
                      <span>Missing: {error.missingFields.join(", ")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview (first 5 rows)</Label>
              <div className="border rounded-md overflow-auto max-h-64">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {Object.keys(preview[0] || {}).map((key) => (
                        <th key={key} className="p-2 text-left border-b">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((value: any, j) => (
                          <td key={j} className="p-2 border-b">
                            {String(value || "").slice(0, 50)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || bulkImport.isPending}
          >
            {bulkImport.isPending ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

