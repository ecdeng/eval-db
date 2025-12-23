import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { testUpdateSchema } from "@/lib/validations"

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        category: true,
        subCategory: true,
      },
    })

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error("Error fetching test:", error)
    return NextResponse.json(
      { error: "Failed to fetch test" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = testUpdateSchema.parse(body)

    const test = await prisma.test.update({
      where: { id },
      data: validatedData,
      include: {
        category: true,
        subCategory: true,
      },
    })

    return NextResponse.json(test)
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating test:", error)
    return NextResponse.json(
      { error: "Failed to update test" },
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
    await prisma.test.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }
    console.error("Error deleting test:", error)
    return NextResponse.json(
      { error: "Failed to delete test" },
      { status: 500 }
    )
  }
}

