import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { categorySchema } from "@/lib/validations"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: true,
        _count: {
          select: { tests: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
      },
      include: {
        subCategories: true,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
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
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}

