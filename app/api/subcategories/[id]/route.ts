import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const subCategoryUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  categoryId: z.string().min(1, "Category is required").optional(),
})

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = subCategoryUpdateSchema.parse(body)

    const subCategory = await prisma.subCategory.update({
      where: { id },
      data: validatedData,
      include: {
        category: true,
      },
    })

    return NextResponse.json(subCategory)
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Sub-category not found" },
        { status: 404 }
      )
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Sub-category with this name already exists in this category" },
        { status: 409 }
      )
    }
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating subcategory:", error)
    return NextResponse.json(
      { error: "Failed to update subcategory" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if subcategory is in use
    const testCount = await prisma.test.count({
      where: { subCategoryId: id },
    })

    if (testCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete sub-category that is in use",
          testCount,
          message: `This sub-category is used by ${testCount} test(s). Please reassign or delete those tests first.`,
        },
        { status: 409 }
      )
    }

    await prisma.subCategory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Sub-category not found" },
        { status: 404 }
      )
    }
    console.error("Error deleting subcategory:", error)
    return NextResponse.json(
      { error: "Failed to delete subcategory" },
      { status: 500 }
    )
  }
}

