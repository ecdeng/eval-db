import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export type Test = {
  id: string
  prompt: string
  initialUrl: string
  golden: string
  difficulty: "simple" | "complex"
  categoryId: string
  subCategoryId: string
  toolTags: string[]
  testSets: string[]
  createdAt: string
  updatedAt: string
  category: { id: string; name: string }
  subCategory: { id: string; name: string; categoryId: string }
}

export type Category = {
  id: string
  name: string
  subCategories: SubCategory[]
  _count?: { tests: number }
}

export type SubCategory = {
  id: string
  name: string
  categoryId: string
  category?: Category
  _count?: { tests: number }
}

export type TestFilters = {
  search?: string
  categoryId?: string | string[]
  subCategoryId?: string | string[]
  difficulty?: string | string[]
  toolTags?: string[]
  testSets?: string[]
  page?: number
  limit?: number
}

const API_BASE = "/api"

// Tests
export function useTests(filters: TestFilters = {}) {
  const params = new URLSearchParams()
  if (filters.search) params.append("search", filters.search)
  if (filters.categoryId) {
    const categoryIds = Array.isArray(filters.categoryId) ? filters.categoryId : [filters.categoryId]
    categoryIds.forEach((id) => params.append("categoryId", id))
  }
  if (filters.subCategoryId) {
    const subCategoryIds = Array.isArray(filters.subCategoryId) ? filters.subCategoryId : [filters.subCategoryId]
    subCategoryIds.forEach((id) => params.append("subCategoryId", id))
  }
  if (filters.difficulty) {
    const difficulties = Array.isArray(filters.difficulty) ? filters.difficulty : [filters.difficulty]
    difficulties.forEach((d) => params.append("difficulty", d))
  }
  if (filters.toolTags) {
    filters.toolTags.forEach((tag) => params.append("toolTags", tag))
  }
  if (filters.testSets) {
    filters.testSets.forEach((set) => params.append("testSets", set))
  }
  params.append("page", String(filters.page || 1))
  params.append("limit", String(filters.limit || 50))

  return useQuery<{ tests: Test[]; pagination: any }>({
    queryKey: ["tests", filters],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/tests?${params}`)
      if (!res.ok) throw new Error("Failed to fetch tests")
      return res.json()
    },
  })
}

export function useTest(id: string | null) {
  return useQuery<Test>({
    queryKey: ["test", id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/tests/${id}`)
      if (!res.ok) throw new Error("Failed to fetch test")
      return res.json()
    },
    enabled: !!id,
  })
}

export function useCreateTest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Test>) => {
      const res = await fetch(`${API_BASE}/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create test")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] })
    },
  })
}

export function useUpdateTest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Test> }) => {
      const res = await fetch(`${API_BASE}/tests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update test")
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tests"] })
      queryClient.invalidateQueries({ queryKey: ["test", variables.id] })
    },
  })
}

export function useDeleteTest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/tests/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to delete test")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] })
    },
  })
}

export function useBulkEditTags() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      testIds,
      tags,
      testSets,
    }: {
      testIds: string[]
      tags?: string[]
      testSets?: string[]
    }) => {
      const res = await fetch(`${API_BASE}/tests/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-edit-tags",
          testIds,
          tags,
          testSets,
        }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update tags")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] })
    },
  })
}

export function useBulkImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (tests: any[]) => {
      const res = await fetch(`${API_BASE}/tests/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-import",
          tests,
        }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to import tests")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] })
    },
  })
}

// Categories
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/categories`)
      if (!res.ok) throw new Error("Failed to fetch categories")
      return res.json()
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create category")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["subcategories"] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string } }) => {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update category")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["subcategories"] })
      queryClient.invalidateQueries({ queryKey: ["tests"] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || error.message || "Failed to delete category")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["subcategories"] })
      queryClient.invalidateQueries({ queryKey: ["tests"] })
    },
  })
}

// SubCategories
export function useSubCategories(categoryId?: string) {
  return useQuery<SubCategory[]>({
    queryKey: ["subcategories", categoryId],
    queryFn: async () => {
      const params = categoryId ? `?categoryId=${categoryId}` : ""
      const res = await fetch(`${API_BASE}/subcategories${params}`)
      if (!res.ok) throw new Error("Failed to fetch subcategories")
      return res.json()
    },
  })
}

export function useCreateSubCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; categoryId: string }) => {
      const res = await fetch(`${API_BASE}/subcategories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create subcategory")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export function useUpdateSubCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: { name?: string; categoryId?: string }
    }) => {
      const res = await fetch(`${API_BASE}/subcategories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update subcategory")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["tests"] })
    },
  })
}

export function useDeleteSubCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/subcategories/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || error.message || "Failed to delete subcategory")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["tests"] })
    },
  })
}

// Tool Tags
export function useToolTags() {
  return useQuery<string[]>({
    queryKey: ["tool-tags"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/tool-tags`)
      if (!res.ok) throw new Error("Failed to fetch tool tags")
      return res.json()
    },
  })
}

export function useCreateToolTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await fetch(`${API_BASE}/tool-tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create tool tag")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tool-tags"] })
    },
  })
}

export function useDeleteToolTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`${API_BASE}/tool-tags/${encodeURIComponent(name)}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || error.message || "Failed to delete tool tag")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tool-tags"] })
    },
  })
}

// Test Sets
export function useTestSets() {
  return useQuery<string[]>({
    queryKey: ["test-sets"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/test-sets`)
      if (!res.ok) throw new Error("Failed to fetch test sets")
      return res.json()
    },
  })
}

export function useCreateTestSet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await fetch(`${API_BASE}/test-sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create test set")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-sets"] })
    },
  })
}

export function useDeleteTestSet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`${API_BASE}/test-sets/${encodeURIComponent(name)}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || error.message || "Failed to delete test set")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-sets"] })
    },
  })
}

