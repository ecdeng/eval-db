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
import { Checkbox } from "@/components/ui/checkbox"
import { useBulkEditTags, useToolTags } from "@/lib/api"
import { useToast } from "@/components/ui/toast"

interface BulkEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  testIds: string[]
  onSuccess: () => void
}

export function BulkEditDialog({
  open,
  onOpenChange,
  testIds,
  onSuccess,
}: BulkEditDialogProps) {
  const [selectedToolTags, setSelectedToolTags] = useState<string[]>([])
  const [testSetInput, setTestSetInput] = useState("")
  const bulkEdit = useBulkEditTags()
  const { data: toolTags } = useToolTags()
  const { addToast } = useToast()

  const handleToolTagToggle = (tag: string) => {
    setSelectedToolTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    if (selectedToolTags.length === 0 && !testSetInput.trim()) {
      addToast({
        title: "No changes",
        description: "Please select at least one tag or test set to add",
        variant: "default",
      })
      return
    }

    try {
      await bulkEdit.mutateAsync({
        testIds,
        tags: selectedToolTags.length > 0 ? selectedToolTags : undefined,
        testSets: testSetInput.trim()
          ? [testSetInput.trim()]
          : undefined,
      })
      addToast({
        title: "Tags updated",
        description: `Updated ${testIds.length} test(s)`,
        variant: "default",
      })
      onOpenChange(false)
      setSelectedToolTags([])
      setTestSetInput("")
      onSuccess()
    } catch (error: any) {
      addToast({
        title: "Update failed",
        description: error.message || "Failed to update tags",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Edit Tags</DialogTitle>
          <DialogDescription>
            Add tags to {testIds.length} selected test(s). Tags will be appended to existing ones.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tool Tags</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
              {toolTags?.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`bulk-tag-${tag}`}
                    checked={selectedToolTags.includes(tag)}
                    onCheckedChange={() => handleToolTagToggle(tag)}
                  />
                  <Label
                    htmlFor={`bulk-tag-${tag}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-set">Test Set</Label>
            <Input
              id="test-set"
              placeholder="Enter test set name..."
              value={testSetInput}
              onChange={(e) => setTestSetInput(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter a new test set tag to add to all selected tests
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={bulkEdit.isPending}
          >
            {bulkEdit.isPending ? "Updating..." : "Update Tags"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

