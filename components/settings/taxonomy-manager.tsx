"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useCategories,
  useSubCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateSubCategory,
  useUpdateSubCategory,
  useDeleteSubCategory,
  useToolTags,
  useCreateToolTag,
  useDeleteToolTag,
  useTestSets,
  useCreateTestSet,
  useDeleteTestSet,
} from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { Plus, Edit, Trash2, X } from "lucide-react"

interface TaxonomyManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaxonomyManager({ open, onOpenChange }: TaxonomyManagerProps) {
  const [activeTab, setActiveTab] = useState<"categories" | "subcategories" | "tooltags" | "testsets">("categories")
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingSubCategory, setEditingSubCategory] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newSubCategoryName, setNewSubCategoryName] = useState("")
  const [newSubCategoryCategoryId, setNewSubCategoryCategoryId] = useState("")
  const [newToolTag, setNewToolTag] = useState("")
  const [editingToolTag, setEditingToolTag] = useState<string | null>(null)
  const [newTestSet, setNewTestSet] = useState("")

  const { data: categories, refetch: refetchCategories } = useCategories()
  const { data: subCategories, refetch: refetchSubCategories } = useSubCategories()
  const { data: toolTags, refetch: refetchToolTags } = useToolTags()
  const { data: testSets, refetch: refetchTestSets } = useTestSets()
  const createToolTag = useCreateToolTag()
  const deleteToolTag = useDeleteToolTag()
  const createTestSet = useCreateTestSet()
  const deleteTestSet = useDeleteTestSet()

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const createSubCategory = useCreateSubCategory()
  const updateSubCategory = useUpdateSubCategory()
  const deleteSubCategory = useDeleteSubCategory()
  const { addToast } = useToast()

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      await createCategory.mutateAsync({ name: newCategoryName.trim() })
      addToast({
        title: "Category created",
        description: "The category has been successfully created",
        variant: "default",
      })
      setNewCategoryName("")
      refetchCategories()
    } catch (error: any) {
      addToast({
        title: "Create failed",
        description: error.message || "Failed to create category",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCategory = async (id: string, name: string) => {
    try {
      await updateCategory.mutateAsync({ id, data: { name } })
      addToast({
        title: "Category updated",
        description: "The category has been successfully updated",
        variant: "default",
      })
      setEditingCategory(null)
      refetchCategories()
    } catch (error: any) {
      addToast({
        title: "Update failed",
        description: error.message || "Failed to update category",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id)
      addToast({
        title: "Category deleted",
        description: "The category has been successfully deleted",
        variant: "default",
      })
      refetchCategories()
      refetchSubCategories()
    } catch (error: any) {
      addToast({
        title: "Delete failed",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const handleCreateSubCategory = async () => {
    if (!newSubCategoryName.trim() || !newSubCategoryCategoryId) return
    try {
      await createSubCategory.mutateAsync({
        name: newSubCategoryName.trim(),
        categoryId: newSubCategoryCategoryId,
      })
      addToast({
        title: "Sub-category created",
        description: "The sub-category has been successfully created",
        variant: "default",
      })
      setNewSubCategoryName("")
      setNewSubCategoryCategoryId("")
      refetchSubCategories()
    } catch (error: any) {
      addToast({
        title: "Create failed",
        description: error.message || "Failed to create sub-category",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSubCategory = async (id: string, name: string) => {
    try {
      await updateSubCategory.mutateAsync({ id, data: { name } })
      addToast({
        title: "Sub-category updated",
        description: "The sub-category has been successfully updated",
        variant: "default",
      })
      setEditingSubCategory(null)
      refetchSubCategories()
    } catch (error: any) {
      addToast({
        title: "Update failed",
        description: error.message || "Failed to update sub-category",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSubCategory = async (id: string) => {
    try {
      await deleteSubCategory.mutateAsync(id)
      addToast({
        title: "Sub-category deleted",
        description: "The sub-category has been successfully deleted",
        variant: "default",
      })
      refetchSubCategories()
    } catch (error: any) {
      addToast({
        title: "Delete failed",
        description: error.message || "Failed to delete sub-category",
        variant: "destructive",
      })
    }
  }

  const handleCreateToolTag = async () => {
    if (!newToolTag.trim()) return
    try {
      await createToolTag.mutateAsync({ name: newToolTag.trim() })
      addToast({
        title: "Tool tag added",
        description: "The tool tag is now available when creating or editing tests",
        variant: "default",
      })
      setNewToolTag("")
      refetchToolTags()
    } catch (error: any) {
      addToast({
        title: "Create failed",
        description: error.message || "Failed to add tool tag",
        variant: "destructive",
      })
    }
  }

  const handleCreateTestSet = async () => {
    if (!newTestSet.trim()) return
    try {
      await createTestSet.mutateAsync({ name: newTestSet.trim() })
      addToast({
        title: "Test set added",
        description: "The test set is now available when creating or editing tests",
        variant: "default",
      })
      setNewTestSet("")
      refetchTestSets()
    } catch (error: any) {
      addToast({
        title: "Create failed",
        description: error.message || "Failed to add test set",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTestSet = async (name: string) => {
    try {
      await deleteTestSet.mutateAsync(name)
      addToast({
        title: "Test set deleted",
        description: "The test set has been removed",
        variant: "default",
      })
      refetchTestSets()
    } catch (error: any) {
      addToast({
        title: "Delete failed",
        description: error.message || "Failed to delete test set",
        variant: "destructive",
      })
    }
  }

  const handleDeleteToolTag = async (name: string) => {
    try {
      await deleteToolTag.mutateAsync(name)
      addToast({
        title: "Tool tag deleted",
        description: "The tool tag has been removed",
        variant: "default",
      })
      refetchToolTags()
    } catch (error: any) {
      addToast({
        title: "Delete failed",
        description: error.message || "Failed to delete tool tag",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Taxonomy Management</DialogTitle>
          <DialogDescription>
            Manage categories, sub-categories, and tool tags. Items in use cannot be deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "categories" ? "default" : "outline"}
            onClick={() => setActiveTab("categories")}
          >
            Categories
          </Button>
          <Button
            variant={activeTab === "subcategories" ? "default" : "outline"}
            onClick={() => setActiveTab("subcategories")}
          >
            Sub-Categories
          </Button>
          <Button
            variant={activeTab === "tooltags" ? "default" : "outline"}
            onClick={() => setActiveTab("tooltags")}
          >
            Tool Tags
          </Button>
          <Button
            variant={activeTab === "testsets" ? "default" : "outline"}
            onClick={() => setActiveTab("testsets")}
          >
            Test Sets
          </Button>
        </div>

        {activeTab === "categories" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateCategory()
                }}
              />
              <Button onClick={handleCreateCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {categories?.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  {editingCategory === cat.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        defaultValue={cat.name}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateCategory(
                              cat.id,
                              (e.target as HTMLInputElement).value
                            )
                          }
                          if (e.key === "Escape") setEditingCategory(null)
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => setEditingCategory(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="font-medium">{cat.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {cat._count?.tests || 0} test(s), {cat.subCategories.length} sub-category(ies)
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingCategory(cat.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to delete "${cat.name}"? This will fail if it's in use.`
                              )
                            ) {
                              handleDeleteCategory(cat.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "subcategories" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New sub-category name..."
                value={newSubCategoryName}
                onChange={(e) => setNewSubCategoryName(e.target.value)}
              />
              <Select
                value={newSubCategoryCategoryId}
                onValueChange={setNewSubCategoryCategoryId}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleCreateSubCategory}
                disabled={!newSubCategoryName.trim() || !newSubCategoryCategoryId}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {subCategories?.map((subCat) => (
                <div
                  key={subCat.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  {editingSubCategory === subCat.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        defaultValue={subCat.name}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateSubCategory(
                              subCat.id,
                              (e.target as HTMLInputElement).value
                            )
                          }
                          if (e.key === "Escape") setEditingSubCategory(null)
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => setEditingSubCategory(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="font-medium">{subCat.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {subCat.category?.name || "Unknown category"} • {subCat._count?.tests || 0} test(s)
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingSubCategory(subCat.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to delete "${subCat.name}"? This will fail if it's in use.`
                              )
                            ) {
                              handleDeleteSubCategory(subCat.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tooltags" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New tool tag name..."
                value={newToolTag}
                onChange={(e) => setNewToolTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateToolTag()
                }}
              />
              <Button onClick={handleCreateToolTag} disabled={!newToolTag.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Tool tags are automatically extracted from tests. New tags can be added here and will be available when creating or editing tests.
              </p>
            </div>
            <div className="space-y-2">
              {toolTags?.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="font-medium">{tag}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to delete "${tag}"? This will fail if it's used in any tests.`
                        )
                      ) {
                        handleDeleteToolTag(tag)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "testsets" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New test set name..."
                value={newTestSet}
                onChange={(e) => setNewTestSet(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateTestSet()
                }}
              />
              <Button onClick={handleCreateTestSet} disabled={!newTestSet.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Test sets are used to group tests together. New sets can be added here and will be available when creating or editing tests.
              </p>
            </div>
            <div className="space-y-2">
              {testSets?.map((set) => (
                <div
                  key={set}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="font-medium">{set}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to delete "${set}"? This will fail if it's used in any tests.`
                        )
                      ) {
                        handleDeleteTestSet(set)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

