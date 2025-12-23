import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { testSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, testIds, tags, testSets } = body

    if (action === "bulk-edit-tags") {
      if (!testIds || !Array.isArray(testIds) || testIds.length === 0) {
        return NextResponse.json(
          { error: "testIds array is required" },
          { status: 400 }
        )
      }

      const updates: any = {}
      if (tags && Array.isArray(tags) && tags.length > 0) {
        // Append tags to existing toolTags
        await prisma.$transaction(
          testIds.map((id: string) =>
            prisma.test.update({
              where: { id },
              data: {
                toolTags: {
                  push: tags,
                },
              },
            })
          )
        )
      }

      if (testSets && Array.isArray(testSets) && testSets.length > 0) {
        // Append testSets to existing testSets
        await prisma.$transaction(
          testIds.map((id: string) =>
            prisma.test.update({
              where: { id },
              data: {
                testSets: {
                  push: testSets,
                },
              },
            })
          )
        )
      }

      return NextResponse.json({ success: true })
    }

    if (action === "bulk-import") {
      const { tests } = body
      if (!tests || !Array.isArray(tests)) {
        return NextResponse.json(
          { error: "tests array is required" },
          { status: 400 }
        )
      }

      // Get default category and subcategory for tests that don't have them
      // First, try to find a category that has sub-categories
      const defaultCategory = await prisma.category.findFirst({
        where: {
          subCategories: {
            some: {},
          },
        },
        include: {
          subCategories: {
            take: 1,
          },
        },
      })

      // If no category with sub-categories, get any category and create a default sub-category
      let categoryToUse = defaultCategory
      let subCategoryToUse = defaultCategory?.subCategories[0]

      if (!categoryToUse) {
        // Get any category
        categoryToUse = await prisma.category.findFirst()
        if (!categoryToUse) {
          return NextResponse.json(
            { error: "No categories found. Please create at least one category first." },
            { status: 400 }
          )
        }
      }

      if (!subCategoryToUse) {
        // Create a default sub-category for the category
        subCategoryToUse = await prisma.subCategory.create({
          data: {
            name: "Default",
            categoryId: categoryToUse.id,
          },
        })
      }

      // For bulk import, only prompt is required - all other fields are optional
      const results = await prisma.$transaction(
        tests.map((test: any) => {
          // Only validate that prompt exists
          if (!test.prompt || test.prompt.trim() === "") {
            throw new Error("Prompt is required for all tests")
          }

          // Use provided values or defaults
          const categoryId = test.categoryId || test.category_id || categoryToUse.id
          const subCategoryId = test.subCategoryId || test.sub_category_id || subCategoryToUse.id
          
          const data: any = {
            prompt: test.prompt.trim(),
            initialUrl: (test.initialUrl || test.initial_url || "").trim(),
            golden: (test.golden || "").trim(),
            difficulty: (test.difficulty || "simple").toLowerCase(),
            categoryId: categoryId,
            subCategoryId: subCategoryId,
            toolTags: test.toolTags || test.tool_tags || [],
            testSets: test.testSets || test.test_sets || [],
          }

          // If ID is provided and valid, use upsert; otherwise create new
          if (test.id && test.id.trim() !== "") {
            return prisma.test.upsert({
              where: { id: test.id },
              update: data,
              create: data,
            })
          } else {
            return prisma.test.create({
              data: data,
            })
          }
        })
      )

      return NextResponse.json({ success: true, count: results.length })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("Error in bulk operation:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    
    // Return more detailed error message
    const errorMessage = error.message || "Failed to process bulk operation"
    return NextResponse.json(
      { error: errorMessage, details: error.stack },
      { status: 500 }
    )
  }
}

