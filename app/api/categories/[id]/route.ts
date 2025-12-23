import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { categorySchema } from "@/lib/validations"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    const category = await prisma.category.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        subCategories: true,
      },
    })

    return NextResponse.json(category)
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      )
    }
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if category is in use
    const testCount = await prisma.test.count({
      where: { categoryId: params.id },
    })

    if (testCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category that is in use",
          testCount,
          message: `This category is used by ${testCount} test(s). Please reassign or delete those tests first.`,
        },
        { status: 409 }
      )
    }

    await prisma.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}

