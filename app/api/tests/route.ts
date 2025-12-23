import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { testSchema } from "@/lib/validations"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const categoryId = searchParams.get("categoryId")
    const subCategoryId = searchParams.get("subCategoryId")
    const difficulty = searchParams.get("difficulty")
    const toolTags = searchParams.getAll("toolTags")
    const testSets = searchParams.getAll("testSets")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { prompt: { contains: search, mode: "insensitive" } },
        { golden: { contains: search, mode: "insensitive" } },
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (subCategoryId) {
      where.subCategoryId = subCategoryId
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (toolTags.length > 0) {
      where.toolTags = {
        hasSome: toolTags,
      }
    }

    if (testSets.length > 0) {
      where.testSets = {
        hasSome: testSets,
      }
    }

    const [tests, total] = await Promise.all([
      prisma.test.findMany({
        where,
        include: {
          category: true,
          subCategory: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.test.count({ where }),
    ])

    return NextResponse.json({
      tests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching tests:", error)
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = testSchema.parse(body)

    const test = await prisma.test.create({
      data: {
        prompt: validatedData.prompt,
        initialUrl: validatedData.initialUrl,
        golden: validatedData.golden,
        difficulty: validatedData.difficulty,
        categoryId: validatedData.categoryId,
        subCategoryId: validatedData.subCategoryId,
        toolTags: validatedData.toolTags,
        testSets: validatedData.testSets,
      },
      include: {
        category: true,
        subCategory: true,
      },
    })

    return NextResponse.json(test, { status: 201 })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating test:", error)
    return NextResponse.json(
      { error: "Failed to create test" },
      { status: 500 }
    )
  }
}

