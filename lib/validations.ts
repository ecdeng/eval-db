import { z } from "zod"

export const testSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  initialUrl: z.string().url("Invalid URL format"),
  golden: z.string().min(1, "Golden answer is required"),
  difficulty: z.enum(["simple", "complex"]),
  categoryId: z.string().min(1, "Category is required"),
  subCategoryId: z.string().min(1, "Sub-category is required"),
  toolTags: z.array(z.string()).default([]),
  testSets: z.array(z.string()).default([]),
})

export const testUpdateSchema = testSchema.partial()

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
})

export const subCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().min(1, "Category is required"),
})

