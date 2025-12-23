import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { subCategorySchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get("categoryId")

    const where: any = {}
    if (categoryId) {
      where.categoryId = categoryId
    }

    const subCategories = await prisma.subCategory.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: { tests: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(subCategories)
  } catch (error) {
    console.error("Error fetching subcategories:", error)
    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = subCategorySchema.parse(body)

    const subCategory = await prisma.subCategory.create({
      data: {
        name: validatedData.name,
        categoryId: validatedData.categoryId,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(subCategory, { status: 201 })
  } catch (error: any) {
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
    console.error("Error creating subcategory:", error)
    return NextResponse.json(
      { error: "Failed to create subcategory" },
      { status: 500 }
    )
  }
}

